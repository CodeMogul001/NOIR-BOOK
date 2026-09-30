/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Business, TimeSlot, DayOfWeek, Appointment } from '../types';
import { store } from './store';

// Helper to convert 'HH:mm' to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

// Helper to convert minutes to 'HH:mm'
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Helper to format minutes into 12-hour 'h:mm A'
export function minutesToDisplay(mins: number): string {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const mStr = String(m).padStart(2, '0');
  return `${h}:${mStr} ${ampm}`;
}

// Get day of week string from date string 'YYYY-MM-DD'
export function getDayOfWeekFromDate(dateStr: string): DayOfWeek {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[d.getDay()];
}

export interface AvailabilityEngineInput {
  serviceDuration: number; // in minutes
  requestedDate: string; // 'YYYY-MM-DD'
  preferenceWindow?: string; // 'After 2:00 PM', 'Morning', etc.
  timePreferenceType?: 'after' | 'around' | 'window' | 'flexible';
  minMinutes?: number;
  maxMinutes?: number;
  targetMinutes?: number;
  excludeAppointmentId?: string; // For rescheduling
  candidateInterval?: number; // Minutes between candidate slots, default 15
}

export interface AvailabilityResult {
  date: string;
  isOpen: boolean;
  businessHoursText: string;
  slots: TimeSlot[];
  message?: string;
}

