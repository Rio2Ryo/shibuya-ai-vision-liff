/**
 * アプリケーション定数
 */

// メッセージの制約
export const MESSAGE_CONSTRAINTS = {
  MAX_CHARS_PER_LINE: 8,
  MAX_LINES: 5,
  MAX_TOTAL_CHARS: 40
} as const;

// プラン情報
export const PLANS = {
  FREE: {
    id: 'free',
    name: '無料プラン',
    price: 0,
    icon: '🎁',
    description: '抽選で放映（1日1通まで）',
    features: ['抽選で放映', '1日1通まで', 'YouTube LIVEで確認']
  },
  TEAM_AI9: {
    id: 'team_ai9',
    name: 'TEAM愛9',
    price: 500,
    priceUnit: '/月',
    icon: '💎',
    description: '月額500円で当選確率UP',
    features: ['当選確率UP', '1日2通まで', '優先表示'],
    recommended: true
  },
  ADVANCE_RESERVATION: {
    id: 'advance_reservation',
    name: '事前予約',
    price: 8800,
    icon: '⭐',
    description: '8,800円〜で確実に放映',
    features: ['確実放映', '愛デコ対応', '愛カード対応']
  },
  OMEARI_23B: {
    id: 'omeari_23b',
    name: 'おめあり祭23B',
    price: 3300,
    icon: '🌙',
    description: '3,300円で当日予約OK（23時台放映）',
    features: ['当日予約OK', '23時台放映', '確実放映']
  }
} as const;

// お祝いの種類
export const OCCASION_TYPES = [
  { id: 'birthday', name: '誕生日', icon: '🎂', emoji: '🎂' },
  { id: 'anniversary', name: '記念日', icon: '💍', emoji: '💍' },
  { id: 'gratitude', name: '感謝', icon: '🙏', emoji: '🙏' },
  { id: 'celebration', name: 'お祝い', icon: '🎉', emoji: '🎉' },
  { id: 'other', name: 'その他', icon: '✨', emoji: '✨' }
] as const;

// 注文ステータス
export const ORDER_STATUS = {
  PENDING: { id: 'pending', name: '申込み待ち', icon: '⏳', color: 'yellow' },
  CONFIRMED: { id: 'confirmed', name: '確定済み', icon: '✅', color: 'green' },
  PAID: { id: 'paid', name: '支払い済み', icon: '💰', color: 'blue' },
  SCHEDULED: { id: 'scheduled', name: '放映予定', icon: '📅', color: 'purple' },
  COMPLETED: { id: 'completed', name: '放映完了', icon: '📺', color: 'gray' },
  CANCELLED: { id: 'cancelled', name: 'キャンセル', icon: '❌', color: 'red' }
} as const;

// AIの応答テンプレート
export const AI_RESPONSES = {
  WELCOME: `こんにちは！渋谷愛ビジョンへようこそ 💕

渋谷の大型ビジョンで、大切な人に「おめでとう」「ありがとう」のメッセージを届けませんか？

まず、メッセージを贈りたい相手のお名前を教えてください✨`,

  ASK_OCCASION: (name: string) => `${name}さんへのメッセージですね！素敵です ✨

どんなお祝いや感謝を伝えたいですか？

🎂 誕生日おめでとう
💍 記念日のお祝い
🙏 ありがとうを伝えたい
🎉 その他のお祝い

教えてください！`,

  ASK_DATE: (name: string, occasion: string) => `${name}さんへの${occasion}のメッセージですね！💕

放映を希望する日付を教えてください。
（例：1月25日、来週の土曜日、など）

💡 誕生日の場合は、午前0時の「誕生祭」枠がおすすめです！`,

  ASK_MESSAGE: (date: string) => `${date}の放映ですね！📅

それでは、メッセージを作りましょう！

📝 メッセージのルール
・8文字×5行（合計40文字以内）
・すべて全角文字で入力

メッセージを入力するか、「AIに提案してもらう」と言ってください！`,

  ORDER_COMPLETE: (orderId: string, name: string) => `🎉 ご注文ありがとうございます！

注文ID: ${orderId}

${name}さんへのメッセージを受け付けました。

✅ 放映が確定しましたら、LINEでお知らせします。

渋谷愛ビジョンで、あなたの想いが届きますように 💕`
} as const;

// クイックリプライの選択肢
export const QUICK_REPLIES = {
  OCCASIONS: [
    { text: '🎂 誕生日', value: 'birthday' },
    { text: '💍 記念日', value: 'anniversary' },
    { text: '🙏 感謝', value: 'gratitude' },
    { text: '🎉 お祝い', value: 'celebration' }
  ],
  DATE_SUGGESTIONS: [
    { text: '今週末', value: 'this_weekend' },
    { text: '来週', value: 'next_week' },
    { text: '1ヶ月以内', value: 'within_month' }
  ],
  MESSAGE_OPTIONS: [
    { text: 'AIに提案してもらう', value: 'ai_suggest' },
    { text: '自分で入力する', value: 'manual_input' }
  ],
  CONFIRMATION: [
    { text: 'OK！注文する', value: 'confirm' },
    { text: 'キャンセル', value: 'cancel' }
  ]
} as const;

// エラーメッセージ
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'ネットワークエラーが発生しました。接続を確認してください。',
  SERVER_ERROR: 'サーバーエラーが発生しました。しばらくしてからお試しください。',
  VALIDATION_ERROR: '入力内容に問題があります。確認してください。',
  LIFF_INIT_ERROR: 'LINEアプリの初期化に失敗しました。',
  UNKNOWN_ERROR: '予期しないエラーが発生しました。'
} as const;

// アニメーション設定
export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    DEFAULT: 'ease-in-out',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
} as const;

// ローカルストレージのキー
export const STORAGE_KEYS = {
  CHAT_HISTORY: 'shibuya_ai_vision_chat_history',
  USER_PREFERENCES: 'shibuya_ai_vision_preferences',
  DRAFT_MESSAGE: 'shibuya_ai_vision_draft'
} as const;

// API エンドポイント
export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  ORDER: '/api/order',
  LINE_NOTIFY: '/api/line-notify'
} as const;
