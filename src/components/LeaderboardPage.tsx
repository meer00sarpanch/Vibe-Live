import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Crown,
  Search,
  Trophy,
  X,
} from 'lucide-react';
import {
  FRIENDS_LEADERBOARD,
  FULL_LEADERBOARD_100,
  IMG_HOST_MALE,
} from '../data/mockData';
import { AppLanguage, CountryInfo, LeaderboardEntry } from '../types/mehfil';
import { triggerHaptic } from '../utils/haptics';
import { t } from '../utils/i18n';

interface LeaderboardPageProps {
  coins: number;
  country: CountryInfo;
  language: AppLanguage;
  onBack: () => void;
  onGiftAndClimb: () => void;
  onNotify: (msg: string) => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  coins,
  country,
  language,
  onBack,
  onGiftAndClimb,
  onNotify,
}) => {
  const [scopeTab, setScopeTab] = useState<'Global' | 'Friends' | 'World'>('Global');
  const [periodTab, setPeriodTab] = useState<'Today' | 'Weekly' | 'Monthly' | 'All Time'>('Today');
  const [regionTab, setRegionTab] = useState<'World Wise' | 'Country Wise'>('World Wise');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(25);
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({ 'lb-2': true });
  const [simulateEmptyFriends, setSimulateEmptyFriends] = useState(false);

  const periodMultiplier =
    periodTab === 'Today' ? 1 : periodTab === 'Weekly' ? 3.4 : periodTab === 'Monthly' ? 9.2 : 24;

  const listData = useMemo(() => {
    let base: LeaderboardEntry[] =
      scopeTab === 'Friends'
        ? simulateEmptyFriends
          ? []
          : FRIENDS_LEADERBOARD
        : FULL_LEADERBOARD_100;

    if (regionTab === 'Country Wise' && scopeTab !== 'Friends') {
      const countryFiltered = base.filter((e) => e.country === country.code);
      base =
        countryFiltered.length > 0
          ? countryFiltered
          : base.slice(0, 20).map((e) => ({ ...e, country: country.code, flag: country.flag }));
    }

    const mapped = base.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
      coins: Math.round(entry.coins * (periodTab === 'Today' ? 1 : periodMultiplier * 0.35)),
    }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return mapped.filter((e) => e.name.toLowerCase().includes(q));
    }
    return mapped;
  }, [scopeTab, regionTab, periodTab, periodMultiplier, searchQuery, simulateEmptyFriends, country]);

  const top3 = listData.slice(0, 3);
  const rank1 = top3[0];
  const rank2 = top3[1];
  const rank3 = top3[2];
  const restList = listData.slice(3, visibleCount);

  const toggleFollow = (id: string, name: string) => {
    triggerHaptic();
    setFollowedMap((prev) => {
      const next = !prev[id];
      onNotify(next ? `Following ${name}` : `Unfollowed ${name}`);
      return { ...prev, [id]: next };
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 220 && visibleCount < listData.length) {
      setVisibleCount((v) => Math.min(listData.length, v + 25));
    }
  };

  return (
    <div onScroll={handleScroll} className="fixed inset-0 z-[80] bg-[#07070D] overflow-y-auto pb-28">
      <div className="gold-line-top" />

      {/* 1. Top Bar */}
      <header className="sticky top-0 z-30 bg-[#07070D]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto h-14 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-[#1A1A22] text-white flex items-center justify-center active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-[20px] font-bold text-white">{t(language, 'leaderboard_title')}</h1>
          </div>

          {searchOpen && (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search #1 - #100..."
              autoFocus
              className="flex-1 max-w-xs h-9 px-3 rounded-full bg-[#1A1A22] text-sm text-white border border-[#FFD700]/40 focus:outline-none"
            />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((s) => !s)}
              className="w-10 h-10 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
            >
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
            <div className="w-10 h-10 rounded-full bg-[#1A1A22] border border-[#FFD700]/50 flex items-center justify-center gold-glow">
              <Trophy className="w-5 h-5 text-[#FFD700] fill-[#FFD700]" />
            </div>
          </div>
        </div>

        {/* 2. Tabs 1: Global / Friends / World */}
        <div className="max-w-4xl mx-auto px-4 pt-2 pb-2 grid grid-cols-3 gap-2">
          {(['Global', 'Friends', 'World'] as const).map((t) => {
            const active = scopeTab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setScopeTab(t);
                  setVisibleCount(25);
                }}
                className={`h-9 rounded-full text-xs font-bold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#F59E0B] to-[#EF4444] text-white shadow-lg'
                    : 'bg-[#1A1A22] text-[#9CA3AF]'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* 3. Tabs 2: Today / Weekly / Monthly / All Time */}
        <div className="max-w-4xl mx-auto px-4 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(['Today', 'Weekly', 'Monthly', 'All Time'] as const).map((p) => {
            const active = periodTab === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodTab(p)}
                className={`px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 border ${
                  active ? 'border-[#FFD700] text-[#FFD700] bg-[#FFD700]/10' : 'border-white/10 text-[#888888]'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* 4. Tabs 3: World Wise / Country Wise */}
        <div className="max-w-4xl mx-auto px-4 pb-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {(['World Wise', 'Country Wise'] as const).map((r) => {
              const active = regionTab === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegionTab(r)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    active ? 'gold-gradient text-white' : 'bg-[#1A1A22] text-[#9CA3AF]'
                  }`}
                >
                  {r === 'Country Wise' ? `${country.flag} ${country.name}` : t(language, 'world_wise')}
                </button>
              );
            })}
          </div>
          {scopeTab === 'Friends' && (
            <button
              type="button"
              onClick={() => setSimulateEmptyFriends((v) => !v)}
              className="text-[11px] text-[#FFD700] underline"
            >
              {simulateEmptyFriends ? 'Show Friends' : 'Preview Empty'}
            </button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-4 space-y-4">
        {listData.length === 0 ? (
          <div className="py-20 text-center space-y-3 glass-dark rounded-3xl p-6">
            <Trophy className="w-12 h-12 text-[#FFD700] mx-auto opacity-80" />
            <p className="text-base font-bold text-white">No Friends Yet - Add Friends to Compete!</p>
            <button
              type="button"
              onClick={() => setSimulateEmptyFriends(false)}
              className="px-5 py-2 rounded-full gold-gradient text-xs font-bold text-white"
            >
              View Friends Ranking
            </button>
          </div>
        ) : (
          <>
            {/* 5. Podium Top 3 */}
            <div className="grid grid-cols-3 gap-2.5 items-end pt-4 pb-2">
              {/* Rank 2 Left */}
              {rank2 ? (
                <div className="glass-dark rounded-2xl p-2.5 flex flex-col items-center text-center gap-1.5 border-slate-300/40">
                  <div className="relative">
                    <Crown className="w-5 h-5 text-slate-300 fill-slate-300 mx-auto mb-0.5" />
                    <img src={rank2.avatar} alt={rank2.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-300" />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 rounded-full bg-slate-300 text-slate-900 text-[10px] font-extrabold">
                      #2
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white truncate w-full mt-1">
                    {rank2.flag} {rank2.name}
                  </p>
                  <p className="text-[11px] font-extrabold text-slate-300 font-mono-num">
                    {rank2.coins.toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleFollow(rank2.id, rank2.name)}
                    className={`w-full py-1 rounded-full text-[11px] font-bold ${
                      followedMap[rank2.id] ? 'bg-[#26262F] text-white/80' : 'gold-gradient text-white'
                    }`}
                  >
                    {followedMap[rank2.id] ? 'Following' : 'Follow'}
                  </button>
                </div>
              ) : (
                <div />
              )}

              {/* Rank 1 Center BIG Elevated */}
              {rank1 && (
                <div className="relative glass-dark rounded-3xl p-3 flex flex-col items-center text-center gap-1.5 border-2 border-[#FFD700] gold-glow -mt-4 overflow-hidden">
                  {/* Confetti Sparkles */}
                  <span className="absolute top-2 left-3 w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-ping" />
                  <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-ping" />

                  <div className="relative">
                    <Crown className="w-7 h-7 text-[#FFD700] fill-[#FFD700] mx-auto animate-bounce" />
                    <div className="w-[82px] h-[82px] rounded-full p-[3px] gold-gradient">
                      <img src={rank1.avatar} alt={rank1.name} className="w-full h-full rounded-full object-cover" />
                    </div>
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full gold-gradient text-white text-[10px] font-extrabold shadow">
                      #1
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-white truncate w-full mt-1">
                    {rank1.flag} {rank1.name}
                  </p>
                  {rank1.title && (
                    <span className="text-[10px] font-bold text-[#FFD700]">{rank1.title}</span>
                  )}
                  <p className="text-xs font-extrabold text-[#FFD700] font-mono-num">
                    {rank1.coins.toLocaleString()} Coins
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleFollow(rank1.id, rank1.name)}
                    className={`w-full py-1.5 rounded-full text-xs font-bold ${
                      followedMap[rank1.id] ? 'bg-[#26262F] text-white/80' : 'gold-gradient text-white shadow'
                    }`}
                  >
                    {followedMap[rank1.id] ? 'Following' : 'Follow'}
                  </button>
                </div>
              )}

              {/* Rank 3 Right */}
              {rank3 ? (
                <div className="glass-dark rounded-2xl p-2.5 flex flex-col items-center text-center gap-1.5 border-amber-700/60">
                  <div className="relative">
                    <Crown className="w-5 h-5 text-amber-500 fill-amber-500 mx-auto mb-0.5" />
                    <img src={rank3.avatar} alt={rank3.name} className="w-16 h-16 rounded-full object-cover border-2 border-amber-600" />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 rounded-full bg-amber-600 text-white text-[10px] font-extrabold">
                      #3
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white truncate w-full mt-1">
                    {rank3.flag} {rank3.name}
                  </p>
                  <p className="text-[11px] font-extrabold text-amber-400 font-mono-num">
                    {rank3.coins.toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleFollow(rank3.id, rank3.name)}
                    className={`w-full py-1 rounded-full text-[11px] font-bold ${
                      followedMap[rank3.id] ? 'bg-[#26262F] text-white/80' : 'gold-gradient text-white'
                    }`}
                  >
                    {followedMap[rank3.id] ? 'Following' : 'Follow'}
                  </button>
                </div>
              ) : (
                <div />
              )}
            </div>

            {/* 6. List #4 to #100 */}
            <div className="space-y-2">
              {restList.map((entry) => {
                const isFollowed = !!followedMap[entry.id];
                return (
                  <div
                    key={entry.id}
                    className="h-[68px] px-3 rounded-2xl bg-[#14141C] border border-white/10 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-9 text-center text-[16px] font-extrabold text-[#FFD700] font-mono-num shrink-0">
                        #{entry.rank}
                      </span>
                      <img
                        src={entry.avatar}
                        alt={entry.name}
                        className="w-[50px] h-[50px] rounded-full object-cover border border-[#FFD700]/40 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span>{entry.flag}</span>
                          <p className="text-[15px] font-bold text-white truncate">{entry.name}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded-full gold-gradient text-[10px] font-bold text-white">
                            Lv.{entry.level}
                          </span>
                          <span className="text-xs font-bold text-[#FFD700] font-mono-num">
                            {entry.coins.toLocaleString()} Coins
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {entry.trend === 'up' ? (
                        <ArrowUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-400" />
                      )}
                      <button
                        type="button"
                        onClick={() => toggleFollow(entry.id, entry.name)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold active:scale-95 ${
                          isFollowed ? 'bg-[#26262F] text-white/80' : 'gold-gradient text-white'
                        }`}
                      >
                        {isFollowed ? t(language, 'following_btn') : t(language, 'follow_btn')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleCount < listData.length && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount(listData.length)}
                  className="px-5 py-2 rounded-full bg-[#1A1A22] border border-[#FFD700]/40 text-xs font-bold text-[#FFD700]"
                >
                  Load All ({listData.length - visibleCount} more up to #100)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 8. Bottom Fixed Your Rank 24 Gold Gradient Card */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-3 bg-[#07070D]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto min-h-[72px] rounded-2xl gold-gradient px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-2xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="px-2.5 py-1 rounded-xl bg-black/25 text-white font-extrabold text-xs shrink-0">
              Rank 24
            </div>
            <img src={IMG_HOST_MALE} alt="You" className="w-10 h-10 rounded-full object-cover border-2 border-white shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-extrabold text-white truncate">You - BiLAL {country.flag}</p>
              <p className="text-[11px] text-white/95 font-medium truncate">
                Top 100 me aane ke liye 15,000 Coins aur chahiye!
              </p>
              <div className="w-full max-w-[190px] h-1.5 rounded-full bg-black/25 mt-1 overflow-hidden">
                <div style={{ width: `${Math.min(100, (coins / 15000) * 100)}%` }} className="h-full bg-white rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[11px] font-extrabold text-white font-mono-num">{coins}/15,000</span>
            <button
              type="button"
              onClick={onGiftAndClimb}
              className="px-3.5 py-1.5 rounded-full bg-white text-amber-900 text-xs font-extrabold shadow active:scale-95"
            >
              Gift &amp; Climb
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
