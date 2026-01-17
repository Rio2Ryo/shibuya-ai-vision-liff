# 渋谷愛ビジョン LINEミニアプリ - デプロイ手順書

## 概要

このドキュメントでは、渋谷愛ビジョン AIコンシェルジュ LINEミニアプリをVercelにデプロイし、LINE Developersで設定する手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント
- LINE Developersアカウント
- LINE公式アカウント（Messaging API用）

## Step 1: GitHubリポジトリの準備

### 1.1 リポジトリの作成

```bash
# プロジェクトディレクトリに移動
cd /home/ubuntu/shibuya-ai-vision-liff

# Gitリポジトリの初期化（まだの場合）
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: 渋谷愛ビジョン AIコンシェルジュ LINEミニアプリ"

# GitHubにリポジトリを作成してプッシュ
gh repo create shibuya-ai-vision-liff --public --source=. --push
```

## Step 2: Vercelへのデプロイ

### 2.1 Vercelプロジェクトの作成

1. [Vercel](https://vercel.com)にログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリ「shibuya-ai-vision-liff」を選択
4. 「Import」をクリック

### 2.2 プロジェクト設定

以下の設定を確認・入力：

| 項目 | 値 |
|------|-----|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 2.3 環境変数の設定

「Environment Variables」セクションで以下を追加：

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `VITE_LIFF_ID` | （後で設定） | LIFFアプリのID |

### 2.4 デプロイ

「Deploy」ボタンをクリックしてデプロイを開始。

デプロイ完了後、以下のようなURLが発行されます：
```
https://shibuya-ai-vision-liff.vercel.app
```

## Step 3: LINE Developers設定

### 3.1 プロバイダーの作成

1. [LINE Developers Console](https://developers.line.biz/console/)にアクセス
2. 「Create」→「Create a new provider」
3. プロバイダー名を入力（例：「渋谷愛ビジョン」）

### 3.2 LINE Loginチャネルの作成

1. プロバイダーを選択
2. 「Create a new channel」→「LINE Login」を選択
3. 以下の情報を入力：

| 項目 | 値 |
|------|-----|
| Channel type | LINE Login |
| Provider | （作成したプロバイダー） |
| Region | Japan |
| Channel name | 渋谷愛ビジョン AIコンシェルジュ |
| Channel description | 渋谷の大型ビジョンでメッセージを届けるサービス |
| App types | Web app |
| Email address | （管理者メールアドレス） |

### 3.3 LIFFアプリの登録

1. 作成したチャネルの「LIFF」タブを開く
2. 「Add」ボタンをクリック
3. 以下の設定を入力：

| 項目 | 値 |
|------|-----|
| LIFF app name | 渋谷愛ビジョン |
| Size | Full |
| Endpoint URL | `https://shibuya-ai-vision-liff.vercel.app` |
| Scope | ✅ profile, ✅ openid |
| Bot link feature | On (Aggressive) |
| Scan QR | OFF |
| Module mode | OFF |

4. 「Add」をクリック

### 3.4 LIFF IDの取得と設定

1. 作成されたLIFFアプリの「LIFF ID」をコピー
2. Vercelダッシュボードで環境変数を更新：
   - `VITE_LIFF_ID` = コピーしたLIFF ID
3. Vercelで再デプロイ

## Step 4: LINE公式アカウントとの連携（オプション）

### 4.1 Messaging APIチャネルの作成

通知機能を使用する場合：

1. プロバイダーで「Create a new channel」→「Messaging API」
2. チャネル情報を入力
3. チャネルアクセストークンを発行

### 4.2 Webhook設定

1. Messaging APIチャネルの「Messaging API」タブ
2. Webhook URLを設定（バックエンドAPIのURL）
3. 「Use webhook」をONに設定

## Step 5: 動作確認

### 5.1 LIFFアプリのテスト

1. LINE Developers ConsoleでLIFF URLを確認
   - 形式: `https://liff.line.me/{LIFF_ID}`
2. スマートフォンのLINEアプリでURLを開く
3. 以下の機能を確認：
   - AIコンシェルジュとの対話
   - メッセージ作成
   - プラン選択
   - 注文確認

### 5.2 管理画面のテスト

1. ブラウザで `/admin` にアクセス
2. ダッシュボード、注文管理、プラン管理を確認

## トラブルシューティング

### LIFF初期化エラー

```
LIFF initialization failed
```

**解決策**:
- LIFF IDが正しく設定されているか確認
- エンドポイントURLがVercelのURLと一致しているか確認
- HTTPSが使用されているか確認

### 画面が表示されない

**解決策**:
- ブラウザのコンソールでエラーを確認
- Vercelのデプロイログを確認
- 環境変数が正しく設定されているか確認

### LINEで開けない

**解決策**:
- LIFFアプリのSizeが「Full」に設定されているか確認
- Bot link featureが「On」になっているか確認
- LINE公式アカウントが友だち追加されているか確認

## 本番環境チェックリスト

- [ ] 環境変数が本番用に設定されている
- [ ] LIFF IDが正しい
- [ ] エンドポイントURLが本番URLになっている
- [ ] LINE公式アカウントが公開されている
- [ ] Webhook URLが設定されている（通知機能使用時）
- [ ] SSL証明書が有効

## 関連リンク

- [LINE Developers Documentation](https://developers.line.biz/ja/docs/)
- [LIFF Documentation](https://developers.line.biz/ja/docs/liff/)
- [Vercel Documentation](https://vercel.com/docs)
