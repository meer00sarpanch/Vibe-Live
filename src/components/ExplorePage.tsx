import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Clock,
  Crown,
  Eye,
  Heart,
  Play,
  Search,
  Sparkles,
  Star,
  Trophy,
  X,
} from 'lucide-react';
import { PartySystem } from './PartySystem';
import { IMG_HOST_FEMALE, IMG_HOST_MALE, IMG_HERO_LIVE, IMG_PK_BANNER } from '../data/mockData';
import {
  AppLanguage,
  GiftItem,
  PartyRoomItem,
  ShortVideoItem,
  TranslationSettings,
} from '../types/mehfil';
import { triggerHaptic } from '../utils/haptics';
import { TreasureSpot } from './LuckyMysteryCoinRainModals';

interface ExplorePageProps {
  videos: ShortVideoItem[];
  rooms: PartyRoomItem[];
  coins: number;
  language: AppLanguage;
  translationSettings: TranslationSettings;
  treasureFoundIds: string[];
  onFindTreasure: (id: string) => void;
  subTab: 'explore' | 'party';
  onChangeSubTab: (tab: 'explore' | 'party') => void;
  onBack: () => void;
  onOpenLeaderboard: () => void;
  onOpenVideo: (video: ShortVideoItem) => void;
  onOpenProfile: (profileId: string) => void;
  onCollectPrize: () => void;
  onEnterRoom: (roomId: string, pk?: boolean) => void;
  onCreatePartyRoom: () => void;
  onSendGift: (gift: GiftItem, recipient: string) => void;
  onFirstRecharge: () => void;
  onOpenTranslationSettings: () => void;
  onNotify: (msg: string) => void;
}

const EXPLORE_TABS: Array<'For You' | 'New' | 'Nearby'> = ['For You', 'New', 'Nearby'];
const COUNTRY_PILLS = ['Popular', 'Philippines', 'Nepal', 'India', 'Pakistan'];
const HASHTAGS = ['#VibeLive', '#PK', '#Shayari', '#Music', '#Viral'];

const SUGGESTED_FRIENDS = [
  { id: 'sf-1', name: 'Hania Khan', handle: '@its_haniya__1', avatar: IMG_HOST_FEMALE, level: 32 },
  { id: 'sf-2', name: 'Ali Raza', handle: '@ali_raza_king', avatar: IMG_HOST_MALE, level: 48 },
  { id: 'sf-3', name: 'Ayesha Live', handle: '@ayesha_live', avatar: IMG_HERO_LIVE, level: 35 },
  { id: 'sf-4', name: 'Fatima Noor', handle: '@fatima_noor', avatar: IMG_HOST_FEMALE, level: 28 },
];

