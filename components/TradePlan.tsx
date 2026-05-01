'use client';

import { TradePlan as TradePlanType } from '@/lib/analysis';

interface TradePlanProps {
  tradePlan: TradePlanType;
  signal: string;
}

export default function TradePlan({ tradePlan, signal }: TradePlanProps) {
  const isBuy = signal.includes('BUY');
  const isSell = signal.includes('SELL');
  const isWait = !isBuy && !isSell;

  if (isWait) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h3 className="text-xl font-bold text-yellow-400 mb-2">รอจังหวะ</h3>
        <p className="text-gray-400">ยังไม่มีสัญญาณชัดเจน</p>
        <p className="text-sm text-gray-500 mt-2">{tradePlan.recommendation}</p>
      </div>
    );
  }

  const getChangePercent = (price: number) => {
    const change = ((price - tradePlan.entry) / tradePlan.entry) * 100;
    return change.toFixed(2);
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>📍</span> แผนการเทรด
      </h2>

      {/* Entry */}
      <div className="flex justify-between items-center p-3 mb-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400">🎯</span>
          <span className="text-sm font-medium text-gray-300">จุดเข้า (Entry)</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-yellow-400 font-mono">
            ${tradePlan.entry.toFixed(2)}
          </div>
        </div>
      </div>

      {/* TP1 */}
      <div className="flex justify-between items-center p-3 mb-2 rounded-lg bg-green-500/10 border border-green-500/20">
        <div className="flex items-center gap-2">
          <span className="text-green-400">🟢</span>
          <span className="text-sm font-medium text-gray-300">TP1 (ปิด 1/3)</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-400 font-mono">
            ${tradePlan.tp1.toFixed(2)}
          </div>
          <div className="text-xs text-green-400">
            {isBuy ? '+' : ''}{getChangePercent(tradePlan.tp1)}%
          </div>
        </div>
      </div>

      {/* TP2 */}
      <div className="flex justify-between items-center p-3 mb-2 rounded-lg bg-green-600/10 border border-green-600/20">
        <div className="flex items-center gap-2">
          <span className="text-green-500">🟢</span>
          <span className="text-sm font-medium text-gray-300">TP2 (ปิด 1/3)</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-500 font-mono">
            ${tradePlan.tp2.toFixed(2)}
          </div>
          <div className="text-xs text-green-500">
            {isBuy ? '+' : ''}{getChangePercent(tradePlan.tp2)}%
          </div>
        </div>
      </div>

      {/* TP3 */}
      <div className="flex justify-between items-center p-3 mb-2 rounded-lg bg-green-700/10 border border-green-700/20">
        <div className="flex items-center gap-2">
          <span className="text-green-600">🟢</span>
          <span className="text-sm font-medium text-gray-300">TP3 (ปิด 1/3 + TS)</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600 font-mono">
            ${tradePlan.tp3.toFixed(2)}
          </div>
          <div className="text-xs text-green-600">
            {isBuy ? '+' : ''}{getChangePercent(tradePlan.tp3)}%
          </div>
        </div>
      </div>

      {/* SL */}
      <div className="flex justify-between items-center p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20">
        <div className="flex items-center gap-2">
          <span className="text-red-400">🛡️</span>
          <span className="text-sm font-medium text-gray-300">Stop Loss</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-red-400 font-mono">
            ${tradePlan.sl.toFixed(2)}
          </div>
          <div className="text-xs text-red-400">
            {isBuy ? '' : '+'}{getChangePercent(tradePlan.sl)}%
          </div>
        </div>
      </div>

      {/* Risk Info */}
      <div className="p-3 rounded-lg bg-gray-800/50 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Risk/Reward:</span>
          <span className="text-white font-bold">1:{tradePlan.riskReward.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">ความเสี่ยง:</span>
          <span className="text-yellow-400">{tradePlan.riskPercent.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">ขนาดลงทุน:</span>
          <span className="text-white font-mono">${tradePlan.positionSize.toFixed(0)}</span>
        </div>
        <div className="pt-2 border-t border-gray-700">
          <span className="text-gray-400">คำแนะนำ: </span>
          <span className="text-white font-medium">{tradePlan.recommendation}</span>
        </div>
      </div>
    </div>
  );
}
