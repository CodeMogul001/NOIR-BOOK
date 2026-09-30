/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type AppView = 'customer-booking' | 'my-appointment' | 'owner-studio';

interface HeaderProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#fbf9f6]/95 backdrop-blur-xl border-b border-[#d0c4be]/30 shadow-[0_1px_8px_rgba(74,69,67,0.03)]">
      <div className="h-16 md:h-20 max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand Logo & Studio Subtitle */}
        <div className="flex items-center gap-4 min-w-max">
          <button
            onClick={() => onViewChange('customer-booking')}
            className="flex items-center gap-3 group text-left transition-opacity hover:opacity-90"
          >
            <div className="w-8 h-8 rounded-full bg-[#1b1c1a] flex items-center justify-center text-[#ffdbd1] shadow-xs">
              <span className="material-symbols-outlined text-[18px]">spa</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-[20px] md:text-[22px] tracking-tight text-[#000000] font-semibold leading-tight">
                NoirBook
              </span>
              <span className="font-sans text-[9px] md:text-[10px] uppercase tracking-wider text-[#825245] font-semibold">
                Mae Noir Nails · Ilorin, NG
              </span>
            </div>
          </button>
        </div>

        {/* Central Segmented Pill Navigation */}
        <nav className="hidden md:flex items-center bg-[#f5f3f0] p-1.5 rounded-full border border-[#d0c4be]/40">
          <button
            onClick={() => onViewChange('customer-booking')}
            className={`px-5 py-2 font-sans text-[13px] font-semibold tracking-wide transition-all duration-200 rounded-full ${
              currentView === 'customer-booking'
                ? 'bg-[#000000] text-[#ffffff] shadow-sm'
                : 'text-[#4d4541] hover:text-[#1b1c1a]'
            }`}
          >
            Customer Booking
          </button>
          <button
            onClick={() => onViewChange('my-appointment')}
            className={`px-5 py-2 font-sans text-[13px] font-semibold tracking-wide transition-all duration-200 rounded-full ${
              currentView === 'my-appointment'
                ? 'bg-[#000000] text-[#ffffff] shadow-sm'
                : 'text-[#4d4541] hover:text-[#1b1c1a]'
            }`}
          >
            My Appointment
          </button>
          <button
            onClick={() => onViewChange('owner-studio')}
            className={`px-5 py-2 font-sans text-[13px] font-semibold tracking-wide transition-all duration-200 rounded-full ${
              currentView === 'owner-studio'
                ? 'bg-[#000000] text-[#ffffff] shadow-sm'
                : 'text-[#4d4541] hover:text-[#1b1c1a]'
            }`}
          >
            Owner Studio
          </button>
        </nav>

        {/* Status Indicator & Lead Artist Avatar */}
        <div className="flex items-center gap-3 min-w-max">
          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffc0b0]/40 border border-[#825245]/20 text-[#7a4c3f] font-sans text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#825245] animate-pulse"></span>
            <span>✨ Mae is accepting appointments</span>
          </div>
          <div className="flex items-center gap-2 pl-1 border-l border-[#d0c4be]/40">
            <div className="relative">
              <img
                alt="Mae Noir"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#d0c4be]/60"
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#cca730] rounded-full ring-2 ring-[#fbf9f6]"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <nav aria-label="Mobile Navigation" className="flex md:hidden items-center justify-around py-2 px-3 bg-[#f5f3f0]/95 border-t border-[#d0c4be]/30 text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => onViewChange('customer-booking')}
          className={`px-3.5 py-1.5 rounded-full transition-colors ${
            currentView === 'customer-booking'
              ? 'bg-[#000000] text-[#ffffff]'
              : 'text-[#4d4541]'
          }`}
        >
          Customer Booking
        </button>
        <button
          type="button"
          onClick={() => onViewChange('my-appointment')}
          className={`px-3.5 py-1.5 rounded-full transition-colors ${
            currentView === 'my-appointment'
              ? 'bg-[#000000] text-[#ffffff]'
              : 'text-[#4d4541]'
          }`}
        >
          My Appointment
        </button>
        <button
          type="button"
          onClick={() => onViewChange('owner-studio')}
          className={`px-3.5 py-1.5 rounded-full transition-colors ${
            currentView === 'owner-studio'
              ? 'bg-[#000000] text-[#ffffff]'
              : 'text-[#4d4541]'
          }`}
        >
          Owner Studio
        </button>
      </nav>
    </header>
  );
};
