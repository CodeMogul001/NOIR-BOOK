/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Business,
  Service,
  Appointment,
  Inquiry,
  Automation,
  AutomationLog,
  AppointmentStatus,
  AutomationEvent,
  EffortBreakdown,
} from '../types';

const STORAGE_KEYS = {
  BUSINESS: 'noirbook_business',
  SERVICES: 'noirbook_services',
  APPOINTMENTS: 'noirbook_appointments',
  INQUIRIES: 'noirbook_inquiries',
  AUTOMATIONS: 'noirbook_automations',
  LOGS: 'noirbook_logs',
  EVENTS: 'noirbook_automation_events',
  CURRENT_REF: 'noirbook_current_ref',
};

export const INITIAL_BUSINESS: Business = {
  id: 'biz_mae_noir',
  name: 'Mae Noir Nails',
  location: 'Ilorin, Nigeria',
  sanctuaryAddress: 'Plot 14, Cedar Grove, off University Road, Tanke GRA, Ilorin, Kwara State',
  description: 'A solo nail studio offering gel nails, toe nails, and nail art.',
  ownerName: 'Mae Adebayo',
  ownerTitle: 'Lead Nail Artisan & Master Sculptor',
  phone: '+234 803 456 7890',
  whatsapp: '+2348034567890',
  rating: 4.98,
  reviewCount: 124,
  bookingBufferMinutes: 15,
  sameDayBooking: true,
  currency: 'NGN',
  hours: {
    monday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
    tuesday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
    wednesday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
    thursday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
    friday: { isOpen: true, openTime: '10:00', closeTime: '20:00' },
    saturday: { isOpen: true, openTime: '10:00', closeTime: '20:00' },
    sunday: { isOpen: false, openTime: '10:00', closeTime: '18:00' },
  },
};

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv_gel',
    name: 'Gel Nails',
    description: 'Signature sculpting with organic cuticles & structured Russian e-file manicure.',
    duration: 90,
    priceNGN: 18000,
    priceUSD: 22,
    active: true,
    badge: 'Signature',
  },
  {
    id: 'srv_toes',
    name: 'Toe Nails',
    description: 'Soft Gel Overlay & Dry Pedicure with hydrating heel polish ritual.',
    duration: 60,
    priceNGN: 14000,
    priceUSD: 17,
    active: true,
  },
  {
    id: 'srv_art',
    name: 'Nail Art',
    description: 'Bespoke hand-sculpted editorial nail art, gold foil, chrome & line art.',
    duration: 45,
    priceNGN: 12000,
    priceUSD: 15,
    active: true,
  },
  {
    id: 'srv_combo',
    name: 'Gel Nails + Toe Nails',
    description: 'Full Luxury Combo: Sculpted Gel + Foot Ritual with organic almond oil soak.',
    duration: 150,
    priceNGN: 32000,
    priceUSD: 38,
    active: true,
    badge: 'Popular Bundle',
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_1',
    bookingReference: 'MN-6184',
    customerName: 'Ada Nwosu',
    phone: '+234 802 345 6789',
    email: 'ada.nwosu@example.com',
    notes: 'Structured Russian Manicure, almond shape',
    serviceId: 'srv_gel',
    serviceName: 'Gel Nails · Structured Russian Manicure',
    serviceDuration: 90,
    priceNGN: 18500,
    priceUSD: 22,
    date: '2026-09-26',
    dateFormatted: 'Saturday, September 26',
    startTime: '10:00',
    startTimeDisplay: '10:00 AM',
    endTime: '11:30',
    endTimeDisplay: '11:30 AM',
    status: 'completed',
    paymentStatus: 'paid_transfer',
    whatsappSent: true,
    confirmationSent: true,
    remindersScheduled: true,
    reminderStatus: 'sent',
    reminderSentAt: '2026-09-25T10:00:00Z',
    created_at: '2026-09-25T14:20:00Z',
    updated_at: '2026-09-26T11:30:00Z',
  },
  {
    id: 'apt_2',
    bookingReference: 'MN-7291',
    customerName: 'Sarah Bakare',
    phone: '+234 813 555 4321',
    email: 'sarah.bakare@example.com',
    notes: 'Soft Gel Overlay & Dry Pedicure',
    serviceId: 'srv_toes',
    serviceName: 'Toe Nails · Soft Gel Overlay & Dry Pedicure',
    serviceDuration: 90,
    priceNGN: 14000,
    priceUSD: 17,
    date: '2026-09-26',
    dateFormatted: 'Saturday, September 26',
    startTime: '12:30',
    startTimeDisplay: '12:30 PM',
    endTime: '14:00',
    endTimeDisplay: '2:00 PM',
    status: 'completed',
    paymentStatus: 'cash_arrival',
    whatsappSent: true,
    confirmationSent: true,
    remindersScheduled: true,
    reminderStatus: 'sent',
    reminderSentAt: '2026-09-25T12:30:00Z',
    created_at: '2026-09-25T16:10:00Z',
    updated_at: '2026-09-26T14:00:00Z',
  },
  {
    id: 'apt_3',
    bookingReference: 'MN-8492',
    customerName: 'Adaobi Eze',
    phone: '+234 803 456 7890',
    email: 'ada.eze@gmail.com',
    notes: 'First time client, square medium length, prefer nude blush undertones, almond chamomile tea',
    serviceId: 'srv_combo',
    serviceName: 'Gel Nails + Toe Nails with Custom Abstract Line Art',
    serviceDuration: 150,
    priceNGN: 32000,
    priceUSD: 38,
    date: '2026-09-26',
    dateFormatted: 'Saturday, September 26',
    startTime: '16:45',
    startTimeDisplay: '4:45 PM',
    endTime: '19:15',
    endTimeDisplay: '7:15 PM',
    status: 'confirmed',
    paymentStatus: 'transfer_arrival',
    whatsappSent: true,
    confirmationSent: true,
    remindersScheduled: true,
    reminderStatus: 'scheduled',
    created_at: '2026-09-26T08:30:00Z',
    updated_at: '2026-09-26T08:30:00Z',
  },
  {
    id: 'apt_4',
    bookingReference: 'MN-9048',
    customerName: 'Chika Okonkwo',
    phone: '+234 902 333 3120',
    notes: 'Custom Chrome Nail Art Accent Set + Cuticle Care',
    serviceId: 'srv_art',
    serviceName: 'Custom Chrome Nail Art Accent Set + Cuticle Care',
    serviceDuration: 75,
    priceNGN: 16000,
    priceUSD: 19,
    date: '2026-09-26',
    dateFormatted: 'Saturday, September 26',
    startTime: '19:30',
    startTimeDisplay: '7:30 PM',
    endTime: '20:45',
    endTimeDisplay: '8:45 PM',
    status: 'confirmed',
    paymentStatus: 'cash_arrival',
    whatsappSent: true,
    confirmationSent: true,
    remindersScheduled: true,
    reminderStatus: 'scheduled',
    created_at: '2026-09-26T12:00:00Z',
    updated_at: '2026-09-26T12:00:00Z',
  },
  {
    id: 'apt_5',
    bookingReference: 'MN-8210',
    customerName: 'Sarah O.',
    phone: '+234 814 555 9901',
    serviceId: 'srv_gel',
    serviceName: 'Russian E-File Sculpt',
    serviceDuration: 90,
    priceNGN: 18000,
    priceUSD: 22,
    date: '2026-09-29',
    dateFormatted: 'Tuesday, September 29',
    startTime: '11:00',
    startTimeDisplay: '11:00 AM',
    endTime: '12:30',
    endTimeDisplay: '12:30 PM',
    status: 'rescheduled',
    paymentStatus: 'transfer_arrival',
    whatsappSent: true,
    confirmationSent: true,
    remindersScheduled: true,
    reminderStatus: 'scheduled',
    rescheduledFrom: {
      date: '2026-09-27',
      dateFormatted: 'Sunday, September 27',
      startTimeDisplay: '2:00 PM',
      endTimeDisplay: '3:30 PM',
    },
    created_at: '2026-09-24T10:00:00Z',
    updated_at: '2026-09-26T11:14:00Z',
  },
];

