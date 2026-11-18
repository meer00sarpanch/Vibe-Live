import React, { useMemo, useState } from 'react';
import {
  Check,
  Coins,
  Crown,
  Flame,
  Lock,
  Shield,
  Sparkles,
  Star,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { IMG_HOST_MALE } from '../data/mockData';
import {
  VIP_FRAMES_CATALOG,
  VIP_LEVELS_50,
  VIP_TOP_100_USERS,
} from '../data/vipKingdomData';
import { CountryInfo, VipFrameInfo, VipLevelInfo, VipStatus } from '../types/mehfil';
import { playGiftChime, triggerHaptic } from '../utils/haptics';
import { formatCurrencyPrice } from '../utils/i18n';
import { TreasureSpot } from './LuckyMysteryCoinRainModals';

interface VipKingdomPageProps {
  coins: number;
  vipStatus: VipStatus;
  country: CountryInfo;
  treasureFoundIds: string[];
  onFindTreasure: (id: string) => void;
  onBuyNextVipLevel: (levelInfo: VipLevelInfo) => boolean;
  onEquipFrame: (level: number) => void;
  onOpenRecharge: () => void;
  onNotify: (msg: string) => void;
}

type VipKingdomTab = 'levels' | 'leaderboard' | 'frames';
type LbMainFilter = 'global' | 'pakistan' | 'vip' | 'gifters' | 'hosts';
type LbBadgeTier = 'all' | 50 | 40 | 30 | 20 | 10;

export const VipKingdomPage: React.FC<VipKingdomPageProps> = ({
  coins,
  vipStatus,
  country,
  treasureFoundIds,
  onFindTreasure,
  onBuyNextVipLevel,
  onEquipFrame,
  onOpenRecharge,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<VipKingdomTab>('levels');
  const [levelRange, setLevelRange] = useState<'next' | '1-10' | '11-20' | '21-30' | '31-40' | '41-50' | 'all'>('all');
  const [lbFilter, setLbFilter] = useState<LbMainFilter>('global');
  const [lbBadgeTier, setLbBadgeTier] = useState<LbBadgeTier>('all');
  const [unlockedPopup, setUnlockedPopup] = useState<VipLevelInfo | null>(null);
  const [lowCoinsPopup, setLowCoinsPopup] = useState<VipLevelInfo | null>(null);
  const [previewFrame, setPreviewFrame] = useState<VipFrameInfo>(VIP_FRAMES_CATALOG[VIP_FRAMES_CATALOG.length - 1]);
  const [frameModalOpen, setFrameModalOpen] = useState(false);

  const nextLevel = vipStatus.level < 50 ? vipStatus.level + 1 : 50;

  const visibleLevels = useMemo(() => {
    if (levelRange === 'next') {
      const start = Math.max(1, vipStatus.level);
      return VIP_LEVELS_50.filter((l) => l.level >= start && l.level <= start + 6);
    }
    if (levelRange === '1-10') return VIP_LEVELS_50.filter((l) => l.level >= 1 && l.level <= 10);
    if (levelRange === '11-20') return VIP_LEVELS_50.filter((l) => l.level >= 11 && l.level <= 20);
    if (levelRange === '21-30') return VIP_LEVELS_50.filter((l) => l.level >= 21 && l.level <= 30);
    if (levelRange === '31-40') return VIP_LEVELS_50.filter((l) => l.level >= 31 && l.level <= 40);
    if (levelRange === '41-50') return VIP_LEVELS_50.filter((l) => l.level >= 41 && l.level <= 50);
    return VIP_LEVELS_50;
  }, [levelRange, vipStatus.level]);

  const filteredLeaderboard = useMemo(() => {
    let list = [...VIP_TOP_100_USERS];
    if (lbFilter === 'pakistan') {
      list = list.filter((u) => u.country === 'PK');
    }
    if (lbBadgeTier !== 'all') {
      list = list.filter((u) => u.badgeTier === lbBadgeTier);
    }
    if (lbFilter === 'vip') {
      list.sort((a, b) => b.vipLevel - a.vipLevel || b.coins - a.coins);
    } else if (lbFilter === 'gifters') {
      list.sort((a, b) => b.giftCoins - a.giftCoins);
    } else if (lbFilter === 'hosts') {
      list.sort((a, b) => b.hostCoins - a.hostCoins);
    } else {
      list.sort((a, b) => b.coins - a.coins);
    }
    return list.slice(0, 100).map((item, idx) => ({ ...item, displayRank: idx + 1 }));
  }, [lbFilter, lbBadgeTier]);

  const handleBuyLevel = (lvl: VipLevelInfo) => {
    triggerHaptic(18);
    if (lvl.level !== vipStatus.level + 1) return;
    if (coins < lvl.extraCoins) {
      setLowCoinsPopup(lvl);
      return;
    }
    const ok = onBuyNextVipLevel(lvl);
    if (ok) {
      playGiftChime();
      setUnlockedPopup(lvl);
    }
  };

  // Approximate Pkr ratio: 30,000 coins = 1,000 PKR
  const coinsToPkr = (c: number) => Math.round((c / 30000) * 1000);

  return (
    <div className="min-h-screen bg-[#07070D] text-white pb-28">
      <div className="gold-line-top" />

      {/* 1. VIP KINGDOM TOP HEADER */}
      <header className="sticky top-0 z-30 bg-[#07070D]/95 backdrop-blur-xl border-b border-[#FFD700]/30">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-4 pt-3 pb-2.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl gold-gradient flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.55)] shrink-0">
                <Crown className="w-6 h-6 text-white fill-white/40 animate-bounce" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-black tracking-wide gold-text-gradient leading-none">
                  VIP KINGDOM
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded-full gold-gradient text-[11px] font-black text-white shadow">
                    {vipStatus.level > 0 ? `VIP ${vipStatus.level}` : 'VIP 0 · Start VIP 1'}
                  </span>
                  <span className="text-[11px] text-[#9CA3AF] truncate">
                    {vipStatus.level >= 50 ? 'Supreme King Max!' : `Next Unlock: VIP ${nextLevel}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <TreasureSpot id="tr-vip" foundIds={treasureFoundIds} onFind={onFindTreasure} label="VIP +200c" />
              <button
                type="button"
                onClick={onOpenRecharge}
                className="px-3 py-1.5 rounded-full bg-[#1A1A22] border border-[#FFD700]/50 flex items-center gap-1.5 text-xs font-extrabold text-[#FFD700] shadow active:scale-95 shrink-0"
              >
                <Coins className="w-4 h-4" />
                <span className="tabular-nums">{coins.toLocaleString()}</span>
                <span className="px-1.5 py-0.5 rounded-full gold-gradient text-[9px] text-white">+</span>
              </button>
            </div>
          </div>

          {/* 2. 3 Main VIP Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'levels' as const, label: 'VIP Levels', icon: Crown },
              { id: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy },
              { id: 'frames' as const, label: 'Frames & Badges', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setActiveTab(tab.id);
                  }}
                  className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    active
                      ? 'gold-gradient text-white shadow-[0_0_16px_rgba(255,215,0,0.4)]'
                      : 'bg-[#14141C] text-[#9CA3AF] border border-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-3.5 sm:px-4 pt-3.5 space-y-4">
        {/* ==================== TAB 1: VIP LEVELS 1 TO 50 (1 BY 1, NO WAIT) ==================== */}
        {activeTab === 'levels' && (
          <div className="space-y-3.5">
            {/* Hero Status Card */}
            <div className="rounded-3xl bg-gradient-to-br from-[#23190B] via-[#14141C] to-[#1A1025] border-2 border-[#FFD700]/60 p-4 flex items-center justify-between gap-3 gold-glow">
              <div className="space-y-1 min-w-0">
                <p className="text-[11px] font-extrabold text-[#FFD700] uppercase tracking-wider">
                  1 By 1 Progression · Zero Wait Time
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {vipStatus.level > 0 ? `Your Level: VIP ${vipStatus.level}` : 'Your Level: Not VIP Yet'}
                </h2>
                <p className="text-xs text-white/75">
                  {vipStatus.level >= 50
                    ? 'All 50 VIP Levels Unlocked! You are Supreme King.'
                    : `Har level 1-by-1 turant khulega · Next: VIP ${nextLevel} (${VIP_LEVELS_50[nextLevel - 1].extraCoins.toLocaleString()} Coins)`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="w-16 h-16 rounded-2xl gold-gradient flex flex-col items-center justify-center shadow-xl">
                  <Crown className="w-7 h-7 text-white fill-white/40" />
                  <span className="text-[11px] font-black text-white leading-none mt-0.5">
                    VIP {vipStatus.level}
                  </span>
                </div>
              </div>
            </div>

            {/* Tier Jump Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all' as const, label: 'All 1–50' },
                { id: 'next' as const, label: `Next (VIP ${nextLevel})` },
                { id: '1-10' as const, label: 'VIP 1–10' },
                { id: '11-20' as const, label: 'VIP 11–20' },
                { id: '21-30' as const, label: 'VIP 21–30' },
                { id: '31-40' as const, label: 'VIP 31–40' },
                { id: '41-50' as const, label: 'VIP 41–50' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setLevelRange(pill.id)}
                  className={`h-8 px-3.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                    levelRange === pill.id
                      ? 'gold-gradient text-white shadow'
                      : 'bg-[#14141C] text-[#9CA3AF] border border-white/10'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* 1-by-1 VIP 1..50 List */}
            <div className="space-y-2.5">
              {visibleLevels.map((lvl) => {
                const isOwned = lvl.level <= vipStatus.level;
                const isNextToBuy = lvl.level === vipStatus.level + 1;
                const isLocked = lvl.level > vipStatus.level + 1;
                const isMilestone = lvl.level === 1 || lvl.level % 10 === 0;

                return (
                  <div
                    key={lvl.level}
                    className={`rounded-2xl p-3.5 border transition-all ${
                      isNextToBuy
                        ? 'bg-gradient-to-br from-[#2B1F06] via-[#181512] to-[#261204] border-2 border-[#FFD700] gold-glow'
                        : isOwned
                          ? 'bg-[#101C17] border-emerald-500/45'
                          : 'bg-[#14141C] border-white/10 opacity-85'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                            isOwned
                              ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                              : isNextToBuy
                                ? 'gold-gradient text-white shadow-lg'
                                : 'bg-[#1E1E28] border border-white/10 text-[#9CA3AF]'
                          }`}
                        >
                          <Crown className="w-5 h-5" />
                          <span className="text-[10px] font-black leading-none mt-0.5">VIP {lvl.level}</span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-extrabold text-white">{lvl.name}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isMilestone
                                  ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40'
                                  : 'bg-white/10 text-white/75'
                              }`}
                            >
                              {lvl.tierLabel}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#FFD700] mt-0.5">
                            {lvl.level === 1
                              ? `${lvl.extraCoins.toLocaleString()} Coins (${formatCurrencyPrice(coinsToPkr(lvl.extraCoins), country)})`
                              : `+${lvl.extraCoins.toLocaleString()} Coins Extra · Total ${lvl.totalCoins.toLocaleString()}`}
                          </p>
                        </div>
                      </div>

                      {/* Strictly 1 Button Active (Buy Now) | Owned Green | Locked Grey */}
                      {isOwned ? (
                        <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-extrabold flex items-center gap-1 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          <span>Owned</span>
                        </span>
                      ) : isNextToBuy ? (
                        <button
                          type="button"
                          onClick={() => handleBuyLevel(lvl)}
                          className="px-4 py-2 rounded-full gold-gradient text-white text-xs font-black shadow-lg gold-glow active:scale-95 transition-transform shrink-0"
                        >
                          Buy Now
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="px-3 py-1.5 rounded-full bg-[#22222D] border border-white/10 text-[#9CA3AF] text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-not-allowed"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Locked - Pehle VIP {lvl.level - 1} Lo</span>
                        </button>
                      )}
                    </div>

                    {/* Preview: Crown + Frame + Entry Effect */}
                    <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px]">
                      <div className="px-2.5 py-1.5 rounded-xl bg-black/30 flex items-center gap-1.5 text-white/90">
                        <Crown className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                        <span className="truncate">{lvl.crownStyle}</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-xl bg-black/30 flex items-center gap-1.5 text-white/90">
                        <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">{lvl.frameName}</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-xl bg-black/30 flex items-center gap-1.5 text-white/90">
                        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{lvl.entryEffect}</span>
                      </div>
                    </div>

                    {/* Perks pills */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {lvl.perks.map((perk) => (
                        <span
                          key={perk}
                          className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-medium text-white/80"
                        >
                          ✓ {perk}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {isLockedFooterNote(vipStatus.level)}
          </div>
        )}

        {/* ==================== TAB 2: TOP 100 GLOBAL + BADGE TIER KINGS ==================== */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-3.5 pb-14">
            {/* Main Leaderboard Filter */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'global' as const, label: 'Global Top 100' },
                { id: 'pakistan' as const, label: 'Pakistan Top 100' },
                { id: 'vip' as const, label: 'VIP Top 100' },
                { id: 'gifters' as const, label: 'Gifters Top 100' },
                { id: 'hosts' as const, label: 'Hosts Top 100' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setLbFilter(f.id);
                  }}
                  className={`h-9 px-3.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 ${
                    lbFilter === f.id
                      ? 'gold-gradient text-white shadow'
                      : 'bg-[#14141C] text-[#9CA3AF] border border-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Separate King Leaderboard for Each VIP Badge Tier */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all' as const, label: 'All VIP Badges' },
                { id: 50 as const, label: '👑 VIP 50 Kings' },
                { id: 40 as const, label: '🔥 VIP 40 Kings' },
                { id: 30 as const, label: '⚡ VIP 30 Kings' },
                { id: 20 as const, label: '💎 VIP 20 Kings' },
                { id: 10 as const, label: '⭐ VIP 10 Kings' },
              ].map((tier) => (
                <button
                  key={String(tier.id)}
                  type="button"
                  onClick={() => setLbBadgeTier(tier.id)}
                  className={`h-7 px-3 rounded-full text-[11px] font-bold whitespace-nowrap shrink-0 border ${
                    lbBadgeTier === tier.id
                      ? 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700]'
                      : 'bg-[#111119] border-white/10 text-white/70'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>

            {/* TOP 3 BIG PODIUM */}
            {filteredLeaderboard.length >= 3 && (
              <div className="rounded-3xl bg-gradient-to-b from-[#1B1628] via-[#12121A] to-[#0B0B10] border border-[#FFD700]/35 p-4 pt-6 grid grid-cols-3 gap-2 items-end">
                {/* Rank 2 Silver */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-slate-400 to-slate-100 shadow-lg relative">
                    <img
                      src={filteredLeaderboard[1].avatar}
                      alt={filteredLeaderboard[1].name}
                      className="w-full h-full rounded-full object-cover"
                    />
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-200 text-slate-900 text-[10px] font-black">
                      #2
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-white mt-2 truncate w-full">
                    {filteredLeaderboard[1].flag} {filteredLeaderboard[1].name}
                  </p>
                  <span className="mt-0.5 px-2 py-0.5 rounded-full bg-slate-500/30 text-[10px] font-bold text-slate-200">
                    VIP {filteredLeaderboard[1].vipLevel}
                  </span>
                  <p className="text-[11px] font-bold text-[#FFD700] tabular-nums mt-0.5">
                    {getDisplayedLbCoins(filteredLeaderboard[1], lbFilter).toLocaleString()}
                  </p>
                </div>

                {/* Rank 1 Gold Crown + Golden Frame + Shine */}
                <div className="flex flex-col items-center text-center -mt-4">
                  <Crown className="w-8 h-8 text-[#FFD700] fill-[#FFD700] animate-bounce drop-shadow-[0_0_12px_rgba(255,215,0,0.85)]" />
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 gold-gradient shadow-[0_0_28px_rgba(255,215,0,0.75)] relative">
                    <img
                      src={filteredLeaderboard[0].avatar}
                      alt={filteredLeaderboard[0].name}
                      className="w-full h-full rounded-full object-cover"
                    />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full gold-gradient text-white text-[11px] font-black shadow">
                      #1 KING
                    </span>
                  </div>
                  <p className="text-sm font-black gold-text-gradient mt-2.5 truncate w-full">
                    {filteredLeaderboard[0].flag} {filteredLeaderboard[0].name}
                  </p>
                  <span className="mt-0.5 px-2.5 py-0.5 rounded-full gold-gradient text-[10px] font-black text-white shadow">
                    VIP {filteredLeaderboard[0].vipLevel}
                  </span>
                  <p className="text-xs font-extrabold text-[#FFD700] tabular-nums mt-0.5">
                    {getDisplayedLbCoins(filteredLeaderboard[0], lbFilter).toLocaleString()}
                  </p>
                </div>

                {/* Rank 3 Bronze */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-amber-700 to-orange-400 shadow-lg relative">
                    <img
                      src={filteredLeaderboard[2].avatar}
                      alt={filteredLeaderboard[2].name}
                      className="w-full h-full rounded-full object-cover"
                    />
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black">
                      #3
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-white mt-2 truncate w-full">
                    {filteredLeaderboard[2].flag} {filteredLeaderboard[2].name}
                  </p>
                  <span className="mt-0.5 px-2 py-0.5 rounded-full bg-amber-700/35 text-[10px] font-bold text-amber-200">
                    VIP {filteredLeaderboard[2].vipLevel}
                  </span>
                  <p className="text-[11px] font-bold text-[#FFD700] tabular-nums mt-0.5">
                    {getDisplayedLbCoins(filteredLeaderboard[2], lbFilter).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Ranks 4 to 100 List */}
            <div className="space-y-2">
              {filteredLeaderboard.slice(3).map((entry) => (
                <div
                  key={entry.id}
                  className="h-16 px-3 rounded-2xl bg-[#14141C] border border-white/10 flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 text-center text-xs font-extrabold text-[#9CA3AF] tabular-nums shrink-0">
                      #{entry.displayRank}
                    </span>
                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#FFD700]/35 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-white truncate">
                          {entry.flag} {entry.name}
                        </p>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[9px] font-black text-white shrink-0 ${
                            entry.vipLevel >= 50
                              ? 'bg-gradient-to-r from-red-600 to-amber-500'
                              : entry.vipLevel >= 30
                                ? 'bg-purple-600'
                                : 'gold-gradient'
                          }`}
                        >
                          VIP {entry.vipLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9CA3AF]">
                        {entry.vipLevel >= 50 ? 'Supreme King' : entry.vipLevel >= 40 ? 'Imperial' : 'VIP Member'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-extrabold text-[#FFD700] tabular-nums shrink-0">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{getDisplayedLbCoins(entry, lbFilter).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky User Rank Bar */}
            <div className="fixed bottom-[76px] left-0 right-0 z-20 px-3 pointer-events-none">
              <div className="max-w-5xl mx-auto rounded-2xl bg-[#161422]/95 backdrop-blur-xl border-2 border-[#FFD700]/75 px-4 py-2.5 flex items-center justify-between shadow-2xl pointer-events-auto">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={IMG_HOST_MALE}
                    alt="BiLAL"
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#FFD700]"
                  />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-black text-white truncate">
                      Your Rank: #245 - VIP {vipStatus.level}
                    </p>
                    <p className="text-[10px] text-[#FFD700]">
                      {vipStatus.level > 0
                        ? `BiLAL · ${vipStatus.level} Levels Unlocked`
                        : 'Buy VIP 1 to climb the VIP Kingdom Leaderboard'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('levels')}
                  className="px-3 py-1.5 rounded-full gold-gradient text-white text-[11px] font-black shrink-0"
                >
                  {vipStatus.level >= 50 ? 'Rank #1 King' : 'Level Up'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: FRAMES & BADGES ==================== */}
        {activeTab === 'frames' && (
          <div className="space-y-4">
            {/* Live Heavy Preview Banner ("Aise Lagega Tera Naam") */}
            <div className="rounded-3xl bg-gradient-to-br from-[#2A0A12] via-[#161422] to-[#261A05] border-2 border-[#FFD700]/65 p-5 text-center space-y-3 gold-glow">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#FFD700]">
                Aise Lagega Tera Naam · Live Preview
              </p>

              <div className="relative inline-flex flex-col items-center">
                <Crown className={`w-9 h-9 ${previewFrame.crownColor} fill-current animate-bounce -mb-2 z-10`} />
                <div className={`w-24 h-24 rounded-full p-1.5 ${previewFrame.ringClass} ${previewFrame.glowClass}`}>
                  <img src={IMG_HOST_MALE} alt="BiLAL" className="w-full h-full rounded-full object-cover" />
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span
                  className={`px-3 py-0.5 rounded-full bg-gradient-to-r ${previewFrame.badgeGradient} text-xs font-black text-white shadow-md`}
                >
                  {previewFrame.badgeText}
                </span>
                <span className="text-xl font-black gold-text-gradient">
                  {previewFrame.badgeText} BiLAL
                </span>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-black/45 border border-[#FFD700]/30 text-xs font-bold text-amber-200 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFD700] shrink-0" />
                <span>
                  {previewFrame.badgeText} BiLAL {previewFrame.entryText}
                </span>
              </div>
            </div>

            {/* Frame Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VIP_FRAMES_CATALOG.map((frame) => {
                const unlocked = vipStatus.level >= frame.minLevel;
                const equipped = (vipStatus.equippedFrameLevel || vipStatus.level) === frame.minLevel && unlocked;
                return (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setPreviewFrame(frame);
                      setFrameModalOpen(true);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all active:scale-[0.98] flex items-center justify-between gap-3 ${
                      equipped
                        ? 'bg-[#1B1929] border-2 border-[#FFD700] gold-glow'
                        : 'bg-[#14141C] border-white/15 hover:border-[#FFD700]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-14 h-14 rounded-full p-1 ${frame.ringClass} ${frame.glowClass} shrink-0`}>
                        <img src={IMG_HOST_MALE} alt={frame.title} className="w-full h-full rounded-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${frame.badgeGradient} text-[10px] font-black text-white`}
                          >
                            {frame.badgeText}
                          </span>
                          <span className="text-xs font-extrabold text-[#FFD700]">
                            {frame.badgeText} BiLAL
                          </span>
                        </div>
                        <p className="text-sm font-bold text-white truncate mt-1">{frame.title}</p>
                        <p className="text-[11px] text-[#9CA3AF]">Tap to Preview Full Effect</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${
                        equipped
                          ? 'bg-emerald-500 text-white'
                          : unlocked
                            ? 'gold-gradient text-white'
                            : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {equipped ? 'Equipped' : unlocked ? 'Unlocked' : `VIP ${frame.minLevel}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* VIP Level Unlocked Celebration Modal */}
      {unlockedPopup && (
        <div className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl glass-dark border-2 border-[#FFD700] p-6 text-center space-y-4 gold-glow relative">
            <button
              type="button"
              onClick={() => setUnlockedPopup(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#26262F] text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-20 h-20 rounded-full gold-gradient mx-auto flex items-center justify-center animate-bounce shadow-xl">
              <Crown className="w-10 h-10 text-white fill-white" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-[#FFD700] flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span>LEVEL UP COMPLETE</span>
              </p>
              <h3 className="text-2xl font-black text-white">{unlockedPopup.name} Unlocked!</h3>
              <p className="text-xs text-emerald-400 font-bold">
                {unlockedPopup.frameName} &amp; {unlockedPopup.entryEffect} Active
              </p>
              {unlockedPopup.level < 50 && (
                <p className="text-[11px] text-[#FFD700] pt-1">
                  VIP {unlockedPopup.level + 1} abhi unlock ho gaya — bina kisi wait ke aage barho!
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setUnlockedPopup(null)}
              className="w-full h-11 rounded-full gold-gradient text-white font-extrabold text-sm"
            >
              {unlockedPopup.level < 50 ? `Continue (VIP ${unlockedPopup.level + 1} Ready)` : 'Supreme King!'}
            </button>
          </div>
        </div>
      )}

      {/* Low Coins Popup */}
      {lowCoinsPopup && (
        <div className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl glass-dark p-5 text-center space-y-4">
            <Coins className="w-12 h-12 text-[#FFD700] mx-auto" />
            <h3 className="text-lg font-bold text-white">Coins Kam Hain - Recharge Karo</h3>
            <p className="text-xs text-[#9CA3AF]">
              {lowCoinsPopup.name} ke liye <span className="text-[#FFD700] font-bold">{lowCoinsPopup.extraCoins.toLocaleString()} Coins</span> chahiye. Abhi balance: {coins.toLocaleString()}.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setLowCoinsPopup(null)}
                className="h-11 rounded-full bg-[#26262F] text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setLowCoinsPopup(null);
                  onOpenRecharge();
                }}
                className="h-11 rounded-full gold-gradient text-white text-xs font-extrabold shadow-lg"
              >
                Recharge Coins
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Frame Preview Modal ("Aise Lagega Tera Naam") */}
      {frameModalOpen && (
        <div
          onClick={() => setFrameModalOpen(false)}
          className="fixed inset-0 z-[95] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl glass-dark border-2 border-[#FFD700] p-6 text-center space-y-4 gold-glow relative"
          >
            <button
              type="button"
              onClick={() => setFrameModalOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#26262F] text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-xs font-extrabold text-[#FFD700] uppercase">Aise Lagega Tera Naam</p>
            <div className="relative inline-flex flex-col items-center pt-2">
              <Crown className={`w-10 h-10 ${previewFrame.crownColor} fill-current animate-bounce -mb-2 z-10`} />
              <div className={`w-28 h-28 rounded-full p-1.5 ${previewFrame.ringClass} ${previewFrame.glowClass}`}>
                <img src={IMG_HOST_MALE} alt="BiLAL" className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black gold-text-gradient">{previewFrame.badgeText} BiLAL</h3>
              <p className="text-xs text-white/80 mt-1">{previewFrame.title}</p>
            </div>
            <div className="px-3 py-2 rounded-2xl bg-black/50 border border-white/10 text-xs text-amber-200 font-semibold flex items-center justify-center gap-1.5">
              <Flame className="w-4 h-4 text-[#FFD700] shrink-0" />
              <span>{previewFrame.badgeText} BiLAL {previewFrame.entryText}</span>
            </div>

            {vipStatus.level >= previewFrame.minLevel ? (
              <button
                type="button"
                onClick={() => {
                  onEquipFrame(previewFrame.minLevel);
                  setFrameModalOpen(false);
                  onNotify(`${previewFrame.title} Equipped on Profile!`);
                }}
                className="w-full h-11 rounded-full gold-gradient text-white font-extrabold text-sm"
              >
                Equip Frame on Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFrameModalOpen(false);
                  setActiveTab('levels');
                  setLevelRange('next');
                }}
                className="w-full h-11 rounded-full bg-[#26262F] border border-[#FFD700]/45 text-[#FFD700] font-extrabold text-xs flex items-center justify-center gap-1.5"
              >
                <Star className="w-4 h-4" />
                <span>Unlock via VIP Levels (1 By 1 up to VIP {previewFrame.minLevel})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function getDisplayedLbCoins(user: (typeof VIP_TOP_100_USERS)[number], filter: LbMainFilter): number {
  if (filter === 'gifters') return user.giftCoins;
  if (filter === 'hosts') return user.hostCoins;
  return user.coins;
}

function isLockedFooterNote(currentLevel: number) {
  if (currentLevel >= 50) return null;
  return (
    <div className="p-3.5 rounded-2xl bg-[#14141C] border border-[#FFD700]/25 text-center space-y-1">
      <p className="text-xs font-bold text-[#FFD700]">1 By 1 Royal Path · Total VIP 50 = 89,50,000 Coins</p>
      <p className="text-[11px] text-[#9CA3AF]">
        Har agla level pichle level ke turant baad khulta hai — koi wait ya timer nahi.
      </p>
    </div>
  );
}
