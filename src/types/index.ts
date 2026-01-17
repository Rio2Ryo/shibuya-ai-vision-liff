// ユーザー関連
export interface User {
  id: string;
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
  membershipType: 'free' | 'team9' | 'premium';
  createdAt: Date;
}

// メッセージ関連
export interface AiVisionMessage {
  id: string;
  userId: string;
  lines: string[]; // 5行のメッセージ（各行最大8文字）
  fullText: string; // 結合されたテキスト（最大40文字）
  recipientName: string; // 贈る相手の名前
  occasion: MessageOccasion;
  broadcastDate: Date;
  broadcastSlot: BroadcastSlot;
  status: MessageStatus;
  createdAt: Date;
}

export type MessageOccasion = 
  | 'birthday' 
  | 'anniversary' 
  | 'graduation' 
  | 'wedding' 
  | 'thanks' 
  | 'congratulations' 
  | 'other';

export type BroadcastSlot = 
  | 'birthday_0am'   // 午前0時〜（誕生祭）
  | 'omeari_12pm'    // お昼12時〜（おめあり祭）
  | 'birthday_7pm'   // 夜19時〜（誕生祭）
  | 'omeari_23b';    // 23時〜（おめあり祭23B）

export type MessageStatus = 
  | 'draft' 
  | 'submitted' 
  | 'pending_lottery' 
  | 'confirmed' 
  | 'broadcast' 
  | 'archived';

// プラン関連
export interface Plan {
  id: string;
  name: string;
  nameJa: string;
  price: number;
  priceDisplay: string;
  description: string;
  features: string[];
  type: PlanType;
  isGuaranteed: boolean; // 確実放映かどうか
  maxMessagesPerDay: number;
  allowsDecoration: boolean; // 愛デコ対応
  allowsCard: boolean; // 愛カード対応
}

export type PlanType = 'free' | 'team9' | 'reservation' | 'omeari23b';

// 注文関連
export interface Order {
  id: string;
  userId: string;
  messageId: string;
  planId: string;
  decorationId?: string;
  cardId?: string;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  createdAt: Date;
  paidAt?: Date;
}

export type OrderStatus = 
  | 'pending' 
  | 'paid' 
  | 'confirmed' 
  | 'cancelled' 
  | 'refunded';

export type PaymentMethod = 'line_pay' | 'credit_card';

// 愛デコ（装飾）
export interface Decoration {
  id: string;
  name: string;
  imageUrl: string;
  category: DecorationCategory;
  price: number;
  isAvailable: boolean;
}

export type DecorationCategory = 
  | 'original' 
  | 'talent' 
  | 'seasonal' 
  | 'custom';

// 愛カード
export interface GreetingCard {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  isAvailable: boolean;
}

// チャット関連
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    suggestedPlan?: Plan;
    suggestedMessage?: string[];
    action?: ChatAction;
  };
}

export type ChatAction = 
  | 'show_plans' 
  | 'create_message' 
  | 'confirm_order' 
  | 'show_history';

// AIコンシェルジュのコンテキスト
export interface ConversationContext {
  currentStep: ConversationStep;
  recipientName?: string;
  occasion?: MessageOccasion;
  broadcastDate?: Date;
  messageLines?: string[];
  selectedPlan?: Plan;
  selectedDecoration?: Decoration;
  selectedCard?: GreetingCard;
}

export type ConversationStep = 
  | 'greeting'
  | 'ask_recipient'
  | 'ask_occasion'
  | 'ask_date'
  | 'create_message'
  | 'select_plan'
  | 'select_options'
  | 'confirm_order'
  | 'complete';
