/**
 * LINE Flex Message テンプレート
 * 渋谷愛ビジョン AIコンシェルジュ用
 */

import { Order } from '../types/order';

// プラン情報
const planInfo: Record<string, { name: string; price: string; color: string }> = {
  free: { name: '無料プラン', price: '¥0', color: '#10B981' },
  team_ai9: { name: 'TEAM愛9', price: '¥500/月', color: '#8B5CF6' },
  advance_reservation: { name: '事前予約', price: '¥8,800〜', color: '#EC4899' },
  omeari_23b: { name: 'おめあり祭23B', price: '¥3,300', color: '#F59E0B' }
};

// メッセージを取得するヘルパー関数
const getMessageText = (order: Order): string => {
  return order.message || order.messageLines?.join('\n') || '';
};

// 放映予定日を取得するヘルパー関数
const getScheduledDate = (order: Order): string | undefined => {
  return order.scheduledDate || order.broadcastDate;
};

/**
 * 注文確認のFlex Message
 */
export const createOrderConfirmationFlex = (order: Order) => {
  const plan = planInfo[order.planId] || { name: order.planId, price: '---', color: '#6B7280' };
  const messageText = getMessageText(order);
  const scheduledDate = getScheduledDate(order);
  
  return {
    type: 'flex',
    altText: `【渋谷愛ビジョン】${order.recipientName}さんへのメッセージ注文を受け付けました`,
    contents: {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '💕',
                size: 'xxl',
                flex: 0
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: '渋谷愛ビジョン',
                    weight: 'bold',
                    size: 'lg',
                    color: '#FFFFFF'
                  },
                  {
                    type: 'text',
                    text: 'ご注文ありがとうございます',
                    size: 'xs',
                    color: '#FFFFFF99'
                  }
                ],
                flex: 1,
                paddingStart: 'md'
              }
            ],
            alignItems: 'center'
          }
        ],
        backgroundColor: '#EC4899',
        paddingAll: 'lg'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          // 宛先
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '宛先',
                size: 'xs',
                color: '#9CA3AF'
              },
              {
                type: 'text',
                text: `${order.recipientName}さんへ`,
                weight: 'bold',
                size: 'lg',
                color: '#1F2937',
                margin: 'xs'
              },
              {
                type: 'text',
                text: order.occasion,
                size: 'sm',
                color: '#6B7280'
              }
            ],
            margin: 'md'
          },
          // セパレーター
          {
            type: 'separator',
            margin: 'lg',
            color: '#E5E7EB'
          },
          // メッセージプレビュー
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'メッセージ',
                size: 'xs',
                color: '#9CA3AF'
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: messageText.split('\n').slice(0, 5).map((line: string) => ({
                  type: 'text',
                  text: line.substring(0, 8) || '　',
                  size: 'md',
                  color: '#FBBF24',
                  align: 'center',
                  weight: 'bold'
                })),
                backgroundColor: '#1F2937',
                cornerRadius: 'md',
                paddingAll: 'md',
                margin: 'sm'
              }
            ],
            margin: 'lg'
          },
          // セパレーター
          {
            type: 'separator',
            margin: 'lg',
            color: '#E5E7EB'
          },
          // プラン情報
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: 'プラン',
                    size: 'xs',
                    color: '#9CA3AF'
                  },
                  {
                    type: 'text',
                    text: plan.name,
                    weight: 'bold',
                    size: 'md',
                    color: '#1F2937',
                    margin: 'xs'
                  }
                ],
                flex: 1
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: '金額',
                    size: 'xs',
                    color: '#9CA3AF',
                    align: 'end'
                  },
                  {
                    type: 'text',
                    text: plan.price,
                    weight: 'bold',
                    size: 'lg',
                    color: plan.color,
                    align: 'end',
                    margin: 'xs'
                  }
                ],
                flex: 1
              }
            ],
            margin: 'lg'
          },
          // 放映予定日
          ...(scheduledDate ? [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '📅 放映予定日',
                  size: 'sm',
                  color: '#6B7280',
                  flex: 0
                },
                {
                  type: 'text',
                  text: new Date(scheduledDate).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }),
                  size: 'sm',
                  color: '#1F2937',
                  weight: 'bold',
                  align: 'end',
                  flex: 1
                }
              ],
              margin: 'lg',
              backgroundColor: '#FDF2F8',
              cornerRadius: 'md',
              paddingAll: 'md'
            }
          ] : [])
        ],
        paddingAll: 'lg'
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `注文番号: ${order.id}`,
            size: 'xs',
            color: '#9CA3AF',
            align: 'center'
          },
          {
            type: 'button',
            action: {
              type: 'uri',
              label: '注文履歴を確認',
              uri: 'https://liff.line.me/YOUR_LIFF_ID/history'
            },
            style: 'primary',
            color: '#EC4899',
            margin: 'md',
            height: 'sm'
          }
        ],
        paddingAll: 'lg',
        backgroundColor: '#F9FAFB'
      }
    }
  };
};

