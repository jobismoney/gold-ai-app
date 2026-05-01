'use client';

import { AnalysisResult } from '@/lib/analysis';
import styles from '../app/styles.module.css';

interface AIScoreProps {
  analysis: AnalysisResult;
}

export default function AIScore({ analysis }: AIScoreProps) {
  const getDecisionClass = (decision: string) => {
    if (decision.includes('BUY')) return styles.signalBuy;
    if (decision.includes('SELL')) return styles.signalSell;
    return styles.signalWait;
  };

  const getScoreColor = (score: number) => {
    if (score > 0) return '#22c55e';
    if (score < 0) return '#ef4444';
    return '#6b7280';
  };

  const getScoreBarColor = (score: number) => {
    if (score > 0) return '#22c55e';
    if (score < 0) return '#ef4444';
    return '#6b7280';
  };

  const maxScores: Record<string, number> = {
    technical: 30,
    fundamental: 25,
    sentiment: 20,
    correlation: 15,
    smartMoney: 10
  };

  return (
    <div className={styles.card}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🤖</span> AI Analysis
      </h2>
      
      {/* Decision Badge */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div className={`${styles.signalBadge} ${getDecisionClass(analysis.decision)}`}>
          {analysis.decision}
        </div>
        <div className={styles.confidence}>
          ความมั่นใจ: {analysis.confidence}%
        </div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
          คะแนนรวม: 
          <span style={{ color: analysis.totalScore > 0 ? '#22c55e' : analysis.totalScore < 0 ? '#ef4444' : '#6b7280' }}>
            {analysis.totalScore > 0 ? '+' : ''}{analysis.totalScore}
          </span>
        </div>
      </div>

      {/* Score Bars */}
      <div className={styles.scoreGrid}>
        {Object.entries(analysis.scores).map(([key, score]) => {
          const max = maxScores[key] || 30;
          const percentage = Math.abs(score) / max * 100;
          const label = key === 'smartMoney' ? 'Smart Money' : key;
          
          return (
            <div key={key} className={styles.scoreRow}>
              <div className={styles.scoreLabel}>{label}</div>
              <div className={styles.scoreBar}>
                <div 
                  className={styles.scoreFill}
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: getScoreBarColor(score)
                  }}
                />
              </div>
              <div className={styles.scoreValue} style={{ color: getScoreColor(score) }}>
                {score > 0 ? '+' : ''}{score}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reasons */}
      <div className={styles.reasons}>
        <h3 className={styles.reasonsTitle}>เหตุผล</h3>
        <ul className={styles.reasonsList}>
          {analysis.reasons.map((reason, i) => (
            <li key={i} className={styles.reasonItem}>
              <span className={styles.reasonBullet}>▸</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Indicators */}
      <div className={styles.indicators}>
        <h3 className={styles.indicatorsTitle}>Indicators</h3>
        <div className={styles.indicatorsGrid}>
          <div className={styles.indicatorBox}>
            <div className={styles.indicatorLabel}>RSI</div>
            <div className={styles.indicatorValue}>{analysis.indicators.rsi.toFixed(1)}</div>
          </div>
          <div className={styles.indicatorBox}>
            <div className={styles.indicatorLabel}>MACD</div>
            <div className={styles.indicatorValue}>{analysis.indicators.macd.toFixed(2)}</div>
          </div>
          <div className={styles.indicatorBox}>
            <div className={styles.indicatorLabel}>MA20</div>
            <div className={styles.indicatorValue}>${analysis.indicators.ma20.toFixed(0)}</div>
          </div>
          <div className={styles.indicatorBox}>
            <div className={styles.indicatorLabel}>MA50</div>
            <div className={styles.indicatorValue}>${analysis.indicators.ma50.toFixed(0)}</div>
          </div>
          <div className={styles.indicatorBox}>
            <div className={styles.indicatorLabel}>MA200</div>
            <div className={styles.indicatorValue}>${analysis.indicators.ma200.toFixed(0)}</div>
          </div>
          <div className={styles.indicatorBox}>
            <div className={styles.indicatorLabel}>Bollinger</div>
            <div className={styles.indicatorValue}>${analysis.indicators.bbLower.toFixed(0)}-${analysis.indicators.bbUpper.toFixed(0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
