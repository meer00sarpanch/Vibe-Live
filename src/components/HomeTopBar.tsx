import React from 'react';
import { Bell, CheckSquare, Search, X } from 'lucide-react';
import { IMG_HOST_MALE } from '../data/mockData';
import { AppLanguage, CountryInfo } from '../types/mehfil';
import { triggerHaptic } from '../utils/haptics';
import { t } from '../utils/i18n';
import { VibeLiveLogo } from './VibeLiveBrand';

interface HomeTopBarProps {
  coins: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  bellCount: number;
  country: CountryInfo;
  language: AppLanguage;
  unclaimedTasksCount: number;
  onBellClick: () => void;
  onCoinsClick: () => void;
  onAvatarClick: () => void;
  onCountryClick: () => void;
  onTasksClick: () => void;
}

export const HomeTopBar: React.FC<HomeTopBarProps> = ({
  coins,
  searchQuery,
  onSearchChange,
  bellCount,
  country,
  language,
  unclaimedTasksCount,
  onBellClick,
  onCoinsClick,
  onAvatarClick,
  onCountryClick,
  onTasksClick,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#07070D]/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto h-[60px] px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-2.5">
        {/* Left: Vibe Live Logo (Gold V + Vibe White + Live Red Gradient + Blinking Red Dot) */}
        <VibeLiveLogo size="sm" />

        {/* Center: Search Bar */}
        <div className="flex-1 min-w-0 max-w-md relative flex items-center">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white absolute left-2.5 sm:left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t(language, 'search_placeholder')}
            aria-label="Search Live, Hosts, Party"
            className="w-full h-9 pl-8 sm:pl-9 pr-7 rounded-[20px] bg-[#1A1A22] text-white placeholder-[#888888] text-xs sm:text-sm border border-white/10 focus:outline-none focus:border-[#FFD700]/70 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2 text-white/60 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Country + Task + Coins + Bell + Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Country / Language Flag */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onCountryClick();
            }}
            aria-label="Country and Language"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1A1A22] border border-white/10 flex items-center justify-center text-base active:scale-95 transition-transform"
          >
            {country.flag}
          </button>

          {/* Daily Task Icon */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onTasksClick();
            }}
            aria-label="Daily Tasks"
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1A1A22] border border-[#FFD700]/30 flex items-center justify-center active:scale-95 transition-transform"
          >
            <CheckSquare className="w-4 h-4 text-[#FFD700]" />
            {unclaimedTasksCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#07070D]" />
            )}
          </button>

          {/* Spinning Gold Coin + Balance */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onCoinsClick();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#1A1A22] border border-[#FFD700]/30 active:scale-95 transition-transform"
          >
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full gold-gradient flex items-center justify-center text-[10px] font-extrabold text-amber-950 animate-coin-spin shadow-[0_0_8px_rgba(255,215,0,0.6)]">
              $
            </div>
            <span className="text-[13px] sm:text-[15px] font-bold text-[#FFD700] tabular-nums leading-none">
              {coins}
            </span>
          </button>

          {/* Bell Icon White + Red Dot Pulse */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onBellClick();
            }}
            aria-label="Notifications"
            className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#1A1A22] active:scale-95 transition-transform"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white/15" />
            {bellCount > 0 && (
              <>
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
                  {bellCount}
                </span>
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping opacity-75 pointer-events-none" />
              </>
            )}
          </button>

          {/* Mini Avatar 36px + Gold Ring + Green Dot Online */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onAvatarClick();
            }}
            aria-label="My Profile"
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[2px] gold-gradient active:scale-95 transition-transform shrink-0"
          >
            <img
              src={IMG_HOST_MALE}
              alt="BiLAL Shafique"
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover bg-[#1A1A22]"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#07070D]" />
          </button>
        </div>
      </div>

      {/* Bottom Thin Gold Gradient Line 2px Full Width */}
      <div className="gold-line-top" />
    </header>
  );
};
