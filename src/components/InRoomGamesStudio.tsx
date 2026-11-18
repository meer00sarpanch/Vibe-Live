import React, { useEffect, useState } from 'react';
import {
  Award,
  BarChart3,
  Crown,
  Dices,
  Flame,
  Gamepad2,
  Heart,
  Lock,
  Mic,
  MicOff,
  Music,
  Search,
  Sparkles,
  Timer,
  Trophy,
  Volume2,
  X,
} from 'lucide-react';
import {
  DARE_TASKS,
  KARAOKE_SONGS_CATALOG,
  TRUTH_QUESTIONS,
} from '../data/mockData';
import {
  KaraokeSongItem,
  RoomPollState,
  VoiceChangerMode,
} from '../types/mehfil';
import { playGiftChime, playTone, startBeatPreview, stopBeatPreview, triggerHaptic } from '../utils/haptics';

export type InRoomActivityTab = 'truth' | 'karaoke' | 'minigames' | 'poll' | 'voice';

export interface DareScoreEntry {
  name: string;
  daresCompleted: number;
}

export const VOICE_CHANGER_OPTIONS: {
  id: VoiceChangerMode;
  label: string;
  emoji: string;
  freq: number;
  wave: OscillatorType;
}[] = [
  { id: 'original', label: 'Original', emoji: '🎙️', freq: 240, wave: 'sine' },
  { id: 'girl', label: 'Larki Ki Awaz', emoji: '👩', freq: 440, wave: 'sine' },
  { id: 'child', label: 'Bache Ki Awaz', emoji: '👶', freq: 580, wave: 'triangle' },
  { id: 'robot', label: 'Robot Ki Awaz', emoji: '🤖', freq: 185, wave: 'sawtooth' },
  { id: 'heavy', label: 'Bhaari Awaz', emoji: '🦁', freq: 110, wave: 'triangle' },
  { id: 'funny', label: 'Funny Awaz', emoji: '😜', freq: 690, wave: 'square' },
];

interface RoomActivityBarProps {
  onOpenTab: (tab: InRoomActivityTab) => void;
  voiceMode: VoiceChangerMode;
  dareKingName: string;
  mutedSecondsLeft: number;
}

export const RoomActivityBar: React.FC<RoomActivityBarProps> = ({
  onOpenTab,
  voiceMode,
  dareKingName,
  mutedSecondsLeft,
}) => {
  const voiceLabel = VOICE_CHANGER_OPTIONS.find((v) => v.id === voiceMode);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onOpenTab('truth')}
          className="px-2.5 py-1 rounded-full bg-rose-600/85 border border-rose-300/60 text-white text-[10px] font-extrabold whitespace-nowrap shrink-0 flex items-center gap-1 shadow active:scale-95"
        >
          <span>🍾</span>
          <span>Truth &amp; Dare</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenTab('karaoke')}
          className="px-2.5 py-1 rounded-full bg-fuchsia-600/85 border border-fuchsia-300/60 text-white text-[10px] font-extrabold whitespace-nowrap shrink-0 flex items-center gap-1 shadow active:scale-95"
        >
          <Mic className="w-3 h-3" />
          <span>Karaoke Battle</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenTab('minigames')}
          className="px-2.5 py-1 rounded-full bg-amber-600/90 border border-yellow-300/60 text-white text-[10px] font-extrabold whitespace-nowrap shrink-0 flex items-center gap-1 shadow active:scale-95"
        >
          <Gamepad2 className="w-3 h-3" />
          <span>Mini Games</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenTab('poll')}
          className="px-2.5 py-1 rounded-full bg-indigo-600/85 border border-indigo-300/60 text-white text-[10px] font-extrabold whitespace-nowrap shrink-0 flex items-center gap-1 shadow active:scale-95"
        >
          <BarChart3 className="w-3 h-3" />
          <span>Live Poll</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenTab('voice')}
          className="px-2.5 py-1 rounded-full bg-emerald-600/85 border border-emerald-300/60 text-white text-[10px] font-extrabold whitespace-nowrap shrink-0 flex items-center gap-1 shadow active:scale-95"
        >
          <Volume2 className="w-3 h-3" />
          <span>{voiceMode === 'original' ? 'Voice Changer' : `${voiceLabel?.emoji} ${voiceLabel?.label}`}</span>
        </button>
      </div>

      {/* Room Top Dare King & Mute Notice */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="px-2.5 py-0.5 rounded-full bg-black/65 border border-[#FFD700]/55 text-[10px] font-extrabold text-[#FFD700] flex items-center gap-1">
          <Crown className="w-3 h-3 fill-[#FFD700]" />
          <span>Dare King: {dareKingName}</span>
        </span>
        {mutedSecondsLeft > 0 && (
          <span className="px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-[10px] font-extrabold flex items-center gap-1">
            <MicOff className="w-3 h-3" />
            <span>
              Muted {Math.floor(mutedSecondsLeft / 60)}:
              {String(mutedSecondsLeft % 60).padStart(2, '0')}
            </span>
          </span>
        )}
      </div>
    </div>
  );
};

