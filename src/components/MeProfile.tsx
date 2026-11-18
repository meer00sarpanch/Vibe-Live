import React, { useState } from 'react';
import {
  Award,
  Check,
  CheckSquare,
  ChevronRight,
  Clock,
  Copy,
  Crown,
  DollarSign,
  Gift,
  Globe,
  Hash,
  Headphones,
  Heart,
  HelpCircle,
  Languages,
  LogOut,
  Play,
  QrCode,
  Rocket,
  Settings,
  Share2,
  Shield,
  ShoppingBag,
  Star,
  Target,
  TrendingUp,
  UserPlus,
  Video,
  X,
} from 'lucide-react';
import { IMG_HOST_MALE } from '../data/mockData';
import {
  AppLanguage,
  BirthdayState,
  CountryInfo,
  HostSalaryState,
  ShadiState,
  ShortVideoItem,
  TranslationSettings,
  VipStatus,
} from '../types/mehfil';
import { triggerHaptic } from '../utils/haptics';
import { t } from '../utils/i18n';
import { TreasureSpot } from './LuckyMysteryCoinRainModals';
import { ShadiWeddingCard } from './ShadiCoupleBirthdayModals';

interface MeProfileProps {
  coins: number;
  points: number;
  profilePercent: number;
  vipStatus: VipStatus;
  hostState: HostSalaryState;
  shadi: ShadiState;
  birthdayState: BirthdayState;
  treasureFoundIds: string[];
  country: CountryInfo;
  language: AppLanguage;
  translationSettings: TranslationSettings;
  unclaimedTasksCount: number;
  myVideos: ShortVideoItem[];
  onCompleteProfile: () => void;
  onFirstRecharge: () => void;
  onOpenVipStore: () => void;
  onOpenDailyTasks: () => void;
  onOpenStreamerCenter: () => void;
  onBecomeHost: () => void;
  onOpenPartnerProfile: () => void;
  onOpenCoupleRoom: () => void;
  onOpenMarriedCouples: () => void;
  onOpenBirthdays: () => void;
  onOpenDailyChallenges: () => void;
  onOpenReferralKing: () => void;
  onOpenDailyKings: () => void;
  onOpenLuckyNumber: () => void;
  onRequestDivorce: () => void;
  onCancelDivorce: () => void;
  onCompleteDivorceWait: () => void;
  onSaveBirthDate: (dateStr: string) => void;
  onFindTreasure: (id: string) => void;
  onOpenCountryLanguage: () => void;
  onOpenTranslationSettings: () => void;
  onUpdateTranslationSettings: (next: TranslationSettings) => void;
  onOpenVideo: (video: ShortVideoItem) => void;
  onOpenLogin: () => void;
  onNotify: (msg: string) => void;
}

