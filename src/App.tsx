/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, AppView } from './components/Header';
import { Footer } from './components/Footer';
import { CustomerBookingFlow } from './components/CustomerBooking/CustomerBookingFlow';
import { MyAppointmentView } from './components/MyAppointment/MyAppointmentView';
import { OwnerStudioView } from './components/OwnerStudio/OwnerStudioView';
import { Toast } from './components/Toast';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('customer-booking');
  const [targetBookingRef, setTargetBookingRef] = useState<string>('MN-8492');

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIcon, setToastIcon] = useState<string>('check_circle');

  const triggerToast = (msg: string, icon: string = 'check_circle') => {
    setToastMessage(msg);
    setToastIcon(icon);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleNavigateToMyAppointment = (bookingRef: string) => {
    setTargetBookingRef(bookingRef);
    setCurrentView('my-appointment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToBooking = () => {
    setCurrentView('customer-booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] font-sans selection:bg-[#ffc0b0] selection:text-[#7a4c3f] flex flex-col">
      {/* Top Header - hidden in full cockpit owner studio mode or shown consistently */}
      {currentView !== 'owner-studio' && (
        <Header currentView={currentView} onViewChange={setCurrentView} />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${currentView !== 'owner-studio' ? 'pt-28 md:pt-20' : ''}`}>
        {currentView === 'customer-booking' && (
          <CustomerBookingFlow
            onNavigateToMyAppointment={handleNavigateToMyAppointment}
            showToast={triggerToast}
          />
        )}

        {currentView === 'my-appointment' && (
          <MyAppointmentView
            initialBookingRef={targetBookingRef}
            onNavigateToBooking={handleNavigateToBooking}
            showToast={triggerToast}
          />
        )}

        {currentView === 'owner-studio' && (
          <OwnerStudioView
            onNavigateToBooking={handleNavigateToBooking}
            onNavigateToMyAppointment={handleNavigateToMyAppointment}
            showToast={triggerToast}
          />
        )}
      </div>

      {/* Footer for client views */}
      {currentView !== 'owner-studio' && <Footer />}

      {/* Floating Global Toast Notification */}
      <Toast
        message={toastMessage}
        icon={toastIcon}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
