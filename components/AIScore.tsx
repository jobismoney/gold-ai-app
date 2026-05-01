'use client';

import { AnalysisResult } from '@/lib/analysis';

interface AIScoreProps {
  analysis: AnalysisResult;
}

export default function AIScore({ analysis }: AIScoreProps) {
  const getDecisionColor = (decision: string) => {
    if (decision.includes('BUY')) return 'text-green-400';
    if (decision.includes('SELL')) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getDecisionBg = (decision: string) => {
    if (decision.includes('BUY')) return 'bg-green-500/20 border-green-500/30';
    if (decision.includes('SELL')) return 'bg-red-500/20 border-red-500/30';
    return 'bg-yellow-500/20 border-yellow-500/30';
  };

  const getScoreColor = (score: number) => {
    if (score > 0) return 'text-green-400';
    if (score < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getScoreBar = (score: number, max: number) => {
    const percentage = Math.abs(score) / max * 100;
    const color = score > 0 ? 'bg-green-500' : score < 0 ? 'bg-red-500' : 'bg-gray-500';
    return { percentage, color };
  };

  const maxScores = {
    technical: 30,
    fundamental: 25,
    sentiment: 20,
    correlation: 15,
    smartMoney: 10
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">🤖</span>
        <span>AI Analysis</span>
      </h2>
      
      {/* Decision Badge */}
      <div className={`text-center mb-6 p-4 rounded-xl border ${getDecisionBg(analysis.decision)}`}>
        <div className={`text-3xl md:text-4xl font-bold mb-2 ${getDecisionColor(analysis.decision)}`}>
          {analysis.decision}
        </div>
        <div className="text-gray-300 text-sm">
          ความมั่นใจ: <span className="font-bold text-white">{analysis.confidence}%</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          คะแนนรวม: 
          <span className={analysis.totalScore > 0 ? 'text-green-400' : analysis.totalScore < 0 ? 'text-red-400' : 'text-gray-400'}>
            {analysis.totalScore > 0 ? '+' : ''}{analysis.totalScore}
          </span>
        </div>
      </div>

      {/* Score Bars */}
      <div className="space-y-4 mb-6">
        {Object.entries(analysis.scores).map(([key, score]) => {
          const { percentage, color } = getScoreBar(score, maxScores[key as keyof typeof maxScores]);
          const label = key === 'smartMoney' ? 'Smart Money' : key;
          
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 capitalize">{label}</span>
                <span className={`font-mono font-bold ${getScoreColor(score)}`}>
                  {score > 0 ? '+' : ''}{score}
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Reasons */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">เหตุผล</h3>
        <ul className="space-y-2">
          {analysis.reasons.map((reason, i) => (
            <li key={i} className="text-sm text-gray-300 flex items-start gap-2 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
              <span className="text-yellow-500 mt-0.5 shrink-0">▸</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Indicators */}
      <div className="pt-4 border-t border-gray-800">
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Indicators</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-800/50 p-2 rounded-lg">
            <div className="text-gray-500 text-xs">RSI</div>
            <div className="text-white font-mono">{analysis.indicators.rsi.toFixed(1)}</div>
          </div>
          <div className="bg-gray-800/50 p-2 rounded-lg">
            <div className="text-gray-500 text-xs">MACD</div>
            <div className="text-white font-mono">{analysis.indicators.macd.toFixed(2)}</div>
          </div>
          <div className="bg-gray-800/50 p-2 rounded-lg">
            <div className="text-gray-500 text-xs">MA20</div>
            <div className="text-white font-mono">${analysis.indicators.ma20.toFixed(0)}</div>
          </div>
          <div className="bg-gray-800/50 p-2 rounded-lg">
            <div className="text-gray-500 text-xs">MA50</div>
            <div className="text-white font-mono">${analysis.indicators.ma50.toFixed(0)}</div>
          </div>
          <div className="bg-gray-800/50 p-2 rounded-lg">
            <div className="text-gray-500 text-xs">MA200</div>
            <div className="text-white font-mono">${analysis.indicators.ma200.toFixed(0)}</div>
          </div>
          <div className="bg-gray-800/50 p-2 rounded-lg">
            <div className="text-gray-500 text-xs">Bollinger</div>
            <div className="text-white font-mono text-xs">${analysis.indicators.bbLower.toFixed(0)}-${analysis.indicators.bbUpper.toFixed(0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
