import styles from './styles.module.css'
import AIScore from '@/components/AIScore'
import TradePlan from '@/components/TradePlan'
import { analyzeGold } from '@/lib/analysis'

async function getGoldData() {
  try {
    const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=6mo', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 300 }
    })
    
    const data = await res.json()
    const result = data.chart.result[0]
    
    const prices = result.timestamp.map((time: number, i: number) => ({
      date: new Date(time * 1000).toISOString().split('T')[0],
      open: result.indicators.quote[0].open[i],
      high: result.indicators.quote[0].high[i],
      low: result.indicators.quote[0].low[i],
      close: result.indicators.quote[0].close[i],
      volume: result.indicators.quote[0].volume[i]
    })).filter((p: any) => p.close !== null)

    return { prices }
  } catch (error) {
    return { prices: [] }
  }
}

export default async function Home() {
  const { prices } = await getGoldData()
  
  if (prices.length === 0) {
    return (
      <main className={styles.loading}>
        <div style={{ textAlign: 'center' }}>
          <div className={styles.error}>ไม่สามารถดึงข้อมูลได้</div>
          <p style={{ color: '#9ca3af' }}>กรุณาลองใหม่ภายหลัง</p>
        </div>
      </main>
    )
  }
  
  const analysis = analyzeGold(prices)
  const latest = prices[prices.length - 1]
  const prev = prices[prices.length - 2]
  const change = latest.close - prev.close
  const changePercent = (change / prev.close) * 100

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff' }}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Gold AI App Pro</h1>
          <p className={styles.subtitle}>วิเคราะห์ทองคำด้วย AI - คิดเหมือน Smart Money</p>
        </header>

        <div className={styles.grid}>
          {/* Left Column */}
          <div>
            {/* Price Card */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>ราคาทองคำล่าสุด</h2>
              <div className={styles.priceMain}>
                <div className={styles.priceValue}>${latest.close.toFixed(2)}</div>
                <div className={`${styles.priceChange} ${change >= 0 ? styles.priceChangePositive : styles.priceChangeNegative}`}>
                  {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                </div>
              </div>
              <div className={styles.statsGrid}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>เปิด</div>
                  <div style={{ color: '#ffffff' }}>${latest.open.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>สูงสุด</div>
                  <div style={{ color: '#22c55e' }}>${latest.high.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>ต่ำสุด</div>
                  <div style={{ color: '#ef4444' }}>${latest.low.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <div className={styles.statIcon}>📊</div>
                <div className={styles.statLabel}>RSI</div>
                <div className={styles.statValue} style={{ color: analysis.indicators.rsi < 30 ? '#22c55e' : analysis.indicators.rsi > 70 ? '#ef4444' : '#ffffff' }}>
                  {analysis.indicators.rsi.toFixed(1)}
                </div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statIcon}>📈</div>
                <div className={styles.statLabel}>MACD</div>
                <div className={styles.statValue} style={{ color: analysis.indicators.macd > 0 ? '#22c55e' : '#ef4444' }}>
                  {analysis.indicators.macd > 0 ? '+' : ''}{analysis.indicators.macd.toFixed(1)}
                </div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statIcon}>🎯</div>
                <div className={styles.statLabel}>แนวรับ</div>
                <div className={styles.statValue}>${analysis.indicators.bbLower.toFixed(0)}</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statIcon}>🚀</div>
                <div className={styles.statLabel}>แนวต้าน</div>
                <div className={styles.statValue}>${analysis.indicators.bbUpper.toFixed(0)}</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <AIScore analysis={analysis} />
            <div style={{ marginTop: '1.5rem' }}>
              <TradePlan tradePlan={analysis.tradePlan} signal={analysis.decision} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
