export type MainTab = 'home' | 'explore' | 'vip' | 'chats' | 'me';

export type AppLanguage =
  | 'English'
  | 'Urdu'
  | 'Hindi'
  | 'Chinese'
  | 'Arabic'
  | 'Turkish'
  | 'Tagalog'
  | 'Indonesian'
  | 'Bengali'
  | 'Russian'
  | 'Portuguese'
  | 'Vietnamese'
  | 'Korean'
  | 'Japanese'
  | 'Spanish'
  | 'French';

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  defaultLang: AppLanguage;
  langLabel: string;
  currencyCode: string;
  currencySymbol: string;
  rateFromPkr: number;
}

export interface TranslationSettings {
  autoTranslate: boolean;
  mode: 'both' | 'onlyTranslation';
}

export interface VipStatus {
  level: number; // 0 = Not VIP Yet, 1..50 = VIP Level 1..50
  daysLeft: number;
  hasGuardian: boolean;
  hasLegendFrame?: boolean;
  equippedFrameLevel?: number;
  hasCoupleFrame?: boolean;
  hasBirthdayFrame?: boolean;
  hasTrueLoveBadge?: boolean;
  hasCoinKingBadge?: boolean;
  hasSingingStarBadge?: boolean;
  hasDareKingBadge?: boolean;
  hasKingBadge?: boolean;
  hasKingFrame?: boolean;
  hasQueenBadge?: boolean;
  hasQueenFrame?: boolean;
  hasReferralKingBadge?: boolean;
  freeCakesCount?: number;
  freeGiftsCount?: number;
}

export interface VipLevelInfo {
  level: number;
  name: string;
  extraCoins: number;
  totalCoins: number;
  tierLabel: string;
  frameName: string;
  entryEffect: string;
  crownStyle: string;
  perks: string[];
}

export interface VipFrameInfo {
  id: string;
  minLevel: number;
  title: string;
  badgeText: string;
  entryText: string;
  ringClass: string;
  glowClass: string;
  badgeGradient: string;
  crownColor: string;
}

export interface VipLeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  country: 'PK' | 'Global';
  flag: string;
  vipLevel: number;
  badgeTier: 50 | 40 | 30 | 20 | 10;
  coins: number;
  giftCoins: number;
  hostCoins: number;
}

export interface DailyTaskItem {
  id: string;
  title: string;
  rewardCoins: number;
  progress: number;
  target: number;
  unit?: string;
  claimed: boolean;
}

export interface HostTaskItem {
  id: string;
  title: string;
  rewardPoints: number;
  progress: number;
  target: number;
  unit?: string;
  claimed: boolean;
}

export type HostSalaryLevel = 1 | 2 | 3;

export interface HostWithdrawalRecord {
  id: string;
  amountPkr: number;
  method: 'JazzCash' | 'Easypaisa' | 'Bank';
  account: string;
  status: 'Scheduled (Wednesday)' | 'Paid';
  date: string;
}

export interface HostSalaryState {
  joined: boolean;
  isFirstMonthFree: boolean;
  firstMonthDaysLeft: number;
  selectedLevel: HostSalaryLevel;
  weekStarted: boolean; // Level change only allowed at Week Start (before Mon start lock)
  todayLiveSeconds: number;
  weeklyLiveSeconds: number;
  weeklyGiftCoins: number;
  monthStreakDays: number;
  monthTotalHours: number;
  monthGiftCoins: number;
  claimedMonthBonuses: string[]; // 'b-streak' | 'b-hours' | 'b-gift'
  salaryWalletPkr: number;
  giftWalletPkr: number;
  withdrawals: HostWithdrawalRecord[];
  recruitedHosts: { id: string; name: string; weeklyGiftCoins: number }[];
  isAgency: boolean;
  agencyEarningsPkr: number;
}

export interface RechargePackage {
  id: string;
  pricePkr: number;
  coins: number;
  bonusCoins: number;
  tag: string;
  vipDaysFree?: { level: 1 | 2 | 3; days: number; label: string };
  popular?: boolean;
  legendFrame?: boolean;
  glow?: 'gold' | 'red';
}

export interface PaymentMethodItem {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  accent: string;
  regionPriority: string[]; // e.g., ['PK'], ['US', 'GB', 'EU'], ['IN']
}

export interface LiveStreamItem {
  id: string;
  title: string;
  hostName: string;
  handle: string;
  avatar: string;
  cover: string;
  level: number;
  viewers: string;
  viewerNum: number;
  country: 'Pakistan' | 'India' | 'Nepal' | 'Philippines' | 'Global';
  category: 'Hot' | 'Video' | 'Voice' | 'Follow';
  pill: 'Pakistan' | 'Recommendations' | 'Chat' | 'Dating' | 'Games' | 'Interests' | 'Room';
  isLiveNow?: boolean;
  tag?: string;
  coHostCount?: number;
}

