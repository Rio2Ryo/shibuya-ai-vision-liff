// 注文関連の型定義

export interface Order {
  id: string;
  userId: string;
  lineUserId?: string;
  recipientName: string;
  occasion: string;
  broadcastDate: string;
  messageLines: string[];
  planId: string;
  planName: string;
  price: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  broadcastedAt?: Date;
}

export type OrderStatus = 
  | 'pending'      // 申込み待ち
  | 'confirmed'    // 確定済み
  | 'paid'         // 支払い済み
  | 'scheduled'    // 放映予定
  | 'broadcasted'  // 放映完了
  | 'cancelled';   // キャンセル

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface User {
  id: string;
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

// 注文作成リクエスト
export interface CreateOrderRequest {
  recipientName: string;
  occasion: string;
  broadcastDate: string;
  messageLines: string[];
  planId: string;
}

// 注文一覧のフィルター
export interface OrderFilter {
  status?: OrderStatus;
  planId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

// 統計データ
export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  todayOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
}
