import {
  IMG_HERO_LIVE,
  IMG_HOST_FEMALE,
  IMG_HOST_MALE,
  IMG_MUSIC_PARTY,
} from './mockData';
import { VipFrameInfo, VipLeaderboardUser, VipLevelInfo } from '../types/mehfil';

function getExtraCoinsForLevel(level: number): number {
  if (level <= 5) return 30000;
  if (level <= 10) return 40000;
  if (level <= 20) return 60000;
  if (level <= 30) return 100000;
  if (level <= 40) return 200000;
  return 500000;
}

function getTierMeta(level: number): {
  tierLabel: string;
  frameName: string;
  entryEffect: string;
  crownStyle: string;
  perks: string[];
} {
  if (level === 1) {
    return {
      tierLabel: 'Royal Gold Starter',
      frameName: 'VIP 1 Gold Frame',
      entryEffect: 'Golden Sparkle Entry',
      crownStyle: 'Classic Gold Crown',
      perks: ['Gold Name', 'VIP 1 Gold Badge', 'Gold Avatar Ring', '1000 PKR / 30,000 Coins'],
    };
  }
  if (level === 2) {
    return {
      tierLabel: 'Noble Entrance',
      frameName: 'VIP 2 Gold Chat Frame',
      entryEffect: 'Special Royal Entry Banner',
      crownStyle: 'Twin Star Gold Crown',
      perks: ['Special Entry Effect', 'VIP Chat Frame', '2x Daily Task Coins', 'All VIP 1 Perks'],
    };
  }
  if (level === 3) {
    return {
      tierLabel: 'Stealth Noble',
      frameName: 'VIP 3 Ad-Free Gold Frame',
      entryEffect: 'Hide Entry Mode (Stealth)',
      crownStyle: 'Shielded Gold Crown',
      perks: ['Hide Room Entry', 'Zero Ads Experience', 'Priority Room Seat', 'All VIP 2 Perks'],
    };
  }
  if (level === 4) {
    return {
      tierLabel: 'Aura Guardian',
      frameName: 'VIP 4 Radiant Avatar Frame',
      entryEffect: 'Neon Gold Spotlight',
      crownStyle: 'Radiant Crest Crown',
      perks: ['Exclusive Avatar Frame', 'Highlight Room Tag', 'Gift Burst Boost', 'All VIP 3 Perks'],
    };
  }
  if (level === 5) {
    return {
      tierLabel: 'Priority Elite',
      frameName: 'VIP 5 Royal Crest Frame',
      entryEffect: 'VIP Carpet Entrance',
      crownStyle: '5-Star Royal Crown',
      perks: ['Private Message Priority', 'Pinned VIP Chat Tag', 'Extra Gift Stickers', 'All VIP 4 Perks'],
    };
  }
  if (level <= 10) {
    return {
      tierLabel: 'Diamond Tier',
      frameName: level === 10 ? 'VIP 10 Diamond Frame' : `VIP ${level} Crystal Gold Frame`,
      entryEffect: 'Diamond Shower Entrance',
      crownStyle: 'Diamond Gold Crown',
      perks: ['Diamond Profile Glow', 'Room Kick Protection', 'VIP Support 24/7', `Tier VIP ${level} Badge`],
    };
  }
  if (level <= 20) {
    return {
      tierLabel: 'King Tier',
      frameName: level === 20 ? 'VIP 20 King Frame' : `VIP ${level} Royal King Frame`,
      entryEffect: 'Golden Chariot Room Entry',
      crownStyle: 'Heavy King Crown',
      perks: ['Heavy Gold Shine Name', 'King Lobby Announcement', 'Mystery Gift Discount', `Tier VIP ${level} Badge`],
    };
  }
  if (level <= 30) {
    return {
      tierLabel: 'Emperor Tier',
      frameName: level === 30 ? 'VIP 30 Emperor Frame' : `VIP ${level} Emperor Aureole`,
      entryEffect: 'Emperor Dragon Entrance',
      crownStyle: 'Imperial Emperor Crown',
      perks: ['Emperor Chat Aura', 'Exclusive PK Multiplier', 'Top Lobby Pinning', `Tier VIP ${level} Badge`],
    };
  }
  if (level <= 40) {
    return {
      tierLabel: 'Imperial Sovereign',
      frameName: `VIP ${level} Imperial Dragon Frame`,
      entryEffect: 'Phoenix Fire Room Arrival',
      crownStyle: 'Blazing Sovereign Crown',
      perks: ['Global Server Entry Banner', 'Custom Room Entrance Sound', 'Guardian Shield', `Tier VIP ${level} Badge`],
    };
  }
  return {
    tierLabel: level === 50 ? 'Supreme King Legend' : 'Supreme Sovereign',
    frameName: level === 50 ? 'VIP 50 Supreme King Red Gold Frame' : `VIP ${level} Crimson Gold Frame`,
    entryEffect: 'Supreme Red-Gold Dragon Roar',
    crownStyle: 'Supreme Red-Gold King Crown',
    perks: [
      'Supreme Red-Gold Glow',
      'VIP 50 Global Hall of Fame',
      'Unlimited Room Entry Effects',
      level === 50 ? 'Max Level Supreme King (89,50,000 Total)' : `Tier VIP ${level} Badge`,
    ],
  };
}