export const ExplorePage: React.FC<ExplorePageProps> = ({
  videos,
  rooms,
  coins,
  language,
  translationSettings,
  treasureFoundIds,
  onFindTreasure,
  subTab,
  onChangeSubTab,
  onBack,
  onOpenLeaderboard,
  onOpenVideo,
  onOpenProfile,
  onCollectPrize,
  onEnterRoom,
  onCreatePartyRoom,
  onSendGift,
  onFirstRecharge,
  onOpenTranslationSettings,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'For You' | 'New' | 'Nearby'>('For You');
  const [activeCountry, setActiveCountry] = useState('Popular');
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const [showPkBanner, setShowPkBanner] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [followedIds, setFollowedIds] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(2 * 3600 + 14 * 60 + 55); // 02:14:55

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 2 * 3600 + 14 * 60 + 55));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formatCountdown = (total: number) => {
    const h = String(Math.floor(total / 3600)).padStart(2, '0');
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const filteredVideos = videos.filter((v) => {
    if (activeHashtag && !v.hashtags.includes(activeHashtag)) return false;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      return v.title.toLowerCase().includes(q) || v.hostName.toLowerCase().includes(q) || v.caption.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleFollow = (id: string, name: string) => {
    triggerHaptic(15);
    setFollowedIds((prev) => {
      const next = !prev[id];
      onNotify(next ? `Following ${name} ❤️` : `Unfollowed ${name}`);
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="min-h-screen bg-[#07070D] pb-24">
      <div className="gold-line-top" />

      {/* 1. Top Bar */}
      <header className="sticky top-0 z-30 bg-[#07070D]/95 backdrop-blur-md border-b border-[#FFD700]/20">
        <div className="max-w-6xl mx-auto h-14 px-3 sm:px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                onBack();
              }}
              aria-label="Back to Home"
              className="w-10 h-10 rounded-full bg-[#1A1A22] flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 bg-[#14141C] p-1 rounded-full border border-white/10">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  onChangeSubTab('explore');
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold transition-all ${
                  subTab === 'explore' ? 'gold-gradient text-white shadow' : 'text-[#9CA3AF]'
                }`}
              >
                Explore
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  onChangeSubTab('party');
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold transition-all ${
                  subTab === 'party' ? 'gold-gradient text-white shadow' : 'text-[#9CA3AF]'
                }`}
              >
                Party Rooms
              </button>
            </div>
          </div>

          {subTab === 'explore' && searchOpen && (
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search Explore..."
              autoFocus
              className="flex-1 max-w-xs h-9 px-3 rounded-full bg-[#1A1A22] text-sm text-white border border-[#FFD700]/40 focus:outline-none"
            />
          )}

          <div className="flex items-center gap-2.5 shrink-0">
            {subTab === 'explore' && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setSearchOpen((v) => !v);
                }}
                aria-label="Search Explore"
                className="w-10 h-10 rounded-full bg-[#1A1A22] flex items-center justify-center text-white active:scale-95 transition-transform"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            <TreasureSpot id="tr-explore" foundIds={treasureFoundIds} onFind={onFindTreasure} label="Explore +200c" />
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                onOpenLeaderboard();
              }}
              aria-label="Open Leaderboard"
              className="w-10 h-10 rounded-full bg-[#1A1A22] border border-[#FFD700]/40 flex items-center justify-center active:scale-95 transition-transform gold-glow"
            >
              <Trophy className="w-5 h-5 text-[#FFD700] fill-[#FFD700]/30" />
            </button>
          </div>
        </div>

        {/* 2. Tabs & Country Pills ONLY when Explore sub-tab is active */}
        {subTab === 'explore' && (
          <>
            <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-1 pb-1.5 flex items-center gap-6">
              {EXPLORE_TABS.map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setActiveTab(tab);
                    }}
                    className={`relative pb-1.5 text-[15px] font-semibold whitespace-nowrap ${
                      active ? 'text-[#FFD700]' : 'text-[#888888]'
                    }`}
                  >
                    {tab}
                    {active && <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full gold-gradient" />}
                  </button>
                );
              })}
            </div>

            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {COUNTRY_PILLS.map((country) => {
                const active = activeCountry === country;
                return (
                  <button
                    key={country}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setActiveCountry(country);
                    }}
                    className={`h-8 px-4 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 active:scale-95 transition-all ${
                      active ? 'gold-gradient text-white shadow' : 'bg-[#1A1A22] text-[#A1A1AA]'
                    }`}
                  >
                    {country}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </header>

      {subTab === 'party' ? (
        <PartySystem
          rooms={rooms}
          coins={coins}
          activeRoomId={null}
          language={language}
          translationSettings={translationSettings}
          mode="list"
          onOpenTranslationSettings={onOpenTranslationSettings}
          onEnterRoom={onEnterRoom}
          onExitRoom={() => {}}
          onOpenLeaderboard={onOpenLeaderboard}
          onCreatePartyRoom={onCreatePartyRoom}
          onSendGift={onSendGift}
          onFirstRecharge={onFirstRecharge}
          onNotify={onNotify}
        />
      ) : (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-3 space-y-4">
        {/* 4. Top 2 Cards Row: Honor & Activity Center */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onOpenLeaderboard();
            }}
            className="h-[90px] rounded-[16px] glass-dark px-3.5 flex items-center justify-between text-left relative overflow-hidden active:scale-95 transition-transform gold-glow"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-[#FFD700]">Honor</span>
                <Sparkles className="w-4 h-4 text-[#FFD700] animate-pulse" />
              </div>
              <p className="text-xs text-white/75 mt-0.5">Top Gifters</p>
            </div>
            <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center shadow-lg shrink-0">
              <Crown className="w-7 h-7 text-white fill-white/30 animate-bounce" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setShowActivityModal(true);
            }}
            className="h-[90px] rounded-[16px] bg-gradient-to-br from-[#172554] to-[#1E1B4B] border border-sky-400/35 px-3.5 flex items-center justify-between text-left relative overflow-visible active:scale-95 transition-transform"
          >
            <div>
              <span className="text-base font-bold text-white">Activity Center</span>
              <p className="text-xs text-sky-200/80 mt-0.5">Events Inside</p>
            </div>
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shrink-0">
              <Star className="w-7 h-7 text-white fill-yellow-300" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow">
                3
              </span>
            </div>
          </button>
        </div>

        {/* 5. PK BANNER */}
        {showPkBanner && (
          <div className="relative w-full min-h-[120px] rounded-[20px] overflow-hidden border border-[#FFD700]/50 shadow-xl">
            <img
              src={IMG_PK_BANNER}
              alt="PK Combat Points Ranking"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 via-purple-900/80 to-amber-700/85" />

            <button
              type="button"
              onClick={() => setShowPkBanner(false)}
              aria-label="Close PK Banner"
              className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="relative z-10 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#FFD700] fill-[#FFD700]" />
                  <h2 className="text-base sm:text-lg font-extrabold text-white">
                    PK Combat Points Ranking
                  </h2>
                </div>
                <p className="text-xs text-white/80 font-mono-num">14/11/2026 - 20/11/2026</p>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-amber-200">
                  <span>Daily Top 1: 400,000</span>
                  <span>·</span>
                  <span>3-Day Top 1: 1,200,000</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-white text-[#07070D] font-mono-num font-extrabold text-xs flex items-center gap-1 shadow">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  <span>{formatCountdown(secondsLeft)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(18);
                    onCollectPrize();
                  }}
                  className="px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-300 text-amber-950 text-xs font-extrabold shadow-lg active:scale-95 transition-transform"
                >
                  Collect Prize
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. Trending Hashtags Row */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-[#FFD700]">Trending Hashtags</h3>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {HASHTAGS.map((tag) => {
              const active = activeHashtag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setActiveHashtag(active ? null : tag);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                    active
                      ? 'gold-gradient text-white shadow'
                      : 'bg-[#14141C] text-white border border-[#FFD700]/45'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Viral Videos Grid 2 Columns (4 on Desktop) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Viral Videos</h3>
            <span className="text-xs text-[#888888]">{filteredVideos.length} Reels</span>
          </div>
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
                className="relative h-[235px] rounded-[20px] overflow-hidden glass-dark cursor-pointer group active:scale-[0.98] transition-transform"
              >
                <img
                  src={vid.mediaUrl || vid.cover}
                  alt={vid.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-md border border-white/60 flex items-center justify-center shadow-[0_0_18px_rgba(255,255,255,0.4)]">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>

                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-semibold flex items-center gap-1 tabular-nums">
                  <Eye className="w-3 h-3 text-[#FFD700]" />
                  <span>{vid.views}</span>
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{vid.hostName}</p>
                    <p className="text-[11px] text-white/75 truncate">{vid.title}</p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full gold-gradient text-[10px] font-extrabold text-white shrink-0">
                    Lv.{vid.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Suggested Friends Row */}
        <div className="space-y-2.5 pt-1">
          <h3 className="text-sm font-bold text-[#FFD700]">Suggested Friends</h3>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            {SUGGESTED_FRIENDS.map((friend) => {
              const isFollowed = !!followedIds[friend.id];
              return (
                <div
                  key={friend.id}
                  className="w-36 shrink-0 rounded-2xl glass-dark p-3 flex flex-col items-center gap-2 text-center"
                >
                  <button
                    type="button"
                    onClick={() => onOpenProfile('other-hania')}
                    className="w-14 h-14 rounded-full p-[2px] gold-gradient active:scale-95 transition-transform"
                  >
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </button>
                  <div className="w-full">
                    <p className="text-xs font-bold text-white truncate">{friend.name}</p>
                    <p className="text-[11px] text-[#888888] truncate">Lv.{friend.level}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFollow(friend.id, friend.name)}
                    className={`w-full py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform ${
                      isFollowed
                        ? 'bg-[#26262F] text-white border border-white/15'
                        : 'gold-gradient text-white shadow'
                    }`}
                  >
                    {isFollowed ? <Check className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5 fill-white" />}
                    <span>{isFollowed ? 'Following' : 'Follow'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Activity Center Sheet */}
      {showActivityModal && (
        <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#1A1A22] rounded-t-3xl sm:rounded-3xl border border-[#FFD700]/35 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#FFD700]">Activity Center (3 Events)</h2>
              <button
                type="button"
                onClick={() => setShowActivityModal(false)}
                className="w-8 h-8 rounded-full bg-[#26262F] text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5">
              {[
                { title: 'PK Combat Points Ranking', reward: 'Daily Top 1: 400,000 Coins', badge: 'Live' },
                { title: 'First Recharge Treasure Chest', reward: 'Bonus 2x Gold Coins + VIP Frame', badge: 'Hot' },
                { title: 'Midnight Vibe Live Talent Hunt', reward: 'Win Royal Crown & 50K Followers', badge: 'New' },
              ].map((ev) => (
                <div key={ev.title} className="p-3.5 rounded-2xl bg-[#26262F] flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{ev.title}</p>
                    <p className="text-xs text-[#FFD700] mt-0.5">{ev.reward}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowActivityModal(false);
                      onCollectPrize();
                    }}
                    className="px-3.5 py-1.5 rounded-full gold-gradient text-xs font-bold text-white shrink-0"
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
