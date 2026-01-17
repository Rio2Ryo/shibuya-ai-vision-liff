import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Menu } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { generateAiResponse, createChatMessage } from '../../api/chatService';
import { ChatBubble } from './ChatBubble';
import { QuickReplies } from './QuickReplies';

export function ChatView() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    chatMessages,
    addChatMessage,
    isAiTyping,
    setAiTyping,
    conversationContext,
    updateContext,
    user,
  } = useAppStore();

  // 初回メッセージ
  useEffect(() => {
    if (chatMessages.length === 0) {
      handleInitialGreeting();
    }
  }, []);

  // スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  const handleInitialGreeting = async () => {
    setAiTyping(true);
    
    const greeting = user
      ? `${user.displayName}さん、こんにちは！`
      : 'こんにちは！';
    
    const welcomeMessage = `${greeting}渋谷愛ビジョンへようこそ 💕

渋谷の大型ビジョンで、大切な人に「おめでとう」「ありがとう」のメッセージを届けませんか？

まず、メッセージを贈りたい相手のお名前を教えてください。`;

    setTimeout(() => {
      addChatMessage(createChatMessage('assistant', welcomeMessage));
      updateContext({ currentStep: 'ask_recipient' });
      setAiTyping(false);
    }, 1000);
  };

  const handleSend = async () => {
    if (!input.trim() || isAiTyping) return;

    const userMessage = input.trim();
    setInput('');
    
    // ユーザーメッセージを追加
    addChatMessage(createChatMessage('user', userMessage));
    
    // AI応答を生成
    setAiTyping(true);
    
    try {
      const { response, updatedContext } = await generateAiResponse(
        userMessage,
        conversationContext
      );
      
      addChatMessage(createChatMessage('assistant', response));
      updateContext(updatedContext);
    } catch (error) {
      addChatMessage(createChatMessage('assistant', 
        '申し訳ありません、エラーが発生しました。もう一度お試しください。'
      ));
    } finally {
      setAiTyping(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    setTimeout(() => handleSend(), 100);
  };

  const getQuickReplies = () => {
    switch (conversationContext.currentStep) {
      case 'ask_occasion':
        return ['誕生日', '記念日', 'ありがとう', 'その他'];
      case 'create_message':
        return ['提案して', 'サンプルを見せて'];
      case 'select_plan':
        return ['無料', 'TEAM愛9', '事前予約', '詳しく教えて'];
      case 'confirm_order':
        return ['OK', 'メッセージを変更', 'キャンセル'];
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">渋谷愛ビジョン</h1>
            <p className="text-xs text-gray-500">AIコンシェルジュ</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chatMessages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        
        {isAiTyping && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">入力中...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* クイックリプライ */}
      {getQuickReplies().length > 0 && !isAiTyping && (
        <QuickReplies 
          options={getQuickReplies()} 
          onSelect={handleQuickReply} 
        />
      )}

      {/* 入力エリア */}
      <div className="bg-white border-t px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400"
            disabled={isAiTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isAiTyping}
            className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center
                       hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                       transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
