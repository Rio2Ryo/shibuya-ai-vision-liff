// 注文管理サービス
// デモ用にローカルストレージを使用（本番ではAPIに置き換え）

import { Order, OrderStatus, Plan, CreateOrderRequest, OrderFilter, OrderStats } from '../types/order';

// デフォルトプラン
export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'free',
    name: '無料プラン',
    description: '抽選で放映（1日1通まで）',
    price: 0,
    features: ['抽選で放映', '1日1通まで', 'YouTube LIVEで確認'],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'team_ai9',
    name: 'TEAM愛9',
    description: '月額500円で当選確率UP',
    price: 500,
    features: ['当選確率UP', '1日2通まで', '優先表示'],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'advance_reservation',
    name: '事前予約',
    description: '8,800円〜で確実に放映',
    price: 8800,
    features: ['確実放映', '愛デコ対応', '愛カード対応', '時間指定可能'],
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'omeari_23b',
    name: 'おめあり祭23B',
    description: '3,300円で当日予約OK（23時台放映）',
    price: 3300,
    features: ['当日予約OK', '23時台放映', '確実放映'],
    isActive: true,
    sortOrder: 4,
  },
];

const STORAGE_KEY = 'shibuya_ai_vision_orders';
const PLANS_STORAGE_KEY = 'shibuya_ai_vision_plans';

