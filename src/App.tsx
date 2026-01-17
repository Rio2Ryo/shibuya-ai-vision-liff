import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import liff from '@line/liff';
import { aiChatService, ConversationContext } from './services/aiChatService';
import Admin from './pages/Admin';
import OrderHistory from './pages/OrderHistory';
import './index.css';

// チャットメッセージの型
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// プラン定義
const PLANS = [
  {
    id: 'free',
    name: '無料プラン',
    price: 0,
    description: '抽選で放映（1日1通まで）',
    features: ['抽選で放映', '1日1通まで', 'YouTube LIVEで確認'],
    icon: '🎁',
    color: 'from-green-400 to-emerald-500'
  },
  {
    id: 'team9',
    name: 'TEAM愛9',
    price: 500,
    priceUnit: '/月',
    description: '月額500円で当選確率UP',
    features: ['当選確率UP', '1日2通まで', '優先表示'],
    icon: '💎',
    color: 'from-blue-400 to-indigo-500',
    recommended: true
  },
  {
    id: 'reservation',
    name: '事前予約',
    price: 8800,
    description: '8,800円〜で確実に放映',
    features: ['確実放映', '愛デコ対応', '愛カード対応', '時間指定可能'],
    icon: '⭐',
    color: 'from-purple-400 to-pink-500'
  },
  {
    id: 'omeari23b',
    name: 'おめあり祭23B',
    price: 3300,
    description: '3,300円で当日予約OK（23時台放映）',
    features: ['当日予約OK', '23時台放映', '確実放映'],
    icon: '🌙',
    color: 'from-indigo-400 to-purple-500'
  }
];

// タイピングインジケーター
const TypingIndicator = () => (
  <div className="flex items-center gap-2 animate-fade-in">
    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
      <span className="text-white text-lg">✨</span>
    </div>
    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-md">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
);