export interface ShortVideoItem {
  id: string;
  title: string;
  caption: string;
  hostName: string;
  handle: string;
  avatar: string;
  cover: string;
  level: number;
  views: string;
  likes: number;
  hashtags: string[];
  isPinned?: boolean;
  isUserCreated?: boolean;
  songName?: string;
  filterCss?: string;
  location?: string;
  visibility?: 'Everyone' | 'Friends' | 'Only Me';
  mediaUrl?: string;
  textOverlays?: TextOverlayItem[];
  stickers?: string[];
}

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  uses: string;
  duration: string;
  category: 'Trending' | 'Pakistani' | 'Punjabi' | 'English' | 'Arabic' | 'Hindi' | 'Viral';
  coverColor: string;
  bpm: number;
  freq: number;
}

export interface FilterItem {
  id: string;
  name: string;
  category: 'Beauty' | 'Vintage' | 'Cinematic' | 'Glam' | 'Funny' | 'Anime' | 'Dark' | 'Golden';
  css: string;
  accent: string;
}

export interface BeautySettings {
  smooth: number;
  whitening: number;
  slim: number;
}

export interface TextOverlayItem {
  id: string;
  text: string;
  font: 'Poppins' | 'Bold' | 'Cursive';
  color: string;
  animation: 'Fade' | 'Pop' | 'Slide';
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other' | 'system' | string;
  senderName?: string;
  isAdmin?: boolean;
  text?: string;
  sourceLang?: AppLanguage;
  type: 'text' | 'voice' | 'image' | 'video' | 'sticker' | 'system' | 'blast';
  duration?: string;
  mediaUrl?: string;
  time: string;
  read?: boolean;
  isSecret?: boolean;
  expiresAt?: number;
}

export interface PinnedMessageInfo {
  messageId: string;
  text: string;
  senderName: string;
  pinnedBy: string;
}

export interface ChatThread {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  unreadColor?: 'red' | 'yellow';
  rightIcon?: 'camera' | 'bell' | 'chevron' | 'tick' | 'none';
  hasMic?: boolean;
  isOnline?: boolean;
  isStoryActive?: boolean;
  statusText: string;
  mutedMessages?: boolean;
  mutedCalls?: boolean;
  pinned?: boolean;
  pinnedMessage?: PinnedMessageInfo | null;
  wallpaper?: string;
  alertTone?: string;
  messages: ChatMessage[];
}

export type SuperGroupType =
  | 'Public'
  | 'Private'
  | 'VIP Only'
  | 'Host Fan'
  | 'City'
  | 'Couple'
  | 'Family';

export type GroupCityName = 'Lahore' | 'Karachi' | 'Islamabad' | 'Rawalpindi' | 'Multan';

export interface GroupMemberItem {
  id: string;
  name: string;
  avatar: string;
  isAdmin?: boolean;
  online?: boolean;
  mutedUntilLabel?: string;
}

export interface GroupChatItem {
  id: string;
  name: string;
  avatar: string;
  coverPhoto?: string;
  description?: string;
  rules?: string;
  groupType: SuperGroupType;
  city?: GroupCityName;
  hostName?: string;
  inviteLink?: string;
  maxMembers?: number;
  isJoined?: boolean;
  unreadCount?: number;
  activityScore?: number;
  members: GroupMemberItem[];
  joinRequests?: { id: string; name: string; avatar: string }[];
  muted?: boolean;
  pinned?: boolean;
  pinnedMessage?: PinnedMessageInfo | null;
  dailyTaskMessages?: number;
  dailyTaskClaimed?: boolean;
  battleScore?: number;
  rivalScore?: number;
  rivalName?: string;
  hasBattleCrown?: boolean;
  messages: ChatMessage[];
  media: string[];
  videos?: string[];
}

export interface PartySeat {
  seatIndex: number;
  occupied: boolean;
  isHost?: boolean;
  userName?: string;
  avatar?: string;
  level?: number;
  micOn?: boolean;
  isUser?: boolean;
}

export interface PartyRoomItem {
  id: string;
  name: string;
  hostName: string;
  cover: string;
  country: 'Pakistan' | 'Philippines' | 'Nepal' | 'India';
  flag: string;
  tag: 'Make Friends' | 'Chatting' | 'Music';
  seatCount: number;
  viewers: string;
  isFollowing?: boolean;
  pkActive?: boolean;
  pkRedScore?: number;
  pkBlueScore?: number;
  songTitle?: string;
  songArtist?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  country: string;
  flag: string;
  avatar: string;
  level: number;
  coins: number;
  trend: 'up' | 'down';
  isFriend?: boolean;
  following?: boolean;
  title?: string;
}

export interface GiftItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  gradient: string;
}

