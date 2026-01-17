import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import liff from '@line/liff';
import { aiChatService, ConversationContext } from './services/aiChatService';
import Admin from './pages/Admin';
import './index.css';

// チャットメッセージの型
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function ChatApp() {
  const navigate = useNavigate();
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [isInClient, setIsInClient] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<ConversationContext>(aiChatService.getContext());
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
  }, [messages]);

  const sendInitialMessage = async () => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
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

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    addUserMessage(userMessage);
    setIsTyping(true);

    try {
      // AIサービスに送信
      const response = await aiChatService.sendMessage(userMessage);
      addAssistantMessage(response);
      setContext(aiChatService.getContext());
    } catch (error) {
      console.error('Error sending message:', error);
      addAssistantMessage('すみません、エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }, [input, isTyping]);

  const handleQuickReply = useCallback((text: string) => {
    setInput(text);
    setTimeout(() => {
      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      inputRef.current?.dispatchEvent(event);
    }, 100);
  }, []);

  // 入力後に自動送信
  useEffect(() => {
    if (input && !isTyping) {
      const timer = setTimeout(() => {
        if (input) handleSend();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [input]);

  // クイックリプライの選択肢
  const getQuickReplies = (): string[] => {
    switch (context.currentStep) {
      case 'ask_occasion':
        return ['誕生日', '記念日', 'ありがとう', 'その他'];
      case 'create_message':
        return ['提案して', '自分で書く'];
      case 'select_plan':
        return ['無料', 'TEAM愛9', '事前予約', 'おめあり祭23B'];
      case 'confirm_order':
        return ['OK', 'キャンセル'];
      case 'complete':
        return ['新しいメッセージ'];
      default:
        return [];
    }
  };

  // メッセージのフォーマット（マークダウン風の処理）
  const formatMessage = (content: string) => {
    // コードブロックの処理
    const parts = content.split(/```/);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // コードブロック内
        return (
          <pre key={index} className="bg-gray-100 rounded-lg p-3 my-2 font-mono text-sm whitespace-pre overflow-x-auto">
            {part.trim()}
          </pre>
        );
      }
      // 通常テキスト
      return (
        <span key={index}>
          {part.split('\n').map((line, lineIndex) => {
            // 太字の処理
            const boldProcessed = line.split(/\*\*(.*?)\*\*/).map((segment, segIndex) => {
              if (segIndex % 2 === 1) {
                return <strong key={segIndex}>{segment}</strong>;
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
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-pink-400 rounded-full animate-ping opacity-25"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-3xl">💕</span>
            </div>
          </div>
          <p className="text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow-sm">
        <div className="w-11 h-11 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-md">
          <span className="text-white text-xl">✨</span>
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-gray-900 text-lg">渋谷愛ビジョン</h1>
          <p className="text-xs text-gray-500">
            AIコンシェルジュ
            {!isInClient && <span className="ml-1 text-pink-500">(デモモード)</span>}
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin')}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="管理画面"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button 
          onClick={() => {
            aiChatService.reset();
            setMessages([]);
            setContext(aiChatService.getContext());
            sendInitialMessage();
          }}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="会話をリセット"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </header>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'gap-2'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-sm">✨</span>
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-br-md shadow-md'
                  : 'bg-white border border-gray-100 rounded-bl-md shadow-sm'
              }`}
            >
              <div className="text-sm leading-relaxed">
                {formatMessage(message.content)}
              </div>
              <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-pink-200' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-sm">✨</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* クイックリプライ */}
      {getQuickReplies().length > 0 && !isTyping && (
        <div className="px-4 py-2 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {getQuickReplies().map((option, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(option)}
                className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-pink-50 to-pink-100 
                           text-pink-600 rounded-full border border-pink-200 
                           hover:from-pink-100 hover:to-pink-200 hover:border-pink-300
                           transition-all duration-200 text-sm font-medium whitespace-nowrap
                           active:scale-95"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 入力エリア */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0 safe-area-inset-bottom">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full 
                       focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white
                       transition-all duration-200 text-sm"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full 
                       flex items-center justify-center shadow-md
                       hover:from-pink-600 hover:to-pink-700 
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
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatApp />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
