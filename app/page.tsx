import AIScore from '@/components/AIScore';
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

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Gold AI App Pro
          </h1>
          <p className="text-gray-400 mt-2">วิเคราะห์ทองคำด้วย AI - คิดเหมือน Smart Money</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">ราคาทองคำล่าสุด</h2>
              <div className="text-4xl font-bold text-yellow-400">
                ${prices[prices.length - 1].close.toFixed(2)}
              </div>
              <div className="text-gray-400 mt-2">
                อัปเดตล่าสุด: {prices[prices.length - 1].date}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <AIScore analysis={analysis} />
          </div>
        </div>
      </div>
    </main>
  );
}