export interface OtherUserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified?: boolean;
  followingCount: string;
  followersCount: string;
  likesCount: string;
  bio: string;
  isFollowing: boolean;
  highlights: { id: string; title: string; image: string }[];
  videos: ShortVideoItem[];
}

// HISSA 24 FINAL: SHADI + COUPLE + BIRTHDAY SYSTEM
export interface ShadiState {
  isMarried: boolean;
  partnerName: string;
  partnerHandle: string;
  partnerAvatar: string;
  marriedDate: string;
  popularScore: number;
  divorcePending: boolean;
  divorceDaysLeft: number; // 7-day mandatory wait
}

export interface MarriedCoupleEntry {
  id: string;
  partner1Name: string;
  partner1Handle: string;
  partner1Avatar: string;
  partner2Name: string;
  partner2Handle: string;
  partner2Avatar: string;
  marriedDate: string;
  popularityScore: number;
  hearts: number;
  isUserCouple?: boolean;
}

export interface CoupleRoomState {
  talkSecondsToday: number;
  dailyRewardClaimed: boolean;
  streakDays: number;
  activeSongIndex: number;
  isPlayingSong: boolean;
  movieScreenShare: boolean;
  messages: ChatMessage[];
}

export interface BirthdayUserEntry {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  ageText?: string;
  isSelf?: boolean;
  wishedCount: number;
  giftCoinsReceived: number;
}

export interface BirthdayState {
  myBirthDate: string; // e.g. '1999-11-17' or user input
  isMyBirthdayToday: boolean;
  birthdayBonusClaimed: boolean;
  tomorrowReminderSent: boolean;
  birthdaysToday: BirthdayUserEntry[];
}

// HISSA 25 FINAL: LUCKY SPIN + MYSTERY BOX + COIN RAIN + DAILY REWARD
export interface LuckySpinSlice {
  id: string;
  label: string;
  type: 'coins' | 'vipFrame' | 'freeGift';
  amount: number;
  color: string;
  weight: number;
}

export interface LuckySpinState {
  spinsUsedToday: number;
  extraSpinsEarned: number; // max 2 extra (1 free + 2 invite = max 3/day)
  tickerFeed: string[];
}

export type MysteryBoxTierId = 'chota' | 'bara' | 'king';

export interface MysteryBoxTier {
  id: MysteryBoxTierId;
  name: string;
  pricePkr: number;
  costCoins: number;
  minCoins: number;
  maxCoins: number;
  gradient: string;
  desc: string;
}

export interface MysteryBoxHistoryItem {
  id: string;
  dayLabel: 'Aaj' | 'Kal';
  boxName: string;
  prizeLabel: string;
  time: string;
}

export interface DailyCheckInState {
  streakDay: number; // 1..7
  claimedToday: boolean;
  treasureFoundIds: string[]; // 5 hidden treasures/day
}

// HISSA 26 FINAL: GAME + KARAOKE + TRUTH & DARE + LIVE POLL + VOICE CHANGER
export type VoiceChangerMode =
  | 'original'
  | 'girl'
  | 'child'
  | 'robot'
  | 'heavy'
  | 'funny';

export interface KaraokeSongItem {
  id: string;
  title: string;
  artist: string;
  category: 'Pakistani' | 'Punjabi' | 'Hindi' | 'English' | 'Arabic';
  lyrics: string[];
  bpm: number;
  freq: number;
}

export interface RoomPollOption {
  id: string;
  label: string;
  votes: number;
}

export interface RoomPollState {
  id: string;
  question: string;
  options: RoomPollOption[];
  votedOptionId?: string | null;
  createdAt: number;
  cooldownEndsAt: number; // 30 minutes cooldown
}

// HISSA 27 FINAL: DAILY KING / WEEKLY QUEEN + REFERRAL KING + LUCKY NUMBER + CHALLENGE
export interface KingQueenEntry {
  rank: number;
  id: string;
  name: string;
  handle: string;
  avatar: string;
  coins: number;
  titleBadge?: string; // e.g. '1st Queen', '2nd Princess', '3rd Princess', 'Aaj Ka King'
  isUser?: boolean;
}

export interface ReferralFriendItem {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isRealAccount: boolean; // Anti-fake check
  invitedRewardClaimed: boolean; // +100 Coins
  rechargedFirstTime: boolean; // +200 Coins
  watchedSevenDays: boolean; // +100 Coins
  daysWatched: number;
}

export interface ReferralKingState {
  code: string;
  link: string;
  friends: ReferralFriendItem[];
  referralKingBonusClaimed: boolean;
}

export interface DailyChallengeItem {
  id: string;
  title: string;
  rewardCoins: number;
  progress: number;
  target: number;
  unit?: string;
  completed: boolean;
  actionType: 'invite' | 'rooms' | 'gift' | 'watchLive';
}


