export interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AnalysisResult {
  decision: string;
  confidence: number;
  totalScore: number;
  scores: {
    technical: number;
    fundamental: number;
    sentiment: number;
    correlation: number;
    smartMoney: number;
  };
  reasons: string[];
  indicators: {
    rsi: number;
    macd: number;
    ma20: number;
    ma50: number;
    ma200: number;
    bbUpper: number;
    bbLower: number;
  };
  tradePlan: TradePlan;
}

export interface TradePlan {
  entry: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  riskReward: number;
  riskPercent: number;
  positionSize: number;
  recommendation: string;
}

// ========== TECHNICAL INDICATORS ==========

function calculateRSI(prices: PriceData[], period: number = 14): number {
  const closes = prices.map(p => p.close);
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = closes[closes.length - i] - closes[closes.length - i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgGain / avgLoss;
  
  return 100 - (100 / (1 + rs));
}

function calculateMA(prices: PriceData[], period: number): number {
  const closes = prices.slice(-period).map(p => p.close);
  return closes.reduce((a, b) => a + b, 0) / closes.length;
}

function calculateEMA(prices: number[], period: number): number {
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

function calculateMACD(prices: PriceData[]): number {
  const closes = prices.map(p => p.close);
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  return ema12 - ema26;
}

function calculateBollinger(prices: PriceData[]): { upper: number; lower: number } {
  const closes = prices.slice(-20).map(p => p.close);
  const ma = closes.reduce((a, b) => a + b, 0) / closes.length;
  const squaredDiffs = closes.map(c => Math.pow(c - ma, 2));
  const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / closes.length);
  
  return {
    upper: ma + (stdDev * 2),
    lower: ma - (stdDev * 2)
  };
}

function calculateVolumeAvg(prices: PriceData[]): number {
  const volumes = prices.slice(-20).map(p => p.volume);
  return volumes.reduce((a, b) => a + b, 0) / volumes.length;
}

function calculateATR(prices: PriceData[], period: number = 14): number {
  const trValues: number[] = [];
  
  for (let i = 1; i < prices.length; i++) {
    const high = prices[i].high;
    const low = prices[i].low;
    const prevClose = prices[i-1].close;
    
    const tr1 = high - low;
    const tr2 = Math.abs(high - prevClose);
    const tr3 = Math.abs(low - prevClose);
    
    trValues.push(Math.max(tr1, tr2, tr3));
  }
  
  const recentTR = trValues.slice(-period);
  return recentTR.reduce((a, b) => a + b, 0) / recentTR.length;
}

// ========== SCORING SYSTEM ==========

function technicalScore(prices: PriceData[]): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const latest = prices[prices.length - 1];
  
  const rsi = calculateRSI(prices);
  const ma20 = calculateMA(prices, 20);
  const ma50 = calculateMA(prices, 50);
  const ma200 = calculateMA(prices, 200);
  const bb = calculateBollinger(prices);
  const volAvg = calculateVolumeAvg(prices);
  
  if (latest.close > ma20 && ma20 > ma50 && ma50 > ma200) {
    score += 10;
    reasons.push("แนวโน้มขึ้นแข็งแกร่ง");
  } else if (latest.close > ma20 && ma20 > ma50) {
    score += 7;
    reasons.push("แนวโน้มขึ้นระยะสั้น");
  } else if (latest.close < ma50 && ma50 < ma200) {
    score -= 10;
    reasons.push("แนวโน้มลงแข็งแกร่ง");
  } else if (latest.close < ma20 && ma20 < ma50) {
    score -= 7;
    reasons.push("แนวโน้มลงระยะสั้น");
  }
  
  if (rsi < 30) {
    score += 5;
    reasons.push(`RSI ${rsi.toFixed(1)} Oversold`);
  } else if (rsi > 70) {
    score -= 5;
    reasons.push(`RSI ${rsi.toFixed(1)} Overbought`);
  } else if (rsi < 40) {
    score += 2;
    reasons.push(`RSI ${rsi.toFixed(1)} เริ่มต่ำ`);
  } else if (rsi > 60) {
    score -= 2;
    reasons.push(`RSI ${rsi.toFixed(1)} เริ่มสูง`);
  }
  
  if (latest.volume > volAvg * 1.5) {
    if (latest.close > latest.open) {
      score += 10;
      reasons.push("Volume สูง + ราคาขึ้น");
    } else {
      score -= 10;
      reasons.push("Volume สูง + ราคาลง");
    }
  }
  
  const nearLower = Math.abs(latest.close - bb.lower) / latest.close < 0.005;
  const nearUpper = Math.abs(latest.close - bb.upper) / latest.close < 0.005;
  
  if (nearLower) {
    score += 5;
    reasons.push("ใกล้แนวล่าง Bollinger");
  } else if (nearUpper) {
    score -= 5;
    reasons.push("ใกล้แนวบน Bollinger");
  }
  
  return { score: Math.max(-30, Math.min(30, score)), reasons };
}