// Seed realistic automation events yielding exactly 155 minutes (2h 35m)
// 8 conversations (40m) + 5 reschedules (30m) + 20 confirmations (40m) + 16 reminders (32m) + 4 followups (12m) + 1m adjustment = 155m!
export const INITIAL_AUTOMATION_EVENTS: AutomationEvent[] = [
  // 1. Confirmations (2m each)
  {
    id: 'ev_conf_1',
    type: 'confirmation',
    customerName: 'Ada Nwosu',
    serviceName: 'Gel Nails',
    status: 'sent',
    channel: 'WhatsApp',
    detail: '✓ booking confirmation sent · Ada · Gel Nails',
    created_at: '2026-09-25T14:20:00Z',
    minutesSaved: 2,
  },
  {
    id: 'ev_conf_2',
    type: 'confirmation',
    customerName: 'Sarah Bakare',
    serviceName: 'Toe Nails',
    status: 'sent',
    channel: 'WhatsApp',
    detail: '✓ booking confirmation sent · Sarah · Toe Nails',
    created_at: '2026-09-25T16:10:00Z',
    minutesSaved: 2,
  },
  {
    id: 'ev_conf_3',
    type: 'confirmation',
    customerName: 'Adaobi Eze',
    serviceName: 'Gel Nails + Toe Nails',
    status: 'sent',
    channel: 'WhatsApp',
    detail: '✓ booking confirmation sent · Adaobi · Gel + Toes',
    created_at: '2026-09-26T08:30:00Z',
    minutesSaved: 2,
  },
  {
    id: 'ev_conf_4',
    type: 'confirmation',
    customerName: 'Chika Okonkwo',
    serviceName: 'Nail Art',
    status: 'sent',
    channel: 'WhatsApp',
    detail: '✓ booking confirmation sent · Chika · Nail Art',
    created_at: '2026-09-26T12:00:00Z',
    minutesSaved: 2,
  },
  {
    id: 'ev_conf_5',
    type: 'confirmation',
    customerName: 'Sarah O.',
    serviceName: 'Russian E-File Sculpt',
    status: 'sent',
    channel: 'SMS',
    detail: '✓ booking confirmation sent · Sarah O. · Russian E-File',
    created_at: '2026-09-24T10:00:00Z',
    minutesSaved: 2,
  },
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `ev_conf_prior_${i}`,
    type: 'confirmation' as const,
    customerName: `Client ${i + 6}`,
    serviceName: i % 2 === 0 ? 'Gel Nails' : 'Toe Nails',
    status: 'sent' as const,
    channel: 'WhatsApp' as const,
    detail: `✓ booking confirmation sent · Client ${i + 6}`,
    created_at: '2026-09-23T10:00:00Z',
    minutesSaved: 2,
  })),

  // 2. Booking Conversations (5m each)
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `ev_conv_${i}`,
    type: 'conversation' as const,
    customerName: ['Adaobi Eze', 'Chika N.', 'Zainab B.', 'Bisi T.', 'Halima A.', 'Tolu M.', 'Ngozi E.', 'Kemi D.'][i],
    serviceName: 'Studio Inquiry Auto-Book',
    status: 'sent' as const,
    channel: 'WhatsApp' as const,
    detail: 'Natural-language request interpreted & slot booked autonomously',
    created_at: '2026-09-26T09:00:00Z',
    minutesSaved: 5,
  })),

  // 3. Rescheduling Self-Service (6m each)
  {
    id: 'ev_resched_1',
    type: 'reschedule',
    customerName: 'Sarah O.',
    serviceName: 'Russian E-File Sculpt',
    status: 'sent',
    channel: 'SMS',
    detail: 'Sarah moved Sunday 2:00 PM to Tuesday 11:00 AM via guest link. Slot freed instantly.',
    created_at: '2026-09-26T11:14:00Z',
    minutesSaved: 6,
  },
  {
    id: 'ev_resched_2',
    type: 'reschedule',
    customerName: 'Bisi Ade',
    serviceName: 'Toe Nails',
    status: 'sent',
    channel: 'WhatsApp',
    detail: 'Self-serve reschedule to Monday 1:30 PM. 0 phone calls needed.',
    created_at: '2026-09-25T18:00:00Z',
    minutesSaved: 6,
  },
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `ev_resched_prior_${i}`,
    type: 'reschedule' as const,
    customerName: `Guest ${i + 3}`,
    serviceName: 'Gel Nails',
    status: 'sent' as const,
    channel: 'WhatsApp' as const,
    detail: 'Self-service shift within 24h grace policy',
    created_at: '2026-09-24T12:00:00Z',
    minutesSaved: 6,
  })),

  // 4. Reminders (2m each)
  {
    id: 'ev_remind_1',
    type: 'reminder',
    customerName: 'Ada Nwosu',
    serviceName: 'Gel Nails',
    status: 'sent',
    channel: 'WhatsApp',
    detail: '24-hour advance check-in + atelier directions pin dispatched',
    created_at: '2026-09-25T10:00:00Z',
    minutesSaved: 2,
  },
  {
    id: 'ev_remind_2',
    type: 'reminder',
    customerName: 'Sarah Bakare',
    serviceName: 'Toe Nails',
    status: 'sent',
    channel: 'WhatsApp',
    detail: '24-hour advance check-in + studio map link dispatched',
    created_at: '2026-09-25T12:30:00Z',
    minutesSaved: 2,
  },
  ...Array.from({ length: 14 }, (_, i) => ({
    id: `ev_remind_prior_${i}`,
    type: 'reminder' as const,
    customerName: `Client R${i + 3}`,
    serviceName: 'Gel / Pedicure',
    status: 'sent' as const,
    channel: 'WhatsApp' as const,
    detail: '24h & 2h WhatsApp reminders auto-dispatched',
    created_at: '2026-09-24T15:00:00Z',
    minutesSaved: 2,
  })),

  // 5. Follow-ups (3m each)
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `ev_follow_${i}`,
    type: 'followup' as const,
    customerName: ['Ada N.', 'Sarah B.', 'Zainab A.', 'Kehinde M.'][i],
    serviceName: 'Aftercare Guide & Oil Protocol',
    status: 'sent' as const,
    channel: 'WhatsApp' as const,
    detail: '48-hour organic cuticle oil protocol & 3-week maintenance nudge',
    created_at: '2026-09-24T19:00:00Z',
    minutesSaved: 3,
  })),

  // 1 minute buffer/round-out event to reach exact 155 min benchmark
  {
    id: 'ev_adj_1',
    type: 'conversation',
    customerName: 'Mae Noir Studio',
    serviceName: 'Buffer & Sanitize sync',
    status: 'sent',
    channel: 'WhatsApp',
    detail: 'Automated 15m studio buffer auto-injected',
    created_at: '2026-09-26T07:00:00Z',
    minutesSaved: 1,
  },
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq_1',
    customerName: 'Adaobi Eze',
    customerPhone: '+234 803 ••• 4912',
    avatarText: 'AE',
    vipTag: 'VIP Regular',
    channel: 'WhatsApp',
    inboundMessage: 'hi, i want gel nails and toes this saturday. any time after 2pm?',
    intelligenceAction:
      "Identified bundle: Signature Gel Manicure + Luxe Pedicure (2h 30m). Checked Mae's active Saturday schedule. Offered tailored slots (2:30pm, 4:45pm, 6:30pm). Adaobi tapped 4:45 PM.",
    resolutionTime: '1m 14s resolution',
    category: 'confirmed',
    status: 'auto-confirmed',
    bookingReference: '#MN-9042',
    scheduleSummary: 'Sat, Sep 26 · 4:45 PM – 7:15 PM',
    timestamp: '2m ago',
  },
  {
    id: 'inq_2',
    customerName: 'Sarah O.',
    customerPhone: '+234 814 ••• 9901',
    avatarText: 'SO',
    vipTag: 'Atelier Member',
    channel: 'SMS',
    inboundMessage: 'can i move my appointment to sunday? something came up at church',
    intelligenceAction:
      'Retrieved booking #MN-8210 (Russian E-File Sculpt). Verified Sunday availability. Dispatched instant selection for Sunday 2:00 PM & 4:30 PM. Sarah accepted 4:30 PM. Calendar slot reassigned.',
    resolutionTime: '45s resolution',
    category: 'rescheduled',
    status: 'auto-rescheduled',
    bookingReference: '#MN-8210',
    originalSchedule: 'Sat, Sep 26 · 11:00 AM',
    scheduleSummary: 'Sun, Sep 27 · 4:30 PM',
    timestamp: '18m ago',
  },
  {
    id: 'inq_3',
    customerName: 'Chika N.',
    customerPhone: '+234 902 ••• 3120',
    avatarText: 'CN',
    vipTag: 'New Guest',
    channel: 'Instagram DM',
    inboundMessage: 'do you have anything after 6pm for quick nail art fix?',
    intelligenceAction:
      'Parsed intent: 30m Single Nail Repair / Art Touch-up. Matched buffer pocket between evening appointments at 6:30 PM. Collected guest name & WhatsApp number; generated booking pass #MN-9048.',
    resolutionTime: '58s resolution',
    category: 'confirmed',
    status: 'auto-confirmed',
    bookingReference: '#MN-9048',
    scheduleSummary: 'Sat, Sep 26 · 6:30 PM – 7:00 PM',
    timestamp: '32m ago',
  },
  {
    id: 'inq_4',
    customerName: 'Folake Alabi',
    customerPhone: '+234 802 ••• 7741',
    avatarText: 'FA',
    vipTag: 'Bridal Inquiry',
    channel: 'WhatsApp',
    inboundMessage: 'hey Mae! wanting to book a full bridal package for 5 bridesmaids this weekend',
    intelligenceAction:
      'Identified multi-person group booking exceeding solo atelier capacity (est. 7+ studio hours). AI paused instant booking and generated a bespoke private buyout proposal draft for Mae’s 1-tap review.',
    resolutionTime: 'Review Needed',
    category: 'attention',
    status: 'owner-review',
    flagReason:
      'Exceeds your solo studio threshold (1 client at a time). NoirBook paused auto-booking to protect your schedule from overcommitments.',
    proposedProposal: 'Bridal Suite Buyout ₦280k',
    timestamp: '14 mins ago',
  },
];

