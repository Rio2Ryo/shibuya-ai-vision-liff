# LINE公式アカウント連携 設定ガイド

渋谷愛ビジョン AIコンシェルジュをLINE公式アカウントと連携するための設定手順です。

## 前提条件

- LINE Developers アカウント
- LINE公式アカウント（Messaging API チャネル）
- Vercel アカウント（デプロイ用）

## 1. LINE Developers 設定

### 1.1 チャネルの作成

1. [LINE Developers Console](https://developers.line.biz/console/) にログイン
2. プロバイダーを選択または作成
3. 「新規チャネル作成」→「Messaging API」を選択
4. 必要情報を入力してチャネルを作成

### 1.2 LIFF アプリの登録

1. 作成したチャネルの「LIFF」タブを開く
2. 「追加」ボタンをクリック
3. 以下の設定を入力：

| 項目 | 設定値 |
|------|--------|
| LIFFアプリ名 | 渋谷愛ビジョン AIコンシェルジュ |
| サイズ | Full |
| エンドポイントURL | `https://your-app.vercel.app` |
| Scope | `profile`, `openid` |
| ボットリンク機能 | On (Aggressive) |

4. 作成後、表示される **LIFF ID** をメモ

### 1.3 Webhook 設定

1. チャネルの「Messaging API」タブを開く
2. 「Webhook設定」セクションで以下を設定：

| 項目 | 設定値 |
|------|--------|
| Webhook URL | `https://your-app.vercel.app/api/line-webhook` |
| Webhookの利用 | ON |

3. 「検証」ボタンで接続を確認

### 1.4 応答設定

1. 「LINE Official Account Manager」を開く
2. 「応答設定」で以下を設定：

| 項目 | 設定値 |
|------|--------|
| 応答メッセージ | OFF |
| Webhook | ON |

## 2. Vercel デプロイ設定

### 2.1 環境変数の設定

Vercel プロジェクトの Settings → Environment Variables で以下を設定：

```
VITE_LIFF_ID=your-liff-id
LINE_CHANNEL_ACCESS_TOKEN=your-channel-access-token
LINE_CHANNEL_SECRET=your-channel-secret
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 2.2 デプロイ

```bash
# Vercel CLI でデプロイ
vercel --prod
```

または GitHub 連携で自動デプロイ

## 3. リッチメニュー設定

### 3.1 リッチメニューの作成

LINE Official Account Manager または API で作成：

```json
{
  "size": {
    "width": 2500,
    "height": 843
  },
  "selected": true,
  "name": "渋谷愛ビジョン メニュー",
  "chatBarText": "メニュー",
  "areas": [
    {
      "bounds": { "x": 0, "y": 0, "width": 833, "height": 843 },
      "action": {
        "type": "uri",
        "uri": "https://liff.line.me/YOUR_LIFF_ID"
      }
    },
    {
      "bounds": { "x": 833, "y": 0, "width": 834, "height": 843 },
      "action": {
        "type": "uri",
        "uri": "https://liff.line.me/YOUR_LIFF_ID/history"
      }
    },
    {
      "bounds": { "x": 1667, "y": 0, "width": 833, "height": 843 },
      "action": {
        "type": "message",
        "text": "ヘルプ"
      }
    }
  ]
}
```

### 3.2 リッチメニュー画像

推奨サイズ: 2500 x 843 ピクセル

3つのボタンエリア：
1. **メッセージを作る** - LIFFアプリを起動
2. **注文履歴** - 履歴ページを表示
3. **ヘルプ** - ヘルプメッセージを送信

## 4. 動作確認

### 4.1 LIFFアプリの確認

1. LINE アプリで公式アカウントを友だち追加
2. リッチメニューの「メッセージを作る」をタップ
3. LIFFアプリが起動することを確認

### 4.2 AIボットの確認

1. トークルームでメッセージを送信
2. AIボットが応答することを確認

### 4.3 通知の確認

1. LIFFアプリで注文を完了
2. LINE に注文確認メッセージが届くことを確認

## トラブルシューティング

### LIFFアプリが起動しない

- LIFF ID が正しく設定されているか確認
- エンドポイントURL が正しいか確認
- HTTPS が有効か確認

### Webhook が動作しない

- Webhook URL が正しいか確認
- チャネルアクセストークンが有効か確認
- Vercel のログでエラーを確認

### AIボットが応答しない

- ANTHROPIC_API_KEY が設定されているか確認
- API の利用制限に達していないか確認

## 参考リンク

- [LINE Developers ドキュメント](https://developers.line.biz/ja/docs/)
- [LIFF ドキュメント](https://developers.line.biz/ja/docs/liff/)
- [Messaging API ドキュメント](https://developers.line.biz/ja/docs/messaging-api/)