function fundamentalScore(): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  const fedRate = 5.25;
  if (fedRate < 2.0) {
    score += 10;
    reasons.push(`ดอกเบี้ย Fed ${fedRate}% ต่ำ`);
  } else if (fedRate > 5.0) {
    score -= 10;
    reasons.push(`ดอกเบี้ย Fed ${fedRate}% สูง`);
  } else {
    score += 5;
    reasons.push(`ดอกเบี้ย Fed ${fedRate}% ปานกลาง`);
  }
  
  const cpi = 3.2;
  if (cpi > 3.0) {
    score += 10;
    reasons.push(`CPI ${cpi}% สูง (เงินเฟ้อ)`);
  } else if (cpi < 2.0) {
    score -= 5;
    reasons.push(`CPI ${cpi}% ต่ำ`);
  }
  
  const dxy = 103.5;
  if (dxy < 100) {
    score += 5;
    reasons.push(`DXY ${dxy} อ่อนค่า`);
  } else if (dxy > 105) {
    score -= 5;
    reasons.push(`DXY ${dxy} แข็งค่า`);
  }
  
  return { score: Math.max(-25, Math.min(25, score)), reasons };
}

function sentimentScore(): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  const fng = 25;
  if (fng < 20) {
    score += 10;
    reasons.push(`Fear & Greed = ${fng} (Extreme Fear)`);
  } else if (fng < 40) {
    score += 5;
    reasons.push(`Fear & Greed = ${fng} (Fear)`);
  } else if (fng > 80) {
    score -= 10;
    reasons.push(`Fear & Greed = ${fng} (Extreme Greed)`);
  } else if (fng > 60) {
    score -= 5;
    reasons.push(`Fear & Greed = ${fng} (Greed)`);
  }
  
  return { score: Math.max(-20, Math.min(20, score)), reasons };
}

function correlationScore(): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  const oilChange = 2.0;
  if (oilChange > 2) {
    score += 5;
    reasons.push(`น้ำมัน WTI +${oilChange}%`);
  } else if (oilChange < -2) {
    score -= 3;
    reasons.push(`น้ำมัน WTI ${oilChange}%`);
  }
  
  const vix = 22;
  if (vix > 25) {
    score += 5;
    reasons.push(`VIX ${vix} สูง`);
  } else if (vix < 15) {
    score -= 5;
    reasons.push(`VIX ${vix} ต่ำ`);
  }
  
  const yield10y = 4.2;
  if (yield10y < 3.5) {
    score += 5;
    reasons.push(`พันธบัตร 10Y ${yield10y}% ต่ำ`);
  } else if (yield10y > 4.5) {
    score -= 5;
    reasons.push(`พันธบัตร 10Y ${yield10y}% สูง`);
  }
  
  return { score: Math.max(-15, Math.min(15, score)), reasons };
}

