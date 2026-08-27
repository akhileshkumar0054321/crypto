// Typed client wrapper for Puter.js (https://js.puter.com/v2/)
// Provides zero-config browser-level AI chat, cloud KV persistence, and authentication

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (
          prompt: string | Array<{ role: string; content: string }>,
          options?: {
            model?: string;
            stream?: boolean;
            testMode?: boolean;
            temperature?: number;
          }
        ) => Promise<any>;
        txt2img?: (prompt: string) => Promise<any>;
        listModels?: () => Promise<any[]>;
      };
      kv: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any) => Promise<boolean>;
        del: (key: string) => Promise<boolean>;
        list: () => Promise<string[]>;
        flush: () => Promise<boolean>;
      };
      auth: {
        signIn: () => Promise<any>;
        signOut: () => Promise<void>;
        isSignedIn: () => boolean;
        getUser: () => Promise<any>;
      };
      fs?: {
        read: (path: string) => Promise<any>;
        write: (path: string, content: any) => Promise<any>;
      };
    };
  }
}

/**
 * Returns the Puter.js global object if available in window.
 */
export function getPuter(): typeof window.puter | null {
  if (typeof window !== "undefined" && window.puter) {
    return window.puter;
  }
  return null;
}

export const APP_GUIDE_SYSTEM_PROMPT = `You are the official **cryptoVision App Assistant & Support Guide**.
Your job is to guide users on using the cryptoVision platform, resolve any app-related issues, explain risk metrics, and help users navigate and troubleshoot the app.

PLATFORM FEATURES & PAGES OVERVIEW:
1. **Dashboard (Home /)**:
   - Live Price Ticker at the top bar with real-time updates.
   - Market sentiment gauge (Fear & Greed Index), 24h market volume, and gas tracker.
   - Comprehensive Coin Radar & Leaderboard: click on any coin row to view the 6-Section Deep Forensic Report or click the Chart icon to open the Real-time Candlestick Chart with Order Book & Depth Visualizer.
   - Quick Search: Press ⌘K / Ctrl+K anywhere to instantly search across 100+ cryptocurrencies.

2. **Risk Explorer (/risk-explorer)**:
   - Filter assets by Risk Category: Low (0-30), Moderate (31-60), High (61-80), Critical / Extreme (81-100).
   - Filter by sector tags: Layer-1, DeFi, Meme coins, Infrastructure, AI tokens.
   - View volatility percentile, liquidity stress scores, and smart contract audit flags.

3. **Portfolio & VaR Risk Simulator (/portfolio)**:
   - Add/edit personal holdings with coin ID, quantity, and average buy price.
   - Automatically calculates Portfolio Value at Risk (VaR 95% & 99%), Maximum Expected Drawdown, and Diversification Index.
   - Stored in Puter.js Cloud Key-Value storage so holdings persist across sessions.

4. **Threat Wire & Alert Engine (/alerts)**:
   - On-chain anomaly detection: Whale wallet accumulation/dumps, liquidity drains, flash loan exploits, and sharp volatility spikes.
   - Users can create custom alert rules (e.g., "Alert me if BTC drops >3% in 15m" or "Risk score exceeds 85").
   - Notification toggles for sound, browser popups, and visual badges.

5. **News & Causal Impact Radar (/news)**:
   - Live curated cryptocurrency news with real-time AI impact analysis.
   - Click "View Future Impact & Causal Chains" to see upstream catalyst -> transmission channel -> target asset price forecast.

6. **Coin Detail Forensic View (/coin/[id])**:
   - Deep dive on any coin with historical price cycles, all-time low gains, downside failure modes, and pros & cons.

7. **Reports (/reports) & Settings (/settings)**:
   - Export downloadable institutional audits in PDF/JSON format.
   - Configure alert thresholds, currency display (USD, EUR, GBP, JPY), and risk sensitivity weighting.

TROUBLESHOOTING & COMMON USER ISSUES:
- **"How do I add coins to my portfolio?"** -> Navigate to Portfolio (/portfolio), enter the coin name/ticker, amount, and buy price in the "Add Asset" box, and click "Add to Portfolio".
- **"What does a Risk Score of 75 mean?"** -> 0-30 is Low Risk (established large caps), 31-60 is Moderate Risk, 61-80 is High Risk (elevated volatility / liquidity risks), and 81-100 is Critical / Extreme Risk (meme coins, unaudited contracts, or extreme leverage).
- **"How do I open the Candlestick chart & Order book?"** -> In the Dashboard or Risk Explorer table, click the "Chart" icon button next to any coin, or click on a coin card.
- **"Prices seem stuck or not updating?"** -> cryptoVision uses client-side simulated live market feeds. Check your internet connection, or click the refresh button in the navbar.
- **"How do I search coins quickly?"** -> Press Command+K (Mac) or Control+K (Windows/Linux) or click the Search bar in the top navbar.

TONE & STYLE:
- Always friendly, empathetic, clear, and actionable.
- Format responses cleanly with bold headings and bullet points.
- If recommending a page, mention the path clearly (e.g. \`/portfolio\`, \`/risk-explorer\`, \`/alerts\`, \`/news\`).`;