// プラン選択カード
const PlanCard = ({ 
  plan, 
  isSelected, 
  onSelect 
}: { 
  plan: typeof PLANS[0]; 
  isSelected: boolean; 
  onSelect: () => void;
}) => (
  <div
    onClick={onSelect}
    className={`plan-card relative cursor-pointer transition-all duration-300 ${
      isSelected ? 'selected ring-2 ring-pink-500' : ''
    } ${plan.recommended ? 'recommended' : ''}`}
  >
    <div className="flex items-start gap-4">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
        {plan.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-gray-800 truncate">{plan.name}</h3>
          <div className="text-right flex-shrink-0">
            <span className="text-xl font-bold text-pink-500">¥{plan.price.toLocaleString()}</span>
            {plan.priceUnit && <span className="text-sm text-gray-500">{plan.priceUnit}</span>}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {plan.features.slice(0, 3).map((feature, i) => (
            <span key={i} className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">
              ✓ {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
    {isSelected && (
      <div className="absolute top-3 right-3 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center animate-scale-in">
        <span className="text-white text-sm">✓</span>
      </div>
    )}
  </div>
);

// メッセージプレビュー
const MessagePreview = ({ lines }: { lines: string[] }) => {
  const displayLines = [...lines];
  while (displayLines.length < 5) {
    displayLines.push('');
  }

  return (
    <div className="message-preview animate-scale-in">
      <div className="text-xs text-pink-300 mb-3 tracking-wider flex items-center justify-center gap-2">
        <span>📺</span>
        <span>ビジョン表示プレビュー</span>
      </div>
      <div className="space-y-1">
        {displayLines.slice(0, 5).map((line, index) => (
          <div key={index} className="message-preview-line h-8 flex items-center justify-center">
            {line || <span className="text-gray-600 text-sm">（{index + 1}行目）</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// 注文確認モーダル
const OrderConfirmModal = ({
  context,
  onConfirm,
  onCancel
}: {
  context: ConversationContext;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const plan = PLANS.find(p => p.id === context.selectedPlan || p.name === context.selectedPlan);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content p-6 m-4 max-w-md" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-heartbeat">
            <span className="text-3xl">💕</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">ご注文内容の確認</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-pink-50 rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-1">贈る相手</div>
            <div className="font-bold text-lg">{context.recipientName || '未設定'}さん</div>
          </div>

          {context.messageLines && context.messageLines.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-2">メッセージ</div>
              <MessagePreview lines={context.messageLines} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">お祝いの種類</div>
              <div className="font-medium">{context.occasion || '未設定'}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">放映希望日</div>
              <div className="font-medium">{context.broadcastDate || '未設定'}</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">選択プラン</div>
                <div className="font-bold">{plan?.name || context.selectedPlan || '未選択'}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-pink-500">
                  ¥{(plan?.price || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="btn btn-secondary flex-1">
            戻る
          </button>
          <button onClick={onConfirm} className="btn btn-primary flex-1">
            注文を確定 💕
          </button>
        </div>
      </div>
    </div>
  );
};

function ChatApp() {
  const navigate = useNavigate();
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [isInClient, setIsInClient] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<ConversationContext>(aiChatService.getContext());
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // LIFF初期化
  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({
          liffId: import.meta.env.VITE_LIFF_ID || 'placeholder-liff-id',
        });
        setIsInClient(liff.isInClient());
        setIsLiffReady(true);
      } catch (e) {
        console.warn('LIFF init failed, running in demo mode:', e);
        setIsLiffReady(true);
      }
    };
    initLiff();
  }, []);

  // 初回メッセージ
  useEffect(() => {
    if (isLiffReady && messages.length === 0) {
      sendInitialMessage();
    }
  }, [isLiffReady]);

  // スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendInitialMessage = async () => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const response = await aiChatService.sendMessage('こんにちは');
    addAssistantMessage(response);
    setContext(aiChatService.getContext());
    setIsTyping(false);
  };

  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const addAssistantMessage = (content: string) => {
    const message: ChatMessage = {
      id: `assistant_${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSend = useCallback(async (customInput?: string) => {
    const messageToSend = customInput || input.trim();
    if (!messageToSend || isTyping) return;

    setInput('');
    addUserMessage(messageToSend);
    setIsTyping(true);

    try {
      // AIサービスに送信
      const response = await aiChatService.sendMessage(messageToSend);
      
      // 少し遅延を入れて自然な感じに
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
      addAssistantMessage(response);
      const newContext = aiChatService.getContext();
      setContext(newContext);

      // 注文確認ステップの場合、モーダルを表示
      if (newContext.currentStep === 'confirm_order' && messageToSend.toLowerCase().includes('ok')) {
        setShowOrderModal(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addAssistantMessage('すみません、エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }, [input, isTyping]);

  const handleQuickReply = useCallback((text: string) => {
    handleSend(text);
  }, [handleSend]);

  const handlePlanSelect = useCallback((planId: string) => {
    setSelectedPlanId(planId);
    const plan = PLANS.find(p => p.id === planId);
    if (plan) {
      handleSend(plan.name);
    }
  }, [handleSend]);

  const handleOrderConfirm = useCallback(async () => {
    setShowOrderModal(false);
    handleSend('OK');
  }, [handleSend]);

  const handleReset = useCallback(() => {
    aiChatService.reset();
    setMessages([]);
    setContext(aiChatService.getContext());
    setSelectedPlanId(null);
    sendInitialMessage();
  }, []);

  // クイックリプライの選択肢
  const getQuickReplies = (): string[] => {
    switch (context.currentStep) {
      case 'ask_occasion':
        return ['🎂 誕生日', '💍 記念日', '🙏 感謝', '🎉 お祝い'];
      case 'ask_date':
        return ['今週末', '来週', '1ヶ月以内'];
      case 'create_message':
        return ['AIに提案してもらう', '自分で入力する'];
      case 'select_plan':
        return []; // プランカードを表示するので空
      case 'confirm_order':
        return ['OK！注文する', 'キャンセル'];
      case 'complete':
        return ['新しいメッセージを作る', 'ホームに戻る'];
      default:
        return [];
    }
  };

  // メッセージのフォーマット
  const formatMessage = (content: string) => {
    const parts = content.split(/```/);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <pre key={index} className="bg-gray-800 text-gray-100 rounded-xl p-4 my-3 font-mono text-sm whitespace-pre overflow-x-auto">
            {part.trim()}
          </pre>
        );
      }
      return (
        <span key={index}>
          {part.split('\n').map((line, lineIndex) => {
            const boldProcessed = line.split(/\*\*(.*?)\*\*/).map((segment, segIndex) => {
              if (segIndex % 2 === 1) {
                return <strong key={segIndex} className="font-bold">{segment}</strong>;
              }
              return segment;
            });
            
            return (
              <span key={lineIndex}>
                {boldProcessed}
                {lineIndex < part.split('\n').length - 1 && <br />}
              </span>
            );
          })}
        </span>
      );
    });
  };

  if (!isLiffReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-pink-400 rounded-full animate-ping opacity-25"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-xl">
              <span className="text-4xl animate-heartbeat">💕</span>
            </div>
          </div>
          <p className="text-gray-600 font-medium text-lg">読み込み中...</p>
          <p className="text-gray-400 text-sm mt-2">渋谷愛ビジョンへようこそ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      {/* ヘッダー */}
      <header className="header flex items-center gap-3 flex-shrink-0">
        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center shadow-lg animate-float">
          <span className="text-2xl">✨</span>
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-white text-lg tracking-wide">渋谷愛ビジョン</h1>
          <p className="text-xs text-pink-100">
            AIコンシェルジュ
            {!isInClient && <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full">(デモモード)</span>}
          </p>
        </div>
        <button 
          onClick={() => navigate('/history')}
          className="p-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
          title="注文履歴"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </button>
        <button 
          onClick={() => navigate('/admin')}
          className="p-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
          title="管理画面"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button 
          onClick={handleReset}
          className="p-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
          title="会話をリセット"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </header>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'gap-3'} ${
              index === messages.length - 1 ? 'animate-fade-in-up' : ''
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">✨</span>
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-br-md shadow-lg'
                  : 'bg-white border border-gray-100 rounded-bl-md shadow-md'
              }`}
            >
              <div className="text-sm leading-relaxed">
                {formatMessage(message.content)}
              </div>
              <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-pink-200' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* プラン選択UI */}
        {context.currentStep === 'select_plan' && !isTyping && (
          <div className="space-y-3 animate-fade-in-up">
            {PLANS.map((plan, index) => (
              <div key={plan.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <PlanCard
                  plan={plan}
                  isSelected={selectedPlanId === plan.id}
                  onSelect={() => handlePlanSelect(plan.id)}
                />
              </div>
            ))}
          </div>
        )}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* クイックリプライ */}
      {getQuickReplies().length > 0 && !isTyping && (
        <div className="px-4 py-3 bg-white/80 backdrop-blur border-t border-gray-100 flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {getQuickReplies().map((option, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(option)}
                className="quick-reply-btn animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 入力エリア */}
      <div className="footer-input">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="メッセージを入力..."
            className="input-field flex-1"
            disabled={isTyping}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full 
                       flex items-center justify-center shadow-lg
                       hover:from-pink-600 hover:to-pink-700 hover:shadow-xl
                       disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none
                       disabled:cursor-not-allowed transition-all duration-200
                       active:scale-95"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* 注文確認モーダル */}
      {showOrderModal && (
        <OrderConfirmModal
          context={context}
          onConfirm={handleOrderConfirm}
          onCancel={() => setShowOrderModal(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatApp />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/history" element={<OrderHistory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