export const VIP_LEVELS_50: VipLevelInfo[] = (() => {
  const list: VipLevelInfo[] = [];
  let runningTotal = 0;
  for (let level = 1; level <= 50; level += 1) {
    const extraCoins = getExtraCoinsForLevel(level);
    runningTotal += extraCoins;
    const meta = getTierMeta(level);
    list.push({
      level,
      name: `VIP ${level}`,
      extraCoins,
      totalCoins: runningTotal,
      tierLabel: meta.tierLabel,
      frameName: meta.frameName,
      entryEffect: meta.entryEffect,
      crownStyle: meta.crownStyle,
      perks: meta.perks,
    });
  }
  return list;
})();

export const VIP_FRAMES_CATALOG: VipFrameInfo[] = [
  {
    id: 'frame-1',
    minLevel: 1,
    title: 'VIP 1 Gold Frame',
    badgeText: 'VIP 1',
    entryText: 'entered on a Golden Sparkle Trail!',
    ringClass: 'bg-gradient-to-tr from-amber-500 via-[#FFD700] to-yellow-300',
    glowClass: 'shadow-[0_0_24px_rgba(255,215,0,0.65)]',
    badgeGradient: 'from-amber-400 to-yellow-600',
    crownColor: 'text-[#FFD700]',
  },
  {
    id: 'frame-10',
    minLevel: 10,
    title: 'VIP 10 Diamond Frame',
    badgeText: 'VIP 10',
    entryText: 'arrived with a Crystal Diamond Shower!',
    ringClass: 'bg-gradient-to-tr from-cyan-400 via-sky-300 to-indigo-500',
    glowClass: 'shadow-[0_0_28px_rgba(56,189,248,0.7)]',
    badgeGradient: 'from-cyan-400 to-blue-600',
    crownColor: 'text-cyan-300',
  },
  {
    id: 'frame-20',
    minLevel: 20,
    title: 'VIP 20 King Frame',
    badgeText: 'VIP 20',
    entryText: 'rode in on the Royal Golden Chariot!',
    ringClass: 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-amber-300',
    glowClass: 'shadow-[0_0_32px_rgba(245,158,11,0.75)]',
    badgeGradient: 'from-yellow-400 via-amber-500 to-orange-600',
    crownColor: 'text-amber-300',
  },
  {
    id: 'frame-30',
    minLevel: 30,
    title: 'VIP 30 Emperor Frame',
    badgeText: 'VIP 30',
    entryText: 'descended with an Imperial Purple Aureole!',
    ringClass: 'bg-gradient-to-tr from-purple-500 via-fuchsia-400 to-[#FFD700]',
    glowClass: 'shadow-[0_0_34px_rgba(192,132,252,0.8)]',
    badgeGradient: 'from-purple-600 via-fuchsia-500 to-amber-400',
    crownColor: 'text-fuchsia-300',
  },
  {
    id: 'frame-40',
    minLevel: 40,
    title: 'VIP 40 Imperial Dragon Frame',
    badgeText: 'VIP 40',
    entryText: 'blazed in with Phoenix Gold Wings!',
    ringClass: 'bg-gradient-to-tr from-emerald-400 via-[#FFD700] to-teal-500',
    glowClass: 'shadow-[0_0_36px_rgba(16,185,129,0.75)]',
    badgeGradient: 'from-emerald-500 via-teal-500 to-amber-400',
    crownColor: 'text-emerald-300',
  },
  {
    id: 'frame-50',
    minLevel: 50,
    title: 'VIP 50 Supreme King Red Gold Frame',
    badgeText: 'VIP 50',
    entryText: 'commanded the room — SUPREME KING HAS ARRIVED!',
    ringClass: 'bg-gradient-to-tr from-red-600 via-[#FFD700] to-rose-500 ring-2 ring-[#FFD700]',
    glowClass: 'shadow-[0_0_40px_rgba(239,68,68,0.85)]',
    badgeGradient: 'from-red-600 via-amber-500 to-yellow-400',
    crownColor: 'text-red-400',
  },
];

