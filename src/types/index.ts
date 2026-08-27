export interface NewsAffectedCoin {
  symbol: string;
  name: string;
  coin_id: string;
  estimated_impact_pct: string;
  direction: "BULLISH" | "BEARISH" | "NEUTRAL";
  timeframe: string;
  key_catalyst: string;
}

export interface NewsImpactBreakdown {
  affected_coins: NewsAffectedCoin[];
  causal_transmission_chain: string[];
  short_term_outlook: string;
  medium_term_outlook: string;
  long_term_outlook: string;
  institutional_playbook: string;
}

export interface ModernFinBERTResult {
  sentence: string;
  label: "positive" | "negative" | "neutral" | "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  score: number; // 0.000 to 1.000
  probabilities: {
    positive: number;
    negative: number;
    neutral: number;
  };
  sentiment_tag: "BULLISH" | "BEARISH" | "NEUTRAL";
  polarity: number; // -1.0 to +1.0
  key_entities?: string[];
  explanation?: string;
  model: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  timestamp: string;
  category: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  importance: "HIGH" | "MEDIUM" | "LOW";
  image_url?: string;
  impact_breakdown?: NewsImpactBreakdown;
  finbert?: ModernFinBERTResult;
}

export interface NewsImpactAnalysis {
  coin_id: string;
  coin_name: string;
  assessed_headline: string;
  overall_impact_direction: "BULLISH" | "BEARISH" | "NEUTRAL";
  confidence_score: number;
  macro_narrative_context: string;
  transmission_channel: string;
  short_term_30d: {
    outlook: string;
    expected_price_delta_pct: number;
    target_price_projection: string;
    volatility_shift: string;
    probability_score: number;
  };
  medium_term_6m: {
    outlook: string;
    expected_price_delta_pct: number;
    target_price_projection: string;
    volatility_shift: string;
    probability_score: number;
  };
  long_term_3y: {
    outlook: string;
    expected_price_delta_pct: number;
    target_price_projection: string;
    volatility_shift: string;
    probability_score: number;
  };
  scenario_tree: {
    bull_breakout: { trigger: string; price_target: string };
    base_case: { trigger: string; price_target: string };
    bear_black_swan: { trigger: string; price_target: string };
  };
  adoption_tailwinds: string[];
  regulatory_headwinds: string[];
  institutional_playbook: string;
}

export interface CoinData {
  coin_id: string;
  name: string;
  symbol: string;
  price_usd: number;
  price_change_24h: number;
  price_change_7d?: number;
  price_change_30d?: number;
  all_time_high?: number;
  all_time_high_date?: string;
  market_cap?: number;
  volume_24h?: number;
  market_cap_rank?: number;
  image_url?: string;
  blockchain_network?: string;
  official_website?: string;
  source_repo?: string;
  contract_address?: string;
  description?: string;
}

export interface RiskScore {
  coin_id: string;
  score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendation?: "BUY" | "HOLD" | "SELL";
  fraud_probability?: number;
}

export interface DexScreenerTokenProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string;
  openGraph?: string;
  description?: string;
  links?: {
    type?: string;
    label?: string;
    url: string;
  }[];
  cto?: boolean;
}

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns?: {
    m5?: { buys: number; sells: number };
    h1?: { buys: number; sells: number };
    h6?: { buys: number; sells: number };
    h24?: { buys: number; sells: number };
  };
  volume?: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  priceChange?: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  liquidity?: {
    usd?: number;
    base?: number;
    quote?: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
    header?: string;
    openGraph?: string;
    websites?: { label?: string; url: string }[];
    socials?: { type: string; url: string }[];
  };
}

export interface DexTrendingCoin {
  id: string;
  tokenAddress: string;
  chainId: string;
  dexId: string;
  name: string;
  symbol: string;
  priceUsd: number;
  priceNative?: string;
  priceChange24h: number;
  priceChange1h: number;
  priceChange5m: number;
  volume24h: number;
  liquidityUsd: number;
  marketCap: number;
  fdv: number;
  icon?: string;
  header?: string;
  description?: string;
  dexScreenerUrl: string;
  pairAddress?: string;
  txns24h?: { buys: number; sells: number };
  txns1h?: { buys: number; sells: number };
  txns5m?: { buys: number; sells: number };
  links?: { type?: string; label?: string; url: string }[];
  cto?: boolean;
  boostAmount?: number;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  finbertSentiment?: {
    label: string;
    score: number;
    polarity: number;
  };
}
