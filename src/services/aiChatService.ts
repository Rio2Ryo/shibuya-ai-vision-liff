// AIチャットサービス - Claude/OpenAI APIと連携
// バックエンドAPIを経由してAIと対話する

export interface ConversationContext {
  recipientName: string;
  occasion: string;
  broadcastDate: string;
  messageLines: string[];
  selectedPlan: string;
  currentStep: string;
  orderConfirmed: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// システムプロンプト
const SYSTEM_PROMPT = `あなたは「渋谷愛ビジョン」のAIコンシェルジュです。
渋谷の大型ビジョンで「おめでとう」「ありがとう」のメッセージを放映するサービスをサポートします。

【サービス概要】
- 渋谷駅・宮益坂下交差点の縦型大型ビジョンでメッセージを放映
- メッセージは8文字×5行（合計40文字以内）、全角文字のみ
- 料金プラン：無料（抽選）、TEAM愛9（月額500円）、事前予約（8,800円〜）、おめあり祭23B（3,300円）

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
- メッセージ提案は必ず8文字×5行のフォーマットで
- ユーザーの入力に柔軟に対応してください`;

// APIエンドポイント（バックエンド経由）
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '/api/chat';

// メッセージ提案を生成
function generateMessageSuggestions(name: string, occasion: string): string[][] {
  const shortName = name.length > 4 ? name.slice(0, 4) : name;
  
  if (occasion.includes('誕生日')) {
    return [
      [`${shortName}さん`, 'おたんじょうび', 'おめでとう！', 'しあわせな', 'いちねんを💕'],
      [`${shortName}へ`, 'HAPPY', 'BIRTHDAY!', 'だいすきだよ', '💕💕💕'],
      [`祝${shortName}`, 'うまれてきて', 'くれてありがとう', 'いつもそばに', 'いてね💕']
    ];
  } else if (occasion.includes('記念日')) {
    return [
      [`${shortName}へ`, 'きねんび', 'おめでとう', 'これからも', 'よろしくね💕'],
      [`${shortName}と`, 'すごした日々', 'たからもの', 'ありがとう', '愛してる💕'],
      [`${shortName}`, 'いつも', 'ありがとう', 'ずっと一緒に', 'いようね💕']
    ];
  } else if (occasion.includes('感謝') || occasion.includes('ありがとう')) {
    return [
      [`${shortName}さん`, 'いつも', 'ありがとう', 'かんしゃの', 'きもちを💕'],
      [`${shortName}へ`, 'ありがとう', 'あなたがいて', 'しあわせです', '💕💕💕'],
      [`${shortName}`, 'だいすき', 'ありがとう', 'これからも', 'よろしく💕']
    ];
  } else {
    return [
      [`${shortName}さん`, 'おめでとう', 'ございます！', 'すてきな', '一日を💕'],
      [`${shortName}へ`, 'いつも', 'ありがとう', 'だいすきだよ', '💕💕💕'],
      [`${shortName}`, 'しあわせを', 'いのってます', 'がんばって！', '応援💕']
    ];
  }
}

export class AIChatService {
  private conversationHistory: ChatMessage[] = [];
  private context: ConversationContext = {
    recipientName: '',
    occasion: '',
    broadcastDate: '',
    messageLines: ['', '', '', '', ''],
    selectedPlan: '',
    currentStep: 'greeting',
    orderConfirmed: false,
  };

  constructor() {
    this.conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
  }

  getContext(): ConversationContext {
    return { ...this.context };
  }

  updateContext(updates: Partial<ConversationContext>): void {
    this.context = { ...this.context, ...updates };
  }

  async sendMessage(userMessage: string): Promise<string> {
    // ユーザーメッセージを履歴に追加
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    try {
      // バックエンドAPIを呼び出し
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: this.conversationHistory,
          context: this.context,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const assistantMessage = data.message;

      // アシスタントメッセージを履歴に追加
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
      });

      // コンテキストを更新（APIから返された場合）
      if (data.context) {
        this.context = { ...this.context, ...data.context };
      }