function smartMoneyScore(prices: PriceData[]): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  const latest = prices[prices.length - 1];
  const avgVolume = calculateVolumeAvg(prices);
  
  if (latest.volume > avgVolume * 2) {
    if (latest.close > latest.open) {
      score += 5;
      reasons.push("Volume สูงมาก + ราคาขึ้น");
    } else {
      score -= 5;
      reasons.push("Volume สูงมาก + ราคาลง");
    }
  }
  
  const last3 = prices.slice(-3);
  const allUp = last3.every((p, i) => i === 0 || p.close > last3[i-1].close);
  const allDown = last3.every((p, i) => i === 0 || p.close < last3[i-1].close);
  
  if (allUp && latest.volume > avgVolume * 1.3) {
    score += 5;
    reasons.push("ขึ้น 3 วันติด + Volume สูง");
  } else if (allDown && latest.volume > avgVolume * 1.3) {
    score -= 5;
    reasons.push("ลง 3 วันติด + Volume สูง");
  }
  
  return { score: Math.max(-10, Math.min(10, score)), reasons };
}

// ========== TRADE PLAN CALCULATOR ==========

export function calculateTradePlan(
  prices: PriceData[],
  signal: string,
  confidence: number
): TradePlan {
  const latest = prices[prices.length - 1];
  const entry = latest.close;
  
  const atr = calculateATR(prices, 14);
  const slDistance = atr * 1.5;
  
  let sl: number;
  if (signal.includes('BUY')) {
    sl = entry - slDistance;
  } else if (signal.includes('SELL')) {
    sl = entry + slDistance;
  } else {
    sl = entry;
  }
  
  let tp1: number, tp2: number, tp3: number;
  
  if (signal.includes('BUY')) {
    tp1 = entry + (slDistance * 2);
    tp2 = entry + (slDistance * 3);
    tp3 = entry + (slDistance * 4);
  } else if (signal.includes('SELL')) {
    tp1 = entry - (slDistance * 2);
    tp2 = entry - (slDistance * 3);
    tp3 = entry - (slDistance * 4);
  } else {
    tp1 = tp2 = tp3 = entry;
  }
  
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp1 - entry);
  const riskReward = risk > 0 ? reward / risk : 0;
  
  const riskPercent = (risk / entry) * 100;
  
  const portfolio = 10000;
  const maxRisk = portfolio * 0.02;
  const positionSize = risk > 0 ? maxRisk / risk * entry : 0;
  
  let recommendation = '';
  if (signal.includes('BUY')) {
    if (confidence >= 70) recommendation = 'เข้าเต็มจำนวน';
    else if (confidence >= 50) recommendation = 'เข้าครึ่งจำนวน';
    else recommendation = 'รอจังหวะ';
  } else if (signal.includes('SELL')) {
    if (confidence >= 70) recommendation = 'เทขายเต็มจำนวน';
    else if (confidence >= 50) recommendation = 'เทขายครึ่งจำนวน';
    else recommendation = 'รอจังหวะ';
  } else {
    recommendation = 'ยังไม่มีสัญญาณชัดเจน';
  }
  
  return {
    entry,
    tp1,
    tp2,
    tp3,
    sl,
    riskReward,
    riskPercent,
    positionSize,
    recommendation
  };
}

// ========== MAIN ANALYSIS FUNCTION ==========

export function analyzeGold(prices: PriceData[]): AnalysisResult {
  const tech = technicalScore(prices);
  const fund = fundamentalScore();
  const sent = sentimentScore();
  const corr = correlationScore();
  const smart = smartMoneyScore(prices);
  
  const totalScore = tech.score + fund.score + sent.score + corr.score + smart.score;
  const confidence = Math.min(Math.abs(totalScore), 100);
  
  let decision: string;
  if (totalScore >= 70) decision = "STRONG BUY";
  else if (totalScore >= 50) decision = "BUY";
  else if (totalScore <= -70) decision = "STRONG SELL";
  else if (totalScore <= -50) decision = "SELL";
  else decision = "WAIT";
  
  const latest = prices[prices.length - 1];
  const bb = calculateBollinger(prices);
  const tradePlan = calculateTradePlan(prices, decision, confidence);
  
  return {
    decision,
    confidence,
    totalScore,
    scores: {
      technical: tech.score,
      fundamental: fund.score,
      sentiment: sent.score,
      correlation: corr.score,
      smartMoney: smart.score
    },
    reasons: [...tech.reasons, ...fund.reasons, ...sent.reasons, ...corr.reasons, ...smart.reasons],
    indicators: {
      rsi: calculateRSI(prices),
      macd: calculateMACD(prices),
      ma20: calculateMA(prices, 20),
      ma50: calculateMA(prices, 50),
      ma200: calculateMA(prices, 200),
      bbUpper: bb.upper,
      bbLower: bb.lower
    },
    tradePlan
  };
}}