export const MeProfile: React.FC<MeProfileProps> = ({
  coins,
  points,
  profilePercent,
  vipStatus,
  hostState,
  shadi,
  birthdayState,
  treasureFoundIds,
  country,
  language,
  translationSettings,
  unclaimedTasksCount,
  myVideos,
  onCompleteProfile,
  onFirstRecharge,
  onOpenVipStore,
  onOpenDailyTasks,
  onOpenStreamerCenter,
  onBecomeHost,
  onOpenPartnerProfile,
  onOpenCoupleRoom,
  onOpenMarriedCouples,
  onOpenBirthdays,
  onOpenDailyChallenges,
  onOpenReferralKing,
  onOpenDailyKings,
  onOpenLuckyNumber,
  onRequestDivorce,
  onCancelDivorce,
  onCompleteDivorceWait,
  onSaveBirthDate,
  onFindTreasure,
  onOpenCountryLanguage,
  onOpenTranslationSettings,
  onUpdateTranslationSettings,
  onOpenVideo,
  onOpenLogin,
  onNotify,
}) => {
  const [infoModal, setInfoModal] = useState<{ title: string; body: string } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [polishOpen, setPolishOpen] = useState(false);
  const [bioInput, setBioInput] = useState('Music lover, PK champion & Vibe Live host');
  const [cityInput, setCityInput] = useState('Lahore, Pakistan');
  const [birthDateInput, setBirthDateInput] = useState(birthdayState.myBirthDate);
  const [scanOpen, setScanOpen] = useState(false);

  const copyId = () => {
    triggerHaptic();
    navigator.clipboard?.writeText('123456').catch(() => {});
    onNotify('Vibe Live ID: 123456 Copied!');
  };

  const shareProfile = () => {
    triggerHaptic();
    const shareLink = 'Join me on Vibe Live - http://vibelive.com/@bilal';
    navigator.clipboard?.writeText(shareLink).catch(() => {});
    onNotify(shareLink);
  };

  const vipIcons = [
    { label: 'Reward', icon: Gift, msg: 'Daily VIP login bonus & VIP store privileges.' },
    { label: 'Rank', icon: TrendingUp, msg: vipStatus.level > 0 ? `Active VIP Level ${vipStatus.level} · ${vipStatus.daysLeft} days remaining.` : 'Become VIP to unlock Level 1, Level 2, or SVIP!' },
    { label: 'Store', icon: ShoppingBag, msg: 'Exclusive Gold Entrance Rides & Avatar Frames.' },
    { label: 'Invite $25', icon: UserPlus, msg: 'Invite friends to Vibe Live and earn up to $25.60 reward.' },
    { label: 'Guardian', icon: Shield, msg: vipStatus.hasGuardian ? 'Royal Guardian Badge Active!' : 'Included in SVIP 90 Days plan.' },
    { label: 'Fan Club', icon: Heart, msg: 'Join official host fan clubs for custom badges & perks.' },
    { label: 'Medal Wall', icon: Award, msg: '3 Vibe Live Achievement Medals unlocked.' },
  ];

  const menuRows = [
    { id: 'challenge', label: 'Daily Challenge', icon: Target, bg: 'bg-emerald-600', extra: 'Earn 2,000+c', msg: '' },
    { id: 'referral', label: 'Referral King (Rs 5,000)', icon: UserPlus, bg: 'bg-amber-600', extra: 'Invite & Earn', msg: '' },
    { id: 'dailyking', label: 'Aaj Ka King (Top 10)', icon: Crown, bg: 'bg-yellow-500', extra: 'King Frame', msg: '' },
    { id: 'luckynum', label: 'Lucky Number 5353', icon: Hash, bg: 'bg-cyan-600', extra: '5,000 Coins', msg: '' },
    { id: 'streamer', label: t(language, 'streamer_center'), icon: Video, bg: 'bg-red-500', extra: 'Host Tasks', msg: '' },
    { id: 'couples', label: 'Married Couples', icon: Heart, bg: 'bg-pink-500', extra: shadi.isMarried ? 'Married 💍' : 'Top Couples', msg: '' },
    { id: 'birthdays', label: 'Aaj Ke Birthdays', icon: Gift, bg: 'bg-amber-500', extra: `${birthdayState.birthdaysToday.length} Today 🎂`, msg: '' },
    { id: 'country', label: t(language, 'country_language'), icon: Globe, bg: 'bg-indigo-500', extra: `${country.flag} ${language}`, msg: '' },
    { id: 'builder', label: t(language, 'builder_center'), icon: Rocket, bg: 'bg-blue-500', msg: 'Creator growth tools, PK scheduling & agency analytics.' },
    { id: 'help', label: `${t(language, 'help_center')} 24h`, icon: Headphones, bg: 'bg-emerald-500', extra: '24h', msg: '24/7 Live Vibe Live Support is online and ready to help.' },
    { id: 'history', label: t(language, 'watch_history'), icon: Clock, bg: 'bg-purple-500', msg: 'Recently watched: Ayesha Live, Music Night, Hania Khan.' },
    { id: 'level', label: t(language, 'level_label'), icon: Crown, bg: 'bg-amber-500', msg: 'Current Account Level: Lv.24 · Next Level at 30,000 XP.' },
    { id: 'settings', label: t(language, 'settings_label'), icon: Settings, bg: 'bg-slate-500', extra: translationSettings.autoTranslate ? 'Auto-Translate ON' : 'v1.0', msg: '' },
  ];

  return (
    <div className="min-h-screen bg-[#F2F4FF] text-slate-900 pb-24">
      <div className="gold-line-top" />

      {/* HISSA 16: 1. Top Bar */}
      <header className="sticky top-0 z-30 bg-[#F2F4FF]/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto h-14 px-4 flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-slate-900">{t(language, 'nav_me')}</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={shareProfile}
              aria-label="Share Vibe Live Profile"
              className="w-10 h-10 rounded-full bg-white text-slate-800 shadow-xs border border-slate-200 flex items-center justify-center active:scale-95"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setScanOpen(true)}
              aria-label="Scan QR"
              className="w-10 h-10 rounded-full bg-white text-slate-800 shadow-xs border border-slate-200 flex items-center justify-center active:scale-95"
            >
              <QrCode className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setSettingsOpen(true);
              }}
              aria-label="Settings"
              className="w-10 h-10 rounded-full bg-white text-slate-800 shadow-xs border border-slate-200 flex items-center justify-center active:scale-95"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-3.5 sm:px-4 pt-3 space-y-3">
        {/* 2. Header Card (VIP Crown & Badge ONLY shown when purchased!) */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="relative shrink-0">
            {vipStatus.level > 0 && (
              <Crown className="w-6 h-6 text-[#FFD700] fill-[#FFD700] absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 drop-shadow animate-bounce" />
            )}
            <div
              className={`w-[96px] h-[96px] sm:w-[100px] sm:h-[100px] rounded-full p-1 shadow-md ${
                vipStatus.hasLegendFrame || (vipStatus.equippedFrameLevel || vipStatus.level) >= 50
                  ? 'bg-gradient-to-tr from-red-600 via-[#FFD700] to-rose-500 ring-2 ring-red-400'
                  : vipStatus.hasKingFrame
                    ? 'bg-gradient-to-tr from-[#FFD700] via-amber-400 to-orange-500 ring-2 ring-amber-400'
                    : vipStatus.hasCoupleFrame
                      ? 'bg-gradient-to-tr from-pink-500 via-[#FFD700] to-rose-500 ring-2 ring-pink-400'
                      : vipStatus.hasBirthdayFrame
                        ? 'bg-gradient-to-tr from-amber-400 via-pink-500 to-cyan-400 ring-2 ring-amber-300'
                        : (vipStatus.equippedFrameLevel || vipStatus.level) >= 30
                          ? 'bg-gradient-to-tr from-purple-500 via-fuchsia-400 to-[#FFD700]'
                          : (vipStatus.equippedFrameLevel || vipStatus.level) >= 10
                            ? 'bg-gradient-to-tr from-cyan-400 via-sky-300 to-indigo-500'
                            : vipStatus.level > 0
                              ? 'gold-gradient'
                              : 'bg-slate-200'
              }`}
            >
              <img src={IMG_HOST_MALE} alt="BiLAL Shafique2494" className="w-full h-full rounded-full object-cover" />
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-[19px] sm:text-[20px] font-bold text-slate-900 truncate">
                BiLAL Shafique2494
              </h2>
              <span className="text-base">{country.flag}</span>
              {vipStatus.level > 0 && (
                <span className="px-2 py-0.5 rounded-full gold-gradient text-[11px] font-extrabold text-white shadow-xs">
                  VIP {vipStatus.level}
                </span>
              )}
              {vipStatus.hasGuardian && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] font-extrabold text-white">
                  Guardian
                </span>
              )}
              {vipStatus.hasLegendFrame && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-500 text-[10px] font-extrabold text-white">
                  Legend Frame
                </span>
              )}
              {vipStatus.hasKingBadge && (
                <span className="px-2 py-0.5 rounded-full gold-gradient text-[10px] font-extrabold text-white">
                  Aaj Ka King 👑
                </span>
              )}
              {vipStatus.hasSingingStarBadge && (
                <span className="px-2 py-0.5 rounded-full bg-fuchsia-600 text-[10px] font-extrabold text-white">
                  Singing Star 🎤
                </span>
              )}
              {vipStatus.hasReferralKingBadge && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-[10px] font-extrabold text-white">
                  Referral King 🤝
                </span>
              )}
              {vipStatus.hasCoupleFrame && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-[10px] font-extrabold text-white">
                  Couple Frame 💍
                </span>
              )}
              {vipStatus.hasBirthdayFrame && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-[10px] font-extrabold text-white">
                  Birthday Frame 🎂
                </span>
              )}
              {vipStatus.hasTrueLoveBadge && (
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-[10px] font-extrabold text-white">
                  True Love 💖
                </span>
              )}
              {vipStatus.hasCoinKingBadge && (
                <span className="px-2 py-0.5 rounded-full gold-gradient text-[10px] font-extrabold text-white">
                  Coin King 👑
                </span>
              )}
              {hostState.joined && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-[10px] font-extrabold text-white">
                  {hostState.isFirstMonthFree
                    ? `New Host - 1 Month Free (${hostState.firstMonthDaysLeft}d)`
                    : `Host Lv.${hostState.selectedLevel}`}
                </span>
              )}
            </div>

            {shadi.isMarried && (
              <button
                type="button"
                onClick={onOpenPartnerProfile}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-300 text-pink-700 text-xs font-extrabold active:scale-95"
              >
                <span>💍</span>
                <span>Married To {shadi.partnerHandle}</span>
              </button>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-medium text-slate-500 font-mono-num">Vibe Live ID: 123456</span>
              <button
                type="button"
                onClick={copyId}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold active:scale-95"
              >
                <Copy className="w-3 h-3 text-[#FF8C00]" />
                <span>Copy</span>
              </button>
              <TreasureSpot id="tr-me" foundIds={treasureFoundIds} onFind={onFindTreasure} label="Profile Treasure +200c" />
            </div>
          </div>
        </div>

        {/* HISSA 24: Shadi Wedding Card on Me Profile */}
        {shadi.isMarried && (
          <ShadiWeddingCard
            shadi={shadi}
            onPartnerClick={onOpenPartnerProfile}
            onOpenCoupleRoom={onOpenCoupleRoom}
            onRequestDivorce={onRequestDivorce}
            onCancelDivorce={onCancelDivorce}
            onCompleteDivorceWait={onCompleteDivorceWait}
          />
        )}

        {/* 3. Red Gradient Banner + 4. Progress Bar */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setPolishOpen(true)}
            className="w-full min-h-12 px-3.5 py-2.5 rounded-[12px] bg-gradient-to-r from-[#FF4D4D] to-[#FF8A00] text-white flex items-center justify-between gap-2 text-left shadow-md active:scale-[0.99] transition-transform"
          >
            <p className="text-[12px] font-semibold leading-snug">
              Your profile currently is {profilePercent}% completed. Polishing it up will make it easier to make friends.
            </p>
            <ChevronRight className="w-5 h-5 shrink-0" />
          </button>

          <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Profile {profilePercent}%</span>
              <button
                type="button"
                onClick={() => setPolishOpen(true)}
                className="font-bold text-amber-600 hover:underline"
              >
                {profilePercent >= 100 ? 'Completed (+100 Coins Claimed)' : 'Complete & Get 100 Coins'}
              </button>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                style={{ width: `${profilePercent}%` }}
                className="h-full gold-gradient rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* 5. Stats Row: 4 Boxes */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 0, label: 'Friends' },
            { num: 0, label: 'Following' },
            { num: 1, label: 'Followers' },
            { num: 0, label: 'Visitors' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="h-16 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-100 shadow-xs flex flex-col items-center justify-center"
            >
              <span className="text-[18px] font-bold text-slate-900 tabular-nums leading-tight">{stat.num}</span>
              <span className="text-[11px] font-medium text-slate-500">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* HISSA 17: 1. Coins + Points Row */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onFirstRecharge}
            className="relative h-[76px] px-3.5 rounded-[16px] bg-white border border-amber-200/80 shadow-xs flex items-center justify-between text-left active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-xs font-extrabold text-amber-950 animate-coin-spin shadow">
                $
              </div>
              <div>
                <p className="text-[12px] text-slate-500 font-medium">Coins</p>
                <p className="text-[18px] font-bold text-slate-900 tabular-nums leading-tight">{coins}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Star className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
              <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold whitespace-nowrap">
                First Recharge
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setInfoModal({ title: 'Vibe Live Points', body: 'Earn Points when fans send you gifts during Live & Party streams. Convert Points to Coins or rewards anytime!' })}
            className="h-[76px] px-3.5 rounded-[16px] bg-white border border-pink-100 shadow-xs flex items-center justify-between text-left active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[12px] text-slate-500 font-medium">Points</p>
                <p className="text-[18px] font-bold text-slate-900 tabular-nums leading-tight">{points}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* 2. VIP Card Black Gold Border -> Opens HISSA 21 VIP Buy Page */}
        <div className="rounded-[20px] bg-[#0B0B10] border-2 border-[#FFD700] p-3.5 space-y-3 shadow-lg">
          <div
            onClick={onOpenVipStore}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onOpenVipStore()}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Crown className="w-7 h-7 text-[#FFD700] fill-[#FFD700] shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[20px] font-extrabold text-[#FFD700] leading-none">VIP</span>
                  {vipStatus.level === 0 ? (
                    <span className="text-[12px] text-[#9CA3AF] font-medium">You Are Not VIP Yet</span>
                  ) : (
                    <span className="text-[12px] text-emerald-400 font-bold">
                      VIP Level {vipStatus.level} · {vipStatus.daysLeft} Days Left
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenVipStore();
              }}
              className="px-3.5 py-1.5 rounded-full gold-gradient text-white text-xs font-extrabold shrink-0 active:scale-95 shadow"
            >
              {vipStatus.level === 0 ? 'Become VIP' : 'Upgrade'}
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 pt-1">
            {vipIcons.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onOpenVipStore()}
                  className="flex flex-col items-center gap-1 active:scale-95"
                >
                  <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-white shadow">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-medium text-white/90 text-center leading-tight line-clamp-1">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* HISSA 22: Daily Tasks Quick Card */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onOpenDailyTasks();
          }}
          className="w-full h-[64px] px-4 rounded-2xl bg-white border border-amber-200 shadow-xs flex items-center justify-between gap-3 active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gold-gradient text-white flex items-center justify-center shadow">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">{t(language, 'daily_tasks')} &amp; Free Coins</p>
              <p className="text-xs text-slate-500">Complete tasks + Bonus 50 Coins Chest</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {unclaimedTasksCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold">
                {unclaimedTasksCount} Ready
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </button>

        {/* HISSA 22 FINAL: Become Host Gold Button (0 Rs Fee · 1 Month Free) / Host Salary Card */}
        {!hostState.joined ? (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              onBecomeHost();
            }}
            className="w-full p-4 rounded-2xl gold-gradient text-white shadow-lg gold-glow flex items-center justify-between gap-3 active:scale-[0.99] transition-transform text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-black/25 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-black text-white">Become Host</p>
                <p className="text-xs font-bold text-amber-950/90">
                  0 Rs Joining Fee · 1 Month Free · Earn up to Rs. 1,200/Day + 60% Gift
                </p>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-black/30 text-white text-xs font-extrabold shrink-0">
              Join Free
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onOpenStreamerCenter();
            }}
            className="w-full p-3.5 rounded-2xl bg-[#0D0D15] border-2 border-[#FFD700]/75 text-white shadow-md flex items-center justify-between gap-3 active:scale-[0.99] transition-transform text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-extrabold text-[#FFD700]">Host Salary Dashboard</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    New Host - 1 Month Free
                  </span>
                </div>
                <p className="text-[11px] text-white/75 mt-0.5 truncate">
                  Salary Wallet: Rs. {hostState.salaryWalletPkr.toLocaleString()} · Gift Wallet: Rs.{' '}
                  {hostState.giftWalletPkr.toLocaleString()}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#FFD700] shrink-0" />
          </button>
        )}

        {/* 3. Banner: Host Quit Agency Policy Purple */}
        <div className="h-[60px] px-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] flex items-center justify-between gap-3 shadow-md">
          <span className="text-sm sm:text-base font-bold text-white truncate">Host Quit Agency Policy</span>
          <button
            type="button"
            onClick={() =>
              setInfoModal({
                title: 'Host Quit Agency Policy',
                body: 'Hosts on Vibe Live have transparent freedom to transfer or leave an agency after completing the standard 30-day cycle with zero hidden penalties.',
              })
            }
            className="px-3.5 py-1.5 rounded-full bg-white text-purple-700 text-xs font-extrabold shrink-0 active:scale-95"
          >
            Read Now
          </button>
        </div>

        {/* User Posted Videos Section (Shows newly posted videos from HISSA 9!) */}
        {myVideos.length > 0 && (
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">My Posted Videos ({myVideos.length})</h3>
              <span className="text-xs font-semibold text-amber-600">Profile Grid</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {myVideos.map((vid) => (
                <button
                  key={vid.id}
                  type="button"
                  onClick={() => onOpenVideo(vid)}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 text-left"
                >
                  <img
                    src={vid.mediaUrl || vid.cover}
                    alt={vid.title}
                    style={{ filter: vid.filterCss || 'none' }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[11px] font-bold text-white">
                    <Play className="w-3 h-3 fill-white" />
                    <span>{vid.views}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Menu List */}
        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {menuRows.map((row) => {
            const Icon = row.icon;
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => {
                  triggerHaptic();
                  if (row.id === 'challenge') {
                    onOpenDailyChallenges();
                  } else if (row.id === 'referral') {
                    onOpenReferralKing();
                  } else if (row.id === 'dailyking') {
                    onOpenDailyKings();
                  } else if (row.id === 'luckynum') {
                    onOpenLuckyNumber();
                  } else if (row.id === 'streamer') {
                    onOpenStreamerCenter();
                  } else if (row.id === 'couples') {
                    onOpenMarriedCouples();
                  } else if (row.id === 'birthdays') {
                    onOpenBirthdays();
                  } else if (row.id === 'country') {
                    onOpenCountryLanguage();
                  } else if (row.id === 'settings') {
                    setSettingsOpen(true);
                  } else {
                    setInfoModal({ title: row.label, body: row.msg });
                  }
                }}
                className="w-full h-14 px-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${row.bg} text-white flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[16px] font-medium text-slate-900">{row.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {row.extra && <span className="text-xs font-semibold text-slate-500">{row.extra}</span>}
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onOpenLogin}
            className="w-full h-14 px-4 flex items-center justify-between text-left hover:bg-red-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-[16px] font-semibold text-red-600">Login / Switch Account</span>
            </div>
            <ChevronRight className="w-5 h-5 text-red-300" />
          </button>
        </div>

        <p className="text-center text-[11px] font-medium text-slate-400 pt-1">Vibe Live - Version 1.0 - Made For The World</p>
      </div>

      {/* Polish Profile Modal */}
      {polishOpen && (
        <div className="fixed inset-0 z-[85] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 space-y-4 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Complete Your Profile</h3>
              <button type="button" onClick={() => setPolishOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Bio</label>
                <input
                  type="text"
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full h-10 px-3 mt-1 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">City</label>
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="w-full h-10 px-3 mt-1 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Birthday Date (For Birthday Blast 🎂)</label>
                <input
                  type="date"
                  value={birthDateInput}
                  onChange={(e) => setBirthDateInput(e.target.value)}
                  className="w-full h-10 px-3 mt-1 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onSaveBirthDate(birthDateInput);
                setPolishOpen(false);
                onCompleteProfile();
              }}
              className="w-full h-11 rounded-full gold-gradient text-white font-bold text-sm shadow-lg flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Claim +100 Coins</span>
            </button>
          </div>
        </div>
      )}

      {/* QR Scan Modal */}
      {scanOpen && (
        <div className="fixed inset-0 z-[85] bg-black/75 flex items-center justify-center p-4" onClick={() => setScanOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xs bg-white rounded-3xl p-6 text-center space-y-3">
            <h3 className="font-bold text-slate-900">BiLAL Shafique2494</h3>
            <div className="w-44 h-44 mx-auto rounded-2xl bg-slate-100 border-2 border-[#FFD700] flex items-center justify-center">
              <QrCode className="w-28 h-28 text-slate-900" />
            </div>
            <p className="text-xs text-slate-500 font-mono-num">Vibe Live ID: 123456</p>
            <button type="button" onClick={() => setScanOpen(false)} className="w-full py-2 rounded-full gold-gradient text-white font-bold text-xs">
              Done
            </button>
          </div>
        </div>
      )}

      {/* Generic Info Modal */}
      {infoModal && (
        <div className="fixed inset-0 z-[85] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setInfoModal(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <span>{infoModal.title}</span>
              </h3>
              <button type="button" onClick={() => setInfoModal(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{infoModal.body}</p>
            <button type="button" onClick={() => setInfoModal(null)} className="w-full h-10 rounded-full gold-gradient text-white font-bold text-sm">
              Got It
            </button>
          </div>
        </div>
      )}

      {/* HISSA 25 & 26: Interactive Settings & Auto-Translation Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[85] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSettingsOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-3xl p-5 space-y-4 text-slate-900 shadow-2xl max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                <span>{t(language, 'settings_label')}</span>
              </h3>
              <button type="button" onClick={() => setSettingsOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Translation Settings Section */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Languages className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Auto Translate</p>
                    <p className="text-[11px] text-slate-500">Live Chat, Private Chat &amp; Party Rooms</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    onUpdateTranslationSettings({
                      ...translationSettings,
                      autoTranslate: !translationSettings.autoTranslate,
                    });
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-colors ${
                    translationSettings.autoTranslate
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {translationSettings.autoTranslate ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-700">Translation Display Mode</p>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    onUpdateTranslationSettings({
                      ...translationSettings,
                      mode: 'both',
                    });
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-semibold ${
                    translationSettings.mode === 'both'
                      ? 'border-amber-500 bg-amber-50 text-amber-950'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <span>Show Original + Translation (Default)</span>
                  {translationSettings.mode === 'both' && <Check className="w-4 h-4 text-amber-600" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    onUpdateTranslationSettings({
                      ...translationSettings,
                      mode: 'onlyTranslation',
                    });
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-semibold ${
                    translationSettings.mode === 'onlyTranslation'
                      ? 'border-amber-500 bg-amber-50 text-amber-950'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <span>Only Translation Show</span>
                  {translationSettings.mode === 'onlyTranslation' && <Check className="w-4 h-4 text-amber-600" />}
                </button>
              </div>
            </div>

            {/* Country & Language Quick Row */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setSettingsOpen(false);
                  onOpenCountryLanguage();
                }}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{country.flag}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t(language, 'country_language')}</p>
                    <p className="text-xs text-slate-500">{country.name} · {language}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSettingsOpen(false);
                  onOpenTranslationSettings();
                }}
                className="w-full h-9 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Open Full Language / Translation Studio</span>
              </button>
            </div>

            {/* About Vibe Live (HISSA 26) */}
            <div className="rounded-2xl bg-[#0D0D15] text-white p-4 space-y-1">
              <p className="text-xs font-extrabold text-[#FFD700]">About Vibe Live</p>
              <p className="text-xs text-white/90">Vibe Live - Version 1.0 - Made For The World</p>
              <p className="text-[11px] text-slate-400">Vibe Live - Feel The World Live</p>
            </div>

            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="w-full h-11 rounded-full gold-gradient text-white font-bold text-sm shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
