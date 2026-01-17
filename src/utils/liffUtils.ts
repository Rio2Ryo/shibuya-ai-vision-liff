import liff from '@line/liff';

// LIFF初期化
export async function initializeLiff(liffId: string): Promise<{
  isLoggedIn: boolean;
  isInClient: boolean;
  profile: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
  } | null;
}> {
  try {
    await liff.init({ liffId });
    
    const isLoggedIn = liff.isLoggedIn();
    const isInClient = liff.isInClient();
    
    let profile = null;
    
    if (isLoggedIn) {
      try {
        const liffProfile = await liff.getProfile();
        profile = {
          userId: liffProfile.userId,
          displayName: liffProfile.displayName,
          pictureUrl: liffProfile.pictureUrl,
          statusMessage: liffProfile.statusMessage
        };
      } catch (error) {
        console.error('Failed to get profile:', error);
      }
    }
    
    return { isLoggedIn, isInClient, profile };
  } catch (error) {
    console.error('LIFF initialization failed:', error);
    throw error;
  }
}

// LINEログイン
export function login(redirectUri?: string) {
  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri });
  }
}

// LINEログアウト
export function logout() {
  if (liff.isLoggedIn()) {
    liff.logout();
    window.location.reload();
  }
}

// LIFFを閉じる
export function closeLiff() {
  if (liff.isInClient()) {
    liff.closeWindow();
  }
}

// LINEでメッセージを送信（トーク画面に送信）
export async function sendMessage(message: string): Promise<boolean> {
  if (!liff.isInClient()) {
    console.log('Not in LINE client, cannot send message');
    return false;
  }
  
  try {
    await liff.sendMessages([
      {
        type: 'text',
        text: message
      }
    ]);
    return true;
  } catch (error) {
    console.error('Failed to send message:', error);
    return false;
  }
}

// LINEでFlex Messageを送信
export async function sendFlexMessage(altText: string, contents: any): Promise<boolean> {
  if (!liff.isInClient()) {
    console.log('Not in LINE client, cannot send flex message');
    return false;
  }
  
  try {
    await liff.sendMessages([
      {
        type: 'flex',
        altText,
        contents
      }
    ]);
    return true;
  } catch (error) {
    console.error('Failed to send flex message:', error);
    return false;
  }
}

// シェア機能（ターゲットピッカー）
export async function shareMessage(message: {
  type: string;
  text?: string;
  altText?: string;
  contents?: any;
}[]): Promise<boolean> {
  if (!liff.isApiAvailable('shareTargetPicker')) {
    console.log('shareTargetPicker is not available');
    return false;
  }
  
  try {
    const result = await liff.shareTargetPicker(message as any);
    return result?.status === 'success';
  } catch (error) {
    console.error('Failed to share message:', error);
    return false;
  }
}

// QRコードスキャン
export async function scanQRCode(): Promise<string | null> {
  if (!liff.isApiAvailable('scanCodeV2')) {
    console.log('scanCodeV2 is not available');
    return null;
  }
  
  try {
    const result = await liff.scanCodeV2();
    return result.value || null;
  } catch (error) {
    console.error('Failed to scan QR code:', error);
    return null;
  }
}

// OS情報を取得
export function getOS(): string {
  return liff.getOS() || 'unknown';
}

// 言語情報を取得
export function getLanguage(): string {
  return liff.getLanguage() || 'ja';
}

// LIFFのバージョンを取得
export function getLiffVersion(): string {
  return liff.getVersion() || 'unknown';
}

// アクセストークンを取得
export function getAccessToken(): string | null {
  return liff.getAccessToken();
}

// IDトークンを取得
export function getIDToken(): string | null {
  return liff.getIDToken();
}

// コンテキスト情報を取得
export function getContext(): {
  type: string;
  viewType?: string;
  userId?: string;
  utouId?: string;
  roomId?: string;
  groupId?: string;
} | null {
  return liff.getContext();
}

// 外部ブラウザで開く
export function openExternalBrowser(url: string) {
  if (liff.isInClient()) {
    liff.openWindow({
      url,
      external: true
    });
  } else {
    window.open(url, '_blank');
  }
}

// 注文完了メッセージをシェア
export async function shareOrderCompletion(order: {
  orderId: string;
  recipientName: string;
  message: string;
  planName: string;
  broadcastDate: string;
}): Promise<boolean> {
  const flexMessage = {
    type: 'bubble',
    hero: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '✨ 渋谷愛ビジョン ✨',
          weight: 'bold',
          size: 'lg',
          color: '#ffffff',
          align: 'center'
        }
      ],
      backgroundColor: '#FF69B4',
      paddingAll: '20px'
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: 'メッセージを送りました！',
          weight: 'bold',
          size: 'md',
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
          contents: [
            {
              type: 'text',
              text: `宛先: ${order.recipientName}さん`,
              size: 'sm',
              color: '#666666'
            },
            {
              type: 'text',
              text: `放映予定: ${order.broadcastDate}`,
              size: 'sm',
              color: '#666666',
              margin: 'sm'
            },
            {
              type: 'text',
              text: `プラン: ${order.planName}`,
              size: 'sm',
              color: '#666666',
              margin: 'sm'
            }
          ]
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          backgroundColor: '#1a1a2e',
          cornerRadius: '8px',
          paddingAll: '12px',
          contents: order.message.split('\n').map(line => ({
            type: 'text',
            text: line || ' ',
            color: '#ffffff',
            align: 'center',
            size: 'sm'
          }))
        }
      ]
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '渋谷愛ビジョンで想いを届けよう💕',
          size: 'xs',
          color: '#999999',
          align: 'center'
        }
      ]
    }
  };
  
  return shareMessage([
    {
      type: 'flex',
      altText: `${order.recipientName}さんへのメッセージを渋谷愛ビジョンに送りました！`,
      contents: flexMessage
    }
  ]);
}
