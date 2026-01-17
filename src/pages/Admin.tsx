import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus, Plan, OrderStats } from '../types/order';
import { orderService } from '../services/orderService';

// ステータスの表示名
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '申込み待ち',
  confirmed: '確定済み',
  paid: '支払い済み',
  scheduled: '放映予定',
  broadcast: '放映中',
  broadcasted: '放映完了',
  completed: '完了',
  cancelled: 'キャンセル',
};

// ステータスの色
const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
  broadcast: 'bg-pink-100 text-pink-800 border-pink-200',
  broadcasted: 'bg-gray-100 text-gray-800 border-gray-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

// ステータスアイコン
const STATUS_ICONS: Record<OrderStatus, string> = {
  pending: '⏳',
  confirmed: '✅',
  paid: '💰',
  scheduled: '📅',
  broadcast: '📺',
  broadcasted: '📺',
  completed: '🎉',
  cancelled: '❌',
};

type TabType = 'dashboard' | 'orders' | 'plans' | 'analytics';

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // トースト自動非表示
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

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
      setShowToast({ message: 'データの読み込みに失敗しました', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      await loadData();
      setSelectedOrder(null);
      setShowToast({ message: 'ステータスを更新しました', type: 'success' });
    } catch (error) {
      setShowToast({ message: 'ステータスの更新に失敗しました', type: 'error' });
    }
  };

  const handleGenerateDemoData = async () => {
    await orderService.generateDemoData();
    await loadData();
    setShowToast({ message: 'デモデータを生成しました', type: 'success' });
  };

  // フィルタリングされた注文
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-pink-400 rounded-full animate-ping opacity-25"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl animate-pulse">✨</span>
            </div>
          </div>
          <p className="text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">✨</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">渋谷愛ビジョン</h1>
              <p className="text-xs text-gray-500">管理画面</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateDemoData}
              className="px-4 py-2 text-sm text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
            >
              + デモデータ
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ← ユーザー画面
            </button>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { id: 'dashboard', label: 'ダッシュボード', icon: '📊' },
              { id: 'orders', label: '注文管理', icon: '📋' },
              { id: 'plans', label: 'プラン管理', icon: '💎' },
              { id: 'analytics', label: '分析', icon: '📈' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-4 border-b-2 transition-all duration-200 font-medium ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-600 bg-pink-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
        {/* ダッシュボード */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6 animate-fade-in">
            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="総注文数"
                value={stats.totalOrders}
                icon="📦"
                color="blue"
                trend={+12}
              />
              <StatCard
                title="本日の注文"
                value={stats.todayOrders}
                icon="📅"
                color="green"
                trend={+5}
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
                trend={+23}
              />
            </div>

            {/* ステータス別サマリー */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">ステータス別サマリー</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(STATUS_LABELS).map(([status, label]) => {
                  const count = orders.filter(o => o.status === status).length;
                  return (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status as OrderStatus);
                        setActiveTab('orders');
                      }}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${STATUS_COLORS[status as OrderStatus]}`}
                    >
                      <div className="text-2xl mb-1">{STATUS_ICONS[status as OrderStatus]}</div>
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-xs opacity-75">{label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 最近の注文 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">最近の注文</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  すべて見る →
                </button>
              </div>
              {orders.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">📭</div>
                  <p className="text-gray-500 mb-4">注文がありません</p>
                  <button
                    onClick={handleGenerateDemoData}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    デモデータを生成
                  </button>
                </div>
              ) : (
                <div className="divide-y">
                  {orders.slice(0, 5).map((order, index) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onClick={() => setSelectedOrder(order)}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 注文管理 */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
            {/* 検索・フィルター */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="注文ID、名前で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                >
                  <option value="all">すべてのステータス</option>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 注文一覧 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {filteredOrders.length}件の注文
                  </span>
                  {statusFilter !== 'all' && (
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="text-sm text-pink-600 hover:text-pink-700"
                    >
                      フィルターをクリア
                    </button>
                  )}
                </div>
              </div>
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-500">該当する注文がありません</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredOrders.map((order, index) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onClick={() => setSelectedOrder(order)}
                      showDetails
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* プラン管理 */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {plans.map((plan, index) => (
              <PlanCard key={plan.id} plan={plan} index={index} />
            ))}
          </div>
        )}

        {/* 分析 */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">📈 売上推移</h2>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <p>グラフ機能は今後追加予定です</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">🎂 お祝いの種類</h2>
                <div className="space-y-3">
                  {['誕生日', '記念日', '感謝', 'お祝い'].map((occasion, i) => {
                    const count = orders.filter(o => o.occasion.includes(occasion)).length;
                    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                    return (
                      <div key={occasion}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{occasion}</span>
                          <span className="text-gray-500">{count}件</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, transitionDelay: `${i * 100}ms` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">💎 プラン別注文</h2>
                <div className="space-y-3">
                  {plans.map((plan, i) => {
                    const count = orders.filter(o => o.planId === plan.id || o.planName === plan.name).length;
                    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                    return (
                      <div key={plan.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{plan.name}</span>
                          <span className="text-gray-500">{count}件</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, transitionDelay: `${i * 100}ms` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
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

      {/* トースト通知 */}
      {showToast && (
        <div className={`toast ${showToast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {showToast.type === 'success' ? '✓' : '✕'} {showToast.message}
        </div>
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
  trend,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'pink';
  trend?: number;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    pink: 'bg-pink-50 text-pink-600 border-pink-100',
  };

  const bgGradients = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bgGradients[color]} flex items-center justify-center text-2xl text-white shadow-lg`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// 注文行コンポーネント
function OrderRow({
  order,
  onClick,
  showDetails = false,
  index = 0,
}: {
  order: Order;
  onClick: () => void;
  showDetails?: boolean;
  index?: number;
}) {
  return (
    <div
      onClick={onClick}
      className="p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-pink-600 font-bold text-lg">
              {order.recipientName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{order.recipientName}さんへ</p>
            <p className="text-sm text-gray-500">
              {order.occasion} • {order.broadcastDate}
            </p>
            {showDetails && (
              <p className="text-xs text-gray-400 mt-1">ID: {order.id}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status]}`}>
            {STATUS_ICONS[order.status]} {STATUS_LABELS[order.status]}
          </span>
          {showDetails && (
            <span className="text-sm font-medium text-gray-700">
              ¥{order.price.toLocaleString()}
            </span>
          )}
          <span className="text-gray-400">→</span>
        </div>
      </div>
      {showDetails && order.messageLines && (
        <div className="mt-3 ml-16">
          <div className="bg-gray-50 rounded-xl p-3 font-mono text-sm text-center border">
            {order.messageLines.map((line, i) => (
              <div key={i} className="text-gray-700">{line || '　'}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// プランカードコンポーネント
function PlanCard({ plan, index = 0 }: { plan: Plan; index?: number }) {
  const gradients = [
    'from-green-400 to-emerald-500',
    'from-blue-400 to-indigo-500',
    'from-purple-400 to-pink-500',
    'from-indigo-400 to-purple-500',
  ];

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in-up ${!plan.isActive ? 'opacity-50' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`h-2 bg-gradient-to-r ${gradients[index % gradients.length]}`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {plan.isActive ? '✓ 有効' : '無効'}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{plan.description}</p>
        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-6">
          ¥{plan.price.toLocaleString()}
          {plan.id === 'team-ai9' && <span className="text-lg font-normal text-gray-500">/月</span>}
        </p>
        <ul className="space-y-2">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        <div className="p-6 border-b sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📋</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">注文詳細</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 基本情報 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <span>📝</span> 基本情報
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">注文ID</span>
                <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">{order.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">贈る相手</span>
                <span className="font-medium">{order.recipientName}さん</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">お祝いの種類</span>
                <span>{order.occasion}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">放映希望日</span>
                <span>{order.broadcastDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">プラン</span>
                <span className="font-medium">{order.planName}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-600">料金</span>
                <span className="text-xl font-bold text-pink-600">¥{order.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* メッセージ */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <span>💬</span> メッセージ
            </h3>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 font-mono text-center text-white shadow-lg">
              {order.messageLines.map((line, i) => (
                <div key={i} className="text-lg leading-relaxed">{line || '　'}</div>
              ))}
            </div>
          </div>

          {/* ステータス変更 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <span>🔄</span> ステータス変更
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(['pending', 'confirmed', 'paid', 'scheduled', 'broadcasted', 'cancelled'] as OrderStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(order.id, status)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    order.status === status
                      ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {STATUS_ICONS[status]} {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>

          {/* タイムスタンプ */}
          <div className="text-xs text-gray-400 space-y-1 bg-gray-50 rounded-xl p-4">
            <p>📅 作成: {new Date(order.createdAt).toLocaleString('ja-JP')}</p>
            <p>🔄 更新: {new Date(order.updatedAt).toLocaleString('ja-JP')}</p>
            {order.confirmedAt && <p>✅ 確定: {new Date(order.confirmedAt).toLocaleString('ja-JP')}</p>}
            {order.broadcastedAt && <p>📺 放映: {new Date(order.broadcastedAt).toLocaleString('ja-JP')}</p>}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
