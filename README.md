# 渋谷愛ビジョン - AIコンシェルジュ LINEミニアプリ

渋谷の大型ビジョンで「おめでとう」「ありがとう」のメッセージを届けるサービスのLINEミニアプリ（LIFF）です。

## 機能

### ユーザー向け機能

- **AIコンシェルジュ対話**: 自然な会話でメッセージ作成をサポート
- **メッセージ作成**: 8文字×5行のビジョン用メッセージを作成
- **プラン選択**: 無料〜有料プランから選択
- **注文管理**: 注文履歴の確認

### 管理者向け機能

- **ダッシュボード**: 注文統計、売上確認
- **注文管理**: ステータス変更、詳細確認
- **プラン管理**: プラン情報の確認

## 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **ルーティング**: React Router v6
- **LIFF SDK**: LINE Front-end Framework
- **AI対話**: カスタム対話エンジン（将来的にAI API連携予定）

## セットアップ

### 前提条件

- Node.js 18以上
- npm または pnpm
- LINE Developersアカウント
- LIFFアプリの作成

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```

### 環境変数

`.env`ファイルを作成し、以下の変数を設定してください：

```env
VITE_LIFF_ID=your-liff-id-here
```

## LINE Developers設定

### 1. チャネルの作成

1. [LINE Developers Console](https://developers.line.biz/console/)にアクセス
2. 新しいプロバイダーを作成（または既存のものを選択）
3. 「LINE Login」チャネルを作成

### 2. LIFFアプリの登録

1. チャネル設定 → LIFF タブ
2. 「追加」をクリック
3. 以下の設定を入力：
   - **サイズ**: Full（推奨）
   - **エンドポイントURL**: デプロイ後のURL
   - **Scope**: profile, openid
   - **ボットリンク機能**: On（Aggressive）

### 3. LIFF IDの取得

作成後に表示されるLIFF IDを`.env`ファイルに設定します。

## デプロイ

### Vercelへのデプロイ

```bash
# Vercel CLIのインストール
npm i -g vercel

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

### 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定：

- `VITE_LIFF_ID`: LIFFアプリのID

## プロジェクト構成

```
shibuya-ai-vision-liff/
├── src/
│   ├── App.tsx              # メインアプリケーション
│   ├── main.tsx             # エントリーポイント
│   ├── index.css            # グローバルスタイル
│   ├── pages/
│   │   └── Admin.tsx        # 管理者画面
│   ├── services/
│   │   ├── aiChatService.ts # AI対話サービス
│   │   ├── orderService.ts  # 注文管理サービス
│   │   └── lineNotificationService.ts # LINE通知サービス
│   ├── types/
│   │   ├── index.ts         # 共通型定義
│   │   └── order.ts         # 注文関連型定義
│   └── hooks/
│       └── useLiff.ts       # LIFFフック
├── scripts/
│   └── send_line_notification.sh # LINE通知スクリプト
├── vercel.json              # Vercel設定
├── tailwind.config.js       # Tailwind設定
└── vite.config.ts           # Vite設定
```

## 料金プラン

| プラン | 料金 | 特徴 |
|--------|------|------|
| 無料プラン | ¥0 | 抽選で放映、1日1通まで |
| TEAM愛9 | ¥500/月 | 当選確率UP、1日2通まで |
| 事前予約 | ¥8,800〜 | 確実放映、愛デコ・愛カード対応 |
| おめあり祭23B | ¥3,300 | 当日予約OK、23時台放映 |

## 今後の拡張予定

- [ ] 実際のAI API連携（Claude/GPT）
- [ ] 決済機能の実装
- [ ] LINE通知の完全実装
- [ ] 放映スケジュール管理
- [ ] 愛デコ・愛カード機能
- [ ] YouTube LIVE連携

## ライセンス

MIT License

## 関連リンク

- [渋谷愛ビジョン公式サイト](https://ec.saivision.jp/)
- [LINE Developers](https://developers.line.biz/)
- [LIFF Documentation](https://developers.line.biz/ja/docs/liff/)
