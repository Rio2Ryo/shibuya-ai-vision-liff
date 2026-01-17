import type { ChatMessage, ConversationContext, MessageOccasion } from '../types';
import { PLANS } from '../data/plans';

// AIレスポンスのシミュレーション（実際の実装ではAPIを呼び出す）
export async function generateAiResponse(
  userMessage: string,
  context: ConversationContext
): Promise<{
  response: string;
  updatedContext: Partial<ConversationContext>;
  suggestedAction?: string;
}> {
  // シミュレートされた遅延
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

  const lowerMessage = userMessage.toLowerCase();

  // ステップに応じたレスポンス生成
  switch (context.currentStep) {
    case 'greeting':
      return handleGreeting(userMessage, context);
    case 'ask_recipient':
      return handleRecipient(userMessage, context);
    case 'ask_occasion':
      return handleOccasion(userMessage, context);
    case 'ask_date':
      return handleDate(userMessage, context);
    case 'create_message':
      return handleMessageCreation(userMessage, context);
    case 'select_plan':
      return handlePlanSelection(userMessage, context);
    case 'confirm_order':
      return handleOrderConfirmation(userMessage, context);
    default:
      return handleGeneral(userMessage, context);
  }
}

function handleGreeting(message: string, context: ConversationContext) {
  return {
    response: `こんにちは！渋谷愛ビジョンへようこそ 💕

渋谷の大型ビジョンで、大切な人に「おめでとう」「ありがとう」のメッセージを届けませんか？

まず、メッセージを贈りたい相手のお名前を教えてください。`,
    updatedContext: { currentStep: 'ask_recipient' as const },
  };
}

function handleRecipient(message: string, context: ConversationContext) {
  const name = message.trim();
  
  return {
    response: `${name}さんへのメッセージですね！素敵です ✨

どんなお祝いや感謝を伝えたいですか？

1️⃣ 誕生日おめでとう
2️⃣ 記念日のお祝い
3️⃣ 卒業・入学おめでとう
4️⃣ 結婚おめでとう
5️⃣ ありがとうを伝えたい
6️⃣ その他のお祝い

番号か、内容を教えてください！`,
    updatedContext: { 
      currentStep: 'ask_occasion' as const,
      recipientName: name,
    },
  };
}

function handleOccasion(message: string, context: ConversationContext) {
  let occasion: MessageOccasion = 'other';
  let occasionText = 'お祝い';
  
  if (message.includes('1') || message.includes('誕生日')) {
    occasion = 'birthday';
    occasionText = '誕生日';
  } else if (message.includes('2') || message.includes('記念日')) {
    occasion = 'anniversary';
    occasionText = '記念日';
  } else if (message.includes('3') || message.includes('卒業') || message.includes('入学')) {
    occasion = 'graduation';
    occasionText = '卒業・入学';
  } else if (message.includes('4') || message.includes('結婚')) {
    occasion = 'wedding';
    occasionText = '結婚';
  } else if (message.includes('5') || message.includes('ありがとう')) {
    occasion = 'thanks';
    occasionText = '感謝';
  }

  return {
    response: `${context.recipientName}さんへの${occasionText}のメッセージですね！

放映を希望する日付を教えてください。
（例：1月20日、来週の土曜日、など）

💡 誕生日の場合は、午前0時の「誕生祭」枠がおすすめです！世界で一番早い誕生日おめでとうを届けられます。`,
    updatedContext: { 
      currentStep: 'ask_date' as const,
      occasion,
    },
  };
}

