import React from 'react';
import { Compass, Crown, Home, MessageCircle, User, Video } from 'lucide-react';
import { AppLanguage, MainTab } from '../types/mehfil';
import { triggerHaptic } from '../utils/haptics';
import { t } from '../utils/i18n';

interface BottomBarProps {
  activeTab: MainTab;
  language: AppLanguage;
  onSelectTab: (tab: MainTab) => void;
  onGoLiveClick: () => void;
  unreadChatsCount: number;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  activeTab,
  language,
  onSelectTab,
  onGoLiveClick,
  unreadChatsCount,
}) => {
  const NavButton = ({
    tab,
    label,
    icon: Icon,
    badge,
    dot,
  }: {
    tab: MainTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    dot?: boolean;
  }) => {
    const isActive = activeTab === tab;
    return (
      <button
        type="button"
        onClick={() => {
          triggerHaptic();
          onSelectTab(tab);
        }}
        className="relative flex flex-col items-center justify-center h-full min-w-[44px] active:scale-95 transition-transform group"
      >
        <div className="relative flex items-center justify-center">
          <Icon
            className={`w-6 h-6 transition-all ${
              isActive
                ? 'text-[#FFD700] fill-[#FFD700]/25 drop-shadow-[0_0_8px_rgba(255,215,0,0.85)]'
                : 'text-[#888888] group-hover:text-white/80'
            }`}
          />
          {badge !== undefined && badge > 0 && (
            <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow">
              {badge}
            </span>
          )}
          {dot && (
            <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-[#0B0B10]" />
          )}
        </div>
        <span
          className={`text-[11px] font-semibold mt-0.5 whitespace-nowrap leading-none ${
            isActive ? 'text-[#FFD700]' : 'text-[#888888]'
          }`}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Primary Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 h-[72px] bg-[#0B0B10]/95 backdrop-blur-xl border-t border-[#FFD700]/45 shadow-[0_-8px_28px_rgba(0,0,0,0.65)]"
    >
      <div className="max-w-6xl mx-auto h-full grid grid-cols-6 items-center px-1 sm:px-4">
        <NavButton tab="home" label={t(language, 'nav_home')} icon={Home} />
        <NavButton tab="explore" label={t(language, 'nav_explore')} icon={Compass} />

        {/* Center GO LIVE Button — Size 72px Circle, -12px Up, Gold-to-Orange, White 3px Border, Pulse Ring */}
        <div className="flex items-center justify-center h-full">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(18);
              onGoLiveClick();
            }}
            aria-label="GO LIVE"
            className="relative -translate-y-3 w-[72px] h-[72px] rounded-full gold-gradient border-[3px] border-white flex flex-col items-center justify-center gap-0.5 shadow-[0_0_24px_rgba(255,215,0,0.65)] animate-pulse-gold active:scale-95 transition-transform shrink-0"
          >
            <Video className="w-7 h-7 text-white fill-white/25 drop-shadow" />
            <span className="text-[10px] font-extrabold text-white tracking-wide whitespace-nowrap leading-none">
              {t(language, 'nav_go_live')}
            </span>
          </button>
        </div>

        <NavButton tab="chats" label={t(language, 'nav_chats')} icon={MessageCircle} badge={unreadChatsCount} />
        <NavButton tab="vip" label={t(language, 'nav_vip')} icon={Crown} />
        <NavButton tab="me" label={t(language, 'nav_me')} icon={User} dot />
      </div>
    </nav>
  );
};
