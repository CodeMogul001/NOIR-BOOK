/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NLParseResult, Service } from '../types';
import { store } from './store';

// Helper to format date nicely
export function formatDateNice(d: Date): { iso: string; formatted: string; dayName: string } {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const year = d.getFullYear();
  const monthStr = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  const iso = `${year}-${monthStr}-${dayStr}`;

  const dayName = dayNames[d.getDay()];
  const monthName = monthNames[d.getMonth()];
  const formatted = `${dayName}, ${monthName} ${d.getDate()}`;

  return { iso, formatted, dayName };
}

// Find next day of week ensuring date is in future or today
export function getNextDayOfWeek(dayOfWeekIndex: number, referenceDate: Date = new Date()): Date {
  const result = new Date(referenceDate);
  const currentDay = referenceDate.getDay();
  let distance = dayOfWeekIndex - currentDay;

  // If today is that day or already passed this week, advance to next week
  if (distance <= 0) {
    distance += 7;
  }
  result.setDate(referenceDate.getDate() + distance);
  return result;
}

export function parseNaturalLanguageRequest(promptText: string): NLParseResult {
  const lower = promptText.toLowerCase().trim();
  const services = store.getServices();

  // ================= 1. SERVICE RECOGNITION =================
  let matchedService: Service | undefined;
  let isServiceIdentified = false;

  // Check combo first
  const isCombo =
    (lower.includes('gel') && (lower.includes('toe') || lower.includes('pedi'))) ||
    lower.includes('combo') ||
    lower.includes('bundle') ||
    lower.includes('gel and toes') ||
    lower.includes('gel + toes') ||
    lower.includes('gel with toes') ||
    lower.includes('gel with toe nails') ||
    lower.includes('gel nails and toes') ||
    lower.includes('gel nails and toe nails') ||
    lower.includes('gel and toe nails') ||
    lower.includes('mani and pedi') ||
    lower.includes('manicure and pedicure');

  if (isCombo) {
    matchedService = services.find((s) => s.id === 'srv_combo');
    isServiceIdentified = true;
  } else if (
    lower.includes('nail art') ||
    /\b(art|design|french|french tips|chrome|line art|repair)\b/.test(lower)
  ) {
    matchedService = services.find((s) => s.id === 'srv_art');
    isServiceIdentified = true;
  } else if (
    /\b(toe|toes|toe nails|pedi|pedicure|dry pedicure)\b/.test(lower)
  ) {
    matchedService = services.find((s) => s.id === 'srv_toes');
    isServiceIdentified = true;
  } else if (
    /\b(gel|gel nails|gel manicure|biab|manicure|mani|structured manicure|cuticle|russian manicure)\b/.test(lower)
  ) {
    matchedService = services.find((s) => s.id === 'srv_gel');
    isServiceIdentified = true;
  }

  // Fallback if not recognized: default to combo or first service, but flag isServiceIdentified = false
  if (!matchedService) {
    matchedService = services.find((s) => s.id === 'srv_combo') || services[0];
    isServiceIdentified = false;
  }

  // ================= 2. DATE RECOGNITION =================
  const today = new Date();
  let targetDate = '2026-09-26';
  let targetDateFormatted = 'Saturday, September 26';
  let dateLabel = 'Prime Weekend Atelier Day';
  let isDateIdentified = false;

  if (lower.includes('today')) {
    const info = formatDateNice(today);
    targetDate = info.iso;
    targetDateFormatted = info.formatted;
    dateLabel = 'Same-Day Atelier Booking';
    isDateIdentified = true;
  } else if (lower.includes('tomorrow')) {
    const tom = new Date(today);
    tom.setDate(tom.getDate() + 1);
    const info = formatDateNice(tom);
    targetDate = info.iso;
    targetDateFormatted = info.formatted;
    dateLabel = 'Next-Day Priority Session';
    isDateIdentified = true;
  } else if (lower.includes('friday')) {
    const fri = getNextDayOfWeek(5, today);
    const info = formatDateNice(fri);
    targetDate = info.iso;
    targetDateFormatted = info.formatted;
    dateLabel = 'Friday Atelier Sunset Hours';
    isDateIdentified = true;
  } else if (lower.includes('saturday') || lower.includes('weekend')) {
    // Check if prompt specifically mentions Saturday Sept 26 or future
    const sat = getNextDayOfWeek(6, today);
    // If today is before Sep 26 2026 or classic demo, support Saturday
    if (lower.includes('26') || lower.includes('sep 26') || lower.includes('september 26')) {
      targetDate = '2026-09-26';
      targetDateFormatted = 'Saturday, September 26';
    } else {
      const info = formatDateNice(sat);
      targetDate = info.iso;
      targetDateFormatted = info.formatted;
    }
    dateLabel = 'Prime Weekend Atelier Day';
    isDateIdentified = true;
  } else if (lower.includes('sunday')) {
    const sun = getNextDayOfWeek(0, today);
    const info = formatDateNice(sun);
    targetDate = info.iso;
    targetDateFormatted = info.formatted;
    dateLabel = 'Sunday Sanctuary Session';
    isDateIdentified = true;
  } else if (lower.includes('monday')) {
    const mon = getNextDayOfWeek(1, today);
    const info = formatDateNice(mon);
    targetDate = info.iso;
    targetDateFormatted = info.formatted;
    dateLabel = 'Serene Weekday Morning';
    isDateIdentified = true;
  } else if (lower.includes('tuesday')) {
    const tue = getNextDayOfWeek(2, today);
    const info = formatDateNice(tue);
    targetDate = info.iso;
    targetDateFormatted = info.formatted;
    dateLabel = 'Midweek Atelier Session';
    isDateIdentified = true;
  } else if (lower.includes('wednesday')) {
    const wed = getNextDayOfWeek(3, today);
    const info = formatDateNice(wed);
    targetDate = info.iso;
    targetDateFormatted = info.formatted;
    dateLabel = 'Midweek Atelier Session';
    isDateIdentified = true;
  } else if (lower.includes('thursday')) {
    const thu = getNextDayOfWeek(4, today);
    const info = formatDateNice(thu);
    targetDate = info.iso;
    targetDateFormatted = info.formatted;
    dateLabel = 'Thursday Pre-Weekend Slot';
    isDateIdentified = true;
  } else {
    // Date missing!
    // Set nearest open studio day (e.g. Saturday) as initial preview but flag as not identified
    const sat = getNextDayOfWeek(6, today);
    const info = formatDateNice(sat);
    targetDate = info.iso;
    targetDateFormatted = info.formatted;
    dateLabel = 'Atelier Availability';
    isDateIdentified = false;
  }

  // ================= 3. TIME PREFERENCE RECOGNITION =================
  let preferenceWindow = 'Flexible (Any available time)';
  let preferenceTag = 'Open studio availability';
  let timePreferenceType: 'after' | 'around' | 'window' | 'flexible' = 'flexible';
  let isTimeIdentified = false;
  let minMinutes: number | undefined;
  let maxMinutes: number | undefined;
  let targetMinutes: number | undefined;

  // Regex patterns for "after X"
  const afterMatch = lower.match(/\bafter\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  // Regex pattern for "around X"
  const aroundMatch = lower.match(/\baround\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);

  if (afterMatch) {
    let hour = parseInt(afterMatch[1], 10);
    const mins = afterMatch[2] ? parseInt(afterMatch[2], 10) : 0;
    const meridiem = afterMatch[3];

    // In salon context, 1-7 without am/pm is PM (e.g. "after 2" -> 2:00 PM)
    if (meridiem === 'pm' && hour < 12) hour += 12;
    else if (meridiem === 'am' && hour === 12) hour = 0;
    else if (!meridiem && hour >= 1 && hour <= 7) hour += 12;

    minMinutes = hour * 60 + mins;
    timePreferenceType = 'after';
    isTimeIdentified = true;

    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMeridiem = hour >= 12 ? 'PM' : 'AM';
    const displayMins = mins > 0 ? `:${String(mins).padStart(2, '0')}` : ':00';
    preferenceWindow = `After ${displayHour}${displayMins} ${displayMeridiem}`;

    if (hour >= 17) {
      preferenceTag = 'Twilight studio session';
    } else if (hour >= 14) {
      preferenceTag = 'Late afternoon studio session';
    } else {
      preferenceTag = 'Morning & midday studio slot';
    }
  } else if (aroundMatch) {
    let hour = parseInt(aroundMatch[1], 10);
    const mins = aroundMatch[2] ? parseInt(aroundMatch[2], 10) : 0;
    const meridiem = aroundMatch[3];

    if (meridiem === 'pm' && hour < 12) hour += 12;
    else if (!meridiem && hour >= 1 && hour <= 7) hour += 12;

    targetMinutes = hour * 60 + mins;
    minMinutes = Math.max(10 * 60, targetMinutes - 60);
    maxMinutes = Math.min(20 * 60, targetMinutes + 60);
    timePreferenceType = 'around';
    isTimeIdentified = true;

    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMeridiem = hour >= 12 ? 'PM' : 'AM';
    const displayMins = mins > 0 ? `:${String(mins).padStart(2, '0')}` : ':00';
    preferenceWindow = `Around ${displayHour}${displayMins} ${displayMeridiem}`;
    preferenceTag = 'Targeted appointment window';
  } else if (lower.includes('morning') || lower.includes('in the morning') || lower.includes('early')) {
    minMinutes = 10 * 60; // 10:00 AM
    maxMinutes = 13 * 60; // 1:00 PM
    timePreferenceType = 'window';
    isTimeIdentified = true;
    preferenceWindow = 'Morning (10:00 AM – 1:00 PM)';
    preferenceTag = 'Serene morning studio slot';
  } else if (lower.includes('afternoon') || lower.includes('midday')) {
    minMinutes = 12 * 60; // 12:00 PM
    maxMinutes = 17 * 60; // 5:00 PM
    timePreferenceType = 'window';
    isTimeIdentified = true;
    preferenceWindow = 'Afternoon (12:00 PM – 5:00 PM)';
    preferenceTag = 'Mid-afternoon golden hour';
  } else if (lower.includes('evening') || lower.includes('twilight') || lower.includes('tonight')) {
    minMinutes = 17 * 60; // 5:00 PM
    maxMinutes = 20 * 60; // 8:00 PM
    timePreferenceType = 'window';
    isTimeIdentified = true;
    preferenceWindow = 'Evening (5:00 PM – 8:00 PM)';
    preferenceTag = 'Twilight studio session';
  } else {
    // Time preference is missing: do not force customer to provide one!
    // Search normal available slots across business hours.
    timePreferenceType = 'flexible';
    isTimeIdentified = false;
    preferenceWindow = 'Flexible (Any available time)';
    preferenceTag = 'Open studio availability';
  }

  // ================= 4. PROMPT QUESTION / CLARIFICATION =================
  let missingPrompt: string | undefined;
  if (!isServiceIdentified && !isDateIdentified) {
    missingPrompt = 'what would you like to book, and what day works best?';
  } else if (!isServiceIdentified) {
    missingPrompt = 'what would you like to book?';
  } else if (!isDateIdentified) {
    missingPrompt = 'what day would you like to come in?';
  }

  const hours = Math.floor(matchedService.duration / 60);
  const mins = matchedService.duration % 60;
  const estimatedRitualDisplay =
    hours > 0 ? (mins > 0 ? `${hours} hours ${mins} minutes` : `${hours} hours`) : `${mins} minutes`;

  return {
    rawPrompt: promptText,
    isServiceIdentified,
    isDateIdentified,
    isTimeIdentified,
    missingPrompt,
    serviceId: matchedService.id,
    serviceName: matchedService.name,
    serviceDuration: matchedService.duration,
    servicePriceNGN: matchedService.priceNGN,
    servicePriceUSD: matchedService.priceUSD,
    targetDate,
    targetDateFormatted,
    dateLabel,
    preferenceWindow,
    preferenceTag,
    timePreferenceType,
    minMinutes,
    maxMinutes,
    targetMinutes,
    estimatedRitualDisplay,
  };
}