/**
 * Query Puter.js AI with streaming or direct promise
 */
export async function askPuterAI(
  prompt: string | Array<{ role: string; content: string }>,
  options: {
    model?: string;
    stream?: boolean;
    onChunk?: (chunk: string) => void;
  } = {}
): Promise<string> {
  const puter = getPuter();

  if (puter?.ai?.chat) {
    try {
      const response = await puter.ai.chat(prompt, {
        model: options.model || "claude-3-5-sonnet",
        stream: options.stream ?? false,
      });

      // Handle async iterable stream if requested
      if (options.stream && response && typeof response[Symbol.asyncIterator] === "function") {
        let fullText = "";
        for await (const chunk of response) {
          const text = chunk?.text || chunk?.message?.content || (typeof chunk === "string" ? chunk : "");
          fullText += text;
          if (options.onChunk) {
            options.onChunk(text);
          }
        }
        return fullText;
      }

      // Handle standard response
      if (typeof response === "string") return response;
      if (response?.message?.content) return response.message.content;
      if (response?.text) return response.text;
      return JSON.stringify(response);
    } catch (err) {
      console.warn("Puter.js AI chat notice (using fallback):", err);
    }
  }

  // Fallback if Puter.js is not loaded or network is offline
  const queryStr = typeof prompt === "string" ? prompt : prompt.map((m) => m.content).join(" ");
  return generateAppSupportIntelligence(queryStr);
}

/**
 * Persist data to Puter cloud Key-Value store with localStorage fallback
 */
export async function puterKvSet(key: string, value: any): Promise<void> {
  if (typeof window === "undefined") return;

  // Always write to localStorage as immediate cache
  try {
    localStorage.setItem(`cv_${key}`, JSON.stringify(value));
  } catch (e) {
    // Ignore storage quota errors
  }

  const puter = getPuter();
  if (puter?.kv?.set) {
    try {
      await puter.kv.set(`cv_${key}`, JSON.stringify(value));
    } catch (err) {
      console.warn("Puter KV set notice:", err);
    }
  }
}

/**
 * Retrieve data from Puter cloud Key-Value store with localStorage fallback
 */
export async function puterKvGet<T>(key: string, fallback: T): Promise<T> {
  if (typeof window === "undefined") return fallback;

  const puter = getPuter();
  if (puter?.kv?.get) {
    try {
      const cloudVal = await puter.kv.get(`cv_${key}`);
      if (cloudVal !== null && cloudVal !== undefined) {
        return typeof cloudVal === "string" ? JSON.parse(cloudVal) : cloudVal;
      }
    } catch (err) {
      // Fall through to localStorage
    }
  }

  try {
    const localVal = localStorage.getItem(`cv_${key}`);
    if (localVal) {
      return JSON.parse(localVal);
    }
  } catch (e) {
    // fallback
  }

  return fallback;
}

/**
 * Comprehensive in-app guidance fallback engine for instant issue resolution
 */
