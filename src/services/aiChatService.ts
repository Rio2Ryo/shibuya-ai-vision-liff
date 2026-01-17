// AIチャットサービス - Claude/OpenAI APIと連携
// バックエンドAPIを経由してAIと対話する

export interface ConversationContext {
  recipientName: string;
  occasion: string;
  date: string;
  messageLines: string[];
  plan: string;
  currentStep: string;
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

export class AIChatService {
  private conversationHistory: ChatMessage[] = [];
  private context: ConversationContext = {
    recipientName: '',
    occasion: '',
    date: '',
    messageLines: ['', '', '', '', ''],
    plan: '',
    currentStep: 'greeting',
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

    // ステップに応じた応答
    switch (this.context.currentStep) {
      case 'greeting':
        this.context.currentStep = 'ask_recipient';
        return `こんにちは！渋谷愛ビジョンへようこそ 💕

渋谷の大型ビジョンで、大切な人に「おめでとう」「ありがとう」のメッセージを届けませんか？

まず、メッセージを贈りたい相手のお名前を教えてください。`;

      case 'ask_recipient':
        this.context.recipientName = userMessage;
        this.context.currentStep = 'ask_occasion';
        return `${userMessage}さんへのメッセージですね！素敵です ✨

どんなお祝いや感謝を伝えたいですか？

1️⃣ 誕生日おめでとう
2️⃣ 記念日のお祝い
3️⃣ ありがとうを伝えたい
4️⃣ その他のお祝い

番号か、内容を教えてください！`;

      case 'ask_occasion':
        let occasion = 'お祝い';
        if (lowerMessage.includes('1') || lowerMessage.includes('誕生日')) {
          occasion = '誕生日';
        } else if (lowerMessage.includes('2') || lowerMessage.includes('記念日')) {
          occasion = '記念日';
        } else if (lowerMessage.includes('3') || lowerMessage.includes('ありがとう')) {
          occasion = '感謝';
        }
        this.context.occasion = occasion;
        this.context.currentStep = 'ask_date';
        return `${this.context.recipientName}さんへの${occasion}のメッセージですね！

放映を希望する日付を教えてください。
（例：1月20日、来週の土曜日、など）

💡 誕生日の場合は、午前0時の「誕生祭」枠がおすすめです！`;

      case 'ask_date':
        this.context.date = userMessage;
        this.context.currentStep = 'create_message';
        const shortName = this.context.recipientName.slice(0, 4);
        return `${userMessage}の放映ですね！

それでは、${this.context.recipientName}さんへのメッセージを作りましょう！

📝 **メッセージのルール**
・8文字×5行（合計40文字以内）
・すべて全角文字で入力

例えば、こんなメッセージはいかがですか？

\`\`\`
${shortName}へ
お誕生日
おめでとう
いつも
ありがとう♥
\`\`\`

メッセージを入力するか、「提案して」と言ってください！`;

      case 'create_message':
        if (lowerMessage.includes('提案') || lowerMessage.includes('お願い')) {
          const shortName = this.context.recipientName.slice(0, 4);
          return `${this.context.recipientName}さんへのメッセージ案を考えました！

**案1** 🎂
\`\`\`
${shortName}へ
お誕生日
おめでとう
いつも
ありがとう♥
\`\`\`

**案2** 💝
\`\`\`
${shortName}
生まれてきて
くれて
ありがとう
大好きだよ♥
\`\`\`

**案3** ✨
\`\`\`
${shortName}さん
${this.context.occasion === '誕生日' ? 'ハッピー' : 'いつも'}
${this.context.occasion === '誕生日' ? 'バースデー' : 'ありがとう'}
これからも
よろしくね♥
\`\`\`

気に入ったものがあれば「案1」「案2」「案3」と教えてください！
または、自分でメッセージを入力してもOKです！`;
        } else {
          this.context.currentStep = 'select_plan';
          return `素敵なメッセージですね！✨

このメッセージでよろしいですか？

よければ、プランを選びましょう！

🆓 **無料プラン** - 抽選で放映（1日1通まで）
💎 **TEAM愛9** - 月額500円で当選確率UP
⭐ **事前予約** - 8,800円〜で確実に放映
🌙 **おめあり祭23B** - 3,300円で当日予約OK（23時台放映）

どのプランがいいですか？`;
        }
        break;

      case 'select_plan':
        let plan = '無料プラン';
        let price = '無料';
        if (lowerMessage.includes('team') || lowerMessage.includes('チーム') || lowerMessage.includes('愛9')) {
          plan = 'TEAM愛9';
          price = '月額500円';
        } else if (lowerMessage.includes('予約') || lowerMessage.includes('確実')) {
          plan = '事前予約';
          price = '8,800円';
        } else if (lowerMessage.includes('23') || lowerMessage.includes('当日')) {
          plan = 'おめあり祭23B';
          price = '3,300円';
        }
        this.context.plan = plan;
        this.context.currentStep = 'confirm_order';
        return `**${plan}**を選択しました！

📋 **ご注文内容の確認**

👤 贈る相手：${this.context.recipientName}さん
📅 放映希望日：${this.context.date}
🎉 お祝いの種類：${this.context.occasion}
💰 料金：${price}

この内容でよろしいですか？
「OK」と言っていただければ、注文を確定します。`;

      case 'confirm_order':
        if (lowerMessage.includes('ok') || lowerMessage.includes('はい') || lowerMessage.includes('確定')) {
          this.context.currentStep = 'complete';
          return `ご注文ありがとうございます！🎉

${this.context.recipientName}さんへのメッセージを受け付けました。

${this.context.plan === '無料プラン' 
  ? '抽選結果は放映日にYouTube LIVEでご確認ください。'
  : '放映が確定しましたら、LINEでお知らせします。'}

渋谷愛ビジョンで、あなたの想いが届きますように 💕

他にもメッセージを送りたい場合は、「新しいメッセージ」と言ってください！`;
        } else {
          return `修正したい箇所はありますか？

・メッセージを変更 → 「メッセージを変更」
・プランを変更 → 「プランを変更」
・相手を変更 → 「相手を変更」

または「キャンセル」で最初からやり直せます。`;
        }

      case 'complete':
        if (lowerMessage.includes('新しい') || lowerMessage.includes('最初から') || lowerMessage.includes('もう一度')) {
          this.context = {
            recipientName: '',
            occasion: '',
            date: '',
            messageLines: ['', '', '', '', ''],
            plan: '',
            currentStep: 'ask_recipient',
          };
          return `新しいメッセージを作成しましょう！✨

メッセージを贈りたい相手のお名前を教えてください。`;
        } else {
          return `何かお手伝いできることはありますか？

・新しいメッセージを作成 → 「新しいメッセージ」
・プランについて知りたい → 「プランを教えて」
・サービスについて → 「サービスについて」`;
        }

      default:
        return `すみません、よく分かりませんでした。
もう一度教えていただけますか？`;
    }

    return `ありがとうございます！次のステップに進みましょう。`;
  }

  // 会話履歴をリセット
  reset(): void {
    this.conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    this.context = {
      recipientName: '',
      occasion: '',
      date: '',
      messageLines: ['', '', '', '', ''],
      plan: '',
      currentStep: 'greeting',
    };
  }
}

// シングルトンインスタンス
export const aiChatService = new AIChatService();
