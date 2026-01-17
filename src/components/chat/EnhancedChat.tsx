import React, { useState, useEffect, useRef } from 'react';

// タイピングエフェクト付きテキスト表示
interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  text, 
  speed = 30,
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);
  
  return (
    <span>
      {displayedText}
      {!isComplete && <span className="typing-cursor">|</span>}
    </span>
  );
};

// 改良版タイピングインジケーター
export const EnhancedTypingIndicator: React.FC<{ name?: string }> = ({ name = 'AIコンシェルジュ' }) => {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white text-lg">✨</span>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-md">
        <div className="text-xs text-gray-400 mb-1">{name}</div>
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

// リアクションボタン
interface ReactionButtonProps {
  emoji: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({
  emoji,
  count = 0,
  isActive = false,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${
        isActive 
          ? 'bg-pink-100 text-pink-600 border border-pink-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <span>{emoji}</span>
      {count > 0 && <span className="text-xs">{count}</span>}
    </button>
  );
};

// メッセージアクション
interface MessageActionsProps {
  onCopy?: () => void;
  onRegenerate?: () => void;
  onFeedback?: (type: 'good' | 'bad') => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  onCopy,
  onRegenerate,
  onFeedback
}) => {
  const [showCopied, setShowCopied] = useState(false);
  
  const handleCopy = () => {
    onCopy?.();
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };
  
  return (
    <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={handleCopy}
        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
        title="コピー"
      >
        {showCopied ? (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
      
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          title="再生成"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}
      
      {onFeedback && (
        <>
          <button
            onClick={() => onFeedback('good')}
            className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
            title="良い回答"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </button>
          <button
            onClick={() => onFeedback('bad')}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="改善が必要"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

// 音声入力ボタン
interface VoiceInputButtonProps {
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onResult,
  onError
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onError?.('音声認識がサポートされていません');
      return;
    }
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'ja-JP';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    
    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };
    
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult?.(transcript);
      setIsListening(false);
    };
    
    recognitionRef.current.onerror = (event: any) => {
      onError?.(event.error);
      setIsListening(false);
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current.start();
  };
  
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };
  
  return (
    <button
      onClick={isListening ? stopListening : startListening}
      className={`p-3 rounded-full transition-all ${
        isListening 
          ? 'bg-red-500 text-white animate-pulse' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      title={isListening ? '停止' : '音声入力'}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  );
};

// 絵文字ピッカー
interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const emojis = [
    '😊', '😍', '🥰', '😘', '💕', '❤️', '💖', '✨',
    '🎉', '🎊', '🎂', '🎁', '🌸', '🌹', '🌺', '💐',
    '🙏', '👏', '💪', '🤗', '😢', '😭', '🥺', '😌',
    '🎵', '🎶', '⭐', '🌟', '☀️', '🌈', '🦋', '🍀'
  ];
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
        title="絵文字"
      >
        <span className="text-lg">😊</span>
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-xl border border-gray-100 p-3 w-64 animate-scale-in">
          <div className="grid grid-cols-8 gap-1">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelect(emoji);
                  setIsOpen(false);
                }}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-all"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// スクロールトップボタン
export const ScrollToTopButton: React.FC<{ onClick: () => void; visible: boolean }> = ({
  onClick,
  visible
}) => {
  if (!visible) return null;
  
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all animate-fade-in z-40"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
};

// チャット入力コンポーネント（強化版）
interface EnhancedChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoiceResult?: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({
  value,
  onChange,
  onSend,
  onVoiceResult,
  disabled = false,
  placeholder = 'メッセージを入力...'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };
  
  return (
    <div className="footer-input">
      <div className="flex items-center gap-2 max-w-2xl mx-auto">
        <EmojiPicker onSelect={(emoji) => onChange(value + emoji)} />
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="input-field flex-1"
          disabled={disabled}
        />
        
        {onVoiceResult && (
          <VoiceInputButton 
            onResult={(text) => {
              onChange(value + text);
              onVoiceResult(text);
            }}
          />
        )}
        
        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
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
  );
};

// スタイル
const styles = `
  .typing-cursor {
    animation: blink 1s step-end infinite;
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;

// スタイルを注入
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default {
  TypewriterText,
  EnhancedTypingIndicator,
  ReactionButton,
  MessageActions,
  VoiceInputButton,
  EmojiPicker,
  ScrollToTopButton,
  EnhancedChatInput
};