/**
 * 放映完了通知のFlex Message
 */
export const createBroadcastCompleteFlex = (order: Order) => {
  const messageText = getMessageText(order);
  
  return {
    type: 'flex',
    altText: `【渋谷愛ビジョン】${order.recipientName}さんへのメッセージが放映されました！`,
    contents: {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🎉',
            size: '3xl',
            align: 'center'
          },
          {
            type: 'text',
            text: '放映完了！',
            weight: 'bold',
            size: 'xl',
            color: '#FFFFFF',
            align: 'center',
            margin: 'sm'
          },
          {
            type: 'text',
            text: 'あなたの想いが渋谷の空に届きました',
            size: 'sm',
            color: '#FFFFFF99',
            align: 'center',
            margin: 'xs'
          }
        ],
        backgroundColor: '#EC4899',
        paddingAll: 'xl'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${order.recipientName}さんへのメッセージ`,
            weight: 'bold',
            size: 'md',
            color: '#1F2937',
            align: 'center'
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: messageText.split('\n').slice(0, 5).map((line: string) => ({
              type: 'text',
              text: line.substring(0, 8) || '　',
              size: 'lg',
              color: '#FBBF24',
              align: 'center',
              weight: 'bold'
            })),
            backgroundColor: '#1F2937',
            cornerRadius: 'lg',
            paddingAll: 'lg',
            margin: 'lg'
          },
          {
            type: 'text',
            text: `放映日時: ${new Date().toLocaleString('ja-JP')}`,
            size: 'xs',
            color: '#9CA3AF',
            align: 'center',
            margin: 'lg'
          }
        ],
        paddingAll: 'lg'
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'ご利用ありがとうございました',
            size: 'sm',
            color: '#6B7280',
            align: 'center'
          },
          {
            type: 'button',
            action: {
              type: 'uri',
              label: '新しいメッセージを作成',
              uri: 'https://liff.line.me/YOUR_LIFF_ID'
            },
            style: 'primary',
            color: '#EC4899',
            margin: 'md'
          }
        ],
        paddingAll: 'lg',
        backgroundColor: '#FDF2F8'
      }
    }
  };
};

/**
 * ステータス更新通知のFlex Message
 */
export const createStatusUpdateFlex = (order: Order, newStatus: string) => {
  const scheduledDate = getScheduledDate(order);
  
  const statusInfo: Record<string, { emoji: string; title: string; description: string; color: string }> = {
    confirmed: {
      emoji: '✅',
      title: '注文が確認されました',
      description: 'お支払いをお待ちしています',
      color: '#3B82F6'
    },
    paid: {
      emoji: '💳',
      title: 'お支払いが完了しました',
      description: '放映の準備を進めています',
      color: '#10B981'
    },
    scheduled: {
      emoji: '📅',
      title: '放映予約が完了しました',
      description: `${scheduledDate ? new Date(scheduledDate).toLocaleDateString('ja-JP') : '近日中'}に放映予定です`,
      color: '#8B5CF6'
    },
    broadcast: {
      emoji: '📺',
      title: '放映が開始されました',
      description: '渋谷の街であなたのメッセージが流れています',
      color: '#EC4899'
    },
    completed: {
      emoji: '🎉',
      title: '放映が完了しました',
      description: 'ご利用ありがとうございました',
      color: '#F59E0B'
    }
  };

  const info = statusInfo[newStatus] || {
    emoji: '📋',
    title: 'ステータスが更新されました',
    description: '',
    color: '#6B7280'
  };

  return {
    type: 'flex',
    altText: `【渋谷愛ビジョン】${info.title}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: info.emoji,
            size: 'xxl',
            align: 'center'
          },
          {
            type: 'text',
            text: info.title,
            weight: 'bold',
            size: 'lg',
            color: '#FFFFFF',
            align: 'center',
            margin: 'sm'
          }
        ],
        backgroundColor: info.color,
        paddingAll: 'lg'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: info.description,
            size: 'sm',
            color: '#6B7280',
            align: 'center',
            wrap: true
          },
          {
            type: 'separator',
            margin: 'lg',
            color: '#E5E7EB'
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '宛先',
                size: 'sm',
                color: '#9CA3AF',
                flex: 0
              },
              {
                type: 'text',
                text: `${order.recipientName}さん`,
                size: 'sm',
                color: '#1F2937',
                align: 'end',
                flex: 1
              }
            ],
            margin: 'lg'
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '注文番号',
                size: 'sm',
                color: '#9CA3AF',
                flex: 0
              },
              {
                type: 'text',
                text: order.id,
                size: 'sm',
                color: '#1F2937',
                align: 'end',
                flex: 1
              }
            ],
            margin: 'sm'
          }
        ],
        paddingAll: 'lg'
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: '詳細を確認',
              uri: 'https://liff.line.me/YOUR_LIFF_ID/history'
            },
            style: 'secondary',
            height: 'sm'
          }
        ],
        paddingAll: 'md'
      }
    }
  };
};

