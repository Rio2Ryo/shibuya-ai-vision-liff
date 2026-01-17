import { Sparkles } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { useAppStore } from '../../stores/useAppStore';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const { user } = useAppStore();
  const isUser = message.role === 'user';

  // マークダウン風のコードブロックをスタイリング
  const formatContent = (content: string) => {
    // コードブロック（```）を検出してスタイリング
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim();
        return (
          <div 
            key={index} 
            className="my-2 p-3 bg-gray-800 text-green-400 rounded-lg font-mono text-sm whitespace-pre-wrap"
          >
            {code}
          </div>
        );
      }
      
      // **太字** を検出
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((boldPart, boldIndex) => {
        if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
          return (
            <strong key={`${index}-${boldIndex}`} className="font-bold">
              {boldPart.slice(2, -2)}
            </strong>
          );
        }
        return <span key={`${index}-${boldIndex}`}>{boldPart}</span>;
      });
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[80%] bg-pink-500 text-white rounded-2xl rounded-br-sm px-4 py-2">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="max-w-[80%] bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm">
        <div className="whitespace-pre-wrap text-gray-800">
          {formatContent(message.content)}
        </div>
      </div>
    </div>
  );
}
