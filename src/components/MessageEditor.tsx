// メッセージエディター - 8文字×5行のビジョン用メッセージを編集
import React, { useState, useEffect, useCallback } from 'react';

interface MessageEditorProps {
  initialLines?: string[];
  onChange?: (lines: string[]) => void;
  onSubmit?: (lines: string[]) => void;
  recipientName?: string;
  occasion?: string;
}

const MAX_CHARS_PER_LINE = 8;
const NUM_LINES = 5;
const MAX_TOTAL_CHARS = 40;

// 絵文字パレット
const EMOJI_PALETTE = [
  '💕', '❤️', '💖', '💗', '💝', '💞', '💘', '♥️',
  '✨', '🌟', '⭐', '🎉', '🎊', '🎁', '🎀', '🎂',
  '🌸', '🌺', '🌷', '🌹', '🌻', '🍀', '🌈', '☀️',
  '😊', '😄', '🥰', '😍', '🤗', '😘', '💋', '👏',
];

// テンプレート
const TEMPLATES: Record<string, string[][]> = {
  '誕生日': [
    ['〇〇さん', 'おたんじょうび', 'おめでとう！', 'しあわせな', 'いちねんを💕'],
    ['〇〇へ', 'HAPPY', 'BIRTHDAY!', 'だいすきだよ', '💕💕💕'],
  ],
  '記念日': [
    ['〇〇へ', 'きねんび', 'おめでとう', 'これからも', 'よろしくね💕'],
    ['〇〇と', 'すごした日々', 'たからもの', 'ずっと一緒', '💕💕💕'],
  ],
  '感謝': [
    ['〇〇さん', 'いつも', 'ありがとう', 'かんしゃの', 'きもちを💕'],
    ['〇〇へ', 'ありがとう', 'あなたがいて', 'しあわせです', '💕💕💕'],
  ],
  'お祝い': [
    ['〇〇さん', 'おめでとう', 'ございます！', 'すてきな', '一日を💕'],
    ['〇〇へ', 'いつも', 'ありがとう', 'がんばって！', '応援💕'],
  ],
};

