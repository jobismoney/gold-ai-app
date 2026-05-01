'use client';

import { TradePlan as TradePlanType } from '@/lib/analysis';
import styles from '../app/styles.module.css';

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
      <div className={styles.card} style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#eab308', marginBottom: '0.5rem' }}>รอจังหวะ</h3>
        <p style={{ color: '#9ca3af' }}>ยังไม่มีสัญญาณชัดเจน</p>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>{tradePlan.recommendation}</p>
      </div>
    );
  }

  const getChangePercent = (price: number) => {
    const change = ((price - tradePlan.entry) / tradePlan.entry) * 100;
    return change.toFixed(2);
  };

  return (
    <div className={styles.card}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>📍</span> แผนการเทรด
      </h2>

      {/* Entry */}
      <div className={`${styles.planRow} ${styles.entryRow}`}>
        <div className={styles.planLabel}>
          <span style={{ color: '#fbbf24' }}>🎯</span>
          <span style={{ color: '#d1d5db' }}>จุดเข้า (Entry)</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Courier New, monospace', fontWeight: 700, fontSize: '1.125rem', color: '#fbbf24' }}>
            ${tradePlan.entry.toFixed(2)}
          </div>
        </div>
      </div>

      {/* TP1 */}
      <div className={`${styles.planRow} ${styles.tp1Row}`}>
        <div className={styles.planLabel}>
          <span style={{ color: '#22c55e' }}>🟢</span>
          <span style={{ color: '#d1d5db' }}>TP1 (ปิด 1/3)</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Courier New, monospace', fontWeight: 700, fontSize: '1.125rem', color: '#22c55e' }}>
            ${tradePlan.tp1.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#22c55e' }}>
            {isBuy ? '+' : ''}{getChangePercent(tradePlan.tp1)}%
          </div>
        </div>
      </div>

      {/* TP2 */}
      <div className={`${styles.planRow} ${styles.tp2Row}`}>
        <div className={styles.planLabel}>
          <span style={{ color: '#16a34a' }}>🟢</span>
          <span style={{ color: '#d1d5db' }}>TP2 (ปิด 1/3)</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Courier New, monospace', fontWeight: 700, fontSize: '1.125rem', color: '#16a34a' }}>
            ${tradePlan.tp2.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>
            {isBuy ? '+' : ''}{getChangePercent(tradePlan.tp2)}%
          </div>
        </div>
      </div>

      {/* TP3 */}
      <div className={`${styles.planRow} ${styles.tp3Row}`}>
        <div className={styles.planLabel}>
          <span style={{ color: '#15803d' }}>🟢</span>
          <span style={{ color: '#d1d5db' }}>TP3 (ปิด 1/3 + TS)</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Courier New, monospace', fontWeight: 700, fontSize: '1.125rem', color: '#15803d' }}>
            ${tradePlan.tp3.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#15803d' }}>
            {isBuy ? '+' : ''}{getChangePercent(tradePlan.tp3)}%
          </div>
        </div>
      </div>

      {/* SL */}
      <div className={`${styles.planRow} ${styles.slRow}`}>
        <div className={styles.planLabel}>
          <span style={{ color: '#ef4444' }}>🛡️</span>
          <span style={{ color: '#d1d5db' }}>Stop Loss</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Courier New, monospace', fontWeight: 700, fontSize: '1.125rem', color: '#ef4444' }}>
            ${tradePlan.sl.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>
            {isBuy ? '' : '+'}{getChangePercent(tradePlan.sl)}%
          </div>
        </div>
      </div>

      {/* Risk Info */}
      <div className={styles.riskInfo}>
        <div className={styles.riskRow}>
          <span className={styles.riskLabel}>Risk/Reward:</span>
          <span className={styles.riskValue}>1:{tradePlan.riskReward.toFixed(1)}</span>
        </div>
        <div className={styles.riskRow}>
          <span className={styles.riskLabel}>ความเสี่ยง:</span>
          <span style={{ color: '#fbbf24' }}>{tradePlan.riskPercent.toFixed(2)}%</span>
        </div>
        <div className={styles.riskRow}>
          <span className={styles.riskLabel}>ขนาดลงทุน:</span>
          <span style={{ color: '#ffffff', fontFamily: 'Courier New, monospace' }}>${tradePlan.positionSize.toFixed(0)}</span>
        </div>
        <div className={styles.recommendation}>
          <span className={styles.recommendationLabel}>คำแนะนำ: </span>
          <span className={styles.recommendationValue}>{tradePlan.recommendation}</span>
        </div>
      </div>
    </div>
  );
}
