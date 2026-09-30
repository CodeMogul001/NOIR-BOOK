/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NLParseResult, TimeSlot, Appointment, Service } from '../../types';
import { parseNaturalLanguageRequest, formatDateNice, getNextDayOfWeek } from '../../services/nlpParser';
import { calculateAvailableSlots } from '../../services/availabilityEngine';
import { store, generateBookingReference } from '../../services/store';

interface CustomerBookingFlowProps {
  onNavigateToMyAppointment: (bookingRef: string) => void;
  showToast: (msg: string, icon?: string) => void;
}

export const CustomerBookingFlow: React.FC<CustomerBookingFlowProps> = ({
  onNavigateToMyAppointment,
  showToast,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [promptText, setPromptText] = useState<string>(
    'hi, i want gel nails and toes this saturday. any time after 2pm?'
  );

  // Interpretation state
  const [parsedData, setParsedData] = useState<NLParseResult>(() =>
    parseNaturalLanguageRequest('hi, i want gel nails and toes this saturday. any time after 2pm?')
  );

  // Editing interpretation state
  const [isEditingDetails, setIsEditingDetails] = useState<boolean>(false);

  // Availability state
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [targetDateISO, setTargetDateISO] = useState<string>('2026-09-26');
  const [targetDateDisplay, setTargetDateDisplay] = useState<string>('Saturday, September 26');

  // Form details
  const [guestName, setGuestName] = useState<string>('Adaobi Eze');
  const [guestPhone, setGuestPhone] = useState<string>('+234 803 456 7890');
  const [guestEmail, setGuestEmail] = useState<string>('ada.eze@gmail.com');
  const [guestNotes, setGuestNotes] = useState<string>(
    'First time client, square medium length, prefer nude blush undertones'
  );

  // Form error
  const [formError, setFormError] = useState<string | null>(null);

  // Confirmed booking state
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  const allServices = store.getServices();

  // Run parser whenever prompt changes
  useEffect(() => {
    const res = parseNaturalLanguageRequest(promptText);
    setParsedData(res);
    setTargetDateISO(res.targetDate);
    setTargetDateDisplay(res.targetDateFormatted);
    setIsEditingDetails(false);
  }, [promptText]);

  // Recalculate available slots whenever parsedData or targetDateISO changes
  useEffect(() => {
    const avail = calculateAvailableSlots({
      serviceDuration: parsedData.serviceDuration,
      requestedDate: targetDateISO,
      preferenceWindow: parsedData.preferenceWindow,
      timePreferenceType: parsedData.timePreferenceType,
      minMinutes: parsedData.minMinutes,
      maxMinutes: parsedData.maxMinutes,
      targetMinutes: parsedData.targetMinutes,
      candidateInterval: 15,
    });

    setAvailableSlots(avail.slots);
    if (avail.slots.length > 0) {
      const recommended =
        avail.slots.find((s) => s.badge?.includes('Recommended')) || avail.slots[1] || avail.slots[0];
      setSelectedSlot(recommended);
    } else {
      setSelectedSlot(null);
    }
  }, [parsedData, targetDateISO]);

  const handleSelectDirectService = (service: Service) => {
    const hours = Math.floor(service.duration / 60);
    const mins = service.duration % 60;
    const est = hours > 0 ? (mins > 0 ? `${hours} hours ${mins} minutes` : `${hours} hours`) : `${mins} minutes`;

    setParsedData((prev) => ({
      ...prev,
      isServiceIdentified: true,
      serviceId: service.id,
      serviceName: service.name,
      serviceDuration: service.duration,
      servicePriceNGN: service.priceNGN,
      servicePriceUSD: service.priceUSD,
      estimatedRitualDisplay: est,
      missingPrompt: !prev.isDateIdentified ? 'what day would you like to come in?' : undefined,
    }));
    showToast(`Selected ${service.name}`);
  };

  const handleSelectDirectDate = (dateISO: string, dateDisplay: string, label: string = 'Atelier Session') => {
    setTargetDateISO(dateISO);
    setTargetDateDisplay(dateDisplay);
    setParsedData((prev) => ({
      ...prev,
      isDateIdentified: true,
      targetDate: dateISO,
      targetDateFormatted: dateDisplay,
      dateLabel: label,
      missingPrompt: !prev.isServiceIdentified ? 'what would you like to book?' : undefined,
    }));
    showToast(`Date set to ${dateDisplay}`);
  };

  const handleSelectDirectTimePreference = (
    windowText: string,
    tagText: string,
    type: 'after' | 'around' | 'window' | 'flexible',
    minM?: number,
    maxM?: number,
    targetM?: number
  ) => {
    setParsedData((prev) => ({
      ...prev,
      isTimeIdentified: type !== 'flexible',
      preferenceWindow: windowText,
      preferenceTag: tagText,
      timePreferenceType: type,
      minMinutes: minM,
      maxMinutes: maxM,
      targetMinutes: targetM,
    }));
    showToast(`Preference set to ${windowText}`);
  };

  const handleInterpretClick = () => {
    const res = parseNaturalLanguageRequest(promptText);
    setParsedData(res);
    setTargetDateISO(res.targetDate);
    setTargetDateDisplay(res.targetDateFormatted);
    showToast('Request interpreted ✨', 'auto_awesome');
  };

  const handleDateShift = (direction: 'prev' | 'next') => {
    const parts = targetDateISO.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + (direction === 'next' ? 1 : -1));

    const info = formatDateNice(d);
    setTargetDateISO(info.iso);
    setTargetDateDisplay(info.formatted);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!guestName.trim()) {
      setFormError('Please provide your full name so Mae can prepare your personalized suite.');
      return;
    }

    if (!guestPhone.trim() || guestPhone.replace(/\D/g, '').length < 8) {
      setFormError('Please provide a valid WhatsApp phone number for studio access and directions.');
      return;
    }

    if (!selectedSlot) {
      setFormError('Please select an available start time slot for your appointment.');
      return;
    }

    const bookingRef = generateBookingReference();

    try {
      const newApt = store.createAppointment({
        bookingReference: bookingRef,
        customerName: guestName.trim(),
        phone: guestPhone.trim(),
        email: guestEmail.trim() || undefined,
        notes: guestNotes.trim() || undefined,
        serviceId: parsedData.serviceId,
        serviceName: parsedData.serviceName,
        serviceDuration: parsedData.serviceDuration,
        priceNGN: parsedData.servicePriceNGN,
        priceUSD: parsedData.servicePriceUSD,
        date: targetDateISO,
        dateFormatted: targetDateDisplay,
        startTime: selectedSlot.startTime,
        startTimeDisplay: selectedSlot.startTimeDisplay,
        endTime: selectedSlot.endTime,
        endTimeDisplay: selectedSlot.endTimeDisplay,
        status: 'confirmed',
        paymentStatus: 'transfer_arrival',
        whatsappSent: true,
        confirmationSent: true,
        remindersScheduled: true,
        reminderStatus: 'scheduled',
      });

      setConfirmedBooking(newApt);
      setCurrentStep(3);
      showToast(`Appointment confirmed! Reference #${bookingRef}`, 'verified');
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to confirm appointment. Please choose another slot.';
      setFormError(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-12 flex flex-col gap-12 sm:gap-16">
      {/* Editorial Sub-header & Studio Tag */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#d0c4be]/30">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#825245]"></span>
            <span className="font-sans text-[10px] uppercase tracking-widest text-[#825245] font-semibold">
              Mae Noir Nails · Ilorin, Nigeria
            </span>
          </div>
          <p className="font-serif text-[22px] text-[#000000] tracking-tight italic">
            beautiful appointments, without the back-and-forth.
          </p>
        </div>

        {/* Progressive Flow Stepper */}
        <nav aria-label="Booking Progress" className="flex items-center gap-2 sm:gap-3 bg-[#f5f3f0] p-1.5 rounded-full self-start md:self-auto shadow-sm">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`px-4 py-1.5 rounded-full font-sans text-[11px] font-semibold transition-all duration-300 flex items-center gap-1.5 ${
              currentStep === 1
                ? 'bg-[#000000] text-[#ffffff] shadow-sm'
                : 'text-[#4d4541] hover:text-[#1b1c1a]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentStep === 1 ? 'bg-[#ffdbd1]' : 'bg-transparent'}`}></span>
            <span>01 request</span>
          </button>
          <span className="text-[#d0c4be]/60 font-sans text-[10px]">/</span>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`px-4 py-1.5 rounded-full font-sans text-[11px] font-semibold transition-all duration-300 flex items-center gap-1.5 ${
              currentStep === 2
                ? 'bg-[#000000] text-[#ffffff] shadow-sm'
                : 'text-[#4d4541] hover:text-[#1b1c1a]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentStep === 2 ? 'bg-[#ffdbd1]' : 'bg-transparent'}`}></span>
            <span>02 time & guest</span>
          </button>
          <span className="text-[#d0c4be]/60 font-sans text-[10px]">/</span>
          <button
            type="button"
            onClick={() => {
              if (confirmedBooking) setCurrentStep(3);
            }}
            className={`px-4 py-1.5 rounded-full font-sans text-[11px] font-semibold transition-all duration-300 flex items-center gap-1.5 ${
              currentStep === 3
                ? 'bg-[#000000] text-[#ffffff] shadow-sm'
                : 'text-[#4d4541] hover:text-[#1b1c1a]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentStep === 3 ? 'bg-[#ffdbd1]' : 'bg-transparent'}`}></span>
            <span>03 confirmed</span>
          </button>
        </nav>
      </header>

      {/* Main Editorial Stage */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* LEFT COLUMN: The Primary Booking Journey (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* ================= STEP 1: CONVERSATIONAL NATURAL PROMPT ================= */}
          {currentStep === 1 && (
            <section className="flex flex-col gap-8 transition-all duration-500">
              {/* Hero Title Section */}
              <div className="flex flex-col gap-3">
                <span className="font-sans text-[11px] uppercase tracking-wider text-[#825245] font-semibold">
                  Effortless Guest Scheduling
                </span>
                <h1 className="font-serif text-[40px] sm:text-[46px] text-[#000000] tracking-tight leading-none">
                  your next nail appointment,<br />
                  <span className="italic font-serif text-[#825245]">made easy.</span>
                </h1>
                <p className="font-sans text-[16px] text-[#4d4541] max-w-xl leading-relaxed">
                  Tell us what you're looking for and Mae will effortlessly coordinate a time that suits your flow. Zero accounts, zero friction.
                </p>
              </div>

              {/* Conversational Input Card */}
              <div className="relative bg-[#ffffff] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_-10px_rgba(130,82,69,0.08)] border border-[#825245]/15 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-sans text-[18px] font-semibold text-[#000000]" htmlFor="ai-nl-input">
                    <span className="material-symbols-outlined text-[#825245] material-symbols-filled">auto_awesome</span>
                    <span>Hi! What would you like to book?</span>
                  </label>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffc0b0]/30 text-[#7a4c3f] font-sans text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#825245] animate-ping"></span>
                    AI Concierge Live
                  </span>
                </div>

                {/* Interactive Textarea */}
                <div className="relative group">
                  <textarea
                    id="ai-nl-input"
                    rows={3}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="E.g., I'd love a short BIAB overlay and clean pedi next Friday around 4pm..."
                    className="w-full bg-[#f5f3f0]/70 focus:bg-[#ffffff] text-[#1b1c1a] font-sans text-[16px] rounded-xl sm:rounded-2xl p-4 sm:p-5 outline-none transition-all duration-300 resize-none border border-transparent focus:border-[#825245]/40 shadow-inner"
                  />
                  <div className="absolute bottom-3 right-3 text-[#825245]/60 pointer-events-none">
                    <span className="material-symbols-outlined text-sm">mic</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <span className="font-sans text-[12px] text-[#4d4541] flex items-center gap-1.5">
                    <span className="text-[#825245]">✨</span> you can type it naturally — we'll handle all the details.
                  </span>
                  <button
                    type="button"
                    onClick={handleInterpretClick}
                    className="self-start sm:self-auto px-5 py-2 rounded-full bg-[#000000] text-[#ffffff] hover:bg-[#4d4541] font-sans text-[13px] font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 shadow-sm"
                  >
                    <span>Interpret Request</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>

                {/* Quick Inspiration Pills (including required Test Cases) */}
                <div className="pt-4 border-t border-[#d0c4be]/20 flex flex-col gap-2.5">
                  <span className="font-sans text-[10px] uppercase tracking-wider text-[#7e7570] font-semibold">
                    Quick Inspiration Pills & Scenarios:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPromptText('gel nails tomorrow')}
                      className="px-3.5 py-1.5 rounded-full bg-[#f5f3f0] hover:bg-[#ffc0b0]/40 text-[#4d4541] hover:text-[#7a4c3f] font-sans text-[11px] font-semibold transition-colors"
                    >
                      + gel nails tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptText('can i get gel nails saturday after 2pm?')}
                      className="px-3.5 py-1.5 rounded-full bg-[#f5f3f0] hover:bg-[#ffc0b0]/40 text-[#4d4541] hover:text-[#7a4c3f] font-sans text-[11px] font-semibold transition-colors"
                    >
                      + gel nails sat after 2pm
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptText('i need gel and toes friday evening')}
                      className="px-3.5 py-1.5 rounded-full bg-[#f5f3f0] hover:bg-[#ffc0b0]/40 text-[#4d4541] hover:text-[#7a4c3f] font-sans text-[11px] font-semibold transition-colors"
                    >
                      + gel and toes friday evening
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptText('can i book nail art around 4?')}
                      className="px-3.5 py-1.5 rounded-full bg-[#f5f3f0] hover:bg-[#ffc0b0]/40 text-[#4d4541] hover:text-[#7a4c3f] font-sans text-[11px] font-semibold transition-colors"
                    >
                      + nail art around 4
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptText('toe nails tomorrow afternoon')}
                      className="px-3.5 py-1.5 rounded-full bg-[#f5f3f0] hover:bg-[#ffc0b0]/40 text-[#4d4541] hover:text-[#7a4c3f] font-sans text-[11px] font-semibold transition-colors"
                    >
                      + toes tomorrow afternoon
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptText('gel + toes this saturday')}
                      className="px-3.5 py-1.5 rounded-full bg-[#f5f3f0] hover:bg-[#ffc0b0]/40 text-[#4d4541] hover:text-[#7a4c3f] font-sans text-[11px] font-semibold transition-colors"
                    >
                      + gel + toes this saturday
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptText('do you have anything after 5?')}
                      className="px-3.5 py-1.5 rounded-full bg-[#f5f3f0] hover:bg-[#ffc0b0]/40 text-[#4d4541] hover:text-[#7a4c3f] font-sans text-[11px] font-semibold transition-colors"
                    >
                      + anything after 5?
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptText('i need something for saturday')}
                      className="px-3.5 py-1.5 rounded-full bg-[#f5f3f0] hover:bg-[#ffc0b0]/40 text-[#4d4541] hover:text-[#7a4c3f] font-sans text-[11px] font-semibold transition-colors"
                    >
                      + something for saturday
                    </button>
                  </div>
                </div>
              </div>

              {/* Gentle Clarification Banner for Incomplete / Low-Confidence Requests */}
              {(!parsedData.isServiceIdentified || !parsedData.isDateIdentified) && (
                <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#825245]/20 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-[#825245] font-sans text-[11px] uppercase tracking-wider font-semibold">
                    <span className="material-symbols-outlined text-[18px]">help_outline</span>
                    <span>Gentle Atelier Clarification</span>
                  </div>

                  {!parsedData.isServiceIdentified && (
                    <div className="flex flex-col gap-2">
                      <p className="font-serif text-[18px] text-[#000000] italic">
                        what would you like to book? ✨
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {allServices.map((srv) => (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => handleSelectDirectService(srv)}
                            className="p-3 rounded-xl bg-[#f5f3f0] hover:bg-[#ffc0b0]/30 border border-[#d0c4be]/30 text-left transition-colors flex flex-col justify-between gap-1"
                          >
                            <span className="font-serif text-[14px] text-[#000000] font-medium leading-tight">
                              {srv.name}
                            </span>
                            <span className="font-sans text-[10px] text-[#825245] font-semibold">
                              ₦{srv.priceNGN.toLocaleString()} · {srv.duration}m
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!parsedData.isDateIdentified && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-[#d0c4be]/20">
                      <p className="font-serif text-[18px] text-[#000000] italic">
                        what day would you like to come in? 🗓️
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          {
                            label: 'Tomorrow',
                            iso: formatDateNice(new Date(Date.now() + 86400000)).iso,
                            display: formatDateNice(new Date(Date.now() + 86400000)).formatted,
                          },
                          {
                            label: 'This Saturday',
                            iso: '2026-09-26',
                            display: 'Saturday, September 26',
                          },
                          {
                            label: 'Next Friday',
                            iso: formatDateNice(getNextDayOfWeek(5)).iso,
                            display: formatDateNice(getNextDayOfWeek(5)).formatted,
                          },
                          {
                            label: 'Next Saturday',
                            iso: formatDateNice(getNextDayOfWeek(6)).iso,
                            display: formatDateNice(getNextDayOfWeek(6)).formatted,
                          },
                        ].map((d, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectDirectDate(d.iso, d.display, d.label)}
                            className="px-4 py-2 rounded-full bg-[#f5f3f0] hover:bg-[#ffc0b0]/30 border border-[#d0c4be]/30 text-[#000000] font-sans text-[11px] font-semibold transition-colors"
                          >
                            {d.label} ({d.display.split(',')[0]})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Natural-Language AI Interpretation Card */}
              <div className="bg-[#f5f3f0] rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col gap-6 border border-[#d0c4be]/30">
                <div className="flex items-center justify-between pb-4 border-b border-[#d0c4be]/20">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#ffc0b0] flex items-center justify-center text-[#7a4c3f]">
                      <span className="material-symbols-outlined text-sm material-symbols-filled">check</span>
                    </span>
                    <h3 className="font-serif text-[22px] text-[#000000]">here’s what we understood ✨</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingDetails(!isEditingDetails)}
                    className="font-sans text-[11px] font-semibold text-[#825245] hover:text-[#7a4c3f] underline underline-offset-4 tracking-wider uppercase"
                  >
                    {isEditingDetails ? 'close editor' : 'edit details'}
                  </button>
                </div>

                {/* Structured Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Item 1: Service Breakdown */}
                  <div className="bg-[#ffffff] p-4 rounded-xl flex items-start gap-3.5 shadow-xs border border-[#d0c4be]/20">
                    <div className="p-2 rounded-lg bg-[#efeeeb] text-[#825245]">
                      <span className="material-symbols-outlined text-base">brush</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#7e7570] font-semibold">
                        Service Breakdown
                      </span>
                      {isEditingDetails ? (
                        <div className="mt-2 flex flex-col gap-1.5">
                          <select
                            value={parsedData.serviceId}
                            onChange={(e) => {
                              const s = allServices.find((x) => x.id === e.target.value);
                              if (s) handleSelectDirectService(s);
                            }}
                            className="bg-[#f5f3f0] text-sm font-serif p-2 rounded-lg outline-none border border-[#d0c4be]/40"
                          >
                            {allServices.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} (₦{s.priceNGN.toLocaleString()} · {s.duration}m)
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-serif text-[18px] text-[#000000] font-medium leading-tight">
                              {parsedData.serviceName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-[#ffc0b0]/40 text-[#7a4c3f] font-sans text-[10px] font-semibold">
                              ₦{parsedData.servicePriceNGN.toLocaleString()}
                            </span>
                            <span className="text-[#d0c4be] text-xs">/</span>
                            <span className="font-sans text-[12px] text-[#4d4541]">${parsedData.servicePriceUSD} USD</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Item 2: Target Date */}
                  <div className="bg-[#ffffff] p-4 rounded-xl flex items-start gap-3.5 shadow-xs border border-[#d0c4be]/20">
                    <div className="p-2 rounded-lg bg-[#efeeeb] text-[#825245]">
                      <span className="material-symbols-outlined text-base">calendar_month</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#7e7570] font-semibold">
                        Target Date
                      </span>
                      {isEditingDetails ? (
                        <div className="mt-2 flex flex-col gap-1.5">
                          <input
                            type="date"
                            value={targetDateISO}
                            onChange={(e) => {
                              const parts = e.target.value.split('-').map(Number);
                              if (parts.length === 3) {
                                const d = new Date(parts[0], parts[1] - 1, parts[2]);
                                const info = formatDateNice(d);
                                handleSelectDirectDate(e.target.value, info.formatted);
                              }
                            }}
                            className="bg-[#f5f3f0] text-sm font-sans p-2 rounded-lg outline-none border border-[#d0c4be]/40"
                          />
                        </div>
                      ) : (
                        <>
                          <span className="font-serif text-[18px] text-[#000000] font-medium mt-0.5">
                            {targetDateDisplay}
                          </span>
                          <span className="font-sans text-[12px] text-[#825245] mt-1 font-medium">
                            {parsedData.dateLabel}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Item 3: Preference Window */}
                  <div className="bg-[#ffffff] p-4 rounded-xl flex items-start gap-3.5 shadow-xs border border-[#d0c4be]/20">
                    <div className="p-2 rounded-lg bg-[#efeeeb] text-[#825245]">
                      <span className="material-symbols-outlined text-base">schedule</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#7e7570] font-semibold">
                        Preference Window
                      </span>
                      {isEditingDetails ? (
                        <div className="mt-2 flex flex-col gap-1.5">
                          <select
                            value={parsedData.preferenceWindow}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.includes('After 2:00 PM')) {
                                handleSelectDirectTimePreference(val, 'Late afternoon studio session', 'after', 14 * 60);
                              } else if (val.includes('After 4:00 PM')) {
                                handleSelectDirectTimePreference(val, 'Twilight session', 'after', 16 * 60);
                              } else if (val.includes('After 5:00 PM')) {
                                handleSelectDirectTimePreference(val, 'Late afternoon & twilight session', 'after', 17 * 60);
                              } else if (val.includes('Around 3:00 PM')) {
                                handleSelectDirectTimePreference(val, 'Targeted appointment window', 'around', 14 * 60, 16 * 60 + 30, 15 * 60);
                              } else if (val.includes('Around 4:00 PM')) {
                                handleSelectDirectTimePreference(val, 'Targeted appointment window', 'around', 15 * 60, 17 * 60 + 30, 16 * 60);
                              } else if (val.includes('Morning')) {
                                handleSelectDirectTimePreference(val, 'Serene morning studio slot', 'window', 10 * 60, 13 * 60);
                              } else if (val.includes('Afternoon')) {
                                handleSelectDirectTimePreference(val, 'Mid-afternoon golden hour', 'window', 12 * 60, 17 * 60);
                              } else if (val.includes('Evening')) {
                                handleSelectDirectTimePreference(val, 'Twilight studio session', 'window', 17 * 60, 20 * 60);
                              } else {
                                handleSelectDirectTimePreference(val, 'Open studio availability', 'flexible');
                              }
                            }}
                            className="bg-[#f5f3f0] text-sm font-sans p-2 rounded-lg outline-none border border-[#d0c4be]/40"
                          >
                            <option value="Flexible (Any available time)">Flexible (Any available time)</option>
                            <option value="Morning (10:00 AM – 1:00 PM)">Morning (10:00 AM – 1:00 PM)</option>
                            <option value="Afternoon (12:00 PM – 5:00 PM)">Afternoon (12:00 PM – 5:00 PM)</option>
                            <option value="After 2:00 PM">After 2:00 PM</option>
                            <option value="Around 3:00 PM">Around 3:00 PM</option>
                            <option value="Around 4:00 PM">Around 4:00 PM</option>
                            <option value="After 4:00 PM">After 4:00 PM</option>
                            <option value="After 5:00 PM">After 5:00 PM</option>
                            <option value="Evening (5:00 PM – 8:00 PM)">Evening (5:00 PM – 8:00 PM)</option>
                          </select>
                        </div>
                      ) : (
                        <>
                          <span className="font-serif text-[18px] text-[#000000] font-medium mt-0.5">
                            {parsedData.preferenceWindow}
                          </span>
                          <span className="font-sans text-[12px] text-[#4d4541] mt-1">
                            {parsedData.preferenceTag}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Item 4: Estimated Ritual */}
                  <div className="bg-[#ffffff] p-4 rounded-xl flex items-start gap-3.5 shadow-xs border border-[#d0c4be]/20">
                    <div className="p-2 rounded-lg bg-[#efeeeb] text-[#825245]">
                      <span className="material-symbols-outlined text-base">timelapse</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#7e7570] font-semibold">
                        Estimated Ritual
                      </span>
                      <span className="font-serif text-[18px] text-[#000000] font-medium mt-0.5">
                        {parsedData.estimatedRitualDisplay}
                      </span>
                      <span className="font-sans text-[12px] text-[#4d4541] mt-1">
                        Includes 15-min sanitization buffer
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transition to Step 2 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <p className="font-serif text-[14px] text-[#1b1c1a] italic">
                    perfect. we found {availableSlots.length || 3} times that fit Mae's studio schedule for {targetDateDisplay.split(',')[0]}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(2);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="px-7 py-3 rounded-full bg-[#000000] hover:bg-[#4d4541] text-[#ffffff] font-sans text-[13px] font-semibold tracking-wide transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <span>View Available Times</span>
                    <span className="material-symbols-outlined text-sm">schedule</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ================= STEP 2: AVAILABILITY & GUEST DETAILS ================= */}
          {currentStep === 2 && (
            <section className="flex flex-col gap-8 transition-all duration-500">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 font-sans text-[11px] font-semibold text-[#825245] hover:text-[#000000] transition-colors uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-sm">west</span>
                  <span>Change Request Prompt</span>
                </button>
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#7e7570] font-semibold">
                  Step 2 of 3
                </span>
              </div>

              {/* Slot Selection Container */}
              <div className="bg-[#ffffff] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#825245]/15 shadow-sm flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#d0c4be]/20">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#825245] text-2xl">event_available</span>
                    <div>
                      <h3 className="font-serif text-[22px] text-[#000000] font-medium">{targetDateDisplay}</h3>
                      <p className="font-sans text-[12px] text-[#4d4541]">
                        Mae Noir Sanctuary · Tanke / GRA Line, Ilorin
                      </p>
                    </div>
                  </div>

                  {/* Subtle Date Switcher */}
                  <div className="flex items-center gap-1 bg-[#f5f3f0] px-2 py-1 rounded-full text-[#4d4541]">
                    <button
                      type="button"
                      onClick={() => handleDateShift('prev')}
                      className="p-1 hover:text-[#000000]"
                      title="Previous Day"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <span className="font-sans text-[10px] font-semibold px-2">
                      {targetDateDisplay.slice(0, 11)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDateShift('next')}
                      className="p-1 hover:text-[#000000]"
                      title="Next Day"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>

                {/* Slot Selection Options */}
                <div className="flex flex-col gap-3">
                  <span className="font-sans text-[10px] uppercase tracking-wider text-[#7e7570] font-semibold">
                    Select your preferred start time:
                  </span>

                  {availableSlots.length === 0 ? (
                    <div className="p-6 rounded-xl bg-[#f5f3f0] text-center flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-2xl text-[#825245]">event_busy</span>
                      <p className="font-sans text-sm text-[#4d4541]">
                        No available slots on this date. The studio may be closed or fully booked. Please try another day.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5" id="slots-container">
                      {availableSlots.map((slot, idx) => {
                        const isSelected = selectedSlot?.startTime === slot.startTime;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-4 rounded-xl text-left flex flex-col gap-2 relative transition-all ${
                              isSelected
                                ? 'bg-[#ffc0b0]/30 border border-[#825245] ring-2 ring-[#825245]/20 shadow-sm'
                                : 'bg-[#f5f3f0] hover:bg-[#efeeeb]'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-serif text-[22px] text-[#000000] font-medium">
                                {slot.startTimeDisplay}
                              </span>
                              {isSelected ? (
                                <span className="material-symbols-outlined text-[#825245] text-sm material-symbols-filled">
                                  check_circle
                                </span>
                              ) : (
                                <span className="material-symbols-outlined text-[#d0c4be] text-sm">
                                  radio_button_unchecked
                                </span>
                              )}
                            </div>
                            <span className={`font-sans text-[12px] ${isSelected ? 'text-[#1b1c1a] font-medium' : 'text-[#4d4541]'}`}>
                              Ends at {slot.endTimeDisplay}
                            </span>
                            <span
                              className={`font-sans text-[10px] uppercase tracking-wider ${
                                isSelected ? 'text-[#825245] font-semibold' : 'text-[#735c00]'
                              }`}
                            >
                              {slot.badge || 'Open slot'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 text-[#4d4541] font-sans text-[12px]">
                    <span className="material-symbols-outlined text-sm text-[#825245]">info</span>
                    <span>
                      {parsedData.estimatedRitualDisplay} appointment · includes 15-minute sanitization & hospitality buffer between clients.
                    </span>
                  </div>
                </div>
              </div>

              {/* Guest Details Form (NO ACCOUNT CREATION) */}
              <div className="bg-[#ffffff] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#d0c4be]/30 flex flex-col gap-6 shadow-sm">
                <div className="flex flex-col gap-1.5 pb-4 border-b border-[#d0c4be]/20">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-[22px] text-[#000000] font-medium">almost there ✨</h3>
                    <span className="px-3 py-1 rounded-full bg-[#efeeeb] text-[#4d4541] font-sans text-[10px] font-semibold tracking-wide">
                      No Password Needed
                    </span>
                  </div>
                  <p className="font-sans text-[14px] text-[#4d4541]">
                    We will use your details solely for booking coordination, directions to our Ilorin studio, and WhatsApp confirmation.
                  </p>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-xl bg-[#ffdad6] text-[#93000a] font-sans text-[13px] flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    <span>{formError}</span>
                  </div>
                )}

                {/* The Zero-Account Form Fields */}
                <form className="flex flex-col gap-5" onSubmit={handleConfirmBooking}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name Field */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="font-sans text-[11px] uppercase tracking-wider text-[#1b1c1a] font-semibold"
                        htmlFor="guest-name"
                      >
                        Your Full Name <span className="text-[#825245]">*</span>
                      </label>
                      <input
                        id="guest-name"
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Zainab Alabi"
                        className="w-full bg-[#f5f3f0] focus:bg-[#ffffff] text-[#1b1c1a] font-sans text-[14px] rounded-xl px-4 py-3 outline-none border border-transparent focus:border-[#825245] transition-all shadow-xs"
                      />
                    </div>

                    {/* Phone / WhatsApp Field */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="font-sans text-[11px] uppercase tracking-wider text-[#1b1c1a] font-semibold"
                        htmlFor="guest-phone"
                      >
                        WhatsApp Phone Number <span className="text-[#825245]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="guest-phone"
                          type="tel"
                          required
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="+234 800 000 0000"
                          className="w-full bg-[#f5f3f0] focus:bg-[#ffffff] text-[#1b1c1a] font-sans text-[14px] rounded-xl pl-4 pr-10 py-3 outline-none border border-transparent focus:border-[#825245] transition-all shadow-xs"
                        />
                        <span className="absolute right-3.5 top-3.5 material-symbols-outlined text-[#825245] text-sm">
                          chat
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email Field (Optional) */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="font-sans text-[11px] uppercase tracking-wider text-[#1b1c1a] font-semibold flex items-center justify-between"
                        htmlFor="guest-email"
                      >
                        <span>Email Address</span>
                        <span className="text-[#7e7570] text-[10px] lowercase tracking-normal">(optional for calendar invite)</span>
                      </label>
                      <input
                        id="guest-email"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="adaobi@example.com"
                        className="w-full bg-[#f5f3f0] focus:bg-[#ffffff] text-[#1b1c1a] font-sans text-[14px] rounded-xl px-4 py-3 outline-none border border-transparent focus:border-[#825245] transition-all shadow-xs"
                      />
                    </div>

                    {/* Custom Nail Notes / Inspiration */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="font-sans text-[11px] uppercase tracking-wider text-[#1b1c1a] font-semibold flex items-center justify-between"
                        htmlFor="guest-notes"
                      >
                        <span>Shape & Treatment Notes</span>
                        <span className="text-[#7e7570] text-[10px] lowercase tracking-normal">(optional)</span>
                      </label>
                      <input
                        id="guest-notes"
                        type="text"
                        value={guestNotes}
                        onChange={(e) => setGuestNotes(e.target.value)}
                        placeholder="e.g. almond shape, soak-off needed"
                        className="w-full bg-[#f5f3f0] focus:bg-[#ffffff] text-[#1b1c1a] font-sans text-[14px] rounded-xl px-4 py-3 outline-none border border-transparent focus:border-[#825245] transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Reassurance Banner */}
                  <div className="p-3.5 rounded-xl bg-[#f5f3f0]/60 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#825245] text-lg">shield_with_heart</span>
                    <span className="font-sans text-[12px] text-[#4d4541]">
                      <strong>Zero hassle guarantee:</strong> Mae will send your location pin & appointment details instantly on WhatsApp. No account setup required.
                    </span>
                  </div>

                  {/* Primary CTA Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 px-8 rounded-full bg-[#000000] hover:bg-[#4d4541] text-[#ffffff] font-sans text-[18px] tracking-tight font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group"
                    >
                      <span>Confirm Appointment ✨</span>
                      <span className="material-symbols-outlined text-[#ffc0b0] group-hover:translate-x-1 transition-transform">
                        east
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {/* ================= STEP 3: INSTANT CONFIRMED BOOKING ================= */}
          {currentStep === 3 && (
            <section className="flex flex-col gap-8 transition-all duration-500">
              <div className="bg-[#ffffff] rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-[#825245]/20 shadow-[0_20px_50px_-15px_rgba(130,82,69,0.12)] flex flex-col items-center text-center gap-6 relative overflow-hidden">
                {/* Atmospheric Accent Wash */}
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#ffc0b0]/20 blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#ffe088]/20 blur-3xl pointer-events-none"></div>

                {/* Success Icon Capsule */}
                <div className="w-16 h-16 rounded-full bg-[#ffc0b0]/60 flex items-center justify-center text-[#7a4c3f] shadow-inner">
                  <span className="material-symbols-outlined text-3xl material-symbols-filled">spa</span>
                </div>

                <div className="flex flex-col gap-2 max-w-md">
                  <span className="font-sans text-[10px] uppercase tracking-widest text-[#825245] font-semibold">
                    Booking Confirmed
                  </span>
                  <h2 className="font-serif text-[40px] text-[#000000] leading-tight">you're booked! ✨</h2>
                  <p className="font-sans text-[14px] text-[#4d4541]">
                    We're excited to welcome you,{' '}
                    <strong className="text-[#1b1c1a]">
                      {confirmedBooking?.customerName.split(' ')[0] || guestName.split(' ')[0]}
                    </strong>
                    . Mae has set aside the studio for your ritual.
                  </p>
                </div>

                {/* Luxury Ticket Card */}
                <div className="w-full max-w-lg bg-[#f5f3f0] rounded-2xl p-6 flex flex-col gap-4 text-left border border-[#d0c4be]/30 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#d0c4be]/20">
                    <div className="flex flex-col">
                      <span className="font-sans text-[10px] uppercase text-[#7e7570] tracking-wider font-semibold">
                        Atelier Reference
                      </span>
                      <span className="font-mono text-sm font-semibold text-[#000000]">
                        #{confirmedBooking?.bookingReference || 'MN-8492'}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#ffc0b0]/40 text-[#7a4c3f] font-sans text-[10px] font-semibold">
                      Guest Reservation
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-2">
                    <div>
                      <span className="font-sans text-[10px] uppercase text-[#7e7570] font-semibold">Date & Time</span>
                      <p className="font-serif text-[18px] text-[#000000] font-medium mt-0.5">
                        {confirmedBooking
                          ? `${confirmedBooking.dateFormatted.slice(0, 11)} · ${confirmedBooking.startTimeDisplay} – ${confirmedBooking.endTimeDisplay}`
                          : `${targetDateDisplay.slice(0, 11)} · ${selectedSlot?.startTimeDisplay || '4:45 PM'} – approx. ${parsedData.estimatedRitualDisplay}`}
                      </p>
                    </div>
                    <div>
                      <span className="font-sans text-[10px] uppercase text-[#7e7570] font-semibold">Treatment</span>
                      <p className="font-serif text-[18px] text-[#000000] font-medium mt-0.5">
                        {confirmedBooking?.serviceName || parsedData.serviceName}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#d0c4be]/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#825245] text-base">location_on</span>
                      <span className="font-sans text-[12px] text-[#4d4541]">
                        Mae Noir Sanctuary, Tanke GRA, Ilorin
                      </span>
                    </div>
                    <span className="font-sans text-[18px] font-semibold text-[#000000]">
                      ₦{(confirmedBooking?.priceNGN || parsedData.servicePriceNGN).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Direct Dispatch Notice & Automation Status */}
                <div className="w-full max-w-lg flex flex-col gap-2.5">
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#000000] text-[#ffffff] shadow-sm">
                    <span className="w-7 h-7 rounded-full bg-[#ffc0b0] text-[#7a4c3f] flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="font-sans text-[12px] font-bold tracking-wide uppercase text-[#ffc0b0]">
                        ✓ booking confirmation sent
                      </span>
                      <span className="font-sans text-[12px] text-[#ffffff]/90">
                        {confirmedBooking?.customerName.split(' ')[0] || guestName.split(' ')[0]} · {
                          (confirmedBooking?.serviceName || parsedData.serviceName).includes('Gel') &&
                          (confirmedBooking?.serviceName || parsedData.serviceName).includes('Toe')
                            ? 'Gel + Toes'
                            : (confirmedBooking?.serviceName || parsedData.serviceName).split('·')[0].trim()
                        } (Dispatched via WhatsApp to {confirmedBooking?.phone || guestPhone})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#efeeeb] border border-[#d0c4be]/40 text-[#4d4541]">
                    <span className="material-symbols-outlined text-[#825245] text-[18px] shrink-0">
                      notifications_active
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="font-sans text-[11px] font-semibold text-[#000000]">
                        ✓ 24-hour reminder scheduled
                      </span>
                      <span className="font-sans text-[11px] text-[#7e7570]">
                        Automated 24h & 2h advance check-in queued with seamless 1-tap reschedule.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setConfirmedBooking(null);
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#efeeeb] hover:bg-[#eae8e5] text-[#1b1c1a] font-sans text-[13px] font-semibold tracking-wide transition-colors"
                  >
                    Book Another Service
                  </button>
                  <a
                    href={`https://wa.me/2348034567890?text=Hi%20Mae!%20I%20just%20booked%20appointment%20ref%20%23${
                      confirmedBooking?.bookingReference || 'MN-8492'
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-full bg-[#000000] text-[#ffffff] hover:bg-[#4d4541] font-sans text-[13px] font-semibold tracking-wide transition-all flex items-center gap-2 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-xs">chat</span>
                    <span>Open in WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigateToMyAppointment(confirmedBooking?.bookingReference || 'MN-8492')
                    }
                    className="px-6 py-2.5 rounded-full bg-[#ffc0b0]/40 text-[#7a4c3f] hover:bg-[#ffc0b0]/60 font-sans text-[13px] font-semibold tracking-wide transition-colors"
                  >
                    Manage in My Appointment
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: Atelier Sidebar & Live Visual Proof (4 cols) */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* Atelier Profile Pill */}
          <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#d0c4be]/30 flex flex-col gap-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  alt="Mae Noir"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-[#825245]/20"
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#cca730] rounded-full ring-2 ring-[#fbf9f6]"></span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-[22px] text-[#000000] font-medium leading-tight">Mae Noir</span>
                <span className="font-sans text-[10px] text-[#825245] uppercase tracking-widest font-semibold">
                  Master Sculptor & Artist
                </span>
              </div>
            </div>
            <p className="font-sans text-[12px] text-[#4d4541] leading-relaxed">
              "We prioritize your time and personal calm. Our studio operates strictly one-on-one in Tanke/GRA, with no waiting room crowding."
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-[#d0c4be]/20 font-sans text-[10px] text-[#7e7570] font-semibold">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#825245]">star</span>
                4.98 Rating (124+ clients)
              </span>
              <span>Ilorin, NG</span>
            </div>
          </div>

          {/* Visual Atelier Craft Card */}
          <div className="rounded-2xl overflow-hidden bg-[#ffffff] border border-[#d0c4be]/30 shadow-sm flex flex-col">
            <div className="relative h-44 w-full overflow-hidden">
              <img
                alt="Gel Rituals"
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/60 to-transparent"></div>
              <span className="absolute bottom-3 left-4 font-serif text-[22px] text-[#ffffff] font-medium">
                Gel Rituals
              </span>
            </div>
            <div className="p-4 flex items-center justify-between bg-[#f5f3f0]/50">
              <span className="font-sans text-[12px] text-[#4d4541]">Signature sculpting with organic cuticles</span>
              <span className="font-sans text-[10px] text-[#825245] font-semibold tracking-wider uppercase">
                from ₦12,000
              </span>
            </div>
          </div>

          {/* Studio Sanctuary Capsule */}
          <div className="rounded-2xl p-5 bg-[#ffffff] border border-[#d0c4be]/30 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[10px] uppercase tracking-wider text-[#7e7570] font-semibold">
                Studio Sanctuary
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#ffc0b0]/30 text-[#7a4c3f] font-sans text-[10px] font-semibold">
                Private Residence
              </span>
            </div>
            <p className="font-sans text-[12px] text-[#1b1c1a] leading-relaxed">
              Plot 14, Cedar Grove, off University Road, Tanke GRA, Ilorin, Kwara State.
            </p>
            <div className="flex items-center gap-2 text-[#825245] font-sans text-[10px] font-semibold">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span>Exact gate entry code provided upon WhatsApp confirmation</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Interactive Flow Switcher (Bottom quick-test bar) */}
      <div className="w-full mt-4 p-4 rounded-2xl bg-[#f5f3f0] border border-[#d0c4be]/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[#4d4541] font-sans text-[10px] font-semibold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[#825245] text-sm">tune</span>
          <span>Interactive Flow Preview Switcher:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`px-3.5 py-1.5 rounded-full font-sans text-[10px] font-semibold tracking-wider uppercase transition-colors ${
              currentStep === 1
                ? 'bg-[#000000] text-[#ffffff]'
                : 'bg-[#efeeeb] text-[#1b1c1a] hover:bg-[#eae8e5]'
            }`}
          >
            Step 1: AI Prompt
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`px-3.5 py-1.5 rounded-full font-sans text-[10px] font-semibold tracking-wider uppercase transition-colors ${
              currentStep === 2
                ? 'bg-[#000000] text-[#ffffff]'
                : 'bg-[#efeeeb] text-[#1b1c1a] hover:bg-[#eae8e5]'
            }`}
          >
            Step 2: Times & Guest
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`px-3.5 py-1.5 rounded-full font-sans text-[10px] font-semibold tracking-wider uppercase transition-colors ${
              currentStep === 3
                ? 'bg-[#000000] text-[#ffffff]'
                : 'bg-[#efeeeb] text-[#1b1c1a] hover:bg-[#eae8e5]'
            }`}
          >
            Step 3: Confirmed
          </button>
        </div>
      </div>
    </div>
  );
};