export const VIP_TOP_100_USERS: VipLeaderboardUser[] = (() => {
  const fixedKings: VipLeaderboardUser[] = [
    { rank: 1, id: 'vk-1', name: 'Sultan Ali PK', avatar: IMG_HOST_MALE, country: 'PK', flag: '🇵🇰', vipLevel: 50, badgeTier: 50, coins: 9850000, giftCoins: 5400000, hostCoins: 4450000 },
    { rank: 2, id: 'vk-2', name: 'Emperor Lin Wei', avatar: IMG_HERO_LIVE, country: 'Global', flag: '🇨🇳', vipLevel: 50, badgeTier: 50, coins: 9240000, giftCoins: 6100000, hostCoins: 3140000 },
    { rank: 3, id: 'vk-3', name: 'Ayesha Queen', avatar: IMG_HOST_FEMALE, country: 'PK', flag: '🇵🇰', vipLevel: 50, badgeTier: 50, coins: 8960000, giftCoins: 4100000, hostCoins: 4860000 },
    { rank: 4, id: 'vk-4', name: 'Sheikh Mansoor', avatar: IMG_HOST_MALE, country: 'Global', flag: '🇦🇪', vipLevel: 48, badgeTier: 40, coins: 7420000, giftCoins: 5800000, hostCoins: 1620000 },
    { rank: 5, id: 'vk-5', name: 'Hania Khan', avatar: IMG_HOST_FEMALE, country: 'PK', flag: '🇵🇰', vipLevel: 45, badgeTier: 40, coins: 6810000, giftCoins: 2900000, hostCoins: 3910000 },
    { rank: 6, id: 'vk-6', name: 'Emre Yilmaz', avatar: IMG_HOST_MALE, country: 'Global', flag: '🇹🇷', vipLevel: 43, badgeTier: 40, coins: 6150000, giftCoins: 3400000, hostCoins: 2750000 },
    { rank: 7, id: 'vk-7', name: 'Zainab Malik', avatar: IMG_HERO_LIVE, country: 'PK', flag: '🇵🇰', vipLevel: 39, badgeTier: 30, coins: 5480000, giftCoins: 2100000, hostCoins: 3380000 },
    { rank: 8, id: 'vk-8', name: 'Chloe Carter', avatar: IMG_HOST_FEMALE, country: 'Global', flag: '🇺🇸', vipLevel: 36, badgeTier: 30, coins: 4920000, giftCoins: 3100000, hostCoins: 1820000 },
    { rank: 9, id: 'vk-9', name: 'Usman Sher', avatar: IMG_HOST_MALE, country: 'PK', flag: '🇵🇰', vipLevel: 32, badgeTier: 30, coins: 4350000, giftCoins: 2450000, hostCoins: 1900000 },
    { rank: 10, id: 'vk-10', name: 'Lucas Silva', avatar: IMG_MUSIC_PARTY, country: 'Global', flag: '🇧🇷', vipLevel: 28, badgeTier: 20, coins: 3890000, giftCoins: 1980000, hostCoins: 1910000 },
  ];

  const names = [
    'Hamza Sheikh', 'Ms SHIZUKA', 'MUNI DON', 'Fatima Noor', 'Aarav Sharma', 'Yuki Tanaka',
    'Min-Jae Kim', 'Danish Shah', 'Sana Malik', 'Fahad Khan', 'Oliver Smith', 'Elena Rossi',
    'Budi Santoso', 'Nadia Rahman', 'Linh Nguyen', 'Ivan Petrov', 'Mateo Santos', 'Bilal King',
    'Kiran Shah', 'Taimoor Khan', 'Hira Qureshi', 'Rhea Kapoor', 'Arsalan PK', 'Mahira Noor',
  ];
  const flags = [
    { c: 'PK' as const, f: '🇵🇰' },
    { c: 'Global' as const, f: '🇺🇸' },
    { c: 'PK' as const, f: '🇵🇰' },
    { c: 'Global' as const, f: '🇬🇧' },
    { c: 'Global' as const, f: '🇦🇪' },
    { c: 'Global' as const, f: '🇮🇳' },
    { c: 'Global' as const, f: '🇨🇳' },
    { c: 'Global' as const, f: '🇹🇷' },
    { c: 'Global' as const, f: '🇰🇷' },
    { c: 'Global' as const, f: '🇯🇵' },
  ];
  const avatars = [IMG_HOST_MALE, IMG_HOST_FEMALE, IMG_HERO_LIVE, IMG_MUSIC_PARTY];
  const tiers: (50 | 40 | 30 | 20 | 10)[] = [50, 40, 30, 20, 10];

  const rest: VipLeaderboardUser[] = Array.from({ length: 90 }, (_, i) => {
    const rank = i + 11;
    const region = flags[i % flags.length];
    const tier = tiers[i % tiers.length];
    const vipLevel =
      tier === 50
        ? 50
        : tier === 40
          ? 40 + (i % 9)
          : tier === 30
            ? 30 + (i % 9)
            : tier === 20
              ? 20 + (i % 9)
              : 10 + (i % 9);
    const coins = Math.max(120000, 3750000 - i * 39000);
    return {
      rank,
      id: `vk-${rank}`,
      name: `${names[i % names.length]}${rank > 34 ? ` #${rank}` : ''}`,
      avatar: avatars[i % avatars.length],
      country: region.c,
      flag: region.f,
      vipLevel,
      badgeTier: tier,
      coins,
      giftCoins: Math.round(coins * (i % 2 === 0 ? 0.65 : 0.4)),
      hostCoins: Math.round(coins * (i % 2 === 0 ? 0.35 : 0.6)),
    };
  });

  return [...fixedKings, ...rest];
})();
