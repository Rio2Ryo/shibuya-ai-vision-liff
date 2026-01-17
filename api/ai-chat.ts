// Vercel Serverless Function for AI Chat
// This file handles AI-powered message generation using Claude/GPT

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChatRequest {
  recipientName: string;
  occasion: string;
  broadcastDate: string;
  additionalInfo?: string;
}

interface MessageSuggestion {
  lines: string[];
  style: string;
}

const SYSTEM_PROMPT = `あなたは渋谷愛ビジョン（大型ビジョン）に表示するメッセージを作成するアシスタントです。

【重要なルール】
- メッセージは8文字×5行（合計40文字以内）
- すべて全角文字で入力
- 心温まる「おめでとう」「ありがとう」のメッセージを作成
- 相手の名前を含める
- シンプルで読みやすい表現を心がける

【メッセージの種類】
- 誕生日: お誕生日おめでとうのメッセージ
- 記念日: 結婚記念日、付き合った記念日など
- 感謝: 日頃の感謝を伝えるメッセージ
- お祝い: 卒業、入学、昇進などのお祝い

3つの異なるスタイルの案を提案してください：
1. 王道・シンプル
2. 可愛い・ポップ
3. 感動・エモーショナル

各案は必ず5行で、各行は8文字以内にしてください。`;

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    const { recipientName, occasion, broadcastDate, additionalInfo } = body;

    const userMessage = `
相手の名前: ${recipientName}さん
お祝いの種類: ${occasion}
放映希望日: ${broadcastDate}
${additionalInfo ? `追加情報: ${additionalInfo}` : ''}

上記の情報を元に、渋谷愛ビジョンに表示する3つのメッセージ案を作成してください。
各案は5行で、各行は8文字以内です。
JSON形式で返してください。
`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Parse the response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Try to extract JSON from the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(suggestions), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If no JSON found, create a structured response from the text
    const suggestions = parseTextToSuggestions(content.text, recipientName);
    return new Response(JSON.stringify(suggestions), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    // Fallback to demo suggestions
    const body: ChatRequest = await request.json();
    const demoSuggestions = generateDemoSuggestions(body.recipientName, body.occasion);
    
    return new Response(JSON.stringify(demoSuggestions), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function parseTextToSuggestions(text: string, recipientName: string): MessageSuggestion[] {
  // Simple parser for text response
  const lines = text.split('\n').filter(line => line.trim());
  const suggestions: MessageSuggestion[] = [];
  
  let currentSuggestion: string[] = [];
  let currentStyle = '王道・シンプル';
  
  for (const line of lines) {
    if (line.includes('案1') || line.includes('シンプル')) {
      if (currentSuggestion.length > 0) {
        suggestions.push({ lines: currentSuggestion.slice(0, 5), style: currentStyle });
      }
      currentSuggestion = [];
      currentStyle = '王道・シンプル';
    } else if (line.includes('案2') || line.includes('ポップ')) {
      if (currentSuggestion.length > 0) {
        suggestions.push({ lines: currentSuggestion.slice(0, 5), style: currentStyle });
      }
      currentSuggestion = [];
      currentStyle = '可愛い・ポップ';
    } else if (line.includes('案3') || line.includes('エモ')) {
      if (currentSuggestion.length > 0) {
        suggestions.push({ lines: currentSuggestion.slice(0, 5), style: currentStyle });
      }
      currentSuggestion = [];
      currentStyle = '感動・エモーショナル';
    } else if (line.length <= 8 && !line.includes(':') && !line.includes('【')) {
      currentSuggestion.push(line.trim());
    }
  }
  
  if (currentSuggestion.length > 0) {
    suggestions.push({ lines: currentSuggestion.slice(0, 5), style: currentStyle });
  }
  
  // Ensure we have at least 3 suggestions
  while (suggestions.length < 3) {
    suggestions.push(...generateDemoSuggestions(recipientName, '誕生日'));
  }
  
  return suggestions.slice(0, 3);
}

function generateDemoSuggestions(recipientName: string, occasion: string): MessageSuggestion[] {
  const name = recipientName.slice(0, 4); // Max 4 chars for name
  
  const templates: Record<string, MessageSuggestion[]> = {
    '誕生日': [
      {
        style: '王道・シンプル',
        lines: [`${name}さん`, 'おたんじょうび', 'おめでとう！', 'しあわせな', 'いちねんを💕'],
      },
      {
        style: '可愛い・ポップ',
        lines: [`${name}へ`, 'HAPPY', 'BIRTHDAY!', 'だいすきだよ', '💕💕💕'],
      },
      {
        style: '感動・エモーショナル',
        lines: [`祝${name}`, 'うまれてきて', 'くれてありがとう', 'いつもそばに', 'いてね💕'],
      },
    ],
    '記念日': [
      {
        style: '王道・シンプル',
        lines: [`${name}へ`, 'きねんびに', 'ありがとう', 'これからも', 'よろしくね💕'],
      },
      {
        style: '可愛い・ポップ',
        lines: [`${name}♡`, 'HAPPY', 'ANNIVERSARY', 'だいすき！', '💕💕💕'],
      },
      {
        style: '感動・エモーショナル',
        lines: [`${name}へ`, 'あなたと', 'すごした日々', 'たからもの', 'ずっと一緒💕'],
      },
    ],
    '感謝': [
      {
        style: '王道・シンプル',
        lines: [`${name}さん`, 'いつも', 'ありがとう', 'これからも', 'よろしく💕'],
      },
      {
        style: '可愛い・ポップ',
        lines: [`${name}へ`, 'THANK YOU', 'いつも', 'だいすき！', '💕💕💕'],
      },
      {
        style: '感動・エモーショナル',
        lines: [`${name}へ`, 'いつも', 'ささえてくれて', 'ほんとうに', 'ありがとう💕'],
      },
    ],
    'お祝い': [
      {
        style: '王道・シンプル',
        lines: [`${name}さん`, 'おめでとう', 'ございます', 'これからも', 'がんばって💕'],
      },
      {
        style: '可愛い・ポップ',
        lines: [`${name}へ`, 'CONGRATS!', 'すごいね！', 'おめでとう', '💕💕💕'],
      },
      {
        style: '感動・エモーショナル',
        lines: [`祝${name}`, 'あなたの', 'がんばりが', 'みのりました', 'おめでとう💕'],
      },
    ],
  };
  
  return templates[occasion] || templates['お祝い'];
}

// Export for Vercel
export const config = {
  runtime: 'edge',
};
