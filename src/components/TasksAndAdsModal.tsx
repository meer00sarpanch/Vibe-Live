import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Coins,
  Crown,
  Gift,
  Play,
  Sparkles,
  UserPlus,
  Users,
  Video,
  X,
} from 'lucide-react';
import { DailyTaskItem, HostTaskItem, VipStatus } from '../types/mehfil';
import { playGiftChime, triggerHaptic } from '../utils/haptics';

// 1. REWARDED VIDEO AD POPUP (HISSA 22)
interface RewardedAdModalProps {
  open: boolean;
  rewardCoins: number;
  onClose: () => void;
  onComplete: (coinsEarned: number) => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  open,
  rewardCoins,
  onClose,
  onComplete,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSecondsLeft(30);
    setFinished(false);
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-[#14141C] border border-[#FFD700]/45 overflow-hidden shadow-2xl">
        <div className="h-12 px-4 bg-[#0B0B10] flex items-center justify-between border-b border-white/10">
          <span className="text-xs font-bold text-[#FFD700]">Sponsored Rewarded Video</span>
          {finished ? (
            <button
              type="button"
              onClick={() => {
                playGiftChime();
                onComplete(rewardCoins);
              }}
              className="px-3 py-1 rounded-full gold-gradient text-white text-xs font-extrabold"
            >
              Claim +{rewardCoins} Coins
            </button>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-[#26262F] text-xs font-mono-num font-bold text-white">
              Reward in {secondsLeft}s
            </span>
          )}
        </div>

        <div className="p-6 text-center space-y-4 bg-gradient-to-b from-[#1E1338] to-[#0B0B10]">
          <div className="w-20 h-20 rounded-2xl gold-gradient mx-auto flex items-center justify-center shadow-xl">
            <Play className="w-10 h-10 text-white fill-white" />
          </div>
          <h3 className="text-lg font-extrabold text-white">Vibe Live Royal Studio Ad</h3>
          <p className="text-xs text-white/75">
            {finished
              ? `Ad complete! Claim your ${rewardCoins} Gold Coins now.`
              : 'Watch till 0s to unlock your free Gold Coins reward.'}
          </p>

          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              style={{ width: `${((30 - secondsLeft) / 30) * 100}%` }}
              className="h-full gold-gradient transition-all duration-1000"
            />
          </div>

          {!finished && (
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-white/50 underline pt-1"
            >
              Close Early (No Reward)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 2. USER DAILY TASKS PAGE (HISSA 22)
interface DailyTasksModalProps {
  open: boolean;
  tasks: DailyTaskItem[];
  allBonusClaimed: boolean;
  vipStatus: VipStatus;
  onClose: () => void;
  onClaimTask: (taskId: string) => void;
  onClaimAllBonus: () => void;
  onCompleteAction: (taskId: string) => void;
}

export const DailyTasksModal: React.FC<DailyTasksModalProps> = ({
  open,
  tasks,
  allBonusClaimed,
  vipStatus,
  onClose,
  onClaimTask,
  onClaimAllBonus,
  onCompleteAction,
}) => {
  const [chestOpened, setChestOpened] = useState(false);
  if (!open) return null;

  const multiplier = vipStatus.level >= 2 ? 2 : 1;
  const completedCount = tasks.filter((t) => t.progress >= t.target).length;
  const allReady = completedCount === tasks.length;

  return (
    <div className="fixed inset-0 z-[85] bg-[#07070D] text-white overflow-y-auto pb-12">
      <div className="gold-line-top" />
      <header className="sticky top-0 z-20 h-14 px-4 bg-[#07070D]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Daily Tasks</h1>
        </div>
        {multiplier === 2 && (
          <span className="px-3 py-1 rounded-full gold-gradient text-xs font-extrabold text-white">
            VIP 2x Rewards Active
          </span>
        )}
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Daily All Complete Bonus Chest */}
        <div className="rounded-3xl bg-gradient-to-r from-[#2D1548] via-[#1A1A22] to-[#2B1D06] border border-[#FFD700]/50 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center ${chestOpened ? 'animate-bounce' : ''}`}>
              <Gift className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Daily All Complete Bonus</h2>
              <p className="text-xs text-[#FFD700] font-semibold">
                {completedCount}/{tasks.length} Done · Bonus {50 * multiplier} Coins + Treasure Chest
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!allReady || allBonusClaimed}
            onClick={() => {
              triggerHaptic(20);
              setChestOpened(true);
              onClaimAllBonus();
            }}
            className={`px-4 py-2 rounded-full text-xs font-extrabold shrink-0 ${
              allBonusClaimed
                ? 'bg-emerald-600/30 text-emerald-300'
                : allReady
                  ? 'gold-gradient text-white shadow-lg animate-pulse'
                  : 'bg-[#26262F] text-white/50'
            }`}
          >
            {allBonusClaimed ? 'Claimed ✓' : `Open +${50 * multiplier}`}
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-2.5">
          {tasks.map((task) => {
            const done = task.progress >= task.target;
            const pct = Math.min(100, Math.round((task.progress / task.target) * 100));
            return (
              <div
                key={task.id}
                className="p-3.5 rounded-2xl bg-[#14141C] border border-white/10 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{task.title}</p>
                    <p className="text-xs text-[#FFD700] font-semibold">
                      +{task.rewardCoins * multiplier} Coins · {task.progress}/{task.target} {task.unit || ''}
                    </p>
                  </div>

                  {task.claimed ? (
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Claimed</span>
                    </span>
                  ) : done ? (
                    <button
                      type="button"
                      onClick={() => onClaimTask(task.id)}
                      className="px-4 py-1.5 rounded-full gold-gradient text-white text-xs font-extrabold shadow active:scale-95"
                    >
                      Claim
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onCompleteAction(task.id)}
                      className="px-3.5 py-1.5 rounded-full bg-[#26262F] text-[#FFD700] border border-[#FFD700]/35 text-xs font-bold active:scale-95"
                    >
                      Go
                    </button>
                  )}
                </div>

                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div style={{ width: `${pct}%` }} className="h-full gold-gradient transition-all duration-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 3. HOST SALARY & 1 MONTH FREE STREAMER CENTER (HISSA 22 FINAL)
export const HOST_SALARY_LEVELS: Record<
  1 | 2 | 3,
  {
    level: 1 | 2 | 3;
    title: string;
    dailyHours: number;
    weeklyHours: number;
    giftTarget: number;
    dailySalaryPkr: number;
    weeklySalaryPkr: number;
    giftSharePct: number;
  }
> = {
  1: {
    level: 1,
    title: 'Level 1',
    dailyHours: 3,
    weeklyHours: 21,
    giftTarget: 2000,
    dailySalaryPkr: 300,
    weeklySalaryPkr: 2100,
    giftSharePct: 40,
  },
  2: {
    level: 2,
    title: 'Level 2',
    dailyHours: 5,
    weeklyHours: 35,
    giftTarget: 5000,
    dailySalaryPkr: 700,
    weeklySalaryPkr: 4900,
    giftSharePct: 50,
  },
  3: {
    level: 3,
    title: 'Level 3',
    dailyHours: 7,
    weeklyHours: 49,
    giftTarget: 10000,
    dailySalaryPkr: 1200,
    weeklySalaryPkr: 8400,
    giftSharePct: 60,
  },
};

interface StreamerCenterModalProps {
  open: boolean;
  hostState: import('../types/mehfil').HostSalaryState;
  hostTasks: HostTaskItem[];
  onClose: () => void;
  onJoinHostFree: () => void;
  onSelectLevel: (level: 1 | 2 | 3) => void;
  onToggleWeekLock: () => void;
  onAddLiveTime: (seconds: number) => void;
  onSimulateGiftReceived: (coins: number) => void;
  onClaimMonthBonus: (bonusId: 'b-streak' | 'b-hours' | 'b-gift', amountPkr: number) => void;
  onSettleWeekSunday: () => void;
  onRequestWithdraw: (amountPkr: number, method: 'JazzCash' | 'Easypaisa' | 'Bank', account: string) => void;
  onRecruitHost: (hostName: string) => void;
  onClaimAgencyCommission: () => void;
  onGoLiveNow: () => void;
}

export const StreamerCenterModal: React.FC<StreamerCenterModalProps> = ({
  open,
  hostState,
  onClose,
  onJoinHostFree,
  onSelectLevel,
  onToggleWeekLock,
  onAddLiveTime,
  onSimulateGiftReceived,
  onClaimMonthBonus,
  onSettleWeekSunday,
  onRequestWithdraw,
  onRecruitHost,
  onClaimAgencyCommission,
  onGoLiveNow,
}) => {
  const [subTab, setSubTab] = useState<'dashboard' | 'month1' | 'levels' | 'agency' | 'withdraw'>('dashboard');
  const [withdrawMethod, setWithdrawMethod] = useState<'JazzCash' | 'Easypaisa' | 'Bank'>('JazzCash');
  const [withdrawAccount, setWithdrawAccount] = useState('0300-1234567');
  const [withdrawAmount, setWithdrawAmount] = useState('1000');
  const [newRecruitName, setNewRecruitName] = useState('');

  if (!open) return null;

  const activeRule = HOST_SALARY_LEVELS[hostState.selectedLevel];
  const todayHours = hostState.todayLiveSeconds / 3600;
  const weeklyHours = hostState.weeklyLiveSeconds / 3600;
  const remainingWeeklyHours = Math.max(0, activeRule.weeklyHours - weeklyHours);
  const hoursPct = Math.min(100, Math.round((weeklyHours / activeRule.weeklyHours) * 100));
  const todayPct = Math.min(100, Math.round((todayHours / activeRule.dailyHours) * 100));
  const giftPct = Math.min(100, Math.round((hostState.weeklyGiftCoins / activeRule.giftTarget) * 100));

  const hoursTargetMet = weeklyHours >= activeRule.weeklyHours;
  const giftTargetMet = hostState.weeklyGiftCoins >= activeRule.giftTarget;
  const todayHoursMet = todayHours >= activeRule.dailyHours;

  // STRICT RULE: Without Gift Target, Salary = 0 (Sirf Gift % milega!)
  const todaySalaryPkr = todayHoursMet && giftTargetMet ? activeRule.dailySalaryPkr : 0;
  const projectedWeeklySalaryPkr = hoursTargetMet && giftTargetMet ? activeRule.weeklySalaryPkr : 0;
  const estimatedGiftRevenuePkr = Math.round(hostState.weeklyGiftCoins * 0.3 * (activeRule.giftSharePct / 100));
  const totalWithdrawablePkr = hostState.salaryWalletPkr + hostState.giftWalletPkr;

  const monthBonuses = [
    {
      id: 'b-streak' as const,
      title: 'Pehle 7 Din Lagatar Live',
      rewardPkr: 500,
      progress: hostState.monthStreakDays,
      target: 7,
      unit: 'Days',
    },
    {
      id: 'b-hours' as const,
      title: 'Pehle Month Me 100 Ghante Poore',
      rewardPkr: 2000,
      progress: Math.floor(hostState.monthTotalHours),
      target: 100,
      unit: 'Hrs',
    },
    {
      id: 'b-gift' as const,
      title: 'Pehli Baar 10,000 Coins Gift',
      rewardPkr: 1000,
      progress: hostState.monthGiftCoins,
      target: 10000,
      unit: 'Coins',
    },
  ];

  const formatHrs = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="fixed inset-0 z-[85] bg-[#07070D] text-white overflow-y-auto pb-16">
      <div className="gold-line-top" />
      <header className="sticky top-0 z-20 h-14 px-4 bg-[#07070D]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#1A1A22] text-white flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-extrabold text-white truncate flex items-center gap-1.5">
              <Video className="w-4 h-4 text-[#FFD700] shrink-0" />
              <span>Host Salary Center</span>
            </h1>
            <p className="text-[10px] text-emerald-400 font-bold truncate">
              {hostState.joined
                ? hostState.isFirstMonthFree
                  ? 'New Host - 1 Month Free · Zero Fee'
                  : `Level ${hostState.selectedLevel} Host · App Gift Revenue Funded`
                : '0 Rs Joining Fee · 1 Month Free'}
            </p>
          </div>
        </div>

        {hostState.joined && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onGoLiveNow();
            }}
            className="px-3 py-1.5 rounded-full gold-gradient text-white text-xs font-extrabold shadow shrink-0 active:scale-95"
          >
            Go Live Now
          </button>
        )}
      </header>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {!hostState.joined ? (
          /* 1. HOST JOINING - 1 MONTH FREE (0 RS FEE) */
          <div className="rounded-3xl bg-gradient-to-br from-[#241908] via-[#14141C] to-[#1D122A] border-2 border-[#FFD700]/65 p-6 text-center space-y-4 gold-glow">
            <div className="w-16 h-16 rounded-2xl gold-gradient mx-auto flex items-center justify-center shadow-xl">
              <Crown className="w-9 h-9 text-white fill-white/30" />
            </div>
            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-extrabold">
                0 Rs Joining Fee · 1 Month Free
              </span>
              <h2 className="text-xl font-black text-white pt-1">Become a Vibe Live Host</h2>
              <p className="text-xs text-[#9CA3AF] max-w-md mx-auto leading-relaxed">
                Pehle Month me koi mandatory target nahi — sirf seekho aur live aao! Bonus sirf kaam poora hone par milega. Salary hamesha App ke Gift Revenue se auto aayegi.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-left text-[11px]">
              <div className="p-2.5 rounded-2xl bg-black/35 border border-white/10">
                <p className="font-extrabold text-[#FFD700]">Level 1 (3h)</p>
                <p className="text-white/80">Rs. 300/Day + 40% Gift</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-black/35 border border-white/10">
                <p className="font-extrabold text-[#FFD700]">Level 2 (5h)</p>
                <p className="text-white/80">Rs. 700/Day + 50% Gift</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-black/35 border border-white/10">
                <p className="font-extrabold text-[#FFD700]">Level 3 (7h)</p>
                <p className="text-white/80">Rs. 1200/Day + 60% Gift</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                playGiftChime();
                onJoinHostFree();
              }}
              className="w-full h-12 rounded-full gold-gradient text-white font-black text-sm shadow-xl gold-glow active:scale-95 transition-transform"
            >
              Become Host (Free - 0 Rs Fee)
            </button>
          </div>
        ) : (
          <>
            {/* New Host - 1 Month Free Badge (30 Days) + Sub-Navigation Tabs */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Host - 1 Month Free ({hostState.firstMonthDaysLeft} Days Left)</span>
              </span>
              <span className="text-[11px] font-bold text-[#FFD700]">
                Week: Mon–Sun · Auto Sunday 12:00 AM
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1">
              {[
                { id: 'dashboard' as const, label: 'Dashboard' },
                { id: 'month1' as const, label: '1st Month' },
                { id: 'levels' as const, label: 'Levels 1-3' },
                { id: 'agency' as const, label: 'Agency 10%' },
                { id: 'withdraw' as const, label: 'Withdraw' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSubTab(t.id)}
                  className={`h-9 rounded-xl text-[10px] sm:text-[11px] font-extrabold transition-all ${
                    subTab === t.id
                      ? 'gold-gradient text-white shadow'
                      : 'bg-[#14141C] text-[#9CA3AF] border border-white/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Dual Wallets: Salary Wallet + Gift Wallet Alag Alag */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#23190B] to-[#14141C] border border-[#FFD700]/45">
                <p className="text-[11px] font-bold text-[#9CA3AF]">Salary Wallet</p>
                <p className="text-xl font-black text-[#FFD700] tabular-nums mt-0.5">
                  Rs. {hostState.salaryWalletPkr.toLocaleString()}
                </p>
                <p className="text-[10px] text-white/60 mt-0.5">App Gift Pool Funded</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#13221C] to-[#14141C] border border-emerald-500/45">
                <p className="text-[11px] font-bold text-[#9CA3AF]">Gift Wallet</p>
                <p className="text-xl font-black text-emerald-400 tabular-nums mt-0.5">
                  Rs. {hostState.giftWalletPkr.toLocaleString()}
                </p>
                <p className="text-[10px] text-white/60 mt-0.5">{activeRule.giftSharePct}% Fan Gift Share</p>
              </div>
            </div>

            {/* ==================== SUBTAB 1: HOST DASHBOARD ==================== */}
            {subTab === 'dashboard' && (
              <div className="space-y-3">
                {/* 4 Key Progress Metrics */}
                <div className="rounded-3xl bg-[#14141C] border border-[#FFD700]/35 p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-white">
                      Level {hostState.selectedLevel} Weekly Tracker (Mon–Sun)
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full gold-gradient text-[10px] font-black text-white">
                      Target: {activeRule.dailyHours}h/Day
                    </span>
                  </div>

                  {/* 1. Today Live Hours */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/80 font-semibold">Aaj Kitne Ghante Live Hui</span>
                      <span className="font-extrabold text-[#FFD700] tabular-nums">
                        {formatHrs(hostState.todayLiveSeconds)} / {activeRule.dailyHours}h 0m
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <div style={{ width: `${todayPct}%` }} className="h-full gold-gradient transition-all" />
                    </div>
                  </div>

                  {/* 2. Weekly Hours & Remaining */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/80 font-semibold">
                        Week Me Baaki: {remainingWeeklyHours.toFixed(1)} Ghante
                      </span>
                      <span className="font-extrabold text-sky-400 tabular-nums">
                        {weeklyHours.toFixed(1)} / {activeRule.weeklyHours} Hrs
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{ width: `${hoursPct}%` }}
                        className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* 3. Gift Target (Mandatory for Salary!) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/80 font-semibold">Gift Target (Lazmi For Salary)</span>
                      <span
                        className={`font-extrabold tabular-nums ${
                          giftTargetMet ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {hostState.weeklyGiftCoins.toLocaleString()} / {activeRule.giftTarget.toLocaleString()} Coins
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{ width: `${giftPct}%` }}
                        className={`h-full transition-all ${
                          giftTargetMet ? 'bg-emerald-500' : 'bg-gradient-to-r from-rose-500 to-amber-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* 4. Today Salary & Strict No-Gift = 0 Rule Banner */}
                  <div
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                      giftTargetMet
                        ? 'bg-emerald-500/15 border-emerald-500/40'
                        : 'bg-rose-500/10 border-rose-500/35'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-extrabold text-white">
                        Aaj Ki Salary: Rs. {todaySalaryPkr.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-white/75">
                        {!giftTargetMet
                          ? 'Gift Target poora nahi hua → Weekly Salary Rs. 0 (Sirf Gift % milega)'
                          : hoursTargetMet
                            ? `Both Hours + Gift Complete! Sunday 12 AM auto Rs. ${activeRule.weeklySalaryPkr.toLocaleString()} + Rs. ${estimatedGiftRevenuePkr}`
                            : `Gift Target Done ✓ · Complete ${remainingWeeklyHours.toFixed(1)}h more for Weekly Salary!`}
                      </p>
                    </div>
                  </div>

                  {/* Quick Interactive Progress Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onAddLiveTime(3600 * 3)}
                      className="h-9 rounded-xl bg-[#22222E] hover:bg-[#2C2C3B] border border-white/10 text-[11px] font-bold text-white active:scale-95"
                    >
                      + Log 3h Valid Face Live
                    </button>
                    <button
                      type="button"
                      onClick={() => onSimulateGiftReceived(1000)}
                      className="h-9 rounded-xl bg-[#22222E] hover:bg-[#2C2C3B] border border-[#FFD700]/30 text-[11px] font-bold text-[#FFD700] active:scale-95"
                    >
                      + Receive 1,000 Gift Coins
                    </button>
                  </div>
                </div>

                {/* Sunday 12:00 AM Auto-Settlement Card */}
                <div className="rounded-2xl bg-[#14141C] border border-white/10 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-extrabold text-white">Sunday 12:00 AM Auto Settlement</p>
                      <p className="text-[11px] text-[#9CA3AF]">
                        Week complete na ho to Salary expire ho jati hai (agle week add nahi hogi).
                      </p>
                    </div>
                  </div>
                  <div className="text-xs bg-black/35 rounded-xl p-2.5 flex items-center justify-between">
                    <span className="text-white/80">Estimated Sunday Payout:</span>
                    <span className="font-extrabold text-[#FFD700]">
                      Salary Rs. {projectedWeeklySalaryPkr.toLocaleString()} + Gift Rs. {estimatedGiftRevenuePkr.toLocaleString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onSettleWeekSunday}
                    className="w-full h-10 rounded-full gold-gradient text-white text-xs font-extrabold shadow active:scale-95"
                  >
                    Run Sunday 12:00 AM Weekly Settlement
                  </button>
                </div>
              </div>
            )}

            {/* ==================== SUBTAB 2: 1ST MONTH BONUSES (WORK GATED) ==================== */}
            {subTab === 'month1' && (
              <div className="space-y-3">
                <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/40 p-3.5 text-xs space-y-1">
                  <p className="font-extrabold text-emerald-300">
                    New Host - 1 Month Free (No Weekly Target Pressure)
                  </p>
                  <p className="text-white/80">
                    Bonus sirf kaam poora hone par claim hoga. Bina kaam complete kiye bonus lock rahega.
                  </p>
                </div>

                {monthBonuses.map((b) => {
                  const claimed = hostState.claimedMonthBonuses.includes(b.id);
                  const ready = b.progress >= b.target;
                  const pct = Math.min(100, Math.round((b.progress / b.target) * 100));
                  return (
                    <div key={b.id} className="p-4 rounded-2xl bg-[#14141C] border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-white">{b.title}</p>
                          <p className="text-xs font-extrabold text-[#FFD700]">
                            Reward: Rs. {b.rewardPkr.toLocaleString()} · {b.progress.toLocaleString()} / {b.target.toLocaleString()} {b.unit}
                          </p>
                        </div>
                        {claimed ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Paid</span>
                          </span>
                        ) : ready ? (
                          <button
                            type="button"
                            onClick={() => {
                              playGiftChime();
                              onClaimMonthBonus(b.id, b.rewardPkr);
                            }}
                            className="px-4 py-1.5 rounded-full gold-gradient text-white text-xs font-extrabold shadow"
                          >
                            Claim Rs. {b.rewardPkr}
                          </button>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-[#22222C] text-[#9CA3AF] text-[11px] font-bold">
                            Locked ({pct}%)
                          </span>
                        )}
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div style={{ width: `${pct}%` }} className="h-full gold-gradient transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ==================== SUBTAB 3: SELF-SELECT HOST LEVEL 1-3 ==================== */}
            {subTab === 'levels' && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-[#14141C] border border-[#FFD700]/30 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <p className="font-bold text-white">Level Change Rule (Monday Week Start)</p>
                    <p className="text-[11px] text-[#9CA3AF]">
                      {hostState.weekStarted
                        ? 'Week Active — Level locked until Sunday 12:00 AM'
                        : 'Week Start Window Open — Pick your daily target'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleWeekLock}
                    className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-bold text-[#FFD700] shrink-0"
                  >
                    {hostState.weekStarted ? 'Unlock Week Start' : 'Lock Week'}
                  </button>
                </div>

                {([1, 2, 3] as const).map((lvlKey) => {
                  const lvl = HOST_SALARY_LEVELS[lvlKey];
                  const active = hostState.selectedLevel === lvl.level;
                  return (
                    <div
                      key={lvl.level}
                      className={`p-4 rounded-2xl border space-y-2 ${
                        active
                          ? 'bg-[#1F1A10] border-2 border-[#FFD700] gold-glow'
                          : 'bg-[#14141C] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-extrabold text-white">
                            {lvl.title} · Daily {lvl.dailyHours} Ghante Live
                          </h3>
                          <p className="text-xs text-[#FFD700] font-bold">
                            Weekly {lvl.weeklyHours} Hrs · Gift Target {lvl.giftTarget.toLocaleString()} Coins
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={active || hostState.weekStarted}
                          onClick={() => onSelectLevel(lvl.level)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold ${
                            active
                              ? 'bg-emerald-500 text-white'
                              : hostState.weekStarted
                                ? 'bg-[#26262F] text-white/40 cursor-not-allowed'
                                : 'gold-gradient text-white'
                          }`}
                        >
                          {active ? 'Selected' : hostState.weekStarted ? 'Locked' : 'Choose'}
                        </button>
                      </div>
                      <p className="text-xs text-white/85">
                        Salary: <span className="font-bold text-emerald-400">Rs. {lvl.dailySalaryPkr}/Day</span> (Rs.{' '}
                        {lvl.weeklySalaryPkr.toLocaleString()}/Week) +{' '}
                        <span className="font-bold text-[#FFD700]">{lvl.giftSharePct}% Gift Share</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ==================== SUBTAB 4: AGENCY SYSTEM (10 HOSTS = EXTRA 10%) ==================== */}
            {subTab === 'agency' && (
              <div className="space-y-3">
                <div className="rounded-3xl bg-gradient-to-br from-[#1C122D] to-[#14141C] border border-[#FFD700]/45 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#FFD700]" />
                        <span>Host Agency Program</span>
                      </h2>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        10 Hosts Lao → Official Agency Bano + Extra 10% Revenue Commission!
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${
                        hostState.isAgency
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                          : 'bg-amber-500/20 text-[#FFD700] border border-[#FFD700]/40'
                      }`}
                    >
                      {hostState.isAgency ? 'AGENCY ACTIVE (10%)' : `${hostState.recruitedHosts.length} / 10 Hosts`}
                    </span>
                  </div>

                  <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, hostState.recruitedHosts.length * 10)}%` }}
                      className="h-full gold-gradient transition-all"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRecruitName}
                      onChange={(e) => setNewRecruitName(e.target.value)}
                      placeholder="New Host Name (e.g. Zoya Live)..."
                      className="flex-1 h-10 px-3 rounded-xl bg-[#0B0B10] border border-white/15 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const name = newRecruitName.trim() || `Host #${hostState.recruitedHosts.length + 1}`;
                        onRecruitHost(name);
                        setNewRecruitName('');
                      }}
                      className="px-3.5 h-10 rounded-xl gold-gradient text-white text-xs font-extrabold flex items-center gap-1 shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Add Host</span>
                    </button>
                  </div>

                  {hostState.isAgency && (
                    <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-extrabold text-emerald-300">
                          Agency Commission Earned: Rs. {hostState.agencyEarningsPkr.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-white/75">
                          Extra 10% auto calculated from your {hostState.recruitedHosts.length} hosts&apos; gift revenue
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onClaimAgencyCommission}
                        className="px-3 py-1.5 rounded-full gold-gradient text-white text-xs font-extrabold shrink-0"
                      >
                        Collect +10%
                      </button>
                    </div>
                  )}
                </div>

                {hostState.recruitedHosts.length > 0 && (
                  <div className="rounded-2xl bg-[#14141C] border border-white/10 p-3 space-y-2">
                    <p className="text-xs font-bold text-[#FFD700]">
                      Your Recruited Hosts ({hostState.recruitedHosts.length})
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {hostState.recruitedHosts.map((rh, i) => (
                        <div
                          key={rh.id}
                          className="px-3 py-2 rounded-xl bg-[#0B0B10] flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-white">
                            {i + 1}. {rh.name}
                          </span>
                          <span className="text-[#FFD700] font-bold">
                            {rh.weeklyGiftCoins.toLocaleString()} Gift Coins
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== SUBTAB 5: WITHDRAWAL (MIN RS 1000 · MON -> WED) ==================== */}
            {subTab === 'withdraw' && (
              <div className="space-y-3.5">
                <div className="rounded-2xl bg-[#14141C] border border-[#FFD700]/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Total Withdrawable Balance</p>
                      <p className="text-2xl font-black text-[#FFD700] tabular-nums">
                        Rs. {totalWithdrawablePkr.toLocaleString()}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-bold text-emerald-300">
                      Min Rs. 1,000
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5">
                    Monday Request → Wednesday Tak Account Me Aayegi (JazzCash / Easypaisa / Bank)
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {(['JazzCash', 'Easypaisa', 'Bank'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setWithdrawMethod(m)}
                        className={`h-9 rounded-xl text-xs font-bold border ${
                          withdrawMethod === m
                            ? 'gold-gradient border-transparent text-white'
                            : 'bg-[#1A1A22] border-white/10 text-white/75'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={withdrawAccount}
                      onChange={(e) => setWithdrawAccount(e.target.value)}
                      placeholder="Account / Mobile No."
                      className="h-10 px-3 rounded-xl bg-[#1A1A22] border border-white/15 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                    />
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min={1000}
                      placeholder="Amount PKR"
                      className="h-10 px-3 rounded-xl bg-[#1A1A22] border border-white/15 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={
                      totalWithdrawablePkr < 1000 ||
                      Number(withdrawAmount) < 1000 ||
                      Number(withdrawAmount) > totalWithdrawablePkr ||
                      !withdrawAccount.trim()
                    }
                    onClick={() => {
                      triggerHaptic(18);
                      onRequestWithdraw(Number(withdrawAmount), withdrawMethod, withdrawAccount.trim());
                    }}
                    className="w-full h-11 rounded-full gold-gradient disabled:opacity-45 text-white font-extrabold text-sm shadow-lg"
                  >
                    {totalWithdrawablePkr < 1000
                      ? 'Minimum Rs. 1,000 Required'
                      : `Request Rs. ${Number(withdrawAmount || 0).toLocaleString()} via ${withdrawMethod}`}
                  </button>
                </div>

                {hostState.withdrawals.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-[#9CA3AF]">Withdrawal History</h3>
                    {hostState.withdrawals.map((w) => (
                      <div
                        key={w.id}
                        className="p-3 rounded-2xl bg-[#14141C] border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">
                            Rs. {w.amountPkr.toLocaleString()} · {w.method}
                          </p>
                          <p className="text-[11px] text-[#9CA3AF]">{w.account} · {w.date}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-[#FFD700] text-[10px] font-bold">
                          {w.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

