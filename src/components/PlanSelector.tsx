// プラン選択コンポーネント - 料金プランを選択
import React, { useState } from 'react';

export interface Plan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  icon: string;
  color: string;
  recommended?: boolean;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: '無料プラン',
    price: 0,
    priceLabel: '¥0',
    description: '抽選で放映（1日1通まで）',
    features: ['抽選で放映', '1日1通まで', 'YouTube LIVEで確認'],
    icon: '🎁',
    color: 'from-green-400 to-emerald-500',
    badge: '初めての方に',
  },
  {
    id: 'team_ai9',
    name: 'TEAM愛9',
    price: 500,
    priceLabel: '¥500/月',
    description: '月額500円で当選確率UP',
    features: ['当選確率UP', '1日2通まで', '優先表示', '限定特典'],
    icon: '💎',
    color: 'from-blue-400 to-indigo-500',
    recommended: true,
    badge: 'おすすめ',
  },
  {
    id: 'reservation',
    name: '事前予約',
    price: 8800,
    priceLabel: '¥8,800〜',
    description: '確実に放映（愛デコ・愛カード対応）',
    features: ['確実放映', '愛デコ対応', '愛カード対応', '時間指定可能'],
    icon: '⭐',
    color: 'from-yellow-400 to-orange-500',
    badge: '確実に届けたい方に',
  },
  {
    id: 'omeari23b',
    name: 'おめあり祭23B',
    price: 3300,
    priceLabel: '¥3,300',
    description: '当日予約OK（23時台放映）',
    features: ['当日予約OK', '23時台放映', '確実放映'],
    icon: '🌙',
    color: 'from-purple-400 to-pink-500',
    badge: '当日でもOK',
  },
];

interface PlanSelectorProps {
  onSelect: (plan: Plan) => void;
  selectedPlanId?: string;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({ onSelect, selectedPlanId }) => {
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">放映プランを選択</h3>
        <p className="text-sm text-gray-500 mt-1">ご希望のプランをお選びください</p>
      </div>

      <div className="grid gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer
              ${selectedPlanId === plan.id 
                ? 'ring-4 ring-pink-400 shadow-xl scale-[1.02]' 
                : 'hover:shadow-lg hover:scale-[1.01]'
              }
              ${plan.recommended ? 'border-2 border-blue-400' : 'border border-gray-200'}
            `}
            onClick={() => onSelect(plan)}
          >
            {/* バッジ */}
            {plan.badge && (
              <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white rounded-bl-xl
                bg-gradient-to-r ${plan.color}`}>
                {plan.badge}
              </div>
            )}

            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* アイコン */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} 
                  flex items-center justify-center text-2xl shadow-lg`}>
                  {plan.icon}
                </div>

                {/* 内容 */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg text-gray-800">{plan.name}</h4>
                    <span className={`text-xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                      {plan.priceLabel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>

                  {/* 特徴 */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {plan.features.slice(0, expandedPlanId === plan.id ? undefined : 3).map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                      >
                        ✓ {feature}
                      </span>
                    ))}
                    {plan.features.length > 3 && expandedPlanId !== plan.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedPlanId(plan.id);
                        }}
                        className="text-xs px-2 py-1 text-pink-500 hover:text-pink-600"
                      >
                        +{plan.features.length - 3}件
                      </button>
                    )}
                  </div>
                </div>

                {/* 選択インジケーター */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                  ${selectedPlanId === plan.id 
                    ? 'border-pink-500 bg-pink-500' 
                    : 'border-gray-300'
                  }`}>
                  {selectedPlanId === plan.id && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 注意事項 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500 leading-relaxed">
          ※ 無料プランは抽選となります。当選結果はYouTube LIVEでご確認ください。<br />
          ※ 事前予約プランは放映日の3日前までにお申し込みください。<br />
          ※ 料金は税込表示です。
        </p>
      </div>
    </div>
  );
};

export default PlanSelector;
