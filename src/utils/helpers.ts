/**
 * ユーティリティ関数
 */

// 日付フォーマット
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 時刻フォーマット
export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 日時フォーマット
export const formatDateTime = (date: Date | string): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

// 金額フォーマット
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(amount);
};

// 注文IDの生成
export const generateOrderId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SAV${timestamp}${random}`;
};

// メッセージの文字数カウント（全角を考慮）
export const countCharacters = (text: string): number => {
  // 絵文字を1文字としてカウント
  return [...text].length;
};

// メッセージの行数カウント
export const countLines = (text: string): number => {
  return text.split('\n').length;
};

// メッセージのバリデーション（8文字×5行）
export const validateMessage = (text: string): {
  isValid: boolean;
  errors: string[];
  lines: string[];
} => {
  const lines = text.split('\n');
  const errors: string[] = [];

  if (lines.length > 5) {
    errors.push('メッセージは5行以内にしてください');
  }

  lines.forEach((line, index) => {
    const charCount = countCharacters(line);
    if (charCount > 8) {
      errors.push(`${index + 1}行目: ${charCount}文字（8文字以内にしてください）`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    lines
  };
};

// メッセージを8文字×5行に整形
export const formatMessageForVision = (text: string): string[] => {
  const lines = text.split('\n').slice(0, 5);
  return lines.map(line => {
    const chars = [...line];
    return chars.slice(0, 8).join('');
  });
};

// デバウンス関数
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
};

// スロットル関数
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ローカルストレージのラッパー
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }
};

// クリップボードにコピー
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // フォールバック
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textarea);
    return result;
  }
};

// URLパラメータの取得
export const getUrlParams = (): Record<string, string> => {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

// デバイス判定
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// LINE内ブラウザ判定
export const isLineApp = (): boolean => {
  return /Line/i.test(navigator.userAgent);
};

// iOS判定
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Android判定
export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

// スリープ関数
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// ランダムな遅延（自然な会話のため）
export const naturalDelay = (): Promise<void> => {
  const delay = 500 + Math.random() * 1000;
  return sleep(delay);
};

// エラーメッセージの取得
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '予期しないエラーが発生しました';
};

// 配列のシャッフル
export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// 配列からランダムに選択
export const randomPick = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};
