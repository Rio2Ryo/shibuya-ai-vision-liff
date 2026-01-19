import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

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
      text: `✨ 渋谷愛ビジョンへようこそ！\n\n渋谷駅・宮益坂下交差点の大型ビジョンで、大切な人に「おめでとう」「ありがとう」のメッセージを届けられます💕\n\n【使い方】\n1️⃣ 下のメニューから「メッセージを作る」をタップ\n2️⃣ AIコンシェルジュと会話しながらメッセージを作成\n3️⃣ プランを選んで注文完了！\n\n【メッセージ形式】\n📝 8文字×5行（40文字以内）\n\n何かご質問があればお気軽にどうぞ！`,
      quickReplies: ['料金プランを教えて', 'メッセージを作る', '放映場所は？']
    };
  }
  
  // 料金プランの説明
  if (message.includes('料金') || message.includes('プラン') || message.includes('価格') || message.includes('いくら')) {
    return {
      text: `💎 渋谷愛ビジョン 料金プラン\n\n【無料プラン】\n💰 0円\n📌 抽選で放映（1日1通まで）\n\n【TEAM愛9】\n💰 月額500円\n📌 当選確率UP！1日2通まで\n\n【事前予約】\n💰 8,800円〜\n📌 確実に放映！愛デコ・愛カード対応\n\n【おめあり祭23B】\n💰 3,300円\n📌 当日予約OK！23時台に放映\n\nどのプランがご希望ですか？`,
      quickReplies: ['無料で試したい', '確実に届けたい', 'メッセージを作る']
    };
  }
  
  // 放映場所の説明
  if (message.includes('場所') || message.includes('どこ') || message.includes('渋谷')) {
    return {
      text: `📍 放映場所\n\n渋谷駅・宮益坂下交差点にある縦型大型ビジョンです！\n\n🚶 アクセス：\n・渋谷駅 宮益坂口から徒歩1分\n・渋谷ヒカリエの向かい側\n\nビジョンは24時間稼働していますが、メッセージ放映は時間帯によって異なります。\n\n詳しくは公式サイトをご覧ください：\nhttps://ec.saivision.jp/`,
      quickReplies: ['料金プランを教えて', 'メッセージを作る']
    };
  }
  
  // メッセージ作成の案内
  if (message.includes('メッセージ') || message.includes('作る') || message.includes('作成') || message.includes('送りたい')) {
    return {
      text: `💕 メッセージを作りましょう！\n\n下のメニューから「メッセージを作る」をタップすると、AIコンシェルジュが一緒にメッセージを考えてくれます✨\n\n【作れるメッセージ例】\n🎂 誕生日おめでとう\n💍 結婚記念日に感謝\n🎓 卒業・入学おめでとう\n🙏 いつもありがとう\n\n大切な人に想いを届けましょう！`,
      quickReplies: ['メッセージを作る', '料金プランを教えて']
    };
  }
  
  // デフォルトの応答
  return {
    text: `こんにちは！渋谷愛ビジョン AIコンシェルジュです✨\n\n渋谷の大型ビジョンで、大切な人にメッセージを届けませんか？\n\n何かお手伝いできることはありますか？`,
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
  
  try {
    await axios.post('https://api.line.me/v2/bot/message/reply', {
      replyToken,
      messages
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`
      }
    });
  } catch (error: any) {
    console.error('Failed to reply message:', error.response?.data || error.message);
  }
}

// クイックリプライを含むメッセージを構築
function buildMessageWithQuickReplies(text: string, quickReplies?: string[]) {
  const message: any = {
    type: 'text',
    text
  };
  
  const liffId = process.env.VITE_LIFF_ID || '2008914015-ddD1MaIQ';
  
  if (quickReplies && quickReplies.length > 0) {
    message.quickReply = {
      items: quickReplies.map(label => {
        if (label === 'メッセージを作る') {
          return {
            type: 'action',
            action: {
              type: 'uri',
              label,
              uri: `https://liff.line.me/${liffId}`
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
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', message: 'LINE Webhook is active' });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const body = req.body as LineWebhookBody;
    
    if (!body.events || body.events.length === 0) {
      return res.status(200).json({ status: 'ok' });
    }
    
    for (const event of body.events) {
      if (event.type === 'message' && event.message?.type === 'text' && event.replyToken) {
        const userMessage = event.message.text || '';
        const response = generateAIResponse(userMessage);
        const message = buildMessageWithQuickReplies(response.text, response.quickReplies);
        
        await replyMessage(event.replyToken, [message]);
      }
      
      if (event.type === 'follow' && event.replyToken) {
        const welcomeMessage = buildMessageWithQuickReplies(
          `✨ 友だち追加ありがとうございます！\n\n渋谷愛ビジョン AIコンシェルジュです💕\n\n渋谷駅・宮益坂下交差点の大型ビジョンで、大切な人に「おめでとう」「ありがとう」のメッセージを届けられます。\n\n下のメニューから「メッセージを作る」をタップして、AIと一緒にメッセージを作りましょう！`,
          ['使い方を教えて', '料金プランを教えて', 'メッセージを作る']
        );
        
        await replyMessage(event.replyToken, [welcomeMessage]);
      }
    }
    
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
