import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Ban,
  Bell,
  BellOff,
  Camera,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  Copy as CopyIcon,
  Crown,
  Flame,
  Flag,
  Gift,
  Lock,
  MapPin,
  Image as ImageIcon,
  Languages,
  LayoutGrid,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Pause,
  Phone,
  PhoneOff,
  Pin,
  PinOff,
  Play,
  Plus,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Smile,
  Sparkles,
  Swords,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Video,
  VolumeX,
  X,
} from 'lucide-react';
import {
  GIFTS_CATALOG,
  GROUP_CANDIDATE_MEMBERS,
  IMG_HERO_LIVE,
  IMG_HOST_FEMALE,
  IMG_HOST_MALE,
  IMG_MUSIC_PARTY,
  IMG_PK_BANNER,
  STICKERS_CATALOG,
} from '../data/mockData';
import {
  AppLanguage,
  ChatMessage,
  ChatThread,
  GroupChatItem,
  GroupCityName,
  GroupMemberItem,
  SuperGroupType,
  TranslationSettings,
  VipStatus,
} from '../types/mehfil';
import { playGiftChime, playTone, triggerHaptic } from '../utils/haptics';
import { t, translateMessageText } from '../utils/i18n';

import { TreasureSpot } from './LuckyMysteryCoinRainModals';

interface ChatsSystemProps {
  chats: ChatThread[];
  groups: GroupChatItem[];
  language: AppLanguage;
  translationSettings: TranslationSettings;
  vipStatus: VipStatus;
  userCity: GroupCityName;
  coins: number;
  treasureFoundIds: string[];
  onFindTreasure: (id: string) => void;
  onOpenCoupleRoom: () => void;
  onSpendCoins: (cost: number) => boolean;
  onRewardCoins: (amount: number) => void;
  onGroupBattleWin: (groupName: string, score: number) => void;
  onOpenTranslationSettings: () => void;
  onUpdateChat: (chatId: string, updater: (c: ChatThread) => ChatThread) => void;
  onAddGroup: (group: GroupChatItem) => void;
  onUpdateGroup: (groupId: string, updater: (g: GroupChatItem) => GroupChatItem) => void;
  onLeaveGroup: (groupId: string) => void;
  onOpenProfile: (profileId: string) => void;
  onFullScreenToggle: (isFullScreen: boolean) => void;
  onNotify: (msg: string) => void;
  externalOpenChatId?: string | null;
  onClearExternalOpen?: () => void;
}

type ChatSubView =
  | { mode: 'list' }
  | { mode: 'chat'; chatId: string }
  | { mode: 'settings'; chatId: string }
  | { mode: 'createGroup' }
  | { mode: 'groupChat'; groupId: string }
  | { mode: 'groupInfo'; groupId: string };

const SUPER_GROUP_TYPES: { id: SuperGroupType; label: string; desc: string }[] = [
  { id: 'Public', label: 'Public Group', desc: 'Koi bhi join kar sake' },
  { id: 'Private', label: 'Private Group', desc: 'Sirf Link + Admin Approval' },
  { id: 'VIP Only', label: 'VIP Only Group', desc: 'Sirf VIP Wale Join Kar Saken' },
  { id: 'Host Fan', label: 'Host Fan Group', desc: 'Sirf Us Host Ke Fans' },
  { id: 'City', label: 'City Group', desc: 'Lahore / Karachi / Islamabad...' },
  { id: 'Couple', label: 'Couple Room', desc: 'Sirf 2 Log (Max 2)' },
  { id: 'Family', label: 'Family Room', desc: 'Sirf Family Wale' },
];

const GROUP_CITIES: GroupCityName[] = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Multan'];