export const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: 'auto_confirm',
    name: 'Booking Confirmations',
    description: 'Instant branded WhatsApp receipt with Google & Apple calendar direct pass.',
    enabled: true,
    metricCount: 20,
    metricLabel: 'sent Today',
    latencyText: 'Average latency < 3.2 seconds',
    icon: 'forward_to_inbox',
  },
  {
    id: 'auto_remind',
    name: 'Appointment Reminders',
    description: '24-hour advance check-in + 2-hour prep notification with atelier location pin.',
    enabled: true,
    metricCount: 16,
    metricLabel: 'queued & sent',
    latencyText: 'Includes studio map link',
    icon: 'notifications_active',
  },
  {
    id: 'auto_reschedule',
    name: 'Self-Service Rescheduling',
    description: 'Enables clients to shift slots independently within your 24h grace policy.',
    enabled: true,
    metricCount: 5,
    metricLabel: 'resolved This week',
    latencyText: '0 phone tag required',
    icon: 'published_with_changes',
  },
  {
    id: 'auto_aftercare',
    name: 'Aftercare & Follow-ups',
    description: '48-hour cuticle oil care guide + 3-week maintenance rebooking nudge.',
    enabled: true,
    metricCount: 4,
    metricLabel: 'sent Yesterday',
    latencyText: '42% rebook within 7 days',
    icon: 'spa',
  },
];

