import { Sparkles } from 'lucide-react';

interface LoadingProps {
  message?: string;
}

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
