'use client';

import { AnalysisResult } from '@/lib/analysis';

interface AIScoreProps {
  analysis: AnalysisResult;
}

export default function AIScore({ analysis }: AIScoreProps) {
  const getColor = (score: number) => {
    if (score >= 0) return 'text-green-400';
    return 'text-red-400';
  };

  const getBarColor = (score: number) => {
    if (score >= 0) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getDecisionColor = (decision: string) => {
    if (decision.includes('BUY')) return 'text-green-400';
    if (decision.includes('SELL')) return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🤖</span> AI Analysis
      </h2>
      
      <div className="text-center mb-6">
        <div className={`text-4xl font-bold mb-2 ${getDecisionColor(analysis.decision)}`}>
          {analysis.decision}
        </div>
        <div className="text-gray-400">
          ความมั่นใจ: {analysis.confidence}%
        </div>
        <div className="text-sm text-gray-500 mt-1">
          คะแนนรวม: {analysis.totalScore > 0 ? '+' : ''}{analysis.totalScore}
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(analysis.scores).map(([key, score]) => (
          <div key={key} className="flex items-center gap-3">
            <div className="w-28 text-sm text-gray-400 capitalize">
              {key === 'smartMoney' ? 'Smart Money' : key}
            </div>
            <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden relative">
              <div 
                className={`h-full rounded-full transition-all absolute top-0 ${getBarColor(score)}`}
                style={{ 
                  width: `${Math.abs(score) / 30 * 100}%`,
                  left: score >= 0 ? '50%' : `${50 - Math.abs(score) / 30 * 50}%`,
                  right: score < 0 ? '50%' : 'auto'
                }}
              />
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-600" />
            </div>
            <div className={`w-12 text-sm font-mono text-right ${getColor(score)}`}>
              {score > 0 ? '+' : ''}{score}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">เหตุผล:</h3>
        <ul className="space-y-1">
          {analysis.reasons.map((reason, i) => (
            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-yellow-500 mt-0.5">•</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-800">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Indicators:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-400">RSI: <span className="text-white">{analysis.indicators.rsi.toFixed(1)}</span></div>
          <div className="text-gray-400">MACD: <span className="text-white">{analysis.indicators.macd.toFixed(4)}</span></div>
          <div className="text-gray-400">MA20: <span className="text-white">${analysis.indicators.ma20.toFixed(2)}</span></div>
          <div className="text-gray-400">MA50: <span className="text-white">${analysis.indicators.ma50.toFixed(2)}</span></div>
          <div className="text-gray-400">MA200: <span className="text-white">${analysis.indicators.ma200.toFixed(2)}</span></div>
          <div className="text-gray-400">BB: <span className="text-white">${analysis.indicators.bbLower.toFixed(0)} - ${analysis.indicators.bbUpper.toFixed(0)}</span></div>
        </div>
      </div>
    </div>
  );
}