function calculateMACD(prices: PriceData[]): number {
  const closes = prices.map(p => p.close);
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  return ema12 - ema26;
}

function calculateBollinger(prices: PriceData[]): { upper: number; lower: number } {
  const closes = prices.slice(-20).map(p => p.close);
  const ma = closes.reduce((a, b) => a + b, 0) / closes.length;
  const squaredDiffs = closes.map(c => Math.pow(c - ma, 2));
  const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / closes.length);
  
  return {
    upper: ma + (stdDev * 2),
    lower: ma - (stdDev * 2)
  };
}

function calculateVolumeAvg(prices: PriceData[]): number {
  const volumes = prices.slice(-20).map(p => p.volume);
  return volumes.reduce((a, b) => a + b, 0) / volumes.length;
}

function technicalScore(prices: PriceData[]): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const latest = prices[prices.length - 1];
  
  const rsi = calculateRSI(prices);
  const ma20 = calculateMA(prices, 20);
  const ma50 = calculateMA(prices, 50);
  const ma200 = calculateMA(prices, 200);
  const bb = calculateBollinger(prices);
  const volAvg = calculateVolumeAvg(prices);
  
  if (latest.close > ma20 && ma20 > ma50 && ma50 > ma200) {
    score += 10;
    reasons.push("แนวโน้มขึ้นแข็งแกร่ง");
  } else if (latest.close > ma20 && ma20 > ma50) {
    score += 7;
    reasons.push("แนวโน้มขึ้นระยะสั้น");
  } else if (latest.close < ma50 && ma50 < ma200) {
    score -= 10;
    reasons.push("แนวโน้มลงแข็งแกร่ง");
  } else if (latest.close < ma20 && ma20 < ma50) {
    score -= 7;
    reasons.push("แนวโน้มลงระยะสั้น");
  }
  
  if (rsi < 30) {
    score += 5;
    reasons.push(`RSI ${rsi.toFixed(1)} Oversold`);
  } else if (rsi > 70) {
    score -= 5;
    reasons.push(`RSI ${rsi.toFixed(1)} Overbought`);
  } else if (rsi < 40) {
    score += 2;
    reasons.push(`RSI ${rsi.toFixed(1)} เริ่มต่ำ`);
  } else if (rsi > 60) {
    score -= 2;
    reasons.push(`RSI ${rsi.toFixed(1)} เริ่มสูง`);
  }
  
  if (latest.volume > volAvg * 1.5) {
    if (latest.close > latest.open) {
      score += 10;
      reasons.push("Volume สูง + ราคาขึ้น");
    } else {
      score -= 10;
      reasons.push("Volume สูง + ราคาลง");
    }
  }
  
  const nearLower = Math.abs(latest.close - bb.lower) / latest.close < 0.005;
  const nearUpper = Math.abs(latest.close - bb.upper) / latest.close < 0.005;
  
  if (nearLower) {
    score += 5;
    reasons.push("ใกล้แนวล่าง Bollinger");
  } else if (nearUpper) {
    score -= 5;
    reasons.push("ใกล้แนวบน Bollinger");
  }
  
  return { score: Math.max(-30, Math.min(30, score)), reasons };
}

function fundamentalScore(): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  const fedRate = 5.25;
  if (fedRate < 2.0) {
    score += 10;
    reasons.push(`ดอกเบี้ย Fed ${fedRate}% ต่ำ`);
  } else if (fedRate > 5.0) {
    score -= 10;
    reasons.push(`ดอกเบี้ย Fed ${fedRate}% สูง`);
  } else {
    score += 5;
    reasons.push(`ดอกเบี้ย Fed ${fedRate}% ปานกลาง`);
  }
  
  const cpi = 3.2;
  if (cpi > 3.0) {
    score += 10;
    reasons.push(`CPI ${cpi}% สูง (เงินเฟ้อ)`);
  } else if (cpi < 2.0) {
    score -= 5;
    reasons.push(`CPI ${cpi}% ต่ำ`);
  }
  
  const dxy = 103.5;
  if (dxy < 100) {
    score += 5;
    reasons.push(`DXY ${dxy} อ่อนค่า`);
  } else if (dxy > 105) {
    score -= 5;
    reasons.push(`DXY ${dxy} แข็งค่า`);
  }
  
  return { score: Math.max(-25, Math.min(25, score)), reasons };
}

