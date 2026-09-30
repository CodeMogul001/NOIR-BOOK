/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#f5f3f0] border-t border-[#d0c4be]/40 py-12 mt-10">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col gap-1">
          <span className="font-serif text-[22px] font-semibold text-[#000000]">
            Mae Noir Nails
          </span>
          <p className="font-sans text-[12px] text-[#4d4541]">
            Haute atelier nail sculpting & bespoke rituals. Tanke / GRA Sanctuary, Ilorin, Nigeria.
          </p>
        </div>
        <div className="flex items-center gap-6 font-sans text-[11px] font-semibold tracking-wider text-[#4d4541]">
          <span className="text-[#825245]">Bespoke Booking Engine</span>
          <span>·</span>
          <span>Private Client Protocol</span>
          <span>·</span>
          <span>© Mae Noir Atelier</span>
        </div>
      </div>
    </footer>
  );
};
