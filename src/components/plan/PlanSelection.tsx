import { ArrowLeft, Check, Star, Crown, Clock, Gift } from 'lucide-react';
import { PLANS } from '../../data/plans';
import type { Plan } from '../../types';

interface PlanSelectionProps {
  onBack: () => void;
  onSelect: (plan: Plan) => void;
  selectedPlanId?: string;
}

const planIcons: Record<string, React.ReactNode> = {
  free: <Gift className="w-6 h-6" />,
  team9: <Crown className="w-6 h-6" />,
  reservation: <Star className="w-6 h-6" />,
  omeari23b: <Clock className="w-6 h-6" />,
};

const planColors: Record<string, string> = {
  free: 'from-gray-400 to-gray-500',
  team9: 'from-purple-400 to-purple-600',
  reservation: 'from-pink-400 to-pink-600',
  omeari23b: 'from-blue-400 to-blue-600',
};

export function PlanSelection({ onBack, onSelect, selectedPlanId }: PlanSelectionProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-bold text-gray-900 ml-2">プランを選択</h1>
      </header>

      {/* プラン一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            onClick={() => onSelect(plan)}
            className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer
                       transition-all hover:shadow-lg
                       ${selectedPlanId === plan.id ? 'ring-2 ring-pink-500' : ''}`}
          >
            {/* プランヘッダー */}
            <div className={`bg-gradient-to-r ${planColors[plan.id]} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {planIcons[plan.id]}
                  <div>
                    <h3 className="font-bold text-lg">{plan.nameJa}</h3>
                    <p className="text-white/80 text-sm">{plan.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{plan.priceDisplay}</p>
                  {plan.isGuaranteed && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      確実放映
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* プラン詳細 */}
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 選択インジケーター */}
            {selectedPlanId === plan.id && (
              <div className="bg-pink-50 px-4 py-2 border-t border-pink-100">
                <p className="text-pink-600 text-sm font-medium text-center">
                  ✓ 選択中
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 注意事項 */}
      <div className="p-4 bg-gray-100 border-t">
        <p className="text-xs text-gray-500 text-center">
          ※ 無料プラン・TEAM愛9は抽選での放映となります
          <br />
          ※ 事前予約・おめあり祭23Bは先着順で確実に放映されます
        </p>
      </div>
    </div>
  );
}
