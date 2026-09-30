/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DaySchedule {
  isOpen: boolean;
  openTime: string; // '10:00'
  closeTime: string; // '19:00' or '20:00'
}

export type BusinessHours = Record<DayOfWeek, DaySchedule>;

export interface Business {
  id: string;
  name: string;
  location: string;
  sanctuaryAddress: string;
  description: string;
  ownerName: string;
  ownerTitle: string;
  phone: string;
  whatsapp: string;
  rating: number;
  reviewCount: number;
  bookingBufferMinutes: number; // 15
  sameDayBooking: boolean; // true
  currency: string;
  hours: BusinessHours;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  priceNGN: number;
  priceUSD: number;
  active: boolean;
  badge?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';

export type ReminderStatus = 'scheduled' | 'sent' | 'cancelled';

export interface Appointment {
  id: string;
  bookingReference: string; // e.g. "MN-8492" or "MN-7F42Q"
  customerName: string;
  phone: string;
  email?: string;
  notes?: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  priceNGN: number;
  priceUSD: number;
  date: string; // 'YYYY-MM-DD'
  dateFormatted: string; // 'Saturday, September 26'
  startTime: string; // '16:45'
  startTimeDisplay: string; // '4:45 PM'
  endTime: string; // '19:15'
  endTimeDisplay: string; // '7:15 PM'
  status: AppointmentStatus;
  paymentStatus: 'paid_transfer' | 'cash_arrival' | 'transfer_arrival' | 'unpaid';
  whatsappSent: boolean;
  confirmationSent: boolean;
  remindersScheduled: boolean;
  reminderStatus: ReminderStatus;
  reminder24hText?: string;
  reminderSentAt?: string;
  rescheduledFrom?: {
    date: string;
    dateFormatted: string;
    startTimeDisplay: string;
    endTimeDisplay: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vipStatus?: 'VIP Regular' | 'Atelier Member' | 'New Guest' | 'Bridal Inquiry';
  notes?: string;
  appointmentsCount: number;
}

export interface Inquiry {
  id: string;
  customerName: string;
  customerPhone: string;
  avatarText: string;
  vipTag?: string;
  channel: 'WhatsApp' | 'SMS' | 'Instagram DM';
  inboundMessage: string;
  intelligenceAction: string;
  resolutionTime: string; // '1m 14s resolution'
  category: 'confirmed' | 'rescheduled' | 'attention' | 'cancelled';
  status: 'auto-confirmed' | 'auto-rescheduled' | 'owner-review' | 'cancelled';
  bookingReference?: string;
  scheduleSummary?: string;
  originalSchedule?: string;
  flagReason?: string;
  proposedProposal?: string;
  timestamp: string;
}

export type AutomationEventType =
  | 'confirmation'
  | 'reminder'
  | 'reschedule'
  | 'followup'
  | 'cancellation'
  | 'conversation';

export interface AutomationEvent {
  id: string;
  type: AutomationEventType;
  appointmentId?: string;
  bookingReference?: string;
  customerName: string;
  serviceName: string;
  status: 'sent' | 'scheduled' | 'cancelled';
  channel: 'WhatsApp' | 'SMS' | 'Instagram DM';
  detail: string;
  created_at: string;
  minutesSaved: number;
}

export interface EffortBreakdown {
  totalMinutes: number;
  totalHoursDisplay: string; // e.g. "2h 35m"
  bookingConversationsMinutes: number;
  bookingConversationsCount: number;
  reschedulingMinutes: number;
  reschedulingCount: number;
  confirmationsMinutes: number;
  confirmationsCount: number;
  remindersMinutes: number;
  remindersCount: number;
  followupsMinutes: number;
  followupsCount: number;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  metricCount: number;
  metricLabel: string;
  latencyText: string;
  icon: string;
}

export interface AutomationLog {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  type: 'reschedule' | 'dispatch' | 'reminder' | 'booking';
}

export interface TimeSlot {
  startTime: string; // '14:30'
  startTimeDisplay: string; // '2:30 PM'
  endTime: string; // '17:00'
  endTimeDisplay: string; // '5:00 PM'
  duration: number; // minutes
  isAvailable: boolean;
  reason?: string;
  badge?: string; // '✨ Recommended by Mae' or '1 slot open' or 'Twilight Session'
}

export interface NLParseResult {
  rawPrompt: string;
  isServiceIdentified: boolean;
  isDateIdentified: boolean;
  isTimeIdentified: boolean;
  missingPrompt?: string; // e.g. "what would you like to book?" or "what day would you like to come in?"
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePriceNGN: number;
  servicePriceUSD: number;
  targetDate: string; // 'YYYY-MM-DD'
  targetDateFormatted: string; // 'Saturday, September 26'
  dateLabel: string; // 'Prime Weekend Atelier Day'
  preferenceWindow: string; // 'After 2:00 PM' or 'Flexible (Any time)'
  preferenceTag: string; // 'Late afternoon studio session'
  timePreferenceType: 'after' | 'around' | 'window' | 'flexible';
  targetMinutes?: number;
  minMinutes?: number;
  maxMinutes?: number;
  estimatedRitualDisplay: string; // '2 hours 30 minutes'
  clarification?: string;
}