function handleDate(message: string, context: ConversationContext) {
  // 簡易的な日付パース（実際の実装ではより堅牢に）
  const today = new Date();
  let broadcastDate = new Date(today);
  
  if (message.includes('明日')) {
    broadcastDate.setDate(today.getDate() + 1);
  } else if (message.includes('明後日')) {
    broadcastDate.setDate(today.getDate() + 2);
  } else {
    // 日付を抽出する簡易ロジック
    const match = message.match(/(\d+)月(\d+)日/);
    if (match) {
      broadcastDate.setMonth(parseInt(match[1]) - 1);
      broadcastDate.setDate(parseInt(match[2]));
      if (broadcastDate < today) {
        broadcastDate.setFullYear(today.getFullYear() + 1);
      }
    }
  }

  const dateStr = `${broadcastDate.getMonth() + 1}月${broadcastDate.getDate()}日`;

  return {
    response: `${dateStr}の放映ですね！

それでは、${context.recipientName}さんへのメッセージを作りましょう！

📝 **メッセージのルール**
・8文字×5行（合計40文字以内）
・すべて全角文字で入力
・絵文字は使えませんが、♥☆♪は使えます

例えば、こんなメッセージはいかがですか？

\`\`\`
${context.recipientName}へ
お誕生日
おめでとう
いつも
ありがとう♥
\`\`\`

メッセージを入力するか、「提案して」と言っていただければ、私がお手伝いします！`,
    updatedContext: { 
      currentStep: 'create_message' as const,
      broadcastDate,
    },
  };
}

function handleMessageCreation(message: string, context: ConversationContext) {
  if (message.includes('提案') || message.includes('考えて') || message.includes('お願い')) {
    const suggestions = generateMessageSuggestions(context);
    
    return {
      response: `${context.recipientName}さんへのメッセージ案を考えました！

**案1**
\`\`\`
${suggestions[0].join('\n')}
\`\`\`

**案2**
\`\`\`
${suggestions[1].join('\n')}
\`\`\`

気に入ったものがあれば「案1」「案2」と教えてください。または、ご自身でメッセージを入力していただいても大丈夫です！`,
      updatedContext: {},
      suggestedAction: 'show_suggestions',
    };
  }

  // ユーザーが入力したメッセージを解析
  const lines = message.split('\n').slice(0, 5).map(line => line.slice(0, 8));
  while (lines.length < 5) {
    lines.push('');
  }

  const totalChars = lines.join('').length;
  
  if (totalChars > 40) {
    return {
      response: `メッセージが40文字を超えています（現在${totalChars}文字）。
少し短くしていただけますか？

💡 ヒント：「お誕生日おめでとう」は「誕生日おめでとう」にすると2文字節約できます！`,
      updatedContext: {},
    };
  }

  return {
    response: `素敵なメッセージですね！✨

\`\`\`
${lines.join('\n')}
\`\`\`

このメッセージでよろしいですか？

よければ、プランを選びましょう！

🆓 **無料プラン** - 抽選で放映
💎 **TEAM愛9** - 月額500円で当選確率UP
⭐ **事前予約** - 8,800円〜で確実に放映
🌙 **おめあり祭23B** - 3,300円で当日予約OK

どのプランがいいですか？詳しく知りたいプランがあれば教えてください！`,
    updatedContext: { 
      currentStep: 'select_plan' as const,
      messageLines: lines,
    },
  };
}

function handlePlanSelection(message: string, context: ConversationContext) {
  let selectedPlan = PLANS[0]; // デフォルトは無料
  
  if (message.includes('無料') || message.includes('フリー')) {
    selectedPlan = PLANS.find(p => p.id === 'free')!;
  } else if (message.includes('TEAM') || message.includes('チーム') || message.includes('愛9')) {
    selectedPlan = PLANS.find(p => p.id === 'team9')!;
  } else if (message.includes('予約') || message.includes('確実')) {
    selectedPlan = PLANS.find(p => p.id === 'reservation')!;
  } else if (message.includes('23') || message.includes('当日')) {
    selectedPlan = PLANS.find(p => p.id === 'omeari23b')!;
  } else if (message.includes('詳しく') || message.includes('教えて')) {
    return {
      response: `各プランの詳細をご説明しますね！

🆓 **無料プラン**
・料金：無料
・1日1通投稿可能
・放映は抽選（当選確率は低め）
・放映希望日の2日前までに投稿

💎 **TEAM愛9**（月額500円）
・1日2通投稿可能
・当選確率がアップ！
・放映枠の指定可能
・放映決定の事前通知あり

⭐ **事前予約**（8,800円〜）
・確実に放映されます
・1年前から予約可能
・愛デコ（装飾）対応
・愛カード（QR付）対応

🌙 **おめあり祭23B**（3,300円）
・確実に放映
・当日18:59まで予約OK
・毎日23:00〜23:05に放映

どのプランにしますか？`,
      updatedContext: {},
    };
  }

  return {
    response: `**${selectedPlan.nameJa}**を選択しました！

📋 **ご注文内容の確認**

👤 贈る相手：${context.recipientName}さん
📅 放映希望日：${context.broadcastDate ? `${context.broadcastDate.getMonth() + 1}月${context.broadcastDate.getDate()}日` : '未設定'}
💬 メッセージ：
\`\`\`
${context.messageLines?.join('\n') || ''}
\`\`\`
💰 料金：${selectedPlan.priceDisplay}

この内容でよろしいですか？
「OK」または「注文する」と言っていただければ、注文を確定します。`,
    updatedContext: { 
      currentStep: 'confirm_order' as const,
      selectedPlan,
    },
  };
}

