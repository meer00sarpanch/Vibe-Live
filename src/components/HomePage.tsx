import React, { useEffect, useState } from 'react';
import { Cake, CalendarCheck, Coins, Crown, Eye, Flame, Gift, Heart, Play, RefreshCw, Shuffle, Sparkles, Timer, Trophy, Tv, Users } from 'lucide-react';
import { IMG_HOST_MALE } from '../data/mockData';
import {
  AppLanguage,
  BirthdayState,
  DailyChallengeItem,
  DailyCheckInState,
  KingQueenEntry,
  LiveStreamItem,
  LuckySpinState,
  ShadiState,
  ShortVideoItem,
  VipStatus,
} from '../types/mehfil';
import { triggerHaptic } from '../utils/haptics';
import { t } from '../utils/i18n';
import { KingQueenTopBanners } from './KingQueenReferralModals';
import { TreasureSpot } from './LuckyMysteryCoinRainModals';
import { ShadiWeddingCard } from './ShadiCoupleBirthdayModals';

interface HomePageProps {
  streams: LiveStreamItem[];
  videos: ShortVideoItem[];
  searchQuery: string;
  vipStatus: VipStatus;
  language: AppLanguage;
  shadi: ShadiState;
  birthdayState: BirthdayState;
  luckySpinState: LuckySpinState;
  dailyCheckInState: DailyCheckInState;
  dailyKing: KingQueenEntry;
  weeklyQueen: KingQueenEntry;
  luckyNumber: number;
  luckyClaimed: boolean;
  dailyChallenges: DailyChallengeItem[];
  referralFriendsCount: number;
  winningGroupBanner?: { groupName: string; score: number } | null;
  onJoinStream: (stream: LiveStreamItem) => void;
  onOpenVideo: (video: ShortVideoItem) => void;
  onOpenHostProfile: (hostName: string) => void;
  onOpenRandomMatch: () => void;
  onOpenLeaderboard: () => void;
  onWatchHomeAd: () => void;
  onOpenVipStore: () => void;
  onOpenLuckySpin: () => void;
  onOpenMysteryBox: () => void;
  onOpenDailyCheckIn: () => void;
  onTriggerCoinRainNow: () => void;
  onNotifyCoinRain5Min: () => void;
  onOpenBirthdays: () => void;
  onOpenMarriedCouples: () => void;
  onOpenCoupleRoom: () => void;
  onOpenDailyKings: () => void;
  onOpenWeeklyQueens: () => void;
  onOpenReferralKing: () => void;
  onOpenLuckyNumber: () => void;
  onOpenDailyChallenges: () => void;
  onFindTreasure: (id: string) => void;
  onPullRefresh: () => void;
}

const TABS: Array<'Follow' | 'Hot' | 'Video' | 'Voice'> = ['Follow', 'Hot', 'Video', 'Voice'];
const PILLS: Array<'Pakistan' | 'Recommendations' | 'Chat' | 'Dating' | 'Games' | 'Interests' | 'Room'> = [
  'Pakistan',
  'Recommendations',
  'Chat',
  'Dating',
  'Games',
  'Interests',
  'Room',
];

