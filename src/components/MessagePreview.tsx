import React, { useState, useEffect } from 'react';

interface MessagePreviewProps {
  message: string;
  recipientName?: string;
  showAnimation?: boolean;
  onEdit?: () => void;
}

// 8文字×5行のフォーマットに変換
const formatMessageLines = (message: string): string[] => {
  const lines: string[] = [];
  let remaining = message;
  
  for (let i = 0; i < 5; i++) {
    if (remaining.length > 0) {
      // 改行があれば優先
      const newlineIndex = remaining.indexOf('\n');
      if (newlineIndex !== -1 && newlineIndex <= 8) {
        lines.push(remaining.substring(0, newlineIndex).padEnd(8, '　'));
        remaining = remaining.substring(newlineIndex + 1);
      } else {
        lines.push(remaining.substring(0, 8).padEnd(8, '　'));
        remaining = remaining.substring(8);
      }
    } else {
      lines.push('　　　　　　　　'); // 8文字の全角スペース
    }
  }
  
  return lines;
};

// 文字数をカウント（全角を考慮）
const countCharacters = (str: string): number => {
  return [...str].length;
};

export const MessagePreview: React.FC<MessagePreviewProps> = ({
  message,
  recipientName,
  showAnimation = true,
  onEdit
}) => {
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const lines = formatMessageLines(message);
    
    if (showAnimation && message) {
      setIsAnimating(true);
      // アニメーション：1行ずつ表示
      lines.forEach((line, index) => {
        setTimeout(() => {
          setDisplayLines(prev => {
            const newLines = [...prev];
            newLines[index] = line;
            return newLines;
          });
          if (index === lines.length - 1) {
            setTimeout(() => setIsAnimating(false), 500);
          }
        }, index * 200);
      });
    } else {
      setDisplayLines(lines);
    }
  }, [message, showAnimation]);
  
  const totalChars = countCharacters(message.replace(/\n/g, ''));
  const maxChars = 40;
  const isOverLimit = totalChars > maxChars;
  
  return (
    <div className="message-preview-container">
      {/* ビジョン風のフレーム */}
      <div className="vision-frame">
        {/* ヘッダー */}
        <div className="vision-header">
          <div className="vision-logo">
            <span className="text-lg">💕</span>
            <span className="text-xs font-bold tracking-wider">SHIBUYA</span>
          </div>
          <div className="vision-location">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">宮益坂下</span>
          </div>
        </div>
        
        {/* メッセージ表示エリア */}
        <div className="vision-screen">
          {/* 宛先表示 */}
          {recipientName && (
            <div className="vision-recipient">
              <span className="text-yellow-400">To: </span>
              <span className="text-white font-bold">{recipientName}</span>
              <span className="text-yellow-400"> さんへ</span>
            </div>
          )}
          
          {/* メッセージ行 */}
          <div className="vision-message-area">
            {displayLines.map((line, index) => (
              <div 
                key={index}
                className={`vision-line ${isAnimating ? 'animate-glow' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {[...line].map((char, charIndex) => (
                  <span 
                    key={charIndex}
                    className={`vision-char ${char !== '　' ? 'active' : ''}`}
                  >
                    {char}
                  </span>
                ))}
              </div>
            ))}
          </div>
          
          {/* フッター */}
          <div className="vision-footer">
            <div className="vision-hearts">
              {'💕'.repeat(5)}
            </div>
          </div>
        </div>
        
        {/* 文字数カウンター */}
        <div className={`vision-counter ${isOverLimit ? 'error' : totalChars > 35 ? 'warning' : ''}`}>
          <span>{totalChars}</span>
          <span className="separator">/</span>
          <span>{maxChars}</span>
          <span className="label">文字</span>
        </div>
      </div>
      
      {/* 編集ボタン */}
      {onEdit && (
        <button 
          onClick={onEdit}
          className="edit-button"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span>編集する</span>
        </button>
      )}
      
      <style>{`
        .message-preview-container {
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
        }
        
        .vision-frame {
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 
            0 0 0 2px rgba(255, 255, 255, 0.1),
            0 20px 40px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .vision-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .vision-logo {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #f9a8d4;
        }
        
        .vision-location {
          display: flex;
          align-items: center;
          gap: 4px;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .vision-screen {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          border-radius: 8px;
          padding: 16px;
          border: 2px solid #333;
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5);
        }
        
        .vision-recipient {
          text-align: center;
          font-size: 12px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
        }
        
        .vision-message-area {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .vision-line {
          display: flex;
          justify-content: center;
          gap: 2px;
          padding: 4px 0;
        }
        
        .vision-char {
          width: 28px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          color: rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          font-family: 'Noto Sans JP', sans-serif;
        }
        
        .vision-char.active {
          color: #fbbf24;
          text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
          background: rgba(251, 191, 36, 0.1);
        }
        
        .vision-footer {
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px dashed rgba(255, 255, 255, 0.2);
          text-align: center;
          font-size: 10px;
          letter-spacing: 4px;
        }
        
        .vision-hearts {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .vision-counter {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-top: 12px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .vision-counter .separator {
          color: rgba(255, 255, 255, 0.3);
        }
        
        .vision-counter .label {
          font-size: 12px;
          margin-left: 4px;
        }
        
        .vision-counter.warning {
          color: #f59e0b;
        }
        
        .vision-counter.error {
          color: #ef4444;
        }
        
        .edit-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          margin-top: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .edit-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .edit-button:active {
          transform: scale(0.98);
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes glow {
          0%, 100% { 
            filter: brightness(1);
          }
          50% { 
            filter: brightness(1.3);
          }
        }
        
        .animate-glow {
          animation: glow 1s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default MessagePreview;
