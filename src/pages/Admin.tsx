import { useState, useEffect } from 'react';
import { Order, OrderStatus, Plan, OrderStats } from '../types/order';
import { orderService } from '../services/orderService';

// ステータスの表示名
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '申込み待ち',
  confirmed: '確定済み',
  paid: '支払い済み',
  scheduled: '放映予定',
  broadcasted: '放映完了',
  cancelled: 'キャンセル',
};

// ステータスの色
const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  scheduled: 'bg-purple-100 text-purple-800',
  broadcasted: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

type TabType = 'dashboard' | 'orders' | 'plans';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordersData, plansData, statsData] = await Promise.all([
        orderService.getOrders(),
        orderService.getAllPlans(),
        orderService.getStats(),
      ]);
      setOrders(ordersData);
      setPlans(plansData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await orderService.updateOrderStatus(orderId, newStatus);
    await loadData();
    setSelectedOrder(null);
  };

  const handleGenerateDemoData = async () => {
    await orderService.generateDemoData();
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">✨</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">渋谷愛ビジョン</h1>
              <p className="text-xs text-gray-500">管理画面</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← ユーザー画面に戻る
          </button>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-8">
            {[
              { id: 'dashboard', label: 'ダッシュボード', icon: '📊' },
              { id: 'orders', label: '注文管理', icon: '📋' },
              { id: 'plans', label: 'プラン管理', icon: '💎' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="総注文数"
                value={stats.totalOrders}
                icon="📦"
                color="blue"
              />
              <StatCard
                title="本日の注文"
                value={stats.todayOrders}
                icon="📅"
                color="green"
              />
              <StatCard
                title="確認待ち"
                value={stats.pendingOrders}
                icon="⏳"
                color="yellow"
              />
              <StatCard
                title="今月の売上"
                value={`¥${stats.monthlyRevenue.toLocaleString()}`}
                icon="💰"
                color="pink"
              />
            </div>

            {/* 最近の注文 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">最近の注文</h2>
                <button
                  onClick={handleGenerateDemoData}
                  className="text-sm text-pink-600 hover:text-pink-700"
                >
                  デモデータを生成
                </button>
              </div>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">注文がありません</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onClick={() => setSelectedOrder(order)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">注文一覧</h2>
            </div>
            {orders.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">注文がありません</p>
                <button
                  onClick={handleGenerateDemoData}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  デモデータを生成
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onClick={() => setSelectedOrder(order)}
                    showDetails
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </main>

      {/* 注文詳細モーダル */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

// 統計カードコンポーネント
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'pink';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// 注文行コンポーネント
function OrderRow({
  order,
  onClick,
  showDetails = false,
}: {
  order: Order;
  onClick: () => void;
  showDetails?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
            <span className="text-pink-600 font-bold">
              {order.recipientName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{order.recipientName}さんへ</p>
            <p className="text-sm text-gray-500">
              {order.occasion} • {order.broadcastDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
          {showDetails && (
            <span className="text-sm text-gray-500">
              ¥{order.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
      {showDetails && (
        <div className="mt-3 ml-14">
          <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
            {order.messageLines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// プランカードコンポーネント
function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${!plan.isActive ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
        <span className={`px-2 py-1 rounded text-xs ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {plan.isActive ? '有効' : '無効'}
        </span>
      </div>
      <p className="text-gray-600 mb-4">{plan.description}</p>
      <p className="text-2xl font-bold text-pink-600 mb-4">
        ¥{plan.price.toLocaleString()}
        {plan.id === 'team-ai9' && <span className="text-sm font-normal text-gray-500">/月</span>}
      </p>
      <ul className="space-y-2">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-green-500">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

// 注文詳細モーダル
function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">注文詳細</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 基本情報 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">基本情報</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">注文ID</span>
                <span className="font-mono text-sm">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">贈る相手</span>
                <span className="font-medium">{order.recipientName}さん</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">お祝いの種類</span>
                <span>{order.occasion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">放映希望日</span>
                <span>{order.broadcastDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">プラン</span>
                <span>{order.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">料金</span>
                <span className="font-bold text-pink-600">¥{order.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* メッセージ */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">メッセージ</h3>
            <div className="bg-pink-50 rounded-lg p-4 font-mono text-center">
              {order.messageLines.map((line, i) => (
                <div key={i} className="text-lg">{line}</div>
              ))}
            </div>
          </div>

          {/* ステータス変更 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">ステータス変更</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['pending', 'confirmed', 'paid', 'scheduled', 'broadcasted', 'cancelled'] as OrderStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(order.id, status)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    order.status === status
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>

          {/* タイムスタンプ */}
          <div className="text-xs text-gray-400 space-y-1">
            <p>作成日時: {order.createdAt.toLocaleString('ja-JP')}</p>
            <p>更新日時: {order.updatedAt.toLocaleString('ja-JP')}</p>
            {order.confirmedAt && <p>確定日時: {order.confirmedAt.toLocaleString('ja-JP')}</p>}
            {order.broadcastedAt && <p>放映日時: {order.broadcastedAt.toLocaleString('ja-JP')}</p>}
          </div>
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
