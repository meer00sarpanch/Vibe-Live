import React, { useEffect, useState } from 'react';
import {
  Crown,
  Eye,
  Gift,
  Languages,
  Mic,
  MicOff,
  Music,
  PhoneOff,
  Plus,
  Search,
  Send,
  Share2,
  SkipForward,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react';
import {
  GIFTS_CATALOG,
  IMG_HERO_LIVE,
  IMG_HOST_FEMALE,
  IMG_HOST_MALE,
  IMG_MUSIC_PARTY,
  IMG_PK_BANNER,
  SONGS_CATALOG,
} from '../data/mockData';
import {
  AppLanguage,
  GiftItem,
  PartyRoomItem,
  PartySeat,
  RoomPollState,
  TranslationSettings,
  VoiceChangerMode,
} from '../types/mehfil';
import { playGiftChime, triggerHaptic } from '../utils/haptics';
import { translateMessageText } from '../utils/i18n';
import {
  DareScoreEntry,
  InRoomActivityOverlay,
  InRoomActivityTab,
  LivePollRoomBanner,
  RoomActivityBar,
} from './InRoomGamesStudio';

interface PartySystemProps {
  rooms: PartyRoomItem[];
  coins: number;
  isVip?: boolean;
  activeRoomId: string | null;
  pkActiveInitially?: boolean;
  language: AppLanguage;
  translationSettings: TranslationSettings;
  mode?: 'list' | 'room-only';
  onOpenTranslationSettings: () => void;
  onEnterRoom: (roomId: string, pk?: boolean) => void;
  onExitRoom: () => void;
  onOpenLeaderboard: () => void;
  onCreatePartyRoom: () => void;
  onSendGift: (gift: GiftItem, recipient: string) => void;
  onSpendCoins?: (cost: number, reason: string) => boolean;
  onRewardCoins?: (amt: number, reason: string) => void;
  onWinKaraoke?: (songTitle: string) => void;
  onOpenVipPage?: () => void;
  onFirstRecharge: () => void;
  onPkStarted?: () => void;
  onNotify: (msg: string) => void;
}

const COUNTRY_PILLS = ['Popular', 'Philippines', 'Nepal', 'India', 'Pakistan'];

export const PartySystem: React.FC<PartySystemProps> = ({
  rooms,
  coins,
  isVip = false,
  activeRoomId,
  pkActiveInitially,
  language,
  translationSettings,
  mode = 'list',
  onOpenTranslationSettings,
  onEnterRoom,
  onExitRoom,
  onOpenLeaderboard,
  onCreatePartyRoom,
  onSendGift,
  onSpendCoins,
  onRewardCoins,
  onWinKaraoke,
  onOpenVipPage,
  onFirstRecharge,
  onPkStarted,
  onNotify,
}) => {
  const [topTab, setTopTab] = useState<'Following' | 'Party'>('Party');
  const [countryPill, setCountryPill] = useState('Popular');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Inside Party Room state (HISSA 15)
  const activeRoom = rooms.find((r) => r.id === activeRoomId) || null;
  const [pkOn, setPkOn] = useState(!!pkActiveInitially);
  const [redScore, setRedScore] = useState(12500);
  const [blueScore, setBlueScore] = useState(10200);
  const [songIdx, setSongIdx] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(true);
  const [userMicOn, setUserMicOn] = useState(true);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [fullTrPopup, setFullTrPopup] = useState<{ user: string; original: string; translated: string; sourceLang: string } | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [roomMessages, setRoomMessages] = useState<
    { id: string; user: string; text: string; isGift?: boolean }[]
  >([
    { id: 'pm-1', user: 'Host Ayesha', text: 'Assalam o Alaikum! Sab ka welcome hai Vibe Live me ✨' },
    { id: 'pm-2', user: 'Hamza', text: 'sent Rose x10 🌹❤️', isGift: true },
    { id: 'pm-3', user: 'Ms SHIZUKA', text: '你好, 你怎么样? Aaj ka song bohat pyara hai!' },
  ]);

  const [seats, setSeats] = useState<PartySeat[]>([
    { seatIndex: 0, occupied: true, isHost: true, userName: 'Host Ayesha', avatar: IMG_HERO_LIVE, level: 35, micOn: true },
    { seatIndex: 1, occupied: true, userName: 'Ali Raza', avatar: IMG_HOST_MALE, level: 48, micOn: true },
    { seatIndex: 2, occupied: true, userName: 'Ms SHIZUKA', avatar: IMG_HOST_FEMALE, level: 29, micOn: false },
    { seatIndex: 3, occupied: true, userName: 'MUNI DON', avatar: IMG_HERO_LIVE, level: 28, micOn: true },
    { seatIndex: 4, occupied: true, userName: 'Hamza', avatar: IMG_HOST_MALE, level: 31, micOn: true },
    { seatIndex: 5, occupied: false },
    { seatIndex: 6, occupied: false },
    { seatIndex: 7, occupied: false },
  ]);

  // HISSA 26 FINAL: In-Room Truth & Dare, Karaoke, Mini Games, Live Poll, Voice Changer
  const [activityTab, setActivityTab] = useState<InRoomActivityTab | null>(null);
  const [voiceMode, setVoiceMode] = useState<VoiceChangerMode>('original');
  const [mutedSecondsLeft, setMutedSecondsLeft] = useState(0);
  const [dareScores, setDareScores] = useState<DareScoreEntry[]>([
    { name: 'BiLAL', daresCompleted: 2 },
    { name: 'Host Ayesha', daresCompleted: 1 },
    { name: 'Ali Raza', daresCompleted: 1 },
  ]);
  const [activePoll, setActivePoll] = useState<RoomPollState | null>({
    id: 'pp-init',
    question: 'Aaj Kya Karu?',
    options: [
      { id: 'ppo-1', label: 'Gaana', votes: 22 },
      { id: 'ppo-2', label: 'Shayari', votes: 14 },
      { id: 'ppo-3', label: 'Dance', votes: 8 },
      { id: 'ppo-4', label: 'Game', votes: 17 },
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

  useEffect(() => {
    if (activeRoom) {
      setPkOn(pkActiveInitially ?? !!activeRoom.pkActive);
      setRedScore(activeRoom.pkRedScore || 12500);
      setBlueScore(activeRoom.pkBlueScore || 10200);
    }
  }, [activeRoom, pkActiveInitially]);

  const handleSeatClick = (idx: number) => {
    triggerHaptic();
    const target = seats[idx];
    if (target.isUser) {
      setSeats((prev) => prev.map((s, i) => (i === idx ? { ...s, micOn: !s.micOn } : s)));
      return;
    }
    if (!target.occupied) {
      setSeats((prev) =>
        prev.map((s) =>
          s.isUser
            ? { seatIndex: s.seatIndex, occupied: false }
            : s.seatIndex === idx
              ? {
                  seatIndex: idx,
                  occupied: true,
                  isUser: true,
                  userName: 'BiLAL (You)',
                  avatar: IMG_HOST_MALE,
                  level: 24,
                  micOn: userMicOn,
                }
              : s
        )
      );
      onNotify(`Joined Mic Seat #${idx + 1}`);
    }
  };

  const sendRoomChat = () => {
    if (mutedSecondsLeft > 0) {
      onNotify(`Muted for ${Math.ceil(mutedSecondsLeft / 60)}m (Dare penalty)!`);
      return;
    }
    if (!chatInput.trim()) return;
    triggerHaptic();
    setRoomMessages((prev) => [
      ...prev,
      { id: `rm-${Date.now()}`, user: 'BiLAL', text: chatInput.trim() },
    ]);
    setChatInput('');
  };

  const handleSendRoomGift = (gift: GiftItem) => {
    playGiftChime();
    onSendGift(gift, activeRoom?.hostName || 'Host Ayesha');
    setRoomMessages((prev) => [
      ...prev,
      { id: `rg-${Date.now()}`, user: 'BiLAL', text: `sent ${gift.name} ${gift.emoji}`, isGift: true },
    ]);
    if (pkOn) {
      setRedScore((s) => s + gift.cost * 10);
    }
    setShowGiftModal(false);
  };

  // =================== HISSA 15: PARTY ROOM INSIDE ===================
  if (mode === 'room-only') {
    if (!activeRoom) return null;
    const currentSong = SONGS_CATALOG[songIdx % SONGS_CATALOG.length];
    const totalPk = redScore + blueScore || 1;
    const redPercent = Math.min(88, Math.max(12, Math.round((redScore / totalPk) * 100)));

    return (
      <div className="fixed inset-0 z-[75] bg-[#07070D] flex flex-col overflow-hidden">
        <div className="gold-line-top" />
        {/* Background Glow */}
        <div
          style={{ backgroundImage: `url(${activeRoom.cover})` }}
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl pointer-events-none"
        />

        {/* 1. Top Header 60px */}
        <header className="relative z-10 h-[60px] px-3 sm:px-4 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onExitRoom}
              aria-label="Leave Party Room"
              className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[17px] font-bold text-white truncate">{activeRoom.name}</h2>
                <span>{activeRoom.flag}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-white/80 tabular-nums">
                <Eye className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>{activeRoom.viewers}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenTranslationSettings}
              aria-label="Translation Settings"
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                translationSettings.autoTranslate
                  ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/45'
                  : 'bg-white/10 text-white/70'
              }`}
            >
              <Languages className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                const next = !pkOn;
                setPkOn(next);
                if (next) onPkStarted?.();
                onNotify(next ? 'PK Mode Started ⚡' : 'PK Mode Ended');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 active:scale-95 ${
                pkOn ? 'bg-red-600 text-white shadow-lg' : 'bg-[#1A1A22] text-[#FFD700] border border-[#FFD700]/40'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>{pkOn ? 'PK ON' : 'Start PK'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const handle = activeRoom.hostName.toLowerCase().replace(/[^a-z0-9]/g, '');
                const link = `Join me on Vibe Live - http://vibelive.com/@${handle || 'ayesha'}`;
                navigator.clipboard?.writeText(link).catch(() => {});
                onNotify(link);
              }}
              className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 6. PK Mode Inside Party */}
        {pkOn && (
          <div className="relative z-10 mx-3 sm:mx-4 mt-1 p-2.5 rounded-2xl glass-dark space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="text-red-400 font-mono-num">RED {redScore.toLocaleString()}</span>
              <span className="flex items-center gap-1 text-white px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-blue-600">
                <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                VS
              </span>
              <span className="text-sky-400 font-mono-num">{blueScore.toLocaleString()} BLUE</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden bg-blue-600 flex">
              <div style={{ width: `${redPercent}%` }} className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-300" />
            </div>
          </div>
        )}

        {/* HISSA 26: Truth & Dare + Karaoke + Mini Games + Poll + Voice Changer Bar */}
        <div className="relative z-10 px-3 sm:px-4 pt-1 space-y-1.5 max-w-3xl mx-auto w-full shrink-0">
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
              setActivePoll((prev) =>
                prev
                  ? {
                      ...prev,
                      votedOptionId: optId,
                      options: prev.options.map((o) => (o.id === optId ? { ...o, votes: o.votes + 1 } : o)),
                    }
                  : prev
              );
              onNotify('Poll Vote Submitted! 📊');
            }}
            onDismiss={() => setActivePoll(null)}
          />
        </div>

        {/* Main Scrollable Stage */}
        <div className="relative z-10 flex-1 overflow-y-auto px-3 sm:px-4 py-3 flex flex-col justify-between gap-3 max-w-3xl mx-auto w-full">
          {/* 2. Center: 8 Mic Seats Grid (2x4) */}
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 pt-1">
            {seats.map((seat) => (
              <button
                key={seat.seatIndex}
                type="button"
                onClick={() => handleSeatClick(seat.seatIndex)}
                className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
              >
                <div className="relative flex items-center justify-center">
                  {seat.isHost && (
                    <Crown className="w-5 h-5 text-[#FFD700] fill-[#FFD700] absolute -top-3.5 z-10 animate-bounce" />
                  )}
                  {seat.occupied ? (
                    <div
                      className={`rounded-full p-[2px] ${
                        seat.isHost ? 'w-[74px] h-[74px] gold-gradient shadow-[0_0_16px_rgba(255,215,0,0.6)]' : 'w-16 h-16 bg-[#FFD700]/70'
                      }`}
                    >
                      <img src={seat.avatar} alt={seat.userName} className="w-full h-full rounded-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/30 bg-white/5 flex items-center justify-center text-white/60">
                      <Plus className="w-6 h-6" />
                    </div>
                  )}

                  {seat.occupied && (
                    <span
                      className={`absolute -bottom-0.5 right-0 w-5 h-5 rounded-full border border-[#07070D] flex items-center justify-center ${
                        seat.micOn ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {seat.micOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-semibold text-white truncate max-w-[78px]">
                  {seat.occupied ? seat.userName : 'Join'}
                </span>
                {seat.isHost && (
                  <span className="px-1.5 py-0.5 rounded-full gold-gradient text-[9px] font-bold text-white leading-none">
                    Lv.{seat.level}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 3. Middle: Music Player Bar Height 48px Glass */}
          <div className="h-12 px-3 rounded-2xl glass-dark flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* 4 Animated Gold Equalizer Bars */}
              <div className="flex items-end gap-0.5 h-5 w-5 shrink-0">
                <span className={`w-1 bg-[#FFD700] rounded-full h-full ${musicPlaying ? 'eq-bar-1' : 'h-1.5'}`} />
                <span className={`w-1 bg-[#FF6B00] rounded-full h-full ${musicPlaying ? 'eq-bar-2' : 'h-2.5'}`} />
                <span className={`w-1 bg-[#FFD700] rounded-full h-full ${musicPlaying ? 'eq-bar-3' : 'h-2'}`} />
                <span className={`w-1 bg-[#FF6B00] rounded-full h-full ${musicPlaying ? 'eq-bar-4' : 'h-3'}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {currentSong.title} <span className="text-[#9CA3AF] font-normal">· {currentSong.artist}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMusicPlaying((m) => !m)}
                className="w-8 h-8 rounded-full bg-white/10 text-[#FFD700] flex items-center justify-center"
              >
                <Music className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setSongIdx((i) => i + 1)}
                aria-label="Skip Song"
                className="w-8 h-8 rounded-full gold-gradient text-white flex items-center justify-center"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4. Chat Area Height 180px with Real-Time 2-Line Auto-Translation */}
          <div className="h-[180px] overflow-y-auto space-y-2 pr-1">
            {roomMessages.map((m) => {
              const tr =
                !m.isGift && translationSettings.autoTranslate
                  ? translateMessageText(m.text, language)
                  : null;
              return (
                <div
                  key={m.id}
                  onClick={() =>
                    tr &&
                    setFullTrPopup({
                      user: m.user,
                      original: m.text,
                      translated: tr.translated,
                      sourceLang: tr.sourceLang,
                    })
                  }
                  className={`px-3 py-1.5 rounded-2xl max-w-[92%] ${
                    m.isGift
                      ? 'gold-gradient text-white font-bold shadow inline-flex items-center gap-1.5 text-xs'
                      : 'bg-black/45 backdrop-blur-sm text-white cursor-pointer'
                  }`}
                >
                  {tr && translationSettings.mode === 'onlyTranslation' ? (
                    <div className="text-[15px] leading-snug">
                      <span className="font-bold text-[#FFD700]">{m.user}: </span>
                      <span>{tr.translated}</span>
                    </div>
                  ) : (
                    <>
                      <div className={m.isGift ? 'text-xs' : 'text-[15px] leading-snug'}>
                        <span className={`font-bold ${m.isGift ? 'text-white' : 'text-[#FFD700]'}`}>{m.user}: </span>
                        <span>{m.text}</span>
                      </div>
                      {tr && (
                        <div className="flex items-start gap-1 mt-0.5 text-[11px] text-[#9CA3AF]">
                          <Languages className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>{tr.translated}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {fullTrPopup && (
          <div
            onClick={() => setFullTrPopup(null)}
            className="fixed inset-0 z-[90] bg-black/75 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-[#14141D] border border-[#FFD700]/45 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FFD700] flex items-center gap-1.5">
                  <Languages className="w-4 h-4" />
                  {fullTrPopup.user} · Translation
                </span>
                <button type="button" onClick={() => setFullTrPopup(null)} className="text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3 rounded-2xl bg-[#1A1A22] text-sm text-white">
                <p className="text-[10px] text-[#9CA3AF] uppercase mb-1">Original ({fullTrPopup.sourceLang})</p>
                {fullTrPopup.original}
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-[#FFD700]/35 text-sm font-semibold text-white">
                <p className="text-[10px] text-[#FFD700] uppercase mb-1">Translated ({language})</p>
                {fullTrPopup.translated}
              </div>
            </div>
          </div>
        )}

        {/* 5. Bottom Bar Height 68px */}
        <div className="relative z-10 h-[68px] px-3 bg-[#0B0B10]/95 border-t border-white/10 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowGiftModal(true)}
            className="flex flex-col items-center justify-center shrink-0 active:scale-95"
          >
            <div className="w-11 h-11 rounded-full gold-gradient flex items-center justify-center text-white shadow-lg gold-glow">
              <Gift className="w-5 h-5" />
            </div>
          </button>

          <div className="flex-1 h-11 px-3.5 rounded-[24px] bg-[#1A1A22] flex items-center gap-2 border border-white/10">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendRoomChat()}
              placeholder="Say Hi..."
              className="flex-1 bg-transparent text-sm text-white placeholder-[#888888] focus:outline-none"
            />
            <button type="button" onClick={sendRoomChat} className="text-[#FFD700]">
              <Send className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (mutedSecondsLeft > 0) {
                onNotify(`Mic Muted for ${Math.ceil(mutedSecondsLeft / 60)}m (Dare penalty)!`);
                return;
              }
              setUserMicOn((m) => !m);
              onNotify(!userMicOn ? 'Mic Unmuted' : 'Mic Muted');
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
              userMicOn && mutedSecondsLeft === 0 ? 'bg-emerald-600 text-white' : 'bg-[#26262F] text-white/70'
            }`}
          >
            {userMicOn && mutedSecondsLeft === 0 ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => setShowMembersModal(true)}
            className="w-11 h-11 rounded-full bg-[#26262F] text-white flex items-center justify-center shrink-0"
          >
            <Users className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onExitRoom}
            aria-label="Leave Room"
            className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        {/* Gift Drawer Modal */}
        {showGiftModal && (
          <div
            onClick={() => setShowGiftModal(false)}
            className="fixed inset-0 z-[85] bg-black/65 flex items-end justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#1A1A22] rounded-t-3xl border-t border-[#FFD700]/45 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#FFD700]">Send Royal Gift</span>
                <span className="text-xs font-bold text-white bg-[#26262F] px-3 py-1 rounded-full">
                  Balance: {coins} Coins
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {GIFTS_CATALOG.map((gift) => (
                  <button
                    key={gift.id}
                    type="button"
                    onClick={() => handleSendRoomGift(gift)}
                    className="p-3 rounded-2xl bg-[#26262F] hover:border-[#FFD700] border border-white/10 flex flex-col items-center gap-1 active:scale-95 transition-transform"
                  >
                    <span className="text-3xl">{gift.emoji}</span>
                    <span className="text-xs font-bold text-white">{gift.name}</span>
                    <span className="text-[11px] font-bold text-[#FFD700]">{gift.cost} Coins</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Members List Modal */}
        {showMembersModal && (
          <div
            onClick={() => setShowMembersModal(false)}
            className="fixed inset-0 z-[85] bg-black/65 flex items-end justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#1A1A22] rounded-t-3xl border-t border-[#FFD700]/45 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white">Room Listeners ({activeRoom.viewers})</h4>
                <button type="button" onClick={() => setShowMembersModal(false)} className="text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {seats
                  .filter((s) => s.occupied)
                  .map((s) => (
                    <div key={s.seatIndex} className="flex items-center justify-between p-2 rounded-xl bg-[#26262F]">
                      <div className="flex items-center gap-2.5">
                        <img src={s.avatar} alt={s.userName} className="w-9 h-9 rounded-full object-cover" />
                        <span className="text-sm font-bold text-white">{s.userName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full gold-gradient text-[10px] font-bold text-white">
                        Lv.{s.level || 24}
                      </span>
                    </div>
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
          isHost={activeRoom.hostName.includes('BiLAL')}
          isVip={isVip}
          hostName={activeRoom.hostName}
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
              id: `pp-${Date.now()}`,
              question,
              options: opts.map((label, idx) => ({ id: `ppo-${idx}`, label, votes: 0 })),
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
            setUserMicOn(false);
            onNotify('Muted for 5 Minutes (Dare skipped without 100c gift)');
          }}
          onWinKaraoke={(songTitle) => onWinKaraoke?.(songTitle)}
          onRoomAnnounce={(msg) => {
            setRoomBannerNotice(msg);
            setRoomMessages((prev) => [...prev, { id: `rgm-${Date.now()}`, user: 'Room Event', text: msg }]);
          }}
          onNotify={onNotify}
        />
      </div>
    );
  }

  // =================== HISSA 14: PARTY LIST (SHIFTED INTO EXPLORE > PARTY ROOMS) ===================
  const filteredRooms = rooms.filter((r) => {
    if (topTab === 'Following' && !r.isFollowing) return false;
    if (countryPill !== 'Popular' && r.country !== countryPill) return false;
    if (searchText.trim() && !r.name.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-[#07070D] pb-28">
      {/* 1. Party List Sub-Header */}
      <div className="bg-[#07070D]/95 border-b border-white/10">
        <div className="max-w-5xl mx-auto h-14 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            {(['Following', 'Party'] as const).map((tab) => {
              const active = topTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTopTab(tab)}
                  className={`relative pb-1 text-lg font-bold ${active ? 'text-[#FFD700]' : 'text-[#888888]'}`}
                >
                  {tab}
                  {active && <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full gold-gradient" />}
                </button>
              );
            })}
          </div>

          {searchOpen && (
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search Party..."
              autoFocus
              className="flex-1 max-w-xs h-9 px-3 rounded-full bg-[#1A1A22] text-sm text-white border border-[#FFD700]/40 focus:outline-none"
            />
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSearchOpen((s) => !s)}
              className="w-10 h-10 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onOpenLeaderboard}
              aria-label="Open Leaderboard"
              className="w-10 h-10 rounded-full bg-[#1A1A22] border border-[#FFD700]/40 flex items-center justify-center gold-glow"
            >
              <Trophy className="w-5 h-5 text-[#FFD700] fill-[#FFD700]/30" />
            </button>
          </div>
        </div>

        {/* 2. Pills Row: Popular Blue Gradient Active */}
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {COUNTRY_PILLS.map((pill) => {
            const active = countryPill === pill;
            return (
              <button
                key={pill}
                type="button"
                onClick={() => setCountryPill(pill)}
                className={`h-8 px-4 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-[#1A1A22] text-[#A1A1AA]'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-3 space-y-3">
        {/* 3. PK Banner Height 110px Dark Purple + Gold Border */}
        <div className="relative w-full min-h-[110px] rounded-2xl overflow-hidden bg-gradient-to-r from-[#2E1065] via-[#4C1D95] to-[#1E1B4B] border border-[#FFD700]/55 p-3.5 flex items-center justify-between gap-3">
          <img src={IMG_PK_BANNER} alt="PK" className="absolute inset-0 w-full h-full object-cover opacity-25" />
          <div className="relative z-10 space-y-1">
            <h2 className="text-base font-extrabold text-white">PK Combat Points Ranking</h2>
            <p className="text-xs text-white/80 font-mono-num">14/11/2026 - 20/11/2026</p>
            <p className="text-xs font-semibold text-amber-300">
              Daily Top 1: 400,000 · 3-Day Top 1: 1,200,000
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEnterRoom(rooms[0].id, true)}
            className="relative z-10 px-4 py-2 rounded-full bg-yellow-400 text-amber-950 text-xs font-extrabold shadow-lg shrink-0 active:scale-95"
          >
            Join PK
          </button>
        </div>

        {/* 4. Party Rooms Vertical List (Height 92px Each) */}
        <div className="space-y-2.5">
          {filteredRooms.map((room) => {
            const tagColor =
              room.tag === 'Make Friends'
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/35'
                : room.tag === 'Music'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/35'
                  : 'bg-amber-400/20 text-amber-300 border-amber-400/35';

            return (
              <div
                key={room.id}
                onClick={() => onEnterRoom(room.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onEnterRoom(room.id)}
                className="h-[92px] px-2.5 rounded-[16px] bg-[#14141C] border border-[#FFD700]/25 flex items-center justify-between gap-3 cursor-pointer hover:border-[#FFD700]/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={room.cover}
                    alt={room.name}
                    className="w-20 h-20 rounded-[12px] object-cover shrink-0 border border-white/10"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[16px] font-bold text-white truncate">{room.name}</h3>
                      <span>{room.flag}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${tagColor}`}>
                        {room.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-white/15 text-[10px] font-bold text-white/90 flex items-center justify-center">
                        {room.seatCount}
                      </span>
                      <span className="text-[11px] text-[#9CA3AF] truncate">{room.hostName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between h-[72px] shrink-0">
                  <div className="flex items-center gap-1 text-xs font-bold text-white tabular-nums">
                    <Eye className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>{room.viewers}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEnterRoom(room.id);
                    }}
                    className="w-[60px] h-8 rounded-full gold-gradient text-white text-xs font-extrabold shadow active:scale-95"
                  >
                    JOIN
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Bottom Right Floating: First Recharge Treasure Chest + Orange PARTY Button */}
      <div className="fixed right-4 bottom-24 z-30 flex flex-col items-end gap-2.5">
        <button
          type="button"
          onClick={onFirstRecharge}
          className="px-3 py-2 rounded-2xl bg-[#1A1A22]/95 border border-[#FFD700]/60 shadow-xl flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Sparkles className="w-5 h-5 text-[#FFD700] fill-[#FFD700]" />
          <div className="text-left">
            <p className="text-[10px] font-extrabold text-[#FFD700] leading-none">First Recharge</p>
            <p className="text-[9px] text-white/80 leading-tight">Treasure Chest</p>
          </div>
        </button>

        <button
          type="button"
          onClick={onCreatePartyRoom}
          className="h-14 px-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(255,107,0,0.6)] flex items-center gap-2 border-2 border-white/40 active:scale-95 transition-transform"
        >
          <Video className="w-5 h-5" />
          <span>PARTY</span>
        </button>
      </div>
    </div>
  );
};
