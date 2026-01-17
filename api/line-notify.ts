// Vercel Serverless Function - LINE Notification API
// LINE Messaging APIを使用して通知を送信

interface OrderData {
  orderId: string;
  recipientName: string;
  occasion: string;
  date: string;
  messageLines: string[];
  plan: string;
  price: number;
  userId?: string;
}

interface RequestBody {
  type: 'order_confirmation' | 'broadcast_scheduled' | 'broadcast_complete';
  order: OrderData;
  userId?: string;
}

// Flex Messageテンプレートの生成
function createOrderConfirmationFlex(order: OrderData) {
  return {
    type: 'flex',
    altText: `ご注文確認 - ${order.recipientName}さんへのメッセージ`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🎉 ご注文ありがとうございます',
            weight: 'bold',
            size: 'lg',
            color: '#ec4899'
          }
        ],
        backgroundColor: '#fff0f5'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `注文ID: ${order.orderId}`,
            size: 'sm',
            color: '#666666'
          },
          {
            type: 'separator',
            margin: 'md'
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: '📝 メッセージ内容',
                weight: 'bold',
                size: 'sm'
              },
              {
                type: 'box',
                layout: 'vertical',
                margin: 'sm',
                backgroundColor: '#1a1a1a',
                cornerRadius: 'md',
                paddingAll: 'md',
                contents: order.messageLines.map(line => ({
                  type: 'text',
                  text: line,
                  color: '#ffffff',
                  align: 'center'
                }))
              }
            ]
          },
          {
            type: 'separator',
            margin: 'md'
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '宛先', size: 'sm', color: '#666666', flex: 1 },
                  { type: 'text', text: `${order.recipientName}さん`, size: 'sm', flex: 2 }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                margin: 'sm',
                contents: [
                  { type: 'text', text: '種類', size: 'sm', color: '#666666', flex: 1 },
                  { type: 'text', text: order.occasion, size: 'sm', flex: 2 }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                margin: 'sm',
                contents: [
                  { type: 'text', text: '放映日', size: 'sm', color: '#666666', flex: 1 },
                  { type: 'text', text: order.date, size: 'sm', flex: 2 }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                margin: 'sm',
                contents: [
                  { type: 'text', text: 'プラン', size: 'sm', color: '#666666', flex: 1 },
                  { type: 'text', text: order.plan, size: 'sm', flex: 2 }
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
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '合計金額', weight: 'bold' },
              { type: 'text', text: `¥${order.price.toLocaleString()}`, weight: 'bold', align: 'end', color: '#ec4899' }
            ]
          },
          {
            type: 'text',
            text: '放映が確定しましたらお知らせします💕',
            size: 'xs',
            color: '#666666',
            margin: 'md',
            align: 'center'
          }
        ]
      }
    }
  };
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
    const { type, order, userId } = body;

    // LINE Messaging APIのトークン（環境変数から取得）
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    if (!channelAccessToken) {
      console.warn('LINE_CHANNEL_ACCESS_TOKEN is not set');
      return new Response(JSON.stringify({
        success: true,
        message: 'Notification skipped (no LINE token configured)',
        demo: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let message;
    switch (type) {
      case 'order_confirmation':
        message = createOrderConfirmationFlex(order);
        break;
      case 'broadcast_scheduled':
        message = {
          type: 'text',
          text: `📅 放映予定のお知らせ\n\n${order.recipientName}さんへのメッセージが${order.date}に放映予定です！\n\n注文ID: ${order.orderId}`
        };
        break;
      case 'broadcast_complete':
        message = {
          type: 'text',
          text: `📺 放映完了のお知らせ\n\n${order.recipientName}さんへのメッセージが放映されました！🎉\n\nYouTube LIVEのアーカイブでご確認いただけます。\n\n注文ID: ${order.orderId}`
        };
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid notification type' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    // ユーザーIDがある場合はプッシュメッセージ、なければブロードキャスト
    const endpoint = userId
      ? 'https://api.line.me/v2/bot/message/push'
      : 'https://api.line.me/v2/bot/message/broadcast';

    const requestBody = userId
      ? { to: userId, messages: [message] }
      : { messages: [message] };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE API Error:', errorData);
      return new Response(JSON.stringify({
        success: false,
        error: 'LINE API error',
        details: errorData
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Notification sent successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('LINE Notify API Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const config = {
  runtime: 'edge',
};
