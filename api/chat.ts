// Vercel Serverless Function - AI Chat API
// Claude APIを使用してチャット応答を生成

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: RequestBody = await req.json();
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

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT + contextInfo,
      messages: chatMessages,
    });

    // テキストブロックを抽出
    const textBlock = response.content.find(block => block.type === 'text');
    const assistantMessage = textBlock ? textBlock.text : 'すみません、応答を生成できませんでした。';

    // コンテキストの更新を検出（簡易的な実装）
    const updatedContext = { ...context };
    
    // ステップの自動進行
    if (context.currentStep === 'greeting') {
      updatedContext.currentStep = 'ask_recipient';
    }

    return new Response(JSON.stringify({
      message: assistantMessage,
      context: updatedContext,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'すみません、エラーが発生しました。もう一度お試しください。',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const config = {
  runtime: 'edge',
};
