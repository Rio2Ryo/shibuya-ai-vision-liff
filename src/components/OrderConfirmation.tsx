// 注文確認コンポーネント
import React from 'react';

interface OrderDetails {
  recipientName: string;
  occasion: string;
  broadcastDate: string;
  messageLines: string[];
  planName: string;
  planPrice: string;
  planIcon: string;
}

interface OrderConfirmationProps {
  order: OrderDetails;
  onConfirm: () => void;
  onCancel: () => void;
  onEdit: (field: string) => void;
  isSubmitting?: boolean;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  order,
  onConfirm,
  onCancel,
  onEdit,
  isSubmitting = false,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4">
        <h3 className="text-xl font-bold text-white text-center">📋 ご注文内容の確認</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* 基本情報 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <div>
                <p className="text-xs text-gray-500">贈る相手</p>
                <p className="font-bold text-gray-800">{order.recipientName}さん</p>
              </div>
            </div>
            <button
              onClick={() => onEdit('recipient')}
              className="text-sm text-pink-500 hover:text-pink-600"
            >
              変更
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-xs text-gray-500">お祝いの種類</p>
                <p className="font-bold text-gray-800">{order.occasion}</p>
              </div>
            </div>
            <button
              onClick={() => onEdit('occasion')}
              className="text-sm text-pink-500 hover:text-pink-600"
            >
              変更
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-xs text-gray-500">放映希望日</p>
                <p className="font-bold text-gray-800">{order.broadcastDate}</p>
              </div>
            </div>
            <button
              onClick={() => onEdit('date')}
              className="text-sm text-pink-500 hover:text-pink-600"
            >
              変更
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{order.planIcon}</span>
              <div>
                <p className="text-xs text-gray-500">プラン</p>
                <p className="font-bold text-gray-800">{order.planName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-pink-500">{order.planPrice}</p>
              <button
                onClick={() => onEdit('plan')}
                className="text-sm text-pink-500 hover:text-pink-600"
              >
                変更
              </button>
            </div>
          </div>
        </div>

        {/* メッセージプレビュー */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">📝 メッセージ</p>
            <button
              onClick={() => onEdit('message')}
              className="text-sm text-pink-500 hover:text-pink-600"
            >
              変更
            </button>
          </div>
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl p-4">
            <div className="bg-black rounded-lg p-3 border-2 border-gray-700">
              <div className="space-y-1 text-center">
                {order.messageLines.map((line, index) => (
                  <div
                    key={index}
                    className="text-white font-bold tracking-wider min-h-[24px]"
                    style={{ textShadow: '0 0 8px rgba(255,255,255,0.4)' }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 合計金額 */}
        <div className="border-t-2 border-dashed border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-600">お支払い金額</span>
            <span className="text-2xl font-bold text-pink-500">{order.planPrice}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">（税込）</p>
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ ご注意ください
          </p>
          <ul className="text-xs text-yellow-700 mt-2 space-y-1">
            <li>• 放映内容は審査後に確定します</li>
            <li>• 不適切な内容は放映されない場合があります</li>
            <li>• キャンセル・返金は放映日の3日前まで可能です</li>
          </ul>
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                処理中...
              </span>
            ) : (
              '✨ 注文を確定する'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
