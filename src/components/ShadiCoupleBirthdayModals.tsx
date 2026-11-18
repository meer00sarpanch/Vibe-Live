import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Bell,
  Cake,
  Calendar,
  Clock,
  Crown,
  Film,
  Gift,
  Heart,
  Lock,
  Mic,
  MicOff,
  Music,
  Pause,
  Phone,
  PhoneOff,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  Video,
  X,
} from 'lucide-react';
import {
  COUPLE_EXCLUSIVE_GIFTS,
  COUPLE_SONGS,
  IMG_HOST_MALE,
} from '../data/mockData';
import {
  BirthdayState,
  BirthdayUserEntry,
  CoupleRoomState,
  GiftItem,
  MarriedCoupleEntry,
  ShadiState,
} from '../types/mehfil';
import {
  playBirthdaySong,
  playGiftChime,
  startBeatPreview,
  stopBeatPreview,
  triggerHaptic,
} from '../utils/haptics';

// 1. REALISTIC SHADI CERTIFICATE CARD (Shown on Both Profiles & Home)
interface ShadiCardProps {
  shadi: ShadiState;
  compact?: boolean;
  onPartnerClick?: () => void;
  onOpenCoupleRoom?: () => void;
  onRequestDivorce?: () => void;
  onCancelDivorce?: () => void;
  onCompleteDivorceWait?: () => void;
}

