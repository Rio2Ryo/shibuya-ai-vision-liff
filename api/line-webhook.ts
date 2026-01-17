import type { VercelRequest, VercelResponse } from '@vercel/node';

// LINE Webhook Event Types
interface LineEvent {
  type: string;
  replyToken?: string;
  source: {
    type: string;
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  timestamp: number;
  message?: {
    type: string;
    id: string;
    text?: string;
  };
  postback?: {
    data: string;
  };
}

interface LineWebhookBody {
  destination: string;
  events: LineEvent[];
}

// AIコンシェルジュの応答を生成
function generateAIResponse(userMessage: string): { text: string; quickReplies?: string[] } {
  const message = userMessage.toLowerCase();
  
  // 使い方の説明
  if (message.includes('使い方') || message.includes('ヘルプ') || message.includes('help')) {
    return {
      text: `✨ 渋谷愛ビジョンへようこそ！

渋谷駅・宮益坂下交差点の大型ビジョンで、大切な人に「おめでとう」「ありがとう」のメッセージを届けられます💕

【使い方】
1️⃣ 下のメニューから「メッセージを作る」をタップ
2️⃣ AIコンシェルジュと会話しながらメッセージを作成
3️⃣ プランを選んで注文完了！

【メッセージ形式】
📝 8文字×5行（40文字以内）

何かご質問があればお気軽にどうぞ！`,
      quickReplies: ['料金プランを教えて', 'メッセージを作る', '放映場所は？']
    };
  }
  
  // 料金プランの説明
  if (message.includes('料金') || message.includes('プラン') || message.includes('価格') || message.includes('いくら')) {
    return {
      text: `💎 渋谷愛ビジョン 料金プラン

【無料プラン】
💰 0円
📌 抽選で放映（1日1通まで）

【TEAM愛9】
💰 月額500円
📌 当選確率UP！1日2通まで

【事前予約】
💰 8,800円〜
📌 確実に放映！愛デコ・愛カード対応

【おめあり祭23B】
💰 3,300円
📌 当日予約OK！23時台に放映

どのプランがご希望ですか？`,
      quickReplies: ['無料で試したい', '確実に届けたい', 'メッセージを作る']
    };
  }
  
  // 放映場所の説明
  if (message.includes('場所') || message.includes('どこ') || message.includes('渋谷')) {
    return {
      text: `📍 放映場所

渋谷駅・宮益坂下交差点にある縦型大型ビジョンです！

🚶 アクセス：
・渋谷駅 宮益坂口から徒歩1分
・渋谷ヒカリエの向かい側

ビジョンは24時間稼働していますが、メッセージ放映は時間帯によって異なります。

詳しくは公式サイトをご覧ください：
https://ec.saivision.jp/`,
      quickReplies: ['料金プランを教えて', 'メッセージを作る']
    };
  }
  
  // メッセージ作成の案内
  if (message.includes('メッセージ') || message.includes('作る') || message.includes('作成') || message.includes('送りたい')) {
    return {
      text: `💕 メッセージを作りましょう！

下のメニューから「メッセージを作る」をタップすると、AIコンシェルジュが一緒にメッセージを考えてくれます✨

【作れるメッセージ例】
🎂 誕生日おめでとう
💍 結婚記念日に感謝
🎓 卒業・入学おめでとう
🙏 いつもありがとう

大切な人に想いを届けましょう！`,
      quickReplies: ['メッセージを作る', '料金プランを教えて']
    };
  }
  
  // 無料プランについて
  if (message.includes('無料')) {
    return {
      text: `🎁 無料プランについて

無料プランでは、抽選で渋谷愛ビジョンにメッセージを放映できます！

📌 特徴：
・完全無料
・1日1通まで応募可能
・抽選で当選すると放映

まずは無料で体験してみませんか？`,
      quickReplies: ['メッセージを作る', '確実に届けたい']
    };
  }
  
  // 確実に届けたい
  if (message.includes('確実') || message.includes('予約')) {
    return {
      text: `✅ 確実に届けたい方へ

【事前予約プラン】がおすすめです！

💰 8,800円〜
📌 特徴：
・確実に放映されます
・希望日時を指定可能
・愛デコ・愛カード対応
・YouTube LIVE配信対応

大切な記念日には事前予約がおすすめです💕`,
      quickReplies: ['メッセージを作る', '料金プランを教えて']
    };
  }
  
  // デフォルトの応答
  return {
    text: `こんにちは！渋谷愛ビジョン AIコンシェルジュです✨

渋谷の大型ビジョンで、大切な人にメッセージを届けませんか？

何かお手伝いできることはありますか？`,
    quickReplies: ['使い方を教えて', '料金プランを教えて', 'メッセージを作る']
  };
}

// LINE Messaging APIでメッセージを送信
async function replyMessage(replyToken: string, messages: any[]) {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  
  if (!channelAccessToken) {
    console.error('LINE_CHANNEL_ACCESS_TOKEN is not set');
    return;
  }
  
  const response = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}`
    },
    body: JSON.stringify({
      replyToken,
      messages
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to reply message:', error);
  }
}

// クイックリプライを含むメッセージを構築
function buildMessageWithQuickReplies(text: string, quickReplies?: string[]) {
  const message: any = {
    type: 'text',
    text
  };
  
  if (quickReplies && quickReplies.length > 0) {
    message.quickReply = {
      items: quickReplies.map(label => {
        if (label === 'メッセージを作る') {
          return {
            type: 'action',
            action: {
              type: 'uri',
              label,
              uri: 'https://liff.line.me/placeholder-liff-id'
            }
          };
        }
        return {
          type: 'action',
          action: {
            type: 'message',
            label,
            text: label
          }
        };
      })
    };
  }
  
  return message;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GETリクエストはWebhook URLの検証用
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', message: 'LINE Webhook is active' });
  }
  
  // POSTリクエストのみ処理
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const body = req.body as LineWebhookBody;
    
    // イベントがない場合は200を返す（LINE側の検証リクエスト）
    if (!body.events || body.events.length === 0) {
      return res.status(200).json({ status: 'ok' });
    }
    
    // 各イベントを処理
    for (const event of body.events) {
      // メッセージイベントの処理
      if (event.type === 'message' && event.message?.type === 'text' && event.replyToken) {
        const userMessage = event.message.text || '';
        const response = generateAIResponse(userMessage);
        const message = buildMessageWithQuickReplies(response.text, response.quickReplies);
        
        await replyMessage(event.replyToken, [message]);
      }
      
      // フォローイベントの処理（友だち追加時）
      if (event.type === 'follow' && event.replyToken) {
        const welcomeMessage = buildMessageWithQuickReplies(
          `✨ 友だち追加ありがとうございます！

渋谷愛ビジョン AIコンシェルジュです💕

渋谷駅・宮益坂下交差点の大型ビジョンで、大切な人に「おめでとう」「ありがとう」のメッセージを届けられます。

下のメニューから「メッセージを作る」をタップして、AIと一緒にメッセージを作りましょう！`,
          ['使い方を教えて', '料金プランを教えて', 'メッセージを作る']
        );
        
        await replyMessage(event.replyToken, [welcomeMessage]);
      }
      
      // ポストバックイベントの処理
      if (event.type === 'postback' && event.replyToken && event.postback) {
        const data = event.postback.data;
        // ポストバックデータに応じた処理を追加可能
        console.log('Postback received:', data);
      }
    }
    
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
