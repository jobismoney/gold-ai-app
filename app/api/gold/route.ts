import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=6mo',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );
    
    const data = await response.json();
    const result = data.chart.result[0];
    
    const prices = result.timestamp.map((time: number, i: number) => ({
      date: new Date(time * 1000).toISOString().split('T')[0],
      open: result.indicators.quote[0].open[i],
      high: result.indicators.quote[0].high[i],
      low: result.indicators.quote[0].low[i],
      close: result.indicators.quote[0].close[i],
      volume: result.indicators.quote[0].volume[i]
    })).filter((p: any) => p.close !== null);

    return NextResponse.json({ prices });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch gold data' }, { status: 500 });
  }
}