function handleOrderConfirmation(message: string, context: ConversationContext) {
  if (message.includes('OK') || message.includes('ok') || message.includes('注文') || message.includes('確定')) {
    return {
      response: `ご注文ありがとうございます！🎉

${context.recipientName}さんへのメッセージを受け付けました。

${context.selectedPlan?.isGuaranteed 
  ? '放映が確定しましたら、LINEでお知らせします。'
  : '抽選結果は放映日にYouTube LIVEでご確認ください。'}

渋谷愛ビジョンで、あなたの想いが届きますように 💕

他にもメッセージを送りたい場合は、「新しいメッセージ」と言ってください！`,
      updatedContext: { 
        currentStep: 'complete' as const,
      },
      suggestedAction: 'order_complete',
    };
  }

  return {
    response: `修正したい箇所はありますか？

・メッセージを変更 → 「メッセージを変更」
・プランを変更 → 「プランを変更」
・日付を変更 → 「日付を変更」

または「キャンセル」で最初からやり直せます。`,
    updatedContext: {},
  };
}

function handleGeneral(message: string, context: ConversationContext) {
  if (message.includes('新しい') || message.includes('最初から')) {
    return {
      response: `新しいメッセージを作成しましょう！

メッセージを贈りたい相手のお名前を教えてください。`,
      updatedContext: { 
        currentStep: 'ask_recipient' as const,
        recipientName: undefined,
        occasion: undefined,
        broadcastDate: undefined,
        messageLines: undefined,
        selectedPlan: undefined,
      },
    };
  }

  return {
    response: `申し訳ありません、よく理解できませんでした。

何かお手伝いできることはありますか？

・新しいメッセージを作成 → 「新しいメッセージ」
・プランについて知りたい → 「プランを教えて」
・使い方を知りたい → 「使い方」`,
    updatedContext: {},
  };
}

function generateMessageSuggestions(context: ConversationContext): string[][] {
  const name = context.recipientName || 'あなた';
  const shortName = name.slice(0, 4);
  
  switch (context.occasion) {
    case 'birthday':
      return [
        [`${shortName}へ`, 'お誕生日', 'おめでとう', 'いつも', 'ありがとう♥'],
        [`${shortName}`, '生まれてきて', 'くれて', 'ありがとう', '大好きだよ♥'],
      ];
    case 'anniversary':
      return [
        [`${shortName}へ`, '記念日', 'おめでとう', 'これからも', 'よろしくね♥'],
        [`${shortName}`, '出会えて', '幸せです', 'ありがとう', '愛してる♥'],
      ];
    case 'thanks':
      return [
        [`${shortName}へ`, 'いつも', 'ありがとう', '感謝の', '気持ちを込めて'],
        [`${shortName}`, 'あなたの', 'おかげです', '本当に', 'ありがとう♥'],
      ];
    default:
      return [
        [`${shortName}へ`, 'おめでとう', 'ございます', '心から', 'お祝いします'],
        [`${shortName}`, '素敵な', '一日を', 'お過ごし', 'ください♥'],
      ];
  }
}

export function createChatMessage(
  role: 'user' | 'assistant',
  content: string
): ChatMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    timestamp: new Date(),
  };
}