// ユーティリティ関数
const generateId = (): string => {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 注文をローカルストレージから取得
const getOrdersFromStorage = (): Order[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// 注文をローカルストレージに保存
const saveOrdersToStorage = (orders: Order[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

// プランをローカルストレージから取得
const getPlansFromStorage = (): Plan[] => {
  try {
    const data = localStorage.getItem(PLANS_STORAGE_KEY);
    if (!data) {
      // デフォルトプランを保存
      savePlansToStorage(DEFAULT_PLANS);
      return DEFAULT_PLANS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_PLANS;
  }
};

// プランをローカルストレージに保存
const savePlansToStorage = (plans: Plan[]): void => {
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
};

export class OrderService {
  // 注文を作成
  async createOrder(request: CreateOrderRequest, userId: string = 'demo-user'): Promise<Order> {
    const plans = getPlansFromStorage();
    const plan = plans.find(p => p.id === request.planId);
    
    if (!plan) {
      throw new Error('Invalid plan ID');
    }

    const now = new Date().toISOString();
    const order: Order = {
      id: generateId(),
      userId,
      recipientName: request.recipientName,
      occasion: request.occasion,
      broadcastDate: request.broadcastDate,
      scheduledDate: request.broadcastDate,
      messageLines: request.messageLines,
      message: request.messageLines.join('\n'),
      planId: request.planId,
      planName: plan.name,
      price: plan.price,
      totalAmount: plan.price,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const orders = getOrdersFromStorage();
    orders.push(order);
    saveOrdersToStorage(orders);

    return order;
  }

  // 注文を取得
  async getOrder(orderId: string): Promise<Order | null> {
    const orders = getOrdersFromStorage();
    return orders.find(o => o.id === orderId) || null;
  }

  // 注文一覧を取得
  async getOrders(filter?: OrderFilter): Promise<Order[]> {
    let orders = getOrdersFromStorage();

    if (filter) {
      if (filter.status) {
        orders = orders.filter(o => o.status === filter.status);
      }
      if (filter.planId) {
        orders = orders.filter(o => o.planId === filter.planId);
      }
      if (filter.dateFrom) {
        const from = new Date(filter.dateFrom);
        orders = orders.filter(o => new Date(o.broadcastDate) >= from);
      }
      if (filter.dateTo) {
        const to = new Date(filter.dateTo);
        orders = orders.filter(o => new Date(o.broadcastDate) <= to);
      }
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        orders = orders.filter(o => 
          o.recipientName.toLowerCase().includes(query) ||
          o.messageLines.some(line => line.toLowerCase().includes(query))
        );
      }
    }

    // 新しい順にソート
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // ユーザーの注文一覧を取得
  async getUserOrders(userId: string): Promise<Order[]> {
    const orders = getOrdersFromStorage();
    return orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // 注文ステータスを更新
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    const orders = getOrdersFromStorage();
    const index = orders.findIndex(o => o.id === orderId);
    
    if (index === -1) return null;

    const now = new Date().toISOString();
    orders[index].status = status;
    orders[index].updatedAt = now;

    if (status === 'confirmed') {
      orders[index].confirmedAt = now;
    } else if (status === 'broadcasted') {
      orders[index].broadcastedAt = now;
    }

    saveOrdersToStorage(orders);
    return orders[index];
  }

  // 注文を削除
  async deleteOrder(orderId: string): Promise<boolean> {
    const orders = getOrdersFromStorage();
    const index = orders.findIndex(o => o.id === orderId);
    
    if (index === -1) return false;

    orders.splice(index, 1);
    saveOrdersToStorage(orders);
    return true;
  }

  // 統計データを取得
  async getStats(): Promise<OrderStats> {
    const orders = getOrdersFromStorage();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      confirmedOrders: orders.filter(o => o.status === 'confirmed' || o.status === 'paid').length,
      todayOrders: orders.filter(o => new Date(o.createdAt) >= today).length,
      totalRevenue: orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.price, 0),
      monthlyRevenue: orders
        .filter(o => o.status !== 'cancelled' && new Date(o.createdAt) >= thisMonth)
        .reduce((sum, o) => sum + o.price, 0),
    };
  }

  // プラン一覧を取得
  async getPlans(): Promise<Plan[]> {
    return getPlansFromStorage().filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // 全プランを取得（管理者用）
  async getAllPlans(): Promise<Plan[]> {
    return getPlansFromStorage().sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // プランを更新
  async updatePlan(planId: string, updates: Partial<Plan>): Promise<Plan | null> {
    const plans = getPlansFromStorage();
    const index = plans.findIndex(p => p.id === planId);
    
    if (index === -1) return null;

    plans[index] = { ...plans[index], ...updates };
    savePlansToStorage(plans);
    return plans[index];
  }

  // デモデータを生成
  async generateDemoData(): Promise<void> {
    const demoOrders: Order[] = [
      {
        id: 'demo_001',
        userId: 'demo-user',
        recipientName: '田中花子',
        occasion: '誕生日',
        broadcastDate: '2026-01-20',
        scheduledDate: '2026-01-20',
        messageLines: ['花子へ', 'お誕生日', 'おめでとう', 'いつも', 'ありがとう♥'],
        message: '花子へ\nお誕生日\nおめでとう\nいつも\nありがとう♥',
        planId: 'advance_reservation',
        planName: '事前予約',
        price: 8800,
        totalAmount: 8800,
        status: 'confirmed',
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-01-15T10:30:00.000Z',
        confirmedAt: '2026-01-15T10:30:00.000Z',
      },
      {
        id: 'demo_002',
        userId: 'demo-user',
        recipientName: '山田太郎',
        occasion: '感謝',
        broadcastDate: '2026-01-18',
        scheduledDate: '2026-01-18',
        messageLines: ['太郎さん', 'いつも', 'ありがとう', 'これからも', 'よろしく♥'],
        message: '太郎さん\nいつも\nありがとう\nこれからも\nよろしく♥',
        planId: 'free',
        planName: '無料プラン',
        price: 0,
        totalAmount: 0,
        status: 'pending',
        createdAt: '2026-01-17T09:00:00.000Z',
        updatedAt: '2026-01-17T09:00:00.000Z',
      },
      {
        id: 'demo_003',
        userId: 'demo-user',
        recipientName: '佐藤美咲',
        occasion: '記念日',
        broadcastDate: '2026-01-25',
        scheduledDate: '2026-01-25',
        messageLines: ['美咲へ', '結婚記念日', 'おめでとう', '愛してる', 'ずっと一緒♥'],
        message: '美咲へ\n結婚記念日\nおめでとう\n愛してる\nずっと一緒♥',
        planId: 'omeari_23b',
        planName: 'おめあり祭23B',
        price: 3300,
        totalAmount: 3300,
        status: 'paid',
        createdAt: '2026-01-16T14:00:00.000Z',
        updatedAt: '2026-01-16T15:00:00.000Z',
        confirmedAt: '2026-01-16T15:00:00.000Z',
      },
    ];

    saveOrdersToStorage(demoOrders);
  }
}

// シングルトンインスタンス
export const orderService = new OrderService();
