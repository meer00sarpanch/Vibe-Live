import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { BottomBar } from './components/BottomBar';
import { ChatsSystem } from './components/ChatsSystem';
import { CountryLanguageModal } from './components/CountryLanguageModal';
import { CreateVideoStudio } from './components/CreateVideoStudio';
import { EffectsOverlay } from './components/EffectsOverlay';
import { ExplorePage } from './components/ExplorePage';
import { GoLiveSheet } from './components/GoLiveSheet';
import { HomePage } from './components/HomePage';
import { HomeTopBar } from './components/HomeTopBar';
import { LeaderboardPage } from './components/LeaderboardPage';
import { LiveStreamModal, RandomMatchModal, VideoViewerModal } from './components/LiveStreamModal';
import { MeProfile } from './components/MeProfile';
import { OtherProfile } from './components/OtherProfile';
import { PartySystem } from './components/PartySystem';
import { RechargePage } from './components/RechargePage';
import {
  DailyTasksModal,
  HOST_SALARY_LEVELS,
  RewardedAdModal,
  StreamerCenterModal,
} from './components/TasksAndAdsModal';
import {
  BirthdaysModal,
  CoupleRoomModal,
  MarriedCouplesModal,
  ProposeModal,
} from './components/ShadiCoupleBirthdayModals';
import {
  DailyCheckInModal,
  InteractiveCoinRainOverlay,
  LuckySpinModal,
  MysteryBoxModal,
} from './components/LuckyMysteryCoinRainModals';
import {
  ChallengeCompletePopup,
  DailyChallengesPageModal,
  DailyKingsModal,
  LuckyNumberModal,
  ReferralKingModal,
  WeeklyQueensModal,
} from './components/KingQueenReferralModals';
import { LoginSignupModal, SplashOverlay } from './components/VibeLiveBrand';
import { VipKingdomPage } from './components/VipKingdomPage';
import {
  DAILY_CHECKIN_DAYS,
  HANIA_PROFILE,
  IMG_HOST_FEMALE,
  IMG_HOST_MALE,
  INITIAL_BIRTHDAYS_TODAY,
  INITIAL_BOX_HISTORY,
  INITIAL_CHATS,
  INITIAL_DAILY_CHALLENGES,
  INITIAL_DAILY_KINGS,
  INITIAL_DAILY_TASKS,
  INITIAL_GROUPS,
  INITIAL_HOST_TASKS,
  INITIAL_MARRIED_COUPLES,
  INITIAL_PARTY_ROOMS,
  INITIAL_REFERRAL_FRIENDS,
  INITIAL_STREAMS,
  INITIAL_VIDEOS,
  INITIAL_WEEKLY_QUEENS,
} from './data/mockData';
import {
  AppLanguage,
  BirthdayState,
  ChatThread,
  CountryInfo,
  CoupleRoomState,
  DailyChallengeItem,
  DailyCheckInState,
  DailyTaskItem,
  GiftItem,
  GroupChatItem,
  HostSalaryState,
  HostTaskItem,
  KingQueenEntry,
  LiveStreamItem,
  LuckySpinState,
  MainTab,
  MarriedCoupleEntry,
  MysteryBoxHistoryItem,
  ReferralKingState,
  ShadiState,
  ShortVideoItem,
  TranslationSettings,
  VipStatus,
} from './types/mehfil';
import { playGiftChime, triggerHaptic } from './utils/haptics';
import { COUNTRIES_LIST } from './utils/i18n';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [coins, setCoins] = useState(850);
  const [points, setPoints] = useState(0);
  const [profilePercent, setProfilePercent] = useState(60);
  const [bellCount, setBellCount] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');

  // HISSA 21: VIP Status (Strictly NOT VIP until purchased!)
  const [vipStatus, setVipStatus] = useState<VipStatus>({
    level: 0,
    daysLeft: 0,
    hasGuardian: false,
  });

  // HISSA 22: Ads + Daily Tasks + Host Daily Tasks
  const [adsWatchedToday, setAdsWatchedToday] = useState(0);
  const [adModalState, setAdModalState] = useState<{ open: boolean; reward: number; source: 'home' | 'recharge' }>({
    open: false,
    reward: 10,
    source: 'home',
  });
  const [dailyTasks, setDailyTasks] = useState<DailyTaskItem[]>(INITIAL_DAILY_TASKS);
  const [allDailyBonusClaimed, setAllDailyBonusClaimed] = useState(false);
  const [hostTasks, setHostTasks] = useState<HostTaskItem[]>(INITIAL_HOST_TASKS);

  // HISSA 22 FINAL: Host Salary + 1 Month Free State
  const [hostState, setHostState] = useState<HostSalaryState>({
    joined: false,
    isFirstMonthFree: true,
    selectedLevel: 2,
    weekStarted: false,
    todayLiveSeconds: 0,
    weeklyLiveSeconds: 0,
    weeklyGiftCoins: 0,
    monthStreakDays: 0,
    monthTotalHours: 0,
    monthGiftCoins: 0,
    claimedMonthBonuses: [],
    salaryWalletPkr: 0,
    giftWalletPkr: 0,
    withdrawals: [],
    firstMonthDaysLeft: 30,
    recruitedHosts: [],
    isAgency: false,
    agencyEarningsPkr: 0,
  });

  // HISSA 23 & 24: Coins Recharge + First Recharge Double
  const [isFirstRecharge, setIsFirstRecharge] = useState(true);

  // HISSA 25: Worldwide Country, Language & Real-Time Translation Settings
  const [country, setCountry] = useState<CountryInfo>(() => {
    try {
      const saved = localStorage.getItem('vibelive_country');
      if (saved) {
        const parsed = JSON.parse(saved) as CountryInfo;
        const matched = COUNTRIES_LIST.find((c) => c.code === parsed.code);
        if (matched) return matched;
      }
    } catch {
      // ignore storage errors
    }
    return COUNTRIES_LIST[0];
  });
  const [language, setLanguage] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('vibelive_language') as AppLanguage | null;
      if (saved) return saved;
    } catch {
      // ignore storage errors
    }
    return 'English';
  });
  const [translationSettings, setTranslationSettings] = useState<TranslationSettings>(() => {
    try {
      const saved = localStorage.getItem('vibelive_tr_settings');
      if (saved) return JSON.parse(saved) as TranslationSettings;
    } catch {
      // ignore storage errors
    }
    return {
      autoTranslate: true,
      mode: 'both',
    };
  });

  // Collections
  const [streams] = useState<LiveStreamItem[]>(INITIAL_STREAMS);
  const [videos, setVideos] = useState<ShortVideoItem[]>(INITIAL_VIDEOS);
  const [chats, setChats] = useState<ChatThread[]>(INITIAL_CHATS);
  const [groups, setGroups] = useState<GroupChatItem[]>(INITIAL_GROUPS);
  const [partyRooms, setPartyRooms] = useState(INITIAL_PARTY_ROOMS);

  // Overlays & Modals
  const [goLiveSheetOpen, setGoLiveSheetOpen] = useState(false);
  const [cameraStudioOpen, setCameraStudioOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [otherProfileOpen, setOtherProfileOpen] = useState(false);
  const [activeStream, setActiveStream] = useState<{ stream: LiveStreamItem; isBroadcaster?: boolean } | null>(null);
  const [activeVideo, setActiveVideo] = useState<ShortVideoItem | null>(null);
  const [randomMatchOpen, setRandomMatchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [exploreSubTab, setExploreSubTab] = useState<'explore' | 'party'>('explore');
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [dailyTasksOpen, setDailyTasksOpen] = useState(false);
  const [streamerCenterOpen, setStreamerCenterOpen] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countryModalTab, setCountryModalTab] = useState<'country' | 'language' | 'translate'>('country');
  const [isOnboardingWorld, setIsOnboardingWorld] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // Party & Chat full-screen state
  const [activePartyRoomId, setActivePartyRoomId] = useState<string | null>(null);
  const [partyPkInitial, setPartyPkInitial] = useState(false);
  const [chatFullScreen, setChatFullScreen] = useState(false);
  const [externalOpenChatId, setExternalOpenChatId] = useState<string | null>(null);

  // HISSA 24 FINAL: Shadi + Couple Room + Birthday Blast
  const [shadi, setShadi] = useState<ShadiState>({
    isMarried: false,
    partnerName: 'Hania Khan',
    partnerHandle: '@its_haniya__1',
    partnerAvatar: IMG_HOST_FEMALE,
    marriedDate: '17 Nov 2026',
    popularScore: 68500,
    divorcePending: false,
    divorceDaysLeft: 7,
  });
  const [marriedCouples, setMarriedCouples] = useState<MarriedCoupleEntry[]>(INITIAL_MARRIED_COUPLES);
  const [coupleRoom, setCoupleRoom] = useState<CoupleRoomState>({
    talkSecondsToday: 0,
    dailyRewardClaimed: false,
    streakDays: 3,
    activeSongIndex: 0,
    isPlayingSong: false,
    movieScreenShare: false,
    messages: [
      { id: 'cm-1', sender: 'other', type: 'text', text: 'Assalam o Alaikum! Only we two can see this room 💖', time: '9:00 PM' },
    ],
  });
  const [birthdayState, setBirthdayState] = useState<BirthdayState>({
    myBirthDate: '1999-11-17',
    isMyBirthdayToday: true,
    birthdayBonusClaimed: false,
    tomorrowReminderSent: false,
    birthdaysToday: INITIAL_BIRTHDAYS_TODAY,
  });
  const [proposeOpen, setProposeOpen] = useState(false);
  const [marriedCouplesOpen, setMarriedCouplesOpen] = useState(false);
  const [coupleRoomOpen, setCoupleRoomOpen] = useState(false);
  const [birthdaysOpen, setBirthdaysOpen] = useState(false);

  // HISSA 25 FINAL: Lucky Spin + Mystery Box + Coin Rain + Daily Check-In + Treasure Hunt
  const [luckySpinState, setLuckySpinState] = useState<LuckySpinState>({
    spinsUsedToday: 0,
    extraSpinsEarned: 0,
    tickerFeed: [
      'Bilal Ne 5,000 Coins Jeete 🎉',
      'Ayesha Ne VIP Frame 1 Din Jeeta 👑',
      'Hamza Ne 1,000 Coins Jeete 🪙',
    ],
  });
  const [boxHistory, setBoxHistory] = useState<MysteryBoxHistoryItem[]>(INITIAL_BOX_HISTORY);
  const [dailyCheckInState, setDailyCheckInState] = useState<DailyCheckInState>({
    streakDay: 1,
    claimedToday: false,
    treasureFoundIds: [],
  });
  const [luckySpinOpen, setLuckySpinOpen] = useState(false);
  const [mysteryBoxOpen, setMysteryBoxOpen] = useState(false);
  const [dailyCheckInOpen, setDailyCheckInOpen] = useState(false);
  const [dailyPopupShownOnce, setDailyPopupShownOnce] = useState(false);
  const [interactiveCoinRainActive, setInteractiveCoinRainActive] = useState(false);
  const [extraNotifications, setExtraNotifications] = useState<{ title: string; body: string }[]>([]);

  // HISSA 27 FINAL: Daily King / Weekly Queen + Referral King + Lucky Number 5353 + Daily Challenge
  const [dailyKings, setDailyKings] = useState<KingQueenEntry[]>(INITIAL_DAILY_KINGS);
  const [dailyKingPrizeClaimed, setDailyKingPrizeClaimed] = useState(false);
  const [dailyKingsOpen, setDailyKingsOpen] = useState(false);
  const [weeklyQueens] = useState<KingQueenEntry[]>(INITIAL_WEEKLY_QUEENS);
  const [weeklyQueensOpen, setWeeklyQueensOpen] = useState(false);
  const [referralState, setReferralState] = useState<ReferralKingState>({
    code: 'BILAL123',
    link: 'http://vibelive.com/invite/BILAL123',
    friends: INITIAL_REFERRAL_FRIENDS,
    referralKingBonusClaimed: false,
  });
  const [referralOpen, setReferralOpen] = useState(false);
  const [luckyNumber, setLuckyNumber] = useState(5353);
  const [luckyNumberClaimed, setLuckyNumberClaimed] = useState(false);
  const [luckyNumberOpen, setLuckyNumberOpen] = useState(false);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallengeItem[]>(INITIAL_DAILY_CHALLENGES);
  const [dailyChallengesOpen, setDailyChallengesOpen] = useState(false);
  const [completedChallengePopup, setCompletedChallengePopup] = useState<{ title: string; rewardCoins: number } | null>(null);

  // Global PRO MAX Effects (HISSA 20 + 24)
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [coinRainTrigger, setCoinRainTrigger] = useState(0);
  const [heartRainTrigger, setHeartRainTrigger] = useState(0);
  const [balloonTrigger, setBalloonTrigger] = useState(0);
  const [bigGift, setBigGift] = useState<{ emoji: string; name: string; sender: string } | null>(null);
  const [winningGroupBanner, setWinningGroupBanner] = useState<{ groupName: string; score: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => {
      setToast((cur) => (cur === msg ? null : cur));
    }, 2400);
  }, []);

  const triggerConfetti = useCallback(() => {
    setConfettiTrigger((c) => c + 1);
  }, []);

  const triggerCoinRain = useCallback(() => {
    setCoinRainTrigger((c) => c + 1);
  }, []);

  const triggerHeartRain = useCallback(() => {
    setHeartRainTrigger((c) => c + 1);
  }, []);

  const triggerBalloons = useCallback(() => {
    setBalloonTrigger((c) => c + 1);
  }, []);

  const handleFindTreasure = useCallback(
    (treasureId: string) => {
      if (dailyCheckInState.treasureFoundIds.includes(treasureId)) return;
      setDailyCheckInState((prev) => ({
        ...prev,
        treasureFoundIds: [...prev.treasureFoundIds, treasureId],
      }));
      setCoins((c) => c + 200);
      triggerCoinRain();
      triggerConfetti();
      showToast(`Treasure Found! +200 Coins Added (${dailyCheckInState.treasureFoundIds.length + 1}/5)`);
    },
    [dailyCheckInState.treasureFoundIds, triggerCoinRain, triggerConfetti, showToast]
  );

  const advanceDailyTask = useCallback((taskId: string, delta = 1) => {
    setDailyTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, progress: Math.min(t.target, t.progress + delta) } : t))
    );
  }, []);

  const advanceHostTask = useCallback((taskId: string, delta = 1) => {
    setHostTasks((prev) =>
      prev.map((ht) => (ht.id === taskId ? { ...ht, progress: Math.min(ht.target, ht.progress + delta) } : ht))
    );
  }, []);

  const handleBroadcasterSecondTick = useCallback(() => {
    setHostState((prev) => ({
      ...prev,
      todayLiveSeconds: prev.todayLiveSeconds + 1,
      weeklyLiveSeconds: prev.weeklyLiveSeconds + 1,
      monthTotalHours: prev.monthTotalHours + 1 / 3600,
    }));
  }, []);

  const triggerChallengeReward = useCallback(
    (title: string, rewardCoins: number) => {
      setCoins((c) => c + rewardCoins);
      triggerConfetti();
      triggerCoinRain();
      setCompletedChallengePopup({ title, rewardCoins });
    },
    [triggerConfetti, triggerCoinRain]
  );

  const advanceChallengeByType = useCallback(
    (actionType: DailyChallengeItem['actionType'], delta = 1) => {
      setDailyChallenges((prev) =>
        prev.map((ch) => {
          if (ch.actionType !== actionType || ch.completed) return ch;
          const nextProg = Math.min(ch.target, ch.progress + delta);
          if (nextProg >= ch.target) {
            triggerChallengeReward(ch.title, ch.rewardCoins);
            return { ...ch, progress: nextProg, completed: true };
          }
          return { ...ch, progress: nextProg };
        })
      );
    },
    [triggerChallengeReward]
  );

  const advanceChallengeById = useCallback(
    (challengeId: string, delta = 1) => {
      setDailyChallenges((prev) =>
        prev.map((ch) => {
          if (ch.id !== challengeId || ch.completed) return ch;
          const nextProg = Math.min(ch.target, ch.progress + delta);
          if (nextProg >= ch.target) {
            triggerChallengeReward(ch.title, ch.rewardCoins);
            return { ...ch, progress: nextProg, completed: true };
          }
          return { ...ch, progress: nextProg };
        })
      );
    },
    [triggerChallengeReward]
  );

  const handleSendGift = useCallback(
    (gift: GiftItem, recipient: string) => {
      if (coins < gift.cost) {
        showToast('Low Coins! Recharge to send more gifts');
        setRechargeOpen(true);
        return;
      }
      setCoins((c) => c - gift.cost);
      setPoints((p) => p + Math.round(gift.cost * 0.5));
      advanceDailyTask('dt-gift', 1);
      advanceHostTask('ht-gifts', gift.cost);
      advanceChallengeByType('gift', 1);
      setDailyKings((prev) =>
        prev
          .map((k) => (k.isUser ? { ...k, coins: k.coins + gift.cost } : k))
          .sort((a, b) => b.coins - a.coins)
          .map((k, idx) => ({ ...k, rank: idx + 1 }))
      );
      if (hostState.joined && (recipient === 'BiLAL Shafique2494' || activeStream?.isBroadcaster)) {
        setHostState((prev) => ({
          ...prev,
          weeklyGiftCoins: prev.weeklyGiftCoins + gift.cost,
          monthGiftCoins: prev.monthGiftCoins + gift.cost,
        }));
      }
      playGiftChime();
      triggerCoinRain();
      setBigGift({ emoji: gift.emoji, name: `${gift.name} → ${recipient}`, sender: 'BiLAL' });
      window.setTimeout(() => setBigGift(null), 2200);
    },
    [coins, hostState.joined, activeStream?.isBroadcaster, showToast, triggerCoinRain, advanceDailyTask, advanceHostTask, advanceChallengeByType]
  );

  const handlePublishVideo = useCallback(
    (newVideo: ShortVideoItem) => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setVideos((prev) => [newVideo, ...prev]);
        setCameraStudioOpen(false);
        setActiveTab('me');
        triggerConfetti();
        showToast('Posted Successfully');
      }, 500);
    },
    [showToast, triggerConfetti]
  );

  const handleCompleteProfile = useCallback(() => {
    if (profilePercent >= 100) {
      showToast('Profile already 100% completed!');
      return;
    }
    setProfilePercent(100);
    setCoins((c) => c + 100);
    triggerConfetti();
    triggerCoinRain();
    showToast('Profile 100% Complete! +100 Coins Added');
  }, [profilePercent, showToast, triggerConfetti, triggerCoinRain]);

  const handleCreatePartyRoom = useCallback(() => {
    const newId = `party-user-${Date.now()}`;
    setPartyRooms((prev) => [
      {
        id: newId,
        name: "BiLAL's Royal Vibe Live",
        hostName: 'BiLAL Shafique2494',
        cover: INITIAL_STREAMS[0].cover,
        country: 'Pakistan',
        flag: country.flag,
        tag: 'Make Friends',
        seatCount: 1,
        viewers: '124',
        isFollowing: true,
        pkActive: false,
      },
      ...prev,
    ]);
    setActiveTab('explore');
    setExploreSubTab('party');
    setPartyPkInitial(false);
    setActivePartyRoomId(newId);
    showToast('Party Room Created!');
  }, [showToast, country.flag]);

  const unreadChatsBadge = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0) > 0 ? 2 : 0;
  const unclaimedTasksCount = dailyTasks.filter((t) => !t.claimed && t.progress >= t.target).length;

  const hideBottomBar =
    chatFullScreen ||
    activePartyRoomId !== null ||
    cameraStudioOpen ||
    leaderboardOpen ||
    otherProfileOpen ||
    activeStream !== null ||
    activeVideo !== null ||
    rechargeOpen ||
    dailyTasksOpen ||
    streamerCenterOpen ||
    countryModalOpen ||
    coupleRoomOpen ||
    marriedCouplesOpen ||
    birthdaysOpen ||
    dailyChallengesOpen;

  const openWorldModal = useCallback((tab: 'country' | 'language' | 'translate' = 'country', onboarding = false) => {
    setCountryModalTab(tab);
    setIsOnboardingWorld(onboarding);
    setCountryModalOpen(true);
  }, []);

  const updateTranslationSettings = useCallback(
    (next: TranslationSettings) => {
      setTranslationSettings(next);
      try {
        localStorage.setItem('vibelive_tr_settings', JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      showToast(next.autoTranslate ? 'Auto-Translate ON ✨' : 'Auto-Translate OFF');
    },
    [showToast]
  );

  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
    try {
      if (!localStorage.getItem('vibelive_world_setup')) {
        openWorldModal('country', true);
      } else if (!dailyPopupShownOnce) {
        setDailyPopupShownOnce(true);
        window.setTimeout(() => setDailyCheckInOpen(true), 450);
      }
    } catch {
      // ignore storage errors
    }
  }, [openWorldModal, dailyPopupShownOnce]);

  return (
    <div className="min-h-screen bg-[#07070D] text-white relative">
      {!splashDone && <SplashOverlay onFinish={handleSplashFinish} />}

      {/* Global Animations & Effects (HISSA 20 + 24) */}
      <EffectsOverlay
        confettiTrigger={confettiTrigger}
        coinRainTrigger={coinRainTrigger}
        heartRainTrigger={heartRainTrigger}
        balloonTrigger={balloonTrigger}
        bigGift={bigGift}
        toast={toast}
        loading={loading}
      />

      {/* HISSA 1: Home Top Bar Fixed on Home Page Only */}
      {activeTab === 'home' && !hideBottomBar && (
        <HomeTopBar
          coins={coins}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          bellCount={bellCount}
          country={country}
          language={language}
          unclaimedTasksCount={unclaimedTasksCount}
          onBellClick={() => {
            setBellCount(0);
            setNotificationsOpen(true);
          }}
          onCoinsClick={() => setRechargeOpen(true)}
          onAvatarClick={() => setActiveTab('me')}
          onCountryClick={() => openWorldModal('country', false)}
          onTasksClick={() => setDailyTasksOpen(true)}
        />
      )}

      {/* Main Tab Views with Smooth Slide Animation */}
      <AnimatePresence mode="wait">
        <motion.main
          key={activeTab}
          initial={{ opacity: 0.75, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0.75 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'home' && (
            <HomePage
              streams={streams}
              videos={videos}
              searchQuery={searchQuery}
              vipStatus={vipStatus}
              language={language}
              shadi={shadi}
              birthdayState={birthdayState}
              luckySpinState={luckySpinState}
              dailyCheckInState={dailyCheckInState}
              dailyKing={dailyKings[0]}
              weeklyQueen={weeklyQueens[0]}
              luckyNumber={luckyNumber}
              luckyClaimed={luckyNumberClaimed}
              dailyChallenges={dailyChallenges}
              referralFriendsCount={referralState.friends.filter((f) => f.isRealAccount).length}
              winningGroupBanner={winningGroupBanner}
              onJoinStream={(stream) => {
                advanceDailyTask('dt-live', 5);
                advanceChallengeByType('rooms', 1);
                advanceChallengeByType('watchLive', 15);
                setActiveStream({ stream });
              }}
              onOpenVideo={(video) => {
                advanceDailyTask('dt-video', 1);
                setActiveVideo(video);
              }}
              onOpenHostProfile={() => setOtherProfileOpen(true)}
              onOpenRandomMatch={() => setRandomMatchOpen(true)}
              onOpenLeaderboard={() => setLeaderboardOpen(true)}
              onWatchHomeAd={() => setAdModalState({ open: true, reward: 10, source: 'home' })}
              onOpenVipStore={() => setActiveTab('vip')}
              onOpenLuckySpin={() => setLuckySpinOpen(true)}
              onOpenMysteryBox={() => setMysteryBoxOpen(true)}
              onOpenDailyCheckIn={() => setDailyCheckInOpen(true)}
              onTriggerCoinRainNow={() => setInteractiveCoinRainActive(true)}
              onNotifyCoinRain5Min={() => {
                setBellCount((b) => b + 1);
                setExtraNotifications((prev) => [
                  { title: 'Coin Rain Reminder 🌧️', body: '5 Minute Baad Coin Rain Aane Wali Hai, Room Me Aa Jao!' },
                  ...prev,
                ]);
                showToast('5 Minute Baad Coin Rain Aane Wali Hai, Room Me Aa Jao!');
              }}
              onOpenBirthdays={() => setBirthdaysOpen(true)}
              onOpenMarriedCouples={() => setMarriedCouplesOpen(true)}
              onOpenCoupleRoom={() => setCoupleRoomOpen(true)}
              onOpenDailyKings={() => setDailyKingsOpen(true)}
              onOpenWeeklyQueens={() => setWeeklyQueensOpen(true)}
              onOpenReferralKing={() => setReferralOpen(true)}
              onOpenLuckyNumber={() => setLuckyNumberOpen(true)}
              onOpenDailyChallenges={() => setDailyChallengesOpen(true)}
              onFindTreasure={handleFindTreasure}
              onPullRefresh={() => {
                triggerConfetti();
                showToast('Feed Refreshed ✨');
              }}
            />
          )}

          {activeTab === 'explore' && (
            <ExplorePage
              videos={videos}
              rooms={partyRooms}
              coins={coins}
              language={language}
              translationSettings={translationSettings}
              treasureFoundIds={dailyCheckInState.treasureFoundIds}
              onFindTreasure={handleFindTreasure}
              subTab={exploreSubTab}
              onChangeSubTab={setExploreSubTab}
              onBack={() => setActiveTab('home')}
              onOpenLeaderboard={() => setLeaderboardOpen(true)}
              onOpenVideo={(video) => {
                advanceDailyTask('dt-video', 1);
                setActiveVideo(video);
              }}
              onOpenProfile={() => setOtherProfileOpen(true)}
              onCollectPrize={() => {
                setCoins((c) => c + 100);
                triggerConfetti();
                triggerCoinRain();
                showToast('Prize Collected! +100 Coins');
              }}
              onEnterRoom={(roomId, pk) => {
                advanceDailyTask('dt-live', 5);
                advanceChallengeByType('rooms', 1);
                advanceChallengeByType('watchLive', 15);
                if (pk) advanceHostTask('ht-pk', 1);
                setPartyPkInitial(!!pk);
                setActivePartyRoomId(roomId);
              }}
              onCreatePartyRoom={handleCreatePartyRoom}
              onSendGift={handleSendGift}
              onFirstRecharge={() => setRechargeOpen(true)}
              onOpenTranslationSettings={() => openWorldModal('translate', false)}
              onNotify={showToast}
            />
          )}

          {activeTab === 'chats' && (
            <ChatsSystem
              chats={chats}
              groups={groups}
              language={language}
              translationSettings={translationSettings}
              vipStatus={vipStatus}
              userCity="Lahore"
              coins={coins}
              treasureFoundIds={dailyCheckInState.treasureFoundIds}
              onFindTreasure={handleFindTreasure}
              onOpenCoupleRoom={() => setCoupleRoomOpen(true)}
              onSpendCoins={(cost) => {
                if (coins < cost) {
                  showToast('Low Coins! Recharge first');
                  setRechargeOpen(true);
                  return false;
                }
                setCoins((c) => c - cost);
                return true;
              }}
              onRewardCoins={(amt) => {
                setCoins((c) => c + amt);
                triggerCoinRain();
              }}
              onGroupBattleWin={(groupName, score) => {
                setWinningGroupBanner({ groupName, score });
                triggerConfetti();
                triggerCoinRain();
              }}
              onOpenTranslationSettings={() => openWorldModal('translate', false)}
              onUpdateChat={(chatId, updater) =>
                setChats((prev) => prev.map((c) => (c.id === chatId ? updater(c) : c)))
              }
              onAddGroup={(grp) => setGroups((prev) => [grp, ...prev])}
              onUpdateGroup={(groupId, updater) =>
                setGroups((prev) => prev.map((g) => (g.id === groupId ? updater(g) : g)))
              }
              onLeaveGroup={(groupId) => setGroups((prev) => prev.filter((g) => g.id !== groupId))}
              onOpenProfile={() => setOtherProfileOpen(true)}
              onFullScreenToggle={setChatFullScreen}
              onNotify={showToast}
              externalOpenChatId={externalOpenChatId}
              onClearExternalOpen={() => setExternalOpenChatId(null)}
            />
          )}

          {activeTab === 'vip' && (
            <VipKingdomPage
              coins={coins}
              vipStatus={vipStatus}
              country={country}
              treasureFoundIds={dailyCheckInState.treasureFoundIds}
              onFindTreasure={handleFindTreasure}
              onBuyNextVipLevel={(lvlInfo) => {
                if (lvlInfo.level !== vipStatus.level + 1 || coins < lvlInfo.extraCoins) {
                  return false;
                }
                setCoins((c) => c - lvlInfo.extraCoins);
                setVipStatus((prev) => ({
                  ...prev,
                  level: lvlInfo.level,
                  daysLeft: prev.daysLeft + 30,
                  hasGuardian: lvlInfo.level >= 3 || prev.hasGuardian,
                  equippedFrameLevel: lvlInfo.level,
                }));
                triggerConfetti();
                triggerCoinRain();
                showToast(`${lvlInfo.name} Unlocked! 👑`);
                return true;
              }}
              onEquipFrame={(frameLevel) => {
                setVipStatus((prev) => ({
                  ...prev,
                  equippedFrameLevel: frameLevel,
                }));
              }}
              onOpenRecharge={() => setRechargeOpen(true)}
              onNotify={showToast}
            />
          )}

          {activeTab === 'me' && (
            <MeProfile
              coins={coins}
              points={points}
              profilePercent={profilePercent}
              vipStatus={vipStatus}
              hostState={hostState}
              shadi={shadi}
              birthdayState={birthdayState}
              treasureFoundIds={dailyCheckInState.treasureFoundIds}
              country={country}
              language={language}
              translationSettings={translationSettings}
              unclaimedTasksCount={unclaimedTasksCount}
              myVideos={videos.filter((v) => v.isUserCreated)}
              onCompleteProfile={handleCompleteProfile}
              onFirstRecharge={() => setRechargeOpen(true)}
              onOpenVipStore={() => setActiveTab('vip')}
              onOpenDailyTasks={() => setDailyTasksOpen(true)}
              onOpenStreamerCenter={() => setStreamerCenterOpen(true)}
              onBecomeHost={() => {
                setHostState((prev) => ({
                  ...prev,
                  joined: true,
                  isFirstMonthFree: true,
                  firstMonthDaysLeft: 30,
                }));
                triggerConfetti();
                showToast('Welcome Vibe Live Host! 1 Month Free Activated (0 Rs Fee)');
                setStreamerCenterOpen(true);
              }}
              onOpenPartnerProfile={() => setOtherProfileOpen(true)}
              onOpenCoupleRoom={() => setCoupleRoomOpen(true)}
              onOpenMarriedCouples={() => setMarriedCouplesOpen(true)}
              onOpenBirthdays={() => setBirthdaysOpen(true)}
              onOpenDailyChallenges={() => setDailyChallengesOpen(true)}
              onOpenReferralKing={() => setReferralOpen(true)}
              onOpenDailyKings={() => setDailyKingsOpen(true)}
              onOpenLuckyNumber={() => setLuckyNumberOpen(true)}
              onRequestDivorce={() => {
                setShadi((prev) => ({ ...prev, divorcePending: true, divorceDaysLeft: 7 }));
                showToast('Divorce Requested: 7 Days Mandatory Wait Started (200 Coins cut after 7d)');
              }}
              onCancelDivorce={() => {
                setShadi((prev) => ({ ...prev, divorcePending: false, divorceDaysLeft: 7 }));
                showToast('Divorce Request Cancelled 💖');
              }}
              onCompleteDivorceWait={() => {
                setCoins((c) => Math.max(0, c - 200));
                setVipStatus((prev) => ({ ...prev, hasCoupleFrame: false }));
                setShadi((prev) => ({ ...prev, isMarried: false, divorcePending: false, divorceDaysLeft: 7 }));
                setMarriedCouples((prev) => prev.filter((c) => !c.isUserCouple));
                showToast('7 Days Complete: Divorced & 200 Coins Deducted');
              }}
              onSaveBirthDate={(dateStr) => {
                setBirthdayState((prev) => ({ ...prev, myBirthDate: dateStr }));
                showToast(`Birthday Saved: ${dateStr} 🎂`);
              }}
              onFindTreasure={handleFindTreasure}
              onOpenCountryLanguage={() => openWorldModal('country', false)}
              onOpenTranslationSettings={() => openWorldModal('translate', false)}
              onUpdateTranslationSettings={updateTranslationSettings}
              onOpenVideo={(video) => {
                advanceDailyTask('dt-video', 1);
                setActiveVideo(video);
              }}
              onOpenLogin={() => setLoginOpen(true)}
              onNotify={showToast}
            />
          )}
        </motion.main>
      </AnimatePresence>

      {/* HISSA 4: Fixed 6-Item Bottom Bar */}
      {!hideBottomBar && (
        <BottomBar
          activeTab={activeTab}
          language={language}
          onSelectTab={(tab) => {
            setActivePartyRoomId(null);
            setActiveTab(tab);
          }}
          onGoLiveClick={() => setGoLiveSheetOpen(true)}
          unreadChatsCount={unreadChatsBadge}
        />
      )}

      {/* HISSA 5: Go Live Bottom Sheet */}
      <GoLiveSheet
        open={goLiveSheetOpen}
        onClose={() => setGoLiveSheetOpen(false)}
        onSelectGoLive={() => {
          advanceHostTask('ht-live', 60);
          setActiveStream({
            stream: {
              ...streams[0],
              id: 'broadcaster-live',
              hostName: 'BiLAL Shafique2494',
              viewers: '1.2K',
            },
            isBroadcaster: true,
          });
        }}
        onSelectCreateParty={handleCreatePartyRoom}
        onSelectStartPK={() => {
          advanceHostTask('ht-pk', 1);
          setActiveTab('explore');
          setExploreSubTab('party');
          setPartyPkInitial(true);
          setActivePartyRoomId(partyRooms[0].id);
        }}
        onSelectRandomMatch={() => setRandomMatchOpen(true)}
        onSelectCreateVideo={() => setCameraStudioOpen(true)}
      />

      {/* HISSA 6, 7, 8, 9: Create Video Studio Pipeline */}
      {cameraStudioOpen && (
        <CreateVideoStudio
          onClose={() => setCameraStudioOpen(false)}
          onPublishVideo={handlePublishVideo}
          onNotify={showToast}
        />
      )}

      {/* HISSA 18 & 24: Other User Profile (Hania Khan + Propose Ring) */}
      {otherProfileOpen && (
        <OtherProfile
          profile={{ ...HANIA_PROFILE, videos }}
          shadi={shadi}
          onBack={() => setOtherProfileOpen(false)}
          onMessage={() => {
            setOtherProfileOpen(false);
            setActiveTab('chats');
            setExternalOpenChatId('chat-shizuka');
          }}
          onPropose={() => {
            triggerHeartRain();
            setProposeOpen(true);
          }}
          onOpenMyProfile={() => {
            setOtherProfileOpen(false);
            setActiveTab('me');
          }}
          onOpenCoupleRoom={() => {
            setOtherProfileOpen(false);
            setCoupleRoomOpen(true);
          }}
          onOpenVideo={(vid) => {
            advanceDailyTask('dt-video', 1);
            setActiveVideo(vid);
          }}
          onNotify={(msg) => {
            if (msg.toLowerCase().includes('follow')) {
              advanceDailyTask('dt-friend', 1);
            }
            showToast(msg);
          }}
        />
      )}

      {/* HISSA 19: Full Screen Top 100 Leaderboard */}
      {leaderboardOpen && (
        <LeaderboardPage
          coins={coins}
          country={country}
          language={language}
          onBack={() => setLeaderboardOpen(false)}
          onGiftAndClimb={() => {
            triggerHaptic();
            setLeaderboardOpen(false);
            setActiveTab('explore');
            setExploreSubTab('party');
            setActivePartyRoomId(partyRooms[0].id);
            showToast('Send gifts in Party Room to climb Rank!');
          }}
          onNotify={(msg) => {
            if (msg.toLowerCase().includes('following')) {
              advanceDailyTask('dt-friend', 1);
            }
            showToast(msg);
          }}
        />
      )}

      {/* Live Stream Viewer */}
      {activeStream && (
        <LiveStreamModal
          stream={activeStream.stream}
          isBroadcaster={activeStream.isBroadcaster}
          hostDailyTargetHours={HOST_SALARY_LEVELS[hostState.selectedLevel].dailyHours}
          hostInitialTodaySeconds={hostState.todayLiveSeconds}
          coins={coins}
          isVip={vipStatus.level > 0}
          language={language}
          translationSettings={translationSettings}
          onOpenTranslationSettings={() => openWorldModal('translate', false)}
          onClose={() => setActiveStream(null)}
          onOpenHostProfile={() => {
            setActiveStream(null);
            setOtherProfileOpen(true);
          }}
          onSendGift={handleSendGift}
          onSpendCoins={(cost, reason) => {
            if (coins < cost) {
              showToast(`Need ${cost} Coins for ${reason}`);
              setRechargeOpen(true);
              return false;
            }
            setCoins((c) => c - cost);
            return true;
          }}
          onRewardCoins={(amt, reason) => {
            setCoins((c) => c + amt);
            triggerConfetti();
            triggerCoinRain();
            showToast(`${reason}: +${amt.toLocaleString()} Coins Added!`);
          }}
          onWinKaraoke={(songTitle) => {
            setCoins((c) => c + 500);
            setVipStatus((prev) => ({ ...prev, hasSingingStarBadge: true }));
            triggerConfetti();
            triggerCoinRain();
            showToast(`Karaoke Winner (${songTitle})! +500 Coins & Singing Star Badge 🎤`);
          }}
          onOpenVipPage={() => {
            setActiveStream(null);
            setActiveTab('vip');
          }}
          onBroadcasterSecondTick={handleBroadcasterSecondTick}
          onTriggerCoinRainNow={() => setInteractiveCoinRainActive(true)}
          onTriggerBirthdayBlast={() => {
            triggerBalloons();
            triggerConfetti();
            showToast('Happy Birthday Blast! Cake + Balloons + Birthday Song 🎂🎈');
          }}
          onNotify={showToast}
        />
      )}

      {/* Short Video Reel Viewer with Double-Tap Heart Blast */}
      {activeVideo && (
        <VideoViewerModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
          onOpenAuthor={() => {
            setActiveVideo(null);
            setOtherProfileOpen(true);
          }}
          onNotify={showToast}
        />
      )}

      {/* Random Match Modal */}
      {randomMatchOpen && (
        <RandomMatchModal
          onClose={() => setRandomMatchOpen(false)}
          onStartChat={() => {
            advanceDailyTask('dt-friend', 1);
            setActiveTab('chats');
            setExternalOpenChatId('chat-shizuka');
          }}
        />
      )}

      {/* Notifications Drawer */}
      {notificationsOpen && (
        <div
          onClick={() => setNotificationsOpen(false)}
          className="fixed inset-0 z-[85] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-16 px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl glass-dark p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#FFD700] flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </h3>
              <button type="button" onClick={() => setNotificationsOpen(false)} className="text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {extraNotifications.map((n, i) => (
                <div key={i} className="p-3 rounded-2xl bg-[#1A1A22] text-xs border border-pink-400/35">
                  <p className="font-bold text-[#FFD700]">{n.title}</p>
                  <p className="text-[#9CA3AF] mt-0.5">{n.body}</p>
                </div>
              ))}
              <div className="p-3 rounded-2xl bg-[#1A1A22] text-xs border border-[#FFD700]/30">
                <p className="font-bold text-[#FFD700]">Vibe Live - Someone sent you a gift</p>
                <p className="text-[#9CA3AF] mt-0.5">Ayesha Live sent a Royal Crown 👑 · Vibe Live - Feel The World Live</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#1A1A22] text-xs">
                <p className="font-bold text-white">Kal Hania Ka Birthday Hai, Gift Ready Rakho 🎂</p>
                <p className="text-[#9CA3AF] mt-0.5">Birthday Reminder · 1 Day Before Alert</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#1A1A22] text-xs">
                <p className="font-bold text-white">Ayesha Live started a PK Battle!</p>
                <p className="text-[#9CA3AF] mt-0.5">12.4K people are watching now.</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#1A1A22] text-xs">
                <p className="font-bold text-white">Ms SHIZUKA shared a new video</p>
                <p className="text-[#9CA3AF] mt-0.5">Tap Inbox to view and reply.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Full-Screen Party Room Overlay (Opened from Explore > Party Rooms or Shortcuts) */}
      {activePartyRoomId && (
        <PartySystem
          rooms={partyRooms}
          coins={coins}
          isVip={vipStatus.level > 0}
          activeRoomId={activePartyRoomId}
          pkActiveInitially={partyPkInitial}
          language={language}
          translationSettings={translationSettings}
          mode="room-only"
          onOpenTranslationSettings={() => openWorldModal('translate', false)}
          onEnterRoom={(roomId, pk) => {
            advanceDailyTask('dt-live', 5);
            advanceChallengeByType('rooms', 1);
            advanceChallengeByType('watchLive', 15);
            if (pk) advanceHostTask('ht-pk', 1);
            setPartyPkInitial(!!pk);
            setActivePartyRoomId(roomId);
          }}
          onExitRoom={() => {
            setActivePartyRoomId(null);
            setPartyPkInitial(false);
          }}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
          onCreatePartyRoom={handleCreatePartyRoom}
          onSendGift={handleSendGift}
          onSpendCoins={(cost, reason) => {
            if (coins < cost) {
              showToast(`Need ${cost} Coins for ${reason}`);
              setRechargeOpen(true);
              return false;
            }
            setCoins((c) => c - cost);
            return true;
          }}
          onRewardCoins={(amt, reason) => {
            setCoins((c) => c + amt);
            triggerConfetti();
            triggerCoinRain();
            showToast(`${reason}: +${amt.toLocaleString()} Coins Added!`);
          }}
          onWinKaraoke={(songTitle) => {
            setCoins((c) => c + 500);
            setVipStatus((prev) => ({ ...prev, hasSingingStarBadge: true }));
            triggerConfetti();
            triggerCoinRain();
            showToast(`Karaoke Winner (${songTitle})! +500 Coins & Singing Star Badge 🎤`);
          }}
          onOpenVipPage={() => {
            setActivePartyRoomId(null);
            setActiveTab('vip');
          }}
          onFirstRecharge={() => setRechargeOpen(true)}
          onPkStarted={() => advanceHostTask('ht-pk', 1)}
          onNotify={showToast}
        />
      )}

      {/* HISSA 23 & 24: COINS RECHARGE + 10 WORLDWIDE PAYMENT METHODS */}
      {rechargeOpen && (
        <RechargePage
          coins={coins}
          country={country}
          isFirstRecharge={isFirstRecharge}
          adsWatchedToday={adsWatchedToday}
          onBack={() => setRechargeOpen(false)}
          onWatchRewardedAd={() => setAdModalState({ open: true, reward: 20, source: 'recharge' })}
          onCompleteRecharge={(pkg, method) => {
            const totalAdded = (isFirstRecharge ? pkg.coins * 2 : pkg.coins) + pkg.bonusCoins;
            setCoins((c) => c + totalAdded);
            if (isFirstRecharge) setIsFirstRecharge(false);
            if (pkg.vipDaysFree || pkg.legendFrame) {
              const freeVip = pkg.vipDaysFree;
              setVipStatus((prev) => ({
                level: freeVip ? (Math.max(prev.level, freeVip.level) as 0 | 1 | 2 | 3) : prev.level,
                daysLeft: freeVip ? prev.daysLeft + freeVip.days : prev.daysLeft,
                hasGuardian: (freeVip?.level === 3) || prev.hasGuardian,
                hasLegendFrame: pkg.legendFrame || prev.hasLegendFrame,
              }));
            }
            triggerConfetti();
            triggerCoinRain();
            showToast(
              `+${totalAdded.toLocaleString()} Coins Added via ${method.name}!`
            );
          }}
        />
      )}

      {/* HISSA 22: REWARDED VIDEO AD POPUP */}
      <RewardedAdModal
        open={adModalState.open}
        rewardCoins={adModalState.reward}
        onClose={() => setAdModalState((s) => ({ ...s, open: false }))}
        onComplete={(earned) => {
          setCoins((c) => c + earned);
          if (adModalState.source === 'recharge') {
            setAdsWatchedToday((n) => Math.min(5, n + 1));
          }
          setAdModalState((s) => ({ ...s, open: false }));
          triggerCoinRain();
          showToast(`${earned} Coins Added`);
        }}
      />

      {/* HISSA 22: USER DAILY TASKS */}
      <DailyTasksModal
        open={dailyTasksOpen}
        tasks={dailyTasks}
        allBonusClaimed={allDailyBonusClaimed}
        vipStatus={vipStatus}
        onClose={() => setDailyTasksOpen(false)}
        onClaimTask={(taskId) => {
          const multiplier = vipStatus.level >= 2 ? 2 : 1;
          const target = dailyTasks.find((t) => t.id === taskId);
          if (!target || target.claimed || target.progress < target.target) return;
          triggerHaptic(18);
          playGiftChime();
          setDailyTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, claimed: true } : t)));
          const earned = target.rewardCoins * multiplier;
          setCoins((c) => c + earned);
          triggerCoinRain();
          showToast(`+${earned} Coins Claimed!`);
        }}
        onClaimAllBonus={() => {
          if (allDailyBonusClaimed) return;
          const multiplier = vipStatus.level >= 2 ? 2 : 1;
          const earned = 50 * multiplier;
          setAllDailyBonusClaimed(true);
          setCoins((c) => c + earned);
          triggerConfetti();
          triggerCoinRain();
          showToast(`Daily Chest Opened! +${earned} Bonus Coins`);
        }}
        onCompleteAction={(taskId) => {
          setDailyTasksOpen(false);
          if (taskId === 'dt-live') {
            advanceDailyTask('dt-live', 5);
            setActiveTab('home');
            showToast('Watch Live streams to complete 10 Min task! (+5 Min)');
          } else if (taskId === 'dt-gift') {
            setActiveTab('explore');
            setExploreSubTab('party');
            setActivePartyRoomId(partyRooms[0].id);
            showToast('Send a Gift in Party Room to complete task!');
          } else if (taskId === 'dt-friend') {
            setLeaderboardOpen(true);
            showToast('Follow a creator on Leaderboard to make a friend!');
          } else if (taskId === 'dt-video') {
            advanceDailyTask('dt-video', 1);
            setActiveVideo(videos[0]);
          }
        }}
      />

      {/* HISSA 22 FINAL: HOST SALARY + 1 MONTH FREE (STREAMER CENTER) */}
      <StreamerCenterModal
        open={streamerCenterOpen}
        hostState={hostState}
        hostTasks={hostTasks}
        onClose={() => setStreamerCenterOpen(false)}
        onJoinHostFree={() => {
          setHostState((prev) => ({
            ...prev,
            joined: true,
            isFirstMonthFree: true,
            firstMonthDaysLeft: 30,
          }));
          triggerConfetti();
          showToast('Welcome Vibe Live Host! 1 Month Free Activated (0 Rs Fee)');
        }}
        onSelectLevel={(level) => {
          if (hostState.weekStarted) {
            showToast('Week started — Level can only change at Week Start!');
            return;
          }
          setHostState((prev) => ({ ...prev, selectedLevel: level }));
          showToast(`Level ${level} Selected (${HOST_SALARY_LEVELS[level].dailyHours}h/Day Target)`);
        }}
        onToggleWeekLock={() => {
          setHostState((prev) => {
            const nextLocked = !prev.weekStarted;
            showToast(
              nextLocked
                ? 'Week Active — Level Locked until Sunday 12:00 AM'
                : 'Week Start Window Open — You can change Level'
            );
            return { ...prev, weekStarted: nextLocked };
          });
        }}
        onAddLiveTime={(seconds) => {
          setHostState((prev) => ({
            ...prev,
            todayLiveSeconds: prev.todayLiveSeconds + seconds,
            weeklyLiveSeconds: prev.weeklyLiveSeconds + seconds,
            monthTotalHours: prev.monthTotalHours + seconds / 3600,
            monthStreakDays: seconds >= 3600 ? Math.min(7, prev.monthStreakDays + 1) : prev.monthStreakDays,
          }));
          triggerHaptic();
          showToast(`+${(seconds / 3600).toFixed(1)}h Valid Face Live Time Logged!`);
        }}
        onSimulateGiftReceived={(giftCoins) => {
          playGiftChime();
          triggerCoinRain();
          setHostState((prev) => ({
            ...prev,
            weeklyGiftCoins: prev.weeklyGiftCoins + giftCoins,
            monthGiftCoins: prev.monthGiftCoins + giftCoins,
          }));
          showToast(`+${giftCoins.toLocaleString()} Fan Gift Coins Received!`);
        }}
        onClaimMonthBonus={(bonusId, amountPkr) => {
          if (hostState.claimedMonthBonuses.includes(bonusId)) return;
          const workReady =
            (bonusId === 'b-streak' && hostState.monthStreakDays >= 7) ||
            (bonusId === 'b-hours' && hostState.monthTotalHours >= 100) ||
            (bonusId === 'b-gift' && hostState.monthGiftCoins >= 10000);
          if (!workReady) {
            showToast('Complete the required work target first to unlock bonus!');
            return;
          }
          setHostState((prev) => ({
            ...prev,
            claimedMonthBonuses: [...prev.claimedMonthBonuses, bonusId],
            salaryWalletPkr: prev.salaryWalletPkr + amountPkr,
          }));
          triggerConfetti();
          triggerCoinRain();
          showToast(`Bonus Paid! +Rs. ${amountPkr.toLocaleString()} added to Salary Wallet`);
        }}
        onSettleWeekSunday={() => {
          const rule = HOST_SALARY_LEVELS[hostState.selectedLevel];
          const weeklyHours = hostState.weeklyLiveSeconds / 3600;
          const hoursMet = weeklyHours >= rule.weeklyHours;
          const giftMet = hostState.weeklyGiftCoins >= rule.giftTarget;
          const giftSharePkr = Math.round(hostState.weeklyGiftCoins * 0.3 * (rule.giftSharePct / 100));
          const salaryEarned = hoursMet && giftMet ? rule.weeklySalaryPkr : 0;

          setHostState((prev) => ({
            ...prev,
            salaryWalletPkr: prev.salaryWalletPkr + salaryEarned,
            giftWalletPkr: prev.giftWalletPkr + giftSharePkr,
            todayLiveSeconds: 0,
            weeklyLiveSeconds: 0,
            weeklyGiftCoins: 0,
            weekStarted: false,
          }));

          if (salaryEarned > 0) {
            triggerConfetti();
            triggerCoinRain();
            showToast(
              `Sunday 12:00 AM Settlement: Salary Rs. ${salaryEarned.toLocaleString()} + Gift Rs. ${giftSharePkr.toLocaleString()} Paid!`
            );
          } else {
            showToast(
              `Week Reset: Salary Rs. 0 (${
                !giftMet ? 'Gift Target not met' : 'Weekly Hours incomplete'
              }). Gift Share Rs. ${giftSharePkr.toLocaleString()} Credited.`
            );
          }
        }}
        onRequestWithdraw={(amountPkr, method, account) => {
          const totalAvail = hostState.salaryWalletPkr + hostState.giftWalletPkr;
          if (amountPkr < 1000 || amountPkr > totalAvail || !account) {
            showToast('Minimum Rs. 1,000 required & must fit wallet balance!');
            return;
          }
          const fromGift = Math.min(hostState.giftWalletPkr, amountPkr);
          const fromSalary = amountPkr - fromGift;
          setHostState((prev) => ({
            ...prev,
            giftWalletPkr: prev.giftWalletPkr - fromGift,
            salaryWalletPkr: prev.salaryWalletPkr - fromSalary,
            withdrawals: [
              {
                id: `wd-${Date.now()}`,
                amountPkr,
                method,
                account,
                status: 'Scheduled (Wednesday)',
                date: 'Mon Request',
              },
              ...prev.withdrawals,
            ],
          }));
          triggerConfetti();
          showToast(`Withdrawal Requested! Rs. ${amountPkr.toLocaleString()} Monday → Wednesday tak aayega`);
        }}
        onRecruitHost={(hostName) => {
          const cleanName = hostName.trim();
          if (!cleanName) return;
          setHostState((prev) => {
            const nextHosts = [
              ...prev.recruitedHosts,
              {
                id: `rh-${Date.now()}`,
                name: cleanName,
                weeklyGiftCoins: 2500,
              },
            ];
            const totalPartnerGifts = nextHosts.reduce((sum, h) => sum + h.weeklyGiftCoins, 0);
            const unlockedAgency = nextHosts.length >= 10;
            const nextCommission = unlockedAgency ? Math.round(totalPartnerGifts * 0.3 * 0.1) : 0;
            if (unlockedAgency && !prev.isAgency) {
              triggerConfetti();
              showToast('10 Hosts Complete! You are now a Vibe Live Agency (10% Gift Commission Unlocked)!');
            } else {
              showToast(`Host "${cleanName}" Recruited (${nextHosts.length}/10 for Agency)`);
            }
            return {
              ...prev,
              recruitedHosts: nextHosts,
              isAgency: unlockedAgency,
              agencyEarningsPkr: unlockedAgency ? Math.max(prev.agencyEarningsPkr, nextCommission) : 0,
            };
          });
        }}
        onClaimAgencyCommission={() => {
          if (!hostState.isAgency || hostState.agencyEarningsPkr <= 0) {
            showToast('No pending agency commission right now!');
            return;
          }
          const payout = hostState.agencyEarningsPkr;
          setHostState((prev) => ({
            ...prev,
            salaryWalletPkr: prev.salaryWalletPkr + prev.agencyEarningsPkr,
            agencyEarningsPkr: 0,
          }));
          triggerConfetti();
          triggerCoinRain();
          showToast(`Agency 10% Commission +Rs. ${payout.toLocaleString()} added to Salary Wallet!`);
        }}
        onGoLiveNow={() => {
          setActiveStream({
            stream: {
              ...streams[0],
              id: 'broadcaster-live',
              hostName: 'BiLAL Shafique2494',
              viewers: '1.2K',
            },
            isBroadcaster: true,
          });
        }}
      />

      {/* HISSA 25: WORLDWIDE COUNTRY + 16 LANGUAGES + AUTO TRANSLATION SETTINGS */}
      <CountryLanguageModal
        open={countryModalOpen}
        country={country}
        language={language}
        translationSettings={translationSettings}
        initialTab={countryModalTab}
        isOnboarding={isOnboardingWorld}
        onClose={() => {
          if (isOnboardingWorld) {
            try {
              localStorage.setItem('vibelive_world_setup', '1');
            } catch {
              // ignore storage errors
            }
            setIsOnboardingWorld(false);
          }
          setCountryModalOpen(false);
        }}
        onFinishOnboarding={() => {
          try {
            localStorage.setItem('vibelive_world_setup', '1');
          } catch {
            // ignore storage errors
          }
          setIsOnboardingWorld(false);
          setCountryModalOpen(false);
          showToast(`Welcome to Vibe Live ${country.flag} (${language})!`);
        }}
        onSelectCountry={(c) => {
          setCountry(c);
          setLanguage(c.defaultLang);
          try {
            localStorage.setItem('vibelive_country', JSON.stringify(c));
            localStorage.setItem('vibelive_language', c.defaultLang);
          } catch {
            // ignore storage errors
          }
          showToast(`${c.flag} ${c.name} · ${c.defaultLang} Active`);
        }}
        onSelectLanguage={(lang) => {
          setLanguage(lang);
          try {
            localStorage.setItem('vibelive_language', lang);
          } catch {
            // ignore storage errors
          }
          showToast(`App Language: ${lang}`);
        }}
        onUpdateTranslationSettings={updateTranslationSettings}
      />

      {/* HISSA 26: WELCOME TO VIBE LIVE LOGIN / SIGNUP MODAL */}
      <LoginSignupModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={showToast}
      />

      {/* HISSA 24 FINAL: PROPOSE RING + MARRIED COUPLES + PRIVATE COUPLE ROOM + AAJ KE BIRTHDAYS */}
      <ProposeModal
        open={proposeOpen}
        targetName="Hania Khan"
        targetHandle="@its_haniya__1"
        targetAvatar={IMG_HOST_FEMALE}
        onClose={() => setProposeOpen(false)}
        onAcceptMarriage={() => {
          triggerHeartRain();
          triggerConfetti();
          setCoins((c) => c + 500);
          setVipStatus((prev) => ({ ...prev, hasCoupleFrame: true }));
          setShadi({
            isMarried: true,
            partnerName: 'Hania Khan',
            partnerHandle: '@its_haniya__1',
            partnerAvatar: IMG_HOST_FEMALE,
            marriedDate: '17 Nov 2026',
            popularScore: 99200,
            divorcePending: false,
            divorceDaysLeft: 7,
          });
          setMarriedCouples((prev) => {
            const exists = prev.some((c) => c.isUserCouple);
            if (exists) return prev;
            return [
              {
                id: `mc-user-${Date.now()}`,
                partner1Name: 'BiLAL Shafique2494',
                partner1Handle: '@bilal',
                partner1Avatar: IMG_HOST_MALE,
                partner2Name: 'Hania Khan',
                partner2Handle: '@its_haniya__1',
                partner2Avatar: IMG_HOST_FEMALE,
                marriedDate: '17 Nov 2026',
                popularityScore: 99200,
                hearts: 50000,
                isUserCouple: true,
              },
              ...prev,
            ];
          });
          showToast('Shadi Mubarak! +500 Coins Free & Couple Frame Unlocked 💍💖');
        }}
      />

      <MarriedCouplesModal
        open={marriedCouplesOpen}
        couples={marriedCouples}
        onClose={() => setMarriedCouplesOpen(false)}
        onOpenPartnerProfile={() => {
          setMarriedCouplesOpen(false);
          setOtherProfileOpen(true);
        }}
        onSendHeartCouple={(coupleId) => {
          triggerHeartRain();
          setMarriedCouples((prev) =>
            prev.map((c) =>
              c.id === coupleId ? { ...c, hearts: c.hearts + 10, popularityScore: c.popularityScore + 50 } : c
            )
          );
          showToast('Sent Couple Love ❤️ (+50 Popularity)');
        }}
      />

      <CoupleRoomModal
        open={coupleRoomOpen}
        shadi={shadi}
        coupleRoom={coupleRoom}
        coins={coins}
        hasTrueLoveBadge={!!vipStatus.hasTrueLoveBadge}
        onClose={() => setCoupleRoomOpen(false)}
        onProposeNow={() => {
          triggerHeartRain();
          setProposeOpen(true);
        }}
        onSendMessage={(text) => {
          setCoupleRoom((prev) => ({
            ...prev,
            messages: [
              ...prev.messages,
              { id: `cm-${Date.now()}`, sender: 'me', type: 'text', text, time: 'Now' },
            ],
          }));
        }}
        onSendCoupleGift={(gift) => {
          if (coins < gift.cost) {
            showToast('Low Coins! Recharge first');
            setRechargeOpen(true);
            return;
          }
          setCoins((c) => c - gift.cost);
          playGiftChime();
          triggerHeartRain();
          setBigGift({ emoji: gift.emoji, name: `${gift.name} (Couple Gift)`, sender: 'BiLAL' });
          window.setTimeout(() => setBigGift(null), 2000);
          setCoupleRoom((prev) => ({
            ...prev,
            messages: [
              ...prev.messages,
              { id: `cgm-${Date.now()}`, sender: 'me', type: 'text', text: `Sent Couple Exclusive ${gift.emoji} ${gift.name}!`, time: 'Now' },
            ],
          }));
        }}
        onToggleSongPlay={() => setCoupleRoom((prev) => ({ ...prev, isPlayingSong: !prev.isPlayingSong }))}
        onNextSong={() => setCoupleRoom((prev) => ({ ...prev, activeSongIndex: prev.activeSongIndex + 1 }))}
        onToggleMovieShare={() => setCoupleRoom((prev) => ({ ...prev, movieScreenShare: !prev.movieScreenShare }))}
        onAddTalkMinutes={(secs) =>
          setCoupleRoom((prev) => ({
            ...prev,
            talkSecondsToday: Math.min(3600, prev.talkSecondsToday + secs),
          }))
        }
        onClaimDailyCoupleReward={() => {
          if (coupleRoom.dailyRewardClaimed) return;
          setCoins((c) => c + 100);
          triggerCoinRain();
          setCoupleRoom((prev) => ({ ...prev, dailyRewardClaimed: true }));
          showToast('Couple Daily 30m Talk Complete! +100 Coins Added 💖');
        }}
        onSimulateSevenDayStreak={() => {
          setCoupleRoom((prev) => ({ ...prev, streakDays: 7 }));
          setVipStatus((prev) => ({ ...prev, hasTrueLoveBadge: true }));
          triggerHeartRain();
          triggerConfetti();
          showToast('7 Days Streak Complete! "True Love" Badge Unlocked 💖👑');
        }}
        onNotify={showToast}
      />

      <BirthdaysModal
        open={birthdaysOpen}
        birthdayState={birthdayState}
        hasBirthdayFrame={!!vipStatus.hasBirthdayFrame}
        onClose={() => setBirthdaysOpen(false)}
        onClaimMyBirthdayGift={() => {
          if (birthdayState.birthdayBonusClaimed) return;
          setCoins((c) => c + 1000);
          setVipStatus((prev) => ({
            ...prev,
            hasBirthdayFrame: true,
            freeCakesCount: (prev.freeCakesCount || 0) + 1,
          }));
          setBirthdayState((prev) => ({ ...prev, birthdayBonusClaimed: true }));
          triggerBalloons();
          triggerConfetti();
          triggerCoinRain();
          showToast('Happy Birthday! +1,000 Coins + Free Cake + Birthday Frame 🎂');
        }}
        onSendBirthdayGift={(entry) => {
          if (coins < 50) {
            showToast('Low Coins! Recharge first');
            setRechargeOpen(true);
            return;
          }
          setCoins((c) => c - 50);
          playGiftChime();
          triggerBalloons();
          setBirthdayState((prev) => ({
            ...prev,
            birthdaysToday: prev.birthdaysToday.map((b) =>
              b.id === entry.id
                ? { ...b, wishedCount: b.wishedCount + 1, giftCoinsReceived: b.giftCoinsReceived + 50 }
                : b
            ),
          }));
          showToast(`Sent Birthday Cake 🎂 to ${entry.name}!`);
        }}
        onSetBirthDate={(dateStr) => {
          setBirthdayState((prev) => ({ ...prev, myBirthDate: dateStr }));
          showToast(`Birthday Date Updated: ${dateStr}`);
        }}
        onTriggerBirthdayBlastDemo={() => {
          triggerBalloons();
          triggerConfetti();
          showToast('Happy Birthday Song & Balloons Playing 🎂🎈');
        }}
        onTriggerTomorrowReminder={() => {
          setBellCount((b) => b + 1);
          setExtraNotifications((prev) => [
            { title: 'Birthday Reminder 🎂', body: 'Kal Hania Ka Birthday Hai, Gift Ready Rakho!' },
            ...prev,
          ]);
          showToast('Kal Hania Ka Birthday Hai, Gift Ready Rakho 🎂');
        }}
      />

      {/* HISSA 25 FINAL: LUCKY SPIN + MYSTERY BOX + INTERACTIVE COIN RAIN + DAILY CHECK-IN */}
      <LuckySpinModal
        open={luckySpinOpen}
        spinState={luckySpinState}
        onClose={() => setLuckySpinOpen(false)}
        onSpinComplete={(prize) => {
          triggerConfetti();
          if (prize.type === 'coins') {
            setCoins((c) => c + prize.amount);
            triggerCoinRain();
          } else if (prize.type === 'vipFrame') {
            setVipStatus((prev) => ({ ...prev, level: Math.max(prev.level, 1), daysLeft: prev.daysLeft + 1 }));
          } else if (prize.type === 'freeGift') {
            setVipStatus((prev) => ({ ...prev, freeGiftsCount: (prev.freeGiftsCount || 0) + 1 }));
          }
          const news = `Bilal Ne ${prize.label} Jeete 🎉`;
          setLuckySpinState((prev) => ({
            ...prev,
            spinsUsedToday: prev.spinsUsedToday + 1,
            tickerFeed: [news, ...prev.tickerFeed.slice(0, 4)],
          }));
          showToast(`Lucky Spin Winner: ${prize.label}!`);
        }}
        onInviteFriendSpin={() => {
          if (luckySpinState.extraSpinsEarned >= 2) return;
          setLuckySpinState((prev) => ({ ...prev, extraSpinsEarned: prev.extraSpinsEarned + 1 }));
          showToast('Friend Invited! +1 Extra Lucky Spin Added');
        }}
      />

      <MysteryBoxModal
        open={mysteryBoxOpen}
        coins={coins}
        history={boxHistory}
        onClose={() => setMysteryBoxOpen(false)}
        onOpenBox={(tier) => {
          if (coins < tier.costCoins) {
            showToast(`Need ${tier.costCoins} Coins to open ${tier.name}!`);
            setRechargeOpen(true);
            return { prizeLabel: '', ok: false };
          }
          setCoins((c) => c - tier.costCoins);
          const span = tier.maxCoins - tier.minCoins;
          const wonCoins = Math.round((tier.minCoins + Math.random() * span) / 50) * 50;
          const bonusVip = tier.id === 'king' || Math.random() > 0.7;
          setCoins((c) => c + wonCoins);
          if (bonusVip) {
            setVipStatus((prev) => ({ ...prev, level: Math.max(prev.level, 1), daysLeft: prev.daysLeft + 1 }));
          }
          const prizeLabel = bonusVip ? `${wonCoins.toLocaleString()} Coins + VIP Frame` : `${wonCoins.toLocaleString()} Coins`;
          triggerConfetti();
          triggerCoinRain();
          setBoxHistory((prev) => [
            {
              id: `bh-${Date.now()}`,
              dayLabel: 'Aaj',
              boxName: `${tier.name} (Rs ${tier.pricePkr})`,
              prizeLabel,
              time: 'Just now',
            },
            ...prev,
          ]);
          showToast(`Mystery Box Opened: ${prizeLabel}!`);
          return { prizeLabel, ok: true };
        }}
      />

      <InteractiveCoinRainOverlay
        active={interactiveCoinRainActive}
        onCollectCoin={(amt) => setCoins((c) => c + amt)}
        onFinish={(totalCaught, clicksCount) => {
          setInteractiveCoinRainActive(false);
          if (clicksCount >= 1) {
            setVipStatus((prev) => ({ ...prev, hasCoinKingBadge: true }));
            triggerConfetti();
            showToast(`Coin Rain Finished! +${totalCaught} Coins & Coin King Badge Unlocked 👑`);
          } else {
            showToast('Coin Rain Finished!');
          }
        }}
      />

      <DailyCheckInModal
        open={dailyCheckInOpen}
        state={dailyCheckInState}
        onClose={() => setDailyCheckInOpen(false)}
        onClaimToday={() => {
          if (dailyCheckInState.claimedToday) return;
          const dayInfo = DAILY_CHECKIN_DAYS[dailyCheckInState.streakDay - 1];
          setCoins((c) => c + dayInfo.coins);
          if (dailyCheckInState.streakDay === 7) {
            setVipStatus((prev) => ({ ...prev, level: Math.max(prev.level, 1), daysLeft: prev.daysLeft + 1 }));
          }
          triggerConfetti();
          triggerCoinRain();
          setDailyCheckInState((prev) => ({
            ...prev,
            claimedToday: true,
            streakDay: prev.streakDay < 7 ? prev.streakDay + 1 : 7,
          }));
          showToast(`Day ${dayInfo.day} Check-In Claimed! +${dayInfo.bonusLabel}`);
        }}
        onSimulateMissedDay={() => {
          setDailyCheckInState((prev) => ({
            ...prev,
            streakDay: 1,
            claimedToday: false,
          }));
          showToast('1 Day Missed — Streak Reset to Day 1!');
        }}
      />

      {/* HISSA 27 FINAL: DAILY KING + WEEKLY QUEEN + REFERRAL KING + LUCKY NUMBER 5353 + CHALLENGE PAGE */}
      <DailyKingsModal
        open={dailyKingsOpen}
        kings={dailyKings}
        claimedPrize={dailyKingPrizeClaimed}
        onClose={() => setDailyKingsOpen(false)}
        onClaimKingPrize={() => {
          if (dailyKingPrizeClaimed) return;
          setDailyKingPrizeClaimed(true);
          setCoins((c) => c + 1000);
          setVipStatus((prev) => ({
            ...prev,
            hasKingBadge: true,
            hasKingFrame: true,
          }));
          triggerConfetti();
          triggerCoinRain();
          showToast('Aaj Ka King Prize Claimed! +1,000 Coins + King Frame (1d) + King Badge 👑');
        }}
      />

      <WeeklyQueensModal
        open={weeklyQueensOpen}
        queens={weeklyQueens}
        onClose={() => setWeeklyQueensOpen(false)}
        onCelebrateQueen={() => {
          triggerConfetti();
          triggerCoinRain();
          showToast('Week Ki Queen Hania! Gold Confetti Celebration 👸✨');
        }}
        onVisitQueenRoom={() => {
          setActiveStream({ stream: streams[0] });
          advanceChallengeByType('rooms', 1);
          showToast('Joined Queen Hania Room (Auto Boosted Viewers 🔥)');
        }}
      />

      <ReferralKingModal
        open={referralOpen}
        referralState={referralState}
        onClose={() => setReferralOpen(false)}
        onInviteRealFriend={() => {
          const names = ['Saad Khan', 'Zainab Noor', 'Farhan Ali', 'Mehwish', 'Taimoor'];
          const pick = names[referralState.friends.length % names.length];
          const newFriend = {
            id: `rf-${Date.now()}`,
            name: `${pick} #${referralState.friends.length + 1}`,
            handle: `@${pick.toLowerCase().replace(/\s+/g, '')}`,
            avatar: IMG_HOST_MALE,
            isRealAccount: true,
            invitedRewardClaimed: true,
            rechargedFirstTime: false,
            watchedSevenDays: false,
            daysWatched: 1,
          };
          setReferralState((prev) => ({ ...prev, friends: [newFriend, ...prev.friends] }));
          setCoins((c) => c + 100);
          advanceChallengeByType('invite', 1);
          triggerCoinRain();
          showToast(`Verified Real Friend "${newFriend.name}" Joined! +100 Coins Added`);
        }}
        onTestFakeIdRejected={() => {
          const fakeFriend = {
            id: `rf-fake-${Date.now()}`,
            name: 'Duplicate Bot ID #00',
            handle: '@fake_bot',
            avatar: IMG_HOST_FEMALE,
            isRealAccount: false,
            invitedRewardClaimed: false,
            rechargedFirstTime: false,
            watchedSevenDays: false,
            daysWatched: 0,
          };
          setReferralState((prev) => ({ ...prev, friends: [fakeFriend, ...prev.friends] }));
          showToast('Fake / Duplicate ID Detected — Rejected (0 Coins Awarded)');
        }}
        onSimulateFriendRecharge={(friendId) => {
          setReferralState((prev) => ({
            ...prev,
            friends: prev.friends.map((f) =>
              f.id === friendId ? { ...f, rechargedFirstTime: true } : f
            ),
          }));
          setCoins((c) => c + 200);
          triggerCoinRain();
          showToast('Friend First Recharge Complete! +200 Coins Free Added');
        }}
        onSimulateFriend7Days={(friendId) => {
          setReferralState((prev) => ({
            ...prev,
            friends: prev.friends.map((f) =>
              f.id === friendId ? { ...f, watchedSevenDays: true, daysWatched: 7 } : f
            ),
          }));
          setCoins((c) => c + 100);
          triggerCoinRain();
          showToast('Friend Watched 7 Days Live! +100 Coins Free Added');
        }}
        onClaimReferralKingBonus={() => {
          if (referralState.referralKingBonusClaimed) return;
          setReferralState((prev) => ({ ...prev, referralKingBonusClaimed: true }));
          setVipStatus((prev) => ({ ...prev, hasReferralKingBadge: true }));
          setHostState((prev) => ({ ...prev, salaryWalletPkr: prev.salaryWalletPkr + 5000 }));
          triggerConfetti();
          showToast('Referral King #1 Bonus! +Rs. 5,000 & Referral King Badge Claimed 👑');
        }}
        onNotify={showToast}
      />

      <LuckyNumberModal
        open={luckyNumberOpen}
        luckyNumber={luckyNumber}
        userIdNumber="123456"
        claimed={luckyNumberClaimed}
        onClose={() => setLuckyNumberOpen(false)}
        onMatchAndClaim={() => {
          if (luckyNumberClaimed) return;
          setLuckyNumberClaimed(true);
          setCoins((c) => c + 5000);
          triggerConfetti();
          triggerCoinRain();
          showToast(`Lucky Number ${luckyNumber} Matched! +5,000 Coins Free Added 🎉`);
        }}
        onRefreshNumber={() => {
          const nextNum = 5300 + Math.floor(Math.random() * 99);
          setLuckyNumber(nextNum);
          setLuckyNumberClaimed(false);
          showToast(`Aaj Ka Lucky Number ${nextNum} Hai!`);
        }}
      />

      <DailyChallengesPageModal
        open={dailyChallengesOpen}
        challenges={dailyChallenges}
        onClose={() => setDailyChallengesOpen(false)}
        onProgressChallenge={(id, delta) => advanceChallengeById(id, delta)}
      />

      <ChallengeCompletePopup
        challenge={completedChallengePopup}
        onClose={() => setCompletedChallengePopup(null)}
      />
    </div>
  );
}