export const ChatsSystem: React.FC<ChatsSystemProps> = ({
  chats,
  groups,
  language,
  translationSettings,
  vipStatus,
  userCity,
  coins,
  treasureFoundIds,
  onFindTreasure,
  onOpenCoupleRoom,
  onSpendCoins,
  onRewardCoins,
  onGroupBattleWin,
  onOpenTranslationSettings,
  onUpdateChat,
  onAddGroup,
  onUpdateGroup,
  onLeaveGroup,
  onOpenProfile,
  onFullScreenToggle,
  onNotify,
  externalOpenChatId,
  onClearExternalOpen,
}) => {
  const [view, setView] = useState<ChatSubView>({ mode: 'list' });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupListTab, setGroupListTab] = useState<'my' | 'discover'>('my');
  const [groupListSearch, setGroupListSearch] = useState('');
  const [requestedGroupIds, setRequestedGroupIds] = useState<string[]>([]);
  const [storyViewer, setStoryViewer] = useState<{ name: string; image: string } | null>(null);
  const [fullMediaUrl, setFullMediaUrl] = useState<string | null>(null);

  // 1v1 & Group Chat Open state
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const [activeCall, setActiveCall] = useState<{ type: 'voice' | 'video'; name: string; avatar: string; isGroup?: boolean } | null>(null);
  const [secretMode, setSecretMode] = useState(false);
  const [battleModalOpen, setBattleModalOpen] = useState(false);
  const [emojiBlastActive, setEmojiBlastActive] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Long-press Pin / Delete & Full Translation state
  const longPressTimerRef = useRef<number | null>(null);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  const [messageActionSheet, setMessageActionSheet] = useState<{
    scope: 'chat' | 'group';
    threadId: string;
    msg: ChatMessage;
    senderDisplayName: string;
    isCurrentlyPinned: boolean;
  } | null>(null);
  const [fullTranslationModal, setFullTranslationModal] = useState<{
    original: string;
    translated: string;
    sourceLang: string;
  } | null>(null);

  // Create Group state (HISSA 23 FINAL — Super Groups up to 500 Members)
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<SuperGroupType>('Public');
  const [newGroupCity, setNewGroupCity] = useState<GroupCityName>(userCity);
  const [newGroupHost, setNewGroupHost] = useState('Ayesha Live');
  const [newGroupDesc, setNewGroupDesc] = useState('Welcome to our Vibe Live Super Group!');
  const [newGroupRules, setNewGroupRules] = useState('1. Be respectful. 2. Active daily tasks. 3. No spam.');
  const [newGroupPhoto, setNewGroupPhoto] = useState(IMG_PK_BANNER);
  const [newGroupCover, setNewGroupCover] = useState(IMG_HERO_LIVE);
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(['cand-1', 'cand-2', 'cand-3', 'cand-4', 'cand-5']);
  const [extraFillMembersCount, setExtraFillMembersCount] = useState(0);

  // Group Info extras
  const [groupMediaTab, setGroupMediaTab] = useState<'photos' | 'videos'>('photos');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [visibleMembersCap, setVisibleMembersCap] = useState(40);

  // Chat Settings extras (HISSA 13)
  const [wallpaperModal, setWallpaperModal] = useState(false);

  useEffect(() => {
    if (externalOpenChatId) {
      setView({ mode: 'chat', chatId: externalOpenChatId });
      onClearExternalOpen?.();
    }
  }, [externalOpenChatId, onClearExternalOpen]);

  useEffect(() => {
    onFullScreenToggle(view.mode !== 'list');
    return () => onFullScreenToggle(false);
  }, [view.mode, onFullScreenToggle]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [view, chats, groups, isTyping]);

  const activeChat = view.mode === 'chat' || view.mode === 'settings' ? chats.find((c) => c.id === view.chatId) : undefined;
  const activeGroup = view.mode === 'groupChat' || view.mode === 'groupInfo' ? groups.find((g) => g.id === view.groupId) : undefined;

  const sendMessageToChat = (chatId: string, msg: Omit<ChatMessage, 'id' | 'time'>) => {
    triggerHaptic();
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    onUpdateChat(chatId, (c) => ({
      ...c,
      lastMessage: msg.type === 'voice' ? 'Sent a voice message 0:04' : msg.type === 'image' ? 'Shared a photo' : msg.text || 'Sticker',
      time: 'Now',
      unreadCount: 0,
      messages: [...c.messages, newMsg],
    }));

    // Auto typing + reply simulation
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      onUpdateChat(chatId, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          {
            id: `reply-${Date.now()}`,
            sender: 'other',
            type: 'text',
            text: 'Ji bilkul! Vibe Live me milte hain ✨👑',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      }));
    }, 1300);
  };

  const sendMessageToGroup = (groupId: string, msg: Omit<ChatMessage, 'id' | 'time'>) => {
    triggerHaptic();
    const isSec = secretMode && msg.type !== 'system';
    const newMsg: ChatMessage = {
      ...msg,
      id: `gmsg-${Date.now()}`,
      senderName: 'BiLAL Shafique2494',
      isAdmin: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
      isSecret: isSec,
      expiresAt: isSec ? Date.now() + 10000 : undefined,
    };
    const grp = groups.find((x) => x.id === groupId);
    onUpdateGroup(groupId, (g) => ({
      ...g,
      activityScore: (g.activityScore || 0) + 1,
      dailyTaskMessages: Math.min(100, (g.dailyTaskMessages || 0) + 1),
      messages: [...g.messages, newMsg],
    }));
    if (grp) {
      onNotify(
        isSec
          ? 'Secret Message sent (Auto-deletes in 10s)'
          : `Notification sent to all ${grp.members.length} group members`
      );
    }
  };

  // Secret Chat 10s Auto-Delete Cleaner when inside a Group
  useEffect(() => {
    if (view.mode !== 'groupChat') return;
    const grpId = view.groupId;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setNowTick(now);
      const current = groups.find((g) => g.id === grpId);
      if (current && current.messages.some((m) => m.expiresAt && m.expiresAt <= now)) {
        onUpdateGroup(grpId, (g) => ({
          ...g,
          messages: g.messages.filter((m) => !m.expiresAt || m.expiresAt > now),
        }));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [view, groups, onUpdateGroup]);

  const playVoiceNote = (id: string) => {
    triggerHaptic();
    if (playingVoiceId === id) {
      setPlayingVoiceId(null);
      return;
    }
    setPlayingVoiceId(id);
    playTone(520, 180);
    setTimeout(() => setPlayingVoiceId((cur) => (cur === id ? null : cur)), 3800);
  };

  const startLongPress = (
    scope: 'chat' | 'group',
    threadId: string,
    msg: ChatMessage,
    senderDisplayName: string,
    isCurrentlyPinned: boolean
  ) => {
    if (msg.type === 'system') return;
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = window.setTimeout(() => {
      triggerHaptic(20);
      setMessageActionSheet({ scope, threadId, msg, senderDisplayName, isCurrentlyPinned });
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTogglePinMessage = (
    scope: 'chat' | 'group',
    threadId: string,
    msg: ChatMessage,
    senderDisplayName: string,
    currentlyPinned: boolean
  ) => {
    triggerHaptic(18);
    const snippet =
      msg.type === 'voice'
        ? 'Voice message'
        : msg.type === 'image'
          ? msg.text || 'Shared photo'
          : msg.text || 'Message';
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (scope === 'chat') {
      onUpdateChat(threadId, (c) => ({
        ...c,
        pinnedMessage: currentlyPinned
          ? null
          : {
              messageId: msg.id,
              text: snippet,
              senderName: senderDisplayName,
              pinnedBy: 'BiLAL',
            },
        messages: currentlyPinned
          ? c.messages
          : [
              ...c.messages,
              {
                id: `sys-pin-${Date.now()}`,
                sender: 'system',
                type: 'system',
                text: `BiLAL pinned a message: "${snippet.slice(0, 36)}${snippet.length > 36 ? '...' : ''}"`,
                time: timeStr,
              },
            ],
      }));
    } else {
      onUpdateGroup(threadId, (g) => ({
        ...g,
        pinnedMessage: currentlyPinned
          ? null
          : {
              messageId: msg.id,
              text: snippet,
              senderName: senderDisplayName,
              pinnedBy: 'BiLAL',
            },
        messages: currentlyPinned
          ? g.messages
          : [
              ...g.messages,
              {
                id: `sys-gpin-${Date.now()}`,
                sender: 'system',
                type: 'system',
                text: `BiLAL pinned a message: "${snippet.slice(0, 36)}${snippet.length > 36 ? '...' : ''}"`,
                time: timeStr,
              },
            ],
      }));
    }
    onNotify(currentlyPinned ? 'Message unpinned' : 'Message pinned to top for both users');
    setMessageActionSheet(null);
  };

  const jumpToMessage = (msgId: string) => {
    const el = document.querySelector(`[data-msg-id="${msgId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMsgId(msgId);
      window.setTimeout(() => setHighlightedMsgId(null), 1600);
    }
  };

  const MessageActionModal = messageActionSheet && (
    <div
      onClick={() => setMessageActionSheet(null)}
      className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-[#14141D] border border-[#FFD700]/45 p-4 space-y-2.5 shadow-2xl"
      >
        <div className="px-2 pb-2 border-b border-white/10">
          <p className="text-xs font-bold text-[#FFD700]">{messageActionSheet.senderDisplayName}</p>
          <p className="text-sm text-white/90 line-clamp-2 mt-0.5">
            {messageActionSheet.msg.text || (messageActionSheet.msg.type === 'voice' ? 'Voice Note' : 'Photo')}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            handleTogglePinMessage(
              messageActionSheet.scope,
              messageActionSheet.threadId,
              messageActionSheet.msg,
              messageActionSheet.senderDisplayName,
              messageActionSheet.isCurrentlyPinned
            )
          }
          className="w-full h-12 px-4 rounded-2xl bg-[#1A1A22] hover:bg-[#242430] text-white font-bold text-sm flex items-center justify-between"
        >
          <span className="flex items-center gap-2.5">
            {messageActionSheet.isCurrentlyPinned ? (
              <PinOff className="w-4 h-4 text-amber-400" />
            ) : (
              <Pin className="w-4 h-4 text-[#FFD700]" />
            )}
            <span>{messageActionSheet.isCurrentlyPinned ? 'Unpin Message' : 'Pin Message (Visible to Both)'}</span>
          </span>
          <span className="text-[10px] font-bold text-[#FFD700]">TOP</span>
        </button>

        {messageActionSheet.msg.text && (
          <>
            <button
              type="button"
              onClick={() => {
                const tr = translateMessageText(messageActionSheet.msg.text, language);
                if (tr) {
                  setFullTranslationModal({
                    original: messageActionSheet.msg.text!,
                    translated: tr.translated,
                    sourceLang: tr.sourceLang,
                  });
                }
                setMessageActionSheet(null);
              }}
              className="w-full h-12 px-4 rounded-2xl bg-[#1A1A22] hover:bg-[#242430] text-white font-semibold text-sm flex items-center gap-2.5"
            >
              <Languages className="w-4 h-4 text-sky-400" />
              <span>Full Translation ({language})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(messageActionSheet.msg.text || '').catch(() => {});
                onNotify('Message copied');
                setMessageActionSheet(null);
              }}
              className="w-full h-12 px-4 rounded-2xl bg-[#1A1A22] hover:bg-[#242430] text-white font-semibold text-sm flex items-center gap-2.5"
            >
              <CopyIcon className="w-4 h-4 text-white/75" />
              <span>Copy Text</span>
            </button>
          </>
        )}

        {messageActionSheet.scope === 'group' && (
          <button
            type="button"
            onClick={() => {
              onUpdateGroup(messageActionSheet.threadId, (g) => ({
                ...g,
                messages: g.messages.filter((m) => m.id !== messageActionSheet.msg.id),
                pinnedMessage:
                  g.pinnedMessage?.messageId === messageActionSheet.msg.id ? null : g.pinnedMessage,
              }));
              onNotify('Admin deleted message');
              setMessageActionSheet(null);
            }}
            className="w-full h-12 px-4 rounded-2xl bg-red-500/15 hover:bg-red-500/25 text-red-400 font-bold text-sm flex items-center gap-2.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Message (Admin)</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setMessageActionSheet(null)}
          className="w-full h-11 rounded-2xl bg-white/5 text-[#9CA3AF] font-bold text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const FullTranslationOverlay = fullTranslationModal && (
    <div
      onClick={() => setFullTranslationModal(null)}
      className="fixed inset-0 z-[115] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-[#14141D] border border-[#FFD700]/45 p-5 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#FFD700] font-bold text-sm">
            <Languages className="w-4 h-4" />
            <span>Instant Translation</span>
          </div>
          <button
            type="button"
            onClick={() => setFullTranslationModal(null)}
            className="w-8 h-8 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-[#1A1A22] space-y-1">
          <p className="text-[10px] font-bold uppercase text-[#9CA3AF]">
            Original ({fullTranslationModal.sourceLang})
          </p>
          <p className="text-sm text-white leading-relaxed">{fullTranslationModal.original}</p>
        </div>

        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-[#FFD700]/35 space-y-1">
          <p className="text-[10px] font-bold uppercase text-[#FFD700]">
            Translated ({language})
          </p>
          <p className="text-sm font-semibold text-white leading-relaxed">{fullTranslationModal.translated}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFullTranslationModal(null);
            onOpenTranslationSettings();
          }}
          className="w-full h-10 rounded-full gold-gradient text-white text-xs font-extrabold"
        >
          Translation Settings
        </button>
      </div>
    </div>
  );

  // =================== CALL OVERLAY (1v1, 10-Way Group Voice, 4-Way Group Video) ===================
  const CallOverlay = activeCall && (
    <div className="fixed inset-0 z-[100] bg-[#07070D]/95 backdrop-blur-xl flex flex-col items-center justify-between py-10 px-5 overflow-y-auto">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
          {activeCall.isGroup
            ? activeCall.type === 'voice'
              ? 'Group Voice Call · 10 Speakers Active'
              : 'Group Video Call · 4 Active'
            : `${activeCall.type === 'video' ? 'Video' : 'Voice'} Call · Ringing...`}
        </span>
        <h3 className="text-2xl font-bold text-white">{activeCall.name}</h3>
      </div>

      {activeCall.isGroup && activeCall.type === 'voice' ? (
        <div className="grid grid-cols-5 gap-3 w-full max-w-md py-4">
          {[
            { name: 'You (Admin)', img: IMG_HOST_MALE, speaking: true },
            { name: 'Ayesha', img: IMG_HERO_LIVE, speaking: true },
            { name: 'Shizuka', img: IMG_HERO_LIVE, speaking: false },
            { name: 'Muni', img: IMG_HOST_FEMALE, speaking: true },
            { name: 'Hamza', img: IMG_HOST_MALE, speaking: false },
            { name: 'Fatima', img: IMG_HOST_FEMALE, speaking: false },
            { name: 'Ali', img: IMG_HOST_MALE, speaking: true },
            { name: 'Hania', img: IMG_HOST_FEMALE, speaking: false },
            { name: 'Zoya', img: IMG_MUSIC_PARTY, speaking: false },
            { name: 'Usman', img: IMG_HOST_MALE, speaking: false },
          ].map((p, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div
                className={`w-14 h-14 rounded-full p-[2px] ${
                  p.speaking ? 'gold-gradient animate-pulse-gold' : 'bg-white/20'
                }`}
              >
                <img src={p.img} alt={p.name} className="w-full h-full rounded-full object-cover" />
              </div>
              <span className="text-[10px] font-semibold text-white/90 truncate max-w-[60px]">{p.name}</span>
            </div>
          ))}
        </div>
      ) : activeCall.isGroup ? (
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {[
            { name: 'You (Admin)', img: IMG_HOST_MALE },
            { name: 'Ms SHIZUKA', img: IMG_HERO_LIVE },
            { name: 'MUNI DON', img: IMG_HOST_FEMALE },
            { name: 'Hamza Sheikh', img: IMG_HOST_MALE },
          ].map((p) => (
            <div key={p.name} className="relative h-40 rounded-2xl overflow-hidden border border-[#FFD700]/45">
              <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-[11px] text-white font-semibold">
                {p.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <div className="w-36 h-36 rounded-full p-1 gold-gradient animate-pulse-gold">
            <img src={activeCall.avatar} alt={activeCall.name} className="w-full h-full rounded-full object-cover" />
          </div>
        </div>
      )}

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => onNotify('Microphone Toggled')}
          className="w-14 h-14 rounded-full bg-[#1A1A22] text-white flex items-center justify-center border border-white/15"
        >
          <Mic className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={() => setActiveCall(null)}
          className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/40 active:scale-95"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
        <button
          type="button"
          onClick={() => onNotify('Speaker On')}
          className="w-14 h-14 rounded-full bg-[#1A1A22] text-white flex items-center justify-center border border-white/15"
        >
          <Video className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  // =================== FULL SCREEN MEDIA VIEWER ===================
  const FullMediaOverlay = fullMediaUrl && (
    <div
      onClick={() => setFullMediaUrl(null)}
      className="fixed inset-0 z-[105] bg-black/95 flex items-center justify-center p-4"
    >
      <button
        type="button"
        onClick={() => setFullMediaUrl(null)}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
      >
        <X className="w-5 h-5" />
      </button>
      <img src={fullMediaUrl} alt="Shared Media" className="max-w-full max-h-[85vh] rounded-2xl object-contain" />
    </div>
  );

  // =================== HISSA 13: CHAT SETTINGS ===================
  if (view.mode === 'settings' && activeChat) {
    const mediaNov17 = [IMG_HERO_LIVE, IMG_HOST_FEMALE, IMG_MUSIC_PARTY];
    const mediaNov16 = [IMG_PK_BANNER, IMG_HOST_MALE, IMG_HOST_FEMALE, IMG_HERO_LIVE];
    const mediaNov15 = [IMG_MUSIC_PARTY, IMG_HOST_MALE];
    const mediaNov13 = [IMG_HOST_FEMALE, IMG_PK_BANNER, IMG_HERO_LIVE];

    const TogglePill = ({ checked, onToggle }: { checked?: boolean; onToggle: () => void }) => (
      <button
        type="button"
        onClick={() => {
          triggerHaptic();
          onToggle();
        }}
        className={`w-12 h-7 rounded-full p-1 transition-colors ${checked ? 'gold-gradient' : 'bg-[#26262F]'}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    );

    return (
      <div className="fixed inset-0 z-[75] bg-[#07070D] overflow-y-auto">
        <div className="gold-line-top" />
        {FullMediaOverlay}

        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 px-4 bg-[#0B0B10]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setView({ mode: 'chat', chatId: activeChat.id })}
            className="w-10 h-10 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-white">Chat Settings</h2>
          <button
            type="button"
            onClick={() => onNotify('More options')}
            className="w-10 h-10 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </header>

        <div className="max-w-2xl mx-auto pb-12">
          {/* Profile Summary */}
          <div className="py-6 px-4 flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full p-[3px] gold-gradient shadow-lg">
              <img src={activeChat.avatar} alt={activeChat.name} className="w-full h-full rounded-full object-cover" />
            </div>
            <h3 className="text-[20px] font-bold text-white">{activeChat.name}</h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenProfile('other-hania')}
                className="px-4 py-1.5 rounded-full border border-[#FFD700] text-[#FFD700] text-xs font-bold active:scale-95"
              >
                View Profile
              </button>
              <button
                type="button"
                onClick={() => setView({ mode: 'chat', chatId: activeChat.id })}
                className="px-4 py-1.5 rounded-full bg-[#1A1A22] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* 8 Settings Rows */}
          <div className="bg-[#0B0B10] border-y border-white/10 divide-y divide-white/5">
            <button
              type="button"
              onClick={() => setWallpaperModal(true)}
              className="w-full h-[60px] px-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[#FFD700]" />
                <span className="text-[16px] font-medium text-white">Chat Wallpaper</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                <span>{activeChat.wallpaper || 'Obsidian'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = activeChat.alertTone === 'Royal Gold' ? 'Default' : 'Royal Gold';
                onUpdateChat(activeChat.id, (c) => ({ ...c, alertTone: next }));
                onNotify(`Alert Tone: ${next}`);
              }}
              className="w-full h-[60px] px-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#FFD700]" />
                <span className="text-[16px] font-medium text-white">Alert Tones</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                <span>{activeChat.alertTone || 'Default'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            <div className="h-[60px] px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellOff className="w-5 h-5 text-white/80" />
                <span className="text-[16px] font-medium text-white">Mute Messages</span>
              </div>
              <TogglePill
                checked={activeChat.mutedMessages}
                onToggle={() => onUpdateChat(activeChat.id, (c) => ({ ...c, mutedMessages: !c.mutedMessages }))}
              />
            </div>

            <div className="h-[60px] px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-white/80" />
                <span className="text-[16px] font-medium text-white">Mute Calls</span>
              </div>
              <TogglePill
                checked={activeChat.mutedCalls}
                onToggle={() => onUpdateChat(activeChat.id, (c) => ({ ...c, mutedCalls: !c.mutedCalls }))}
              />
            </div>

            <div className="h-[60px] px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Pin className="w-5 h-5 text-[#FFD700]" />
                <span className="text-[16px] font-medium text-white">Pin to Top</span>
              </div>
              <TogglePill
                checked={activeChat.pinned}
                onToggle={() => onUpdateChat(activeChat.id, (c) => ({ ...c, pinned: !c.pinned }))}
              />
            </div>

            <button
              type="button"
              onClick={() => onNotify(`${activeChat.name} Blocked`)}
              className="w-full h-[60px] px-4 flex items-center justify-between text-red-500"
            >
              <div className="flex items-center gap-3">
                <Ban className="w-5 h-5" />
                <span className="text-[16px] font-medium">Block</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNotify(`Report submitted for ${activeChat.name}`)}
              className="w-full h-[60px] px-4 flex items-center justify-between text-red-500"
            >
              <div className="flex items-center gap-3">
                <Flag className="w-5 h-5" />
                <span className="text-[16px] font-medium">Report</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                onUpdateChat(activeChat.id, (c) => ({ ...c, messages: [] }));
                onNotify('Chat Cleared');
              }}
              className="w-full h-[60px] px-4 flex items-center justify-between text-white/85"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5" />
                <span className="text-[16px] font-medium">Clear Chat</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Media Section: 3 Cols Grouped by Dates */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Media, Links & Docs</h4>
              <span className="text-xs font-bold text-[#FFD700]">View All</span>
            </div>

            {[
              { date: 'Nov 17', imgs: mediaNov17 },
              { date: 'Nov 16', imgs: mediaNov16 },
              { date: 'Nov 15', imgs: mediaNov15 },
              { date: 'Nov 13', imgs: mediaNov13 },
            ].map((section) => (
              <div key={section.date} className="space-y-1.5">
                <p className="text-xs font-semibold text-[#9CA3AF]">{section.date}</p>
                <div className="grid grid-cols-3 gap-1">
                  {section.imgs.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFullMediaUrl(img)}
                      className="aspect-square rounded-[8px] overflow-hidden active:scale-95 transition-transform"
                    >
                      <img src={img} alt={section.date} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <p className="text-center text-xs text-[#888888] pt-2">Chat Since Nov 2026</p>
          </div>
        </div>

        {/* Wallpaper Picker Modal */}
        {wallpaperModal && (
          <div className="fixed inset-0 z-[90] bg-black/75 flex items-end justify-center p-4">
            <div className="w-full max-w-md bg-[#1A1A22] rounded-3xl p-4 space-y-3 border border-[#FFD700]/35">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-white">Choose Chat Wallpaper</h4>
                <button type="button" onClick={() => setWallpaperModal(false)} className="text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Obsidian', bg: 'bg-[#07070D]' },
                  { name: 'Royal Purple', bg: 'bg-gradient-to-b from-[#1E1038] to-[#07070D]' },
                  { name: 'Amber Gold', bg: 'bg-gradient-to-b from-[#291B07] to-[#07070D]' },
                ].map((wp) => (
                  <button
                    key={wp.name}
                    type="button"
                    onClick={() => {
                      onUpdateChat(activeChat.id, (c) => ({ ...c, wallpaper: wp.name }));
                      setWallpaperModal(false);
                      onNotify(`Wallpaper: ${wp.name}`);
                    }}
                    className={`h-24 rounded-2xl ${wp.bg} border border-[#FFD700]/40 flex items-end p-2 text-xs font-bold text-white`}
                  >
                    {wp.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =================== HISSA 11: 1v1 CHAT OPEN ===================
  if (view.mode === 'chat' && activeChat) {
    const wpBg =
      activeChat.wallpaper === 'Royal Purple'
        ? 'bg-gradient-to-b from-[#1E1038] to-[#07070D]'
        : activeChat.wallpaper === 'Amber Gold'
          ? 'bg-gradient-to-b from-[#291B07] to-[#07070D]'
          : 'bg-[#07070D]';

    return (
      <div className={`fixed inset-0 z-[70] ${wpBg} flex flex-col`}>
        <div className="gold-line-top" />
        {CallOverlay}
        {FullMediaOverlay}
        {MessageActionModal}
        {FullTranslationOverlay}

        {/* Top Header 64px */}
        <header className="h-16 px-3 sm:px-4 bg-[#0B0B10] border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setView({ mode: 'list' })}
              className="w-10 h-10 rounded-full bg-[#1A1A22] text-white flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => onOpenProfile('other-hania')}
              className="flex items-center gap-2.5 min-w-0 text-left"
            >
              <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full object-cover border border-[#FFD700] shrink-0" />
              <div className="min-w-0">
                <h2 className="text-[16px] font-bold text-white truncate">{activeChat.name}</h2>
                <p className="text-[12px] text-emerald-400 font-medium truncate">{activeChat.statusText}</p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onOpenTranslationSettings}
              aria-label="Translation Settings"
              className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-95 ${
                translationSettings.autoTranslate
                  ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/45'
                  : 'bg-[#1A1A22] text-[#9CA3AF]'
              }`}
            >
              <Languages className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveCall({ type: 'voice', name: activeChat.name, avatar: activeChat.avatar })}
              aria-label="Voice Call"
              className="w-9 h-9 rounded-full bg-[#1A1A22] text-white flex items-center justify-center active:scale-95"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveCall({ type: 'video', name: activeChat.name, avatar: activeChat.avatar })}
              aria-label="Video Call"
              className="w-9 h-9 rounded-full bg-[#1A1A22] text-white flex items-center justify-center active:scale-95"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setView({ mode: 'settings', chatId: activeChat.id })}
              aria-label="Chat Settings"
              className="w-9 h-9 rounded-full bg-[#1A1A22] text-white flex items-center justify-center active:scale-95"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Sticky Pinned Message Banner (Visible to Both Users) */}
        {activeChat.pinnedMessage && (
          <div className="bg-[#12121A]/95 backdrop-blur-md border-b border-[#FFD700]/35 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={() => jumpToMessage(activeChat.pinnedMessage!.messageId)}
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
            >
              <div className="w-7 h-7 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/40 flex items-center justify-center shrink-0">
                <Pin className="w-3.5 h-3.5 text-[#FFD700]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#FFD700] leading-tight">
                  Pinned · {activeChat.pinnedMessage.senderName}
                </p>
                <p className="text-xs text-white/90 truncate">{activeChat.pinnedMessage.text}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                onUpdateChat(activeChat.id, (c) => ({ ...c, pinnedMessage: null }));
                onNotify('Pinned message removed');
              }}
              aria-label="Unpin message"
              className="w-7 h-7 rounded-full bg-white/10 text-white/75 flex items-center justify-center shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#1A1A22] text-[#9CA3AF] text-[11px] font-semibold">
              Today · Long-press any message to Pin
            </span>
          </div>

          {activeChat.messages.map((msg) => {
            if (msg.type === 'system') {
              return (
                <div key={msg.id} data-msg-id={msg.id} className="flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-[#1A1A22] border border-[#FFD700]/25 text-[11px] font-semibold text-[#FFD700] flex items-center gap-1.5">
                    <Pin className="w-3 h-3 shrink-0" />
                    <span>{msg.text}</span>
                  </span>
                </div>
              );
            }

            const isMe = msg.sender === 'me';
            const senderDisplay = isMe ? 'BiLAL' : activeChat.name;
            const isPinnedMsg = activeChat.pinnedMessage?.messageId === msg.id;
            const tr =
              translationSettings.autoTranslate && msg.type === 'text' && msg.text
                ? translateMessageText(msg.text, language)
                : null;

            return (
              <div
                key={msg.id}
                data-msg-id={msg.id}
                className={`flex items-end gap-2 transition-colors rounded-2xl ${
                  isMe ? 'justify-end' : 'justify-start'
                } ${highlightedMsgId === msg.id ? 'bg-[#FFD700]/15 p-1' : ''}`}
              >
                {!isMe && (
                  <img src={activeChat.avatar} alt={activeChat.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                )}

                {msg.type === 'voice' ? (
                  <div
                    onPointerDown={() => startLongPress('chat', activeChat.id, msg, senderDisplay, isPinnedMsg)}
                    onPointerUp={cancelLongPress}
                    onPointerLeave={cancelLongPress}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setMessageActionSheet({ scope: 'chat', threadId: activeChat.id, msg, senderDisplayName: senderDisplay, isCurrentlyPinned: isPinnedMsg });
                    }}
                    className={`w-[220px] p-3 rounded-[16px] flex items-center gap-2.5 select-none ${
                      isMe ? 'gold-gradient rounded-br-xs' : 'bg-[#1A1A22] border border-white/10 rounded-bl-xs'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => playVoiceNote(msg.id)}
                      className="w-9 h-9 rounded-full gold-gradient border border-white/30 text-white flex items-center justify-center shrink-0"
                    >
                      {playingVoiceId === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <div className="flex-1 flex items-center gap-0.5 h-5">
                      {[40, 75, 55, 95, 65, 80, 45, 85, 60, 40].map((h, idx) => (
                        <span
                          key={idx}
                          style={{ height: `${h}%` }}
                          className={`flex-1 rounded-full bg-[#FFD700] ${playingVoiceId === msg.id ? 'animate-pulse' : ''}`}
                        />
                      ))}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-white font-mono-num">{msg.duration || '0:04'}</p>
                      <p className="text-[10px] text-white/60">{msg.time}</p>
                    </div>
                  </div>
                ) : msg.type === 'image' && msg.mediaUrl ? (
                  <button
                    type="button"
                    onClick={() => setFullMediaUrl(msg.mediaUrl!)}
                    onPointerDown={() => startLongPress('chat', activeChat.id, msg, senderDisplay, isPinnedMsg)}
                    onPointerUp={cancelLongPress}
                    onPointerLeave={cancelLongPress}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setMessageActionSheet({ scope: 'chat', threadId: activeChat.id, msg, senderDisplayName: senderDisplay, isCurrentlyPinned: isPinnedMsg });
                    }}
                    className="w-[200px] rounded-[16px] overflow-hidden border border-[#FFD700]/40 text-left"
                  >
                    <img src={msg.mediaUrl} alt="Attachment" className="w-full h-44 object-cover" />
                    {msg.text && <p className="p-2 text-xs text-white bg-[#1A1A22]">{msg.text}</p>}
                  </button>
                ) : (
                  <div
                    onPointerDown={() => startLongPress('chat', activeChat.id, msg, senderDisplay, isPinnedMsg)}
                    onPointerUp={cancelLongPress}
                    onPointerLeave={cancelLongPress}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setMessageActionSheet({ scope: 'chat', threadId: activeChat.id, msg, senderDisplayName: senderDisplay, isCurrentlyPinned: isPinnedMsg });
                    }}
                    className={`max-w-[78%] px-3.5 py-2.5 rounded-[16px] select-none cursor-pointer ${
                      isMe
                        ? 'gold-gradient text-white rounded-br-xs shadow-md'
                        : 'bg-[#1A1A22] text-white rounded-bl-xs border border-white/5'
                    } ${isPinnedMsg ? 'ring-2 ring-[#FFD700]/75' : ''}`}
                  >
                    {isPinnedMsg && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#FFD700] mb-0.5">
                        <Pin className="w-2.5 h-2.5" />
                        <span>Pinned</span>
                      </div>
                    )}

                    {tr && translationSettings.mode === 'onlyTranslation' ? (
                      <button
                        type="button"
                        onClick={() =>
                          setFullTranslationModal({
                            original: msg.text || '',
                            translated: tr.translated,
                            sourceLang: tr.sourceLang,
                          })
                        }
                        className="text-left block w-full"
                      >
                        <p className="text-[15px] leading-snug break-words">{tr.translated}</p>
                        <p className={`text-[10px] mt-1 flex items-center gap-1 ${isMe ? 'text-white/80' : 'text-[#9CA3AF]'}`}>
                          <Languages className="w-3 h-3 shrink-0" />
                          <span>Translated from {tr.sourceLang} · Tap for original</span>
                        </p>
                      </button>
                    ) : (
                      <>
                        <p className="text-[15px] leading-snug break-words">{msg.text}</p>
                        {tr && (
                          <button
                            type="button"
                            onClick={() =>
                              setFullTranslationModal({
                                original: msg.text || '',
                                translated: tr.translated,
                                sourceLang: tr.sourceLang,
                              })
                            }
                            className={`mt-1 pt-1 border-t w-full text-left flex items-start gap-1 ${
                              isMe ? 'border-white/20 text-white/85' : 'border-white/10 text-[#9CA3AF]'
                            }`}
                          >
                            <Languages className="w-3 h-3 mt-0.5 shrink-0" />
                            <span className="text-[11px] leading-snug break-words">{tr.translated}</span>
                          </button>
                        )}
                      </>
                    )}

                    <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-white/75' : 'text-[#888888]'}`}>
                      <span>{msg.time}</span>
                      {isMe && <CheckCheck className="w-3.5 h-3.5 text-sky-300" />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2">
              <img src={activeChat.avatar} alt={activeChat.name} className="w-7 h-7 rounded-full object-cover" />
              <div className="px-3.5 py-2 rounded-2xl bg-[#1A1A22] flex items-center gap-1.5">
                <span className="text-xs text-[#FFD700] font-semibold">Typing</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Sticker Tray */}
        {showStickers && (
          <div className="bg-[#1A1A22] border-t border-white/10 p-3 grid grid-cols-8 gap-2 max-w-3xl mx-auto w-full">
            {STICKERS_CATALOG.slice(0, 16).map((st, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  sendMessageToChat(activeChat.id, { sender: 'me', type: 'text', text: st });
                  setShowStickers(false);
                }}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {st}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Input Bar 64px */}
        <div className="min-h-16 px-3 py-2 bg-[#0B0B10] border-t border-white/10 shrink-0">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => sendMessageToChat(activeChat.id, { sender: 'me', type: 'image', mediaUrl: IMG_HERO_LIVE, text: 'Vibe Live Pic' })}
              aria-label="Send Media"
              className="w-10 h-10 rounded-full bg-[#1A1A22] text-white flex items-center justify-center shrink-0"
            >
              <Plus className="w-5 h-5" />
            </button>

            <div className="flex-1 h-11 rounded-[24px] bg-[#1A1A22] px-3.5 flex items-center gap-2 border border-white/10">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && messageInput.trim()) {
                    sendMessageToChat(activeChat.id, { sender: 'me', type: 'text', text: messageInput.trim() });
                    setMessageInput('');
                  }
                }}
                placeholder="Message..."
                className="flex-1 bg-transparent text-sm text-white placeholder-[#888888] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowStickers((s) => !s)}
                aria-label="Stickers"
                className="text-white/75 hover:text-[#FFD700]"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => sendMessageToChat(activeChat.id, { sender: 'me', type: 'voice', duration: '0:04' })}
                aria-label="Send Voice Note"
                className="text-white/75 hover:text-[#FFD700]"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => sendMessageToChat(activeChat.id, { sender: 'me', type: 'image', mediaUrl: IMG_HOST_FEMALE })}
                aria-label="Send Photo"
                className="text-white/75 hover:text-[#FFD700]"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!messageInput.trim()) return;
                sendMessageToChat(activeChat.id, { sender: 'me', type: 'text', text: messageInput.trim() });
                setMessageInput('');
              }}
              aria-label="Send"
              className="w-11 h-11 rounded-full gold-gradient text-white flex items-center justify-center shadow-lg shrink-0 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =================== HISSA 23 FINAL: CREATE SUPER GROUP (MIN 3, MAX 500) ===================
  if (view.mode === 'createGroup') {
    const isCouple = newGroupType === 'Couple';
    const maxLimit = isCouple ? 2 : 500;
    const minLimit = isCouple ? 2 : 3;
    const totalSelectedCount = Math.min(maxLimit, 1 + selectedMemberIds.length + (isCouple ? 0 : extraFillMembersCount));

    const filteredCandidates = GROUP_CANDIDATE_MEMBERS.filter((m) =>
      m.name.toLowerCase().includes(groupSearch.toLowerCase())
    );

    const toggleMember = (id: string) => {
      setSelectedMemberIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (1 + prev.length + extraFillMembersCount >= maxLimit) {
          onNotify(`Max ${maxLimit} members allowed for ${newGroupType} Group`);
          return prev;
        }
        return [...prev, id];
      });
    };

    const handleCreateGroup = () => {
      if (totalSelectedCount < minLimit) {
        onNotify(`Select at least ${minLimit} members to create this group`);
        return;
      }

      const baseMembers: GroupMemberItem[] = GROUP_CANDIDATE_MEMBERS.filter((c) =>
        selectedMemberIds.includes(c.id)
      )
        .slice(0, maxLimit - 1)
        .map((c) => ({
          ...c,
          isAdmin: false,
        }));

      const generatedExtras: GroupMemberItem[] = isCouple
        ? []
        : Array.from({ length: Math.min(extraFillMembersCount, maxLimit - 1 - baseMembers.length) }, (_, idx) => ({
            id: `extra-mem-${Date.now()}-${idx}`,
            name: `Vibe Member #${baseMembers.length + idx + 2}`,
            avatar: idx % 2 === 0 ? IMG_HERO_LIVE : IMG_HOST_FEMALE,
            online: idx % 4 === 0,
            isAdmin: false,
          }));

      const defaultTitle =
        newGroupType === 'City'
          ? `${newGroupCity} Super Group`
          : newGroupType === 'Couple'
            ? 'Couple Paradise Room'
            : 'Vibe Live Super Squad';

      const finalName = newGroupName.trim() || defaultTitle;
      const slug = finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 22) || 'super-group';

      const created: GroupChatItem = {
        id: `grp-${Date.now()}`,
        name: finalName,
        avatar: newGroupPhoto,
        coverPhoto: newGroupCover,
        description: newGroupDesc.trim() || 'Welcome to our Vibe Live Super Group!',
        rules: newGroupRules.trim() || '1. Respect everyone. 2. Complete daily group tasks.',
        groupType: newGroupType,
        city: newGroupType === 'City' ? newGroupCity : undefined,
        hostName: newGroupType === 'Host Fan' ? newGroupHost : undefined,
        inviteLink: `http://vibelive.com/g/${slug}`,
        maxMembers: maxLimit,
        isJoined: true,
        unreadCount: 0,
        activityScore: 100,
        dailyTaskMessages: 1,
        dailyTaskClaimed: false,
        battleScore: 0,
        rivalScore: 2500,
        rivalName: 'Karachi Kings',
        members: [
          { id: 'u-me', name: 'BiLAL Shafique2494 (You)', avatar: IMG_HOST_MALE, isAdmin: true, online: true },
          ...baseMembers,
          ...generatedExtras,
        ],
        joinRequests: [],
        messages: [
          {
            id: `gm-init-${Date.now()}`,
            sender: 'me',
            senderName: 'BiLAL Shafique2494',
            isAdmin: true,
            type: 'text',
            text: `Welcome to ${finalName} (${newGroupType})! Cover, Description & Rules set! 👑`,
            time: 'Now',
          },
        ],
        media: [newGroupCover, newGroupPhoto, IMG_HERO_LIVE],
        videos: [IMG_PK_BANNER],
      };

      onAddGroup(created);
      onNotify(`${newGroupType} Group "${created.name}" created (${created.members.length}/${maxLimit})!`);
      setExtraFillMembersCount(0);
      setView({ mode: 'groupChat', groupId: created.id });
    };

    const photoPresets = [IMG_PK_BANNER, IMG_HERO_LIVE, IMG_MUSIC_PARTY, IMG_HOST_FEMALE, IMG_HOST_MALE];

    return (
      <div className="fixed inset-0 z-[75] bg-[#07070D] flex flex-col">
        <div className="gold-line-top" />
        <header className="h-14 px-4 bg-[#0B0B10] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => setView({ mode: 'list' })} className="w-9 h-9 rounded-full bg-[#1A1A22] text-white flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white">Create Super Group</h2>
          </div>
          <button
            type="button"
            onClick={handleCreateGroup}
            className="px-4 py-1.5 rounded-full gold-gradient text-white text-xs font-extrabold shadow"
          >
            Create ({totalSelectedCount})
          </button>
        </header>

        <div className="p-4 max-w-2xl mx-auto w-full space-y-4 flex-1 overflow-y-auto pb-12">
          {/* Group Photo + Name */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const next = photoPresets[(photoPresets.indexOf(newGroupPhoto) + 1) % photoPresets.length];
                setNewGroupPhoto(next);
              }}
              className="relative w-16 h-16 rounded-full border-2 border-[#FFD700] overflow-hidden shrink-0 group"
              title="Tap to change Group Photo"
            >
              <img src={newGroupPhoto} alt="Group avatar" className="w-full h-full object-cover" />
              <span className="absolute inset-0 bg-black/45 flex items-center justify-center text-[9px] font-bold text-[#FFD700]">
                Change
              </span>
            </button>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group Name (e.g. Royal Vibe Live)..."
              className="flex-1 h-12 px-4 rounded-2xl bg-[#1A1A22] text-white placeholder-[#888888] text-sm border border-white/10 focus:outline-none focus:border-[#FFD700]"
            />
          </div>

          {/* 7 Group Types Selector */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#FFD700]">Select Group Type (7 Modes)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {SUPER_GROUP_TYPES.map((gt) => {
                const active = newGroupType === gt.id;
                return (
                  <button
                    key={gt.id}
                    type="button"
                    onClick={() => {
                      setNewGroupType(gt.id);
                      if (gt.id === 'Couple') {
                        setSelectedMemberIds(['cand-1']);
                        setExtraFillMembersCount(0);
                      }
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      active
                        ? 'gold-gradient border-transparent text-white shadow'
                        : 'bg-[#14141C] border-white/10 text-white/85'
                    }`}
                  >
                    <p className="text-xs font-extrabold">{gt.label}</p>
                    <p className={`text-[10px] ${active ? 'text-white/90' : 'text-[#9CA3AF]'}`}>{gt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {newGroupType === 'City' && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-white">Select City</p>
              <div className="flex flex-wrap gap-1.5">
                {GROUP_CITIES.map((ct) => (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => setNewGroupCity(ct)}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      newGroupCity === ct ? 'gold-gradient text-white' : 'bg-[#1A1A22] text-[#9CA3AF]'
                    }`}
                  >
                    {ct}
                  </button>
                ))}
              </div>
            </div>
          )}

          {newGroupType === 'Host Fan' && (
            <input
              type="text"
              value={newGroupHost}
              onChange={(e) => setNewGroupHost(e.target.value)}
              placeholder="Host Name (e.g. Ayesha Live)..."
              className="w-full h-10 px-3.5 rounded-xl bg-[#1A1A22] text-xs text-white border border-white/10 focus:outline-none focus:border-[#FFD700]"
            />
          )}

          {/* Cover Photo, Description & Rules */}
          <div className="rounded-2xl bg-[#14141C] border border-white/10 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Cover Photo, Description & Rules</span>
              <button
                type="button"
                onClick={() => {
                  const next = photoPresets[(photoPresets.indexOf(newGroupCover) + 1) % photoPresets.length];
                  setNewGroupCover(next);
                }}
                className="text-[11px] font-bold text-[#FFD700] underline"
              >
                Switch Cover
              </button>
            </div>
            <img src={newGroupCover} alt="Cover" className="w-full h-24 rounded-xl object-cover border border-[#FFD700]/30" />
            <input
              type="text"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              placeholder="Group Description..."
              className="w-full h-9 px-3 rounded-xl bg-[#0B0B10] border border-white/10 text-xs text-white focus:outline-none"
            />
            <input
              type="text"
              value={newGroupRules}
              onChange={(e) => setNewGroupRules(e.target.value)}
              placeholder="Group Rules..."
              className="w-full h-9 px-3 rounded-xl bg-[#0B0B10] border border-white/10 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Members Picker (Min 3 - Max 500) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-[#FFD700]">
                Members: {totalSelectedCount} / {maxLimit} (Min {minLimit})
              </span>
              {!isCouple && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMemberIds(GROUP_CANDIDATE_MEMBERS.map((c) => c.id));
                      setExtraFillMembersCount(449);
                      onNotify('Filled up to 500 Super Group Members!');
                    }}
                    className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-[#FFD700]/45 text-[10px] font-extrabold text-[#FFD700]"
                  >
                    Fill 500 Demo
                  </button>
                  <input
                    type="text"
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    placeholder="Search Friends..."
                    className="h-8 px-3 rounded-full bg-[#1A1A22] text-xs text-white border border-white/10 focus:outline-none w-36"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              {filteredCandidates.map((cand) => {
                const selected = selectedMemberIds.includes(cand.id);
                return (
                  <button
                    key={cand.id}
                    type="button"
                    onClick={() => toggleMember(cand.id)}
                    className="w-full h-12 px-3 rounded-xl bg-[#0B0B10] border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={cand.avatar} alt={cand.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-xs font-semibold text-white">{cand.name}</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        selected ? 'gold-gradient border-transparent text-white' : 'border-white/30'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =================== HISSA 23 FINAL: GROUP INFO & ADMIN SYSTEM ===================
  if (view.mode === 'groupInfo' && activeGroup) {
    const maxCap = activeGroup.maxMembers || 500;
    const qMem = memberSearchQuery.trim().toLowerCase();
    const filteredMembers = activeGroup.members.filter(
      (m) => !qMem || m.name.toLowerCase().includes(qMem)
    );
    const renderedMembers = filteredMembers.slice(0, visibleMembersCap);
    const joinReqs = activeGroup.joinRequests || [];
    const videosList = activeGroup.videos || [];

    return (
      <div className="fixed inset-0 z-[75] bg-[#07070D] overflow-y-auto pb-12">
        <div className="gold-line-top" />
        {CallOverlay}
        {FullMediaOverlay}
        <header className="sticky top-0 z-20 h-14 px-4 bg-[#0B0B10]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
          <button type="button" onClick={() => setView({ mode: 'groupChat', groupId: activeGroup.id })} className="w-9 h-9 rounded-full bg-[#1A1A22] text-white flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-white">Super Group Info</h2>
          <button
            type="button"
            onClick={() => {
              onUpdateGroup(activeGroup.id, (g) => ({ ...g, pinned: !g.pinned }));
              onNotify(activeGroup.pinned ? 'Group Unpinned' : 'Group Pinned to Top!');
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center ${
              activeGroup.pinned ? 'gold-gradient text-white' : 'bg-[#1A1A22] text-[#FFD700]'
            }`}
            title="Pin Group"
          >
            <Pin className="w-4 h-4" />
          </button>
        </header>

        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {/* Cover Photo + Group Avatar + Description + Rules */}
          <div className="rounded-3xl bg-[#14141C] border border-[#FFD700]/35 overflow-hidden">
            <div className="relative h-32">
              <img
                src={activeGroup.coverPhoto || activeGroup.avatar}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14141C] via-black/30 to-transparent" />
              <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/70 border border-[#FFD700]/45 text-[10px] font-extrabold text-[#FFD700]">
                {activeGroup.groupType} {activeGroup.city ? `· ${activeGroup.city}` : ''}
              </span>
            </div>

            <div className="px-4 pb-4 -mt-9 relative flex flex-col items-center text-center space-y-2">
              <img
                src={activeGroup.avatar}
                alt={activeGroup.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#FFD700] shadow-xl"
              />
              <h3 className="text-xl font-extrabold text-white">{activeGroup.name}</h3>
              <p className="text-xs font-bold text-[#FFD700]">
                {activeGroup.members.length} / {maxCap} Members · {activeGroup.members.filter((m) => m.online).length} Online
              </p>
              {activeGroup.description && (
                <p className="text-xs text-white/85 max-w-md">{activeGroup.description}</p>
              )}
              {activeGroup.rules && (
                <div className="w-full rounded-xl bg-black/35 border border-white/10 p-2.5 text-left text-[11px] text-[#9CA3AF]">
                  <span className="font-bold text-[#FFD700]">Rules: </span>
                  {activeGroup.rules}
                </div>
              )}

              {activeGroup.inviteLink && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(activeGroup.inviteLink!).catch(() => {});
                    onNotify(`Invite Link Copied: ${activeGroup.inviteLink}`);
                  }}
                  className="px-3 py-1 rounded-full bg-[#1A1A22] border border-white/15 text-[11px] font-semibold text-sky-300 flex items-center gap-1.5"
                >
                  <CopyIcon className="w-3 h-3" />
                  <span>{activeGroup.inviteLink}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Voice (10)', icon: Phone, fn: () => setActiveCall({ type: 'voice', name: activeGroup.name, avatar: activeGroup.avatar, isGroup: true }) },
              { label: 'Video (4)', icon: Video, fn: () => setActiveCall({ type: 'video', name: activeGroup.name, avatar: activeGroup.avatar, isGroup: true }) },
              { label: activeGroup.muted ? 'Unmute' : 'Mute Group', icon: BellOff, fn: () => onUpdateGroup(activeGroup.id, (g) => ({ ...g, muted: !g.muted })) },
              { label: 'Add (+10)', icon: UserPlus, fn: () => {
                if (activeGroup.members.length >= maxCap) {
                  onNotify(`Group full (${maxCap}/${maxCap})`);
                  return;
                }
                const toAdd: GroupMemberItem[] = Array.from(
                  { length: Math.min(10, maxCap - activeGroup.members.length) },
                  (_, idx) => ({
                    id: `gm-add-${Date.now()}-${idx}`,
                    name: GROUP_CANDIDATE_MEMBERS[(activeGroup.members.length + idx) % GROUP_CANDIDATE_MEMBERS.length].name,
                    avatar: idx % 2 === 0 ? IMG_HERO_LIVE : IMG_HOST_FEMALE,
                    online: idx % 3 === 0,
                  })
                );
                onUpdateGroup(activeGroup.id, (g) => ({ ...g, members: [...g.members, ...toAdd] }));
                onNotify(`Added ${toAdd.length} new members (${activeGroup.members.length + toAdd.length}/${maxCap})`);
              }},
            ].map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.label}
                  type="button"
                  onClick={btn.fn}
                  className="py-2.5 rounded-2xl bg-[#1A1A22] text-white flex flex-col items-center gap-1 text-[11px] font-semibold active:scale-95"
                >
                  <Icon className="w-4 h-4 text-[#FFD700]" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

          {/* Join Requests System (Private Group Admin Approval) */}
          {joinReqs.length > 0 && (
            <div className="rounded-2xl bg-[#14141C] border border-[#FFD700]/40 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#FFD700] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Join Requests ({joinReqs.length})</span>
                </span>
                <span className="text-[10px] text-[#9CA3AF]">Admin Approval Required</span>
              </div>
              {joinReqs.map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#0B0B10]">
                  <div className="flex items-center gap-2.5">
                    <img src={req.avatar} alt={req.name} className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-xs font-bold text-white">{req.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateGroup(activeGroup.id, (g) => ({
                          ...g,
                          joinRequests: (g.joinRequests || []).filter((r) => r.id !== req.id),
                          members: [
                            ...g.members,
                            { id: req.id, name: req.name, avatar: req.avatar, online: true },
                          ],
                        }));
                        onNotify(`${req.name} Approved & Added!`);
                      }}
                      className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateGroup(activeGroup.id, (g) => ({
                          ...g,
                          joinRequests: (g.joinRequests || []).filter((r) => r.id !== req.id),
                        }));
                        onNotify(`Declined ${req.name}`);
                      }}
                      className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Members List with Full Admin Controls (Make Admin, Mute 1h/1d, Kick) */}
          <div className="rounded-2xl bg-[#0B0B10] border border-white/10 p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#FFD700]">
                Members ({activeGroup.members.length}/{maxCap})
              </span>
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="h-8 px-3 rounded-full bg-[#1A1A22] text-xs text-white border border-white/10 focus:outline-none w-40"
              />
            </div>

            <div className="space-y-1.5">
              {renderedMembers.map((m) => (
                <div key={m.id} className="p-2 rounded-xl bg-[#14141C] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={m.avatar} alt={m.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-white truncate">{m.name}</p>
                        {m.isAdmin && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-[#FFD700]/50 text-[9px] font-black text-[#FFD700]">
                            Admin
                          </span>
                        )}
                        {m.mutedUntilLabel && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[9px] font-bold text-rose-300">
                            Muted {m.mutedUntilLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#9CA3AF]">{m.online ? 'Online' : 'Offline'}</p>
                    </div>
                  </div>

                  {m.id !== 'u-me' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateGroup(activeGroup.id, (g) => ({
                            ...g,
                            members: g.members.map((x) =>
                              x.id === m.id ? { ...x, isAdmin: !x.isAdmin } : x
                            ),
                          }));
                          onNotify(m.isAdmin ? `Removed Admin from ${m.name}` : `${m.name} is now Admin 👑`);
                        }}
                        title="Make / Remove Admin"
                        className="px-2 py-1 rounded-lg bg-amber-500/15 text-[#FFD700] text-[10px] font-bold"
                      >
                        {m.isAdmin ? 'Unadmin' : 'Admin'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextMute =
                            m.mutedUntilLabel === '1 Hour'
                              ? '1 Day'
                              : m.mutedUntilLabel === '1 Day'
                                ? undefined
                                : '1 Hour';
                          onUpdateGroup(activeGroup.id, (g) => ({
                            ...g,
                            members: g.members.map((x) =>
                              x.id === m.id ? { ...x, mutedUntilLabel: nextMute } : x
                            ),
                          }));
                          onNotify(nextMute ? `Muted ${m.name} for ${nextMute}` : `Unmuted ${m.name}`);
                        }}
                        title="Mute 1h / 1d"
                        className="px-2 py-1 rounded-lg bg-white/10 text-white text-[10px] font-bold flex items-center gap-0.5"
                      >
                        <VolumeX className="w-3 h-3" />
                        <span>{m.mutedUntilLabel === '1 Hour' ? '1d' : m.mutedUntilLabel === '1 Day' ? 'Unmute' : '1h'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateGroup(activeGroup.id, (g) => ({
                            ...g,
                            members: g.members.filter((x) => x.id !== m.id),
                          }));
                          onNotify(`Removed ${m.name}`);
                        }}
                        title="Remove Member"
                        className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredMembers.length > visibleMembersCap && (
              <button
                type="button"
                onClick={() => setVisibleMembersCap((c) => c + 60)}
                className="w-full py-2 rounded-xl bg-[#1A1A22] text-xs font-bold text-[#FFD700]"
              >
                Show More ({filteredMembers.length - visibleMembersCap} remaining)
              </button>
            )}
          </div>

          {/* Media Grid: Photos / Videos Separate Tabs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Group Media</h4>
              <div className="flex gap-1.5">
                {(['photos', 'videos'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setGroupMediaTab(tab)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize ${
                      groupMediaTab === tab ? 'gold-gradient text-white' : 'bg-[#1A1A22] text-[#9CA3AF]'
                    }`}
                  >
                    {tab} ({tab === 'photos' ? activeGroup.media.length : videosList.length})
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(groupMediaTab === 'photos' ? activeGroup.media : videosList).map((img, i) => (
                <button key={i} type="button" onClick={() => setFullMediaUrl(img)} className="relative aspect-square rounded-xl overflow-hidden">
                  <img src={img} alt="Group media" className="w-full h-full object-cover" />
                  {groupMediaTab === 'videos' && (
                    <span className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <Play className="w-7 h-7 text-white fill-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                onLeaveGroup(activeGroup.id);
                setView({ mode: 'list' });
                onNotify('Left Group');
              }}
              className="h-11 rounded-full bg-red-600 text-white text-sm font-bold"
            >
              Leave Group
            </button>
            <button
              type="button"
              onClick={() => onNotify('Group Reported to Safety Team')}
              className="h-11 rounded-full bg-[#1A1A22] text-red-400 border border-red-500/30 text-sm font-bold"
            >
              Report Group
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =================== HISSA 23 FINAL: GROUP CHAT VIEW ===================
  if (view.mode === 'groupChat' && activeGroup) {
    const onlineCount = Math.max(1, activeGroup.members.filter((m) => m.online).length);
    const taskCount = activeGroup.dailyTaskMessages || 0;
    const taskReady = taskCount >= 100 && !activeGroup.dailyTaskClaimed;
    const myScore = activeGroup.battleScore || 0;
    const rivalScore = activeGroup.rivalScore || 15000;

    return (
      <div className="fixed inset-0 z-[70] bg-[#07070D] flex flex-col">
        <div className="gold-line-top" />
        {CallOverlay}
        {MessageActionModal}
        {FullTranslationOverlay}
        {FullMediaOverlay}

        {/* Emoji Blast Floating Celebration */}
        {emojiBlastActive && (
          <div className="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center">
            <div className="text-5xl animate-bounce">🎉👑🔥💥✨</div>
          </div>
        )}

        {/* Group Top Header */}
        <header className="h-16 px-3 bg-[#0B0B10] border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button type="button" onClick={() => setView({ mode: 'list' })} className="w-9 h-9 rounded-full bg-[#1A1A22] text-white flex items-center justify-center shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setView({ mode: 'groupInfo', groupId: activeGroup.id })}
              className="flex items-center gap-2 min-w-0 text-left"
            >
              <img src={activeGroup.avatar} alt={activeGroup.name} className="w-10 h-10 rounded-full object-cover border border-[#FFD700] shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h2 className="text-sm sm:text-base font-bold text-white truncate">{activeGroup.name}</h2>
                  {activeGroup.hasBattleCrown && <Crown className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700] shrink-0" />}
                </div>
                <p className="text-[11px] text-[#9CA3AF] truncate">
                  {activeGroup.members.length} Members · {onlineCount} Online · {activeGroup.groupType}
                </p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSecretMode((s) => !s);
                onNotify(!secretMode ? 'Secret Chat ON (10s Auto-Delete)' : 'Secret Chat OFF');
              }}
              aria-label="Secret Chat"
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                secretMode ? 'bg-rose-600 text-white' : 'bg-[#1A1A22] text-[#9CA3AF]'
              }`}
              title="Secret Chat (10s Auto-Delete)"
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenTranslationSettings}
              aria-label="Translation Settings"
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                translationSettings.autoTranslate
                  ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/45'
                  : 'bg-[#1A1A22] text-[#9CA3AF]'
              }`}
            >
              <Languages className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveCall({ type: 'voice', name: activeGroup.name, avatar: activeGroup.avatar, isGroup: true })}
              aria-label="Group Voice Call (10 People)"
              className="w-8 h-8 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
              title="Group Voice Call (10 People)"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveCall({ type: 'video', name: activeGroup.name, avatar: activeGroup.avatar, isGroup: true })}
              aria-label="Group Video Call (4 People)"
              className="w-8 h-8 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
              title="Group Video Call (4 People)"
            >
              <Video className="w-4 h-4 text-[#FFD700]" />
            </button>
            <button
              type="button"
              onClick={() => setView({ mode: 'groupInfo', groupId: activeGroup.id })}
              aria-label="Group Info"
              className="w-8 h-8 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Interactive Super Group Toolbar: Daily Task + Gift Battle + Secret Screenshot Alert */}
        <div className="bg-[#0D0D15] border-b border-white/10 px-3 py-2 space-y-1.5 shrink-0">
          <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px]">
            {/* Group Daily Task */}
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
              <span className="text-white/90 font-semibold truncate">
                Group Daily Task: {Math.min(100, taskCount)}/100 Msgs (100 Coins)
              </span>
              {taskReady && (
                <button
                  type="button"
                  onClick={() => {
                    playGiftChime();
                    onRewardCoins(100);
                    onUpdateGroup(activeGroup.id, (g) => ({ ...g, dailyTaskClaimed: true }));
                    onNotify('Group Daily Task Complete! +100 Coins Added to Everyone!');
                  }}
                  className="px-2.5 py-0.5 rounded-full gold-gradient text-white font-extrabold text-[10px]"
                >
                  Claim +100
                </button>
              )}
              {activeGroup.dailyTaskClaimed && (
                <span className="text-emerald-400 font-bold text-[10px]">✓ Claimed</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setBattleModalOpen(true)}
                className="px-2.5 py-1 rounded-full bg-purple-600/25 border border-purple-400/50 text-purple-200 font-bold flex items-center gap-1"
              >
                <Swords className="w-3 h-3 text-[#FFD700]" />
                <span>Gift Battle</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sendMessageToGroup(activeGroup.id, {
                    sender: 'system',
                    type: 'system',
                    text: '📸 Screenshot Liya — BiLAL took a screenshot of this chat!',
                  });
                }}
                className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 font-bold flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Screenshot Alert</span>
              </button>
            </div>
          </div>

          {secretMode && (
            <div className="max-w-3xl mx-auto rounded-lg bg-rose-600/20 border border-rose-500/40 px-2.5 py-1 text-[10px] font-bold text-rose-300 flex items-center justify-between">
              <span>🔒 Secret Chat Active — Messages auto-delete in 10 seconds!</span>
              <button type="button" onClick={() => setSecretMode(false)} className="underline text-white">
                Turn Off
              </button>
            </div>
          )}
        </div>

        {/* Sticky Pinned Message Banner in Group Chat */}
        {activeGroup.pinnedMessage && (
          <div className="bg-[#12121A]/95 backdrop-blur-md border-b border-[#FFD700]/35 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={() => jumpToMessage(activeGroup.pinnedMessage!.messageId)}
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
            >
              <div className="w-7 h-7 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/40 flex items-center justify-center shrink-0">
                <Pin className="w-3.5 h-3.5 text-[#FFD700]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#FFD700] leading-tight">
                  Pinned · {activeGroup.pinnedMessage.senderName}
                </p>
                <p className="text-xs text-white/90 truncate">{activeGroup.pinnedMessage.text}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                onUpdateGroup(activeGroup.id, (g) => ({ ...g, pinnedMessage: null }));
                onNotify('Pinned message removed');
              }}
              aria-label="Unpin message"
              className="w-7 h-7 rounded-full bg-white/10 text-white/75 flex items-center justify-center shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Group Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-3xl mx-auto w-full">
          {activeGroup.messages.map((msg) => {
            if (msg.type === 'system') {
              return (
                <div key={msg.id} data-msg-id={msg.id} className="flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-[#1A1A22] border border-[#FFD700]/25 text-[11px] font-semibold text-[#FFD700] flex items-center gap-1.5 text-center">
                    <span>{msg.text}</span>
                  </span>
                </div>
              );
            }

            const isMe = msg.sender === 'me';
            const senderDisplay = msg.senderName || (isMe ? 'BiLAL' : 'Member');
            const isPinnedMsg = activeGroup.pinnedMessage?.messageId === msg.id;
            const tr =
              translationSettings.autoTranslate && msg.type === 'text' && msg.text
                ? translateMessageText(msg.text, language)
                : null;
            const secsLeft = msg.expiresAt ? Math.max(0, Math.ceil((msg.expiresAt - nowTick) / 1000)) : null;

            return (
              <div
                key={msg.id}
                data-msg-id={msg.id}
                className={`flex flex-col transition-colors rounded-2xl ${
                  isMe ? 'items-end' : 'items-start'
                } ${highlightedMsgId === msg.id ? 'bg-[#FFD700]/15 p-1' : ''}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[12px] font-bold text-[#FFD700]">{msg.senderName}</span>
                  {msg.isAdmin && (
                    <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-[9px] font-black text-amber-950 flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5 fill-amber-950" />
                      <span>Admin</span>
                    </span>
                  )}
                  {secsLeft !== null && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold">
                      🔒 {secsLeft}s
                    </span>
                  )}
                </div>

                {msg.type === 'image' && msg.mediaUrl ? (
                  <button
                    type="button"
                    onClick={() => setFullMediaUrl(msg.mediaUrl!)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setMessageActionSheet({ scope: 'group', threadId: activeGroup.id, msg, senderDisplayName: senderDisplay, isCurrentlyPinned: isPinnedMsg });
                    }}
                    className="w-[200px] rounded-2xl overflow-hidden border border-[#FFD700]/40 text-left"
                  >
                    <img src={msg.mediaUrl} alt="Group photo" className="w-full h-36 object-cover" />
                    {msg.text && <p className="p-2 text-xs text-white bg-[#1A1A22]">{msg.text}</p>}
                  </button>
                ) : msg.type === 'video' && msg.mediaUrl ? (
                  <button
                    type="button"
                    onClick={() => setFullMediaUrl(msg.mediaUrl!)}
                    className="relative w-[210px] rounded-2xl overflow-hidden border border-purple-400/50 text-left"
                  >
                    <img src={msg.mediaUrl} alt="Group video" className="w-full h-36 object-cover" />
                    <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </span>
                    <p className="p-2 text-xs text-white bg-[#1A1A22]">{msg.text || 'Shared Video'}</p>
                  </button>
                ) : msg.type === 'voice' ? (
                  <div
                    onPointerDown={() => startLongPress('group', activeGroup.id, msg, senderDisplay, isPinnedMsg)}
                    onPointerUp={cancelLongPress}
                    onPointerLeave={cancelLongPress}
                    className={`w-[210px] p-3 rounded-2xl flex items-center gap-2 ${
                      isMe ? 'gold-gradient' : 'bg-[#1A1A22] border border-white/10'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => playVoiceNote(msg.id)}
                      className="w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center shrink-0"
                    >
                      {playingVoiceId === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 h-1.5 rounded-full bg-white/30" />
                    <span className="text-[11px] font-bold text-white">{msg.duration || '0:05'}</span>
                  </div>
                ) : (
                  <div
                    onPointerDown={() => startLongPress('group', activeGroup.id, msg, senderDisplay, isPinnedMsg)}
                    onPointerUp={cancelLongPress}
                    onPointerLeave={cancelLongPress}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setMessageActionSheet({ scope: 'group', threadId: activeGroup.id, msg, senderDisplayName: senderDisplay, isCurrentlyPinned: isPinnedMsg });
                    }}
                    className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl select-none cursor-pointer ${
                      msg.type === 'blast'
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold'
                        : isMe
                          ? 'gold-gradient text-white'
                          : 'bg-[#1A1A22] text-white'
                    } ${isPinnedMsg ? 'ring-2 ring-[#FFD700]/75' : ''}`}
                  >
                    {isPinnedMsg && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#FFD700] mb-0.5">
                        <Pin className="w-2.5 h-2.5" />
                        <span>Pinned</span>
                      </div>
                    )}

                    {tr && translationSettings.mode === 'onlyTranslation' ? (
                      <button
                        type="button"
                        onClick={() =>
                          setFullTranslationModal({
                            original: msg.text || '',
                            translated: tr.translated,
                            sourceLang: tr.sourceLang,
                          })
                        }
                        className="text-left block w-full"
                      >
                        <p className="text-[15px] leading-snug">{tr.translated}</p>
                        <p className={`text-[10px] mt-1 flex items-center gap-1 ${isMe ? 'text-white/80' : 'text-[#9CA3AF]'}`}>
                          <Languages className="w-3 h-3 shrink-0" />
                          <span>Translated from {tr.sourceLang}</span>
                        </p>
                      </button>
                    ) : (
                      <>
                        <p className="text-[15px] leading-snug">{msg.text}</p>
                        {tr && (
                          <button
                            type="button"
                            onClick={() =>
                              setFullTranslationModal({
                                original: msg.text || '',
                                translated: tr.translated,
                                sourceLang: tr.sourceLang,
                              })
                            }
                            className={`mt-1 pt-1 border-t w-full text-left flex items-start gap-1 ${
                              isMe ? 'border-white/20 text-white/85' : 'border-white/10 text-[#9CA3AF]'
                            }`}
                          >
                            <Languages className="w-3 h-3 mt-0.5 shrink-0" />
                            <span className="text-[11px] leading-snug">{tr.translated}</span>
                          </button>
                        )}
                      </>
                    )}
                    <p className="text-[10px] text-white/70 text-right mt-1">{msg.time}</p>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Group Sticker Tray */}
        {showStickers && (
          <div className="bg-[#1A1A22] border-t border-white/10 p-3 grid grid-cols-8 gap-2 max-w-3xl mx-auto w-full">
            {STICKERS_CATALOG.slice(0, 16).map((st, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  sendMessageToGroup(activeGroup.id, { sender: 'me', type: 'text', text: st });
                  setShowStickers(false);
                }}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {st}
              </button>
            ))}
          </div>
        )}

        {/* Group Input Bar (Text, Voice, Photo, Video, Sticker, Emoji Blast) */}
        <div className="min-h-16 px-3 py-2 bg-[#0B0B10] border-t border-white/10 flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              setEmojiBlastActive(true);
              sendMessageToGroup(activeGroup.id, { sender: 'me', type: 'blast', text: '💥 Emoji Blast! 🎉🔥👑' });
              window.setTimeout(() => setEmojiBlastActive(false), 1600);
            }}
            title="Emoji Blast"
            className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center shrink-0"
          >
            <Flame className="w-4 h-4" />
          </button>

          <div className="flex-1 h-11 px-3 rounded-full bg-[#1A1A22] border border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && messageInput.trim()) {
                  sendMessageToGroup(activeGroup.id, { sender: 'me', type: 'text', text: messageInput.trim() });
                  setMessageInput('');
                }
              }}
              placeholder={secretMode ? 'Secret message (10s)...' : 'Message group...'}
              className="flex-1 bg-transparent text-sm text-white focus:outline-none min-w-0"
            />
            <button type="button" onClick={() => setShowStickers((s) => !s)} className="text-white/75 hover:text-[#FFD700]">
              <Smile className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => sendMessageToGroup(activeGroup.id, { sender: 'me', type: 'voice', duration: '0:05' })}
              className="text-white/75 hover:text-[#FFD700]"
              title="Voice Note"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => sendMessageToGroup(activeGroup.id, { sender: 'me', type: 'image', mediaUrl: IMG_HERO_LIVE, text: 'Group Photo' })}
              className="text-white/75 hover:text-[#FFD700]"
              title="Send Photo"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => sendMessageToGroup(activeGroup.id, { sender: 'me', type: 'video', mediaUrl: IMG_PK_BANNER, text: 'Group Video Clip' })}
              className="text-white/75 hover:text-[#FFD700]"
              title="Send Video"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!messageInput.trim()) return;
              sendMessageToGroup(activeGroup.id, { sender: 'me', type: 'text', text: messageInput.trim() });
              setMessageInput('');
            }}
            className="w-10 h-10 rounded-full gold-gradient text-white flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Group Gift Battle Modal */}
        {battleModalOpen && (
          <div onClick={() => setBattleModalOpen(false)} className="fixed inset-0 z-[105] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-3xl bg-[#14141D] border border-[#FFD700]/55 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#FFD700] flex items-center gap-2">
                  <Swords className="w-5 h-5" />
                  <span>Group Gift Battle</span>
                </h3>
                <button type="button" onClick={() => setBattleModalOpen(false)} className="text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[#0B0B10] space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-[#FFD700]">{activeGroup.name}: {myScore.toLocaleString()}</span>
                  <span className="text-rose-400">{activeGroup.rivalName || 'Rival'}: {rivalScore.toLocaleString()}</span>
                </div>
                <div className="h-3 rounded-full bg-rose-500/40 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, Math.round((myScore / Math.max(1, myScore + rivalScore)) * 100))}%` }}
                    className="h-full gold-gradient transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#9CA3AF]">
                  Jeetne wale Group ko Crown 👑 + Home Banner milega! (Your Coins: {coins.toLocaleString()})
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {GIFTS_CATALOG.slice(0, 6).map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      if (!onSpendCoins(g.cost)) return;
                      playGiftChime();
                      const nextScore = myScore + g.cost;
                      const wonBattle = nextScore >= rivalScore;
                      onUpdateGroup(activeGroup.id, (gr) => ({
                        ...gr,
                        battleScore: nextScore,
                        hasBattleCrown: wonBattle || gr.hasBattleCrown,
                      }));
                      sendMessageToGroup(activeGroup.id, {
                        sender: 'me',
                        type: 'blast',
                        text: `Sent ${g.emoji} ${g.name} (+${g.cost} Battle Points)!`,
                      });
                      if (wonBattle) {
                        onGroupBattleWin(activeGroup.name, nextScore);
                        onNotify(`🏆 ${activeGroup.name} WON Gift Battle! Crown + Home Banner Unlocked!`);
                      } else {
                        onNotify(`+${g.cost} Battle Score for ${activeGroup.name}!`);
                      }
                    }}
                    className="p-2.5 rounded-2xl bg-[#1A1A22] hover:bg-[#252532] border border-white/10 flex flex-col items-center gap-1"
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <span className="text-[11px] font-bold text-white">{g.name}</span>
                    <span className="text-[10px] font-bold text-[#FFD700]">{g.cost}c</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =================== HISSA 10 & 23 FINAL: CHATS LIST + MY/DISCOVER SUPER GROUPS ===================
  const sortedChats = [...chats]
    .filter((c) => !searchQuery.trim() || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const qGroup = groupListSearch.trim().toLowerCase();
  const myGroups = [...groups]
    .filter((g) => g.isJoined !== false)
    .filter((g) => !qGroup || g.name.toLowerCase().includes(qGroup) || (g.city || '').toLowerCase().includes(qGroup))
    .sort((a, b) => ((b.pinned ? 1000 : 0) + (b.activityScore || 0)) - ((a.pinned ? 1000 : 0) + (a.activityScore || 0)));

  const discoverGroups = [...groups]
    .filter((g) => g.isJoined === false)
    .filter((g) => !qGroup || g.name.toLowerCase().includes(qGroup) || (g.city || '').toLowerCase().includes(qGroup) || g.groupType.toLowerCase().includes(qGroup))
    .sort((a, b) => {
      const aCityMatch = a.city === userCity ? 10000 : 0;
      const bCityMatch = b.city === userCity ? 10000 : 0;
      return (bCityMatch + (b.activityScore || 0)) - (aCityMatch + (a.activityScore || 0));
    });

  const handleJoinDiscoverGroup = (grp: GroupChatItem) => {
    if (grp.groupType === 'VIP Only' && vipStatus.level === 0) {
      onNotify('VIP Only Group! Become VIP first to join.');
      return;
    }
    if (grp.groupType === 'Couple' && grp.members.length >= 2) {
      onNotify('Couple Room Full (2/2 Members)');
      return;
    }
    if (grp.groupType === 'Private') {
      if (requestedGroupIds.includes(grp.id)) {
        onNotify('Join Request already sent to Admin!');
        return;
      }
      setRequestedGroupIds((prev) => [...prev, grp.id]);
      onUpdateGroup(grp.id, (g) => ({
        ...g,
        joinRequests: [...(g.joinRequests || []), { id: 'u-me', name: 'BiLAL Shafique2494', avatar: IMG_HOST_MALE }],
      }));
      onNotify(`Join Request sent to ${grp.name} Admin!`);
      return;
    }
    onUpdateGroup(grp.id, (g) => ({
      ...g,
      isJoined: true,
      unreadCount: 0,
      members: g.members.some((m) => m.id === 'u-me')
        ? g.members
        : [{ id: 'u-me', name: 'BiLAL Shafique2494 (You)', avatar: IMG_HOST_MALE, isAdmin: false, online: true }, ...g.members],
    }));
    onNotify(`Joined ${grp.name}!`);
    setView({ mode: 'groupChat', groupId: grp.id });
  };

  const stories = [
    { id: 'st-create', name: 'Create', avatar: IMG_HOST_MALE, isCreate: true },
    { id: 'st-muni', name: 'MUNI DON', avatar: IMG_HOST_FEMALE, active: true },
    { id: 'st-anaya', name: 'Anaya', avatar: IMG_HERO_LIVE, active: true },
    { id: 'st-widget', name: 'Widget', avatar: IMG_MUSIC_PARTY, active: false },
  ];

  return (
    <div className="min-h-screen bg-[#07070D] pb-24">
      <div className="gold-line-top" />

      {/* Top Bar with Prominent "Create Group" Gold Button */}
      <header className="sticky top-0 z-30 bg-[#07070D]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto h-14 px-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-[20px] font-bold text-white">{t(language, 'inbox_title')}</h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
          </div>

          {searchOpen && (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              autoFocus
              className="flex-1 max-w-xs h-9 px-3 rounded-full bg-[#1A1A22] text-sm text-white border border-[#FFD700]/40 focus:outline-none"
            />
          )}

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="Search Inbox"
              className="w-9 h-9 rounded-full bg-[#1A1A22] text-white flex items-center justify-center active:scale-95"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenCoupleRoom}
              className="h-9 px-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-extrabold flex items-center gap-1 shadow active:scale-95"
            >
              <span>💍</span>
              <span className="hidden sm:inline">Couple Room</span>
              <span className="sm:hidden">Couple</span>
            </button>
            <button
              type="button"
              onClick={() => setView({ mode: 'createGroup' })}
              className="h-9 px-3 rounded-full gold-gradient text-white text-xs font-extrabold flex items-center gap-1.5 shadow active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Group</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="px-4 pt-2 flex justify-end">
          <TreasureSpot id="tr-chats" foundIds={treasureFoundIds} onFind={onFindTreasure} label="Inbox Treasure +200c" />
        </div>
        {/* Stories Row */}
        <div className="px-4 py-3 flex items-center gap-4 overflow-x-auto no-scrollbar border-b border-white/5">
          {stories.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStoryViewer({ name: st.name, image: st.avatar })}
              className="flex flex-col items-center gap-1 shrink-0 active:scale-95 transition-transform"
            >
              <div
                className={`relative w-14 h-14 rounded-full p-[2px] ${
                  st.isCreate ? 'bg-[#1A1A22]' : st.active ? 'gold-gradient' : 'bg-white/20'
                }`}
              >
                {st.id === 'st-widget' ? (
                  <div className="w-full h-full rounded-full bg-[#1A1A22] flex items-center justify-center">
                    <LayoutGrid className="w-6 h-6 text-[#9CA3AF]" />
                  </div>
                ) : (
                  <img src={st.avatar} alt={st.name} className="w-full h-full rounded-full object-cover" />
                )}
                {st.isCreate && (
                  <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full gold-gradient text-white flex items-center justify-center border-2 border-[#07070D]">
                    <Plus className="w-3 h-3" />
                  </span>
                )}
                {st.active && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#07070D] animate-pulse" />
                )}
              </div>
              <span className="text-[11px] font-medium text-white/85 truncate max-w-[64px]">{st.name}</span>
            </button>
          ))}
        </div>

        {/* HISSA 23 FINAL: Dedicated Super Groups Section ("My Groups" | "Discover Groups" + Search + City Auto-Suggest) */}
        <div className="bg-[#0B0B10] border-b border-white/10">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setGroupListTab('my')}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold ${
                  groupListTab === 'my' ? 'gold-gradient text-white' : 'bg-[#1A1A22] text-[#9CA3AF]'
                }`}
              >
                My Groups ({myGroups.length})
              </button>
              <button
                type="button"
                onClick={() => setGroupListTab('discover')}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold ${
                  groupListTab === 'discover' ? 'gold-gradient text-white' : 'bg-[#1A1A22] text-[#9CA3AF]'
                }`}
              >
                Discover Groups ({discoverGroups.length})
              </button>
            </div>

            <input
              type="text"
              value={groupListSearch}
              onChange={(e) => setGroupListSearch(e.target.value)}
              placeholder="Search groups..."
              className="h-8 px-3 rounded-full bg-[#1A1A22] text-xs text-white border border-white/10 focus:outline-none focus:border-[#FFD700] w-40"
            />
          </div>

          {groupListTab === 'my' ? (
            myGroups.map((grp) => (
              <button
                key={grp.id}
                type="button"
                onClick={() => {
                  onUpdateGroup(grp.id, (g) => ({ ...g, unreadCount: 0 }));
                  setView({ mode: 'groupChat', groupId: grp.id });
                }}
                className="w-full min-h-[72px] px-4 py-2 flex items-center justify-between gap-3 hover:bg-white/[0.03] border-l-[3px] border-[#FFD700] text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-13 h-13 rounded-full p-[2px] gold-gradient shrink-0">
                    <img src={grp.avatar} alt={grp.name} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[15px] font-bold text-white truncate">{grp.name}</span>
                      {grp.hasBattleCrown && <Crown className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]" />}
                      <span className="px-1.5 py-0.5 rounded bg-[#7C3AED] text-[9px] font-bold text-white uppercase">
                        {grp.groupType}
                      </span>
                      {grp.pinned && <Pin className="w-3 h-3 text-[#FFD700]" />}
                    </div>
                    <p className="text-[12px] text-[#9CA3AF] truncate">
                      {grp.members.length}/{grp.maxMembers || 500} · {grp.messages[grp.messages.length - 1]?.text || 'Tap to chat'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(grp.unreadCount || 0) > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {grp.unreadCount}
                    </span>
                  )}
                  <Users className="w-4 h-4 text-[#FFD700]" />
                </div>
              </button>
            ))
          ) : (
            discoverGroups.map((grp) => {
              const isCitySuggested = grp.city === userCity;
              const reqSent = requestedGroupIds.includes(grp.id);
              return (
                <div
                  key={grp.id}
                  className={`w-full px-4 py-2.5 flex items-center justify-between gap-3 border-t border-white/5 ${
                    isCitySuggested ? 'bg-amber-500/10 border-l-[3px] border-l-[#FFD700]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={grp.avatar} alt={grp.name} className="w-12 h-12 rounded-full object-cover border border-[#FFD700]/50 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-white truncate">{grp.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold text-[#FFD700]">
                          {grp.groupType}
                        </span>
                        {isCitySuggested && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>Suggested ({userCity})</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#9CA3AF] truncate">
                        {grp.members.length}/{grp.maxMembers || 500} Members · {grp.description}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleJoinDiscoverGroup(grp)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold shrink-0 ${
                      reqSent ? 'bg-[#26262F] text-[#9CA3AF]' : 'gold-gradient text-white'
                    }`}
                  >
                    {reqSent ? 'Requested' : grp.groupType === 'Private' ? 'Request' : 'Join'}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Full Width 1v1 Normal Chat List (Preserved Unchanged) */}
        <div className="bg-[#0B0B10] divide-y divide-white/5">
          {sortedChats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => {
                triggerHaptic();
                onUpdateChat(chat.id, (c) => ({ ...c, unreadCount: 0 }));
                setView({ mode: 'chat', chatId: chat.id });
              }}
              className={`w-full h-[72px] px-4 flex items-center justify-between gap-3 hover:bg-white/[0.03] transition-colors text-left ${
                chat.isOnline ? 'border-l-[3px] border-[#FFD700]' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative w-14 h-14 rounded-full shrink-0">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className={`w-full h-full rounded-full object-cover ${
                      chat.isStoryActive ? 'ring-2 ring-[#FFD700]' : ''
                    }`}
                  />
                  {chat.isOnline && (
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0B0B10]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[16px] font-bold text-white truncate">{chat.name}</span>
                    <span className="text-[11px] text-[#888888] shrink-0">{chat.time}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {chat.hasMic && <Mic className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />}
                    <p className="text-[13px] text-[#9CA3AF] truncate">{chat.lastMessage}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {chat.unreadCount && chat.unreadCount > 0 ? (
                  <span
                    className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                      chat.unreadColor === 'yellow'
                        ? 'bg-yellow-400 text-black'
                        : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                    }`}
                  >
                    {chat.unreadCount}
                  </span>
                ) : null}

                {chat.rightIcon === 'camera' && <Camera className="w-5 h-5 text-[#9CA3AF]" />}
                {chat.rightIcon === 'bell' && <Bell className="w-5 h-5 text-[#FFD700]" />}
                {chat.rightIcon === 'chevron' && <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />}
                {chat.rightIcon === 'tick' && <Check className="w-4 h-4 text-[#9CA3AF]" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Story Modal */}
      {storyViewer && (
        <div
          onClick={() => setStoryViewer(null)}
          className="fixed inset-0 z-[95] bg-black/95 flex flex-col items-center justify-center p-4"
        >
          <div className="w-full max-w-sm rounded-3xl overflow-hidden border border-[#FFD700]/45 relative">
            <img src={storyViewer.image} alt={storyViewer.name} className="w-full h-[70vh] object-cover" />
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-black/60 text-sm font-bold text-white">{storyViewer.name}</span>
              <button type="button" onClick={() => setStoryViewer(null)} className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
