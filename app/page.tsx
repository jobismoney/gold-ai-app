import AIScore from '@/components/AIScore';
import TradePlan from '@/components/TradePlan';
import { analyzeGold } from '@/lib/analysis';

async function getGoldData() {
  try {
    const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=6mo', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 300 }
    });
    
    const data = await res.json();
    const result = data.chart.result[0];
    
    const prices = result.timestamp.map((time: number, i: number) => ({
      date: new Date(time * 1000).toISOString().split('T')[0],
      open: result.indicators.quote[0].open[i],
      high: result.indicators.quote[0].high[i],
      low: result.indicators.quote[0].low[i],
      close: result.indicators.quote[0].close[i],
      volume: result.indicators.quote[0].volume[i]
    })).filter((p: any) => p.close !== null);

    return { prices };
  } catch (error) {
    return { prices: [] };
  }
}

export default async function Home() {
  const { prices } = await getGoldData();
  
  if (prices.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-red-400 mb-4">ไม่สามารถดึงข้อมูลได้</h1>
          <p className="text-gray-400">กรุณาลองใหม่ภายหลัง</p>
        </div>
      </main>
    );
  }
  
  const analysis = analyzeGold(prices);
  const latest = prices[prices.length - 1];
  const prev = prices[prices.length - 2];
  const change = latest.close - prev.close;
  const changePercent = (change / prev.close) * 100;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Gold AI App Pro
          </h1>
          <p className="text-gray-400 mt-2">วิเคราะห์ทองคำด้วย AI - คิดเหมือน Smart Money</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Card */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">ราคาทองคำล่าสุด</h2>
              <div className="flex items-baseline gap-4 mb-4">
                <div className="text-4xl font-bold text-yellow-400">
                  ${latest.close.toFixed(2)}
                </div>
                <div className={`text-lg ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">เปิด</div>
                  <div className="text-white">${latest.open.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-500">สูงสุด</div>
                  <div className="text-green-400">${latest.high.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-500">ต่ำสุด</div>
                  <div className="text-red-400">${latest.low.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-xs text-gray-500">RSI</div>
                <div className={`text-lg font-bold ${analysis.indicators.rsi < 30 ? 'text-green-400' : analysis.indicators.rsi > 70 ? 'text-red-400' : 'text-white'}`}>
                  {analysis.indicators.rsi.toFixed(1)}
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
                <div className="text-2xl mb-1">📈</div>
                <div className="text-xs text-gray-500">MACD</div>
                <div className={`text-lg font-bold ${analysis.indicators.macd > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {analysis.indicators.macd > 0 ? '+' : ''}{analysis.indicators.macd.toFixed(1)}
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs text-gray-500">แนวรับ</div>
                <div className="text-lg font-bold text-white">${analysis.indicators.bbLower.toFixed(0)}</div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
                <div className="text-2xl mb-1">🚀</div>
                <div className="text-xs text-gray-500">แนวต้าน</div>
                <div className="text-lg font-bold text-white">${analysis.indicators.bbUpper.toFixed(0)}</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            <AIScore analysis={analysis} />
            <TradePlan tradePlan={analysis.tradePlan} signal={analysis.decision} />
          </div>
        </div>
      </div>
    </main>
  );
}              <div className="text-xs text-gray-500">อัปเดตล่าสุด</div>
              <div className="text-sm text-gray-300">{latest.date}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Card */}
            <div className="card p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">ราคาทองคำล่าสุด (XAU/USD)</div>
                  <div className="text-4xl md:text-5xl font-bold text-yellow-400 font-mono">
                    ${latest.close.toFixed(2)}
                  </div>
                </div>
                <div className={`text-right px-4 py-2 rounded-lg ${change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  <div className="text-sm font-bold">
                    {change >= 0 ? '+' : ''}{change.toFixed(2)}
                  </div>
                  <div className="text-xs">
                    ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
              
              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
                <div>
                  <div className="text-xs text-gray-500 mb-1">เปิด</div>
                  <div className="text-white font-mono">${latest.open.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">สูงสุด</div>
                  <div className="text-green-400 font-mono">${latest.high.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">ต่ำสุด</div>
                  <div className="text-red-400 font-mono">${latest.low.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4 text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-xs text-gray-400">RSI</div>
                <div className={`text-lg font-bold font-mono ${analysis.indicators.rsi < 30 ? 'text-green-400' : analysis.indicators.rsi > 70 ? 'text-red-400' : 'text-white'}`}>
                  {analysis.indicators.rsi.toFixed(1)}
                </div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl mb-1">📈</div>
                <div className="text-xs text-gray-400">MACD</div>
                <div className={`text-lg font-bold font-mono ${analysis.indicators.macd > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {analysis.indicators.macd > 0 ? '+' : ''}{analysis.indicators.macd.toFixed(1)}
                </div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs text-gray-400">แนวรับ</div>
                <div className="text-lg font-bold font-mono text-white">
                  ${analysis.indicators.bbLower.toFixed(0)}
                </div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl mb-1">🚀</div>
                <div className="text-xs text-gray-400">แนวต้าน</div>
                <div className="text-lg font-bold font-mono text-white">
                  ${analysis.indicators.bbUpper.toFixed(0)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - AI Analysis */}
          <div className="lg:col-span-1">
            <AIScore analysis={analysis} />
          </div>
        </div>
      </div>
    </main>
  );
}
