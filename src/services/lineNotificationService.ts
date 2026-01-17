// LINE通知サービス
// LINE MCPを使用してユーザーに通知を送信

import { Order } from '../types/order';

// LINE通知の種類
export type NotificationType = 
  | 'order_received'    // 注文受付
  | 'order_confirmed'   // 注文確定
  | 'payment_completed' // 支払い完了
  | 'broadcast_scheduled' // 放映予定
  | 'broadcast_completed'; // 放映完了

// 通知メッセージの生成
export function generateNotificationMessage(type: NotificationType, order: Order): string {
  switch (type) {
    case 'order_received':
      return `🎉 ご注文ありがとうございます！

【注文内容】
📝 贈る相手: ${order.recipientName}さん
🎊 お祝いの種類: ${order.occasion}
📅 放映希望日: ${order.broadcastDate}
💎 プラン: ${order.planName}
💰 料金: ¥${order.price.toLocaleString()}

メッセージ内容:
${order.messageLines.map(line => `「${line}」`).join('\n')}

${order.price > 0 ? 'お支払いが確認でき次第、放映予約を確定いたします。' : '抽選結果は後日お知らせいたします。'}

渋谷愛ビジョンで、あなたの想いが届きますように 💕`;

    case 'order_confirmed':
      return `✅ ご注文が確定しました！

${order.recipientName}さんへのメッセージが確定しました。

📅 放映予定日: ${order.broadcastDate}

放映が完了しましたらお知らせいたします。
お楽しみに！ 💕`;

    case 'payment_completed':
      return `💳 お支払いが完了しました！

ご入金ありがとうございます。
${order.recipientName}さんへのメッセージの放映準備を進めています。

📅 放映予定日: ${order.broadcastDate}

渋谷愛ビジョンで、あなたの想いが届きますように 💕`;

    case 'broadcast_scheduled':
      return `📺 放映予約が完了しました！

${order.recipientName}さんへのメッセージは
${order.broadcastDate} に放映予定です。

YouTube LIVEでもご確認いただけます。
お楽しみに！ 💕`;

    case 'broadcast_completed':
      return `🎊 放映が完了しました！

${order.recipientName}さんへのメッセージが
渋谷愛ビジョンで放映されました！

あなたの想いが届きましたように 💕

また新しいメッセージを送りたい時は、
いつでもお気軽にご利用ください！`;

    default:
      return '';
  }
}

// Flex Messageの生成（注文確認用）
export function generateOrderFlexMessage(order: Order) {
  return {
    type: 'flex',
    altText: `渋谷愛ビジョン - ${order.recipientName}さんへのメッセージ`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '✨ 渋谷愛ビジョン',
            weight: 'bold',
            size: 'lg',
            color: '#EC4899'
          }
        ],
        backgroundColor: '#FDF2F8',
        paddingAll: 'lg'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${order.recipientName}さんへ`,
            weight: 'bold',
            size: 'xl',
            margin: 'md'
          },
          {
            type: 'separator',
            margin: 'lg'
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            contents: order.messageLines.map(line => ({
              type: 'text',
              text: line,
              size: 'md',
              align: 'center',
              weight: 'bold'
            }))
          },
          {
            type: 'separator',
            margin: 'lg'
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: 'お祝いの種類',
                    size: 'sm',
                    color: '#666666',
                    flex: 1
                  },
                  {
                    type: 'text',
                    text: order.occasion,
                    size: 'sm',
                    color: '#333333',
                    flex: 2,
                    align: 'end'
                  }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '放映希望日',
                    size: 'sm',
                    color: '#666666',
                    flex: 1
                  },
                  {
                    type: 'text',
                    text: order.broadcastDate,
                    size: 'sm',
                    color: '#333333',
                    flex: 2,
                    align: 'end'
                  }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: 'プラン',
                    size: 'sm',
                    color: '#666666',
                    flex: 1
                  },
                  {
                    type: 'text',
                    text: order.planName,
                    size: 'sm',
                    color: '#333333',
                    flex: 2,
                    align: 'end'
                  }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '料金',
                    size: 'sm',
                    color: '#666666',
                    flex: 1
                  },
                  {
                    type: 'text',
                    text: `¥${order.price.toLocaleString()}`,
                    size: 'sm',
                    color: '#EC4899',
                    weight: 'bold',
                    flex: 2,
                    align: 'end'
                  }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'あなたの想いが届きますように 💕',
            size: 'xs',
            color: '#999999',
            align: 'center'
          }
        ],
        paddingAll: 'md'
      },
      styles: {
        body: {
          backgroundColor: '#FFFFFF'
        }
      }
    }
  };
}

// LINE通知サービスクラス
export class LineNotificationService {
  // テキストメッセージを送信
  async sendTextMessage(userId: string, message: string): Promise<boolean> {
    try {
      // デモモードではコンソールに出力
      console.log(`[LINE通知] ユーザー: ${userId}`);
      console.log(`[LINE通知] メッセージ: ${message}`);
      
      // 実際のLINE MCP呼び出しはサーバーサイドで行う
      // ここではフロントエンド用のモック
      return true;
    } catch (error) {
      console.error('LINE通知エラー:', error);
      return false;
    }
  }

  // Flexメッセージを送信
  async sendFlexMessage(userId: string, flexMessage: ReturnType<typeof generateOrderFlexMessage>): Promise<boolean> {
    try {
      console.log(`[LINE Flex通知] ユーザー: ${userId}`);
      console.log(`[LINE Flex通知] メッセージ:`, JSON.stringify(flexMessage, null, 2));
      
      return true;
    } catch (error) {
      console.error('LINE Flex通知エラー:', error);
      return false;
    }
  }

  // 注文通知を送信
  async sendOrderNotification(order: Order, type: NotificationType): Promise<boolean> {
    const message = generateNotificationMessage(type, order);
    
    if (order.lineUserId) {
      return this.sendTextMessage(order.lineUserId, message);
    }
    
    // デモモードではコンソールに出力
    console.log(`[LINE通知 - デモ] ${type}:`, message);
    return true;
  }
}

// シングルトンインスタンス
export const lineNotificationService = new LineNotificationService();
