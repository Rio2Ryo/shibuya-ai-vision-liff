import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('エラーが発生しました:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              エラーが発生しました
            </h2>
            <p className="text-gray-600 mb-6">
              申し訳ございません。予期しないエラーが発生しました。
              もう一度お試しください。
            </p>
            <button
              onClick={this.handleRetry}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              再試行する
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  エラー詳細
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// エラー表示コンポーネント
export const ErrorMessage: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
    <div className="flex items-start">
      <span className="text-red-500 text-xl mr-3">⚠️</span>
      <div className="flex-1">
        <p className="text-red-700 font-medium">エラー</p>
        <p className="text-red-600 text-sm mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            再試行
          </button>
        )}
      </div>
    </div>
  </div>
);

// 成功メッセージコンポーネント
export const SuccessMessage: React.FC<{
  message: string;
  onClose?: () => void;
}> = ({ message, onClose }) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
    <div className="flex items-start">
      <span className="text-green-500 text-xl mr-3">✅</span>
      <div className="flex-1">
        <p className="text-green-700">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-green-500 hover:text-green-700"
        >
          ✕
        </button>
      )}
    </div>
  </div>
);
