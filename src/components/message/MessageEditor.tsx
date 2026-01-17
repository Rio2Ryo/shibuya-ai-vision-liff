import { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Check } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

interface MessageEditorProps {
  onBack: () => void;
  onComplete: (lines: string[]) => void;
  initialLines?: string[];
}

const MAX_CHARS_PER_LINE = 8;
const NUM_LINES = 5;
const MAX_TOTAL_CHARS = 40;

export function MessageEditor({ onBack, onComplete, initialLines }: MessageEditorProps) {
  const [lines, setLines] = useState<string[]>(
    initialLines || Array(NUM_LINES).fill('')
  );
  const [showPreview, setShowPreview] = useState(false);

  const totalChars = lines.join('').length;
  const isValid = totalChars > 0 && totalChars <= MAX_TOTAL_CHARS;

  const handleLineChange = (index: number, value: string) => {
    // 全角に変換（簡易版）
    const fullWidth = value
      .replace(/[A-Za-z0-9]/g, (s) => 
        String.fromCharCode(s.charCodeAt(0) + 0xFEE0)
      );
    
    // 8文字制限
    const truncated = [...fullWidth].slice(0, MAX_CHARS_PER_LINE).join('');
    
    const newLines = [...lines];
    newLines[index] = truncated;
    setLines(newLines);
  };

  const handleComplete = () => {
    if (isValid) {
      onComplete(lines);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-bold text-gray-900">メッセージ作成</h1>
        <button 
          onClick={() => setShowPreview(!showPreview)}
          className="p-2 -mr-2 hover:bg-gray-100 rounded-lg"
        >
          <Eye className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* 説明 */}
      <div className="px-4 py-3 bg-pink-50 border-b border-pink-100">
        <p className="text-sm text-pink-700">
          8文字×5行（合計40文字以内）で入力してください。
          <br />
          すべて全角文字で入力されます。
        </p>
      </div>

      {/* 入力エリア */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          {/* プレビュー表示 */}
          {showPreview ? (
            <div className="bg-gray-900 rounded-lg p-6 text-center">
              <div className="inline-block bg-black p-4 rounded">
                {lines.map((line, index) => (
                  <div 
                    key={index}
                    className="text-green-400 font-mono text-lg tracking-widest h-8 flex items-center justify-center"
                  >
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-xs mt-4">
                ※実際の表示イメージです
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lines.map((line, index) => (
                <div key={index} className="relative">
                  <label className="text-xs text-gray-500 mb-1 block">
                    {index + 1}行目
                  </label>
                  <input
                    type="text"
                    value={line}
                    onChange={(e) => handleLineChange(index, e.target.value)}
                    placeholder={`8文字まで入力`}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg
                             font-mono text-lg tracking-wider
                             focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                    maxLength={MAX_CHARS_PER_LINE}
                  />
                  <span className="absolute right-3 top-8 text-xs text-gray-400">
                    {[...line].length}/{MAX_CHARS_PER_LINE}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 文字数カウント */}
        <div className="mt-4 flex justify-between items-center px-2">
          <span className="text-sm text-gray-600">
            合計文字数
          </span>
          <span className={`text-lg font-bold ${
            totalChars > MAX_TOTAL_CHARS ? 'text-red-500' : 'text-gray-900'
          }`}>
            {totalChars} / {MAX_TOTAL_CHARS}
          </span>
        </div>

        {totalChars > MAX_TOTAL_CHARS && (
          <p className="mt-2 text-sm text-red-500 text-center">
            文字数が上限を超えています
          </p>
        )}
      </div>

      {/* 確定ボタン */}
      <div className="p-4 bg-white border-t">
        <button
          onClick={handleComplete}
          disabled={!isValid}
          className="w-full py-4 bg-pink-500 text-white font-bold rounded-xl
                     hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                     transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          このメッセージで決定
        </button>
      </div>
    </div>
  );
}
