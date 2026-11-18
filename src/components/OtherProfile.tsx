import React, { useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Grid3X3,
  Heart,
  Play,
  Repeat2,
  Share2,
  UserPlus,
  Video,
} from 'lucide-react';
import { OtherUserProfile, ShadiState, ShortVideoItem } from '../types/mehfil';
import { triggerHaptic } from '../utils/haptics';
import { ShadiWeddingCard } from './ShadiCoupleBirthdayModals';

interface OtherProfileProps {
  profile: OtherUserProfile;
  shadi: ShadiState;
  onBack: () => void;
  onMessage: () => void;
  onPropose: () => void;
  onOpenMyProfile: () => void;
  onOpenCoupleRoom: () => void;
  onOpenVideo: (video: ShortVideoItem) => void;
  onNotify: (msg: string) => void;
}

export const OtherProfile: React.FC<OtherProfileProps> = ({
  profile,
  shadi,
  onBack,
  onMessage,
  onPropose,
  onOpenMyProfile,
  onOpenCoupleRoom,
  onOpenVideo,
  onNotify,
}) => {
  const [following, setFollowing] = useState(profile.isFollowing);
  const [activeTab, setActiveTab] = useState<'Grid' | 'Video' | 'Repost'>('Grid');
  const [heartPop, setHeartPop] = useState(false);
  const isMarriedToThisUser = shadi.isMarried && shadi.partnerHandle === profile.handle;

  const toggleFollow = () => {
    triggerHaptic(15);
    const next = !following;
    setFollowing(next);
    if (next) {
      setHeartPop(true);
      setTimeout(() => setHeartPop(false), 750);
    }
    onNotify(next ? `Followed ${profile.name} ❤️` : `Unfollowed ${profile.name}`);
  };

  return (
    <div className="fixed inset-0 z-[75] bg-white text-slate-900 overflow-y-auto pb-20">
      <div className="gold-line-top" />

      {/* 1. Top Bar Background White */}
      <header className="sticky top-0 z-20 h-14 px-4 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-sm font-bold text-slate-900 truncate">{profile.name}</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNotify(`Live notifications ON for ${profile.name}`)}
            aria-label="Bell"
            className="w-10 h-10 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const handle = profile.handle.replace(/^@/, '');
              const link = `Join me on Vibe Live - http://vibelive.com/@${handle}`;
              navigator.clipboard?.writeText(link).catch(() => {});
              onNotify(link);
            }}
            aria-label="Share"
            className="w-10 h-10 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto pt-4 px-4 space-y-4">
        {/* 2. Header: Avatar 92px Gold / Couple Ring + Verified Tick Blue */}
        <div className="flex flex-col items-center text-center gap-2 relative">
          <div
            className={`w-[92px] h-[92px] rounded-full p-[3px] shadow-md relative ${
              isMarriedToThisUser
                ? 'bg-gradient-to-tr from-pink-500 via-[#FFD700] to-rose-500 ring-2 ring-pink-400'
                : 'gold-gradient'
            }`}
          >
            <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
            {isMarriedToThisUser && (
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-[#FFD700] border-2 border-white flex items-center justify-center text-sm shadow">
                💍
              </span>
            )}
            {heartPop && (
              <Heart className="w-10 h-10 text-red-500 fill-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-heart-blast pointer-events-none" />
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <h1 className="text-[22px] font-bold text-slate-900">{profile.name}</h1>
            {profile.verified && <BadgeCheck className="w-5 h-5 text-sky-500 fill-sky-500/15" />}
          </div>
          <p className="text-[14px] text-slate-500 font-medium">{profile.handle}</p>

          {isMarriedToThisUser && (
            <button
              type="button"
              onClick={onOpenMyProfile}
              className="px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow active:scale-95"
            >
              <span>💍</span>
              <span>Married To @bilal</span>
            </button>
          )}

          {/* 3. Stats Row 3 Columns */}
          <div className="grid grid-cols-3 gap-6 py-2">
            <div>
              <p className="text-[17px] font-bold text-slate-900 tabular-nums">{profile.followingCount}</p>
              <p className="text-[12px] text-slate-500">Following</p>
            </div>
            <div>
              <p className="text-[17px] font-bold text-slate-900 tabular-nums">{profile.followersCount}</p>
              <p className="text-[12px] text-slate-500">Followers</p>
            </div>
            <div>
              <p className="text-[17px] font-bold text-slate-900 tabular-nums">{profile.likesCount}</p>
              <p className="text-[12px] text-slate-500">Likes</p>
            </div>
          </div>

          {/* 4. Buttons Row: Follow Red Gradient + Message + Propose Ring */}
          <div className="w-full max-w-md flex items-center gap-2 h-11">
            <button
              type="button"
              onClick={toggleFollow}
              className={`flex-[1.5] h-full rounded-xl font-bold text-sm active:scale-95 transition-transform ${
                following
                  ? 'bg-slate-200 text-slate-800'
                  : 'bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] text-white shadow-md'
              }`}
            >
              {following ? 'Following' : 'Follow'}
            </button>
            <button
              type="button"
              onClick={onMessage}
              className="flex-1 h-full rounded-xl bg-slate-100 text-slate-900 font-bold text-sm border border-slate-200 active:scale-95"
            >
              Message
            </button>
            {!isMarriedToThisUser ? (
              <button
                type="button"
                onClick={onPropose}
                className="flex-1 h-full rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-extrabold text-sm shadow-md active:scale-95 flex items-center justify-center gap-1"
              >
                <span>💍</span>
                <span>Propose</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenCoupleRoom}
                className="flex-1 h-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-extrabold text-xs shadow-md active:scale-95 flex items-center justify-center gap-1"
              >
                <span>💖</span>
                <span>Couple Room</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onNotify('Suggested creators expanded')}
              aria-label="Add Friend"
              className="w-11 h-full rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center shrink-0"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Bio Full Visible */}
          <p className="text-[14px] text-slate-800 font-medium pt-1">{profile.bio}</p>

          {/* Realistic Wedding Card on Partner Profile */}
          {isMarriedToThisUser && (
            <div className="w-full pt-1 text-left">
              <ShadiWeddingCard shadi={shadi} compact onPartnerClick={onOpenMyProfile} />
            </div>
          )}
        </div>

        {/* 5. Highlight Row */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          {profile.highlights.map((hl) => (
            <div key={hl.id} className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-14 h-14 rounded-full p-0.5 border-2 border-slate-300">
                <img src={hl.image} alt={hl.title} className="w-full h-full rounded-full object-cover" />
              </div>
              <span className="text-xs text-slate-600 font-medium">{hl.title}</span>
            </div>
          ))}
        </div>

        {/* 6. Tabs Row: Grid / Video / Repost */}
        <div className="grid grid-cols-3 border-b border-slate-200">
          {[
            { id: 'Grid' as const, icon: Grid3X3 },
            { id: 'Video' as const, icon: Video },
            { id: 'Repost' as const, icon: Repeat2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`h-11 flex items-center justify-center relative ${
                  active ? 'text-slate-900 font-bold' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                {active && <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-slate-900" />}
              </button>
            );
          })}
        </div>

        {/* 3 Columns Video Grid Gap 2px */}
        <div className="grid grid-cols-3 gap-[2px] -mx-4 sm:mx-0">
          {(activeTab === 'Repost' ? profile.videos.slice(0, 3) : profile.videos).map((vid, idx) => (
            <button
              key={vid.id}
              type="button"
              onClick={() => onOpenVideo(vid)}
              className="relative aspect-[3/4] bg-slate-900 overflow-hidden group text-left"
            >
              <img
                src={vid.mediaUrl || vid.cover}
                alt={vid.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

              {vid.isPinned && idx < 3 && (
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">
                  Pinned
                </span>
              )}

              <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-white text-xs font-bold tabular-nums">
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{vid.views}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Bottom Sticky Follow Button if Not Following */}
      {!following && (
        <div className="fixed bottom-4 left-4 right-4 z-30 flex justify-center pointer-events-none">
          <button
            type="button"
            onClick={toggleFollow}
            className="pointer-events-auto px-8 py-3 rounded-full gold-gradient text-white font-bold text-sm shadow-xl gold-glow active:scale-95"
          >
            Follow {profile.name}
          </button>
        </div>
      )}
    </div>
  );
};
