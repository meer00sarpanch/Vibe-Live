import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Camera,
  CameraOff,
  Clock,
  Eye,
  Gift,
  Heart,
  Languages,
  MessageCircle,
  MoreVertical,
  PauseCircle,
  Pin,
  ScanFace,
  Send,
  Share2,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Users,
  Video,
  X,
} from 'lucide-react';
import {
  GIFTS_CATALOG,
  IMG_HERO_LIVE,
  IMG_HOST_FEMALE,
  IMG_HOST_MALE,
} from '../data/mockData';
import {
  AppLanguage,
  GiftItem,
  LiveStreamItem,
  RoomPollState,
  ShortVideoItem,
  TranslationSettings,
  VoiceChangerMode,
} from '../types/mehfil';
import { playBirthdaySong, playGiftChime, triggerHaptic } from '../utils/haptics';
import { translateMessageText } from '../utils/i18n';
import {
  DareScoreEntry,
  InRoomActivityOverlay,
  InRoomActivityTab,
  LivePollRoomBanner,
  RoomActivityBar,
} from './InRoomGamesStudio';

interface LiveComment {
  id: string;
  user: string;
  text: string;
}

interface LiveViewerProps {
  stream: LiveStreamItem;
  isBroadcaster?: boolean;
  hostDailyTargetHours?: number;
  hostInitialTodaySeconds?: number;
  coins: number;
  isVip?: boolean;
  language: AppLanguage;
  translationSettings: TranslationSettings;
  onOpenTranslationSettings: () => void;
  onClose: () => void;
  onOpenHostProfile: () => void;
  onSendGift: (gift: GiftItem, hostName: string) => void;
  onSpendCoins?: (cost: number, reason: string) => boolean;
  onRewardCoins?: (amt: number, reason: string) => void;
  onWinKaraoke?: (songTitle: string) => void;
  onOpenVipPage?: () => void;
  onBroadcasterSecondTick?: () => void;
  onTriggerCoinRainNow?: () => void;
  onTriggerBirthdayBlast?: () => void;
  onNotify: (msg: string) => void;
}