function generateAppSupportIntelligence(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("portfolio") || q.includes("var") || q.includes("holding") || q.includes("add coin")) {
    return `### 💼 How to Use the Portfolio & VaR Calculator:
1. **Navigate to Portfolio**: Click on **Portfolio** in the top navbar or open \`/portfolio\`.
2. **Add Your Holdings**: Under the **Add Asset** card, select a coin (e.g. Bitcoin, Ethereum, Solana), enter the amount you own, and your average buy price.
3. **Analyze Risk Metrics**:
   - **Total Value & PnL**: Tracks real-time profit and loss against current market prices.
   - **Value at Risk (VaR 95% / 99%)**: Estimates maximum statistical dollar loss under normal market conditions over 24 hours.
   - **Diversification Score**: Evaluates concentration risk across asset classes.
4. **Cloud Auto-Save**: Your portfolio is automatically synced to Puter.js Cloud Key-Value storage so it stays preserved across sessions!`;
  }

  if (q.includes("risk") || q.includes("score") || q.includes("calculate") || q.includes("meaning")) {
    return `### 🛡️ Understanding cryptoVision Risk Scores (0–100):
The cryptoVision composite risk score evaluates multiple forensic dimensions:
- **🟢 Low Risk (0 – 30)**: Established blue-chip assets with deep liquidity, institutional custody, and multi-year track records (e.g., BTC, ETH).
- **🟡 Moderate Risk (31 – 60)**: Established Layer-1 and top DeFi protocols with high volume but periodic market cycle volatility (e.g., SOL, AVAX, LINK).
- **🟠 High Risk (61 – 80)**: High-beta altcoins, newer protocols, or tokens with concentrated token unlocks and thinner order book depth.
- **🔴 Critical / Extreme Risk (81 – 100)**: Meme coins, low-liquidity microcaps, unaudited smart contracts, or assets experiencing extreme leverage stress (e.g., PEPE, SHIB).

To explore coins by risk tier, visit the **Risk Explorer** (\`/risk-explorer\`)!`;
  }

  if (q.includes("alert") || q.includes("threat") || q.includes("notification") || q.includes("whale")) {
    return `### 🚨 Setting Up Threat Wire & Real-Time Alerts:
1. Open the **Threat Wire** by clicking **Alerts** in the top navbar or heading to \`/alerts\`.
2. **Live Threat Feed**: Real-time monitoring tracks whale wallet dumps, sudden slippage spikes, and liquidity pool changes.
3. **Create Custom Trigger**:
   - Set price change thresholds (e.g., Alert if coin drops >5% in 15 mins).
   - Set risk score thresholds (e.g., Alert if coin risk score exceeds 75).
4. **Enable Sound & Popups**: Toggle the sound notification switch in the alerts header to receive audible pings during high-priority threat events.`;
  }

  if (q.includes("chart") || q.includes("order book") || q.includes("candlestick") || q.includes("depth")) {
    return `### 📊 Real-Time Candlestick Charts & Order Book:
- **How to Open**: On the Home Dashboard (\`/\`) or Risk Explorer (\`/risk-explorer\`), click the **Chart** icon next to any coin row or click directly on any Coin Card.
- **Interactive Features**:
  - Switch timeframes (1M, 5M, 15M, 1H, 1D).
  - Inspect the **Live Order Book** showing real-time bids, asks, and order book depth.
  - Hover over candlestick bars to inspect Open, High, Low, Close (OHLC) values and volume.`;
  }

  if (q.includes("report") || q.includes("audit") || q.includes("forensic") || q.includes("analysis")) {
    return `### 📑 6-Section In-Depth Forensic Coin Reports:
To view a deep forensic teardown on any coin:
1. Click on any coin name in the Leaderboard table on the Home page (\`/\`).
2. The interactive modal covers **6 core audit sections**:
   - **Origins & Technology**: Founders, consensus mechanism, and real-world utility in plain English.
   - **Cycle Performance**: All-Time Highs/Lows, drawdown recovery, and gain multiples.
   - **News Point-by-Point Impact**: Catalyst breakdown with bullish/bearish ratings.
   - **Investment Strategies**: Short-term trading entries, stop losses, and long-term DCA allocations.
   - **Downside Failure Modes**: Detailed explanations of all conditions that could lead to financial loss.
   - **Pros & Cons Matrix**: Comprehensive advantages and technical drawbacks.`;
  }

  if (q.includes("search") || q.includes("find") || q.includes("shortcut") || q.includes("keyboard")) {
    return `### 🔍 Quick Search & Keyboard Shortcuts:
- **Global Search**: Press **⌘K** (Mac) or **Ctrl+K** (Windows/Linux) to instantly open the search bar.
- **Filter Assets**: Type any coin name (e.g., "Solana", "Bitcoin", "Cardano") or ticker symbol (e.g., "SOL", "BTC", "ADA") to navigate directly to its forensic audit or chart.`;
  }

  if (q.includes("stuck") || q.includes("not updating") || q.includes("error") || q.includes("troubleshoot") || q.includes("refresh") || q.includes("reset")) {
    return `### 🔧 Troubleshooting App Issues:
- **Prices not moving?** The platform streams live simulated price updates. Ensure your browser tab is active. If disconnected, simply refresh the webpage.
- **Clear Stored Data**: If your portfolio or chat history is out of sync, you can click the **Trash** icon in this Copilot window or clear browser localStorage keys starting with \`cv_\`.
- **Search not opening?** Click the **Search** icon directly in the top navbar or press **⌘K / Ctrl+K**.`;
  }

  return `### 💡 How Can I Assist You in cryptoVision?
I am your **App Guiding Assistant**. Here are the most common things I can help you with:
- 🧭 **App Navigation**: Finding tools, pages, and reports.
- 🛡️ **Risk Scores**: Understanding how 0-100 risk ratings and forensic metrics are calculated.
- 💼 **Portfolio & VaR**: Adding your holdings and calculating statistical Value at Risk.
- 🚨 **Alerts & Threats**: Setting up whale alerts and price drop triggers.
- 📊 **Charts & Audits**: Accessing real-time candlestick charts and 6-section coin reports.
- 🔧 **Troubleshooting**: Resolving any app display or calculation issues.

What would you like to explore or troubleshoot?`;
}
