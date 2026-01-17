// 注文完了画面コンポーネント
import React, { useEffect, useState } from 'react';

interface OrderCompleteProps {
  orderId: string;
  recipientName: string;
  broadcastDate: string;
  planName: string;
  messageLines: string[];
  onNewOrder: () => void;
  onClose: () => void;
}

export const OrderComplete: React.FC<OrderCompleteProps> = ({
  orderId,
  recipientName,
  broadcastDate,
  planName,
  messageLines,
  onNewOrder,
  onClose,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // 紙吹雪アニメーションを3秒後に停止
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* 紙吹雪エフェクト */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#FF69B4', '#FFD700', '#87CEEB', '#98FB98', '#DDA0DD'][Math.floor(Math.random() * 5)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-md mx-auto px-4 py-8">
        {/* 成功アイコン */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-xl mb-4 animate-bounce-slow">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎉 ご注文完了！
          </h1>
          <p className="text-gray-600">
            ありがとうございます
          </p>
        </div>

        {/* 注文情報カード */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4">
            <p className="text-white text-sm">注文ID</p>
            <p className="text-white text-xl font-bold tracking-wider">{orderId}</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <div>
                <p className="text-xs text-gray-500">贈る相手</p>
                <p className="font-bold text-gray-800">{recipientName}さん</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-xs text-gray-500">放映予定日</p>
                <p className="font-bold text-gray-800">{broadcastDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl">💎</span>
              <div>
                <p className="text-xs text-gray-500">プラン</p>
                <p className="font-bold text-gray-800">{planName}</p>
              </div>
            </div>

            {/* メッセージプレビュー */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">📝 メッセージ</p>
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="space-y-1 text-center">
                  {messageLines.map((line, index) => (
                    <div
                      key={index}
                      className="text-white font-bold tracking-wider text-sm"
                      style={{ textShadow: '0 0 8px rgba(255,255,255,0.4)' }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 次のステップ */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-blue-800 mb-3">📌 次のステップ</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</span>
              <div>
                <p className="font-medium text-blue-800">審査</p>
                <p className="text-sm text-blue-600">内容を確認します（通常1営業日以内）</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">2</span>
              <div>
                <p className="font-medium text-blue-800">確定通知</p>
                <p className="text-sm text-blue-600">LINEで放映確定をお知らせします</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">3</span>
              <div>
                <p className="font-medium text-blue-800">放映</p>
                <p className="text-sm text-blue-600">渋谷愛ビジョンでメッセージが流れます！</p>
              </div>
            </li>
          </ul>
        </div>

        {/* SNSシェア */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-3">📢 シェアする</h3>
          <p className="text-sm text-gray-600 mb-4">
            渋谷愛ビジョンでメッセージを送ることをシェアしよう！
          </p>
          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl bg-[#00B900] text-white font-bold hover:opacity-90 transition-opacity">
              LINE
            </button>
            <button className="flex-1 py-3 rounded-xl bg-[#1DA1F2] text-white font-bold hover:opacity-90 transition-opacity">
              X
            </button>
            <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition-opacity">
              Instagram
            </button>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          <button
            onClick={onNewOrder}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg transition-all"
          >
            ✨ もう一つメッセージを作る
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            閉じる
          </button>
        </div>

        {/* フッター */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            渋谷愛ビジョンで、あなたの想いが届きますように 💕
          </p>
        </div>
      </div>

      {/* 紙吹雪アニメーション用CSS */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default OrderComplete;
