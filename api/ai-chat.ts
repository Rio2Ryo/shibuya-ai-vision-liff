// Vercel Serverless Function for AI Chat
// This file handles AI-powered message generation using Claude API

import type { VercelRequest, VercelResponse } from '@vercel/node';

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

// Claude APIを呼び出す
async function callClaudeAPI(userMessage: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }
  
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
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }
  
  const data = await response.json();
  return data.content[0]?.text || '';
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
    const body: ChatRequest = req.body;
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

    try {
      const responseText = await callClaudeAPI(userMessage);
      
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return res.status(200).json(suggestions);
      }

      // If no JSON found, create a structured response from the text
      const suggestions = parseTextToSuggestions(responseText, recipientName);
      return res.status(200).json({ suggestions });

    } catch (apiError) {
      console.error('AI API Error:', apiError);
      
      // Fallback to demo suggestions
      const demoSuggestions = generateDemoSuggestions(recipientName, occasion);
      return res.status(200).json({ suggestions: demoSuggestions });
    }

  } catch (error) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
