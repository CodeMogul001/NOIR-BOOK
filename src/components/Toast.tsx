/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ToastProps {
  message: string | null;
  icon?: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, icon = 'check_circle', onClose }) => {
  if (!message) return null;

  return (
    <div
      onClick={onClose}
      className="fixed bottom-8 right-8 z-50 transform transition-all duration-300 bg-[#000000] text-[#ffffff] px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 font-sans text-sm cursor-pointer hover:bg-[#1d1b1a]"
    >
      <span className="material-symbols-outlined text-[#ffc0b0] text-[20px]">{icon}</span>
      <span className="font-medium tracking-wide">{message}</span>
    </div>
  );
};
