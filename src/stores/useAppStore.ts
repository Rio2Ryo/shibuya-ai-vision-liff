import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  User, 
  ChatMessage, 
  ConversationContext, 
  Plan, 
  AiVisionMessage,
  Order 
} from '../types';

interface AppState {
  // ユーザー
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  
  // LIFF
  isLiffInitialized: boolean;
  isInLineClient: boolean;
  setLiffState: (initialized: boolean, inClient: boolean) => void;
  
  // チャット
  chatMessages: ChatMessage[];
  isAiTyping: boolean;
  addChatMessage: (message: ChatMessage) => void;
  setAiTyping: (typing: boolean) => void;
  clearChat: () => void;
  
  // 会話コンテキスト
  conversationContext: ConversationContext;
  updateContext: (updates: Partial<ConversationContext>) => void;
  resetContext: () => void;
  
  // 現在作成中のメッセージ
  currentMessage: Partial<AiVisionMessage>;
  updateCurrentMessage: (updates: Partial<AiVisionMessage>) => void;
  resetCurrentMessage: () => void;
  
  // 選択中のプラン
  selectedPlan: Plan | null;
  setSelectedPlan: (plan: Plan | null) => void;
  
  // 注文履歴
  orders: Order[];
  addOrder: (order: Order) => void;
  
  // UI状態
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

type AppView = 
  | 'chat' 
  | 'message-editor' 
  | 'plan-selection' 
  | 'order-confirmation' 
  | 'history' 
  | 'profile';

const initialContext: ConversationContext = {
  currentStep: 'greeting',
};

const initialMessage: Partial<AiVisionMessage> = {
  lines: ['', '', '', '', ''],
  occasion: 'birthday',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ユーザー
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      // LIFF
      isLiffInitialized: false,
      isInLineClient: false,
      setLiffState: (initialized, inClient) => set({ 
        isLiffInitialized: initialized, 
        isInLineClient: inClient 
      }),
      
      // チャット
      chatMessages: [],
      isAiTyping: false,
      addChatMessage: (message) => set((state) => ({ 
        chatMessages: [...state.chatMessages, message] 
      })),
      setAiTyping: (typing) => set({ isAiTyping: typing }),
      clearChat: () => set({ chatMessages: [] }),
      
      // 会話コンテキスト
      conversationContext: initialContext,
      updateContext: (updates) => set((state) => ({
        conversationContext: { ...state.conversationContext, ...updates }
      })),
      resetContext: () => set({ conversationContext: initialContext }),
      
      // 現在のメッセージ
      currentMessage: initialMessage,
      updateCurrentMessage: (updates) => set((state) => ({
        currentMessage: { ...state.currentMessage, ...updates }
      })),
      resetCurrentMessage: () => set({ currentMessage: initialMessage }),
      
      // プラン
      selectedPlan: null,
      setSelectedPlan: (plan) => set({ selectedPlan: plan }),
      
      // 注文
      orders: [],
      addOrder: (order) => set((state) => ({
        orders: [...state.orders, order]
      })),
      
      // UI
      currentView: 'chat',
      setCurrentView: (view) => set({ currentView: view }),
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'shibuya-ai-vision-storage',
      partialize: (state) => ({
        orders: state.orders,
        chatMessages: state.chatMessages.slice(-50), // 最新50件のみ保存
      }),
    }
  )
);
