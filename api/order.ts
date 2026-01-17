// Vercel Serverless Function - Order Management API
// 注文の作成・取得・更新を管理

interface OrderData {
  id?: string;
  recipientName: string;
  occasion: string;
  date: string;
  messageLines: string[];
  plan: string;
  price: number;
  status: 'pending' | 'confirmed' | 'paid' | 'scheduled' | 'completed' | 'cancelled';
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 注文IDの生成
function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SAV${timestamp}${random}`;
}

// デモ用のインメモリストレージ（本番ではデータベースを使用）
const orders: Map<string, OrderData> = new Map();

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const method = req.method;

  // CORS設定
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    // GET: 注文一覧または特定の注文を取得
    if (method === 'GET') {
      const orderId = url.searchParams.get('id');
      const userId = url.searchParams.get('userId');
      const status = url.searchParams.get('status');

      if (orderId) {
        // 特定の注文を取得
        const order = orders.get(orderId);
        if (!order) {
          return new Response(JSON.stringify({ error: 'Order not found' }), {
            status: 404,
            headers,
          });
        }
        return new Response(JSON.stringify(order), { status: 200, headers });
      }

      // 注文一覧を取得
      let orderList = Array.from(orders.values());

      // フィルタリング
      if (userId) {
        orderList = orderList.filter(o => o.userId === userId);
      }
      if (status) {
        orderList = orderList.filter(o => o.status === status);
      }

      // 日付順にソート（新しい順）
      orderList.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      return new Response(JSON.stringify({
        orders: orderList,
        total: orderList.length
      }), { status: 200, headers });
    }

    // POST: 新規注文を作成
    if (method === 'POST') {
      const body: Partial<OrderData> = await req.json();

      // バリデーション
      if (!body.recipientName || !body.messageLines || !body.plan) {
        return new Response(JSON.stringify({
          error: 'Missing required fields',
          required: ['recipientName', 'messageLines', 'plan']
        }), { status: 400, headers });
      }

      // メッセージのバリデーション（8文字×5行）
      if (body.messageLines.length > 5) {
        return new Response(JSON.stringify({
          error: 'Message exceeds 5 lines'
        }), { status: 400, headers });
      }

      for (const line of body.messageLines) {
        if ([...line].length > 8) {
          return new Response(JSON.stringify({
            error: 'Each line must be 8 characters or less'
          }), { status: 400, headers });
        }
      }

      const orderId = generateOrderId();
      const now = new Date().toISOString();

      const newOrder: OrderData = {
        id: orderId,
        recipientName: body.recipientName,
        occasion: body.occasion || 'その他',
        date: body.date || '',
        messageLines: body.messageLines,
        plan: body.plan,
        price: body.price || 0,
        status: 'pending',
        userId: body.userId,
        createdAt: now,
        updatedAt: now,
      };

      orders.set(orderId, newOrder);

      return new Response(JSON.stringify({
        success: true,
        order: newOrder
      }), { status: 201, headers });
    }

    // PUT: 注文を更新
    if (method === 'PUT') {
      const body: Partial<OrderData> & { id: string } = await req.json();

      if (!body.id) {
        return new Response(JSON.stringify({ error: 'Order ID is required' }), {
          status: 400,
          headers,
        });
      }

      const existingOrder = orders.get(body.id);
      if (!existingOrder) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers,
        });
      }

      const updatedOrder: OrderData = {
        ...existingOrder,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      orders.set(body.id, updatedOrder);

      return new Response(JSON.stringify({
        success: true,
        order: updatedOrder
      }), { status: 200, headers });
    }

    // DELETE: 注文をキャンセル
    if (method === 'DELETE') {
      const orderId = url.searchParams.get('id');

      if (!orderId) {
        return new Response(JSON.stringify({ error: 'Order ID is required' }), {
          status: 400,
          headers,
        });
      }

      const existingOrder = orders.get(orderId);
      if (!existingOrder) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers,
        });
      }

      // 実際には削除せず、ステータスをキャンセルに変更
      existingOrder.status = 'cancelled';
      existingOrder.updatedAt = new Date().toISOString();
      orders.set(orderId, existingOrder);

      return new Response(JSON.stringify({
        success: true,
        message: 'Order cancelled'
      }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers,
    });

  } catch (error) {
    console.error('Order API Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500, headers });
  }
}

export const config = {
  runtime: 'edge',
};
