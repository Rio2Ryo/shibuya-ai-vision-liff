import { ArrowLeft, Calendar, User, MessageSquare, CreditCard, Check } from 'lucide-react';
import type { Plan, AiVisionMessage } from '../../types';

interface OrderConfirmationProps {
  onBack: () => void;
  onConfirm: () => void;
  plan: Plan;
  message: Partial<AiVisionMessage>;
  recipientName: string;
  broadcastDate?: Date;
}

export function OrderConfirmation({
  onBack,
  onConfirm,
  plan,
  message,
  recipientName,
  broadcastDate,
}: OrderConfirmationProps) {
  const formatDate = (date?: Date) => {
    if (!date) return '未設定';
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-bold text-gray-900 ml-2">ご注文内容の確認</h1>
      </header>

      {/* 注文内容 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 贈る相手 */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-gray-900">贈る相手</h3>
          </div>
          <p className="text-gray-700 ml-8">{recipientName}さん</p>
        </div>

        {/* 放映希望日 */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-gray-900">放映希望日</h3>
          </div>
          <p className="text-gray-700 ml-8">{formatDate(broadcastDate)}</p>
        </div>

        {/* メッセージ */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-gray-900">メッセージ</h3>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 ml-8">
            <div className="inline-block bg-black p-3 rounded">
              {message.lines?.map((line, index) => (
                <div 
                  key={index}
                  className="text-green-400 font-mono text-base tracking-widest h-7 flex items-center justify-center"
                >
                  {line || '\u00A0'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* プラン */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-gray-900">選択プラン</h3>
          </div>
          <div className="ml-8">
            <p className="text-gray-900 font-medium">{plan.nameJa}</p>
            <p className="text-gray-500 text-sm">{plan.description}</p>
          </div>
        </div>

        {/* 料金 */}
        <div className="bg-pink-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">お支払い金額</span>
            <span className="text-2xl font-bold text-pink-600">{plan.priceDisplay}</span>
          </div>
          {plan.price === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              ※ 無料プランは抽選での放映となります
            </p>
          )}
        </div>
      </div>

      {/* 確定ボタン */}
      <div className="p-4 bg-white border-t space-y-3">
        <button
          onClick={onConfirm}
          className="w-full py-4 bg-pink-500 text-white font-bold rounded-xl
                     hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          {plan.price > 0 ? '注文を確定する' : 'メッセージを送信する'}
        </button>
        <p className="text-xs text-gray-500 text-center">
          {plan.price > 0 
            ? '※ 確定後、お支払い画面に進みます'
            : '※ 送信後、抽選結果をお待ちください'}
        </p>
      </div>
    </div>
  );
}
