import type { VercelRequest, VercelResponse } from '@vercel/node';

// ユーザーの会話状態を管理（本番環境ではRedisやDBを使用）
const conversationStates = new Map<string, {
  step: string;
  data: {
    recipientName?: string;
    celebrationType?: string;
    date?: string;
    message?: string;
    plan?: string;
  };
  history: { role: string; content: string }[];
}>();

// システムプロンプト
const SYSTEM_PROMPT = `あなたは「渋谷愛ビジョン AIコンシェルジュ」です。
渋谷駅・宮益坂下交差点にある大型ビジョンで、大切な人に「おめでとう」「ありがとう」のメッセージを届けるサービスのAIアシスタントです。

【サービス概要】
- 8文字×5行（40文字以内）のメッセージを大型ビジョンに放映
- 誕生日、記念日、感謝、応援などのメッセージを届けられる

【料金プラン】
1. 無料プラン: 0円（抽選、1日1通）
2. TEAM愛9: 月額500円（当選確率UP、1日2通）
3. 事前予約: 8,800円〜（確実放映、愛デコ・愛カード対応）
4. おめあり祭23B: 3,300円（当日予約OK、23時台放映）

【あなたの役割】
- 親しみやすく、温かい口調で対応
- ユーザーがメッセージを作成するのを手伝う
- 質問には簡潔に答える
- 絵文字を適度に使用して親しみやすさを演出
- 長すぎる返答は避け、200文字以内を目安に

【注意事項】
- LIFFアプリでメッセージ作成を案内する場合は「下のメニューから『メッセージを作る』をタップしてください」と伝える
- 不明な質問には「詳しくは公式サイト https://ec.saivision.jp/ をご覧ください」と案内`;

// Claude APIを呼び出す
async function callClaudeAPI(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.log('ANTHROPIC_API_KEY is not set, using fallback response');
    return generateFallbackResponse(messages[messages.length - 1]?.content || '');
  }
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }))
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      return generateFallbackResponse(messages[messages.length - 1]?.content || '');
    }
    
    const data = await response.json();
    return data.content[0]?.text || generateFallbackResponse(messages[messages.length - 1]?.content || '');
  } catch (error) {
    console.error('Claude API call failed:', error);
    return generateFallbackResponse(messages[messages.length - 1]?.content || '');
  }
}

// フォールバック応答を生成
function generateFallbackResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('使い方') || message.includes('ヘルプ')) {
    return `✨ 渋谷愛ビジョンへようこそ！

渋谷駅の大型ビジョンで、大切な人にメッセージを届けられます💕

【使い方】
1️⃣ 下のメニューから「メッセージを作る」をタップ
2️⃣ AIと会話しながらメッセージを作成
3️⃣ プランを選んで注文完了！

ご質問があればお気軽にどうぞ！`;
  }
  
  if (message.includes('料金') || message.includes('プラン') || message.includes('価格')) {
    return `💎 料金プラン

【無料】0円 - 抽選で放映
【TEAM愛9】月500円 - 当選確率UP
【事前予約】8,800円〜 - 確実放映
【おめあり祭23B】3,300円 - 23時台放映

詳しくは下のメニューからご確認ください！`;
  }
  
  if (message.includes('場所') || message.includes('どこ')) {
    return `📍 放映場所

渋谷駅・宮益坂下交差点の大型ビジョンです！
渋谷ヒカリエの向かい側、徒歩1分です。

詳しくは https://ec.saivision.jp/ をご覧ください！`;
  }
  
  return `こんにちは！渋谷愛ビジョン AIコンシェルジュです✨

渋谷の大型ビジョンで、大切な人にメッセージを届けませんか？

下のメニューから「メッセージを作る」をタップして始めましょう！`;
}

// 会話状態を取得または初期化
function getOrCreateState(userId: string) {
  if (!conversationStates.has(userId)) {
    conversationStates.set(userId, {
      step: 'initial',
      data: {},
      history: []
    });
  }
  return conversationStates.get(userId)!;
}

// メイン処理
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }
    
    // 会話状態を取得
    const state = getOrCreateState(userId);
    
    // 会話履歴に追加
    state.history.push({ role: 'user', content: message });
    
    // 履歴が長すぎる場合は古いものを削除
    if (state.history.length > 10) {
      state.history = state.history.slice(-10);
    }
    
    // Claude APIを呼び出し
    const response = await callClaudeAPI(state.history);
    
    // 応答を履歴に追加
    state.history.push({ role: 'assistant', content: response });
    
    // クイックリプライを生成
    const quickReplies = generateQuickReplies(message, response);
    
    return res.status(200).json({
      response,
      quickReplies
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// クイックリプライを生成
function generateQuickReplies(userMessage: string, response: string): string[] {
  const message = userMessage.toLowerCase();
  
  if (message.includes('使い方')) {
    return ['料金プランを教えて', 'メッセージを作る', '放映場所は？'];
  }
  
  if (message.includes('料金') || message.includes('プラン')) {
    return ['無料で試したい', '確実に届けたい', 'メッセージを作る'];
  }
  
  if (message.includes('場所')) {
    return ['料金プランを教えて', 'メッセージを作る'];
  }
  
  // デフォルト
  return ['使い方を教えて', '料金プランを教えて', 'メッセージを作る'];
}