function sentimentScore(): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  const fng = 25;
  if (fng < 20) {
    score += 10;
    reasons.push(`Fear & Greed = ${fng} (Extreme Fear)`);
  } else if (fng < 40) {
    score += 5;
    reasons.push(`Fear & Greed = ${fng} (Fear)`);
  } else if (fng > 80) {
    score -= 10;
    reasons.push(`Fear & Greed = ${fng} (Extreme Greed)`);
  } else if (fng > 60) {
    score -= 5;
    reasons.push(`Fear & Greed = ${fng} (Greed)`);
  }
  
  return { score: Math.max(-20, Math.min(20, score)), reasons };
}

function correlationScore(): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  const oilChange = 2.0;
  if (oilChange > 2) {
    score += 5;
    reasons.push(`น้ำมัน WTI +${oilChange}%`);
  } else if (oilChange < -2) {
    score -= 3;
    reasons.push(`น้ำมัน WTI ${oilChange}%`);
  }
  
  const vix = 22;
  if (vix > 25) {
    score += 5;
    reasons.push(`VIX ${vix} สูง`);
  } else if (vix < 15) {
    score -= 5;
    reasons.push(`VIX ${vix} ต่ำ`);
  }
  
  const yield10y = 4.2;
  if (yield10y < 3.5) {
    score += 5;
    reasons.push(`พันธบัตร 10Y ${yield10y}% ต่ำ`);
  } else if (yield10y > 4.5) {
    score -= 5;
    reasons.push(`พันธบัตร 10Y ${yield10y}% สูง`);
  }
  
  return { score: Math.max(-15, Math.min(15, score)), reasons };
}

function smartMoneyScore(prices: PriceData[]): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  const latest = prices[prices.length - 1];
  const avgVolume = calculateVolumeAvg(prices);
  
  if (latest.volume > avgVolume * 2) {
    if (latest.close > latest.open) {
      score += 5;
      reasons.push("Volume สูงมาก + ราคาขึ้น");
    } else {
      score -= 5;
      reasons.push("Volume สูงมาก + ราคาลง");
    }
  }
// ========== TRADE PLAN CALCULATOR ==========

export interface TradePlan {
  entry: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  riskReward: number;
  riskPercent: number;
  positionSize: number;
  recommendation: string;
}