export const MessageEditor: React.FC<MessageEditorProps> = ({
  initialLines,
  onChange,
  onSubmit,
  recipientName = '',
  occasion = 'お祝い',
}) => {
  const [lines, setLines] = useState<string[]>(
    initialLines || Array(NUM_LINES).fill('')
  );
  const [activeLineIndex, setActiveLineIndex] = useState<number>(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // 文字数カウント
  const getCharCount = (line: string): number => {
    // 絵文字は2文字としてカウント（ビジョン表示用）
    return [...line].reduce((count, char) => {
      // 絵文字かどうかをチェック
      const codePoint = char.codePointAt(0) || 0;
      if (codePoint > 0x1F000) return count + 2;
      return count + 1;
    }, 0);
  };

  const totalChars = lines.reduce((sum, line) => sum + getCharCount(line), 0);

  // 行を更新
  const updateLine = useCallback((index: number, value: string) => {
    const newLines = [...lines];
    // 8文字（絵文字考慮）に制限
    let trimmedValue = '';
    let charCount = 0;
    for (const char of value) {
      const charWidth = (char.codePointAt(0) || 0) > 0x1F000 ? 2 : 1;
      if (charCount + charWidth <= MAX_CHARS_PER_LINE) {
        trimmedValue += char;
        charCount += charWidth;
      } else {
        break;
      }
    }
    newLines[index] = trimmedValue;
    setLines(newLines);
    onChange?.(newLines);
  }, [lines, onChange]);

  // 絵文字を挿入
  const insertEmoji = (emoji: string) => {
    const currentLine = lines[activeLineIndex];
    if (getCharCount(currentLine) + 2 <= MAX_CHARS_PER_LINE) {
      updateLine(activeLineIndex, currentLine + emoji);
    }
    setShowEmojiPicker(false);
  };

  // テンプレートを適用
  const applyTemplate = (template: string[]) => {
    const name = recipientName.slice(0, 4) || '〇〇';
    const newLines = template.map(line => 
      line.replace('〇〇', name)
    );
    setLines(newLines);
    onChange?.(newLines);
    setShowTemplates(false);
  };

  // キーボードショートカット
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < NUM_LINES - 1) {
        setActiveLineIndex(index + 1);
        // 次の入力欄にフォーカス
        const nextInput = document.querySelector(`input[data-line="${index + 1}"]`) as HTMLInputElement;
        nextInput?.focus();
      }
    } else if (e.key === 'ArrowUp' && index > 0) {
      setActiveLineIndex(index - 1);
      const prevInput = document.querySelector(`input[data-line="${index - 1}"]`) as HTMLInputElement;
      prevInput?.focus();
    } else if (e.key === 'ArrowDown' && index < NUM_LINES - 1) {
      setActiveLineIndex(index + 1);
      const nextInput = document.querySelector(`input[data-line="${index + 1}"]`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  // プレビュー表示
  const renderPreview = () => (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-6 shadow-2xl">
      <div className="text-center mb-4">
        <span className="text-xs text-gray-400 tracking-wider">SHIBUYA AI VISION</span>
      </div>
      <div className="bg-black rounded-xl p-4 border-4 border-gray-700 shadow-inner">
        <div className="space-y-1 font-bold text-center">
          {lines.map((line, index) => (
            <div 
              key={index}
              className="text-white text-lg tracking-widest min-h-[28px] flex items-center justify-center"
              style={{ 
                textShadow: '0 0 10px rgba(255,255,255,0.5)',
                fontFamily: '"Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif'
              }}
            >
              {line || <span className="text-gray-600">・・・・・・・・</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );

  // 編集モード
  const renderEditor = () => (
    <div className="space-y-3">
      {lines.map((line, index) => (
        <div key={index} className="relative">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-6">{index + 1}行</span>
            <div className="flex-1 relative">
              <input
                type="text"
                data-line={index}
                value={line}
                onChange={(e) => updateLine(index, e.target.value)}
                onFocus={() => setActiveLineIndex(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder="・・・・・・・・"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-center text-lg tracking-wider
                  ${activeLineIndex === index 
                    ? 'border-pink-400 bg-pink-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-pink-200'
                  }`}
                style={{ fontFamily: '"Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif' }}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs
                ${getCharCount(line) > MAX_CHARS_PER_LINE - 2 ? 'text-red-500' : 'text-gray-400'}`}>
                {getCharCount(line)}/{MAX_CHARS_PER_LINE}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">メッセージ編集</h3>
          <p className="text-sm text-gray-500">8文字×5行（合計40文字以内）</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium px-3 py-1 rounded-full
            ${totalChars > MAX_TOTAL_CHARS ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {totalChars}/{MAX_TOTAL_CHARS}文字
          </span>
        </div>
      </div>

      {/* モード切り替え */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setPreviewMode(false)}
          className={`flex-1 py-2 rounded-lg font-medium transition-all
            ${!previewMode ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          ✏️ 編集
        </button>
        <button
          onClick={() => setPreviewMode(true)}
          className={`flex-1 py-2 rounded-lg font-medium transition-all
            ${previewMode ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          👁️ プレビュー
        </button>
      </div>

      {/* エディター/プレビュー */}
      {previewMode ? renderPreview() : renderEditor()}

      {/* ツールバー */}
      {!previewMode && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            😊 絵文字
          </button>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            📝 テンプレート
          </button>
          <button
            onClick={() => setLines(Array(NUM_LINES).fill(''))}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            🗑️ クリア
          </button>
        </div>
      )}

      {/* 絵文字ピッカー */}
      {showEmojiPicker && !previewMode && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 mb-3">絵文字を選択（{activeLineIndex + 1}行目に挿入）</p>
          <div className="flex flex-wrap gap-2">
            {EMOJI_PALETTE.map((emoji, index) => (
              <button
                key={index}
                onClick={() => insertEmoji(emoji)}
                className="w-10 h-10 text-xl hover:bg-white rounded-lg transition-colors hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* テンプレート選択 */}
      {showTemplates && !previewMode && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 mb-3">テンプレートを選択</p>
          <div className="space-y-3">
            {(TEMPLATES[occasion] || TEMPLATES['お祝い']).map((template, index) => (
              <button
                key={index}
                onClick={() => applyTemplate(template)}
                className="w-full p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-pink-300 transition-colors text-left"
              >
                <div className="text-sm text-gray-800 space-y-0.5">
                  {template.map((line, lineIndex) => (
                    <div key={lineIndex} className="truncate">{line}</div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 送信ボタン */}
      {onSubmit && (
        <button
          onClick={() => onSubmit(lines)}
          disabled={totalChars === 0 || totalChars > MAX_TOTAL_CHARS}
          className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all
            ${totalChars > 0 && totalChars <= MAX_TOTAL_CHARS
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          ✨ このメッセージで進む
        </button>
      )}
    </div>
  );
};

export default MessageEditor;
