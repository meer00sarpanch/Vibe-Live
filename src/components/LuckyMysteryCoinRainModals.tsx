import React, { useEffect, useState } from 'react';
import {
  Award,
  CalendarCheck,
  Coins,
  Gift,
  History,
  Sparkles,
  Timer,
  UserPlus,
  X,
} from 'lucide-react';
import {
  DAILY_CHECKIN_DAYS,
  LUCKY_SPIN_SLICES,
  MYSTERY_BOX_TIERS,
} from '../data/mockData';
import {
  DailyCheckInState,
  LuckySpinSlice,
  LuckySpinState,
  MysteryBoxHistoryItem,
  MysteryBoxTier,
} from '../types/mehfil';
import {
  playGiftChime,
  playMysteryOpenSound,
  playTone,
  triggerHaptic,
} from '../utils/haptics';

// 1. LUCKY SPIN MODAL (5-second rotation, 9 prizes, weighted odds, max 3/day)
interface LuckySpinModalProps {
  open: boolean;
  spinState: LuckySpinState;
  onClose: () => void;
  onSpinComplete: (prize: LuckySpinSlice) => void;
  onInviteFriendSpin: () => void;
}

export const LuckySpinModal: React.FC<LuckySpinModalProps> = ({
  open,
  spinState,
  onClose,
  onSpinComplete,
  onInviteFriendSpin,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [wonSlice, setWonSlice] = useState<LuckySpinSlice | null>(null);

  if (!open) return null;

  const maxAllowed = Math.min(3, 1 + spinState.extraSpinsEarned);
  const remaining = Math.max(0, maxAllowed - spinState.spinsUsedToday);
  const sliceAngle = 360 / LUCKY_SPIN_SLICES.length;

  const pickWeightedSliceIndex = () => {
    const totalWeight = LUCKY_SPIN_SLICES.reduce((acc, s) => acc + s.weight, 0);
    let r = Math.random() * totalWeight;
    for (let i = 0; i < LUCKY_SPIN_SLICES.length; i++) {
      r -= LUCKY_SPIN_SLICES[i].weight;
      if (r <= 0) return i;
    }
    return 3; // 500 Coins fallback
  };

  const handleSpin = () => {
    if (spinning || remaining <= 0) return;
    triggerHaptic(20);
    setWonSlice(null);
    setSpinning(true);

    const winnerIdx = pickWeightedSliceIndex();
    const targetSlice = LUCKY_SPIN_SLICES[winnerIdx];
    const centerOfSlice = winnerIdx * sliceAngle + sliceAngle / 2;
    const extraTurns = 360 * 6; // 6 full rotations over 5s
    const finalAngle = rotationDeg - (rotationDeg % 360) + extraTurns + (360 - centerOfSlice);

    setRotationDeg(finalAngle);
    playTone(540, 120, 'triangle', 0.08);

    window.setTimeout(() => {
      setSpinning(false);
      setWonSlice(targetSlice);
      playGiftChime();
      triggerHaptic(25);
      onSpinComplete(targetSlice);
    }, 5000);
  };

  const conicStops = LUCKY_SPIN_SLICES.map((s, idx) => {
    const start = (idx * sliceAngle).toFixed(2);
    const end = ((idx + 1) * sliceAngle).toFixed(2);
    return `${s.color} ${start}deg ${end}deg`;
  }).join(', ');

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#1E1405] via-[#12121A] to-[#0A0A12] border-2 border-[#FFD700] p-5 text-white space-y-4 shadow-2xl gold-glow max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#FFD700] flex items-center gap-1.5">
              <Sparkles className="w-5 h-5" />
              <span>Lucky Spin — Roz Free</span>
            </h2>
            <p className="text-[11px] text-white/75">
              Spins Left Today: <strong className="text-[#FFD700]">{remaining}</strong> / {maxAllowed} (Max 3/Day)
            </p>
          </div>
          <button
            type="button"
            onClick={() => !spinning && onClose()}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spinning Gold Wheel */}
        <div className="relative flex flex-col items-center py-2">
          {/* Pointer */}
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-[#FFD700] drop-shadow-[0_0_8px_#FFD700] z-20 -mb-2" />

          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2 gold-gradient shadow-[0_0_32px_rgba(255,215,0,0.45)]">
            <div
              style={{
                background: `conic-gradient(${conicStops})`,
                transform: `rotate(${rotationDeg}deg)`,
                transition: spinning ? 'transform 5000ms cubic-bezier(0.15, 0.85, 0.2, 1)' : 'none',
              }}
              className="w-full h-full rounded-full relative border-4 border-yellow-200 overflow-hidden"
            >
              {LUCKY_SPIN_SLICES.map((s, idx) => {
                const angle = idx * sliceAngle + sliceAngle / 2;
                return (
                  <div
                    key={s.id}
                    style={{
                      transform: `rotate(${angle}deg)`,
                    }}
                    className="absolute inset-0 flex items-start justify-center pt-3 pointer-events-none"
                  >
                    <span className="text-[10px] font-black text-white drop-shadow text-center leading-tight max-w-[54px]">
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              disabled={spinning || remaining <= 0}
              onClick={handleSpin}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full gold-gradient border-4 border-white text-white font-black text-xs shadow-xl flex items-center justify-center active:scale-95 disabled:opacity-50"
            >
              {spinning ? '...' : 'SPIN'}
            </button>
          </div>
        </div>

        {wonSlice && (
          <div className="rounded-2xl bg-emerald-500/20 border border-emerald-400 p-3 text-center space-y-1">
            <p className="text-xs font-extrabold text-emerald-300">CONGRATULATIONS! 🎉</p>
            <p className="text-base font-black text-[#FFD700]">Won: {wonSlice.label}</p>
            <p className="text-[11px] text-white/80">Auto-credited to your Vibe Live Wallet!</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={spinning || remaining <= 0}
            onClick={handleSpin}
            className="h-11 rounded-full gold-gradient text-white font-extrabold text-xs shadow-lg disabled:opacity-45"
          >
            {spinning ? 'Spinning (5s)...' : remaining > 0 ? `Spin Free (${remaining})` : 'No Spins Left'}
          </button>

          <button
            type="button"
            disabled={spinning || spinState.extraSpinsEarned >= 2}
            onClick={onInviteFriendSpin}
            className="h-11 rounded-full bg-[#1E1E2B] border border-[#FFD700]/50 text-[#FFD700] font-extrabold text-xs flex items-center justify-center gap-1.5 disabled:opacity-45"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite 1 Friend (+1)</span>
          </button>
        </div>

        {/* Live Ticker Inside Modal */}
        <div className="rounded-xl bg-black/50 border border-white/10 p-2.5 space-y-1">
          <p className="text-[10px] font-bold uppercase text-[#FFD700]">Live Spin Winners</p>
          <div className="space-y-0.5 text-[11px] text-white/85">
            {spinState.tickerFeed.slice(0, 3).map((item, idx) => (
              <p key={idx} className="truncate">• {item}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. MYSTERY BOX MODAL (3 Levels: Rs 100 / Rs 500 / Rs 1000 + Shake -> Golden Burst + History)
interface MysteryBoxModalProps {
  open: boolean;
  coins: number;
  history: MysteryBoxHistoryItem[];
  onClose: () => void;
  onOpenBox: (tier: MysteryBoxTier) => { prizeLabel: string; ok: boolean };
}

export const MysteryBoxModal: React.FC<MysteryBoxModalProps> = ({
  open,
  coins,
  history,
  onClose,
  onOpenBox,
}) => {
  const [animPhase, setAnimPhase] = useState<'idle' | 'shaking' | 'revealed'>('idle');
  const [activeTierName, setActiveTierName] = useState('');
  const [revealedPrize, setRevealedPrize] = useState('');

  if (!open) return null;

  const triggerBox = (tier: MysteryBoxTier) => {
    if (animPhase === 'shaking') return;
    triggerHaptic(20);
    setActiveTierName(`${tier.name} (Rs ${tier.pricePkr})`);
    setAnimPhase('shaking');

    window.setTimeout(() => {
      const res = onOpenBox(tier);
      if (!res.ok) {
        setAnimPhase('idle');
        return;
      }
      playMysteryOpenSound();
      triggerHaptic(30);
      setRevealedPrize(res.prizeLabel);
      setAnimPhase('revealed');
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#0D0D15] border-2 border-[#FFD700] p-5 text-white space-y-4 shadow-2xl gold-glow max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#FFD700] flex items-center gap-1.5">
              <Gift className="w-5 h-5" />
              <span>Mystery Box 🎁</span>
            </h2>
            <p className="text-[11px] text-[#9CA3AF]">Your Balance: {coins.toLocaleString()} Coins</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAnimPhase('idle');
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Box Stage Animation */}
        <div className="rounded-3xl bg-gradient-to-b from-[#2A1B08] to-[#12121A] border border-[#FFD700]/40 p-5 text-center space-y-2 relative overflow-hidden">
          {animPhase === 'shaking' && (
            <>
              <div className="text-6xl animate-box-shake inline-block">🎁</div>
              <p className="text-xs font-extrabold text-[#FFD700] animate-pulse">
                Opening {activeTierName}...
              </p>
            </>
          )}
          {animPhase === 'revealed' && (
            <div className="space-y-1.5">
              <div className="w-16 h-16 mx-auto rounded-full gold-gradient flex items-center justify-center shadow-[0_0_40px_#FFD700] animate-bounce">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs font-bold text-amber-200">{activeTierName} Unlocked!</p>
              <p className="text-lg font-black text-[#FFD700]">{revealedPrize}</p>
            </div>
          )}
          {animPhase === 'idle' && (
            <div className="space-y-1">
              <div className="text-5xl">🎁</div>
              <p className="text-xs font-semibold text-white/80">
                100 se 10,000 Coins, VIP Frame ya Special Gift!
              </p>
            </div>
          )}
        </div>

        {/* 3 Tiers */}
        <div className="space-y-2.5">
          {MYSTERY_BOX_TIERS.map((tier) => (
            <div
              key={tier.id}
              className="rounded-2xl bg-[#161622] border border-white/10 p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">{tier.name}</span>
                  <span className="px-2 py-0.5 rounded-full gold-gradient text-[10px] font-black text-white">
                    Rs {tier.pricePkr}
                  </span>
                </div>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">{tier.desc}</p>
              </div>
              <button
                type="button"
                disabled={animPhase === 'shaking'}
                onClick={() => triggerBox(tier)}
                className={`px-3.5 py-2 rounded-full bg-gradient-to-r ${tier.gradient} text-white text-xs font-extrabold shrink-0 active:scale-95`}
              >
                Open ({tier.costCoins}c)
              </button>
            </div>
          ))}
        </div>

        {/* History: Tumne Kal Kya Jeeta, Aaj Kya Jeeta */}
        <div className="rounded-2xl bg-[#12121A] border border-white/10 p-3 space-y-2">
          <p className="text-xs font-extrabold text-[#FFD700] flex items-center gap-1.5">
            <History className="w-4 h-4" />
            <span>Tumne Kal &amp; Aaj Kya Jeeta</span>
          </p>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between text-[11px] border-b border-white/5 pb-1">
                <div>
                  <span className="font-bold text-amber-300 mr-1.5">[{h.dayLabel}]</span>
                  <span className="text-white/90">{h.boxName}</span>
                </div>
                <span className="font-extrabold text-[#FFD700]">{h.prizeLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. INTERACTIVE 30-SECOND COIN RAIN OVERLAY (Raat 9 Baje - Click Coins 10-100 + Coin King Badge)
interface InteractiveCoinRainOverlayProps {
  active: boolean;
  onCollectCoin: (amount: number) => void;
  onFinish: (totalCaught: number, clicksCount: number) => void;
}

interface FallingDrop {
  id: string;
  leftPct: number;
  amount: number;
  speedSec: number;
}

export const InteractiveCoinRainOverlay: React.FC<InteractiveCoinRainOverlayProps> = ({
  active,
  onCollectCoin,
  onFinish,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [clicks, setClicks] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [drops, setDrops] = useState<FallingDrop[]>([]);

  useEffect(() => {
    if (!active) return;
    setSecondsLeft(30);
    setClicks(0);
    setTotalCoins(0);

    const spawnInterval = window.setInterval(() => {
      const amounts = [10, 20, 35, 50, 75, 100];
      const next: FallingDrop = {
        id: `drop-${Date.now()}-${Math.random()}`,
        leftPct: 8 + Math.random() * 82,
        amount: amounts[Math.floor(Math.random() * amounts.length)],
        speedSec: 2.2 + Math.random() * 1.3,
      };
      setDrops((prev) => [...prev.slice(-14), next]);
    }, 450);

    const timerInterval = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(spawnInterval);
          window.clearInterval(timerInterval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(spawnInterval);
      window.clearInterval(timerInterval);
    };
  }, [active]);

  useEffect(() => {
    if (active && secondsLeft === 0) {
      onFinish(totalCoins, clicks);
    }
  }, [active, secondsLeft, totalCoins, clicks, onFinish]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[112] bg-black/45 backdrop-blur-[1px] overflow-hidden">
      {/* Top HUD */}
      <div className="max-w-md mx-auto mt-16 px-4">
        <div className="rounded-2xl bg-gradient-to-r from-[#2D1B06] to-[#1A1025] border-2 border-[#FFD700] px-4 py-2.5 flex items-center justify-between gap-2 gold-glow">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#FFD700] animate-spin" />
            <div>
              <p className="text-xs font-black text-[#FFD700]">9:00 PM COIN RAIN LIVE! ({secondsLeft}s)</p>
              <p className="text-[11px] text-white">Tap falling coins fast (+10 to +100 Coins!)</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-emerald-300">+{totalCoins}c</p>
            <p className="text-[10px] text-white/75">{clicks} taps</p>
          </div>
        </div>
      </div>

      {/* Tap Coins */}
      {drops.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => {
            triggerHaptic(12);
            playTone(740, 90, 'sine', 0.08);
            setDrops((prev) => prev.filter((item) => item.id !== d.id));
            setClicks((c) => c + 1);
            setTotalCoins((t) => t + d.amount);
            onCollectCoin(d.amount);
          }}
          style={{
            left: `${d.leftPct}%`,
            animationDuration: `${d.speedSec}s`,
          }}
          className="absolute -top-10 animate-rain-fall w-12 h-12 rounded-full gold-gradient border-2 border-yellow-100 shadow-[0_0_20px_#FFD700] flex flex-col items-center justify-center active:scale-125 cursor-pointer"
        >
          <span className="text-xs font-black text-amber-950">+{d.amount}</span>
        </button>
      ))}

      {/* Quick Finish Button */}
      <button
        type="button"
        onClick={() => onFinish(totalCoins, clicks)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-black/80 border border-[#FFD700]/60 text-xs font-bold text-[#FFD700]"
      >
        Collect &amp; Close ({totalCoins} Coins)
      </button>
    </div>
  );
};

// 4. DAILY CHECK-IN POP-UP (Day 1..7 + Reset on Miss)
interface DailyCheckInModalProps {
  open: boolean;
  state: DailyCheckInState;
  onClose: () => void;
  onClaimToday: () => void;
  onSimulateMissedDay: () => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  open,
  state,
  onClose,
  onClaimToday,
  onSimulateMissedDay,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[102] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#0E0E17] border-2 border-[#FFD700] p-5 text-white space-y-4 shadow-2xl gold-glow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#FFD700] flex items-center gap-1.5">
              <CalendarCheck className="w-5 h-5" />
              <span>Daily Check-In Streak</span>
            </h2>
            <p className="text-[11px] text-[#9CA3AF]">
              Day {state.streakDay} of 7 · 1 Din Miss Kiya To Day 1 Se Dobara Shuru Hoga
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {DAILY_CHECKIN_DAYS.map((d) => {
            const isPast = d.day < state.streakDay || (d.day === state.streakDay && state.claimedToday);
            const isCurrent = d.day === state.streakDay && !state.claimedToday;
            return (
              <div
                key={d.day}
                className={`${d.day === 7 ? 'col-span-2' : ''} rounded-2xl p-2.5 text-center border flex flex-col items-center justify-center gap-1 ${
                  isCurrent
                    ? 'bg-gradient-to-br from-amber-500/30 to-orange-600/30 border-[#FFD700] gold-glow'
                    : isPast
                      ? 'bg-emerald-500/15 border-emerald-400/50'
                      : 'bg-[#161622] border-white/10 opacity-75'
                }`}
              >
                <span className="text-[10px] font-bold text-white/75">Day {d.day}</span>
                <span className="text-lg">{d.day === 7 ? '👑' : '🪙'}</span>
                <span className="text-[11px] font-black text-[#FFD700] leading-tight">{d.bonusLabel}</span>
                {isPast && <span className="text-[9px] font-bold text-emerald-300">Claimed ✓</span>}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={state.claimedToday}
            onClick={() => {
              playGiftChime();
              onClaimToday();
            }}
            className="flex-1 h-11 rounded-full gold-gradient text-white font-extrabold text-sm shadow-lg disabled:opacity-45"
          >
            {state.claimedToday
              ? `Day ${state.streakDay} Claimed ✓`
              : `Claim Day ${state.streakDay} (+${DAILY_CHECKIN_DAYS[state.streakDay - 1].coins} Coins)`}
          </button>
          <button
            type="button"
            onClick={onSimulateMissedDay}
            className="px-3 h-11 rounded-full bg-[#1C1C28] border border-rose-400/35 text-rose-300 text-[11px] font-bold"
          >
            Miss 1d Reset
          </button>
        </div>

        <div className="rounded-xl bg-black/45 border border-white/10 p-2.5 flex items-center justify-between text-[11px]">
          <span className="text-white/80 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#FFD700]" />
            <span>Treasure Hunt Today (+200 Coins each)</span>
          </span>
          <span className="font-black text-[#FFD700]">{state.treasureFoundIds.length} / 5 Found</span>
        </div>
      </div>
    </div>
  );
};

// 5. HIDDEN TREASURE COIN SPOT (5 Hidden Locations Daily -> +200 Coins Each)
interface TreasureSpotProps {
  id: string;
  foundIds: string[];
  onFind: (id: string) => void;
  label?: string;
}

export const TreasureSpot: React.FC<TreasureSpotProps> = ({ id, foundIds, onFind, label }) => {
  if (foundIds.includes(id)) return null;
  return (
    <button
      type="button"
      onClick={() => {
        triggerHaptic(20);
        playMysteryOpenSound();
        onFind(id);
      }}
      title="Hidden Treasure Coin (+200 Coins!)"
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-400/25 border border-[#FFD700] text-[#FFD700] text-[10px] font-black shadow-[0_0_12px_rgba(255,215,0,0.45)] animate-pulse active:scale-90"
    >
      <Coins className="w-3.5 h-3.5 text-[#FFD700]" />
      <span>{label || 'Hidden Treasure +200c'}</span>
    </button>
  );
};
