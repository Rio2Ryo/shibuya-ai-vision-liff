import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '../types/order';
import { orderService } from '../services/orderService';
import { MessagePreview } from '../components/MessagePreview';

// ステータスの日本語表示
const statusLabels: Record<OrderStatus, string> = {
  pending: '申請中',
  confirmed: '確定済み',
  paid: '支払い済み',
  scheduled: '放映予定',
  broadcast: '放映中',
  broadcasted: '放映済み',
  completed: '完了',
  cancelled: 'キャンセル'
};

// ステータスの色
const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  scheduled: 'bg-purple-100 text-purple-800',
  broadcast: 'bg-pink-100 text-pink-800',
  broadcasted: 'bg-pink-100 text-pink-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

// プランの日本語表示
const planLabels: Record<string, string> = {
  free: '無料プラン',
  team_ai9: 'TEAM愛9',
  advance_reservation: '事前予約',
  omeari_23b: 'おめあり祭23B'
};

export const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  useEffect(() => {
    loadOrders();
  }, []);
  
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const allOrders = await orderService.getOrders();
      // 日付の新しい順にソート
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(allOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredOrders = orders.filter(order => {
    if (filter === 'active') {
      return !['completed', 'cancelled', 'broadcasted'].includes(order.status);
    }
    if (filter === 'completed') {
      return ['completed', 'cancelled', 'broadcasted'].includes(order.status);
    }
    return true;
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatPrice = (price: number) => {
    if (price === 0) return '無料';
    return `¥${price.toLocaleString()}`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* ヘッダー */}
      <header className="header flex items-center gap-3">
        <button 
          onClick={() => navigate('/')}
          className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-white text-lg">注文履歴</h1>
          <p className="text-xs text-pink-100">過去の注文を確認</p>
        </div>
      </header>
      
      {/* フィルタータブ */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'すべて' },
            { key: 'active', label: '進行中' },
            { key: 'completed', label: '完了' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {/* 注文リスト */}
      <div className="p-4 space-y-3 pb-24">
        {isLoading ? (
          // ローディングスケルトン
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="order-history-card animate-shimmer">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))
        ) : filteredOrders.length === 0 ? (
          // 空状態
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">注文履歴がありません</div>
            <div className="empty-state-description">
              新しいメッセージを作成して、<br />
              大切な人に想いを届けましょう
            </div>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary mt-6"
            >
              メッセージを作成する
            </button>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className="order-history-card"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800">
                    {order.recipientName}さんへ
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-pink-500">
                    {formatPrice(order.totalAmount || order.price)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {planLabels[order.planId] || order.planId}
                  </div>
                </div>
              </div>
              
              {/* メッセージプレビュー（簡易版） */}
              <div className="bg-gray-900 rounded-lg p-3 mb-3">
                <div className="text-yellow-400 text-xs font-mono text-center leading-relaxed">
                  {(order.message || order.messageLines.join('\n')).split('\n').slice(0, 2).map((line: string, i: number) => (
                    <div key={i}>{line.substring(0, 8)}</div>
                  ))}
                  {(order.message || order.messageLines.join('\n')).split('\n').length > 2 && (
                    <div className="text-gray-500">...</div>
                  )}
                </div>
              </div>
              
              {/* 放映予定日 */}
              {(order.scheduledDate || order.broadcastDate) && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>放映予定: {formatDate(order.scheduledDate || order.broadcastDate)}</span>
                </div>
              )}
              
              {/* 詳細を見るボタン */}
              <div className="flex items-center justify-end mt-3 text-pink-500 text-sm font-medium">
                <span>詳細を見る</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* 新規作成FAB */}
      <button
        onClick={() => navigate('/')}
        className="fab"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      
      {/* 注文詳細モーダル */}
      {selectedOrder && (
        <div 
          className="modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="modal-content max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">注文詳細</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* ステータス */}
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status]}
                </span>
                <span className="text-sm text-gray-500">
                  注文日: {formatDate(selectedOrder.createdAt)}
                </span>
              </div>
              
              {/* 宛先情報 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">宛先</h3>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    {selectedOrder.recipientName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{selectedOrder.recipientName}さん</div>
                    <div className="text-sm text-gray-500">{selectedOrder.occasion}</div>
                  </div>
                </div>
              </div>
              
              {/* メッセージプレビュー */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">メッセージ</h3>
                <MessagePreview 
                  message={selectedOrder.message || selectedOrder.messageLines.join('\n')}
                  recipientName={selectedOrder.recipientName}
                  showAnimation={false}
                />
              </div>
              
              {/* プラン情報 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">プラン</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-800">
                        {planLabels[selectedOrder.planId] || selectedOrder.planId}
                      </div>
                      {(selectedOrder.scheduledDate || selectedOrder.broadcastDate) && (
                        <div className="text-sm text-gray-500 mt-1">
                          放映予定: {formatDate(selectedOrder.scheduledDate || selectedOrder.broadcastDate)}
                        </div>
                      )}
                    </div>
                    <div className="text-xl font-bold text-pink-500">
                      {formatPrice(selectedOrder.totalAmount || selectedOrder.price)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* ステータス履歴（タイムライン） */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">進捗状況</h3>
                <div className="space-y-3">
                  {[
                    { status: 'pending', label: '申請受付', icon: '📝' },
                    { status: 'confirmed', label: '確認完了', icon: '✅' },
                    { status: 'paid', label: '支払い完了', icon: '💳' },
                    { status: 'scheduled', label: '放映予約', icon: '📅' },
                    { status: 'broadcasted', label: '放映完了', icon: '📺' },
                    { status: 'completed', label: '完了', icon: '🎉' }
                  ].map((step, index) => {
                    const statusOrder = ['pending', 'confirmed', 'paid', 'scheduled', 'broadcasted', 'completed'];
                    const currentIndex = statusOrder.indexOf(selectedOrder.status);
                    const stepIndex = statusOrder.indexOf(step.status);
                    const isCompleted = stepIndex <= currentIndex;
                    const isCurrent = step.status === selectedOrder.status;
                    
                    return (
                      <div key={step.status} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          isCompleted 
                            ? 'bg-pink-500 text-white' 
                            : 'bg-gray-100 text-gray-400'
                        } ${isCurrent ? 'ring-2 ring-pink-300 ring-offset-2' : ''}`}>
                          {isCompleted ? step.icon : index + 1}
                        </div>
                        <div className={`flex-1 ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                          <div className="font-medium">{step.label}</div>
                        </div>
                        {isCompleted && (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* アクションボタン */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn btn-secondary flex-1"
                >
                  閉じる
                </button>
                {selectedOrder.status === 'pending' && (
                  <button className="btn btn-primary flex-1">
                    キャンセル
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
