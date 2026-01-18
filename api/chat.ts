// Vercel Serverless Function - AI Chat API
// Claude APIを使用してチャット応答を生成

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `あなたは「渋谷愛ビジョン」のAIコンシェルジュです。
渋谷の大型ビジョンで「おめでとう」「ありがとう」のメッセージを放映するサービスをサポートします。

【サービス概要】
- 渋谷駅・宮益坂下交差点の縦型大型ビジョンでメッセージを放映
- メッセージは8文字×5行（合計40文字以内）、全角文字のみ
- 料金プラン：
  - 無料（抽選、1日1通）
  - TEAM愛9（月額500円、当選確率UP、1日2通）
  - 事前予約（8,800円〜、確実放映、愛デコ・愛カード対応）
  - おめあり祭23B（3,300円、当日予約OK、23時台放映）

【あなたの役割】
1. ユーザーと親しみやすく会話する
2. メッセージを贈りたい相手の名前を聞く
3. お祝いの種類（誕生日、記念日、感謝など）を確認
4. 放映希望日を聞く
5. メッセージ内容を一緒に考える（8文字×5行のフォーマットで提案）
6. プランを提案・選択してもらう
7. 注文を確認する

【会話のトーン】
- 絵文字を適度に使用（💕✨🎉など）
- 親しみやすく、でも丁寧に
- ユーザーの気持ちに寄り添う

【重要】
- 必ず日本語で応答してください
- メッセージ提案は必ず8文字×5行のフォーマットで（コードブロックで表示）
- ユーザーの入力に柔軟に対応してください
- 会話の流れを自然に進めてください`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ConversationContext {
  recipientName: string;
  occasion: string;
  date: string;
  messageLines: string[];
  plan: string;
  currentStep: string;
}

interface RequestBody {
  messages: Message[];
  context: ConversationContext;
}

// Claude APIを呼び出す
async function callClaudeAPI(messages: { role: string; content: string }[], contextInfo: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
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
        max_tokens: 1024,
        system: SYSTEM_PROMPT + contextInfo,
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
1️⃣ 相手の名前を教えてください
2️⃣ お祝いの種類を選んでください
3️⃣ メッセージを一緒に考えましょう
4️⃣ プランを選んで注文完了！

ご質問があればお気軽にどうぞ！`;
  }
  
  if (message.includes('料金') || message.includes('プラン') || message.includes('価格')) {
    return `💎 料金プラン

【無料】0円 - 抽選で放映（1日1通）
【TEAM愛9】月500円 - 当選確率UP（1日2通）
【事前予約】8,800円〜 - 確実放映
【おめあり祭23B】3,300円 - 23時台放映

どのプランがご希望ですか？`;
  }
  
  return `こんにちは！渋谷愛ビジョン AIコンシェルジュです✨

渋谷の大型ビジョンで、大切な人にメッセージを届けませんか？

まずは、メッセージを届けたい相手のお名前を教えてください💕`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: RequestBody = req.body;
    const { messages, context } = body;

    // システムメッセージを除いたメッセージを準備
    const chatMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // コンテキスト情報をシステムプロンプトに追加
    const contextInfo = `
【現在の会話状態】
- ステップ: ${context.currentStep}
- 相手の名前: ${context.recipientName || '未入力'}
- お祝いの種類: ${context.occasion || '未選択'}
- 放映希望日: ${context.date || '未入力'}
- 選択プラン: ${context.plan || '未選択'}`;

    const assistantMessage = await callClaudeAPI(chatMessages, contextInfo);

    // コンテキストの更新を検出（簡易的な実装）
    const updatedContext = { ...context };
    
    // ステップの自動進行
    if (context.currentStep === 'greeting') {
      updatedContext.currentStep = 'ask_recipient';
    }

    return res.status(200).json({
      message: assistantMessage,
      context: updatedContext,
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'すみません、エラーが発生しました。もう一度お試しください。',
    });
  }
}