/**
 * ウェルカムメッセージのFlex Message
 */
export const createWelcomeFlex = (userName: string) => {
  return {
    type: 'flex',
    altText: '渋谷愛ビジョンへようこそ！',
    contents: {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '💕✨💕',
            size: 'xxl',
            align: 'center'
          },
          {
            type: 'text',
            text: '渋谷愛ビジョン',
            weight: 'bold',
            size: 'xl',
            color: '#FFFFFF',
            align: 'center',
            margin: 'sm'
          },
          {
            type: 'text',
            text: 'AIコンシェルジュ',
            size: 'sm',
            color: '#FFFFFF99',
            align: 'center'
          }
        ],
        backgroundColor: '#EC4899',
        paddingAll: 'xl'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${userName}さん、ようこそ！`,
            weight: 'bold',
            size: 'lg',
            color: '#1F2937',
            align: 'center'
          },
          {
            type: 'text',
            text: '渋谷の大型ビジョンで\nあなたの「おめでとう」「ありがとう」を\n届けませんか？',
            size: 'sm',
            color: '#6B7280',
            align: 'center',
            wrap: true,
            margin: 'lg'
          },
          {
            type: 'separator',
            margin: 'xl',
            color: '#E5E7EB'
          },
          {
            type: 'text',
            text: '📍 渋谷駅・宮益坂下交差点',
            size: 'sm',
            color: '#9CA3AF',
            align: 'center',
            margin: 'lg'
          },
          {
            type: 'text',
            text: '📝 8文字×5行のメッセージ',
            size: 'sm',
            color: '#9CA3AF',
            align: 'center',
            margin: 'sm'
          },
          {
            type: 'text',
            text: '💰 無料〜有料プランあり',
            size: 'sm',
            color: '#9CA3AF',
            align: 'center',
            margin: 'sm'
          }
        ],
        paddingAll: 'lg'
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'メッセージを作成する',
              uri: 'https://liff.line.me/YOUR_LIFF_ID'
            },
            style: 'primary',
            color: '#EC4899'
          }
        ],
        paddingAll: 'lg'
      }
    }
  };
};

export default {
  createOrderConfirmationFlex,
  createBroadcastCompleteFlex,
  createStatusUpdateFlex,
  createWelcomeFlex
};