export const LiveStreamModal: React.FC<LiveViewerProps> = ({
  stream,
  isBroadcaster,
  hostDailyTargetHours = 3,
  hostInitialTodaySeconds = 0,
  coins,
  isVip = false,
  language,
  translationSettings,
  onOpenTranslationSettings,
  onClose,
  onOpenHostProfile,
  onSendGift,
  onSpendCoins,
  onRewardCoins,
  onWinKaraoke,
  onOpenVipPage,
  onBroadcasterSecondTick,
  onTriggerCoinRainNow,
  onTriggerBirthdayBlast,
  onNotify,
}) => {
  const [followed, setFollowed] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [fullTrModal, setFullTrModal] = useState<{ user: string; original: string; translated: string; sourceLang: string } | null>(null);
  const [chatText, setChatText] = useState('');
  const [comments, setComments] = useState<LiveComment[]>([
    { id: 'lc1', user: 'Ali Raza', text: 'MashAllah awesome Vibe Live! 🔥' },
    { id: 'lc2', user: 'Ms SHIZUKA', text: '你好, 你怎么样? Send Rose everyone 🌹' },
    { id: 'lc3', user: 'Hamza', text: 'Lahore se full support!' },
  ]);

  // HISSA 27: Live Chat Message Pin System
  const [isHostOrAdmin, setIsHostOrAdmin] = useState<boolean>(!!isBroadcaster);
  const [pinnedMessage, setPinnedMessage] = useState<LiveComment | null>(null);
  const [menuMsgId, setMenuMsgId] = useState<string | null>(null);

  // HISSA 26 FINAL: In-Room Truth & Dare, Karaoke, Mini Games, Live Poll, Voice Changer
  const [activityTab, setActivityTab] = useState<InRoomActivityTab | null>(null);
  const [voiceMode, setVoiceMode] = useState<VoiceChangerMode>('original');
  const [mutedSecondsLeft, setMutedSecondsLeft] = useState(0);
  const [dareScores, setDareScores] = useState<DareScoreEntry[]>([
    { name: 'BiLAL', daresCompleted: 2 },
    { name: stream.hostName, daresCompleted: 1 },
    { name: 'Ali Raza', daresCompleted: 1 },
  ]);
  const [activePoll, setActivePoll] = useState<RoomPollState | null>({
    id: 'poll-init',
    question: 'Aaj Kya Karu?',
    options: [
      { id: 'po-1', label: 'Gaana', votes: 18 },
      { id: 'po-2', label: 'Shayari', votes: 11 },
      { id: 'po-3', label: 'Dance', votes: 9 },
      { id: 'po-4', label: 'Game', votes: 14 },
    ],
    votedOptionId: null,
    createdAt: Date.now() - 31 * 60 * 1000,
    cooldownEndsAt: Date.now() - 1000,
  });
  const [roomBannerNotice, setRoomBannerNotice] = useState<string | null>(null);

  useEffect(() => {
    if (mutedSecondsLeft <= 0) return;
    const t = window.setInterval(() => {
      setMutedSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [mutedSecondsLeft]);

  // HISSA 22 FINAL: Host Live Timer + 5-Min Camera-Off / No-Face Anti-Fake Pause
  const [broadcastSeconds, setBroadcastSeconds] = useState<number>(hostInitialTodaySeconds);
  const [cameraOn, setCameraOn] = useState(true);
  const [faceDetected, setFaceDetected] = useState(true);
  const [idleAwaySeconds, setIdleAwaySeconds] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);

  const tickCallbackRef = useRef(onBroadcasterSecondTick);
  tickCallbackRef.current = onBroadcasterSecondTick;
  const notifyRef = useRef(onNotify);
  notifyRef.current = onNotify;
  const cameraOnRef = useRef(cameraOn);
  cameraOnRef.current = cameraOn;
  const faceDetectedRef = useRef(faceDetected);
  faceDetectedRef.current = faceDetected;

  useEffect(() => {
    if (!isBroadcaster) return;
    const interval = window.setInterval(() => {
      if (cameraOnRef.current && faceDetectedRef.current) {
        setIdleAwaySeconds(0);
        setTimerPaused(false);
        setBroadcastSeconds((s) => s + 1);
        tickCallbackRef.current?.();
      } else {
        setIdleAwaySeconds((prev) => {
          const next = prev + 1;
          if (next >= 300) {
            setTimerPaused((wasPaused) => {
              if (!wasPaused) {
                notifyRef.current('Timer Paused: Camera Off / No Face for 5+ Min');
              }
              return true;
            });
          }
          return next;
        });
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isBroadcaster]);

  const formatTimerHMS = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((totalSecs % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSecs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const targetHMS = `${String(hostDailyTargetHours).padStart(2, '0')}:00:00`;

  const sendComment = () => {
    if (mutedSecondsLeft > 0) {
      onNotify(`You are muted for ${Math.ceil(mutedSecondsLeft / 60)}m (Dare penalty)!`);
      return;
    }
    if (!chatText.trim()) return;
    setComments((prev) => [...prev, { id: `lc-${Date.now()}`, user: 'BiLAL', text: chatText.trim() }]);
    setChatText('');
  };

  const handlePinMessage = (comment: LiveComment) => {
    setMenuMsgId(null);
    if (!isHostOrAdmin) {
      onNotify('Only Host / Admin can pin messages');
      return;
    }
    triggerHaptic(16);
    setPinnedMessage(comment);
    onNotify(`Pinned ${comment.user}'s message 📌`);
  };

  const handleUnpinMessage = () => {
    setMenuMsgId(null);
    if (!isHostOrAdmin) {
      onNotify('Only Host / Admin can unpin messages');
      return;
    }
    triggerHaptic();
    setPinnedMessage(null);
    onNotify('Message Unpinned');
  };

  const handleShareStream = () => {
    const cleanHandle = stream.handle.replace(/^@/, '');
    const shareText = `Join me on Vibe Live - http://vibelive.com/@${cleanHandle}`;
    navigator.clipboard?.writeText(shareText).catch(() => {});
    onNotify(shareText);
  };

  return (
    <div
      onClick={() => menuMsgId && setMenuMsgId(null)}
      className="fixed inset-0 z-[85] bg-[#07070D] flex flex-col overflow-hidden"
    >
      <img src={stream.cover} alt={stream.hostName} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-transparent to-black/85" />

      {/* Top Host Header */}
      <div className="relative z-10 p-3.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onOpenHostProfile}
          className="flex items-center gap-2 bg-black/50 backdrop-blur-md pr-3 pl-1 py-1 rounded-full border border-[#FFD700]/40 min-w-0"
        >
          <img src={stream.avatar} alt={stream.hostName} className="w-9 h-9 rounded-full object-cover border border-[#FFD700] shrink-0" />
          <div className="text-left min-w-0">
            <p className="text-xs font-bold text-white leading-tight truncate">
              {isBroadcaster ? 'You (Live Broadcaster)' : stream.hostName}
            </p>
            <p className="text-[10px] text-[#FFD700] font-semibold truncate">Lv.{stream.level} · {stream.viewers} Watching</p>
          </div>
          {!isBroadcaster && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic();
                setFollowed((f) => !f);
              }}
              className="ml-1 px-2.5 py-1 rounded-full gold-gradient text-[10px] font-extrabold text-white shrink-0"
            >
              {followed ? '✓' : '+ Follow'}
            </span>
          )}
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Role Switcher so Host/Admin vs Viewer pin rules are verifiable on any stream */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setMenuMsgId(null);
              setIsHostOrAdmin((prev) => {
                const next = !prev;
                onNotify(next ? 'Host / Admin Role Active (Can Pin)' : 'Viewer Mode Active (View Only)');
                return next;
              });
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 border transition-colors ${
              isHostOrAdmin
                ? 'bg-amber-500/25 text-[#FFD700] border-[#FFD700]/60'
                : 'bg-black/55 text-white/75 border-white/15'
            }`}
            title="Switch Host/Admin vs Viewer"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{isHostOrAdmin ? 'Host/Admin' : 'Viewer'}</span>
          </button>
          <button
            type="button"
            onClick={handleShareStream}
            aria-label="Share Stream"
            className="w-9 h-9 rounded-full bg-black/55 text-white flex items-center justify-center"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenTranslationSettings}
            aria-label="Translation Settings"
            className={`w-9 h-9 rounded-full flex items-center justify-center ${
              translationSettings.autoTranslate
                ? 'bg-[#FFD700]/25 text-[#FFD700] border border-[#FFD700]/50'
                : 'bg-black/55 text-white'
            }`}
          >
            <Languages className="w-4 h-4" />
          </button>
          <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/55 text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* HISSA 24, 25 & 26: Room Quick Events + Games + Poll + Voice Changer */}
      <div className="relative z-10 px-3.5 space-y-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {onTriggerCoinRainNow && (
            <button
              type="button"
              onClick={onTriggerCoinRainNow}
              className="px-3 py-1 rounded-full bg-emerald-600/90 border border-emerald-300/60 text-white text-[11px] font-extrabold flex items-center gap-1 shadow shrink-0 active:scale-95"
            >
              <span>🌧️</span>
              <span>Coin Rain 30s</span>
            </button>
          )}
          {onTriggerBirthdayBlast && (
            <button
              type="button"
              onClick={() => {
                playBirthdaySong();
                onTriggerBirthdayBlast();
              }}
              className="px-3 py-1 rounded-full bg-pink-600/90 border border-pink-300/60 text-white text-[11px] font-extrabold flex items-center gap-1 shadow shrink-0 active:scale-95"
            >
              <span>🎂</span>
              <span>Birthday Party</span>
            </button>
          )}
        </div>

        <RoomActivityBar
          onOpenTab={setActivityTab}
          voiceMode={voiceMode}
          dareKingName={
            [...dareScores].sort((a, b) => b.daresCompleted - a.daresCompleted)[0]?.name || 'BiLAL'
          }
          mutedSecondsLeft={mutedSecondsLeft}
        />

        {roomBannerNotice && (
          <div className="px-3 py-1.5 rounded-xl gold-gradient text-white text-xs font-black shadow-lg flex items-center justify-between gap-2">
            <span className="truncate">🏆 {roomBannerNotice}</span>
            <button type="button" onClick={() => setRoomBannerNotice(null)} className="shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <LivePollRoomBanner
          poll={activePoll}
          onVote={(optId) => {
            setActivePoll((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                votedOptionId: optId,
                options: prev.options.map((o) => (o.id === optId ? { ...o, votes: o.votes + 1 } : o)),
              };
            });
            onNotify('Poll Vote Submitted! 📊');
          }}
          onDismiss={() => setActivePoll(null)}
        />
      </div>

      {/* HISSA 22 FINAL: Host Live Timer & 5-Min Anti-Fake Camera/Face Guard */}
      {isBroadcaster && (
        <div className="relative z-10 px-3.5 space-y-1.5">
          <div
            className={`rounded-2xl px-3 py-2 backdrop-blur-md border flex flex-wrap items-center justify-between gap-2 ${
              timerPaused
                ? 'bg-rose-950/80 border-rose-400/70'
                : 'bg-black/65 border-[#FFD700]/55'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {timerPaused ? (
                <PauseCircle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
              ) : (
                <Clock className="w-4 h-4 text-[#FFD700] shrink-0" />
              )}
              <span className="text-xs font-extrabold text-white tabular-nums truncate">
                Live Time: {formatTimerHMS(broadcastSeconds)} - Target: {targetHMS}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setCameraOn((prev) => {
                    const next = !prev;
                    if (next && faceDetected) {
                      setIdleAwaySeconds(0);
                      setTimerPaused(false);
                    }
                    onNotify(next ? 'Camera ON ✓' : 'Camera OFF — 5 Min Guard Active');
                    return next;
                  });
                }}
                className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                  cameraOn
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50'
                    : 'bg-rose-500/25 text-rose-300 border-rose-400/50'
                }`}
              >
                {cameraOn ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />}
                <span>{cameraOn ? 'Cam ON' : 'Cam OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setFaceDetected((prev) => {
                    const next = !prev;
                    if (next && cameraOn) {
                      setIdleAwaySeconds(0);
                      setTimerPaused(false);
                    }
                    onNotify(next ? 'Face Detected ✓' : 'No Face Detected — 5 Min Guard Active');
                    return next;
                  });
                }}
                className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                  faceDetected
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50'
                    : 'bg-amber-500/25 text-amber-300 border-amber-400/50'
                }`}
              >
                <ScanFace className="w-3 h-3" />
                <span>{faceDetected ? 'Face OK' : 'No Face'}</span>
              </button>
            </div>
          </div>

          {(!cameraOn || !faceDetected) && (
            <div className="rounded-xl px-3 py-1.5 bg-rose-600/85 text-white text-[11px] font-bold flex items-center justify-between gap-2">
              <span className="truncate">
                {timerPaused
                  ? 'Timer Paused (No Face / Camera Off 5+ Min) — Fake Time Blocked!'
                  : `Warning: Camera Off / No Face (${idleAwaySeconds}s / 300s before auto-pause)`}
              </span>
              {!timerPaused && (
                <button
                  type="button"
                  onClick={() => {
                    setIdleAwaySeconds(300);
                    setTimerPaused(true);
                    onNotify('Timer Paused: Camera Off / No Face for 5+ Min');
                  }}
                  className="px-2 py-0.5 rounded-full bg-black/40 text-[#FFD700] text-[10px] font-extrabold shrink-0"
                >
                  +5m Test
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Live Comments & Pinned Bar + Gift Input */}
      <div className="relative z-10 mt-auto p-4 space-y-2.5">
        {/* HISSA 27: PINNED BAR — Height 48px, Gold Background, Sticky Above Scrolling Chat, Visible to All */}
        <AnimatePresence mode="wait">
          {pinnedMessage && (
            <motion.div
              key={pinnedMessage.id}
              initial={{ y: -32, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                scale: [1, 1.03, 0.985, 1.015, 1],
              }}
              exit={{ y: 24, opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration: 0.95, ease: 'easeOut' }}
              className="relative h-[48px] px-3 rounded-2xl gold-gradient border border-yellow-200/75 shadow-[0_6px_22px_rgba(255,215,0,0.42)] flex items-center justify-between gap-2 overflow-hidden"
            >
              {/* Gold Shine Sweep */}
              <motion.span
                initial={{ x: '-120%' }}
                animate={{ x: '240%' }}
                transition={{ duration: 0.95, ease: 'easeInOut' }}
                className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent -skew-x-12"
              />

              <div className="relative z-10 flex items-center gap-2 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-full bg-black/25 flex items-center justify-center shrink-0">
                  <Pin className="w-3.5 h-3.5 text-white fill-white -rotate-45" />
                </div>
                <p className="text-xs sm:text-sm text-white truncate">
                  <span className="font-extrabold text-amber-950 bg-yellow-200/90 px-1.5 py-0.5 rounded-md mr-1.5">
                    {pinnedMessage.user}
                  </span>
                  <span className="font-semibold text-white drop-shadow-xs">{pinnedMessage.text}</span>
                </p>
              </div>

              {isHostOrAdmin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnpinMessage();
                  }}
                  aria-label="Unpin Message"
                  className="relative z-10 w-7 h-7 rounded-full bg-black/30 hover:bg-black/45 text-white flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Live Chat Comments */}
        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
          {comments.map((c) => {
            const tr = translationSettings.autoTranslate ? translateMessageText(c.text, language) : null;
            const isPinned = pinnedMessage?.id === c.id;
            const menuOpen = menuMsgId === c.id;
            return (
              <div key={c.id} className="relative flex items-start gap-1.5 max-w-[92%]">
                <div
                  onClick={() =>
                    tr &&
                    setFullTrModal({
                      user: c.user,
                      original: c.text,
                      translated: tr.translated,
                      sourceLang: tr.sourceLang,
                    })
                  }
                  className={`flex-1 px-3 py-1.5 rounded-2xl bg-black/55 backdrop-blur-sm text-white cursor-pointer border ${
                    isPinned ? 'border-[#FFD700]/65' : 'border-transparent'
                  }`}
                >
                  {tr && translationSettings.mode === 'onlyTranslation' ? (
                    <p className="text-[15px] leading-snug">
                      <span className="font-bold text-[#FFD700]">{c.user}: </span>
                      <span>{tr.translated}</span>
                    </p>
                  ) : (
                    <>
                      <p className="text-[15px] leading-snug">
                        <span className="font-bold text-[#FFD700]">{c.user}: </span>
                        <span>{c.text}</span>
                      </p>
                      {tr && (
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5 flex items-center gap-1">
                          <Languages className="w-3 h-3 shrink-0" />
                          <span>{tr.translated}</span>
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* 3-Dot Button on Every Message */}
                <button
                  type="button"
                  aria-label="Message Options"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic();
                    setMenuMsgId((cur) => (cur === c.id ? null : c.id));
                  }}
                  className="w-7 h-7 mt-0.5 rounded-full bg-black/55 hover:bg-black/75 text-white/85 flex items-center justify-center shrink-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* 3-Dot Action Popover */}
                {menuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 bottom-8 z-30 min-w-[155px] rounded-2xl bg-[#14141D] border border-[#FFD700]/45 shadow-2xl p-1.5"
                  >
                    {isHostOrAdmin ? (
                      <button
                        type="button"
                        onClick={() => (isPinned ? handleUnpinMessage() : handlePinMessage(c))}
                        className="w-full px-3 py-2 rounded-xl hover:bg-[#26262F] text-left text-xs font-bold text-[#FFD700] flex items-center gap-2"
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>{isPinned ? 'Unpin Message' : 'Pin Message'}</span>
                      </button>
                    ) : (
                      <div className="px-3 py-2 text-[11px] text-[#9CA3AF] font-medium flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-white/50 shrink-0" />
                        <span>Host / Admin only can pin</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {fullTrModal && (
          <div onClick={() => setFullTrModal(null)} className="fixed inset-0 z-[95] bg-black/75 flex items-center justify-center p-4">
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-3xl bg-[#14141D] border border-[#FFD700]/45 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FFD700]">{fullTrModal.user} · Translation</span>
                <button type="button" onClick={() => setFullTrModal(null)} className="text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3 rounded-2xl bg-[#1A1A22] text-sm text-white">
                <p className="text-[10px] text-[#9CA3AF] uppercase mb-1">Original ({fullTrModal.sourceLang})</p>
                {fullTrModal.original}
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-[#FFD700]/35 text-sm font-semibold text-white">
                <p className="text-[10px] text-[#FFD700] uppercase mb-1">Translated ({language})</p>
                {fullTrModal.translated}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1 h-11 px-3.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center gap-2">
            <input
              type="text"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendComment()}
              placeholder="Say something nice..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white/60 focus:outline-none"
            />
            <button type="button" onClick={sendComment} className="text-[#FFD700]">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowGifts(true)}
            className="w-11 h-11 rounded-full gold-gradient text-white flex items-center justify-center shadow-lg gold-glow active:scale-95"
          >
            <Gift className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showGifts && (
        <div onClick={() => setShowGifts(false)} className="fixed inset-0 z-[90] bg-black/65 flex items-end justify-center">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-[#1A1A22] rounded-t-3xl p-4 space-y-3 border-t border-[#FFD700]/45">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#FFD700]">Send Gift</span>
              <span className="text-xs font-bold text-white">Coins: {coins}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {GIFTS_CATALOG.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    playGiftChime();
                    onSendGift(g, stream.hostName);
                    setComments((prev) => [...prev, { id: `lg-${Date.now()}`, user: 'BiLAL', text: `sent ${g.name} ${g.emoji}` }]);
                    setShowGifts(false);
                  }}
                  className="p-3 rounded-2xl bg-[#26262F] flex flex-col items-center gap-1"
                >
                  <span className="text-3xl">{g.emoji}</span>
                  <span className="text-xs font-bold text-white">{g.name}</span>
                  <span className="text-[11px] font-bold text-[#FFD700]">{g.cost} Coins</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <InRoomActivityOverlay
        activeTab={activityTab}
        onChangeTab={setActivityTab}
        onClose={() => setActivityTab(null)}
        coins={coins}
        isHost={isHostOrAdmin}
        isVip={isVip}
        hostName={stream.hostName}
        voiceMode={voiceMode}
        onSelectVoiceMode={(mode) => {
          setVoiceMode(mode);
          onNotify(`Voice Changer Active: ${mode} 🗣️`);
        }}
        onOpenVipPage={() => {
          setActivityTab(null);
          onOpenVipPage?.();
        }}
        activePoll={activePoll}
        onLaunchPoll={(question, opts) => {
          setActivePoll({
            id: `poll-${Date.now()}`,
            question,
            options: opts.map((label, idx) => ({ id: `po-${idx}`, label, votes: 0 })),
            votedOptionId: null,
            createdAt: Date.now(),
            cooldownEndsAt: Date.now() + 30 * 60 * 1000,
          });
          onNotify('Live Poll Started (Next Poll after 30 Min)! 📊');
        }}
        onVotePoll={(optId) => {
          setActivePoll((prev) =>
            prev
              ? {
                  ...prev,
                  votedOptionId: optId,
                  options: prev.options.map((o) => (o.id === optId ? { ...o, votes: o.votes + 1 } : o)),
                }
              : prev
          );
        }}
        dareScores={dareScores}
        onCompleteDare={(playerName) => {
          setDareScores((prev) => {
            const exists = prev.some((p) => p.name === playerName);
            if (!exists) return [...prev, { name: playerName, daresCompleted: 1 }];
            return prev.map((p) => (p.name === playerName ? { ...p, daresCompleted: p.daresCompleted + 1 } : p));
          });
          onNotify(`${playerName} completed Dare! 🔥`);
        }}
        onSpendCoins={(cost, reason) =>
          onSpendCoins ? onSpendCoins(cost, reason) : true
        }
        onRewardCoins={(amt, reason) => onRewardCoins?.(amt, reason)}
        onMuteUserFiveMin={() => {
          setMutedSecondsLeft(300);
          onNotify('Muted for 5 Minutes (Dare skipped without 100c gift)');
        }}
        onWinKaraoke={(songTitle) => onWinKaraoke?.(songTitle)}
        onRoomAnnounce={(msg) => {
          setRoomBannerNotice(msg);
          setComments((prev) => [...prev, { id: `gm-${Date.now()}`, user: 'Room Event', text: msg }]);
        }}
        onNotify={onNotify}
      />
    </div>
  );
};

interface VideoViewerProps {
  video: ShortVideoItem;
  onClose: () => void;
  onOpenAuthor: () => void;
  onNotify: (msg: string) => void;
}

export const VideoViewerModal: React.FC<VideoViewerProps> = ({
  video,
  onClose,
  onOpenAuthor,
  onNotify,
}) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likes);
  const [blastPos, setBlastPos] = useState<{ x: number; y: number; key: number } | null>(null);

  const handleDoubleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    triggerHaptic(15);
    setBlastPos({ x: e.clientX, y: e.clientY, key: Date.now() });
    if (!liked) {
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
    setTimeout(() => setBlastPos(null), 850);
  };

  return (
    <div onDoubleClick={handleDoubleTap} className="fixed inset-0 z-[85] bg-black flex flex-col justify-between overflow-hidden select-none">
      <img
        src={video.mediaUrl || video.cover}
        alt={video.title}
        style={{ filter: video.filterCss || 'none' }}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />

      {blastPos && (
        <div
          key={blastPos.key}
          style={{ left: blastPos.x - 36, top: blastPos.y - 36 }}
          className="fixed z-30 pointer-events-none animate-heart-blast"
        >
          <Heart className="w-20 h-20 text-red-500 fill-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]" />
        </div>
      )}

      {/* Top */}
      <div className="relative z-10 p-4 flex items-center justify-between">
        <span className="px-3 py-1 rounded-full bg-black/50 text-xs font-bold text-[#FFD700] flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          <span>{video.views} Views</span>
        </span>
        <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Right Action Bar + Bottom Info */}
      <div className="relative z-10 p-4 flex items-end justify-between gap-4">
        <div className="space-y-2 max-w-[75%]">
          <button type="button" onClick={onOpenAuthor} className="flex items-center gap-2">
            <img src={video.avatar} alt={video.hostName} className="w-10 h-10 rounded-full object-cover border-2 border-[#FFD700]" />
            <div className="text-left">
              <p className="text-sm font-bold text-white">{video.hostName}</p>
              <p className="text-xs text-[#FFD700]">{video.handle}</p>
            </div>
          </button>
          <p className="text-sm text-white/95">{video.caption}</p>
          {video.songName && (
            <p className="text-xs text-amber-200 font-semibold">🎵 {video.songName}</p>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setLiked((l) => !l);
              setLikesCount((c) => (liked ? c - 1 : c + 1));
            }}
            className="flex flex-col items-center gap-1"
          >
            <Heart className={`w-8 h-8 ${liked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
            <span className="text-xs font-bold text-white tabular-nums">{likesCount.toLocaleString()}</span>
          </button>
          <button
            type="button"
            onClick={() => onNotify('Comments opened')}
            className="flex flex-col items-center gap-1"
          >
            <MessageCircle className="w-8 h-8 text-white" />
            <span className="text-xs font-bold text-white">245</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const handle = video.handle.replace(/^@/, '');
              const link = `Join me on Vibe Live - http://vibelive.com/@${handle}`;
              navigator.clipboard?.writeText(link).catch(() => {});
              onNotify(link);
            }}
            className="flex flex-col items-center gap-1"
          >
            <Share2 className="w-7 h-7 text-white" />
            <span className="text-xs font-bold text-white">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface RandomMatchProps {
  onClose: () => void;
  onStartChat: () => void;
}

export const RandomMatchModal: React.FC<RandomMatchProps> = ({ onClose, onStartChat }) => {
  const [matching, setMatching] = useState(true);
  const [matchIdx, setMatchIdx] = useState(0);
  const candidates = [
    { name: 'Ayesha Live', city: 'Lahore 🇵🇰', avatar: IMG_HERO_LIVE, level: 35 },
    { name: 'Hania Khan', city: 'Islamabad 🇵🇰', avatar: IMG_HOST_FEMALE, level: 32 },
    { name: 'Ali Raza', city: 'Karachi 🇵🇰', avatar: IMG_HOST_MALE, level: 48 },
  ];

  useEffect(() => {
    setMatching(true);
    const t = window.setTimeout(() => setMatching(false), 1400);
    return () => window.clearTimeout(t);
  }, [matchIdx]);

  const current = candidates[matchIdx % candidates.length];

  return (
    <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl glass-dark p-6 text-center space-y-5 relative">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#26262F] text-white flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-2 text-[#FFD700]">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-lg font-bold">Random Match</h3>
        </div>

        {matching ? (
          <div className="py-10 space-y-4">
            <div className="w-24 h-24 rounded-full gold-gradient mx-auto flex items-center justify-center animate-pulse-gold">
              <Shuffle className="w-10 h-10 text-white animate-spin" />
            </div>
            <p className="text-sm font-semibold text-white">Finding nearby Vibe Live friends...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-28 h-28 rounded-full p-1 gold-gradient mx-auto shadow-xl">
              <img src={current.avatar} alt={current.name} className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">{current.name}</h4>
              <p className="text-xs text-[#FFD700] font-semibold mt-0.5">
                {current.city} · Lv.{current.level}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setMatchIdx((i) => i + 1)}
                className="h-11 rounded-full bg-[#26262F] text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                <span>Next Match</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartChat();
                }}
                className="h-11 rounded-full gold-gradient text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Video className="w-4 h-4" />
                <span>Say Hi</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