      return assistantMessage;
    } catch (error) {
      console.error('AI Chat Error:', error);
      // フォールバック: ローカルで応答を生成
      return this.generateLocalResponse(userMessage);
    }
  }

  // APIが利用できない場合のローカルフォールバック
  private generateLocalResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    const message = userMessage.trim();

    // ステップに応じた応答
    switch (this.context.currentStep) {
      case 'greeting':
        this.context.currentStep = 'ask_recipient';
        return `こんにちは！渋谷愛ビジョンへようこそ 💕

渋谷の大型ビジョンで、大切な人に「おめでとう」「ありがとう」のメッセージを届けませんか？

まず、メッセージを贈りたい相手のお名前を教えてください ✨`;

      case 'ask_recipient':
        // 名前を抽出（「〜さん」「〜へ」などを除去）
        let name = message.replace(/さん$|へ$|に$|様$/g, '').trim();
        if (!name) name = message;
        
        this.context.recipientName = name;
        this.context.currentStep = 'ask_occasion';
        return `${name}さんへのメッセージですね！素敵です ✨

どんなお祝いや感謝を伝えたいですか？

🎂 誕生日おめでとう
💍 記念日のお祝い
🙏 ありがとうを伝えたい
🎉 その他のお祝い

教えてください！`;

      case 'ask_occasion':
        let occasion = 'お祝い';
        if (lowerMessage.includes('誕生日') || lowerMessage.includes('🎂')) {
          occasion = '誕生日';
        } else if (lowerMessage.includes('記念日') || lowerMessage.includes('💍')) {
          occasion = '記念日';
        } else if (lowerMessage.includes('ありがとう') || lowerMessage.includes('感謝') || lowerMessage.includes('🙏')) {
          occasion = '感謝';
        } else if (lowerMessage.includes('お祝い') || lowerMessage.includes('🎉')) {
          occasion = 'お祝い';
        }
        
        this.context.occasion = occasion;
        this.context.currentStep = 'ask_date';
        return `${this.context.recipientName}さんへの${occasion}のメッセージですね！💕

放映を希望する日付を教えてください。
（例：1月25日、来週の土曜日、など）

💡 誕生日の場合は、午前0時の「誕生祭」枠がおすすめです！`;

      case 'ask_date':
        this.context.broadcastDate = message;
        this.context.currentStep = 'create_message';
        
        return `${message}の放映ですね！📅

それでは、${this.context.recipientName}さんへのメッセージを作りましょう！

📝 **メッセージのルール**
・8文字×5行（合計40文字以内）
・すべて全角文字で入力

メッセージを入力するか、「AIに提案してもらう」と言ってください！`;

      case 'create_message':
        if (lowerMessage.includes('提案') || lowerMessage.includes('ai') || lowerMessage.includes('考えて')) {
          const suggestions = generateMessageSuggestions(this.context.recipientName, this.context.occasion);
          this.context.currentStep = 'select_message';
          
          return `${this.context.recipientName}さんへのメッセージ案を考えました！💡

**案1** 🎀
\`\`\`
${suggestions[0].join('\n')}
\`\`\`

**案2** 💝
\`\`\`
${suggestions[1].join('\n')}
\`\`\`

**案3** ✨
\`\`\`
${suggestions[2].join('\n')}
\`\`\`

気に入ったものがあれば「案1」「案2」「案3」と教えてください！
または、自分でメッセージを入力してもOKです！`;
        } else {
          // ユーザーが直接メッセージを入力
          const lines = this.parseMessageToLines(message);
          this.context.messageLines = lines;
          this.context.currentStep = 'select_plan';
          
          return `素敵なメッセージですね！✨

\`\`\`
${lines.join('\n')}
\`\`\`

このメッセージで進めましょう！

次に、放映プランを選んでください 💎`;
        }

      case 'select_message':
        const suggestions = generateMessageSuggestions(this.context.recipientName, this.context.occasion);
        let selectedLines: string[] = [];
        
        if (lowerMessage.includes('案1') || lowerMessage.includes('1')) {
          selectedLines = suggestions[0];
        } else if (lowerMessage.includes('案2') || lowerMessage.includes('2')) {
          selectedLines = suggestions[1];
        } else if (lowerMessage.includes('案3') || lowerMessage.includes('3')) {
          selectedLines = suggestions[2];
        } else {
          // 自分で入力
          selectedLines = this.parseMessageToLines(message);
        }
        
        this.context.messageLines = selectedLines;
        this.context.currentStep = 'select_plan';
        
        return `素敵なメッセージですね！✨

\`\`\`
${selectedLines.join('\n')}
\`\`\`

このメッセージで進めましょう！

次に、放映プランを選んでください 💎`;

      case 'select_plan':
        let plan = '無料プラン';
        let price = 0;
        
        if (lowerMessage.includes('team') || lowerMessage.includes('チーム') || lowerMessage.includes('愛9') || lowerMessage.includes('💎')) {
          plan = 'TEAM愛9';
          price = 500;
        } else if (lowerMessage.includes('予約') || lowerMessage.includes('確実') || lowerMessage.includes('⭐') || lowerMessage.includes('事前')) {
          plan = '事前予約';
          price = 8800;
        } else if (lowerMessage.includes('23') || lowerMessage.includes('当日') || lowerMessage.includes('🌙') || lowerMessage.includes('おめあり')) {
          plan = 'おめあり祭23B';
          price = 3300;
        } else if (lowerMessage.includes('無料') || lowerMessage.includes('🎁')) {
          plan = '無料プラン';
          price = 0;
        }
        
        this.context.selectedPlan = plan;
        this.context.currentStep = 'confirm_order';
        
        return `**${plan}**を選択しました！${price > 0 ? `（¥${price.toLocaleString()}）` : ''}

📋 **ご注文内容の確認**

👤 贈る相手：${this.context.recipientName}さん
📅 放映希望日：${this.context.broadcastDate}
🎉 お祝いの種類：${this.context.occasion}
💰 プラン：${plan}

\`\`\`
${this.context.messageLines.join('\n')}
\`\`\`

この内容でよろしいですか？
「OK！注文する」と言っていただければ、注文を確定します 💕`;

      case 'confirm_order':
        if (lowerMessage.includes('ok') || lowerMessage.includes('はい') || lowerMessage.includes('確定') || lowerMessage.includes('注文')) {
          this.context.currentStep = 'complete';
          this.context.orderConfirmed = true;
          
          const orderId = `SAV${Date.now().toString().slice(-8)}`;
          
          return `🎉 ご注文ありがとうございます！

**注文ID: ${orderId}**

${this.context.recipientName}さんへのメッセージを受け付けました。

${this.context.selectedPlan === '無料プラン' 
  ? '🎲 抽選結果は放映日にYouTube LIVEでご確認ください。'
  : '✅ 放映が確定しましたら、LINEでお知らせします。'}

渋谷愛ビジョンで、あなたの想いが届きますように 💕

他にもメッセージを送りたい場合は、「新しいメッセージを作る」と言ってください！`;
        } else if (lowerMessage.includes('キャンセル') || lowerMessage.includes('やめ')) {
          this.context.currentStep = 'select_plan';
          return `キャンセルしました。

プランを選び直しますか？それとも最初からやり直しますか？`;
        } else {
          return `修正したい箇所はありますか？

・メッセージを変更 → 「メッセージを変更」
・プランを変更 → 「プランを変更」
・相手を変更 → 「相手を変更」

または「OK！注文する」で確定、「キャンセル」で取り消しできます。`;
        }

      case 'complete':
        if (lowerMessage.includes('新しい') || lowerMessage.includes('最初から') || lowerMessage.includes('もう一度') || lowerMessage.includes('作る')) {
          this.context = {
            recipientName: '',
            occasion: '',
            broadcastDate: '',
            messageLines: ['', '', '', '', ''],
            selectedPlan: '',
            currentStep: 'ask_recipient',
            orderConfirmed: false,
          };
          return `新しいメッセージを作成しましょう！✨

メッセージを贈りたい相手のお名前を教えてください 💕`;
        } else if (lowerMessage.includes('ホーム') || lowerMessage.includes('戻る')) {
          return `ありがとうございました！💕

またメッセージを送りたくなったら、いつでもお声がけください ✨

渋谷愛ビジョンで、あなたの想いを届けましょう！`;
        } else {
          return `何かお手伝いできることはありますか？

・新しいメッセージを作成 → 「新しいメッセージを作る」
・プランについて知りたい → 「プランを教えて」
・サービスについて → 「サービスについて」`;
        }

      default:
        return `すみません、よく分かりませんでした 🙏
もう一度教えていただけますか？`;
    }
  }

  // メッセージを行に分割
  private parseMessageToLines(message: string): string[] {
    // 改行で分割
    let lines = message.split(/\n/).filter(line => line.trim());
    
    // 5行に満たない場合は空行を追加
    while (lines.length < 5) {
      lines.push('');
    }
    
    // 5行を超える場合は切り詰め
    lines = lines.slice(0, 5);
    
    // 各行を8文字に制限
    lines = lines.map(line => {
      const chars = [...line.trim()];
      return chars.slice(0, 8).join('');
    });
    
    return lines;
  }

  // 会話履歴をリセット
  reset(): void {
    this.conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    this.context = {
      recipientName: '',
      occasion: '',
      broadcastDate: '',
      messageLines: ['', '', '', '', ''],
      selectedPlan: '',
      currentStep: 'greeting',
      orderConfirmed: false,
    };
  }
}

// シングルトンインスタンス
export const aiChatService = new AIChatService();