export function calculateTradePlan(
  prices: PriceData[],
  signal: string,
  confidence: number
): TradePlan {
  const latest = prices[prices.length - 1];
  const entry = latest.close;
  
  // คำนวณ ATR (Average True Range) ง่าย ๆ
  const atr = calculateATR(prices, 14);
  
  // SL = 1.5x ATR
  const slDistance = atr * 1.5;
  
  // กำหนด SL ตามสัญญาณ
  let sl: number;
  if (signal.includes('BUY')) {
    sl = entry - slDistance;
  } else if (signal.includes('SELL')) {
    sl = entry + slDistance;
  } else {
    // WAIT ไม่มี SL
    sl = entry;
  }
  
  // TP ใช้อัตราส่วน Risk:Reward
  // TP1 = 1:2, TP2 = 1:3, TP3 = 1:4
  let tp1: number, tp2: number, tp3: number;
  
  if (signal.includes('BUY')) {
    tp1 = entry + (slDistance * 2);
    tp2 = entry + (slDistance * 3);
    tp3 = entry + (slDistance * 4);
  } else if (signal.includes('SELL')) {
    tp1 = entry - (slDistance * 2);
    tp2 = entry - (slDistance * 3);
    tp3 = entry - (slDistance * 4);
  } else {
    tp1 = tp2 = tp3 = entry;
  }
  
  // คำนวณ Risk/Reward
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp1 - entry);
  const riskReward = risk > 0 ? reward / risk : 0;
  
  // คำนวณ % ความเสี่ยง
  const riskPercent = (risk / entry) * 100;
  
  // ขนาดลงทุนแนะนำ (สมมติพอร์ต $10,000 ความเสี่ยง 2%)
  const portfolio = 10000;
  const maxRisk = portfolio * 0.02; // 2%
  const positionSize = risk > 0 ? maxRisk / risk * entry : 0;
  
  // คำแนะนำ
  let recommendation = '';
  if (signal.includes('BUY')) {
    if (confidence >= 70) recommendation = 'เข้าเต็มจำนวน';
    else if (confidence >= 50) recommendation = 'เข้าครึ่งจำนวน';
    else recommendation = 'รอจังหวะ';
  } else if (signal.includes('SELL')) {
    if (confidence >= 70) recommendation = 'เทขายเต็มจำนวน';
    else if (confidence >= 50) recommendation = 'เทขายครึ่งจำนวน';
    else recommendation = 'รอจังหวะ';
  } else {
    recommendation = 'ยังไม่มีสัญญาณชัดเจน';
  }
  
  return {
    entry,
    tp1,
    tp2,
    tp3,
    sl,
    riskReward,
    riskPercent,
    positionSize,
    recommendation
  };
}

function calculateATR(prices: PriceData[], period: number = 14): number {
  const trValues: number[] = [];
  
  for (let i = 1; i < prices.length; i++) {
    const high = prices[i].high;
    const low = prices[i].low;
    const prevClose = prices[i-1].close;
    
    const tr1 = high - low;
    const tr2 = Math.abs(high - prevClose);
    const tr3 = Math.abs(low - prevClose);
    
    trValues.push(Math.max(tr1, tr2, tr3));
  }
  
  const recentTR = trValues.slice(-period);
  return recentTR.reduce((a, b) => a + b, 0) / recentTR.length;
}
  
  const last3 = prices.slice(-3);
  const allUp = last3.every((p, i) => i === 0 || p.close > last3[i-1].close);
  const allDown = last3.every((p, i) => i === 0 || p.close < last3[i-1].close);
  
  if (allUp && latest.volume > avgVolume * 1.3) {
    score += 5;
    reasons.push("ขึ้น 3 วันติด + Volume สูง");
  } else if (allDown && latest.volume > avgVolume * 1.3) {
    score -= 5;
    reasons.push("ลง 3 วันติด + Volume สูง");
  }
  
  return { score: Math.max(-10, Math.min(10, score)), reasons };
}

export function analyzeGold(prices: PriceData[]): AnalysisResult {
  const tech = technicalScore(prices);
  const fund = fundamentalScore();
  const sent = sentimentScore();
  const corr = correlationScore();
  const smart = smartMoneyScore(prices);
  
  const totalScore = tech.score + fund.score + sent.score + corr.score + smart.score;
  const confidence = Math.min(Math.abs(totalScore), 100);
  
  let decision: string;
  if (totalScore >= 70) decision = "STRONG BUY";
  else if (totalScore >= 50) decision = "BUY";
  else if (totalScore <= -70) decision = "STRONG SELL";
  else if (totalScore <= -50) decision = "SELL";
  else decision = "WAIT";
  
  const latest = prices[prices.length - 1];
  const bb = calculateBollinger(prices);
  
  return {
    decision,
    confidence,
    totalScore,
    scores: {
      technical: tech.score,
      fundamental: fund.score,
      sentiment: sent.score,
      correlation: corr.score,
      smartMoney: smart.score
    },
    reasons: [...tech.reasons, ...fund.reasons, ...sent.reasons, ...corr.reasons, ...smart.reasons],
    indicators: {
      rsi: calculateRSI(prices),
      macd: calculateMACD(prices),
      ma20: calculateMA(prices, 20),
      ma50: calculateMA(prices, 50),
      ma200: calculateMA(prices, 200),
      bbUpper: bb.upper,
      bbLower: bb.lower
    }
  };
}
