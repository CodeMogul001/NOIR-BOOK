/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Appointment, TimeSlot } from '../../types';
import { store } from '../../services/store';
import { calculateAvailableSlots } from '../../services/availabilityEngine';

interface MyAppointmentViewProps {
  initialBookingRef?: string;
  onNavigateToBooking: () => void;
  showToast: (msg: string, icon?: string) => void;
}

type ViewState = 'confirmed' | 'rescheduling' | 'cancelled';

export const MyAppointmentView: React.FC<MyAppointmentViewProps> = ({
  initialBookingRef,
  onNavigateToBooking,
  showToast,
}) => {
  const [searchRef, setSearchRef] = useState<string>(
    initialBookingRef || store.getCurrentBookingRef() || 'MN-8492'
  );
  const [appointment, setAppointment] = useState<Appointment | null>(() => {
    const ref = initialBookingRef || store.getCurrentBookingRef() || 'MN-8492';
    return store.getAppointmentByRef(ref) || store.getAppointments()[2] || null;
  });

  const [viewState, setViewState] = useState<ViewState>('confirmed');
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Rescheduling selection state
  const [rescheduleDateISO, setRescheduleDateISO] = useState<string>('2026-09-27');
  const [rescheduleDateDisplay, setRescheduleDateDisplay] = useState<string>('Sunday, September 27');
  const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlot[]>([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState<TimeSlot | null>(null);

  // Load appointment when searchRef changes
  useEffect(() => {
    const found = store.getAppointmentByRef(searchRef);
    if (found) {
      setAppointment(found);
      if (found.status === 'cancelled') {
        setViewState('cancelled');
      } else {
        setViewState('confirmed');
      }
    }
  }, [searchRef]);

  // Load reschedule slots
  useEffect(() => {
    if (!appointment) return;
    const res = calculateAvailableSlots({
      serviceDuration: appointment.serviceDuration || 90,
      requestedDate: rescheduleDateISO,
      excludeAppointmentId: appointment.id,
      candidateInterval: 30,
    });

    setRescheduleSlots(res.slots);
    if (res.slots.length > 0) {
      setSelectedRescheduleSlot(res.slots[1] || res.slots[0]);
    } else {
      setSelectedRescheduleSlot(null);
    }
  }, [appointment, rescheduleDateISO]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = store.getAppointmentByRef(searchRef);
    if (found) {
      setAppointment(found);
      store.setCurrentBookingRef(found.bookingReference);
      if (found.status === 'cancelled') {
        setViewState('cancelled');
      } else {
        setViewState('confirmed');
      }
      showToast(`Loaded booking #${found.bookingReference}`);
    } else {
      showToast(`No appointment found for reference #${searchRef.toUpperCase()}`, 'error');
    }
  };

  const scrollToReschedule = () => {
    setViewState('rescheduling');
    const el = document.getElementById('reschedule-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCommitReschedule = () => {
    if (!appointment || !selectedRescheduleSlot) return;

    try {
      const updated = store.rescheduleAppointment(
        appointment.bookingReference,
        rescheduleDateISO,
        rescheduleDateDisplay,
        selectedRescheduleSlot.startTime,
        selectedRescheduleSlot.startTimeDisplay,
        selectedRescheduleSlot.endTime,
        selectedRescheduleSlot.endTimeDisplay
      );

      if (updated) {
        setAppointment(updated);
        setViewState('confirmed');
        showToast('appointment updated ✨', 'sync_alt');
        window.scrollTo({ top: 100, behavior: 'smooth' });
      } else {
        showToast('Unable to reschedule. Slot may no longer be available.', 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to reschedule to this slot.';
      showToast(msg, 'error');
    }
  };

  const handleConfirmCancel = () => {
    if (!appointment) return;
    store.cancelAppointment(appointment.bookingReference);
    const updated = store.getAppointmentByRef(appointment.bookingReference);
    if (updated) setAppointment(updated);
    setCancelModalOpen(false);
    setViewState('cancelled');
    showToast('Reservation released with grace', 'event_busy');
  };

  const handleGoogleCalendar = () => {
    if (!appointment) return;
    const title = encodeURIComponent(`${appointment.serviceName} at Mae Noir Nails`);
    const details = encodeURIComponent(
      `Private atelier reservation at Mae Noir Nails (Ref #${appointment.bookingReference}). Phone: +234 803 456 7890.`
    );
    const location = encodeURIComponent('Plot 14, Cedar Grove, off University Road, Tanke GRA, Ilorin, Kwara State');

    // Google Calendar format YYYYMMDDTHHMMSSZ
    const dateClean = appointment.date.replace(/-/g, '');
    const startClean = appointment.startTime.replace(':', '') + '00';
    const endClean = appointment.endTime.replace(':', '') + '00';
    const dates = `${dateClean}T${startClean}/${dateClean}T${endClean}`;

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCalendarMenuOpen(false);
    showToast('Opening Google Calendar...', 'event');
  };

  const handleDownloadICS = () => {
    if (!appointment) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mae Noir Nails//NoirBook Atelier//EN
BEGIN:VEVENT
SUMMARY:${appointment.serviceName} - Mae Noir Nails
DESCRIPTION:Booking Reference #${appointment.bookingReference}. Plot 14, Cedar Grove, Tanke GRA, Ilorin.
LOCATION:Mae Noir Sanctuary, Tanke GRA, Ilorin, Kwara State, Nigeria
DTSTART:${appointment.date.replace(/-/g, '')}T${appointment.startTime.replace(':', '')}00
DTEND:${appointment.date.replace(/-/g, '')}T${appointment.endTime.replace(':', '')}00
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Mae_Noir_Appointment_${appointment.bookingReference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCalendarMenuOpen(false);
    showToast('Apple Calendar (.ics) downloaded', 'file_download');
  };

  return (
    <div className="max-w-[1320px] mx-auto px-6 lg:px-12 py-10 w-full flex flex-col gap-8">
      {/* Top Utility & Mode Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNavigateToBooking}
            className="inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-wider text-[#825245] hover:text-[#000000] transition-colors py-1.5 px-3 rounded-full bg-[#f5f3f0]"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Mae Noir Nails</span>
          </button>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#efeeeb] font-sans text-[10px] tracking-widest uppercase text-[#4d4541] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#825245]"></span>
            Booking Reference: <strong className="text-[#000000]">#{appointment?.bookingReference || 'MN-8492'}</strong> · Guest Access
          </span>
        </div>

        {/* State Simulator Pills */}
        <div className="flex items-center gap-1.5 bg-[#f5f3f0] p-1.5 rounded-full self-start md:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => setViewState('confirmed')}
            className={`px-3.5 py-1.5 rounded-full font-sans text-[10px] font-semibold tracking-wider transition-all duration-200 ${
              viewState === 'confirmed'
                ? 'bg-[#000000] text-[#ffffff] shadow-sm'
                : 'text-[#4d4541] hover:text-[#000000]'
            }`}
          >
            View: Booking Confirmed
          </button>
          <button
            type="button"
            onClick={scrollToReschedule}
            className={`px-3.5 py-1.5 rounded-full font-sans text-[10px] font-semibold tracking-wider transition-all duration-200 ${
              viewState === 'rescheduling'
                ? 'bg-[#000000] text-[#ffffff] shadow-sm'
                : 'text-[#4d4541] hover:text-[#000000]'
            }`}
          >
            View: Reschedule in Progress
          </button>
          <button
            type="button"
            onClick={() => setViewState('cancelled')}
            className={`px-3.5 py-1.5 rounded-full font-sans text-[10px] font-semibold tracking-wider transition-all duration-200 ${
              viewState === 'cancelled'
                ? 'bg-[#000000] text-[#ffffff] shadow-sm'
                : 'text-[#4d4541] hover:text-[#000000]'
            }`}
          >
            View: Cancelled / Buffer
          </button>
        </div>
      </div>

      {/* Lookup Bar if customer wants to switch booking ref */}
      <div className="bg-[#ffffff] rounded-2xl p-4 sm:p-5 border border-[#d0c4be]/30 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <span className="material-symbols-outlined text-[#825245] text-lg">search</span>
          <input
            type="text"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            placeholder="Enter booking reference (e.g. MN-8492)"
            className="w-full bg-[#f5f3f0] focus:bg-[#ffffff] text-[#1b1c1a] font-mono text-sm uppercase px-4 py-2 rounded-xl outline-none border border-transparent focus:border-[#825245]"
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-[#000000] text-[#ffffff] hover:bg-[#4d4541] font-sans text-[11px] font-semibold uppercase tracking-wider shrink-0 transition-colors"
          >
            Find
          </button>
        </form>

        <div className="flex items-center gap-2 text-[#4d4541] font-sans text-[11px] self-start sm:self-auto">
          <span className="text-[#7e7570]">Sample passes:</span>
          {['MN-8492', 'MN-6184', 'MN-8210'].map((ref) => (
            <button
              key={ref}
              type="button"
              onClick={() => setSearchRef(ref)}
              className="px-2 py-0.5 rounded-md bg-[#f5f3f0] hover:bg-[#efeeeb] font-mono text-[11px] text-[#825245]"
            >
              #{ref}
            </button>
          ))}
        </div>
      </div>

      {/* Cancelled View */}
      {viewState === 'cancelled' ? (
        <div className="flex flex-col gap-8">
          <div className="bg-[#ffffff] rounded-2xl sm:rounded-3xl p-8 lg:p-12 shadow-sm text-center max-w-2xl mx-auto w-full border border-[#d0c4be]/30">
            <div className="w-16 h-16 rounded-full bg-[#efeeeb] text-[#4d4541] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">event_busy</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#efeeeb] text-[#4d4541] font-sans text-[11px] uppercase tracking-wider font-semibold mb-2">
              <span>Reservation Released</span>
            </div>
            <h2 className="font-serif text-[40px] text-[#000000] mb-3 leading-tight">
              booking cancelled with grace.
            </h2>
            <p className="font-sans text-[16px] text-[#4d4541] mb-6 leading-relaxed">
              Your slot for {appointment?.serviceName || 'Gel Nails'} has been made available to the atelier waitlist. Zero cancellation penalty was charged.
            </p>
            <div className="p-6 rounded-xl bg-[#f5f3f0] text-left mb-6 border border-[#d0c4be]/20">
              <div className="font-sans text-[11px] text-[#825245] uppercase tracking-wider font-semibold mb-1">
                Deposit & Buffer Guarantee
              </div>
              <div className="font-sans text-[12px] text-[#4d4541] leading-relaxed">
                Because this booking was updated more than 4 hours in advance, your 100% reservation credit is preserved in your client profile under reference <strong>#{appointment?.bookingReference || 'MN-8492'}</strong> for future use.
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setViewState('confirmed');
                  if (appointment) {
                    store.updateAppointmentStatus(appointment.id, 'confirmed');
                    setAppointment({ ...appointment, status: 'confirmed' });
                  }
                }}
                className="w-full sm:w-auto py-3 px-8 rounded-full bg-[#000000] text-[#ffffff] font-sans text-[13px] font-semibold tracking-wide shadow-sm hover:bg-[#4d4541] transition-colors"
              >
                Re-book Appointment
              </button>
              <a
                href="https://wa.me/2348034567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3 px-8 rounded-full bg-[#efeeeb] font-sans text-[13px] font-semibold tracking-wide text-[#000000] hover:bg-[#eae8e5] transition-colors"
              >
                Speak to Mae
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* Confirmed / Rescheduling Active View */
        <div className="flex flex-col gap-10">
          {/* 1. Hero Celebratory Confirmation Banner */}
          <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#f5f3f0] p-8 lg:p-12 shadow-sm border border-[#d0c4be]/30">
            <div className="absolute -right-20 -top-24 w-80 h-80 rounded-full bg-[#ffc0b0]/40 blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffc0b0] text-[#7a4c3f] font-sans text-[11px] font-semibold uppercase mb-4">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  <span>Private Guest Reservation Active</span>
                </div>
                <h1 className="font-serif text-[42px] sm:text-[56px] text-[#000000] tracking-tight mb-3 leading-none">
                  {appointment?.status === 'rescheduled' ? 'appointment updated ✨' : 'you’re booked! ✨'}
                </h1>
                <p className="font-sans text-[16px] text-[#4d4541] mb-6 leading-relaxed">
                  Mae Noir Nails · Bespoke Sanctuary on Fate Road, GRA, Ilorin, Nigeria. Your reservation is securely held with zero passwords required.
                </p>

                {/* Appointment Lifecycle Progress Rail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#ffffff] shadow-xs">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#000000] text-[#ffffff] flex items-center justify-center text-xs">
                      ✓
                    </span>
                    <div>
                      <div className="font-sans text-[11px] font-semibold text-[#000000]">Appointment Confirmed</div>
                      <div className="font-sans text-[12px] text-[#4d4541]">Instant booking matched</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#ffffff] shadow-xs">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#000000] text-[#ffffff] flex items-center justify-center text-xs">
                      ✓
                    </span>
                    <div>
                      <div className="font-sans text-[11px] font-semibold text-[#000000]">WhatsApp Confirmed</div>
                      <div className="font-sans text-[12px] text-[#4d4541]">
                        Sent to {appointment?.phone || '+234 803 456 7890'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#ffffff] shadow-xs">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#000000] text-[#ffffff] flex items-center justify-center text-xs">
                      ✓
                    </span>
                    <div>
                      <div className="font-sans text-[11px] font-semibold text-[#000000]">Reminders Scheduled</div>
                      <div className="font-sans text-[12px] text-[#4d4541]">24h & 2h prior alerts</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#eae8e5]/60">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#d0c4be]/60 text-[#4d4541] flex items-center justify-center text-xs">
                      ○
                    </span>
                    <div>
                      <div className="font-sans text-[11px] font-semibold text-[#4d4541]">Studio Preparation</div>
                      <div className="font-sans text-[12px] text-[#4d4541]">Palette & nail consultation</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Access Pill Card */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#ffffff] text-center shadow-md min-w-[240px] border border-[#d0c4be]/30">
                <span className="font-sans text-[10px] uppercase tracking-wider text-[#825245] font-semibold mb-1">
                  Pass Code Ref
                </span>
                <span className="font-serif text-[28px] tracking-widest text-[#000000] font-semibold">
                  #{appointment?.bookingReference || 'MN-8492'}
                </span>
                <span className="font-sans text-[12px] text-[#4d4541] mt-2 mb-4">
                  Saved directly to your browser session
                </span>
                <button
                  type="button"
                  onClick={scrollToReschedule}
                  className="w-full py-2.5 px-4 rounded-full bg-[#000000] text-[#ffffff] font-sans text-[11px] font-semibold uppercase tracking-wider hover:bg-[#4d4541] transition-all"
                >
                  Manage Booking
                </button>
              </div>
            </div>
          </section>

          {/* 2. Split Editorial Details Card & Artist Profile */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Appointment Details Panel (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-[#ffffff] rounded-2xl sm:rounded-3xl p-8 lg:p-10 shadow-sm border border-[#d0c4be]/30 flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#d0c4be]/20">
                  <div>
                    <span className="font-sans text-[11px] uppercase tracking-wider text-[#825245] font-semibold">
                      Bespoke Ritual Service
                    </span>
                    <h2 className="font-serif text-[32px] sm:text-[36px] text-[#000000] mt-1 font-medium leading-tight">
                      {appointment?.serviceName || 'Gel Nails + Toe Nails with Custom Abstract Line Art'}
                    </h2>
                  </div>
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="font-sans text-[10px] uppercase text-[#7e7570] font-semibold">Total Duration</span>
                    <span className="font-serif text-[22px] text-[#000000] font-medium">
                      {Math.floor((appointment?.serviceDuration || 150) / 60)}h{' '}
                      {(appointment?.serviceDuration || 150) % 60}m
                    </span>
                  </div>
                </div>

                {/* Preserved Appointment History if Rescheduled */}
                {appointment?.rescheduledFrom && (
                  <div className="p-4 rounded-2xl bg-[#ffc0b0]/30 border border-[#825245]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#ffc0b0] text-[#7a4c3f] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">history</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-sans text-[10px] uppercase tracking-wider text-[#825245] font-bold">
                          Appointment Reschedule History Preserved
                        </span>
                        <div className="font-sans text-[13px] text-[#000000] mt-0.5">
                          <span className="text-[#ba1a1a] line-through opacity-80">
                            Original: {appointment.rescheduledFrom.dateFormatted.split(',')[0]} {appointment.rescheduledFrom.startTimeDisplay}
                          </span>{' '}
                          →{' '}
                          <span className="font-semibold text-[#825245]">
                            New: {appointment.dateFormatted.split(',')[0]} {appointment.startTimeDisplay}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#825245] text-[#ffffff] font-sans text-[10px] uppercase tracking-wider font-semibold self-start sm:self-auto shadow-xs">
                      appointment updated ✨
                    </span>
                  </div>
                )}

                {/* Key appointment metadata columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#f5f3f0] p-6 rounded-xl">
                  <div className="flex items-start gap-4">
                    <span className="p-2.5 rounded-full bg-[#efeeeb] text-[#000000] material-symbols-outlined text-[20px]">
                      calendar_today
                    </span>
                    <div>
                      <div className="font-sans text-[11px] text-[#825245] uppercase font-semibold">
                        Date & Time Slot
                      </div>
                      <div className="font-serif text-[18px] text-[#000000] font-medium mt-0.5">
                        {appointment?.dateFormatted || 'Saturday, September 26'}
                      </div>
                      <div className="font-sans text-[14px] text-[#4d4541]">
                        {appointment?.startTimeDisplay || '4:45 PM'} – {appointment?.endTimeDisplay || '7:15 PM'} (WAT · GMT+1)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="p-2.5 rounded-full bg-[#efeeeb] text-[#000000] material-symbols-outlined text-[20px]">
                      pin_drop
                    </span>
                    <div>
                      <div className="font-sans text-[11px] text-[#825245] uppercase font-semibold">Location</div>
                      <div className="font-serif text-[18px] text-[#000000] font-medium mt-0.5">
                        Mae Noir Nails Studio
                      </div>
                      <div className="font-sans text-[14px] text-[#4d4541]">
                        14 Fate Road, GRA, Ilorin, Kwara State
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendar & Direct Reschedule Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={() => setCalendarMenuOpen(!calendarMenuOpen)}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#efeeeb] hover:bg-[#eae8e5] transition-colors font-sans text-[13px] font-semibold text-[#000000]"
                      >
                        <span className="material-symbols-outlined text-[18px]">event</span>
                        <span>Add to Calendar</span>
                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                      </button>

                      {calendarMenuOpen && (
                        <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[#ffffff] shadow-xl py-2 z-20 border border-[#d0c4be]/40">
                          <button
                            type="button"
                            onClick={handleGoogleCalendar}
                            className="w-full flex items-center gap-3 px-4 py-2.5 font-sans text-xs text-[#1b1c1a] hover:bg-[#f5f3f0] transition-colors text-left"
                          >
                            <span className="material-symbols-outlined text-[16px] text-[#000000]">calendar_month</span>
                            <span>Google Calendar</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleDownloadICS}
                            className="w-full flex items-center gap-3 px-4 py-2.5 font-sans text-xs text-[#1b1c1a] hover:bg-[#f5f3f0] transition-colors text-left"
                          >
                            <span className="material-symbols-outlined text-[16px] text-[#000000]">file_download</span>
                            <span>Apple Calendar (.ics)</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={scrollToReschedule}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#000000] text-[#ffffff] font-sans text-[13px] font-semibold shadow-sm hover:translate-y-[-1px] transition-transform"
                    >
                      <span className="material-symbols-outlined text-[18px]">update</span>
                      <span>Reschedule Slot</span>
                    </button>
                  </div>

                  {/* Muted Cancel Action */}
                  <button
                    type="button"
                    onClick={() => setCancelModalOpen(true)}
                    className="font-sans text-[11px] font-semibold text-[#4d4541] hover:text-[#ba1a1a] transition-colors underline underline-offset-4 uppercase tracking-wider"
                  >
                    Cancel this reservation
                  </button>
                </div>
              </div>

              {/* Studio Location Mini Map Widget */}
              <div className="bg-[#ffffff] rounded-2xl p-6 shadow-sm border border-[#d0c4be]/30 flex flex-col md:flex-row gap-6 items-center">
                <div
                  className="w-full md:w-56 h-36 rounded-xl bg-[#efeeeb] flex-shrink-0 bg-cover bg-center overflow-hidden"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=500&q=80')",
                  }}
                ></div>
                <div className="flex flex-col gap-1 text-left w-full">
                  <span className="font-sans text-[10px] uppercase tracking-wider text-[#825245] font-semibold">
                    Studio Directions
                  </span>
                  <h3 className="font-serif text-[22px] text-[#000000] font-medium">Sanctuary on Fate Road</h3>
                  <p className="font-sans text-[12px] text-[#4d4541] leading-relaxed">
                    Located discreetly opposite the serene palm avenue in GRA. Ample complimentary private parking is available inside the gated sanctuary.
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold text-[#825245] hover:text-[#000000]"
                    >
                      <span>Open in Navigation Maps</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Master Artist Spotlight (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-[#ffffff] rounded-2xl p-8 shadow-sm border border-[#d0c4be]/30 flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <img
                    alt="Mae Adebayo"
                    className="w-28 h-28 rounded-full object-cover shadow-sm ring-2 ring-[#825245]/20"
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80"
                  />
                  <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#ffc0b0] text-[#7a4c3f] flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[14px]">brush</span>
                  </span>
                </div>
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#825245] font-semibold mb-1">
                  Your Master Sculptor
                </span>
                <h3 className="font-serif text-[28px] text-[#000000] font-medium">Mae Adebayo</h3>
                <p className="font-sans text-[12px] text-[#4d4541] mt-2 mb-6 leading-relaxed">
                  Haute manicurist specializing in sculpted Japanese hard gels, minimalist gold foils, and architectural abstract line art.
                </p>
                <div className="w-full bg-[#f5f3f0] p-4 rounded-xl flex items-center justify-between text-left mb-6">
                  <div>
                    <div className="font-sans text-[11px] font-semibold text-[#000000]">Private Client Line</div>
                    <div className="font-sans text-[12px] text-[#4d4541]">Direct WhatsApp Studio Desk</div>
                  </div>
                  <span className="material-symbols-outlined text-[#825245] text-[22px]">chat</span>
                </div>
                <a
                  href={`https://wa.me/2348034567890?text=Hi%20Mae,%20regarding%20my%20appointment%20ref%20%23${
                    appointment?.bookingReference || 'MN-8492'
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#ffc0b0] text-[#7a4c3f] font-sans text-[13px] font-semibold hover:bg-[#ffdbd1] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">forum</span>
                  <span>Message Mae via WhatsApp</span>
                </a>
              </div>

              {/* Quick Protocol Note */}
              <div className="p-6 rounded-2xl bg-[#f5f3f0] shadow-xs border border-[#d0c4be]/20">
                <div className="flex items-center gap-2 font-sans text-[11px] font-semibold text-[#000000] mb-2 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[#825245] text-[18px]">shield</span>
                  <span>No-Login Frictionless Protocol</span>
                </div>
                <p className="font-sans text-[12px] text-[#4d4541] leading-relaxed">
                  This private booking portal stays active on this device. You can bookmark or reopen this URL at any time using your code <strong>#{appointment?.bookingReference || 'MN-8492'}</strong> without entering passwords.
                </p>
              </div>
            </div>
          </section>

          {/* 3. The Instant Rescheduling Experience */}
          <section id="reschedule-section" className="scroll-mt-28 bg-[#ffffff] rounded-2xl sm:rounded-3xl p-8 lg:p-12 shadow-sm border border-[#d0c4be]/30">
            <div className="max-w-3xl mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#efeeeb] font-sans text-[10px] uppercase tracking-wider text-[#825245] font-semibold mb-3">
                <span className="material-symbols-outlined text-[14px]">cached</span>
                <span>Self-Serve Appointment Transfer</span>
              </div>
              <h2 className="font-serif text-[36px] sm:text-[42px] text-[#000000] font-medium leading-tight">
                something came up? no worries. choose another time that works for you.
              </h2>
              <div className="flex items-center gap-2 mt-3 text-[#825245] font-sans text-[13px] font-semibold">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>Zero penalty rescheduling up to 4 hours before your slot.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Slot Picker Module (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Day Switcher */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    { iso: '2026-09-27', display: 'Sunday, September 27' },
                    { iso: '2026-09-28', display: 'Monday, September 28' },
                    { iso: '2026-09-29', display: 'Tuesday, September 29' },
                  ].map((day) => (
                    <button
                      key={day.iso}
                      type="button"
                      onClick={() => {
                        setRescheduleDateISO(day.iso);
                        setRescheduleDateDisplay(day.display);
                      }}
                      className={`px-4 py-2 rounded-full font-sans text-[11px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                        rescheduleDateISO === day.iso
                          ? 'bg-[#000000] text-[#ffffff] shadow-sm'
                          : 'bg-[#f5f3f0] text-[#4d4541] hover:bg-[#efeeeb]'
                      }`}
                    >
                      {day.display.split(',')[0]} · {day.display.split(' ')[1]} {day.display.split(' ')[2]}
                    </button>
                  ))}
                </div>

                {/* Day Slot Container */}
                <div className="p-6 rounded-2xl bg-[#f5f3f0] border border-[#d0c4be]/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#825245] text-[20px]">wb_sunny</span>
                      <span className="font-serif text-[18px] text-[#000000] font-medium">{rescheduleDateDisplay}</span>
                    </div>
                    <span className="font-sans text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#efeeeb] text-[#4d4541]">
                      {rescheduleSlots.length} slots open
                    </span>
                  </div>

                  {rescheduleSlots.length === 0 ? (
                    <p className="font-sans text-xs text-[#4d4541] italic py-2">
                      Studio is closed or fully booked on this day. Please pick another date above.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {rescheduleSlots.map((slot, idx) => {
                        const isSelected = selectedRescheduleSlot?.startTime === slot.startTime;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedRescheduleSlot(slot)}
                            className={`py-3 px-2 rounded-xl text-center font-sans text-[13px] font-semibold transition-all ${
                              isSelected
                                ? 'bg-[#000000] text-[#ffffff] shadow-sm'
                                : 'bg-[#ffffff] text-[#1b1c1a] hover:bg-[#efeeeb]'
                            }`}
                          >
                            <div>{slot.startTimeDisplay}</div>
                            {isSelected && (
                              <span className="block font-sans text-[9px] uppercase tracking-normal opacity-80 mt-0.5">
                                Selected for move
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <p className="font-sans text-[12px] text-[#4d4541] italic">
                  Looking for slots later next week? Reach out via WhatsApp or select custom dates via our concierge chat.
                </p>
              </div>

              {/* Comparison & Commit Card (5 cols) */}
              <div className="lg:col-span-5 bg-[#f5f3f0] rounded-2xl p-8 flex flex-col justify-between h-full border border-[#d0c4be]/30">
                <div>
                  <span className="font-sans text-[11px] uppercase tracking-wider text-[#825245] font-semibold">
                    Schedule Change Preview
                  </span>
                  <h3 className="font-serif text-[22px] text-[#000000] mt-1 mb-6 font-medium">Visual Shift Verification</h3>

                  {/* Current Slot Box */}
                  <div className="p-4 rounded-xl bg-[#ffffff] mb-3 shadow-xs">
                    <span className="font-sans text-[10px] uppercase text-[#7e7570] tracking-wider font-semibold">
                      Current Reserved Slot
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-[#825245] text-[18px]">history</span>
                      <span className="font-serif text-[18px] text-[#1b1c1a] line-through decoration-[#825245]/60 font-medium">
                        {appointment?.dateFormatted?.slice(0, 15) || 'Saturday, Sept 26'} · {appointment?.startTimeDisplay || '4:45 PM'}
                      </span>
                    </div>
                  </div>

                  {/* Animated Transition Direction Indicator */}
                  <div className="flex items-center justify-center my-3">
                    <div className="w-9 h-9 rounded-full bg-[#ffc0b0] text-[#7a4c3f] flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                    </div>
                  </div>

                  {/* Proposed Slot Box */}
                  <div className="p-4 rounded-xl bg-[#000000] text-[#ffffff] shadow-sm mb-6">
                    <span className="font-sans text-[10px] uppercase text-[#878381] tracking-wider font-semibold">
                      Proposed New Slot
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-[#ffdbd1] text-[18px]">verified</span>
                      <span className="font-serif text-[18px] text-[#ffffff] font-medium">
                        {rescheduleDateDisplay.slice(0, 14)} · {selectedRescheduleSlot?.startTimeDisplay || '4:30 PM'}
                      </span>
                    </div>
                    <div className="font-sans text-[12px] text-[#878381] mt-1">
                      Duration: {Math.floor((appointment?.serviceDuration || 150) / 60)}h{' '}
                      {(appointment?.serviceDuration || 150) % 60}m with Mae Adebayo
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleCommitReschedule}
                    disabled={!selectedRescheduleSlot}
                    className="w-full py-4 px-6 rounded-full bg-[#000000] hover:bg-[#4d4541] disabled:opacity-50 text-[#ffffff] font-sans text-[13px] font-semibold tracking-wide shadow-md transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>Confirm New Time ✨</span>
                    <span className="material-symbols-outlined text-[18px] text-[#ffc0b0] group-hover:translate-x-1 transition-transform">
                      east
                    </span>
                  </button>
                  <div className="text-center font-sans text-[12px] text-[#4d4541] mt-3">
                    Instant update · SMS & WhatsApp alert updated right away
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Studio Etiquette & Client Care Guide */}
          <section className="bg-[#ffffff] rounded-2xl sm:rounded-3xl p-8 lg:p-12 shadow-sm border border-[#d0c4be]/30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 pb-6 border-b border-[#efeeeb]">
              <div className="max-w-2xl">
                <span className="font-sans text-[11px] uppercase tracking-wider text-[#825245] font-semibold">
                  The Mae Noir Sanctuary Experience
                </span>
                <h2 className="font-serif text-[32px] sm:text-[36px] text-[#000000] mt-1 font-medium leading-tight">
                  How to prepare for your session at Mae Noir Nails
                </h2>
                <p className="font-sans text-[14px] text-[#4d4541] mt-2 leading-relaxed">
                  We design every appointment as a deliberate oasis of calm, sensory elegance, and meticulous artistic expression.
                </p>
              </div>

              <a
                href={`https://wa.me/2348034567890?text=Hi%20Mae,%20sharing%20my%20nail%20inspo%20for%20appointment%20%23${
                  appointment?.bookingReference || 'MN-8492'
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#efeeeb] text-[#1b1c1a] hover:bg-[#eae8e5] transition-colors font-sans text-[11px] font-semibold uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-[16px] text-[#825245]">photo_camera</span>
                <span>Send Inspiration Photos via WhatsApp</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#f5f3f0] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#ffc0b0]/60 text-[#7a4c3f] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[24px]">local_bar</span>
                  </div>
                  <h3 className="font-serif text-[18px] text-[#000000] font-medium mb-2">Complimentary Refreshments</h3>
                  <p className="font-sans text-[12px] text-[#4d4541] leading-relaxed">
                    Enjoy chilled zobo-hibiscus spritzers with infused mint and lemon, artisanal Kwara roast pour-over, or sparkling elderflower water upon arrival.
                  </p>
                </div>
                <div className="mt-6 font-sans text-[10px] uppercase tracking-wider text-[#825245] font-semibold">
                  Included with all sessions
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#f5f3f0] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#ffc0b0]/60 text-[#7a4c3f] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[24px]">headphones</span>
                  </div>
                  <h3 className="font-serif text-[18px] text-[#000000] font-medium mb-2">Curated Soundscape</h3>
                  <p className="font-sans text-[12px] text-[#4d4541] leading-relaxed">
                    Unwind to ambient neo-soul, low-fi afrobeats, or choose silent-ritual seating if you prefer to read, meditate, or catch up on remote work.
                  </p>
                </div>
                <div className="mt-6 font-sans text-[10px] uppercase tracking-wider text-[#825245] font-semibold">
                  Tailored studio ambience
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#f5f3f0] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#ffc0b0]/60 text-[#7a4c3f] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[24px]">palette</span>
                  </div>
                  <h3 className="font-serif text-[18px] text-[#000000] font-medium mb-2">Art & Palette Consultation</h3>
                  <p className="font-sans text-[12px] text-[#4d4541] leading-relaxed">
                    The first 15 minutes of your slot are reserved for custom color swatch matching and sketch placement before the manicure begins.
                  </p>
                </div>
                <div className="mt-6 font-sans text-[10px] uppercase tracking-wider text-[#825245] font-semibold">
                  Personalized tailoring
                </div>
              </div>
            </div>

            {/* Concierge Direct WhatsApp Banner */}
            <div className="mt-8 p-6 lg:p-8 rounded-2xl bg-[#f5f3f0] flex flex-col md:flex-row items-center justify-between gap-6 border border-[#d0c4be]/20">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-full bg-[#000000] text-[#ffffff] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[24px]">chat_bubble_outline</span>
                </span>
                <div>
                  <div className="font-serif text-[18px] text-[#000000] font-medium">Need to message Mae directly?</div>
                  <div className="font-sans text-[12px] text-[#4d4541]">
                    One-tap direct access with your booking ref <strong className="text-[#000000]">#{appointment?.bookingReference || 'MN-8492'}</strong> pre-attached. Average response time: under 12 minutes.
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/2348034567890?text=Hello%20Mae!%20My%20booking%20is%20%23${
                  appointment?.bookingReference || 'MN-8492'
                }.%20Quick%20question%20about%20my%20session:`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#000000] text-[#ffffff] font-sans text-[13px] font-semibold hover:bg-[#4d4541] transition-colors whitespace-nowrap shadow-sm"
              >
                <span>Direct WhatsApp Concierge</span>
                <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
              </a>
            </div>
          </section>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/40 backdrop-blur-sm">
          <div className="bg-[#ffffff] rounded-2xl p-8 max-w-md w-full shadow-2xl relative border border-[#d0c4be]/40">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#93000a] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[24px]">cancel</span>
            </div>
            <h3 className="font-serif text-[22px] text-[#000000] font-medium mb-2">
              Cancel reservation #{appointment?.bookingReference || 'MN-8492'}?
            </h3>
            <p className="font-sans text-[14px] text-[#4d4541] mb-6 leading-relaxed">
              Are you sure you want to cancel your session on {appointment?.dateFormatted || 'Saturday, September 26'}? You can reschedule to Sunday or next week with zero fees.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="w-full py-3 rounded-full bg-[#ba1a1a] text-[#ffffff] font-sans text-[13px] font-semibold hover:bg-[#93000a] transition-colors"
              >
                Yes, Cancel Reservation
              </button>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="w-full py-3 rounded-full bg-[#efeeeb] font-sans text-[13px] font-semibold text-[#000000] hover:bg-[#eae8e5] transition-colors"
              >
                Keep My Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