interface LivePollBannerProps {
  poll: RoomPollState | null;
  onVote: (optionId: string) => void;
  onDismiss?: () => void;
}

export const LivePollRoomBanner: React.FC<LivePollBannerProps> = ({ poll, onVote, onDismiss }) => {
  if (!poll) return null;
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0) || 1;
  const maxVotes = Math.max(...poll.options.map((o) => o.votes));

  return (
    <div className="rounded-2xl bg-[#10101A]/90 backdrop-blur-md border border-[#FFD700]/60 p-3 space-y-2 shadow-xl">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <BarChart3 className="w-4 h-4 text-[#FFD700] shrink-0" />
          <p className="text-xs font-extrabold text-white truncate">LIVE POLL: {poll.question}</p>
        </div>
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="text-white/60 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {poll.options.map((opt) => {
          const pct = Math.round((opt.votes / totalVotes) * 100);
          const isVoted = poll.votedOptionId === opt.id;
          const isLeading = opt.votes === maxVotes && opt.votes > 0;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onVote(opt.id)}
              className={`relative overflow-hidden rounded-xl px-2.5 py-1.5 text-left border transition-all ${
                isVoted
                  ? 'border-[#FFD700] bg-amber-500/20'
                  : 'border-white/15 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div
                style={{ width: `${pct}%` }}
                className={`absolute inset-y-0 left-0 ${
                  isLeading ? 'bg-gradient-to-r from-amber-500/35 to-[#FFD700]/25' : 'bg-white/10'
                } transition-all duration-300`}
              />
              <div className="relative z-10 flex items-center justify-between gap-1 text-[11px] font-bold text-white">
                <span className="truncate">
                  {isLeading ? '👑 ' : ''}
                  {opt.label}
                </span>
                <span className="text-[#FFD700] tabular-nums shrink-0">{pct}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface InRoomActivityOverlayProps {
  activeTab: InRoomActivityTab | null;
  onChangeTab: (tab: InRoomActivityTab) => void;
  onClose: () => void;
  coins: number;
  isHost: boolean;
  isVip: boolean;
  hostName: string;
  voiceMode: VoiceChangerMode;
  onSelectVoiceMode: (mode: VoiceChangerMode) => void;
  onOpenVipPage?: () => void;
  activePoll: RoomPollState | null;
  onLaunchPoll: (question: string, options: string[]) => void;
  onVotePoll: (optionId: string) => void;
  dareScores: DareScoreEntry[];
  onCompleteDare: (playerName: string) => void;
  onSpendCoins: (cost: number, reason: string) => boolean;
  onRewardCoins: (amt: number, reason: string) => void;
  onMuteUserFiveMin: () => void;
  onWinKaraoke: (songTitle: string) => void;
  onRoomAnnounce: (msg: string) => void;
  onNotify: (msg: string) => void;
}

const LUDO_PLAYERS = ['BiLAL', 'Ayesha', 'Ali Raza', 'Hania'];

const CARD_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const CARD_SUITS = ['♠', '♥', '♦', '♣'];

function dealThreeCards() {
  const hand: { rank: string; suit: string; val: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const rIdx = Math.floor(Math.random() * CARD_RANKS.length);
    const sIdx = Math.floor(Math.random() * CARD_SUITS.length);
    hand.push({ rank: CARD_RANKS[rIdx], suit: CARD_SUITS[sIdx], val: rIdx + 2 });
  }
  return hand;
}

function scoreTeenPattiHand(hand: { val: number; suit: string }[]): { label: string; score: number } {
  const vals = [...hand.map((c) => c.val)].sort((a, b) => a - b);
  const sameSuit = hand[0].suit === hand[1].suit && hand[1].suit === hand[2].suit;
  const isSeq = vals[1] === vals[0] + 1 && vals[2] === vals[1] + 1;
  if (vals[0] === vals[1] && vals[1] === vals[2]) return { label: 'Trail (Three of a Kind)', score: 600 + vals[2] };
  if (sameSuit && isSeq) return { label: 'Pure Sequence', score: 500 + vals[2] };
  if (isSeq) return { label: 'Sequence', score: 400 + vals[2] };
  if (sameSuit) return { label: 'Color (Flush)', score: 300 + vals[2] };
  if (vals[0] === vals[1] || vals[1] === vals[2]) return { label: 'Pair', score: 200 + vals[1] };
  return { label: 'High Card', score: 100 + vals[2] };
}

export const InRoomActivityOverlay: React.FC<InRoomActivityOverlayProps> = ({
  activeTab,
  onChangeTab,
  onClose,
  coins,
  isHost,
  isVip,
  hostName,
  voiceMode,
  onSelectVoiceMode,
  onOpenVipPage,
  activePoll,
  onLaunchPoll,
  onVotePoll,
  dareScores,
  onCompleteDare,
  onSpendCoins,
  onRewardCoins,
  onMuteUserFiveMin,
  onWinKaraoke,
  onRoomAnnounce,
  onNotify,
}) => {
  // === 1. TRUTH & DARE STATE ===
  const players = ['BiLAL', hostName, 'Ali Raza', 'Ms SHIZUKA', 'Hamza'];
  const [bottleDeg, setBottleDeg] = useState(0);
  const [bottleSpinning, setBottleSpinning] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('BiLAL');
  const [tdMode, setTdMode] = useState<'choice' | 'truth' | 'dare' | 'done'>('choice');
  const [tdPrompt, setTdPrompt] = useState('');
  const [truthAnswer, setTruthAnswer] = useState('');

  // === 2. KARAOKE BATTLE STATE ===
  const [karaokeCat, setKaraokeCat] = useState<'All' | KaraokeSongItem['category']>('All');
  const [karaokeSearch, setKaraokeSearch] = useState('');
  const [selectedSong, setSelectedSong] = useState<KaraokeSongItem>(KARAOKE_SONGS_CATALOG[0]);
  const [battleActive, setBattleActive] = useState(false);
  const [battleSeconds, setBattleSeconds] = useState(120);
  const [lyricLineIdx, setLyricLineIdx] = useState(0);
  const [micSinging, setMicSinging] = useState(true);
  const [voiceScore, setVoiceScore] = useState(84);
  const [singerAHearts, setSingerAHearts] = useState(18);
  const [singerBHearts, setSingerBHearts] = useState(14);
  const [karaokeResult, setKaraokeResult] = useState<string | null>(null);

  // === 3. MINI GAMES STATE ===
  const [miniGameTab, setMiniGameTab] = useState<'ludo' | 'teenpatti' | 'bottle' | 'lucky'>('ludo');
  const [ludoPositions, setLudoPositions] = useState<number[]>([4, 3, 2, 1]);
  const [ludoTurn, setLudoTurn] = useState(0);
  const [lastDice, setLastDice] = useState(6);
  const [ludoWinner, setLudoWinner] = useState<string | null>(null);

  const [tpStake, setTpStake] = useState(100);
  const [tpCards, setTpCards] = useState<{
    user: { rank: string; suit: string; val: number }[];
    rival: { rank: string; suit: string; val: number }[];
    resultText: string;
  } | null>(null);

  const [miniBottleDeg, setMiniBottleDeg] = useState(0);
  const [miniBottleResult, setMiniBottleResult] = useState<string>('Bottle ghumao aur dekho kiska number lagta hai!');

  const [pickedLuckyNum, setPickedLuckyNum] = useState(7);
  const [drawnLuckyNum, setDrawnLuckyNum] = useState<number | null>(null);

  // === 4. LIVE POLL CREATOR STATE ===
  const [pollQuestion, setPollQuestion] = useState('Aaj Kya Karu?');
  const [pollOptsInput, setPollOptsInput] = useState('Gaana, Shayari, Dance, Game');
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!activeTab) return;
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [activeTab]);

  // Karaoke Timer & Lyrics Sync
  useEffect(() => {
    if (!battleActive) return;
    const timer = window.setInterval(() => {
      setBattleSeconds((prev) => {
        if (prev <= 1) {
          setBattleActive(false);
          stopBeatPreview();
          return 0;
        }
        return prev - 1;
      });
      setLyricLineIdx((l) => (l + 1) % selectedSong.lyrics.length);
      if (micSinging) {
        setVoiceScore((sc) => Math.min(100, Math.max(65, sc + Math.floor(Math.random() * 7) - 3)));
      }
    }, 1500);
    return () => {
      window.clearInterval(timer);
    };
  }, [battleActive, micSinging, selectedSong.lyrics.length]);

  useEffect(() => {
    if (!activeTab) {
      stopBeatPreview();
    }
  }, [activeTab]);

  if (!activeTab) return null;

  const spinBottle = () => {
    if (bottleSpinning) return;
    triggerHaptic(20);
    setBottleSpinning(true);
    setTdMode('choice');
    const chosenIdx = Math.floor(Math.random() * players.length);
    const nextDeg = bottleDeg + 1080 + chosenIdx * 72;
    setBottleDeg(nextDeg);
    window.setTimeout(() => {
      setBottleSpinning(false);
      setSelectedPlayer(players[chosenIdx]);
      onNotify(`Bottle ruka: ${players[chosenIdx]} ki baari!`);
    }, 2200);
  };

  const pickTruth = () => {
    const q = TRUTH_QUESTIONS[Math.floor(Math.random() * TRUTH_QUESTIONS.length)];
    setTdPrompt(q);
    setTruthAnswer('');
    setTdMode('truth');
  };

  const pickDare = () => {
    const d = DARE_TASKS[Math.floor(Math.random() * DARE_TASKS.length)];
    setTdPrompt(d);
    setTdMode('dare');
  };

  const finishKaraokeNow = () => {
    setBattleActive(false);
    stopBeatPreview();
    if (singerAHearts >= singerBHearts) {
      onWinKaraoke(selectedSong.title);
      const msg = `🎤 ${selectedSong.title}: BiLAL (${singerAHearts} ❤️) Won +500 Coins & Singing Star Badge!`;
      setKaraokeResult(msg);
      onRoomAnnounce(msg);
    } else {
      const msg = `😅 ${hostName} Won (${singerBHearts} ❤️). Punishment: BiLAL ko agla gaana lazmi gaana hoga!`;
      setKaraokeResult(msg);
      onRoomAnnounce(msg);
      onNotify('Punishment: Agla gaana aapko gaana hoga! 🎤');
    }
  };

  const handleLudoRoll = () => {
    if (ludoWinner) return;
    triggerHaptic(15);
    const roll = Math.floor(Math.random() * 6) + 1;
    setLastDice(roll);
    playTone(320 + roll * 45, 110, 'triangle', 0.08);
    setLudoPositions((prev) => {
      const next = [...prev];
      next[ludoTurn] = Math.min(20, next[ludoTurn] + roll);
      if (next[ludoTurn] >= 20) {
        const winnerName = LUDO_PLAYERS[ludoTurn];
        setLudoWinner(winnerName);
        if (ludoTurn === 0) {
          onRewardCoins(1000, 'Ludo Win in Room');
          onRoomAnnounce('Bilal Ne Ludo Jeet Li - 1000 Coins Jeete');
        } else {
          onRoomAnnounce(`${winnerName} Ne Ludo Jeet Li - 1000 Coins Jeete`);
        }
      }
      return next;
    });
    setLudoTurn((t) => (t + 1) % LUDO_PLAYERS.length);
  };

  const playTeenPatti = () => {
    if (!onSpendCoins(tpStake, 'Teen Patti Bet')) return;
    const userHand = dealThreeCards();
    const rivalHand = dealThreeCards();
    const uScore = scoreTeenPattiHand(userHand);
    const rScore = scoreTeenPattiHand(rivalHand);
    const pot = tpStake * 3;
    if (uScore.score >= rScore.score) {
      onRewardCoins(pot, 'Teen Patti Pot Win');
      const winMsg = `Bilal Ne Teen Patti Jeet Li (${uScore.label}) - ${pot.toLocaleString()} Coins Jeete`;
      setTpCards({ user: userHand, rival: rivalHand, resultText: `YOU WON +${pot} Coins! (${uScore.label})` });
      onRoomAnnounce(winMsg);
    } else {
      setTpCards({ user: userHand, rival: rivalHand, resultText: `Ayesha Won (${rScore.label}) — Better luck next hand!` });
    }
  };

  const cooldownLeftSec = activePoll ? Math.max(0, Math.ceil((activePoll.cooldownEndsAt - nowMs) / 1000)) : 0;

  const filteredSongs = KARAOKE_SONGS_CATALOG.filter((s) => {
    if (karaokeCat !== 'All' && s.category !== karaokeCat) return false;
    if (karaokeSearch.trim()) {
      const q = karaokeSearch.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q);
    }
    return true;
  });

  const tabs: { id: InRoomActivityTab; label: string }[] = [
    { id: 'truth', label: '🍾 Truth & Dare' },
    { id: 'karaoke', label: '🎤 Karaoke' },
    { id: 'minigames', label: '🎲 Mini Games' },
    { id: 'poll', label: '📊 Live Poll' },
    { id: 'voice', label: '🗣️ Voice' },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[92] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[88vh] bg-[#11111B] rounded-t-3xl sm:rounded-3xl border border-[#FFD700]/45 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Sheet Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFD700]" />
            <h3 className="text-sm font-black text-white">In-Room Entertainment Studio</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#1C1C28] text-[11px] font-bold text-[#FFD700] tabular-nums">
              {coins.toLocaleString()} Coins
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="px-3 py-2 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChangeTab(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap shrink-0 transition-all ${
                activeTab === t.id
                  ? 'gold-gradient text-white shadow'
                  : 'bg-[#1C1C28] text-white/75 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ================= 1. TRUTH & DARE ================= */}
          {activeTab === 'truth' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-[#2B1224] to-[#141422] border border-rose-400/40 p-4 text-center space-y-3">
                <p className="text-xs font-extrabold text-rose-300">
                  🍾 Bottle Spin Karo — Sirf Clean &amp; Funny Questions!
                </p>

                <div className="relative w-36 h-36 mx-auto rounded-full border-2 border-dashed border-[#FFD700]/45 flex items-center justify-center bg-black/35">
                  <div
                    style={{ transform: `rotate(${bottleDeg}deg)` }}
                    className="text-5xl transition-transform duration-[2200ms] ease-out select-none"
                  >
                    🍾
                  </div>
                </div>

                <p className="text-sm font-black text-white">
                  Turn: <span className="text-[#FFD700]">{selectedPlayer}</span>
                </p>

                <button
                  type="button"
                  onClick={spinBottle}
                  disabled={bottleSpinning}
                  className="px-6 py-2 rounded-full gold-gradient text-white text-xs font-black shadow-lg active:scale-95 disabled:opacity-60"
                >
                  {bottleSpinning ? 'Bottle Ghoom Rahi Hai...' : 'Spin Bottle'}
                </button>
              </div>

              {tdMode === 'choice' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={pickTruth}
                    className="h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow active:scale-95"
                  >
                    🤔 Truth
                  </button>
                  <button
                    type="button"
                    onClick={pickDare}
                    className="h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm shadow active:scale-95"
                  >
                    🔥 Dare
                  </button>
                </div>
              )}

              {tdMode === 'truth' && (
                <div className="rounded-2xl bg-[#1A1A28] border border-indigo-400/50 p-4 space-y-3">
                  <p className="text-[11px] font-bold text-indigo-300">TRUTH QUESTION (Jawab Lazmi Hai)</p>
                  <p className="text-sm font-extrabold text-white">{tdPrompt}</p>
                  <input
                    type="text"
                    value={truthAnswer}
                    onChange={(e) => setTruthAnswer(e.target.value)}
                    placeholder="Apna funny jawab likho..."
                    className="w-full h-10 px-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-[#FFD700]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!truthAnswer.trim()) {
                        onNotify('Truth ka jawab dena lazmi hai!');
                        return;
                      }
                      onRoomAnnounce(`🤔 Truth (${selectedPlayer}): "${truthAnswer.trim()}"`);
                      setTdMode('done');
                      onNotify('Truth Answered! +10 Vibe Points ✨');
                    }}
                    className="w-full h-10 rounded-full bg-indigo-600 text-white text-xs font-extrabold"
                  >
                    Submit Truth Answer
                  </button>
                </div>
              )}

              {tdMode === 'dare' && (
                <div className="rounded-2xl bg-[#1A1A28] border border-rose-400/50 p-4 space-y-3">
                  <p className="text-[11px] font-bold text-rose-300">DARE CHALLENGE ({selectedPlayer})</p>
                  <p className="text-sm font-extrabold text-white">{tdPrompt}</p>
                  <button
                    type="button"
                    onClick={() => {
                      onCompleteDare(selectedPlayer);
                      setTdMode('done');
                      onRoomAnnounce(`🔥 ${selectedPlayer} completed Dare: "${tdPrompt}"`);
                    }}
                    className="w-full h-10 rounded-full bg-emerald-600 text-white text-xs font-extrabold"
                  >
                    ✅ Dare Poora Kar Liya (+1 Dare Score)
                  </button>

                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <p className="text-[11px] text-amber-200 font-semibold">
                      Dare Poora Na Kiya? Room Me 100 Coins Gift Do Ya 5 Min Mute Ho Jao:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSpendCoins(100, 'Dare Skip Gift')) {
                            onRoomAnnounce(`🎁 ${selectedPlayer} sent 100 Coins Gift for Dare skip!`);
                            setTdMode('choice');
                          }
                        }}
                        className="h-9 rounded-xl gold-gradient text-white text-[11px] font-extrabold"
                      >
                        🎁 Give 100 Coins Gift
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onMuteUserFiveMin();
                          setTdMode('choice');
                        }}
                        className="h-9 rounded-xl bg-red-600 text-white text-[11px] font-extrabold"
                      >
                        🔇 Refuse (5 Min Mute)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {tdMode === 'done' && (
                <button
                  type="button"
                  onClick={() => setTdMode('choice')}
                  className="w-full h-10 rounded-full bg-white/10 text-white text-xs font-bold"
                >
                  Spin Again
                </button>
              )}

              {/* Dare Scoreboard */}
              <div className="rounded-2xl bg-[#161622] border border-[#FFD700]/30 p-3.5 space-y-2">
                <p className="text-xs font-black text-[#FFD700] flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>Dare Score Board (Top = Dare King)</span>
                </p>
                <div className="space-y-1.5">
                  {[...dareScores]
                    .sort((a, b) => b.daresCompleted - a.daresCompleted)
                    .map((entry, idx) => (
                      <div
                        key={entry.name}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/35 text-xs"
                      >
                        <div className="flex items-center gap-2 font-bold text-white">
                          <span className="text-[#FFD700]">#{idx + 1}</span>
                          <span>{entry.name}</span>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded-full gold-gradient text-[9px] font-black text-white">
                              Dare King 👑
                            </span>
                          )}
                        </div>
                        <span className="font-black text-emerald-400 tabular-nums">{entry.daresCompleted} Dares</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. KARAOKE BATTLE ================= */}
          {activeTab === 'karaoke' && (
            <div className="space-y-3.5">
              {/* Battle Stage Header */}
              <div className="rounded-2xl bg-gradient-to-br from-[#291032] via-[#181024] to-[#1A1320] border border-fuchsia-400/50 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-fuchsia-300 flex items-center gap-1">
                    <Music className="w-4 h-4" />
                    <span>2-Min Karaoke Battle</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-black/50 text-xs font-black text-[#FFD700] tabular-nums flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" />
                    <span>
                      {String(Math.floor(battleSeconds / 60)).padStart(2, '0')}:
                      {String(battleSeconds % 60).padStart(2, '0')}
                    </span>
                  </span>
                </div>

                {/* Live Lyrics Box */}
                <div className="rounded-xl bg-black/55 border border-white/10 p-3 text-center space-y-1.5">
                  <p className="text-[11px] font-bold text-[#FFD700]">
                    🎵 {selectedSong.title} · {selectedSong.artist} ({selectedSong.category})
                  </p>
                  {selectedSong.lyrics.map((line, i) => (
                    <p
                      key={i}
                      className={`text-xs transition-all ${
                        i === lyricLineIdx
                          ? 'text-white font-extrabold scale-105'
                          : 'text-white/45 font-medium'
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {/* Voice Score Meter 0-100 */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-white/85">Awaz Score:</span>
                  <div className="flex-1 h-2.5 rounded-full bg-black/50 overflow-hidden">
                    <div
                      style={{ width: `${voiceScore}%` }}
                      className="h-full bg-gradient-to-r from-fuchsia-500 to-[#FFD700] transition-all duration-300"
                    />
                  </div>
                  <span className="font-black text-[#FFD700] tabular-nums">{voiceScore}/100</span>
                </div>

                {/* Singer Voting (Dil Bhej Ke Vote) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setSingerAHearts((h) => h + 1);
                    }}
                    className="p-2.5 rounded-xl bg-rose-600/30 border border-rose-400/60 flex items-center justify-between text-xs font-bold text-white active:scale-95"
                  >
                    <span>BiLAL</span>
                    <span className="flex items-center gap-1 text-rose-300 tabular-nums">
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      {singerAHearts}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setSingerBHearts((h) => h + 1);
                    }}
                    className="p-2.5 rounded-xl bg-sky-600/30 border border-sky-400/60 flex items-center justify-between text-xs font-bold text-white active:scale-95"
                  >
                    <span className="truncate">{hostName}</span>
                    <span className="flex items-center gap-1 text-sky-300 tabular-nums">
                      <Heart className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
                      {singerBHearts}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!battleActive) {
                        setBattleSeconds(120);
                        setKaraokeResult(null);
                        setBattleActive(true);
                        startBeatPreview(selectedSong.freq, selectedSong.bpm);
                        onNotify(`Karaoke Battle Started: ${selectedSong.title} 🎤`);
                      } else {
                        setBattleActive(false);
                        stopBeatPreview();
                      }
                    }}
                    className="flex-1 h-10 rounded-full gold-gradient text-white text-xs font-black shadow active:scale-95"
                  >
                    {battleActive ? 'Pause Battle' : 'Start 2-Min Battle 🎤'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMicSinging((m) => !m)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      micSinging ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {micSinging ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={finishKaraokeNow}
                    className="px-3 h-10 rounded-full bg-fuchsia-600 text-white text-xs font-extrabold active:scale-95"
                  >
                    Result
                  </button>
                </div>

                {karaokeResult && (
                  <div className="rounded-xl bg-amber-500/20 border border-[#FFD700] p-2.5 text-xs font-extrabold text-[#FFD700] text-center">
                    {karaokeResult}
                  </div>
                )}
              </div>

              {/* 10,000+ Song Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-white flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>10,000+ Gaane Library</span>
                  </p>
                  <span className="text-[10px] font-bold text-emerald-400">Winner: +500 Coins &amp; Singing Star</span>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={karaokeSearch}
                    onChange={(e) => setKaraokeSearch(e.target.value)}
                    placeholder="Search Pakistani, Punjabi, Hindi, English, Arabic..."
                    className="w-full h-9 pl-8 pr-3 rounded-xl bg-[#1A1A26] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FFD700]"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {(['All', 'Pakistani', 'Punjabi', 'Hindi', 'English', 'Arabic'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setKaraokeCat(cat)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                        karaokeCat === cat ? 'bg-fuchsia-600 text-white' : 'bg-[#1C1C28] text-white/70'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {filteredSongs.map((song) => (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => {
                        setSelectedSong(song);
                        setLyricLineIdx(0);
                        if (battleActive) {
                          startBeatPreview(song.freq, song.bpm);
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-xl border text-left flex items-center justify-between ${
                        selectedSong.id === song.id
                          ? 'bg-fuchsia-600/20 border-fuchsia-400 text-white'
                          : 'bg-[#181824] border-white/10 text-white/80'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{song.title}</p>
                        <p className="text-[10px] text-white/60 truncate">{song.artist} · {song.category}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#FFD700] shrink-0">Select</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. MINI GAMES (INSIDE ROOM) ================= */}
          {activeTab === 'minigames' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'ludo' as const, label: '🎲 Ludo' },
                  { id: 'teenpatti' as const, label: '🃏 Teen Patti' },
                  { id: 'bottle' as const, label: '🍾 Spin Bottle' },
                  { id: 'lucky' as const, label: '🔢 Lucky #' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setMiniGameTab(g.id)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition-colors ${
                      miniGameTab === g.id
                        ? 'gold-gradient text-white shadow'
                        : 'bg-[#1C1C28] text-white/75'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {/* Ludo 4-Player In-Room */}
              {miniGameTab === 'ludo' && (
                <div className="rounded-2xl bg-[#161622] border border-[#FFD700]/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#FFD700]">🎲 Room Ludo (4 Players · Pool 1,000 Coins)</span>
                    <span className="text-xs font-extrabold text-white">Turn: {LUDO_PLAYERS[ludoTurn]}</span>
                  </div>
                  <div className="space-y-2">
                    {LUDO_PLAYERS.map((name, i) => {
                      const pos = ludoPositions[i];
                      const pct = Math.round((pos / 20) * 100);
                      const colors = ['from-amber-400 to-yellow-500', 'from-rose-500 to-pink-500', 'from-emerald-500 to-teal-500', 'from-sky-500 to-indigo-500'];
                      return (
                        <div key={name} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-white">
                            <span>{name}</span>
                            <span className="tabular-nums text-[#FFD700]">{pos}/20</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-black/50 overflow-hidden">
                            <div style={{ width: `${pct}%` }} className={`h-full bg-gradient-to-r ${colors[i]} transition-all duration-300`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {ludoWinner ? (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400 text-center space-y-2">
                      <p className="text-xs font-black text-emerald-300">
                        🏆 {ludoWinner} Ne Ludo Jeet Li - 1000 Coins Jeete!
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setLudoPositions([0, 0, 0, 0]);
                          setLudoWinner(null);
                          setLudoTurn(0);
                        }}
                        className="px-4 py-1.5 rounded-full gold-gradient text-white text-xs font-bold"
                      >
                        Play New Match
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLudoRoll}
                      className="w-full h-11 rounded-full gold-gradient text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95"
                    >
                      <Dices className="w-4 h-4" />
                      <span>Roll Dice (Last: {lastDice})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Teen Patti In-Room */}
              {miniGameTab === 'teenpatti' && (
                <div className="rounded-2xl bg-[#161622] border border-emerald-400/40 p-4 space-y-3">
                  <p className="text-xs font-black text-emerald-300">🃏 Teen Patti — Coins Laga Ke Jeeto (3x Pot!)</p>
                  <div className="flex items-center gap-2">
                    {[50, 100, 250, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTpStake(amt)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-black border ${
                          tpStake === amt ? 'border-[#FFD700] bg-amber-500/20 text-[#FFD700]' : 'border-white/10 bg-black/40 text-white/70'
                        }`}
                      >
                        {amt}c
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={playTeenPatti}
                    className="w-full h-10 rounded-full bg-emerald-600 text-white text-xs font-black active:scale-95"
                  >
                    Deal Cards ({tpStake} Coins Bet → Win {tpStake * 3}c)
                  </button>
                  {tpCards && (
                    <div className="space-y-2.5 pt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-xl bg-black/50 text-center space-y-1">
                          <p className="text-[10px] font-bold text-[#FFD700]">BiLAL Cards</p>
                          <div className="flex items-center justify-center gap-1.5">
                            {tpCards.user.map((c, idx) => (
                              <span key={idx} className="px-2 py-1 rounded-lg bg-white text-slate-900 font-black text-xs">
                                {c.rank}{c.suit}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/50 text-center space-y-1">
                          <p className="text-[10px] font-bold text-rose-300">Ayesha Cards</p>
                          <div className="flex items-center justify-center gap-1.5">
                            {tpCards.rival.map((c, idx) => (
                              <span key={idx} className="px-2 py-1 rounded-lg bg-white text-slate-900 font-black text-xs">
                                {c.rank}{c.suit}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-xs font-black text-[#FFD700]">{tpCards.resultText}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Spin Bottle Mini */}
              {miniGameTab === 'bottle' && (
                <div className="rounded-2xl bg-[#161622] border border-pink-400/40 p-4 text-center space-y-3">
                  <div
                    style={{ transform: `rotate(${miniBottleDeg}deg)` }}
                    className="text-5xl transition-transform duration-[1800ms] ease-out inline-block"
                  >
                    🍾
                  </div>
                  <p className="text-xs font-bold text-white">{miniBottleResult}</p>
                  <button
                    type="button"
                    onClick={() => {
                      const chosen = players[Math.floor(Math.random() * players.length)];
                      setMiniBottleDeg((d) => d + 900 + Math.floor(Math.random() * 360));
                      window.setTimeout(() => {
                        setMiniBottleResult(`Bottle ne choose kiya: ${chosen} 🎉`);
                        onRoomAnnounce(`🍾 Spin Bottle selected ${chosen}!`);
                      }, 1800);
                    }}
                    className="px-6 py-2 rounded-full gold-gradient text-white text-xs font-black"
                  >
                    Spin Bottle Now
                  </button>
                </div>
              )}

              {/* Lucky Number In-Room */}
              {miniGameTab === 'lucky' && (
                <div className="rounded-2xl bg-[#161622] border border-amber-400/40 p-4 space-y-3">
                  <p className="text-xs font-black text-[#FFD700]">🔢 Room Lucky Number (50 Coins → Win 400 Coins)</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPickedLuckyNum(num)}
                        className={`h-9 rounded-xl text-xs font-black ${
                          pickedLuckyNum === num ? 'gold-gradient text-white' : 'bg-black/45 text-white/80'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!onSpendCoins(50, 'Room Lucky Number')) return;
                      const draw = Math.floor(Math.random() * 10) + 1;
                      setDrawnLuckyNum(draw);
                      if (draw === pickedLuckyNum || Math.abs(draw - pickedLuckyNum) === 1) {
                        playGiftChime();
                        onRewardCoins(400, 'Room Lucky Number Win');
                        onRoomAnnounce(`🔢 Bilal Ne Lucky Number (${draw}) Jeet Li - 400 Coins Jeete!`);
                      } else {
                        onNotify(`Drawn Number: ${draw}. Try again!`);
                      }
                    }}
                    className="w-full h-10 rounded-full gold-gradient text-white text-xs font-black"
                  >
                    Play Lucky #{pickedLuckyNum} (50 Coins)
                  </button>
                  {drawnLuckyNum !== null && (
                    <p className="text-center text-xs font-bold text-amber-200">
                      Last Drawn: #{drawnLuckyNum} (Exact ya ±1 par 400 Coins!)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= 4. LIVE POLL (30-MIN COOLDOWN) ================= */}
          {activeTab === 'poll' && (
            <div className="space-y-3.5">
              {activePoll && (
                <LivePollRoomBanner poll={activePoll} onVote={onVotePoll} />
              )}

              <div className="rounded-2xl bg-[#161622] border border-indigo-400/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-300">📊 Host Live Poll (30 Min Cooldown)</span>
                  {cooldownLeftSec > 0 && (
                    <span className="text-[11px] font-bold text-amber-300 tabular-nums">
                      Wait {Math.floor(cooldownLeftSec / 60)}:{String(cooldownLeftSec % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/60">Question</label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full h-9 px-3 mt-1 rounded-xl bg-black/45 border border-white/15 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/60">Options (Comma Separated)</label>
                  <input
                    type="text"
                    value={pollOptsInput}
                    onChange={(e) => setPollOptsInput(e.target.value)}
                    className="w-full h-9 px-3 mt-1 rounded-xl bg-black/45 border border-white/15 text-xs text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isHost) {
                      onNotify('Only Host / Admin can start Live Poll!');
                      return;
                    }
                    if (cooldownLeftSec > 0) {
                      onNotify('Host har 30 minute me 1 baar Poll laga sakti hai!');
                      return;
                    }
                    const parsed = pollOptsInput
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .slice(0, 4);
                    if (parsed.length < 2) {
                      onNotify('Kam az kam 2 options likho!');
                      return;
                    }
                    onLaunchPoll(pollQuestion.trim() || 'Aaj Kya Karu?', parsed);
                  }}
                  className="w-full h-10 rounded-full bg-indigo-600 text-white text-xs font-black disabled:opacity-50"
                >
                  {cooldownLeftSec > 0
                    ? `Cooldown Active (${Math.floor(cooldownLeftSec / 60)}m left)`
                    : 'Start Live Poll Now'}
                </button>
              </div>
            </div>
          )}

          {/* ================= 5. VOICE CHANGER ================= */}
          {activeTab === 'voice' && (
            <div className="space-y-3">
              <div className="rounded-2xl bg-[#161622] border border-emerald-400/40 p-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-black text-emerald-300">🗣️ Live Voice Changer (1-Click Switch)</p>
                  <p className="text-[11px] text-white/75">
                    {isHost
                      ? 'Host Free Access Unlocked ✓'
                      : isVip
                        ? 'VIP Member Access Unlocked ✓'
                        : 'Host Ke Liye Free · Normal User Ke Liye VIP Required'}
                  </p>
                </div>
                {!isHost && !isVip && onOpenVipPage && (
                  <button
                    type="button"
                    onClick={onOpenVipPage}
                    className="px-3 py-1.5 rounded-full gold-gradient text-white text-[11px] font-black shrink-0"
                  >
                    Get VIP
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {VOICE_CHANGER_OPTIONS.map((v) => {
                  const locked = !isHost && !isVip && v.id !== 'original';
                  const active = voiceMode === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        if (locked) {
                          onNotify('Voice Changer normal users ke liye VIP me unlocked hai!');
                          return;
                        }
                        triggerHaptic();
                        playTone(v.freq, 220, v.wave, 0.09);
                        onSelectVoiceMode(v.id);
                      }}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all active:scale-95 ${
                        active
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow'
                          : 'bg-[#1A1A26] border-white/10 text-white/85'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl">{v.emoji}</span>
                        <span className="text-xs font-extrabold truncate">{v.label}</span>
                      </div>
                      {locked ? (
                        <Lock className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                      ) : active ? (
                        <Flame className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