export const ShadiWeddingCard: React.FC<ShadiCardProps> = ({
  shadi,
  compact,
  onPartnerClick,
  onOpenCoupleRoom,
  onRequestDivorce,
  onCancelDivorce,
  onCompleteDivorceWait,
}) => {
  if (!shadi.isMarried) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2B0C1B] via-[#1B0E24] to-[#261808] border-2 border-[#FFD700]/80 p-4 text-white shadow-xl gold-glow space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#FFD700]">
          <Crown className="w-4 h-4 fill-[#FFD700]" />
          <span>We Are Married In Vibe Live</span>
        </span>
        <span className="text-[11px] text-pink-200 font-semibold">{shadi.marriedDate}</span>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-5 py-1">
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-pink-500 via-[#FFD700] to-rose-500 shadow-lg">
            <img src={IMG_HOST_MALE} alt="BiLAL" className="w-full h-full rounded-full object-cover" />
          </div>
          <span className="text-xs font-bold text-white">BiLAL</span>
          <span className="text-[10px] text-pink-200">@bilal</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-xl">💍</span>
          </div>
          <span className="text-[10px] font-bold text-[#FFD700]">Couple Frame</span>
        </div>

        <button
          type="button"
          onClick={onPartnerClick}
          className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
        >
          <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-pink-500 via-[#FFD700] to-rose-500 shadow-lg">
            <img src={shadi.partnerAvatar} alt={shadi.partnerName} className="w-full h-full rounded-full object-cover" />
          </div>
          <span className="text-xs font-bold text-white">{shadi.partnerName}</span>
          <span className="text-[10px] text-[#FFD700] underline">{shadi.partnerHandle}</span>
        </button>
      </div>

      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
          {onOpenCoupleRoom && (
            <button
              type="button"
              onClick={onOpenCoupleRoom}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Enter Private Couple Room</span>
            </button>
          )}

          {!shadi.divorcePending ? (
            onRequestDivorce && (
              <button
                type="button"
                onClick={onRequestDivorce}
                className="px-3 py-2 rounded-full bg-white/10 hover:bg-rose-950/60 text-rose-200 text-[11px] font-bold border border-rose-400/30"
              >
                Divorce (7d Wait · -200c)
              </button>
            )
          ) : (
            <div className="w-full rounded-2xl bg-rose-950/75 border border-rose-400/50 p-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-rose-100">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  Divorce Pending: <strong>{shadi.divorceDaysLeft} Days Left</strong> (200 Coins cut each)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {onCompleteDivorceWait && (
                  <button
                    type="button"
                    onClick={onCompleteDivorceWait}
                    className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold"
                  >
                    Fast-Forward 7d
                  </button>
                )}
                {onCancelDivorce && (
                  <button
                    type="button"
                    onClick={onCancelDivorce}
                    className="px-2.5 py-1 rounded-full bg-white/15 text-white text-[10px] font-bold"
                  >
                    Cancel Divorce
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 2. PROPOSE RING ANIMATION + ACCEPTANCE MODAL
interface ProposeModalProps {
  open: boolean;
  targetName: string;
  targetHandle: string;
  targetAvatar: string;
  onClose: () => void;
  onAcceptMarriage: () => void;
}

export const ProposeModal: React.FC<ProposeModalProps> = ({
  open,
  targetName,
  targetHandle,
  targetAvatar,
  onClose,
  onAcceptMarriage,
}) => {
  const [stage, setStage] = useState<'sending' | 'waiting' | 'accepted'>('sending');

  useEffect(() => {
    if (!open) return;
    setStage('sending');
    const t1 = window.setTimeout(() => setStage('waiting'), 1300);
    return () => window.clearTimeout(t1);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[115] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#2B0C1B] via-[#140A1A] to-[#0B0B10] border-2 border-[#FFD700] p-6 text-center space-y-4 shadow-2xl gold-glow relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 to-[#FFD700] p-1 shadow-xl">
          <img src={targetAvatar} alt={targetName} className="w-full h-full rounded-full object-cover" />
          <span className="absolute -bottom-2 -right-1 text-3xl animate-bounce">💍</span>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-pink-300">
            {stage === 'sending'
              ? 'Sending Golden Ring...'
              : stage === 'waiting'
                ? 'Proposal Sent!'
                : 'She Said YES! 💍💖'}
          </p>
          <h3 className="text-xl font-black text-white">
            Propose to {targetName}
          </h3>
          <p className="text-xs text-[#FFD700] font-semibold">{targetHandle}</p>
        </div>

        <div className="rounded-2xl bg-black/40 border border-pink-400/30 p-3 text-xs text-pink-100 space-y-1">
          <p>Shadi Benefits (Dono Ko):</p>
          <p className="font-bold text-[#FFD700]">+500 Coins Free · Couple Frame · Wedding Card · Private Couple Room</p>
        </div>

        {stage !== 'accepted' ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(25);
                playGiftChime();
                setStage('accepted');
                onAcceptMarriage();
              }}
              className="w-full h-11 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-[#FF8C00] text-white font-extrabold text-sm shadow-lg active:scale-95"
            >
              Simulate {targetName} Accepts 💍
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-white/60"
            >
              Wait / Close
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-full gold-gradient text-white font-extrabold text-sm shadow-lg"
          >
            View Shadi Card &amp; Rewards 🎉
          </button>
        )}
      </div>
    </div>
  );
};

// 3. MARRIED COUPLES LEADERBOARD MODAL
interface MarriedCouplesModalProps {
  open: boolean;
  couples: MarriedCoupleEntry[];
  onClose: () => void;
  onOpenPartnerProfile: (handle: string) => void;
  onSendHeartCouple: (coupleId: string) => void;
}

export const MarriedCouplesModal: React.FC<MarriedCouplesModalProps> = ({
  open,
  couples,
  onClose,
  onOpenPartnerProfile,
  onSendHeartCouple,
}) => {
  if (!open) return null;

  const sorted = [...couples].sort((a, b) => b.popularityScore - a.popularityScore);

  return (
    <div className="fixed inset-0 z-[95] bg-[#07070D]/95 backdrop-blur-md flex flex-col overflow-hidden">
      <div className="gold-line-top" />
      <header className="h-14 px-4 bg-[#0B0B10] border-b border-[#FFD700]/25 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
          <h2 className="text-base font-extrabold text-white">Married Couples</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto max-w-2xl w-full mx-auto p-4 space-y-3">
        <div className="rounded-2xl bg-gradient-to-r from-pink-950/70 via-[#1D0F24] to-amber-950/60 border border-[#FFD700]/40 p-3.5 text-xs text-pink-100">
          Sab se zyada Popular Couple Rank #1 par चमकता hai! Heart bhej kar apna favorite couple upar lao.
        </div>

        {sorted.map((couple, index) => (
          <div
            key={couple.id}
            className={`rounded-3xl p-4 border space-y-3 ${
              index === 0
                ? 'bg-gradient-to-br from-[#2B0C1B] to-[#261808] border-[#FFD700] gold-glow'
                : 'bg-[#12121A] border-white/10'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                    index === 0 ? 'gold-gradient text-white' : 'bg-[#26262F] text-[#FFD700]'
                  }`}
                >
                  #{index + 1} {index === 0 ? 'Most Popular 👑' : 'Married'}
                </span>
                {couple.isUserCouple && (
                  <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-bold">
                    Your Couple
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#9CA3AF]">{couple.marriedDate}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onOpenPartnerProfile(couple.partner2Handle)}
                className="flex items-center gap-2.5 min-w-0 text-left"
              >
                <div className="flex -space-x-3 shrink-0">
                  <img
                    src={couple.partner1Avatar}
                    alt={couple.partner1Name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#FFD700]"
                  />
                  <img
                    src={couple.partner2Avatar}
                    alt={couple.partner2Name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-pink-400"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-white truncate">
                    {couple.partner1Name} 💍 {couple.partner2Name}
                  </p>
                  <p className="text-[11px] text-pink-200 truncate">
                    Popularity: {couple.popularityScore.toLocaleString()} · ❤️ {couple.hearts.toLocaleString()}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  onSendHeartCouple(couple.id);
                }}
                className="px-3 py-1.5 rounded-full bg-pink-500/20 border border-pink-400/50 text-pink-200 text-xs font-bold flex items-center gap-1 shrink-0 active:scale-95"
              >
                <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                <span>Support</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. PRIVATE COUPLE ROOM MODAL (Strictly 2 People Only - Pink + Gold Theme)
interface CoupleRoomModalProps {
  open: boolean;
  shadi: ShadiState;
  coupleRoom: CoupleRoomState;
  coins: number;
  hasTrueLoveBadge: boolean;
  onClose: () => void;
  onProposeNow: () => void;
  onSendMessage: (text: string) => void;
  onSendCoupleGift: (gift: GiftItem) => void;
  onToggleSongPlay: () => void;
  onNextSong: () => void;
  onToggleMovieShare: () => void;
  onAddTalkMinutes: (seconds: number) => void;
  onClaimDailyCoupleReward: () => void;
  onSimulateSevenDayStreak: () => void;
  onNotify: (msg: string) => void;
}

export const CoupleRoomModal: React.FC<CoupleRoomModalProps> = ({
  open,
  shadi,
  coupleRoom,
  coins,
  hasTrueLoveBadge,
  onClose,
  onProposeNow,
  onSendMessage,
  onSendCoupleGift,
  onToggleSongPlay,
  onNextSong,
  onToggleMovieShare,
  onAddTalkMinutes,
  onClaimDailyCoupleReward,
  onSimulateSevenDayStreak,
  onNotify,
}) => {
  const [msgInput, setMsgInput] = useState('');
  const [callState, setCallState] = useState<'none' | 'voice' | 'video'>('none');
  const [micMuted, setMicMuted] = useState(false);

  useEffect(() => {
    if (!open) {
      stopBeatPreview();
      return;
    }
    const tick = window.setInterval(() => {
      onAddTalkMinutes(1);
    }, 1000);
    return () => {
      window.clearInterval(tick);
      stopBeatPreview();
    };
  }, [open, onAddTalkMinutes]);

  if (!open) return null;

  const song = COUPLE_SONGS[coupleRoom.activeSongIndex % COUPLE_SONGS.length];
  const talkMinutes = Math.floor(coupleRoom.talkSecondsToday / 60);
  const taskProgressPct = Math.min(100, Math.round((coupleRoom.talkSecondsToday / 1800) * 100));

  return (
    <div className="fixed inset-0 z-[105] bg-gradient-to-b from-[#2A0818] via-[#190819] to-[#0D060E] text-white flex flex-col overflow-hidden">
      {/* Subtle Romantic Floating Hearts Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
        {Array.from({ length: 12 }).map((_, i) => (
          <Heart
            key={i}
            style={{ left: `${(i * 9 + 5) % 92}%`, top: `${(i * 13 + 8) % 85}%` }}
            className="w-6 h-6 text-pink-400 fill-pink-400 absolute animate-pulse"
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-3 bg-black/35 backdrop-blur-md border-b border-pink-400/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-[#FFD700] flex items-center justify-center shrink-0 shadow">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-base font-black text-white truncate">Private Couple Room</h2>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/30 border border-pink-300/40 text-[10px] font-extrabold text-pink-100">
                2/2 Only
              </span>
            </div>
            <p className="text-[11px] text-[#FFD700] truncate">
              Hidden From Everyone · {shadi.isMarried ? `You & ${shadi.partnerName}` : 'Propose First to Unlock'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            stopBeatPreview();
            onClose();
          }}
          className="w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {!shadi.isMarried ? (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 to-[#FFD700] flex items-center justify-center shadow-2xl">
            <span className="text-5xl">💍</span>
          </div>
          <h3 className="text-xl font-black text-white">Couple Room Sirf 2 Married Partners Ke Liye Hai</h3>
          <p className="text-xs text-pink-200 leading-relaxed">
            Yahan koi teesra banda nahi aa sakta aur koi dekh nahi sakta. Pehle kisi ko Propose kar ke Shadi karo!
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              onProposeNow();
            }}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-[#FF8C00] text-white font-extrabold text-sm shadow-xl active:scale-95"
          >
            Propose Hania Khan Now 💍
          </button>
        </div>
      ) : (
        <div className="relative z-10 flex-1 overflow-y-auto max-w-3xl w-full mx-auto p-3.5 space-y-3">
          {/* Privacy Lock & True Love Badge Row */}
          <div className="rounded-2xl bg-black/40 border border-pink-400/35 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-pink-100">
              <ShieldCheck className="w-4 h-4 text-[#FFD700]" />
              <span>Private 2/2 · Zero Spectators Allowed</span>
            </div>
            {hasTrueLoveBadge ? (
              <span className="px-2.5 py-0.5 rounded-full gold-gradient text-[11px] font-black text-white flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>True Love Badge 👑</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={onSimulateSevenDayStreak}
                className="text-[11px] font-bold text-[#FFD700] underline"
              >
                Streak {coupleRoom.streakDays}/7d (+True Love)
              </button>
            )}
          </div>

          {/* Voice / Video / Music / Movie Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => {
                setCallState((c) => (c === 'voice' ? 'none' : 'voice'));
                onNotify('Couple Voice Call Toggled');
              }}
              className={`h-11 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 border ${
                callState === 'voice'
                  ? 'bg-emerald-500 text-white border-emerald-300'
                  : 'bg-black/45 text-pink-100 border-pink-400/30'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Voice Call</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCallState((c) => (c === 'video' ? 'none' : 'video'));
                onNotify('Couple Video Call Toggled');
              }}
              className={`h-11 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 border ${
                callState === 'video'
                  ? 'bg-pink-500 text-white border-pink-300'
                  : 'bg-black/45 text-pink-100 border-pink-400/30'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video Call</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (coupleRoom.isPlayingSong) {
                  stopBeatPreview();
                } else {
                  startBeatPreview(song.freq, song.bpm);
                }
                onToggleSongPlay();
              }}
              className={`h-11 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 border ${
                coupleRoom.isPlayingSong
                  ? 'gold-gradient text-white border-yellow-200'
                  : 'bg-black/45 text-pink-100 border-pink-400/30'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>{coupleRoom.isPlayingSong ? 'Pause Song' : 'Ek Saath Gaana'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleMovieShare}
              className={`h-11 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 border ${
                coupleRoom.movieScreenShare
                  ? 'bg-purple-600 text-white border-purple-300'
                  : 'bg-black/45 text-pink-100 border-pink-400/30'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Movie Screen</span>
            </button>
          </div>

          {/* Active Voice / Video Call View */}
          {callState !== 'none' && (
            <div className="rounded-3xl bg-black/55 border border-[#FFD700]/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300">
                  {callState === 'video' ? 'Private Couple Video Call' : 'Private Couple Voice Call'} · Encrypted
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMicMuted((m) => !m)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                  >
                    {micMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-white" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCallState('none')}
                    className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center"
                  >
                    <PhoneOff className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative h-32 rounded-2xl overflow-hidden border-2 border-[#FFD700]">
                  <img src={IMG_HOST_MALE} alt="BiLAL" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-[10px] font-bold">
                    BiLAL (You)
                  </span>
                </div>
                <div className="relative h-32 rounded-2xl overflow-hidden border-2 border-pink-400">
                  <img src={shadi.partnerAvatar} alt={shadi.partnerName} className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-[10px] font-bold">
                    {shadi.partnerName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Synced Music Player Bar */}
          <div className="rounded-2xl bg-black/45 border border-pink-400/30 p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-[#FFD700] flex items-center justify-center shrink-0">
                {coupleRoom.isPlayingSong ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-white truncate">🎵 Listening Together: {song.title}</p>
                <p className="text-[10px] text-pink-200 truncate">{song.artist} · Synced 2/2</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onNextSong}
              className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-[#FFD700] shrink-0"
            >
              Next Song
            </button>
          </div>

          {/* Synced Movie Screen Share */}
          {coupleRoom.movieScreenShare && (
            <div className="rounded-3xl bg-black border-2 border-[#FFD700]/60 overflow-hidden">
              <div className="h-36 bg-gradient-to-br from-rose-950 via-purple-950 to-black flex flex-col items-center justify-center gap-2 relative">
                <Film className="w-9 h-9 text-[#FFD700]" />
                <p className="text-xs font-extrabold text-white">Shared Movie Cinema · 2/2 Private Screen</p>
                <p className="text-[11px] text-pink-200">Dilwale Romantic Cut · 00:42:18</p>
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-red-600 text-[10px] font-bold">
                  LIVE SYNC
                </span>
              </div>
            </div>
          )}

          {/* Couple Daily Task: 30 Min Talk -> 100 Coins + 7d Streak True Love */}
          <div className="rounded-2xl bg-gradient-to-r from-pink-950/75 to-amber-950/60 border border-[#FFD700]/50 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-extrabold text-[#FFD700] flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Couple Daily Task: 30 Min Baat ({talkMinutes}/30 Min)</span>
              </span>
              {coupleRoom.dailyRewardClaimed ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                  +100 Coins Claimed ✓
                </span>
              ) : coupleRoom.talkSecondsToday >= 1800 ? (
                <button
                  type="button"
                  onClick={onClaimDailyCoupleReward}
                  className="px-3 py-1 rounded-full gold-gradient text-white text-[11px] font-extrabold animate-pulse"
                >
                  Claim +100 Coins
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onAddTalkMinutes(1800)}
                  className="px-2.5 py-1 rounded-full bg-white/10 text-pink-200 text-[10px] font-bold"
                >
                  +30m Demo
                </button>
              )}
            </div>
            <div className="h-2 rounded-full bg-black/45 overflow-hidden">
              <div
                style={{ width: `${taskProgressPct}%` }}
                className="h-full bg-gradient-to-r from-pink-500 to-[#FFD700] transition-all"
              />
            </div>
          </div>

          {/* Couple Room ONLY Exclusive Gifts */}
          <div className="rounded-2xl bg-black/45 border border-pink-400/35 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-pink-200">Couple Exclusive Gifts (Only Here!)</span>
              <span className="text-[#FFD700] font-bold">Coins: {coins.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {COUPLE_EXCLUSIVE_GIFTS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onSendCoupleGift(g)}
                  className="p-2 rounded-2xl bg-white/5 hover:bg-pink-500/20 border border-pink-400/25 flex flex-col items-center gap-0.5 active:scale-95"
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="text-[10px] font-bold text-white truncate max-w-full">{g.name}</span>
                  <span className="text-[10px] font-bold text-[#FFD700]">{g.cost}c</span>
                </button>
              ))}
            </div>
          </div>

          {/* Private Couple Chat Messages */}
          <div className="rounded-2xl bg-black/40 border border-white/10 p-3 space-y-2">
            <div className="max-h-44 overflow-y-auto space-y-2">
              {coupleRoom.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs ${
                      m.sender === 'me'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                        : 'bg-[#251529] text-pink-100 border border-pink-400/25'
                    }`}
                  >
                    <p>{m.text}</p>
                    <span className="text-[9px] opacity-75 block mt-0.5">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && msgInput.trim()) {
                    onSendMessage(msgInput.trim());
                    setMsgInput('');
                  }
                }}
                placeholder={`Whisper to ${shadi.partnerName}...`}
                className="flex-1 h-10 px-3.5 rounded-full bg-black/50 border border-pink-400/35 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!msgInput.trim()) return;
                  onSendMessage(msgInput.trim());
                  setMsgInput('');
                }}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-[#FFD700] text-white flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. AAJ KE BIRTHDAYS + BIRTHDAY BLAST MODAL
interface BirthdaysModalProps {
  open: boolean;
  birthdayState: BirthdayState;
  hasBirthdayFrame: boolean;
  onClose: () => void;
  onClaimMyBirthdayGift: () => void;
  onSendBirthdayGift: (entry: BirthdayUserEntry) => void;
  onSetBirthDate: (dateStr: string) => void;
  onTriggerBirthdayBlastDemo: () => void;
  onTriggerTomorrowReminder: () => void;
}

export const BirthdaysModal: React.FC<BirthdaysModalProps> = ({
  open,
  birthdayState,
  hasBirthdayFrame,
  onClose,
  onClaimMyBirthdayGift,
  onSendBirthdayGift,
  onSetBirthDate,
  onTriggerBirthdayBlastDemo,
  onTriggerTomorrowReminder,
}) => {
  const [dateDraft, setDateDraft] = useState(birthdayState.myBirthDate);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] bg-[#07070D]/95 backdrop-blur-md flex flex-col overflow-hidden">
      <div className="gold-line-top" />
      <header className="h-14 px-4 bg-[#0B0B10] border-b border-[#FFD700]/25 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Cake className="w-5 h-5 text-[#FFD700]" />
          <h2 className="text-base font-extrabold text-white">Aaj Ke Birthdays 🎂</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto max-w-2xl w-full mx-auto p-4 space-y-4">
        {/* Tomorrow Birthday Reminder Alert */}
        <div className="rounded-2xl bg-indigo-950/70 border border-indigo-400/40 p-3 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-indigo-100">
            <Bell className="w-4 h-4 text-[#FFD700] shrink-0" />
            <span>Kal Hania Ka Birthday Hai, Gift Ready Rakho!</span>
          </div>
          <button
            type="button"
            onClick={onTriggerTomorrowReminder}
            className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold shrink-0"
          >
            Send Alert
          </button>
        </div>

        {/* My Birthday Reward Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#2B1706] via-[#1B1026] to-[#280D1B] border-2 border-[#FFD700] p-4 space-y-3 gold-glow">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-full p-[2px] gold-gradient relative">
                <img src={IMG_HOST_MALE} alt="BiLAL" className="w-full h-full rounded-full object-cover" />
                <span className="absolute -top-2 -right-1 text-lg">🎂</span>
              </div>
              <div>
                <p className="text-sm font-black text-[#FFD700]">Happy Birthday Bilal 🎂</p>
                <p className="text-[11px] text-white/80">
                  Free Cake Gift + 1,000 Coins Free + Birthday Frame Free
                </p>
              </div>
            </div>
            {hasBirthdayFrame && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                Frame Active
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!birthdayState.birthdayBonusClaimed ? (
              <button
                type="button"
                onClick={() => {
                  playBirthdaySong();
                  onClaimMyBirthdayGift();
                }}
                className="flex-1 min-w-[180px] h-10 rounded-full gold-gradient text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow active:scale-95"
              >
                <Gift className="w-4 h-4" />
                <span>Claim 1000 Coins + Cake + Frame</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                ✓ Birthday Rewards Claimed!
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                playBirthdaySong();
                onTriggerBirthdayBlastDemo();
              }}
              className="px-3.5 h-10 rounded-full bg-pink-600 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Play Song &amp; Balloons</span>
            </button>
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FFD700]" />
            <span className="text-[11px] text-white/75">My Birth Date:</span>
            <input
              type="date"
              value={dateDraft}
              onChange={(e) => setDateDraft(e.target.value)}
              className="h-8 px-2.5 rounded-lg bg-black/50 border border-white/20 text-xs text-white"
            />
            <button
              type="button"
              onClick={() => onSetBirthDate(dateDraft)}
              className="px-3 h-8 rounded-lg bg-[#26262F] text-[#FFD700] text-xs font-bold"
            >
              Save Date
            </button>
          </div>
        </div>

        {/* All Birthdays Today List */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#FFD700]">
            Today&apos;s Celebrations ({birthdayState.birthdaysToday.length})
          </h3>
          {birthdayState.birthdaysToday.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl bg-[#12121A] border border-white/10 p-3.5 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={b.avatar}
                  alt={b.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#FFD700]"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {b.name} 🎂
                  </p>
                  <p className="text-[11px] text-[#9CA3AF] truncate">
                    {b.handle} · {b.wishedCount} Wishes · {b.giftCoinsReceived.toLocaleString()} Gift Coins
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSendBirthdayGift(b)}
                className="px-3.5 py-2 rounded-full gold-gradient text-white text-xs font-extrabold shrink-0 flex items-center gap-1 active:scale-95"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Wish + Gift</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