export const HomePage: React.FC<HomePageProps> = ({
  streams,
  videos,
  searchQuery,
  vipStatus,
  language,
  shadi,
  birthdayState,
  luckySpinState,
  dailyCheckInState,
  dailyKing,
  weeklyQueen,
  luckyNumber,
  luckyClaimed,
  dailyChallenges,
  referralFriendsCount,
  winningGroupBanner,
  onJoinStream,
  onOpenVideo,
  onOpenHostProfile,
  onOpenRandomMatch,
  onOpenLeaderboard,
  onWatchHomeAd,
  onOpenVipStore,
  onOpenLuckySpin,
  onOpenMysteryBox,
  onOpenDailyCheckIn,
  onTriggerCoinRainNow,
  onNotifyCoinRain5Min,
  onOpenBirthdays,
  onOpenMarriedCouples,
  onOpenCoupleRoom,
  onOpenDailyKings,
  onOpenWeeklyQueens,
  onOpenReferralKing,
  onOpenLuckyNumber,
  onOpenDailyChallenges,
  onFindTreasure,
  onPullRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'Follow' | 'Hot' | 'Video' | 'Voice'>('Hot');
  const [activePill, setActivePill] = useState<string>('Pakistan');
  const [refreshing, setRefreshing] = useState(false);
  const [coinRainSeconds, setCoinRainSeconds] = useState(() => {
    const now = new Date();
    const target = new Date(now);
    target.setHours(21, 0, 0, 0);
    if (now >= target) target.setDate(target.getDate() + 1);
    return Math.max(60, Math.floor((target.getTime() - now.getTime()) / 1000));
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCoinRainSeconds((s) => (s > 1 ? s - 1 : 86400));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const formatRainTimer = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const topBannerStream = streams[0];

  const handleRefresh = () => {
    triggerHaptic(15);
    setRefreshing(true);
    onPullRefresh();
    setTimeout(() => setRefreshing(false), 900);
  };

  const q = searchQuery.trim().toLowerCase();

  const filteredStreams = streams.slice(1).filter((item) => {
    if (q && !item.hostName.toLowerCase().includes(q) && !item.title.toLowerCase().includes(q)) {
      return false;
    }
    if (activeTab === 'Voice') return item.category === 'Voice' || item.pill === 'Chat' || item.pill === 'Room';
    if (activeTab === 'Follow') return item.category === 'Follow' || item.level >= 33;
    if (activePill !== 'Pakistan' && activePill !== 'Recommendations') {
      return item.pill === activePill || item.tag === activePill;
    }
    return true;
  });

  const filteredVideos = videos.filter((v) => {
    if (!q) return true;
    return v.title.toLowerCase().includes(q) || v.hostName.toLowerCase().includes(q) || v.caption.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#07070D] pt-[62px] pb-24">
      {/* 1. Fixed Sub-Tabs Row Under Top Bar */}
      <div className="sticky top-[62px] z-30 bg-[#07070D]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-2.5 pb-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-5 sm:gap-7">
            {TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setActiveTab(tab);
                  }}
                  className={`relative pb-1.5 text-[16px] whitespace-nowrap shrink-0 transition-colors ${
                    active ? 'font-bold text-[#FFD700]' : 'font-medium text-[#888888] hover:text-white/80'
                  }`}
                >
                  {t(language, `tab_${tab.toLowerCase()}`)}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full gold-gradient shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              title="Pull to Refresh"
              className="h-8 px-2.5 rounded-full bg-[#1A1A22] border border-[#FFD700]/25 text-xs text-[#FFD700] font-semibold flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                onOpenLeaderboard();
              }}
              aria-label="Top 100 Leaderboard"
              className="w-8 h-8 rounded-full bg-[#1A1A22] border border-[#FFD700]/35 flex items-center justify-center active:scale-95 transition-transform"
            >
              <Trophy className="w-4 h-4 text-[#FFD700] fill-[#FFD700]/30" />
            </button>
          </div>
        </div>

        {/* 2. Pills Row Horizontal Scroll */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {PILLS.map((pill) => {
            const active = activePill === pill;
            return (
              <button
                key={pill}
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setActivePill(pill);
                }}
                className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                  active
                    ? 'gold-gradient text-white shadow-[0_0_12px_rgba(255,140,0,0.45)]'
                    : 'bg-[#1A1A22] text-[#A1A1AA] hover:text-white border border-white/5'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Feed Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-3 space-y-3.5">
        {/* HISSA 27 FINAL: DAILY KING + WEEKLY QUEEN + LUCKY NUMBER 5353 + REFERRAL + CHALLENGE AT VERY TOP */}
        <KingQueenTopBanners
          dailyKing={dailyKing}
          weeklyQueen={weeklyQueen}
          luckyNumber={luckyNumber}
          luckyClaimed={luckyClaimed}
          challenges={dailyChallenges}
          referralFriendsCount={referralFriendsCount}
          onOpenDailyKings={onOpenDailyKings}
          onOpenWeeklyQueens={onOpenWeeklyQueens}
          onOpenReferralKing={onOpenReferralKing}
          onOpenLuckyNumber={onOpenLuckyNumber}
          onOpenDailyChallenges={onOpenDailyChallenges}
        />

        {/* HISSA 23: Group Gift Battle Winner Crown Banner on Home */}
        {winningGroupBanner && (
          <div className="rounded-2xl bg-gradient-to-r from-[#2D1B06] via-[#1C1226] to-[#2D1B06] border border-[#FFD700]/70 px-4 py-2.5 flex items-center justify-between gap-3 gold-glow">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-white fill-white/40" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-[#FFD700] truncate">
                  👑 Group Battle Champion: {winningGroupBanner.groupName}
                </p>
                <p className="text-[11px] text-white/80 truncate">
                  Won with {winningGroupBanner.score.toLocaleString()} Gift Coins!
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full gold-gradient text-[10px] font-black text-white shrink-0">
              CROWN
            </span>
          </div>
        )}

        {/* HISSA 25: Live Lucky Spin Winner Ticker + Home Treasure #1 */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#11111A] border border-[#FFD700]/30 px-3.5 py-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Sparkles className="w-4 h-4 text-[#FFD700] shrink-0" />
            <p className="text-[11px] sm:text-xs font-bold text-amber-200 truncate">
              {luckySpinState.tickerFeed[0] || 'Bilal Ne 5,000 Coins Jeete 🎉'}
            </p>
          </div>
          <TreasureSpot id="tr-home" foundIds={dailyCheckInState.treasureFoundIds} onFind={onFindTreasure} label="Home Treasure +200c" />
        </div>

        {/* HISSA 25: 4 Interactive Event Cards — Lucky Spin | Mystery Box | 9PM Coin Rain | Daily Check-In */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={onOpenLuckySpin}
            className="rounded-2xl bg-gradient-to-br from-[#2B1D06] to-[#17120A] border border-[#FFD700]/75 p-3 text-left flex items-center justify-between gap-2 active:scale-95 transition-transform gold-glow"
          >
            <div className="min-w-0">
              <p className="text-xs font-black text-[#FFD700] truncate">🎡 Lucky Spin</p>
              <p className="text-[10px] text-white/80 truncate">
                {Math.max(0, Math.min(3, 1 + luckySpinState.extraSpinsEarned) - luckySpinState.spinsUsedToday)} Free Spin Today
              </p>
            </div>
            <span className="px-2 py-1 rounded-full gold-gradient text-[10px] font-black text-white shrink-0">SPIN</span>
          </button>

          <button
            type="button"
            onClick={onOpenMysteryBox}
            className="rounded-2xl bg-gradient-to-br from-[#24102F] to-[#120D1A] border border-purple-400/50 p-3 text-left flex items-center justify-between gap-2 active:scale-95 transition-transform"
          >
            <div className="min-w-0">
              <p className="text-xs font-black text-fuchsia-300 truncate">🎁 Mystery Box</p>
              <p className="text-[10px] text-white/80 truncate">Rs 100 · Rs 500 · Rs 1000</p>
            </div>
            <span className="px-2 py-1 rounded-full bg-purple-600 text-[10px] font-black text-white shrink-0">OPEN</span>
          </button>

          <div className="rounded-2xl bg-gradient-to-br from-[#0F241E] to-[#0B1416] border border-emerald-400/50 p-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-black text-emerald-300 flex items-center gap-1 truncate">
                <Timer className="w-3.5 h-3.5 shrink-0" />
                <span>Coin Rain In {formatRainTimer(coinRainSeconds)}</span>
              </p>
              <button
                type="button"
                onClick={onNotifyCoinRain5Min}
                className="text-[10px] text-[#FFD700] underline font-semibold"
              >
                5m Alert · 9 PM Live
              </button>
            </div>
            <button
              type="button"
              onClick={onTriggerCoinRainNow}
              className="px-2 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black shrink-0 active:scale-95"
            >
              RAIN
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenDailyCheckIn}
            className="rounded-2xl bg-gradient-to-br from-[#29150A] to-[#160E0D] border border-amber-400/50 p-3 text-left flex items-center justify-between gap-2 active:scale-95 transition-transform"
          >
            <div className="min-w-0">
              <p className="text-xs font-black text-amber-300 flex items-center gap-1 truncate">
                <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Check-In Day {dailyCheckInState.streakDay}</span>
              </p>
              <p className="text-[10px] text-white/80 truncate">
                {dailyCheckInState.claimedToday ? 'Claimed ✓' : 'Claim Daily Coins'} · 💎 {dailyCheckInState.treasureFoundIds.length}/5
              </p>
            </div>
            <Coins className="w-5 h-5 text-[#FFD700] shrink-0" />
          </button>
        </div>

        {/* HISSA 24: Shadi Wedding Day Top Room Card OR Married Couples Entry + Birthday Blast Banner */}
        {shadi.isMarried && (
          <ShadiWeddingCard
            shadi={shadi}
            compact
            onPartnerClick={() => onOpenHostProfile(shadi.partnerName)}
            onOpenCoupleRoom={onOpenCoupleRoom}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Birthday Blast Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-[#2D142C] via-[#3A1424] to-[#2B1D07] border border-pink-400/55 p-3 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={IMG_HOST_MALE}
                alt="Bilal Birthday"
                className="w-11 h-11 rounded-full object-cover border-2 border-[#FFD700] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-black text-[#FFD700] truncate">
                  Happy Birthday Bilal 🎂
                </p>
                <p className="text-[10px] text-pink-100 truncate">
                  {birthdayState.birthdaysToday.length} Birthdays Today · Send Gift &amp; Free Cake
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenBirthdays}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white text-[11px] font-extrabold shrink-0 flex items-center gap-1 active:scale-95"
            >
              <Cake className="w-3.5 h-3.5" />
              <span>Birthdays</span>
            </button>
          </div>

          {/* Married Couples Page Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-[#1F0F24] via-[#2B0C1B] to-[#1A1226] border border-[#FFD700]/45 p-3 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-[#FFD700] flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate">Married Couples 💍</p>
                <p className="text-[10px] text-pink-200 truncate">
                  {shadi.isMarried ? `Married to ${shadi.partnerHandle}` : 'Most Popular Couples & Propose'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenMarriedCouples}
              className="px-3 py-1.5 rounded-full gold-gradient text-white text-[11px] font-extrabold shrink-0 flex items-center gap-1 active:scale-95"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>View List</span>
            </button>
          </div>
        </div>

        {/* 3. TOP 1 BANNER — Full Width Card Height 220px */}
        {activeTab !== 'Video' && topBannerStream && (
          <div
            onClick={() => {
              triggerHaptic();
              onJoinStream(topBannerStream);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onJoinStream(topBannerStream)}
            className="relative w-full h-[220px] sm:h-[260px] rounded-[20px] overflow-hidden glass-dark cursor-pointer group active:scale-[0.99] transition-transform"
          >
            <img
              src={topBannerStream.cover}
              alt={topBannerStream.hostName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20" />

            {/* Top Left Red Badge LIVE NOW Pulse */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-rose-500 text-white text-xs font-bold shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>LIVE NOW</span>
            </div>

            {/* Top Right PK / Featured */}
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#FFD700]/40 text-[#FFD700] text-xs font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-[#FF6B00] text-[#FF6B00]" />
              <span>TOP #1</span>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                    {topBannerStream.hostName}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full gold-gradient text-[11px] font-extrabold text-white shadow">
                    Lv.{topBannerStream.level}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/80 truncate mt-0.5">
                  {topBannerStream.title}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-1 text-xs font-semibold text-white bg-black/60 px-2.5 py-1 rounded-full border border-white/15">
                  <Flame className="w-3.5 h-3.5 text-[#FF6B00] fill-[#FF6B00]" />
                  <span className="tabular-nums">{topBannerStream.viewers} Watching</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic();
                    onJoinStream(topBannerStream);
                  }}
                  className="px-5 py-2 rounded-full gold-gradient text-white text-xs sm:text-sm font-extrabold tracking-wide shadow-lg gold-glow active:scale-95 transition-transform"
                >
                  {t(language, 'join_btn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. VIDEO TAB OR LIVE STREAM 2-COL (4-COL DESKTOP) GRID */}
        {activeTab === 'Video' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {filteredVideos.map((vid) => (
              <div
                key={vid.id}
                onClick={() => {
                  triggerHaptic();
                  onOpenVideo(vid);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onOpenVideo(vid)}
                className="relative h-[240px] rounded-[20px] overflow-hidden glass-dark cursor-pointer group active:scale-[0.98] transition-transform"
              >
                {vid.mediaUrl && vid.mediaUrl.startsWith('data:video') ? (
                  <video src={vid.mediaUrl} className="w-full h-full object-cover" muted loop playsInline autoPlay />
                ) : (
                  <img
                    src={vid.mediaUrl || vid.cover}
                    alt={vid.title}
                    referrerPolicy="no-referrer"
                    style={{ filter: vid.filterCss || 'none' }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {vid.isUserCreated && (
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full gold-gradient text-[10px] font-bold text-white">
                    NEW POST
                  </div>
                )}

                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-semibold flex items-center gap-1 tabular-nums">
                  <Eye className="w-3 h-3 text-[#FFD700]" />
                  <span>{vid.views}</span>
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <p className="text-xs text-white/90 font-medium line-clamp-1 mb-1">{vid.caption}</p>
                  <div className="flex items-center gap-1.5">
                    <img
                      src={vid.avatar}
                      alt={vid.hostName}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover border border-[#FFD700]"
                    />
                    <span className="text-xs font-bold text-white truncate">{vid.hostName}</span>
                    <span className="px-1.5 py-0.5 rounded-full gold-gradient text-[10px] font-bold text-white shrink-0">
                      Lv.{vid.level}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {(filteredStreams.length > 0 ? filteredStreams : streams.slice(1)).map((stream, idx) => (
              <React.Fragment key={stream.id}>
                <div
                  onClick={() => {
                    triggerHaptic();
                    onJoinStream(stream);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onJoinStream(stream)}
                  className="relative h-[240px] rounded-[20px] overflow-hidden glass-dark cursor-pointer group active:scale-[0.98] transition-transform"
                >
                  <img
                    src={stream.cover}
                    alt={stream.hostName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/15" />

                  {/* Top Left: Red Dot + LIVE Small */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white tracking-wide">
                      {stream.tag && stream.tag !== 'Popular' ? stream.tag : 'LIVE'}
                    </span>
                  </div>

                  {/* Top Right: Viewers Box Black 60% + Eye Icon */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm flex items-center gap-1 text-[11px] font-semibold text-white tabular-nums">
                    <Eye className="w-3 h-3 text-[#FFD700]" />
                    <span>{stream.viewers}</span>
                  </div>

                  {/* Bottom Left: Avatar 28px + Name + Lv. Gold Badge */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-1">
                    {stream.coHostCount && (
                      <div className="flex items-center -space-x-1.5 mb-1">
                        {Array.from({ length: stream.coHostCount }).map((_, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border border-[#FFD700]/70 bg-[#1A1A22] flex items-center justify-center"
                          >
                            <Users className="w-2.5 h-2.5 text-[#FFD700]" />
                          </div>
                        ))}
                        {stream.tag === 'Popular' && (
                          <span className="ml-2 px-1.5 py-0.5 rounded-full bg-cyan-500/80 text-[9px] font-bold text-white">
                            Popular
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenHostProfile(stream.hostName);
                        }}
                        className="shrink-0"
                      >
                        <img
                          src={stream.avatar}
                          alt={stream.hostName}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover border border-[#FFD700]"
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded-full gold-gradient text-[10px] font-extrabold text-white shrink-0">
                            Lv.{stream.level}
                          </span>
                          <span className="text-[13px] font-bold text-white truncate">
                            {stream.hostName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HISSA 22: Small Ad Banner after every 5 Live cards (Hidden for VIP) */}
                {vipStatus.level === 0 && (idx + 1) % 5 === 0 && (
                  <div className="col-span-2 sm:col-span-3 lg:col-span-4 rounded-2xl bg-gradient-to-r from-[#1A1A26] via-[#221A10] to-[#1A1A26] border border-[#FFD700]/35 p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl gold-gradient text-white flex items-center justify-center shrink-0 shadow">
                        <Tv className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold text-[#9CA3AF]">
                            SPONSORED AD
                          </span>
                          <button
                            type="button"
                            onClick={onOpenVipStore}
                            className="text-[10px] font-bold text-[#FFD700] flex items-center gap-0.5 hover:underline"
                          >
                            <Crown className="w-3 h-3" />
                            <span>Remove Ads with VIP</span>
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                          Watch Short Video Ad &amp; Earn Free Gold Coins!
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic();
                        onWatchHomeAd();
                      }}
                      className="px-3.5 py-2 rounded-full gold-gradient text-white text-xs font-extrabold whitespace-nowrap shrink-0 shadow active:scale-95"
                    >
                      Watch Ad &amp; Get 10 Coins
                    </button>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* 5. Bottom Right Floating Button — Random Match */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic();
          onOpenRandomMatch();
        }}
        className="fixed right-4 bottom-24 z-30 flex flex-col items-center gap-1 group active:scale-95 transition-transform"
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] border-2 border-[#FFD700]/60 shadow-[0_0_20px_rgba(124,58,237,0.7)] flex items-center justify-center">
          <Shuffle className="w-6 h-6 text-white" />
        </div>
        <span className="px-2 py-0.5 rounded-full bg-black/80 border border-[#FFD700]/30 text-[11px] font-bold text-white shadow">
          Random
        </span>
      </button>
    </div>
  );
};
