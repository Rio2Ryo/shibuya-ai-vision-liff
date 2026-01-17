# 渋谷愛ビジョン AIコンシェルジュ - LINEミニアプリ

<div align="center">
  <img src="https://img.shields.io/badge/LINE-LIFF-00B900?style=for-the-badge&logo=line&logoColor=white" alt="LINE LIFF">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</div>

## 📖 概要

渋谷駅・宮益坂下交差点の大型ビジョンで「おめでとう」「ありがとう」のメッセージを放映できるサービスのLINEミニアプリです。AIコンシェルジュとの対話を通じて、簡単にメッセージを作成・注文できます。

### ✨ 主な機能

- 🤖 **AIコンシェルジュ**: 自然な会話でメッセージ作成をサポート
- 📝 **メッセージエディター**: 8文字×5行のビジョン用フォーマットに対応
- 💎 **プラン選択**: 無料〜有料まで4種類のプランから選択
- 📊 **管理画面**: 注文管理、統計分析、プラン管理
- 📱 **LINE連携**: LIFF SDKによるシームレスな体験

## 🚀 クイックスタート

### 前提条件

- Node.js 18以上
- npm または pnpm
- LINE Developersアカウント

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/Rio2Ryo/shibuya-ai-vision-liff.git
cd shibuya-ai-vision-liff

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .envファイルを編集してLIFF IDを設定

# 開発サーバーを起動
npm run dev
```

### 環境変数

```env
# LIFF ID（LINE Developersで取得）
VITE_LIFF_ID=your-liff-id

# AI API（オプション）
ANTHROPIC_API_KEY=your-anthropic-api-key

# LINE Messaging API（オプション）
LINE_CHANNEL_ACCESS_TOKEN=your-line-channel-access-token
```

## 📁 プロジェクト構成

```
shibuya-ai-vision-liff/
├── api/                    # Vercel Serverless Functions
│   ├── chat.ts            # AI チャット API
│   ├── order.ts           # 注文管理 API
│   └── line-notify.ts     # LINE 通知 API
├── src/
│   ├── components/        # React コンポーネント
│   │   ├── common/        # 共通コンポーネント
│   │   ├── chat/          # チャット関連
│   │   ├── message/       # メッセージエディター
│   │   └── plan/          # プラン選択
│   ├── constants/         # 定数定義
│   ├── hooks/             # カスタムフック
│   ├── pages/             # ページコンポーネント
│   ├── services/          # サービス層
│   ├── stores/            # 状態管理（Zustand）
│   ├── styles/            # スタイル
│   ├── types/             # 型定義
│   └── utils/             # ユーティリティ
├── scripts/               # スクリプト
└── public/                # 静的ファイル
```

## 🎨 機能詳細

### ユーザー向け機能

#### AIコンシェルジュ
- 自然言語での対話
- メッセージ提案（3パターン）
- プラン推奨
- 注文確認

#### メッセージ作成
- 8文字×5行のフォーマット
- リアルタイムプレビュー
- 文字数カウント
- 絵文字対応

#### 料金プラン
| プラン | 料金 | 特徴 |
|--------|------|------|
| 無料 | ¥0 | 抽選で放映、1日1通 |
| TEAM愛9 | ¥500/月 | 当選確率UP、1日2通 |
| 事前予約 | ¥8,800〜 | 確実放映、愛デコ対応 |
| おめあり祭23B | ¥3,300 | 当日予約OK、23時台放映 |

### 管理者向け機能

- **ダッシュボード**: 注文統計、売上推移
- **注文管理**: ステータス変更、検索・フィルター
- **プラン管理**: プラン情報の編集
- **分析**: 日別・プラン別の分析

## 🛠 技術スタック

### フロントエンド
- **React 18** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - ビルドツール
- **Tailwind CSS** - スタイリング
- **Zustand** - 状態管理
- **React Router** - ルーティング
- **Lucide React** - アイコン
- **LIFF SDK** - LINE連携

### バックエンド
- **Vercel Functions** - サーバーレス関数
- **Anthropic Claude** - AI対話
- **LINE Messaging API** - 通知

## 📱 LINE Developers 設定

### 1. LIFFアプリの作成

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. プロバイダーを選択または作成
3. 「LINEログイン」チャネルを作成
4. 「LIFF」タブで新しいLIFFアプリを追加
5. エンドポイントURLにデプロイ先URLを設定

### 2. Messaging APIの設定（オプション）

1. 「Messaging API」チャネルを作成
2. チャネルアクセストークンを取得
3. Webhook URLを設定

## 🚀 デプロイ

### Vercelへのデプロイ

```bash
# Vercel CLIをインストール
npm i -g vercel

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

### 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定：

- `VITE_LIFF_ID`
- `ANTHROPIC_API_KEY`（オプション）
- `LINE_CHANNEL_ACCESS_TOKEN`（オプション）

## 🧪 開発

### コマンド

```bash
# 開発サーバー
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview

# 型チェック
npm run typecheck

# リント
npm run lint
```

### デモモード

LIFF IDが設定されていない場合、自動的にデモモードで動作します。デモモードでは：

- LIFF認証をスキップ
- ローカルストレージを使用
- AI応答はモック

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストを歓迎します。大きな変更を行う場合は、まずissueを開いて議論してください。

## 📞 サポート

- [渋谷愛ビジョン公式サイト](https://ec.saivision.jp/)
- [LINE公式アカウント](https://line.me/R/ti/p/@shibuya-ai-vision)

---

<div align="center">
  Made with 💕 for 渋谷愛ビジョン
</div>