export function calculateAvailableSlots(input: AvailabilityEngineInput): AvailabilityResult {
  const {
    serviceDuration,
    requestedDate,
    preferenceWindow = '',
    excludeAppointmentId,
    candidateInterval = 15,
  } = input;

  const business = store.getBusiness();
  const dayOfWeek = getDayOfWeekFromDate(requestedDate);
  const daySchedule = business.hours[dayOfWeek];

  // 1. Check if business is open
  if (!daySchedule || !daySchedule.isOpen) {
    return {
      date: requestedDate,
      isOpen: false,
      businessHoursText: 'Closed',
      slots: [],
      message: 'Mae Noir Studio is closed on Sundays for quiet atelier restoration. We warmly invite you to select Monday through Saturday.',
    };
  }

  const openMinutes = timeToMinutes(daySchedule.openTime);
  const closeMinutes = timeToMinutes(daySchedule.closeTime);
  const buffer = business.bookingBufferMinutes; // 15 mins

  // 2. Retrieve existing appointments for that date (excluding cancelled & self if rescheduling)
  const allAppointments = store.getAppointments();
  const activeAppointments = allAppointments.filter(
    (apt) =>
      apt.date === requestedDate &&
      apt.status !== 'cancelled' &&
      apt.id !== excludeAppointmentId
  );

  // Map to occupied ranges [start, end + buffer]
  const occupiedPeriods = activeAppointments.map((apt) => {
    const start = timeToMinutes(apt.startTime);
    const end = timeToMinutes(apt.endTime);
    return {
      start,
      endWithBuffer: end + buffer,
      customerName: apt.customerName,
      serviceName: apt.serviceName,
    };
  });

  // 3. Determine preference bounds
  let preferredMinMinutes = input.minMinutes ?? openMinutes;
  let preferredMaxMinutes = input.maxMinutes ?? closeMinutes;

  if (input.minMinutes === undefined && preferenceWindow) {
    const prefLower = preferenceWindow.toLowerCase();
    if (prefLower.includes('after 6') || prefLower.includes('6pm')) {
      preferredMinMinutes = 18 * 60;
    } else if (prefLower.includes('after 5') || prefLower.includes('5pm')) {
      preferredMinMinutes = 17 * 60;
    } else if (prefLower.includes('after 4') || prefLower.includes('4pm')) {
      preferredMinMinutes = 16 * 60;
    } else if (prefLower.includes('after 2') || prefLower.includes('2pm') || prefLower.includes('afternoon')) {
      preferredMinMinutes = 14 * 60;
    } else if (prefLower.includes('around 4') || prefLower.includes('4:00')) {
      preferredMinMinutes = 15 * 60;
      preferredMaxMinutes = 17 * 60 + 30;
    } else if (prefLower.includes('around 3') || prefLower.includes('3pm')) {
      preferredMinMinutes = 14 * 60;
      preferredMaxMinutes = 16 * 60 + 30;
    } else if (prefLower.includes('morning') || prefLower.includes('10am') || prefLower.includes('11am')) {
      preferredMinMinutes = openMinutes;
      preferredMaxMinutes = 13 * 60;
    }
  }

  // 4. Candidate slot generation
  const allValidSlots: TimeSlot[] = [];

  // Generate candidate slots within operating hours
  for (
    let startMin = openMinutes;
    startMin + serviceDuration <= closeMinutes;
    startMin += candidateInterval
  ) {
    const endMin = startMin + serviceDuration;

    // Check collision against all occupied periods
    let isBlocked = false;
    let conflictReason = '';

    for (const occ of occupiedPeriods) {
      if (startMin < occ.endWithBuffer && endMin + buffer > occ.start) {
        isBlocked = true;
        conflictReason = `Occupied by studio session (${occ.serviceName})`;
        break;
      }
    }

    if (!isBlocked) {
      allValidSlots.push({
        startTime: minutesToTime(startMin),
        startTimeDisplay: minutesToDisplay(startMin),
        endTime: minutesToTime(endMin),
        endTimeDisplay: minutesToDisplay(endMin),
        duration: serviceDuration,
        isAvailable: true,
      });
    }
  }

  // 5. Filter/sort slots according to customer's preference window
  let filteredSlots = allValidSlots.filter((slot) => {
    const startM = timeToMinutes(slot.startTime);
    return startM >= preferredMinMinutes && startM <= preferredMaxMinutes;
  });

  // If "around" was specified, sort candidates by closeness to targetMinutes
  if (input.targetMinutes) {
    const target = input.targetMinutes;
    filteredSlots.sort((a, b) => {
      const distA = Math.abs(timeToMinutes(a.startTime) - target);
      const distB = Math.abs(timeToMinutes(b.startTime) - target);
      return distA - distB;
    });
  }

  // If filtered is empty, fall back to all valid slots
  const selectedSlots = filteredSlots.length > 0 ? filteredSlots : allValidSlots;

  // Curate 3-4 distinct, well-spaced luxury slots (e.g. 2:30 PM, 4:45 PM, 6:30 PM)
  const curatedSlots: TimeSlot[] = [];
  const minSpacing = Math.min(serviceDuration, 60);

  let lastAddedMin = -999;
  for (const slot of selectedSlots) {
    const currentMin = timeToMinutes(slot.startTime);
    if (Math.abs(currentMin - lastAddedMin) >= minSpacing || curatedSlots.length === 0) {
      curatedSlots.push(slot);
      lastAddedMin = currentMin;
    }
    if (curatedSlots.length >= 4) break;
  }

  // Sort curated slots chronologically for natural display
  curatedSlots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  // Decorate slots with thoughtful atelier badges
  curatedSlots.forEach((slot, idx) => {
    if (idx === 0) {
      slot.badge = '1 slot open';
    } else if (idx === 1) {
      slot.badge = '✨ Recommended by Mae';
    } else {
      const min = timeToMinutes(slot.startTime);
      if (min >= 18 * 60) {
        slot.badge = 'Twilight Session';
      } else {
        slot.badge = 'Sanctuary Prime';
      }
    }
  });

  return {
    date: requestedDate,
    isOpen: true,
    businessHoursText: `${minutesToDisplay(openMinutes)} – ${minutesToDisplay(closeMinutes)}`,
    slots: curatedSlots,
    message:
      curatedSlots.length === 0
        ? 'No open slots found for this duration on this date. Please select another day.'
        : undefined,
  };
}
