import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Crown,
  Hash,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { IMG_HOST_FEMALE, IMG_HOST_MALE, INITIAL_REFERRAL_KINGS } from '../data/mockData';
import {
  DailyChallengeItem,
  KingQueenEntry,
  ReferralKingState,
} from '../types/mehfil';
import { playGiftChime, triggerHaptic } from '../utils/haptics';

interface KingQueenTopBannersProps {
  dailyKing: KingQueenEntry;
  weeklyQueen: KingQueenEntry;
  luckyNumber: number;
  luckyClaimed: boolean;
  challenges: DailyChallengeItem[];
  referralFriendsCount: number;
  onOpenDailyKings: () => void;
  onOpenWeeklyQueens: () => void;
  onOpenReferralKing: () => void;
  onOpenLuckyNumber: () => void;
  onOpenDailyChallenges: () => void;
}

export const KingQueenTopBanners: React.FC<KingQueenTopBannersProps> = ({
  dailyKing,
  weeklyQueen,
  luckyNumber,
  luckyClaimed,
  challenges,
  referralFriendsCount,
  onOpenDailyKings,
  onOpenWeeklyQueens,
  onOpenReferralKing,
  onOpenLuckyNumber,
  onOpenDailyChallenges,
}) => {
  const [midnightLeft, setMidnightLeft] = useState(() => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    return Math.max(60, Math.floor((end.getTime() - now.getTime()) / 1000));
  });

  useEffect(() => {
    const t = window.setInterval(() => {
      setMidnightLeft((s) => (s > 1 ? s - 1 : 86400));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  const fmtHMS = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const completedCount = challenges.filter((c) => c.completed).length;

  return (
    <div className="space-y-2.5">
      {/* 1. DAILY KING & WEEKLY QUEEN TOP HERO BANNERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Aaj Ka King */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onOpenDailyKings();
          }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2D1D04] via-[#1C1408] to-[#2B1906] border-2 border-[#FFD700]/80 p-3 text-left flex items-center justify-between gap-3 gold-glow active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <Crown className="w-5 h-5 text-[#FFD700] fill-[#FFD700] absolute -top-3 left-1/2 -translate-x-1/2 animate-bounce z-10" />
              <div className="w-12 h-12 rounded-full p-[2px] gold-gradient shadow-lg">
                <img
                  src={dailyKing.avatar || IMG_HOST_MALE}
                  alt={dailyKing.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <span>👑 DAILY KING · Ends {fmtHMS(midnightLeft)}</span>
              </p>
              <p className="text-xs sm:text-sm font-black text-white truncate">
                Aaj Ka King - {dailyKing.name} - {dailyKing.coins.toLocaleString()} Coins Gift
              </p>
              <p className="text-[10px] text-[#FFD700] font-bold truncate">
                Prize: 1,000 Coins Free + King Frame 1d · Top 10 Kings ›
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full gold-gradient text-[10px] font-black text-white shrink-0">
            TOP 10
          </span>
        </button>

        {/* Week Ki Queen */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onOpenWeeklyQueens();
          }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#340F29] via-[#220C24] to-[#2F140A] border-2 border-pink-400/75 p-3 text-left flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <Crown className="w-5 h-5 text-pink-300 fill-[#FFD700] absolute -top-3 left-1/2 -translate-x-1/2 animate-bounce z-10" />
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-[#FFD700] to-rose-500 shadow-lg">
                <img
                  src={weeklyQueen.avatar || IMG_HOST_FEMALE}
                  alt={weeklyQueen.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-pink-300 uppercase tracking-wider">
                👸 WEEKLY QUEEN · Gold Confetti &amp; Home 7d
              </p>
              <p className="text-xs sm:text-sm font-black text-white truncate">
                Week Ki Queen - {weeklyQueen.name} - 10 Lakh Coins
              </p>
              <p className="text-[10px] text-amber-200 font-bold truncate">
                Rs 2,000 Bonus + Queen Frame 7d · Top 10 Queens ›
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-[10px] font-black text-white shrink-0">
            QUEEN
          </span>
        </button>
      </div>

      {/* 2. LUCKY NUMBER BANNER + REFERRAL KING + DAILY CHALLENGE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onOpenLuckyNumber();
          }}
          className="rounded-2xl bg-gradient-to-r from-[#1A162E] to-[#111524] border border-cyan-400/55 px-3 py-2.5 text-left flex items-center justify-between gap-2 active:scale-95 transition-transform"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-black text-cyan-300">🔢 LUCKY NUMBER DRAW</p>
            <p className="text-xs font-black text-white truncate">
              Aaj Ka Lucky Number <span className="text-[#FFD700] text-sm">{luckyNumber}</span> Hai
            </p>
            <p className="text-[10px] text-emerald-300 font-semibold truncate">
              {luckyClaimed ? '5,000 Coins Claimed ✓' : 'Match ID & Win 5,000 Coins!'}
            </p>
          </div>
          <Hash className="w-5 h-5 text-[#FFD700] shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onOpenReferralKing();
          }}
          className="rounded-2xl bg-gradient-to-r from-[#1B1206] to-[#13181A] border border-[#FFD700]/45 px-3 py-2.5 text-left flex items-center justify-between gap-2 active:scale-95 transition-transform"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-black text-[#FFD700]">🤝 REFERRAL KING (Rs 5,000)</p>
            <p className="text-xs font-black text-white truncate">
              {referralFriendsCount} Verified Friends Invited
            </p>
            <p className="text-[10px] text-white/75 truncate">100c Invite + 200c Recharge</p>
          </div>
          <UserPlus className="w-5 h-5 text-[#FFD700] shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onOpenDailyChallenges();
          }}
          className="rounded-2xl bg-gradient-to-r from-[#0F2418] to-[#121622] border border-emerald-400/50 px-3 py-2.5 text-left flex items-center justify-between gap-2 active:scale-95 transition-transform"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-black text-emerald-300">🎯 DAILY CHALLENGE PAGE</p>
            <p className="text-xs font-black text-white truncate">
              {completedCount}/{challenges.length} Poore · {challenges.length - completedCount} Baaki
            </p>
            <p className="text-[10px] text-[#FFD700] font-semibold truncate">Earn Up To 2,000 Coins ›</p>
          </div>
          <Target className="w-5 h-5 text-emerald-400 shrink-0" />
        </button>
      </div>
    </div>
  );
};

// =================== DAILY KINGS TOP 10 MODAL ===================
interface DailyKingsModalProps {
  open: boolean;
  kings: KingQueenEntry[];
  claimedPrize: boolean;
  onClose: () => void;
  onClaimKingPrize: () => void;
}

export const DailyKingsModal: React.FC<DailyKingsModalProps> = ({
  open,
  kings,
  claimedPrize,
  onClose,
  onClaimKingPrize,
}) => {
  if (!open) return null;
  const topKing = kings[0];

  return (
    <div onClick={onClose} className="fixed inset-0 z-[92] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[88vh] bg-[#101018] rounded-3xl border border-[#FFD700]/55 flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-base font-black text-[#FFD700] flex items-center gap-2">
            <Crown className="w-5 h-5 fill-[#FFD700]" />
            <span>Aaj Ka King (Top 10 Daily Kings)</span>
          </h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* #1 King Hero */}
          <div className="rounded-2xl bg-gradient-to-br from-[#302006] to-[#171209] border-2 border-[#FFD700] p-4 text-center space-y-2.5">
            <div className="relative inline-block">
              <Crown className="w-7 h-7 text-[#FFD700] fill-[#FFD700] mx-auto -mb-2 animate-bounce" />
              <img src={topKing.avatar} alt={topKing.name} className="w-20 h-20 rounded-full object-cover border-2 border-[#FFD700] mx-auto" />
            </div>
            <div>
              <p className="text-base font-black text-white">Aaj Ka King - {topKing.name}</p>
              <p className="text-xs font-extrabold text-[#FFD700]">{topKing.coins.toLocaleString()} Coins Gift Sent Today</p>
              <p className="text-[11px] text-white/75 mt-1">
                Roz Raat 12 Baje New King! Prize: 1,000 Coins + King Frame (1d) + King Badge
              </p>
            </div>
            {topKing.isUser && (
              <button
                type="button"
                disabled={claimedPrize}
                onClick={onClaimKingPrize}
                className="px-5 py-2 rounded-full gold-gradient text-white text-xs font-black shadow disabled:opacity-60"
              >
                {claimedPrize ? 'King Prize Claimed ✓' : 'Claim King Prize (+1,000 Coins & King Frame)'}
              </button>
            )}
          </div>

          <div className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white/80 flex items-center justify-between">
            <span>Kal Ka King (Yesterday):</span>
            <span className="font-bold text-[#FFD700]">Ali Raza · 46,200 Coins 👑</span>
          </div>

          {/* Top 10 List */}
          <div className="space-y-1.5">
            {kings.map((k) => (
              <div
                key={k.id}
                className={`flex items-center justify-between p-2.5 rounded-2xl border ${
                  k.rank === 1
                    ? 'bg-amber-500/15 border-[#FFD700]/65'
                    : 'bg-[#171722] border-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 text-center text-xs font-black text-[#FFD700]">#{k.rank}</span>
                  <img src={k.avatar} alt={k.name} className="w-9 h-9 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-white truncate">
                      {k.name} {k.rank === 1 ? '👑' : ''}
                    </p>
                    <p className="text-[10px] text-white/60 truncate">{k.handle}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#FFD700] tabular-nums shrink-0">
                  {k.coins.toLocaleString()}c
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== WEEKLY QUEENS TOP 10 MODAL ===================
interface WeeklyQueensModalProps {
  open: boolean;
  queens: KingQueenEntry[];
  onClose: () => void;
  onCelebrateQueen: () => void;
  onVisitQueenRoom: () => void;
}

export const WeeklyQueensModal: React.FC<WeeklyQueensModalProps> = ({
  open,
  queens,
  onClose,
  onCelebrateQueen,
  onVisitQueenRoom,
}) => {
  if (!open) return null;
  const topQueen = queens[0];

  return (
    <div onClick={onClose} className="fixed inset-0 z-[92] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[88vh] bg-[#120D1A] rounded-3xl border border-pink-400/60 flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-base font-black text-pink-300 flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#FFD700] fill-[#FFD700]" />
            <span>Week Ki Queen (Top 10 Hosts)</span>
          </h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="rounded-2xl bg-gradient-to-br from-[#3A102E] to-[#1A0D20] border-2 border-pink-400 p-4 text-center space-y-2.5">
            <Crown className="w-7 h-7 text-[#FFD700] fill-[#FFD700] mx-auto animate-bounce" />
            <img src={topQueen.avatar} alt={topQueen.name} className="w-20 h-20 rounded-full object-cover border-2 border-pink-300 mx-auto" />
            <div>
              <p className="text-base font-black text-white">Week Ki Queen - {topQueen.name} - 10 Lakh Coins</p>
              <p className="text-[11px] text-amber-200 font-semibold mt-1">
                Prize: Rs 2,000 Bonus + Queen Frame (7 Days) + 7 Days Home Top Photo + Auto Boosted Viewers!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onCelebrateQueen}
                className="h-9 rounded-full gold-gradient text-white text-xs font-black"
              >
                🎊 Gold Confetti Cheer
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVisitQueenRoom();
                }}
                className="h-9 rounded-full bg-pink-600 text-white text-xs font-black"
              >
                🔥 Visit Queen Room
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            {queens.map((q) => (
              <div
                key={q.id}
                className={`flex items-center justify-between p-2.5 rounded-2xl border ${
                  q.rank === 1
                    ? 'bg-pink-500/20 border-pink-400'
                    : q.rank <= 3
                      ? 'bg-amber-500/10 border-[#FFD700]/45'
                      : 'bg-[#191524] border-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 text-center text-xs font-black text-pink-300">#{q.rank}</span>
                  <img src={q.avatar} alt={q.name} className="w-9 h-9 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-extrabold text-white truncate">{q.name}</p>
                      {q.titleBadge && (
                        <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-[9px] font-black text-white">
                          {q.titleBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/60 truncate">{q.handle}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#FFD700] tabular-nums shrink-0">
                  {q.coins.toLocaleString()}c
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== REFERRAL KING DASHBOARD MODAL ===================
interface ReferralKingModalProps {
  open: boolean;
  referralState: ReferralKingState;
  onClose: () => void;
  onInviteRealFriend: () => void;
  onTestFakeIdRejected: () => void;
  onSimulateFriendRecharge: (friendId: string) => void;
  onSimulateFriend7Days: (friendId: string) => void;
  onClaimReferralKingBonus: () => void;
  onNotify: (msg: string) => void;
}

export const ReferralKingModal: React.FC<ReferralKingModalProps> = ({
  open,
  referralState,
  onClose,
  onInviteRealFriend,
  onTestFakeIdRejected,
  onSimulateFriendRecharge,
  onSimulateFriend7Days,
  onClaimReferralKingBonus,
  onNotify,
}) => {
  if (!open) return null;

  const realFriends = referralState.friends.filter((f) => f.isRealAccount);
  const totalEarnedCoins = realFriends.reduce(
    (sum, f) =>
      sum +
      (f.invitedRewardClaimed ? 100 : 0) +
      (f.rechargedFirstTime ? 200 : 0) +
      (f.watchedSevenDays ? 100 : 0),
    0
  );
  const maxMilestone = 10;
  const remainingFriends = Math.max(0, maxMilestone - realFriends.length);
  const progressPct = Math.min(100, Math.round((realFriends.length / maxMilestone) * 100));

  const copyLink = () => {
    triggerHaptic();
    const msg = `Mera Link Share Karo, Dost Aayega To Paisa Milega: ${referralState.link}`;
    navigator.clipboard?.writeText(referralState.link).catch(() => {});
    onNotify(msg);
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[92] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] bg-[#101018] rounded-3xl border border-[#FFD700]/55 flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-base font-black text-[#FFD700] flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>Referral King Dashboard (Rs 5,000 Bonus)</span>
          </h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Share Link Card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#2B1D06] to-[#14141F] border border-[#FFD700]/70 p-4 space-y-2.5">
            <p className="text-xs font-black text-[#FFD700]">Mera Link Share Karo, Dost Aayega To Paisa Milega 💸</p>
            <div className="flex items-center gap-2 bg-black/50 rounded-xl px-3 py-2 border border-white/10">
              <span className="text-xs font-mono text-white truncate flex-1">{referralState.link}</span>
              <button
                type="button"
                onClick={copyLink}
                className="px-3 py-1 rounded-full gold-gradient text-white text-[11px] font-black flex items-center gap-1 shrink-0"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold flex items-center gap-1 shrink-0"
              >
                <Share2 className="w-3 h-3" />
                <span>Share</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-xl bg-black/35">
                <p className="text-sm font-black text-white tabular-nums">{realFriends.length}</p>
                <p className="text-[10px] text-white/70">Dost Aaye (Real)</p>
              </div>
              <div className="p-2 rounded-xl bg-black/35">
                <p className="text-sm font-black text-[#FFD700] tabular-nums">{totalEarnedCoins}c</p>
                <p className="text-[10px] text-white/70">Coins Mile</p>
              </div>
              <div className="p-2 rounded-xl bg-black/35">
                <p className="text-sm font-black text-emerald-400 tabular-nums">{remainingFriends}</p>
                <p className="text-[10px] text-white/70">Baaki (Goal 10)</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="h-2.5 rounded-full bg-black/50 overflow-hidden">
                <div style={{ width: `${progressPct}%` }} className="h-full gold-gradient transition-all duration-300" />
              </div>
              <p className="text-[10px] text-amber-200 font-semibold">
                Per Dost: +100c Invite · +200c First Recharge · +100c 7-Din Live Watch (Fake ID = 0 Coins!)
              </p>
            </div>
          </div>

          {/* Actions: Real Invite vs Anti-Fake Check */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onInviteRealFriend}
              className="h-10 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>+ Invite Real Dost (+100c)</span>
            </button>
            <button
              type="button"
              onClick={onTestFakeIdRejected}
              className="h-10 rounded-full bg-rose-700/80 text-white text-xs font-black flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Test Fake ID Block (0c)</span>
            </button>
          </div>

          {/* Friends Progress List */}
          <div className="space-y-2">
            <p className="text-xs font-black text-white">Invited Friends Tracker</p>
            {referralState.friends.map((f) => (
              <div key={f.id} className="rounded-2xl bg-[#181824] border border-white/10 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={f.avatar} alt={f.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{f.name}</p>
                      <p className="text-[10px] text-white/60">{f.handle}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      f.isRealAccount ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/25 text-red-300'
                    }`}
                  >
                    {f.isRealAccount ? 'Real ID Verified ✓' : 'Fake ID Rejected (0c)'}
                  </span>
                </div>
                {f.isRealAccount && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600/25 text-emerald-300 text-[10px] font-bold">
                      Invite +100c ✓
                    </span>
                    {f.rechargedFirstTime ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/25 text-[#FFD700] text-[10px] font-bold">
                        1st Recharge +200c ✓
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSimulateFriendRecharge(f.id)}
                        className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black"
                      >
                        Dost Recharged (+200c)
                      </button>
                    )}
                    {f.watchedSevenDays ? (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/25 text-indigo-300 text-[10px] font-bold">
                        7d Watch +100c ✓
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSimulateFriend7Days(f.id)}
                        className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black"
                      >
                        {f.daysWatched}/7d Live (+100c)
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Referral King Leaderboard */}
          <div className="rounded-2xl bg-[#161622] border border-[#FFD700]/35 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-[#FFD700]">👑 Top Referral Kings (Rs 5,000 Bonus)</p>
              <button
                type="button"
                disabled={referralState.referralKingBonusClaimed}
                onClick={onClaimReferralKingBonus}
                className="px-3 py-1 rounded-full gold-gradient text-white text-[10px] font-black disabled:opacity-50"
              >
                {referralState.referralKingBonusClaimed ? 'Rs 5,000 Claimed ✓' : 'Claim Rs 5,000'}
              </button>
            </div>
            {INITIAL_REFERRAL_KINGS.map((rk) => (
              <div key={rk.rank} className="flex items-center justify-between text-xs py-1">
                <span className="font-bold text-white">
                  #{rk.rank} {rk.name}
                </span>
                <span className="font-black text-[#FFD700] tabular-nums">
                  {rk.isUser ? 42 + realFriends.length : rk.invites} Invites
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== LUCKY NUMBER 5353 MODAL ===================
interface LuckyNumberModalProps {
  open: boolean;
  luckyNumber: number;
  userIdNumber: string;
  claimed: boolean;
  onClose: () => void;
  onMatchAndClaim: () => void;
  onRefreshNumber: () => void;
}

export const LuckyNumberModal: React.FC<LuckyNumberModalProps> = ({
  open,
  luckyNumber,
  userIdNumber,
  claimed,
  onClose,
  onMatchAndClaim,
  onRefreshNumber,
}) => {
  if (!open) return null;

  const lastTwoLucky = String(luckyNumber).slice(-2);
  const lastTwoUser = userIdNumber.slice(-2);
  const isCloseOrMatch =
    Math.abs(Number(userIdNumber) - luckyNumber) <= 500 ||
    Math.abs(Number(lastTwoUser) - Number(lastTwoLucky)) <= 5 ||
    String(luckyNumber).includes('53');

  return (
    <div onClick={onClose} className="fixed inset-0 z-[92] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#12121E] rounded-3xl border-2 border-cyan-400/65 p-5 space-y-4 text-center shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-cyan-300">🔢 DAILY LUCKY NUMBER</span>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-cyan-950/80 to-indigo-950/70 border border-cyan-300/40 p-5 space-y-2">
          <p className="text-xs font-bold text-cyan-200">Aaj Ka Lucky Number</p>
          <p className="text-4xl font-black tracking-widest text-[#FFD700] tabular-nums">{luckyNumber}</p>
          <p className="text-xs font-extrabold text-white">Aaj Ka Lucky Number {luckyNumber} Hai</p>
        </div>

        <div className="rounded-xl bg-black/45 p-3 space-y-1 text-xs">
          <p className="text-white/75">
            Your Vibe Live ID: <span className="font-black text-[#FFD700] font-mono">{userIdNumber}</span>
          </p>
          <p className="text-emerald-300 font-semibold">
            Match Rule: Jiska ID match ya aas paas ho usay 5,000 Coins Free!
          </p>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            disabled={claimed}
            onClick={() => {
              playGiftChime();
              onMatchAndClaim();
            }}
            className="w-full h-11 rounded-full gold-gradient text-white text-xs font-black shadow-lg disabled:opacity-55"
          >
            {claimed
              ? '5,000 Coins Claimed ✓'
              : isCloseOrMatch
                ? 'Lucky Match Found! Claim +5,000 Coins Free 🎉'
                : 'Check Nearby Match & Claim +5,000 Coins'}
          </button>
          <button
            type="button"
            onClick={onRefreshNumber}
            className="w-full h-9 rounded-full bg-white/10 text-white text-xs font-bold"
          >
            Draw New Demo Lucky Number
          </button>
        </div>
      </div>
    </div>
  );
};

// =================== DEDICATED DAILY CHALLENGE PAGE MODAL ===================
interface DailyChallengesPageModalProps {
  open: boolean;
  challenges: DailyChallengeItem[];
  onClose: () => void;
  onProgressChallenge: (challengeId: string, delta: number) => void;
}

export const DailyChallengesPageModal: React.FC<DailyChallengesPageModalProps> = ({
  open,
  challenges,
  onClose,
  onProgressChallenge,
}) => {
  if (!open) return null;

  const completed = challenges.filter((c) => c.completed).length;
  const remaining = challenges.length - completed;
  const earnedTotal = challenges.filter((c) => c.completed).reduce((s, c) => s + c.rewardCoins, 0);

  return (
    <div className="fixed inset-0 z-[92] bg-[#07070D] flex flex-col overflow-hidden">
      <div className="gold-line-top" />
      <header className="h-14 px-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0D0D16]">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-black text-white">Daily Challenge</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto max-w-2xl w-full mx-auto p-4 space-y-4">
        {/* Summary Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-[#121622] to-amber-950/70 border border-emerald-400/50 p-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xl font-black text-emerald-400 tabular-nums">{completed}</p>
            <p className="text-[11px] font-bold text-white/80">Poore Hue</p>
          </div>
          <div>
            <p className="text-xl font-black text-amber-300 tabular-nums">{remaining}</p>
            <p className="text-[11px] font-bold text-white/80">Baaki Hain</p>
          </div>
          <div>
            <p className="text-xl font-black text-[#FFD700] tabular-nums">+{earnedTotal}c</p>
            <p className="text-[11px] font-bold text-white/80">Auto Wallet</p>
          </div>
        </div>

        <p className="text-xs text-white/75 font-semibold">
          Roz Naye Challenge! Target poora hote hi Coins auto aapke Wallet me aayenge + Challenge Complete Confetti!
        </p>

        {/* Challenge Cards */}
        <div className="space-y-3">
          {challenges.map((ch) => {
            const pct = Math.min(100, Math.round((ch.progress / ch.target) * 100));
            return (
              <div
                key={ch.id}
                className={`rounded-2xl p-4 border space-y-2.5 ${
                  ch.completed
                    ? 'bg-emerald-950/30 border-emerald-400/60'
                    : 'bg-[#12121B] border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-white">{ch.title}</p>
                    <p className="text-xs font-extrabold text-[#FFD700] mt-0.5">
                      Reward: {ch.rewardCoins.toLocaleString()} Coins Pao 🪙
                    </p>
                  </div>
                  {ch.completed ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic();
                        const step = ch.actionType === 'watchLive' ? 20 : ch.actionType === 'invite' ? 3 : 1;
                        onProgressChallenge(ch.id, step);
                      }}
                      className="px-3 py-1.5 rounded-full gold-gradient text-white text-[11px] font-black shrink-0 active:scale-95"
                    >
                      {ch.actionType === 'watchLive'
                        ? '+20 Min Watch'
                        : ch.actionType === 'invite'
                          ? '+3 Dost Invite'
                          : '+1 Complete Step'}
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="h-2.5 rounded-full bg-black/50 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full transition-all duration-300 ${
                        ch.completed ? 'bg-emerald-500' : 'gold-gradient'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-white/70 tabular-nums">
                    <span>
                      Progress: {ch.progress}/{ch.target} {ch.unit || ''}
                    </span>
                    <span>{pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// =================== CHALLENGE COMPLETE CELEBRATION POPUP ===================
interface ChallengeCompletePopupProps {
  challenge: { title: string; rewardCoins: number } | null;
  onClose: () => void;
}

export const ChallengeCompletePopup: React.FC<ChallengeCompletePopupProps> = ({ challenge, onClose }) => {
  if (!challenge) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-[105] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs rounded-3xl bg-gradient-to-b from-[#2A1D06] to-[#12121A] border-2 border-[#FFD700] p-6 text-center space-y-3 shadow-2xl gold-glow"
      >
        <div className="w-16 h-16 rounded-full gold-gradient mx-auto flex items-center justify-center shadow-lg">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <p className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-4 h-4" />
          <span>Challenge Complete!</span>
        </p>
        <h4 className="text-base font-black text-white">{challenge.title}</h4>
        <p className="text-2xl font-black text-[#FFD700]">+{challenge.rewardCoins.toLocaleString()} Coins</p>
        <p className="text-xs text-white/80">Auto added to your Vibe Live Wallet!</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full h-10 rounded-full gold-gradient text-white text-xs font-black"
        >
          Awesome 🎉
        </button>
      </div>
    </div>
  );
};
