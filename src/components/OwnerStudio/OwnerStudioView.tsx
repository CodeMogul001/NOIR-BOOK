/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Appointment, Inquiry, Automation, AutomationLog, AutomationEvent } from '../../types';
import { store } from '../../services/store';

interface OwnerStudioViewProps {
  onNavigateToBooking: () => void;
  onNavigateToMyAppointment?: (bookingRef: string) => void;
  showToast: (msg: string, icon?: string) => void;
}

type StudioTab = 'overview' | 'schedule' | 'inquiries' | 'automations';

export const OwnerStudioView: React.FC<OwnerStudioViewProps> = ({
  onNavigateToBooking,
  onNavigateToMyAppointment,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>(() => store.getAppointments());
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => store.getInquiries());
  const [automations, setAutomations] = useState<Automation[]>(() => store.getAutomations());
  const [logs, setLogs] = useState<AutomationLog[]>(() => store.getAutomationLogs());
  const [events, setEvents] = useState<AutomationEvent[]>(() => store.getAutomationEvents());
  const [effort, setEffort] = useState(() => store.calculateEffort());

  // Inquiries filter
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'confirmed' | 'rescheduled' | 'attention' | 'cancelled'>('all');
  const [isAllCaughtUp, setIsAllCaughtUp] = useState(false);
  const [sandboxLog, setSandboxLog] = useState('Ready: listening for inbound webhooks on +234 WhatsApp endpoint...');
  const [editingNote, setEditingNote] = useState(false);
  const [prepNote, setPrepNote] = useState(
    'Adaobi requested organic almond oil soak + almond milk chamomile tea. Prepared in suite.'
  );

  // Reminder simulation modal state
  const [reminderModal, setReminderModal] = useState<{
    isOpen: boolean;
    appointment: Appointment | null;
    previewMessage: string;
    isConfirmedByCustomer: boolean;
  }>({
    isOpen: false,
    appointment: null,
    previewMessage: '',
    isConfirmedByCustomer: false,
  });

  const refreshAllState = () => {
    setAppointments(store.getAppointments());
    setInquiries(store.getInquiries());
    setAutomations(store.getAutomations());
    setLogs(store.getAutomationLogs());
    setEvents(store.getAutomationEvents());
    setEffort(store.calculateEffort());
  };

  // Stats calculation
  const todaySessions = appointments.filter((a) => a.date === '2026-09-26' && a.status !== 'cancelled');
  const finishedSessions = todaySessions.filter((a) => a.status === 'completed').length;
  const remainingSessions = todaySessions.length - finishedSessions;
  const needsReviewCount = inquiries.filter((i) => i.category === 'attention').length;

  const handleCompleteSession = (id: string) => {
    store.updateAppointmentStatus(id, 'completed');
    refreshAllState();
    showToast('Session marked as completed in atelier suite', 'check_circle');
  };

  const handleToggleAutomation = (id: string, name: string) => {
    store.toggleAutomation(id);
    const updated = store.getAutomations();
    setAutomations(updated);
    const item = updated.find((a) => a.id === id);
    showToast(`${name} automation ${item?.enabled ? 'activated' : 'paused'}`, item?.enabled ? 'check_circle' : 'pause_circle');
    setSandboxLog(`CONFIG UPDATE: ${name} pipeline is now ${item?.enabled ? 'ACTIVE' : 'PAUSED'}.`);
  };

  const handleTriggerSimulateReminder = (appointmentId: string) => {
    try {
      const res = store.simulateReminder(appointmentId);
      refreshAllState();
      setReminderModal({
        isOpen: true,
        appointment: res.appointment,
        previewMessage: res.previewMessage,
        isConfirmedByCustomer: false,
      });
      showToast(`24-Hour reminder dispatched to ${res.appointment.customerName.split(' ')[0]} ✨`, 'notifications_active');
      setSandboxLog(`OUTBOUND: Dispatched 24h WhatsApp reminder to ${res.appointment.customerName}. Status changed to SENT.`);
    } catch (err: any) {
      showToast(err.message || 'Error triggering reminder', 'error');
    }
  };

  const handleCustomerConfirmInModal = () => {
    if (!reminderModal.appointment) return;
    store.confirmAppointmentAttendance(reminderModal.appointment.id);
    refreshAllState();
    setReminderModal((prev) => ({ ...prev, isConfirmedByCustomer: true }));
    showToast(`✓ ${reminderModal.appointment.customerName.split(' ')[0]} confirmed appointment attendance via WhatsApp`, 'task_alt');
  };

  const handleCustomerRescheduleInModal = () => {
    if (!reminderModal.appointment) return;
    const ref = reminderModal.appointment.bookingReference;
    setReminderModal((prev) => ({ ...prev, isOpen: false }));
    if (onNavigateToMyAppointment) {
      onNavigateToMyAppointment(ref);
    } else {
      onNavigateToBooking();
    }
    showToast('Switched to customer self-service rescheduling view', 'sync_alt');
  };

  const handleApproveProposal = (inquiryId: string) => {
    store.approveInquiryProposal(inquiryId);
    refreshAllState();
    showToast('Bridal proposal dispatched to Folake Alabi via WhatsApp', 'send');
    setSandboxLog('OUTBOUND: Dispatched Bridal Suite Buyout ₦280k proposal via WhatsApp gateway.');
  };

  const handleDeclineInquiry = (inquiryId: string) => {
    store.dismissInquiry(inquiryId);
    store.addAutomationLog({
      title: 'Polite Decline Sent',
      description: 'Polite solo-studio capacity note sent via WhatsApp. Schedule protected.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: 'check',
      type: 'dispatch',
    });
    refreshAllState();
    showToast('Polite AI Studio Decline sent via WhatsApp', 'check');
    setSandboxLog('OUTBOUND: Polite atelier decline note sent.');
  };

  const handleDismissInquiry = (inquiryId: string) => {
    store.dismissInquiry(inquiryId);
    refreshAllState();
    showToast('Inquiry item archived');
  };

  const handleSimulateWhatsApp = () => {
    setSandboxLog("INBOUND: [WhatsApp] Zainab B: 'hey Mae, do you have space for BIAB refill on Friday afternoon?'");
    showToast('Simulating incoming WhatsApp message...', 'forum');

    setTimeout(() => {
      setSandboxLog("NLP ENGINE: Matched service [BIAB Refill, 1h 45m]. Scanning calendar for Friday 12:00-17:00...");
    }, 1200);

    setTimeout(() => {
      setSandboxLog('OUTBOUND DISPATCHED: Offered Friday 2:15 PM & 4:00 PM. Awaiting client tap.');
      showToast('Client presented with 2 optimal slots (0s owner effort)', 'auto_awesome');
    }, 2400);
  };

  const handleTestSlotExtraction = () => {
    setSandboxLog('DIAGNOSTIC: Running synthetic parser benchmark across 14 studio intents...');
    setTimeout(() => {
      setSandboxLog('PARSER REPORT: 100% precision on nail shape, length, & deposit tokens.');
      showToast('Diagnostic completed: Intent model operating at 99.4% accuracy');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col md:flex-row">
      {/* Left Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-[#f5f3f0] border-r border-[#d0c4be]/30 flex flex-col justify-between pt-6 pb-6 shrink-0">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="px-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center text-[#ffdbd1]">
              <span className="material-symbols-outlined text-[18px]">spa</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-[22px] tracking-tight text-[#000000] font-semibold leading-tight">
                NoirBook
              </span>
              <span className="font-sans text-[10px] uppercase tracking-wider text-[#825245] font-semibold">
                Mae Noir Studio
              </span>
            </div>
          </div>

          {/* Lead Artisan Profile Card */}
          <div className="px-6">
            <div className="p-3 rounded-2xl bg-[#ffffff] border border-[#d0c4be]/40 flex items-center gap-3 shadow-xs">
              <img
                alt="Mae"
                className="w-10 h-10 rounded-full object-cover ring-1 ring-[#825245]/20"
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
              />
              <div className="flex flex-col">
                <span className="font-serif text-[18px] text-[#000000] leading-tight font-medium">Mae</span>
                <span className="font-sans text-[10px] text-[#825245] uppercase font-semibold">Lead Nail Artisan</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-4">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all text-left font-sans text-[13px] ${
                activeTab === 'overview'
                  ? 'bg-[#000000] text-[#ffffff] font-medium shadow-sm'
                  : 'text-[#4d4541] hover:bg-[#eae8e5] hover:text-[#000000]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all text-left font-sans text-[13px] ${
                activeTab === 'schedule'
                  ? 'bg-[#000000] text-[#ffffff] font-medium shadow-sm'
                  : 'text-[#4d4541] hover:bg-[#eae8e5] hover:text-[#000000]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              <span>Smart Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inquiries')}
              className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all text-left font-sans text-[13px] ${
                activeTab === 'inquiries'
                  ? 'bg-[#000000] text-[#ffffff] font-medium shadow-sm'
                  : 'text-[#4d4541] hover:bg-[#eae8e5] hover:text-[#000000]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
              <span>Inquiries & Client Flow</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('automations')}
              className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all text-left font-sans text-[13px] ${
                activeTab === 'automations'
                  ? 'bg-[#000000] text-[#ffffff] font-medium shadow-sm'
                  : 'text-[#4d4541] hover:bg-[#eae8e5] hover:text-[#000000]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">auto_mode</span>
              <span>Automations & Metrics</span>
            </button>
          </nav>
        </div>

        {/* Bottom Guest View Return Button */}
        <div className="px-4 flex flex-col gap-2 border-t border-[#d0c4be]/30 pt-4">
          <button
            type="button"
            onClick={onNavigateToBooking}
            className="flex items-center justify-between px-4 py-2.5 rounded-full bg-[#ffffff] border border-[#d0c4be]/50 text-[#4d4541] hover:text-[#000000] transition-colors"
          >
            <span className="font-sans text-[11px] font-semibold uppercase tracking-wider">Guest Booking View</span>
            <span className="material-symbols-outlined text-[18px]">north_east</span>
          </button>
        </div>
      </aside>

      {/* Main Studio Work Area */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        {/* Top Studio Cockpit Header */}
        <header className="h-20 bg-[#fbf9f6]/85 backdrop-blur-xl border-b border-[#d0c4be]/30 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="font-sans text-[11px] uppercase tracking-widest text-[#825245] font-semibold">
              Mae Noir Nails · Private Atelier Suite
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffc0b0]/40 border border-[#825245]/20 text-[#7a4c3f] font-sans text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#825245] animate-pulse"></span>
              <span>✨ Mae is accepting appointments</span>
            </div>
            <img
              alt="Mae"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-[#d0c4be]/60"
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
            />
          </div>
        </header>

        {/* Workspace Body */}
        <main className="p-6 lg:p-8 flex flex-col gap-8 max-w-[1360px] w-full">
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8">
              {/* Warm Studio Welcome Header */}
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#825245] font-semibold">
                      Atelier Log · Ilorin Studio
                    </span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#825245]"></span>
                    <span className="font-sans text-[10px] tracking-wide text-[#4d4541]">Solo Technician Cockpit</span>
                  </div>
                  <h1 className="font-serif text-[38px] sm:text-[44px] text-[#000000] tracking-tight lowercase">
                    good morning, mae <span className="text-[#cca730] italic">✨</span>
                  </h1>
                  <p className="font-sans text-[14px] text-[#4d4541]">
                    here’s what’s happening with your appointments today.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#efeeeb] shadow-xs text-[#000000]">
                    <span className="material-symbols-outlined text-[18px] text-[#825245]">calendar_today</span>
                    <span className="font-sans text-[11px] font-semibold tracking-wider">Saturday, September 26, 2026</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#ffc0b0]/40 text-[#7a4c3f] font-sans text-[11px] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#825245] animate-pulse"></span>
                    <span>Studio open · {todaySessions.length} booked · 1 reschedule auto-resolved</span>
                  </div>
                </div>
              </header>

              {/* Top Metric KPI Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* KPI 1 */}
                <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#f5f3f0] shadow-xs hover:bg-[#efeeeb] transition-all min-h-[170px] border border-[#d0c4be]/20">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#4d4541] font-semibold">
                      Today's Focus
                    </span>
                    <span className="material-symbols-outlined text-[20px] text-[#825245]">stylus</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-[40px] text-[#000000] leading-none font-medium">
                        {todaySessions.length}
                      </span>
                      <span className="font-sans text-[11px] text-[#825245] font-semibold">sessions</span>
                    </div>
                    <span className="font-sans text-[12px] text-[#4d4541] truncate">
                      {todaySessions.map((s) => s.startTimeDisplay.replace(':00', '').replace(' PM', 'p').replace(' AM', 'a')).join(', ') || 'No active sessions'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#735c00]"></span>
                    <span className="font-sans text-[10px] text-[#4d4541] font-semibold">
                      {finishedSessions} finished · {remainingSessions} remaining
                    </span>
                  </div>
                </div>

                {/* KPI 2 */}
                <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#f5f3f0] shadow-xs hover:bg-[#efeeeb] transition-all min-h-[170px] border border-[#d0c4be]/20">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#4d4541] font-semibold">
                      Inquiry Queue
                    </span>
                    <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">priority_high</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-[40px] text-[#ba1a1a] leading-none font-medium">
                        {needsReviewCount}
                      </span>
                      <span className="font-sans text-[11px] text-[#ba1a1a] font-semibold">needs review</span>
                    </div>
                    <span className="font-sans text-[12px] text-[#4d4541] truncate">5 clients group inquiry</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                    <span className="font-sans text-[10px] text-[#4d4541] font-semibold">Flagged: Exceeds solo slot</span>
                  </div>
                </div>

                {/* KPI 3 */}
                <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#f5f3f0] shadow-xs hover:bg-[#efeeeb] transition-all min-h-[170px] border border-[#d0c4be]/20">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#4d4541] font-semibold">
                      NoirBook AI Flow
                    </span>
                    <span className="material-symbols-outlined text-[20px] text-[#735c00]">auto_mode</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-[40px] text-[#000000] leading-none font-medium">
                        {effort.bookingConversationsCount + effort.reschedulingCount + effort.confirmationsCount}
                      </span>
                      <span className="font-sans text-[11px] text-[#825245] font-semibold">autonomous</span>
                    </div>
                    <span className="font-sans text-[12px] text-[#4d4541]">Handled seamlessly today</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#825245]"></span>
                    <span className="font-sans text-[10px] text-[#4d4541] font-semibold">Zero manual WhatsApp texts</span>
                  </div>
                </div>

                {/* KPI 4 */}
                <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#000000] text-[#ffffff] shadow-md min-h-[170px]">
                  <div className="flex items-center justify-between text-[#d0c4be]">
                    <span className="font-sans text-[10px] uppercase tracking-widest font-semibold">Effort Saved</span>
                    <span className="material-symbols-outlined text-[20px] text-[#ffe088]">hourglass_bottom</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-[40px] text-[#ffffff] leading-none tracking-tight font-medium">
                        {effort.totalHoursDisplay}
                      </span>
                    </div>
                    <span className="font-sans text-[12px] text-[#d0c4be]">saved this week on chat chatter</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[#ffe088]">
                    <span className="material-symbols-outlined text-[15px]">electric_bolt</span>
                    <span className="font-sans text-[10px] tracking-wider font-semibold">
                      +1 extra full gel set capacity
                    </span>
                  </div>
                </div>
              </section>

              {/* Main Workspace Split: Left Timeline, Right Intelligence & Economics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT: Today's Atelier Sessions Timeline (7 cols) */}
                <section className="lg:col-span-7 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-sans text-[10px] uppercase tracking-widest text-[#825245] font-semibold">
                        Curated Schedule
                      </span>
                      <h2 className="font-serif text-[24px] text-[#000000] font-medium">Today's Atelier Sessions</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const adaApt = appointments.find((a) => a.bookingReference === 'MN-8492') || appointments[2];
                          if (adaApt) handleTriggerSimulateReminder(adaApt.id);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-[#ffc0b0]/40 hover:bg-[#ffc0b0]/60 text-[#7a4c3f] font-sans text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                        <span>Simulate Ada's Reminder</span>
                      </button>
                      <span className="px-3 py-1.5 rounded-full bg-[#efeeeb] text-[#000000] font-sans text-[10px] font-semibold uppercase tracking-wider">
                        Filter: All Active
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {todaySessions.map((apt) => {
                      const isCompleted = apt.status === 'completed';
                      const isNext = apt.status === 'confirmed' && apt.startTimeDisplay === '4:45 PM';

                      return (
                        <div
                          key={apt.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            isNext
                              ? 'bg-[#efeeeb] border-[#825245]/30 shadow-md relative overflow-hidden'
                              : 'bg-[#f5f3f0] border-[#d0c4be]/20 shadow-xs'
                          } ${isCompleted ? 'opacity-80 hover:opacity-100' : ''}`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div
                                className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shrink-0 shadow-xs ${
                                  isNext ? 'bg-[#000000] text-[#ffffff]' : 'bg-[#ffffff] text-[#000000]'
                                }`}
                              >
                                <span className="font-sans text-[10px] uppercase font-bold">
                                  {apt.startTimeDisplay.split(' ')[0]}
                                </span>
                                <span className="font-sans text-[11px] opacity-80">
                                  {apt.startTimeDisplay.split(' ')[1]}
                                </span>
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-serif text-[18px] text-[#000000] font-medium">
                                    {apt.customerName}
                                  </span>
                                  {isCompleted && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-[#eae8e5] text-[#4d4541] font-sans text-[10px] font-semibold">
                                      Completed ✓
                                    </span>
                                  )}
                                  {isNext && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-[#ffc0b0] text-[#7a4c3f] font-sans text-[10px] font-semibold">
                                      Confirmed ✨ · Arriving Next
                                    </span>
                                  )}
                                  {apt.reminderStatus === 'sent' && (
                                    <span className="px-2 py-0.5 rounded-full bg-[#efeeeb] text-[#825245] font-sans text-[9px] font-semibold flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[12px]">done_all</span>
                                      <span>Reminder Sent</span>
                                    </span>
                                  )}
                                </div>

                                <span className="font-sans text-[14px] text-[#4d4541]">{apt.serviceName}</span>

                                <div className="flex flex-wrap items-center gap-3 text-[#4d4541] pt-1">
                                  <span className="font-sans text-[12px] flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                    {apt.startTimeDisplay} – {apt.endTimeDisplay} ({apt.serviceDuration}m)
                                  </span>
                                  <span className="font-sans text-[12px] flex items-center gap-1 text-[#825245] font-semibold">
                                    <span className="material-symbols-outlined text-[14px]">payments</span>
                                    ₦{apt.priceNGN.toLocaleString()} ·{' '}
                                    {apt.paymentStatus === 'paid_transfer' ? 'Paid via Transfer' : 'Transfer on Arrival'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                              {/* Simulate reminder control */}
                              {apt.reminderStatus === 'scheduled' ? (
                                <button
                                  type="button"
                                  onClick={() => handleTriggerSimulateReminder(apt.id)}
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#000000] text-[#ffffff] hover:bg-[#4d4541] shadow-xs transition-colors font-sans text-[11px] font-semibold"
                                  title="Dispatch & simulate 24-hour reminder"
                                >
                                  <span className="material-symbols-outlined text-[15px] text-[#ffc0b0]">
                                    notifications_active
                                  </span>
                                  <span>Simulate reminder</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleTriggerSimulateReminder(apt.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#efeeeb] text-[#825245] hover:bg-[#eae8e5] transition-colors font-sans text-[10px] font-semibold"
                                  title="View reminder sent preview"
                                >
                                  <span className="material-symbols-outlined text-[14px]">done_all</span>
                                  <span>Reminder sent</span>
                                </button>
                              )}

                              <a
                                href={`https://wa.me/${apt.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffffff] text-[#000000] hover:bg-[#efeeeb] shadow-xs transition-colors font-sans text-[11px] font-semibold"
                              >
                                <span className="material-symbols-outlined text-[16px] text-[#825245]">chat</span>
                                <span>WhatsApp</span>
                              </a>

                              {!isCompleted && (
                                <button
                                  type="button"
                                  onClick={() => handleCompleteSession(apt.id)}
                                  title="Mark Client In Studio / Completed"
                                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[#000000] text-[#ffffff] hover:bg-[#4d4541] transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">done</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Studio Note Mini-Card */}
                  <div className="p-4 rounded-2xl bg-[#ffffff] shadow-xs border border-[#d0c4be]/30 flex items-center justify-between gap-3 text-[#4d4541]">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-[#825245]">local_florist</span>
                      {editingNote ? (
                        <input
                          type="text"
                          value={prepNote}
                          onChange={(e) => setPrepNote(e.target.value)}
                          onBlur={() => setEditingNote(false)}
                          autoFocus
                          className="font-sans text-[12px] bg-[#f5f3f0] px-3 py-1 rounded-lg outline-none w-full"
                        />
                      ) : (
                        <span className="font-sans text-[12px]">
                          <strong className="text-[#000000] font-semibold">Evening prep note:</strong> {prepNote}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingNote(!editingNote)}
                      className="text-[#825245] font-sans text-[10px] uppercase font-semibold tracking-wider shrink-0 hover:underline"
                    >
                      {editingNote ? 'Save' : 'Edit Notes'}
                    </button>
                  </div>
                </section>

                {/* RIGHT: Intelligence Alert & Economics (5 cols) */}
                <section className="lg:col-span-5 flex flex-col gap-6">
                  {/* Priority Intelligence Alert Card */}
                  {needsReviewCount > 0 ? (
                    <div className="p-6 rounded-2xl bg-[#ffffff] shadow-sm border border-[#d0c4be]/30 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-ping"></span>
                          <span className="font-sans text-[10px] uppercase tracking-widest text-[#ba1a1a] font-semibold">
                            Priority Intelligence Alert
                          </span>
                        </div>
                        <span className="font-sans text-[10px] text-[#4d4541]">14 mins ago via WhatsApp</span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <h3 className="font-serif text-[22px] text-[#000000] font-medium">
                          this request needs your attention
                        </h3>
                        <div className="p-3.5 rounded-xl bg-[#f5f3f0] text-[#000000] italic font-sans text-[13px] border border-[#d0c4be]/20">
                          “hi mae, can 5 of us book bridal nail sessions together this Saturday afternoon?”
                          <span className="block text-right not-italic font-sans text-[11px] text-[#825245] font-semibold mt-1">
                            — Fatima K.
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-[#4d4541] mt-1">
                          <span className="material-symbols-outlined text-[18px] text-[#ba1a1a] shrink-0">info</span>
                          <p className="font-sans text-[12px] leading-relaxed">
                            <strong className="text-[#000000]">Why flagged:</strong> Exceeds your solo studio threshold (1 client at a time). NoirBook paused auto-booking to protect your schedule from overcommitments.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const bridal = inquiries.find((i) => i.category === 'attention');
                            if (bridal) {
                              handleApproveProposal(bridal.id);
                            }
                            showToast('Proposed staggered Saturday & Sunday slots to Fatima K.', 'splitscreen');
                            setSandboxLog('AI ACTION: Dispatched staggered slots draft to Fatima K.');
                          }}
                          className="w-full py-3 px-4 rounded-full bg-[#000000] text-[#ffffff] font-sans text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#4d4541] transition-colors shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[18px]">splitscreen</span>
                          <span>Propose Staggered Slots (AI Draft Ready)</span>
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('inquiries');
                              setInquiryFilter('attention');
                            }}
                            className="py-2.5 px-3 rounded-full bg-[#efeeeb] text-[#000000] font-sans text-[10px] font-semibold uppercase tracking-wider hover:bg-[#eae8e5] transition-colors"
                          >
                            Review Conversation
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const bridal = inquiries.find((i) => i.category === 'attention');
                              if (bridal) {
                                handleDeclineInquiry(bridal.id);
                              }
                            }}
                            className="py-2.5 px-3 rounded-full bg-[#efeeeb] text-[#7a4c3f] font-sans text-[10px] font-semibold uppercase tracking-wider hover:bg-[#ffc0b0]/30 transition-colors"
                          >
                            Polite AI Studio Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-[#ffffff] shadow-sm border border-[#d0c4be]/30 flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-[#735c00]">
                        <span className="material-symbols-outlined text-[20px]">verified</span>
                        <span className="font-sans text-[10px] uppercase tracking-widest font-semibold">Priority Protection Active</span>
                      </div>
                      <h3 className="font-serif text-[22px] text-[#000000] font-medium">all requests handled ✨</h3>
                      <p className="font-sans text-[13px] text-[#4d4541] leading-relaxed">
                        NoirBook is actively protecting your solo atelier schedule. All incoming inquiries have been automatically triaged with 0 pending review alerts.
                      </p>
                    </div>
                  )}

                  {/* Effort Saved Impact Card */}
                  <div className="p-6 rounded-2xl bg-[#f5f3f0] shadow-xs border border-[#d0c4be]/20 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-sans text-[10px] uppercase tracking-widest text-[#825245] font-semibold">
                          Studio Economics
                        </span>
                        <h3 className="font-serif text-[22px] text-[#000000] font-medium">your time, back</h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#ffffff] flex items-center justify-center text-[#825245] shadow-xs">
                        <span className="material-symbols-outlined text-[22px]">timer</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-[40px] text-[#000000] tracking-tight font-medium">
                          {effort.totalHoursDisplay}
                        </span>
                        <span className="font-sans text-[11px] text-[#825245] uppercase font-semibold">reclaimed</span>
                      </div>
                      <p className="font-sans text-[12px] text-[#4d4541] leading-relaxed">
                        Estimated manual work avoided this week through NoirBook natural language booking & self-service.
                      </p>
                    </div>

                    {/* Breakdown Distribution Bar */}
                    <div className="flex flex-col gap-2">
                      <div className="h-3 w-full rounded-full bg-[#eae8e5] overflow-hidden flex">
                        <div
                          className="h-full bg-[#000000]"
                          style={{
                            width: `${Math.round((effort.bookingConversationsMinutes / (effort.totalMinutes || 1)) * 100)}%`,
                          }}
                          title={`Booking conversations (${effort.bookingConversationsMinutes}m)`}
                        ></div>
                        <div
                          className="h-full bg-[#825245]"
                          style={{
                            width: `${Math.round((effort.reschedulingMinutes / (effort.totalMinutes || 1)) * 100)}%`,
                          }}
                          title={`Rescheduling (${effort.reschedulingMinutes}m)`}
                        ></div>
                        <div
                          className="h-full bg-[#cca730]"
                          style={{
                            width: `${Math.round((effort.confirmationsMinutes / (effort.totalMinutes || 1)) * 100)}%`,
                          }}
                          title={`Confirmations (${effort.confirmationsMinutes}m)`}
                        ></div>
                        <div
                          className="h-full bg-[#7e7570]"
                          style={{
                            width: `${Math.round((effort.remindersMinutes / (effort.totalMinutes || 1)) * 100)}%`,
                          }}
                          title={`Reminders (${effort.remindersMinutes}m)`}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between font-sans text-[10px] text-[#4d4541] font-semibold">
                        <span>0h</span>
                        <span>Total: {effort.totalMinutes} minutes saved</span>
                      </div>
                    </div>

                    {/* Detailed List */}
                    <div className="flex flex-col gap-2.5 pt-1">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ffffff] shadow-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#000000] shrink-0"></span>
                          <div className="flex flex-col">
                            <span className="font-sans text-[11px] font-semibold text-[#000000]">Booking conversations</span>
                            <span className="font-sans text-[10px] text-[#4d4541]">
                              {effort.bookingConversationsCount} inquiries auto-booked
                            </span>
                          </div>
                        </div>
                        <span className="font-sans text-[11px] font-semibold text-[#000000]">
                          {effort.bookingConversationsMinutes} min saved
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ffffff] shadow-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#825245] shrink-0"></span>
                          <div className="flex flex-col">
                            <span className="font-sans text-[11px] font-semibold text-[#000000]">Rescheduling self-service</span>
                            <span className="font-sans text-[10px] text-[#4d4541]">No phone calls or back-and-forth</span>
                          </div>
                        </div>
                        <span className="font-sans text-[11px] font-semibold text-[#000000]">
                          {effort.reschedulingMinutes} min saved
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ffffff] shadow-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#cca730] shrink-0"></span>
                          <div className="flex flex-col">
                            <span className="font-sans text-[11px] font-semibold text-[#000000]">Confirmations & Directions</span>
                            <span className="font-sans text-[10px] text-[#4d4541]">Automated studio location pins</span>
                          </div>
                        </div>
                        <span className="font-sans text-[11px] font-semibold text-[#000000]">
                          {effort.confirmationsMinutes} min saved
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ffffff] shadow-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#7e7570] shrink-0"></span>
                          <div className="flex flex-col">
                            <span className="font-sans text-[11px] font-semibold text-[#000000]">Reminders dispatched</span>
                            <span className="font-sans text-[10px] text-[#4d4541]">24h & 2h WhatsApp alerts</span>
                          </div>
                        </div>
                        <span className="font-sans text-[11px] font-semibold text-[#000000]">
                          {effort.remindersMinutes} min saved
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-full bg-[#ffc0b0]/30 text-[#7a4c3f] flex items-center justify-center text-center font-sans text-[11px] font-semibold">
                      <span>✨ Equivalent to 1 additional full gel nail set per week.</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Bottom Visual Archive & Autonomous Activity Log Strip */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* Lookbook */}
                <div className="p-6 rounded-2xl bg-[#f5f3f0] shadow-xs border border-[#d0c4be]/20 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#825245] font-semibold">
                      Inspiration Archive
                    </span>
                    <h4 className="font-serif text-[22px] text-[#000000] font-medium">Active Set Visuals</h4>
                    <p className="font-sans text-[12px] text-[#4d4541]">
                      Adaobi's requested mood: Milky almond glaze with minimal bronze leaf accents.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="overflow-hidden rounded-xl h-36 relative">
                      <img
                        alt="Milky Glaze"
                        className="w-full h-full object-cover"
                        src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=400&q=80"
                      />
                    </div>
                    <div className="overflow-hidden rounded-xl h-36 relative">
                      <img
                        alt="Studio Suite"
                        className="w-full h-full object-cover"
                        src="https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=400&q=80"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[#4d4541] pt-1">
                    <span className="font-sans text-[12px]">Swatches ready at desk</span>
                    <span className="material-symbols-outlined text-[18px] text-[#825245] material-symbols-filled">
                      check_circle
                    </span>
                  </div>
                </div>

                {/* Autonomous Activity Log */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-[#f5f3f0] shadow-xs border border-[#d0c4be]/20 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-sans text-[10px] uppercase tracking-widest text-[#825245] font-semibold">
                        Live System Stream
                      </span>
                      <h4 className="font-serif text-[22px] text-[#000000] font-medium">Recent WhatsApp Automations</h4>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#efeeeb] text-[#4d4541] font-sans text-[10px] font-semibold uppercase tracking-wider">
                      Live Sync Active
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-xl bg-[#ffffff] flex items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#ffc0b0]/40 text-[#7a4c3f] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[16px]">{log.icon}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-sans text-[11px] font-semibold text-[#000000]">{log.title}</span>
                            <span className="font-sans text-[12px] text-[#4d4541]">{log.description}</span>
                          </div>
                        </div>
                        <span className="font-sans text-[10px] text-[#4d4541] font-semibold shrink-0">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ================= TAB 2: SMART SCHEDULE ================= */}
          {activeTab === 'schedule' && (
            <div className="flex flex-col gap-6">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-[10px] uppercase tracking-widest text-[#825245] font-semibold">
                    Studio Atelier Cockpit
                  </span>
                  <h2 className="font-serif text-[32px] text-[#000000] font-medium">Smart Studio Schedule</h2>
                  <p className="font-sans text-[14px] text-[#4d4541]">
                    Every session is padded with a strict 15-minute sanitization & tea hospitality buffer.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-sans text-[11px] font-semibold px-4 py-2 rounded-full bg-[#000000] text-[#ffffff]">
                    Saturday, September 26
                  </span>
                </div>
              </header>

              {/* Day Schedule Visual Timeline */}
              <div className="bg-[#ffffff] rounded-2xl p-6 lg:p-8 border border-[#d0c4be]/30 shadow-xs flex flex-col gap-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#d0c4be]/20">
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#7e7570]">
                    Atelier Timeline (10:00 AM – 8:00 PM)
                  </span>
                  <span className="font-sans text-[11px] text-[#825245] font-semibold">
                    4 sessions · 0 conflicts · 100% solo protocol
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-5 rounded-xl bg-[#f5f3f0] border border-[#d0c4be]/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#000000] text-[#ffffff] flex flex-col items-center justify-center shrink-0">
                          <span className="font-sans text-[10px] font-bold uppercase">{apt.startTimeDisplay}</span>
                          <span className="font-sans text-[9px] opacity-70">to {apt.endTimeDisplay}</span>
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-[18px] text-[#000000] font-medium">{apt.customerName}</span>
                            <span className="font-mono text-[11px] text-[#825245] font-semibold">
                              #{apt.bookingReference}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-sans text-[9px] font-semibold uppercase tracking-wider ${
                                apt.status === 'completed'
                                  ? 'bg-[#eae8e5] text-[#4d4541]'
                                  : apt.status === 'rescheduled'
                                  ? 'bg-[#ffc0b0]/50 text-[#7a4c3f]'
                                  : 'bg-[#ffc0b0] text-[#7a4c3f]'
                              }`}
                            >
                              {apt.status}
                            </span>
                          </div>

                          <span className="font-sans text-[13px] text-[#4d4541] mt-0.5">{apt.serviceName}</span>

                          <div className="flex items-center gap-3 text-xs text-[#7e7570] mt-1.5">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-[#825245]">schedule</span>
                              {apt.serviceDuration} minutes ritual
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-[#735c00]">
                              <span className="material-symbols-outlined text-[14px]">cleaning_services</span>
                              +15m sanitization held
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                        <span className="font-sans text-sm font-semibold text-[#000000]">
                          ₦{apt.priceNGN.toLocaleString()}
                        </span>
                        {apt.reminderStatus === 'scheduled' ? (
                          <button
                            type="button"
                            onClick={() => handleTriggerSimulateReminder(apt.id)}
                            className="px-3 py-1.5 rounded-full bg-[#000000] text-[#ffffff] hover:bg-[#4d4541] font-sans text-[10px] uppercase font-semibold flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <span className="material-symbols-outlined text-[13px] text-[#ffc0b0]">
                              notifications_active
                            </span>
                            <span>Simulate reminder</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleTriggerSimulateReminder(apt.id)}
                            className="px-3 py-1.5 rounded-full bg-[#efeeeb] text-[#825245] hover:bg-[#eae8e5] font-sans text-[10px] uppercase font-semibold flex items-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[13px]">done_all</span>
                            <span>Reminder sent</span>
                          </button>
                        )}
                        <a
                          href={`https://wa.me/${apt.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-[#ffffff] hover:bg-[#efeeeb] text-[#825245] shadow-xs"
                          title="Message on WhatsApp"
                        >
                          <span className="material-symbols-outlined text-[18px]">chat</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: INQUIRIES & CLIENT FLOW ================= */}
          {activeTab === 'inquiries' && (
            <div className="flex flex-col gap-10">
              <header className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                  <div className="flex flex-col gap-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 text-[#825245] font-sans text-[11px] uppercase tracking-widest font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#825245]"></span>
                      <span>Autonomous Client Concierge</span>
                    </div>
                    <h1 className="font-serif text-[38px] text-[#000000] lowercase tracking-tight">
                      inquiries & conversational booking
                    </h1>
                    <p className="font-sans text-[16px] text-[#4d4541] font-light">
                      See how NoirBook understands your clients' natural language messages and manages appointments automatically.
                    </p>
                  </div>

                  <div className="bg-[#f5f3f0] px-5 py-3.5 rounded-2xl flex items-center gap-4 self-start md:self-auto shadow-xs border border-[#d0c4be]/20">
                    <div className="w-10 h-10 rounded-full bg-[#efeeeb] flex items-center justify-center text-[#000000]">
                      <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-[22px] text-[#000000] leading-none font-medium">94.8%</span>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#825245] font-semibold mt-1">
                        Autonomous Resolution Rate
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: `All Conversations (${inquiries.length})` },
                    { id: 'confirmed', label: 'Auto-Confirmed' },
                    { id: 'rescheduled', label: 'Auto-Rescheduled' },
                    { id: 'attention', label: 'Needs Attention', hasDot: true },
                    { id: 'cancelled', label: 'Cancelled' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setInquiryFilter(filter.id as any)}
                      className={`px-5 py-2.5 rounded-full font-sans text-[11px] font-semibold tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-2 ${
                        inquiryFilter === filter.id
                          ? 'bg-[#000000] text-[#ffffff] shadow-sm'
                          : 'bg-[#f5f3f0] text-[#4d4541] hover:bg-[#efeeeb]'
                      }`}
                    >
                      <span>{filter.label}</span>
                      {filter.hasDot && <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse"></span>}
                    </button>
                  ))}
                </div>
              </header>

              {/* Conversational Stream & Sandbox Simulator */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Left: Live Conversation Stream (8 cols) */}
                <section className="xl:col-span-8 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-[22px] text-[#000000] lowercase font-medium">
                        live conversation stream
                      </span>
                      <span className="text-[#825245] font-sans text-[10px] uppercase tracking-wider bg-[#ffc0b0]/40 px-2.5 py-0.5 rounded-full font-semibold">
                        WhatsApp Sync
                      </span>
                    </div>
                    <span className="font-sans text-[10px] text-[#7e7570] uppercase tracking-wider font-semibold">
                      Synced 2m ago
                    </span>
                  </div>

                  {isAllCaughtUp ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-[#ffffff] rounded-3xl shadow-sm border border-[#d0c4be]/30">
                      <div className="w-16 h-16 rounded-full bg-[#ffc0b0]/40 flex items-center justify-center text-[#825245] mb-4">
                        <span className="material-symbols-outlined text-[32px]">done_all</span>
                      </div>
                      <h3 className="font-serif text-[24px] text-[#000000] lowercase font-medium">
                        all conversations resolved
                      </h3>
                      <p className="font-sans text-[14px] text-[#4d4541] max-w-md mt-2">
                        NoirBook is monitoring incoming WhatsApp and Instagram messages. No manual intervention required right now.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAllCaughtUp(false)}
                        className="mt-6 px-6 py-2.5 rounded-full bg-[#000000] text-[#ffffff] font-sans text-[11px] font-semibold tracking-wider uppercase transition-all shadow-sm"
                      >
                        Return to Stream
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      {inquiries
                        .filter((inq) => inquiryFilter === 'all' || inq.category === inquiryFilter)
                        .map((inq) => (
                          <article
                            key={inq.id}
                            className="bg-[#ffffff] rounded-2xl p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col gap-6 relative overflow-hidden border border-[#d0c4be]/30"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#d0c4be]/20">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#ffdbd1] flex items-center justify-center font-serif text-[18px] text-[#321208] font-semibold">
                                  {inq.avatarText}
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-serif text-[18px] text-[#000000] font-medium">
                                      {inq.customerName}
                                    </h3>
                                    {inq.vipTag && (
                                      <span className="font-sans text-[10px] bg-[#efeeeb] px-2 py-0.5 rounded-full text-[#4d4541] font-semibold">
                                        {inq.vipTag}
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-sans text-[10px] text-[#7e7570] uppercase tracking-wider font-semibold">
                                    {inq.customerPhone} · via {inq.channel}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f3f0] text-[#825245] font-sans text-[10px] uppercase tracking-wider font-semibold">
                                  <span className="material-symbols-outlined text-[14px]">timer</span>
                                  {inq.resolutionTime}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-sans text-[10px] uppercase tracking-wider font-semibold ${
                                    inq.category === 'attention'
                                      ? 'bg-[#ffdad6] text-[#93000a]'
                                      : 'bg-[#ffdbd1] text-[#321208]'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {inq.category === 'attention' ? 'error' : 'check'}
                                  </span>
                                  {inq.status}
                                </span>
                              </div>
                            </div>

                            {/* Dialogue Visual Block */}
                            <div className="flex flex-col gap-3.5 bg-[#f5f3f0]/70 rounded-xl p-4 md:p-5">
                              {/* Inbound message */}
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#eae8e5] flex items-center justify-center text-[#7e7570] shrink-0 mt-0.5">
                                  <span className="material-symbols-outlined text-[14px]">chat</span>
                                </div>
                                <div className="flex flex-col gap-1 max-w-xl">
                                  <span className="font-sans text-[10px] text-[#825245] uppercase tracking-widest font-semibold">
                                    Client Inbound
                                  </span>
                                  <p className="font-sans text-[14px] text-[#000000] italic bg-[#ffffff] px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-xs inline-block">
                                    “{inq.inboundMessage}”
                                  </p>
                                </div>
                              </div>

                              {/* AI Orchestration Action */}
                              <div className="flex items-start gap-3 pl-2 md:pl-4">
                                <div className="w-5 h-5 rounded-full bg-[#000000] text-[#ffffff] flex items-center justify-center shrink-0 mt-1">
                                  <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <span className="font-sans text-[10px] text-[#000000] uppercase tracking-widest font-semibold">
                                    NoirBook Intelligence Action
                                  </span>
                                  <p className="font-sans text-[12px] text-[#4d4541] leading-relaxed">
                                    {inq.intelligenceAction}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Action Bar or Schedule Outcome */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                              {inq.scheduleSummary && (
                                <div className="flex flex-wrap items-center gap-3">
                                  {inq.originalSchedule && (
                                    <>
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#efeeeb] text-[#7e7570] line-through font-sans text-[11px]">
                                        {inq.originalSchedule}
                                      </span>
                                      <span className="material-symbols-outlined text-[16px] text-[#825245]">
                                        arrow_forward
                                      </span>
                                    </>
                                  )}
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#efeeeb] text-[#000000] font-sans text-[11px] font-semibold">
                                    <span className="material-symbols-outlined text-[16px] text-[#825245]">
                                      calendar_month
                                    </span>
                                    {inq.scheduleSummary}
                                  </span>
                                  {inq.bookingReference && (
                                    <span className="font-mono text-xs text-[#4d4541]">{inq.bookingReference}</span>
                                  )}
                                </div>
                              )}

                              {inq.category === 'attention' ? (
                                <div className="flex items-center gap-3 ml-auto">
                                  <button
                                    type="button"
                                    onClick={() => handleDismissInquiry(inq.id)}
                                    className="px-4 py-2 rounded-full text-[#4d4541] hover:text-[#000000] font-sans text-[11px] font-semibold tracking-wider uppercase transition-colors"
                                  >
                                    Dismiss
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveProposal(inq.id)}
                                    className="px-5 py-2.5 rounded-full bg-[#000000] text-[#ffffff] hover:bg-[#4d4541] font-sans text-[11px] font-semibold tracking-wider uppercase transition-all flex items-center gap-2 shadow-sm"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">send</span>
                                    <span>Respond via AI Assistant</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="font-sans text-[10px] text-[#825245] uppercase tracking-wider font-semibold ml-auto">
                                  0 Mae intervention
                                </span>
                              )}
                            </div>
                          </article>
                        ))}
                    </div>
                  )}
                </section>

                {/* Right: Interactive Sandbox Simulator & Rules (4 cols) */}
                <aside className="xl:col-span-4 flex flex-col gap-6">
                  {/* Atelier Showcase Card */}
                  <div className="bg-[#ffffff] rounded-2xl p-6 shadow-sm border border-[#d0c4be]/30 flex flex-col gap-5">
                    <div className="relative w-full h-44 rounded-xl overflow-hidden">
                      <img
                        alt="Capacity status"
                        className="w-full h-full object-cover"
                        src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=500&q=80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-3 left-3 text-[#ffffff]">
                        <span className="font-sans text-[10px] uppercase tracking-widest opacity-80 font-semibold">
                          Studio Capacity Status
                        </span>
                        <p className="font-serif text-[18px] leading-tight font-medium">Weekend Slots 85% Booked</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="font-sans text-[10px] text-[#825245] uppercase tracking-widest font-semibold">
                        Autonomous ROI This Month
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-[28px] text-[#000000] leading-none font-medium">19.4 hrs</span>
                        <span className="font-sans text-[12px] text-[#4d4541]">saved from typing messages</span>
                      </div>
                      <div className="w-full bg-[#eae8e5] h-2 rounded-full overflow-hidden mt-2">
                        <div className="bg-[#825245] h-full rounded-full transition-all duration-700" style={{ width: '78%' }}></div>
                      </div>
                      <span className="font-sans text-[10px] text-[#7e7570] font-semibold mt-1">
                        78% of all bookings finalized without Mae picking up her phone
                      </span>
                    </div>
                  </div>

                  {/* Interactive Sandbox Simulator Module */}
                  <div className="bg-[#f5f3f0] rounded-2xl p-6 shadow-xs border border-[#d0c4be]/20 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#825245] text-[20px]">science</span>
                        <h3 className="font-serif text-[20px] text-[#000000] lowercase font-medium">intelligence sandbox</h3>
                      </div>
                      <span className="font-sans text-[10px] bg-[#ffffff] px-2 py-0.5 rounded-full text-[#825245] uppercase font-semibold">
                        Simulator
                      </span>
                    </div>

                    <p className="font-sans text-[12px] text-[#4d4541] leading-relaxed">
                      Preview how NoirBook handles real-time conversational states and Edge triggers.
                    </p>

                    {/* Interactive Control Buttons */}
                    <div className="flex flex-col gap-2.5">
                      <button
                        type="button"
                        onClick={handleSimulateWhatsApp}
                        className="w-full py-3 px-4 rounded-xl bg-[#ffffff] hover:bg-[#efeeeb] text-[#000000] font-sans text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between text-left transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-[#825245]">mark_chat_unread</span>
                          <span>Simulate WhatsApp Inbound</span>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-[#7e7570]">play_arrow</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAllCaughtUp(!isAllCaughtUp)}
                        className="w-full py-3 px-4 rounded-xl bg-[#ffffff] hover:bg-[#efeeeb] text-[#000000] font-sans text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between text-left transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-[#825245]">inbox</span>
                          <span>{isAllCaughtUp ? 'Restore Stream View' : 'Preview All-Caught-Up State'}</span>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-[#7e7570]">
                          {isAllCaughtUp ? 'toggle_on' : 'toggle_off'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleTestSlotExtraction}
                        className="w-full py-3 px-4 rounded-xl bg-[#ffffff] hover:bg-[#efeeeb] text-[#000000] font-sans text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between text-left transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-[#825245]">cognition</span>
                          <span>Test NLP Slot Extraction</span>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-[#7e7570]">autorenew</span>
                      </button>
                    </div>

                    {/* Live Diagnostic Console */}
                    <div className="p-3.5 bg-[#000000] rounded-xl text-[#ffffff] font-mono text-xs flex flex-col gap-1.5 overflow-hidden">
                      <div className="flex items-center justify-between text-[#878381] text-[10px] uppercase tracking-wider">
                        <span>Engine Status</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          ACTIVE
                        </span>
                      </div>
                      <div className="text-xs text-[#ffffff]/90 font-mono leading-relaxed truncate">
                        {sandboxLog}
                      </div>
                    </div>
                  </div>

                  {/* Quick AI Rules Card */}
                  <div className="bg-[#ffffff] rounded-2xl p-6 shadow-sm border border-[#d0c4be]/30 flex flex-col gap-4">
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-[#825245]">
                      Mae's Active Atelier Rules
                    </span>
                    <div className="flex flex-col gap-3 font-sans text-[12px] text-[#4d4541]">
                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[18px] text-[#825245] shrink-0 material-symbols-filled">
                          check_circle
                        </span>
                        <span>15-min sanitization pause auto-injected between clients</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[18px] text-[#825245] shrink-0 material-symbols-filled">
                          check_circle
                        </span>
                        <span>Strict 50% deposit link sent before slot reservation is held</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[18px] text-[#825245] shrink-0 material-symbols-filled">
                          check_circle
                        </span>
                        <span>No Saturday slots offered past 7:30 PM (Atelier rest limit)</span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              {/* Handled for You Automation Section */}
              <section className="flex flex-col gap-8 pt-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-sans text-[11px] uppercase tracking-widest text-[#825245] font-semibold">
                      Quiet Efficiency
                    </span>
                    <h2 className="font-serif text-[28px] text-[#000000] lowercase font-medium">handled for you</h2>
                    <p className="font-sans text-[14px] text-[#4d4541] font-light">
                      noirbook handles the repetitive work so you can focus on your clients.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-[#4d4541] font-sans text-[10px] uppercase tracking-wider font-semibold">
                    <span className="material-symbols-outlined text-[18px] text-[#825245]">verified_user</span>
                    <span>4 Autonomous Engines Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {automations.map((auto) => (
                    <div
                      key={auto.id}
                      className="bg-[#ffffff] rounded-2xl p-6 shadow-sm border border-[#d0c4be]/30 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-[#efeeeb] flex items-center justify-center text-[#000000]">
                            <span className="material-symbols-outlined text-[24px]">{auto.icon}</span>
                          </div>
                          {/* Toggle switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleAutomation(auto.id, auto.name)}
                            className={`w-11 h-6 rounded-full transition-colors relative ${
                              auto.enabled ? 'bg-[#000000]' : 'bg-[#eae8e5]'
                            }`}
                          >
                            <span
                              className={`absolute top-[2px] w-5 h-5 rounded-full bg-[#ffffff] transition-transform ${
                                auto.enabled ? 'left-[22px]' : 'left-[2px]'
                              }`}
                            ></span>
                          </button>
                        </div>
                        <div className="flex flex-col gap-1">
                          <h3 className="font-serif text-[18px] text-[#000000] font-medium">{auto.name}</h3>
                          <p className="font-sans text-[12px] text-[#4d4541] leading-relaxed">{auto.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-3 bg-[#f5f3f0]/50 -mx-6 -mb-6 p-6 rounded-b-2xl border-t border-[#d0c4be]/20">
                        <div className="flex items-baseline justify-between">
                          <span className="font-serif text-[20px] text-[#000000] font-semibold">
                            {auto.metricCount} {auto.metricLabel.split(' ')[0]}
                          </span>
                          <span className="font-sans text-[10px] uppercase text-[#825245] tracking-wider font-semibold">
                            {auto.metricLabel.split(' ').slice(1).join(' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#7e7570] font-sans text-[10px] font-semibold">
                          <span className="material-symbols-outlined text-[14px]">bolt</span>
                          <span>{auto.latencyText}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ================= TAB 4: AUTOMATIONS & METRICS ================= */}
          {activeTab === 'automations' && (
            <div className="flex flex-col gap-8">
              <header className="flex flex-col gap-2">
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#825245] font-semibold">
                  Studio Workflow Engines
                </span>
                <h2 className="font-serif text-[32px] text-[#000000] font-medium">Automations & Impact</h2>
                <p className="font-sans text-[14px] text-[#4d4541]">
                  Configure and monitor the 4 silent background engines powering Mae Noir Nails.
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {automations.map((auto) => (
                  <div
                    key={auto.id}
                    className="p-6 rounded-2xl bg-[#ffffff] border border-[#d0c4be]/30 shadow-sm flex flex-col justify-between gap-5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#f5f3f0] text-[#000000] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[24px]">{auto.icon}</span>
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-serif text-[20px] text-[#000000] font-medium">{auto.name}</h3>
                          <p className="font-sans text-[13px] text-[#4d4541] mt-1 leading-relaxed">
                            {auto.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleAutomation(auto.id, auto.name)}
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                          auto.enabled ? 'bg-[#000000]' : 'bg-[#eae8e5]'
                        }`}
                      >
                        <span
                          className={`absolute top-[2px] w-5 h-5 rounded-full bg-[#ffffff] transition-transform ${
                            auto.enabled ? 'left-[22px]' : 'left-[2px]'
                          }`}
                        ></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#d0c4be]/20 font-sans text-xs">
                      <span className="text-[#825245] font-semibold">{auto.metricCount} {auto.metricLabel}</span>
                      <span className="text-[#7e7570]">{auto.latencyText}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Effort Saved Breakdown & Studio Economics */}
              <section className="flex flex-col gap-6 pt-6 border-t border-[#d0c4be]/30">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#825245] font-semibold">
                      Quantified Studio Impact
                    </span>
                    <h3 className="font-serif text-[26px] text-[#000000] font-medium">Effort Saved Breakdown</h3>
                    <p className="font-sans text-[13px] text-[#4d4541]">
                      Autonomous minutes saved on client chat coordination, self-rescheduling, and reminders.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#000000] text-[#ffffff] font-sans text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-[#ffe088]">hourglass_bottom</span>
                    <span>Total Saved: {effort.totalHoursDisplay}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="p-5 rounded-2xl bg-[#ffffff] border border-[#d0c4be]/30 shadow-xs flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between text-[#825245]">
                      <span className="font-sans text-[10px] uppercase tracking-wider font-semibold">Booking Chat Flow</span>
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-[32px] text-[#000000] font-medium leading-none">
                        {effort.bookingConversationsMinutes}m
                      </span>
                      <span className="font-sans text-[11px] text-[#4d4541] mt-1">
                        {effort.bookingConversationsCount} sessions auto-negotiated
                      </span>
                    </div>
                    <span className="font-sans text-[10px] text-[#7e7570] pt-2 border-t border-[#d0c4be]/20">
                      ~5m saved per conversation
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#ffffff] border border-[#d0c4be]/30 shadow-xs flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between text-[#825245]">
                      <span className="font-sans text-[10px] uppercase tracking-wider font-semibold">Self-Rescheduling</span>
                      <span className="material-symbols-outlined text-[18px]">sync_alt</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-[32px] text-[#000000] font-medium leading-none">
                        {effort.reschedulingMinutes}m
                      </span>
                      <span className="font-sans text-[11px] text-[#4d4541] mt-1">
                        {effort.reschedulingCount} changes self-resolved
                      </span>
                    </div>
                    <span className="font-sans text-[10px] text-[#7e7570] pt-2 border-t border-[#d0c4be]/20">
                      ~6m saved per reschedule
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#ffffff] border border-[#d0c4be]/30 shadow-xs flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between text-[#825245]">
                      <span className="font-sans text-[10px] uppercase tracking-wider font-semibold">Booking Confirmations</span>
                      <span className="material-symbols-outlined text-[18px]">task_alt</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-[32px] text-[#000000] font-medium leading-none">
                        {effort.confirmationsMinutes}m
                      </span>
                      <span className="font-sans text-[11px] text-[#4d4541] mt-1">
                        {effort.confirmationsCount} passes dispatched
                      </span>
                    </div>
                    <span className="font-sans text-[10px] text-[#7e7570] pt-2 border-t border-[#d0c4be]/20">
                      ~2m saved per confirmation
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#ffffff] border border-[#d0c4be]/30 shadow-xs flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between text-[#825245]">
                      <span className="font-sans text-[10px] uppercase tracking-wider font-semibold">Client Reminders</span>
                      <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-[32px] text-[#000000] font-medium leading-none">
                        {effort.remindersMinutes}m
                      </span>
                      <span className="font-sans text-[11px] text-[#4d4541] mt-1">
                        {effort.remindersCount} 24h & 2h reminders
                      </span>
                    </div>
                    <span className="font-sans text-[10px] text-[#7e7570] pt-2 border-t border-[#d0c4be]/20">
                      ~2m saved per reminder
                    </span>
                  </div>
                </div>
              </section>

              {/* Real-time Automation Activity Stream */}
              <section className="flex flex-col gap-5 pt-6 border-t border-[#d0c4be]/30">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#825245] font-semibold">
                      Live Telemetry
                    </span>
                    <h3 className="font-serif text-[26px] text-[#000000] font-medium">Automation Activity Stream</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#efeeeb] text-[#4d4541] font-sans text-[10px] font-semibold uppercase tracking-wider">
                    {events.length} Events Logged
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {events.length === 0 ? (
                    <div className="p-8 text-center bg-[#ffffff] rounded-2xl border border-[#d0c4be]/30 text-[#7e7570] font-sans text-sm">
                      No automation events recorded yet.
                    </div>
                  ) : (
                    events.map((ev) => {
                      const isSent = ev.status === 'sent';
                      const isScheduled = ev.status === 'scheduled';
                      const isCancelled = ev.status === 'cancelled';

                      return (
                        <div
                          key={ev.id}
                          className="p-4 rounded-2xl bg-[#ffffff] border border-[#d0c4be]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#825245]/40 transition-colors"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                ev.type === 'confirmation'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ev.type === 'reschedule'
                                  ? 'bg-[#ffc0b0] text-[#7a4c3f]'
                                  : ev.type === 'cancellation'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-[#efeeeb] text-[#000000]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {ev.type === 'confirmation'
                                  ? 'check_circle'
                                  : ev.type === 'reschedule'
                                  ? 'sync_alt'
                                  : ev.type === 'cancellation'
                                  ? 'cancel'
                                  : 'notifications'}
                              </span>
                            </div>

                            <div className="flex flex-col">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-serif text-[16px] text-[#000000] font-medium">
                                  {ev.customerName}
                                </span>
                                {ev.bookingReference && (
                                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[#f5f3f0] text-[#4d4541]">
                                    #{ev.bookingReference}
                                  </span>
                                )}
                                <span className="font-sans text-[11px] text-[#825245] font-semibold">
                                  · {ev.serviceName}
                                </span>
                              </div>
                              <span className="font-sans text-[12px] text-[#4d4541] mt-0.5">
                                {ev.detail}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                            <span
                              className={`px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 ${
                                isSent
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isScheduled
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              <span>{ev.status}</span>
                            </span>

                            <span className="px-2.5 py-1 rounded-full bg-[#000000] text-[#ffe088] font-sans text-[10px] font-semibold">
                              +{ev.minutesSaved}m saved
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      {/* Realistic Customer Reminder WhatsApp Preview Modal */}
      {reminderModal.isOpen && reminderModal.appointment && (
        <div className="fixed inset-0 z-50 bg-[#000000]/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-3xl max-w-md w-full shadow-2xl border border-[#d0c4be]/40 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#000000] text-[#ffffff] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ffc0b0] text-[#7a4c3f] flex items-center justify-center font-bold text-xs">
                  MN
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-[16px] font-medium text-[#ffffff]">
                    Customer Reminder Dispatch
                  </span>
                  <span className="font-sans text-[10px] text-[#ffc0b0] tracking-wider uppercase font-semibold">
                    WhatsApp Gateway · Live Simulation
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReminderModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-full bg-[#ffffff]/10 hover:bg-[#ffffff]/20 flex items-center justify-center text-[#ffffff] transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Simulated Mobile Chat Screen */}
            <div className="p-6 bg-[#f5f3f0] flex flex-col gap-4">
              <div className="flex items-center justify-center">
                <span className="px-3.5 py-1 rounded-full bg-[#efeeeb] text-[#7e7570] font-sans text-[10px] uppercase tracking-wider font-semibold">
                  Delivered to WhatsApp · {reminderModal.appointment.phone}
                </span>
              </div>

              {/* Message Bubble */}
              <div className="bg-[#ffffff] rounded-2xl rounded-tl-sm p-5 shadow-sm border border-[#d0c4be]/30 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#825245] font-sans text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[16px]">spa</span>
                  <span>Mae Noir Nails · Atelier Reminder</span>
                </div>

                <p className="font-serif text-[17px] text-[#000000] leading-relaxed">
                  "{reminderModal.previewMessage}"
                </p>

                <div className="text-right font-sans text-[10px] text-[#7e7570] flex items-center justify-end gap-1 pt-1">
                  <span>10:00 AM</span>
                  <span className="material-symbols-outlined text-[14px] text-[#825245]">done_all</span>
                </div>

                {/* Customer Interactive Action Buttons */}
                <div className="pt-3 border-t border-[#efeeeb] flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleCustomerConfirmInModal}
                    className="w-full py-3 px-4 rounded-xl bg-[#000000] hover:bg-[#4d4541] text-[#ffffff] font-sans text-[12px] font-semibold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#ffc0b0]">check_circle</span>
                    <span>
                      {reminderModal.isConfirmedByCustomer
                        ? '✓ Confirmed by Guest'
                        : 'Confirm appointment'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCustomerRescheduleInModal}
                    className="w-full py-3 px-4 rounded-xl bg-[#efeeeb] hover:bg-[#eae8e5] text-[#000000] font-sans text-[12px] font-semibold tracking-wide transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#825245]">calendar_month</span>
                    <span>Reschedule</span>
                  </button>
                </div>
              </div>

              {reminderModal.isConfirmedByCustomer && (
                <div className="p-3.5 rounded-xl bg-[#ffc0b0]/40 text-[#7a4c3f] font-sans text-[11px] font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>
                    Guest confirmed! Studio attendance verified on Mae's atelier board.
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#ffffff] border-t border-[#d0c4be]/30 flex items-center justify-between">
              <span className="font-sans text-[11px] text-[#7e7570]">
                Automation Status: <strong className="text-[#000000]">Sent</strong> · 2m saved
              </span>
              <button
                type="button"
                onClick={() => setReminderModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-5 py-2 rounded-full bg-[#efeeeb] text-[#000000] hover:bg-[#eae8e5] font-sans text-[11px] font-semibold uppercase tracking-wider transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
