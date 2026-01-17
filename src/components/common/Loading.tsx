import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingProps {
  message?: string;
}

// メインのローディングコンポーネント
export function Loading({ message = '読み込み中...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
      </div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}

// フルスクリーンローディング
export const FullScreenLoading: React.FC<{
  message?: string;
}> = ({ message = '読み込み中...' }) => (
  <div className="fixed inset-0 bg-gradient-to-b from-pink-100 to-white flex items-center justify-center z-50">
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="absolute inset-0 border-4 border-pink-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-pink-500 rounded-full animate-spin"></div>
        <div className="absolute inset-2 flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
      </div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

// インラインローディング
export const InlineLoading: React.FC<{
  size?: 'sm' | 'md' | 'lg';
}> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div className="absolute inset-0 border-2 border-pink-200 rounded-full"></div>
      <div className="absolute inset-0 border-2 border-transparent border-t-pink-500 rounded-full animate-spin"></div>
    </div>
  );
};

// ボタンローディング
export const ButtonLoading: React.FC = () => (
  <span className="inline-flex items-center">
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    処理中...
  </span>
);

// チャットのタイピングインジケーター
export const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1 p-3">
    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

// スケルトンローディング
export const Skeleton: React.FC<{
  className?: string;
}> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// カードスケルトン
export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-3 w-1/2 mb-4" />
    <Skeleton className="h-20 w-full mb-2" />
    <div className="flex justify-between">
      <Skeleton className="h-3 w-1/4" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  </div>
);

// メッセージスケルトン
export const MessageSkeleton: React.FC<{
  isUser?: boolean;
}> = ({ isUser = false }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-[80%] ${isUser ? 'bg-pink-100' : 'bg-gray-100'} rounded-2xl p-4`}>
      <Skeleton className="h-3 w-32 mb-2" />
      <Skeleton className="h-3 w-48" />
    </div>
  </div>
);

// プログレスバー
export const ProgressBar: React.FC<{
  progress: number;
  label?: string;
}> = ({ progress, label }) => (
  <div className="w-full">
    {label && (
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
      </div>
    )}
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

// ステップインジケーター
export const StepIndicator: React.FC<{
  steps: string[];
  currentStep: number;
}> = ({ steps, currentStep }) => (
  <div className="flex items-center justify-center space-x-2">
    {steps.map((step, index) => (
      <React.Fragment key={step}>
        <div className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              index < currentStep
                ? 'bg-green-500 text-white'
                : index === currentStep
                ? 'bg-pink-500 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {index < currentStep ? '✓' : index + 1}
          </div>
          <span className="text-xs mt-1 text-gray-500">{step}</span>
        </div>
        {index < steps.length - 1 && (
          <div
            className={`w-8 h-0.5 ${
              index < currentStep ? 'bg-green-500' : 'bg-gray-200'
            }`}
          ></div>
        )}
      </React.Fragment>
    ))}
  </div>
);
