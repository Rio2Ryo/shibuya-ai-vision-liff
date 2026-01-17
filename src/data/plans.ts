import type { Plan } from '../types';

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    nameJa: '無料で贈る',
    price: 0,
    priceDisplay: '無料',
    description: 'Xやサイトから無料でメッセージを投稿できます。放映は抽選になります。',
    features: [
      '1日1通投稿可能',
      '放映希望日の2日前に投稿',
      '放映は抽選',
      '40文字以内のメッセージ',
      'YouTubeアーカイブあり',
    ],
    type: 'free',
    isGuaranteed: false,
    maxMessagesPerDay: 1,
    allowsDecoration: false,
    allowsCard: false,
  },
  {
    id: 'team9',
    name: 'TEAM愛9',
    nameJa: 'TEAM愛9で贈る',
    price: 500,
    priceDisplay: '月額500円',
    description: '有料会員になると当選確率がアップし、放映枠の指定も可能になります。',
    features: [
      '1日2通投稿可能',
      '当選確率アップ',
      '放映決定の事前通知',
      '放映枠の指定可能（おめあり祭・誕生祭）',
      '40文字以内のメッセージ',
      'YouTubeアーカイブあり',
    ],
    type: 'team9',
    isGuaranteed: false,
    maxMessagesPerDay: 2,
    allowsDecoration: false,
    allowsCard: false,
  },
  {
    id: 'reservation',
    name: 'Reservation',
    nameJa: '事前予約で贈る',
    price: 8800,
    priceDisplay: '8,800円〜',
    description: '確実に放映したい方向け。愛デコや愛カードで特別な演出が可能です。',
    features: [
      '確実に放映（先着順）',
      '1年前から予約可能',
      '40文字または120文字スクロール',
      '放映順番の事前通知',
      '愛デコで装飾可能',
      '愛カード（QR付）対応',
      'YouTubeアーカイブあり',
    ],
    type: 'reservation',
    isGuaranteed: true,
    maxMessagesPerDay: 99,
    allowsDecoration: true,
    allowsCard: true,
  },
  {
    id: 'omeari23b',
    name: 'Omeari 23B',
    nameJa: 'おめあり祭23Bで贈る',
    price: 3300,
    priceDisplay: '3,300円',
    description: '当日18:59まで予約可能！23時台に20秒間放映されます。',
    features: [
      '確実に放映（先着順）',
      '当日18:59まで予約可能',
      '毎日23:00〜23:05に放映',
      '20秒間放映',
      '40文字以内のメッセージ',
    ],
    type: 'omeari23b',
    isGuaranteed: true,
    maxMessagesPerDay: 99,
    allowsDecoration: false,
    allowsCard: false,
  },
];

export const getPlanById = (id: string): Plan | undefined => {
  return PLANS.find(plan => plan.id === id);
};

export const getGuaranteedPlans = (): Plan[] => {
  return PLANS.filter(plan => plan.isGuaranteed);
};

export const getFreePlans = (): Plan[] => {
  return PLANS.filter(plan => !plan.isGuaranteed);
};