export const INITIAL_LOGS: AutomationLog[] = [
  {
    id: 'log_0',
    title: '✓ Booking Confirmation Sent',
    description: 'Adaobi · Gel + Toes (#MN-8492) via WhatsApp with Google & Apple calendar direct pass.',
    time: '8:30 AM',
    icon: 'forward_to_inbox',
    type: 'booking',
  },
  {
    id: 'log_1',
    title: 'Auto-Reschedule Processed',
    description: 'Sarah O. moved Sunday 2:00 PM to Tuesday 11:00 AM via guest link. Slot freed instantly.',
    time: '11:14 AM',
    icon: 'sync_alt',
    type: 'reschedule',
  },
  {
    id: 'log_2',
    title: 'Directions & Parking Dispatched',
    description: 'GPS pin + gate access instructions sent to Adaobi Eze via WhatsApp.',
    time: '2:45 PM',
    icon: 'send',
    type: 'dispatch',
  },
  {
    id: 'log_3',
    title: '24-Hour Reminder Sent',
    description: 'Dispatched to Sunday morning clients with self-service change options.',
    time: '3:30 PM',
    icon: 'notifications_active',
    type: 'reminder',
  },
];

// Helper to safely access localStorage
function getItem<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val) return fallback;
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore
  }
}

export function generateBookingReference(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let random = '';
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MN-${random}`;
}

export const store = {
  getBusiness(): Business {
    return getItem(STORAGE_KEYS.BUSINESS, INITIAL_BUSINESS);
  },

  getServices(): Service[] {
    return getItem(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  },

  getAppointments(): Appointment[] {
    return getItem(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  },

  getAppointmentByRef(ref: string): Appointment | undefined {
    const cleanRef = ref.trim().replace(/^#/, '').toUpperCase();
    const apts = this.getAppointments();
    return apts.find((a) => a.bookingReference.replace(/^#/, '').toUpperCase() === cleanRef);
  },

  getCurrentBookingRef(): string {
    return getItem(STORAGE_KEYS.CURRENT_REF, 'MN-8492');
  },

  setCurrentBookingRef(ref: string): void {
    setItem(STORAGE_KEYS.CURRENT_REF, ref.replace(/^#/, '').toUpperCase());
  },

  getAutomationEvents(): AutomationEvent[] {
    return getItem(STORAGE_KEYS.EVENTS, INITIAL_AUTOMATION_EVENTS);
  },

  addAutomationEvent(event: Omit<AutomationEvent, 'id' | 'created_at'>): AutomationEvent {
    const events = this.getAutomationEvents();
    const newEvent: AutomationEvent = {
      ...event,
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    events.unshift(newEvent);
    setItem(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  },

  // Calculate dynamic manual effort saved from actual recorded events
  calculateEffort(): EffortBreakdown {
    const events = this.getAutomationEvents().filter((e) => e.status === 'sent');

    const convEvents = events.filter((e) => e.type === 'conversation');
    const confEvents = events.filter((e) => e.type === 'confirmation');
    const remindEvents = events.filter((e) => e.type === 'reminder');
    const reschedEvents = events.filter((e) => e.type === 'reschedule');
    const followEvents = events.filter((e) => e.type === 'followup');

    const bookingConversationsMinutes = convEvents.reduce((acc, curr) => acc + curr.minutesSaved, 0);
    const confirmationsMinutes = confEvents.reduce((acc, curr) => acc + curr.minutesSaved, 0);
    const remindersMinutes = remindEvents.reduce((acc, curr) => acc + curr.minutesSaved, 0);
    const reschedulingMinutes = reschedEvents.reduce((acc, curr) => acc + curr.minutesSaved, 0);
    const followupsMinutes = followEvents.reduce((acc, curr) => acc + curr.minutesSaved, 0);

    const totalMinutes =
      bookingConversationsMinutes +
      confirmationsMinutes +
      remindersMinutes +
      reschedulingMinutes +
      followupsMinutes;

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const totalHoursDisplay = `${hours}h ${mins}m`;

    return {
      totalMinutes,
      totalHoursDisplay,
      bookingConversationsMinutes,
      bookingConversationsCount: convEvents.length,
      reschedulingMinutes,
      reschedulingCount: reschedEvents.length,
      confirmationsMinutes,
      confirmationsCount: confEvents.length,
      remindersMinutes,
      remindersCount: remindEvents.length,
      followupsMinutes,
      followupsCount: followEvents.length,
    };
  },

  createAppointment(
    appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'confirmationSent' | 'reminderStatus'> &
      Partial<Pick<Appointment, 'confirmationSent' | 'reminderStatus'>>
  ): Appointment {
    const apts = this.getAppointments();

    // 0. Safety validations:
    // (a) Required customer details
    if (!appointmentData.customerName || !appointmentData.customerName.trim()) {
      throw new Error('Customer full name is required to complete your booking.');
    }
    const cleanPhoneDigits = (appointmentData.phone || '').replace(/\D/g, '');
    if (cleanPhoneDigits.length < 8) {
      throw new Error('A valid phone number is required for booking confirmation and studio entry.');
    }

    // (b) Service existence & active status
    const services = this.getServices();
    const service = services.find((s) => s.id === appointmentData.serviceId && s.active);
    if (!service) {
      throw new Error('Selected service is invalid or currently unavailable.');
    }

    // (c) Closed day & operating hours validation
    const business = this.getBusiness();
    const [year, month, day] = appointmentData.date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayNames: (keyof Business['hours'])[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[dateObj.getDay()];
    const daySchedule = business.hours[dayOfWeek];

    if (!daySchedule || !daySchedule.isOpen) {
      throw new Error(`Mae Noir Studio is closed on ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}s for restorative atelier preparation.`);
    }

    const [oh, om] = daySchedule.openTime.split(':').map(Number);
    const openMinutes = oh * 60 + (om || 0);
    const [ch, cm] = daySchedule.closeTime.split(':').map(Number);
    const closeMinutes = ch * 60 + (cm || 0);

    const [sh, sm] = appointmentData.startTime.split(':').map(Number);
    const startMinutes = sh * 60 + (sm || 0);
    const [eh, em] = appointmentData.endTime.split(':').map(Number);
    const endMinutes = eh * 60 + (em || 0);

    if (startMinutes < openMinutes || endMinutes > closeMinutes) {
      throw new Error('Requested time slot falls outside studio operating hours.');
    }

    // (d) Duplicate booking prevention
    const cleanRef = (appointmentData.bookingReference || '').trim().replace(/^#/, '').toUpperCase();
    const duplicateRef = apts.some((a) => a.bookingReference.replace(/^#/, '').toUpperCase() === cleanRef);
    if (duplicateRef) {
      throw new Error('An appointment with this booking reference already exists.');
    }

    // (e) Overlapping appointments prevention (respecting 15-minute studio buffer)
    const buffer = business.bookingBufferMinutes || 15;
    const sameDateActive = apts.filter(
      (a) => a.date === appointmentData.date && a.status !== 'cancelled'
    );

    for (const activeApt of sameDateActive) {
      const [ash, asm] = activeApt.startTime.split(':').map(Number);
      const aStart = ash * 60 + (asm || 0);
      const [aeh, aem] = activeApt.endTime.split(':').map(Number);
      const aEndWithBuffer = aeh * 60 + (aem || 0) + buffer;

      if (startMinutes < aEndWithBuffer && endMinutes + buffer > aStart) {
        throw new Error(
          `Conflict detected: This slot overlaps with an existing appointment (${activeApt.customerName}) or required studio buffer.`
        );
      }
    }

    const newApt: Appointment = {
      ...appointmentData,
      id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      whatsappSent: true,
      confirmationSent: true,
      remindersScheduled: true,
      reminderStatus: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    apts.push(newApt);
    setItem(STORAGE_KEYS.APPOINTMENTS, apts);
    this.setCurrentBookingRef(newApt.bookingReference);

    // 1. Log conversation event (+5m)
    this.addAutomationEvent({
      type: 'conversation',
      appointmentId: newApt.id,
      bookingReference: newApt.bookingReference,
      customerName: newApt.customerName,
      serviceName: newApt.serviceName,
      status: 'sent',
      channel: 'WhatsApp',
      detail: `Auto-booked ${newApt.serviceName} for ${newApt.dateFormatted} at ${newApt.startTimeDisplay}`,
      minutesSaved: 5,
    });

    // 2. Log confirmation event (+2m)
    const firstName = newApt.customerName.split(' ')[0];
    const shortService = newApt.serviceName.includes('Toe') && newApt.serviceName.includes('Gel')
      ? 'Gel + Toes'
      : newApt.serviceName.split('·')[0].trim();

    this.addAutomationEvent({
      type: 'confirmation',
      appointmentId: newApt.id,
      bookingReference: newApt.bookingReference,
      customerName: newApt.customerName,
      serviceName: shortService,
      status: 'sent',
      channel: 'WhatsApp',
      detail: `✓ booking confirmation sent · ${firstName} · ${shortService}`,
      minutesSaved: 2,
    });

    // 3. Schedule 24-hour reminder event
    this.addAutomationEvent({
      type: 'reminder',
      appointmentId: newApt.id,
      bookingReference: newApt.bookingReference,
      customerName: newApt.customerName,
      serviceName: shortService,
      status: 'scheduled',
      channel: 'WhatsApp',
      detail: `24-hour reminder scheduled · ${firstName} · ${shortService} (tomorrow at ${newApt.startTimeDisplay})`,
      minutesSaved: 2,
    });

    // Optional 2-hour reminder event
    this.addAutomationEvent({
      type: 'reminder',
      appointmentId: newApt.id,
      bookingReference: newApt.bookingReference,
      customerName: newApt.customerName,
      serviceName: shortService,
      status: 'scheduled',
      channel: 'WhatsApp',
      detail: `2-hour reminder scheduled · ${firstName} · ${shortService} (2h prior to ${newApt.startTimeDisplay})`,
      minutesSaved: 2,
    });

    // 4. Also add to inquiries list
    const inquiries = this.getInquiries();
    inquiries.unshift({
      id: `inq_${Date.now()}`,
      customerName: newApt.customerName,
      customerPhone: newApt.phone.replace(/(\+\d{3}\s?\d{3})\d{3}(\d{4})/, '$1 ••• $2'),
      avatarText: newApt.customerName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      vipTag: 'New Guest',
      channel: 'WhatsApp',
      inboundMessage: `Auto-booked ${newApt.serviceName} for ${newApt.dateFormatted} at ${newApt.startTimeDisplay}`,
      intelligenceAction: `Extracted intent & availability window. Reserved studio slot. Dispatched WhatsApp confirmation pass #${newApt.bookingReference}.`,
      resolutionTime: '< 1m auto',
      category: 'confirmed',
      status: 'auto-confirmed',
      bookingReference: `#${newApt.bookingReference}`,
      scheduleSummary: `${newApt.dateFormatted} · ${newApt.startTimeDisplay} – ${newApt.endTimeDisplay}`,
      timestamp: 'Just now',
    });
    setItem(STORAGE_KEYS.INQUIRIES, inquiries);

    // 5. Add to automation logs
    this.addAutomationLog({
      title: '✓ booking confirmation sent',
      description: `${firstName} · ${shortService}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: 'check_circle',
      type: 'booking',
    });

    return newApt;
  },

  // Simulate or trigger appointment reminder
  simulateReminder(appointmentId: string): {
    success: boolean;
    previewMessage: string;
    appointment: Appointment;
  } {
    const apts = this.getAppointments();
    const cleanId = appointmentId.trim().replace(/^#/, '').toUpperCase();
    const apt = apts.find(
      (a) => a.id === appointmentId || a.bookingReference.replace(/^#/, '').toUpperCase() === cleanId
    );

    if (!apt) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    const firstName = apt.customerName.split(' ')[0];
    const shortService =
      apt.serviceName.includes('Toe') && apt.serviceName.includes('Gel')
        ? 'Gel + Toes'
        : apt.serviceName.split('·')[0].trim();

    // Exact required format from prompt:
    // “hi ada ✨ just a little reminder that your appointment at mae noir nails is tomorrow at 4:45 pm.”
    const previewMessage = `hi ${firstName.toLowerCase()} ✨ just a little reminder that your appointment at mae noir nails is tomorrow at ${apt.startTimeDisplay.toLowerCase()}.`;

    apt.reminderStatus = 'sent';
    apt.reminderSentAt = new Date().toISOString();
    apt.reminder24hText = previewMessage;
    apt.updated_at = new Date().toISOString();
    setItem(STORAGE_KEYS.APPOINTMENTS, apts);

    // Update scheduled reminder event in automation events from scheduled to sent
    const events = this.getAutomationEvents();
    let foundEvent = false;
    events.forEach((ev) => {
      if ((ev.appointmentId === apt.id || ev.bookingReference === apt.bookingReference) && ev.type === 'reminder') {
        ev.status = 'sent';
        ev.detail = `✓ 24-hour reminder sent · ${firstName} · ${shortService} (${apt.startTimeDisplay})`;
        foundEvent = true;
      }
    });

    if (!foundEvent) {
      this.addAutomationEvent({
        type: 'reminder',
        appointmentId: apt.id,
        bookingReference: apt.bookingReference,
        customerName: apt.customerName,
        serviceName: shortService,
        status: 'sent',
        channel: 'WhatsApp',
        detail: `✓ 24-hour reminder sent · ${firstName} · ${shortService} (${apt.startTimeDisplay})`,
        minutesSaved: 2,
      });
    } else {
      setItem(STORAGE_KEYS.EVENTS, events);
    }

    // Add automation log
    this.addAutomationLog({
      title: '✓ 24-hour reminder sent',
      description: `${firstName} · ${shortService} (tomorrow at ${apt.startTimeDisplay})`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: 'notifications_active',
      type: 'reminder',
    });

    return {
      success: true,
      previewMessage,
      appointment: apt,
    };
  },

  confirmAppointmentAttendance(appointmentId: string): Appointment | null {
    const apts = this.getAppointments();
    const cleanId = appointmentId.trim().replace(/^#/, '').toUpperCase();
    const apt = apts.find(
      (a) => a.id === appointmentId || a.bookingReference.replace(/^#/, '').toUpperCase() === cleanId
    );
    if (!apt) return null;

    apt.status = 'confirmed';
    apt.updated_at = new Date().toISOString();
    setItem(STORAGE_KEYS.APPOINTMENTS, apts);

    this.addAutomationLog({
      title: '✓ Client Confirmed Attendance',
      description: `${apt.customerName.split(' ')[0]} confirmed via WhatsApp reminder link.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: 'task_alt',
      type: 'booking',
    });

    return apt;
  },

  rescheduleAppointment(
    bookingReference: string,
    newDate: string,
    newDateFormatted: string,
    newStartTime: string,
    newStartTimeDisplay: string,
    newEndTime: string,
    newEndTimeDisplay: string
  ): Appointment | null {
    const apts = this.getAppointments();
    const cleanRef = bookingReference.trim().replace(/^#/, '').toUpperCase();
    const idx = apts.findIndex((a) => a.bookingReference.replace(/^#/, '').toUpperCase() === cleanRef);

    if (idx === -1) return null;

    const current = apts[idx];

    // Reschedule safety validation:
    // (a) Closed day & operating hours check
    const business = this.getBusiness();
    const [year, month, day] = newDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayNames: (keyof Business['hours'])[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[dateObj.getDay()];
    const daySchedule = business.hours[dayOfWeek];

    if (!daySchedule || !daySchedule.isOpen) {
      throw new Error(`Mae Noir Studio is closed on ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}s.`);
    }

    const [oh, om] = daySchedule.openTime.split(':').map(Number);
    const openMinutes = oh * 60 + (om || 0);
    const [ch, cm] = daySchedule.closeTime.split(':').map(Number);
    const closeMinutes = ch * 60 + (cm || 0);

    const [sh, sm] = newStartTime.split(':').map(Number);
    const startMinutes = sh * 60 + (sm || 0);
    const [eh, em] = newEndTime.split(':').map(Number);
    const endMinutes = eh * 60 + (em || 0);

    if (startMinutes < openMinutes || endMinutes > closeMinutes) {
      throw new Error('Reschedule time slot falls outside studio operating hours.');
    }

    // (b) Overlapping check with other bookings
    const buffer = business.bookingBufferMinutes || 15;
    const sameDateActive = apts.filter(
      (a) => a.date === newDate && a.status !== 'cancelled' && a.id !== current.id
    );

    for (const activeApt of sameDateActive) {
      const [ash, asm] = activeApt.startTime.split(':').map(Number);
      const aStart = ash * 60 + (asm || 0);
      const [aeh, aem] = activeApt.endTime.split(':').map(Number);
      const aEndWithBuffer = aeh * 60 + (aem || 0) + buffer;

      if (startMinutes < aEndWithBuffer && endMinutes + buffer > aStart) {
        throw new Error(
          `Conflict detected: This slot overlaps with another scheduled session (${activeApt.customerName}) or buffer.`
        );
      }
    }

    const updated: Appointment = {
      ...current,
      status: 'rescheduled',
      date: newDate,
      dateFormatted: newDateFormatted,
      startTime: newStartTime,
      startTimeDisplay: newStartTimeDisplay,
      endTime: newEndTime,
      endTimeDisplay: newEndTimeDisplay,
      reminderStatus: 'scheduled', // Rescheduled booking gets fresh reminder
      rescheduledFrom: {
        date: current.date,
        dateFormatted: current.dateFormatted,
        startTimeDisplay: current.startTimeDisplay,
        endTimeDisplay: current.endTimeDisplay,
      },
      updated_at: new Date().toISOString(),
    };

    apts[idx] = updated;
    setItem(STORAGE_KEYS.APPOINTMENTS, apts);

    const firstName = current.customerName.split(' ')[0];
    const shortService =
      current.serviceName.includes('Toe') && current.serviceName.includes('Gel')
        ? 'Gel + Toes'
        : current.serviceName.split('·')[0].trim();

    // Record reschedule event (+6m avoided)
    this.addAutomationEvent({
      type: 'reschedule',
      appointmentId: current.id,
      bookingReference: current.bookingReference,
      customerName: current.customerName,
      serviceName: shortService,
      status: 'sent',
      channel: 'WhatsApp',
      detail: `✓ reschedule completed: ${current.customerName} moved from ${current.startTimeDisplay} to ${newDateFormatted} at ${newStartTimeDisplay}`,
      minutesSaved: 6,
    });

    this.addAutomationLog({
      title: 'appointment updated ✨',
      description: `${firstName} · moved to ${newDateFormatted.split(',')[0]} at ${newStartTimeDisplay}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: 'sync_alt',
      type: 'reschedule',
    });

    return updated;
  },

  cancelAppointment(bookingReference: string): boolean {
    const apts = this.getAppointments();
    const cleanRef = bookingReference.trim().replace(/^#/, '').toUpperCase();
    const idx = apts.findIndex((a) => a.bookingReference.replace(/^#/, '').toUpperCase() === cleanRef);

    if (idx === -1) return false;

    const current = apts[idx];
    apts[idx] = {
      ...current,
      status: 'cancelled',
      reminderStatus: 'cancelled',
      updated_at: new Date().toISOString(),
    };

    setItem(STORAGE_KEYS.APPOINTMENTS, apts);

    // Cancel any scheduled reminders for this appointment
    const events = this.getAutomationEvents();
    events.forEach((ev) => {
      if ((ev.appointmentId === current.id || ev.bookingReference === current.bookingReference) && ev.type === 'reminder') {
        ev.status = 'cancelled';
        ev.detail = `Reminder cancelled (reservation cancelled by guest)`;
      }
    });
    setItem(STORAGE_KEYS.EVENTS, events);

    const firstName = current.customerName.split(' ')[0];
    const shortService =
      current.serviceName.includes('Toe') && current.serviceName.includes('Gel')
        ? 'Gel + Toes'
        : current.serviceName.split('·')[0].trim();

    // Record cancellation event
    this.addAutomationEvent({
      type: 'cancellation',
      appointmentId: current.id,
      bookingReference: current.bookingReference,
      customerName: current.customerName,
      serviceName: shortService,
      status: 'sent',
      channel: 'WhatsApp',
      detail: `✓ reservation cancelled: ${current.customerName} released slot (${current.dateFormatted} at ${current.startTimeDisplay})`,
      minutesSaved: 2,
    });

    this.addAutomationLog({
      title: '✓ reservation cancelled',
      description: `${firstName} · ${shortService} released to atelier schedule`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: 'event_busy',
      type: 'booking',
    });

    return true;
  },

  updateAppointmentStatus(id: string, status: AppointmentStatus): void {
    const apts = this.getAppointments();
    const apt = apts.find((a) => a.id === id);
    if (apt) {
      apt.status = status;
      apt.updated_at = new Date().toISOString();
      setItem(STORAGE_KEYS.APPOINTMENTS, apts);
    }
  },

  getInquiries(): Inquiry[] {
    return getItem(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
  },

  dismissInquiry(id: string): void {
    const inquiries = this.getInquiries().filter((inq) => inq.id !== id);
    setItem(STORAGE_KEYS.INQUIRIES, inquiries);
  },

  approveInquiryProposal(id: string): void {
    const inquiries = this.getInquiries();
    const target = inquiries.find((i) => i.id === id);
    if (target) {
      target.category = 'confirmed';
      target.status = 'auto-confirmed';
      target.intelligenceAction += ' · Mae approved private atelier buyout proposal. Dispatched via WhatsApp.';
      setItem(STORAGE_KEYS.INQUIRIES, inquiries);

      this.addAutomationLog({
        title: 'Bespoke Proposal Dispatched',
        description: `Bridal Suite proposal sent to ${target.customerName} via WhatsApp.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        icon: 'send',
        type: 'dispatch',
      });
    }
  },

  getAutomations(): Automation[] {
    // Dynamic counts based on actual automation events
    const automations = getItem(STORAGE_KEYS.AUTOMATIONS, INITIAL_AUTOMATIONS);
    const events = this.getAutomationEvents().filter((e) => e.status === 'sent');

    const confCount = events.filter((e) => e.type === 'confirmation').length;
    const remindCount = events.filter((e) => e.type === 'reminder').length;
    const reschedCount = events.filter((e) => e.type === 'reschedule').length;
    const followCount = events.filter((e) => e.type === 'followup').length;

    return automations.map((a) => {
      if (a.id === 'auto_confirm') return { ...a, metricCount: confCount };
      if (a.id === 'auto_remind') return { ...a, metricCount: remindCount };
      if (a.id === 'auto_reschedule') return { ...a, metricCount: reschedCount };
      if (a.id === 'auto_aftercare') return { ...a, metricCount: followCount };
      return a;
    });
  },

  toggleAutomation(id: string): void {
    const automations = this.getAutomations();
    const auto = automations.find((a) => a.id === id);
    if (auto) {
      auto.enabled = !auto.enabled;
      setItem(STORAGE_KEYS.AUTOMATIONS, automations);
    }
  },

  getAutomationLogs(): AutomationLog[] {
    return getItem(STORAGE_KEYS.LOGS, INITIAL_LOGS);
  },

  addAutomationLog(log: Omit<AutomationLog, 'id'>): void {
    const logs = this.getAutomationLogs();
    logs.unshift({
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    });
    setItem(STORAGE_KEYS.LOGS, logs.slice(0, 30));
  },

  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.BUSINESS);
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.INQUIRIES);
    localStorage.removeItem(STORAGE_KEYS.AUTOMATIONS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_REF);
  },
};
