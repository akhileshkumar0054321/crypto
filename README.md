# 🛡️ CryptoVision — AI Risk Management & Institutional Forensic Intelligence for Cryptocurrency

> **Hackathon Submission Track:** **AI Risk Management**  
> **Tagline:** Democratizing institutional risk intelligence — turning complex on-chain data, tokenomic traps, and market noise into actionable, plain-English protection for every investor.

---

## 🎯 The Pitch: Why CryptoVision Matters

### The Core Problem
In traditional finance, institutional hedge funds and risk desks use multi-million dollar Bloomberg terminals, quantitative risk engines, and teams of data scientists to evaluate downside risk before risking a single dollar. 

In cryptocurrency, over **100 million retail investors** enter a 24/7 global market with almost **zero institutional risk tooling**. They face:
- **Deceptive Influencer Hype & Bot-Driven FOMO**: Artificial social media hype masking worthless or heavily inflated tokens.
- **Hidden Tokenomic & Smart Contract Traps**: Unlocking cliffs, centralized creator mint keys, and unlocked liquidity pools that trigger unexpected crashes and rug pulls.
- **Scattered & Overwhelming Data**: Traders juggle 6+ disjointed websites (block explorers, DEX screeners, news aggregators, sentiment gauges, and charts) to research a single coin.
- **Cryptic Technical Jargon**: Whitepapers and audit reports filled with terminology that beginners cannot understand.

**The Result:** Billions of dollars are lost every year not because people didn't research, but because they lacked an intelligent system to quantify and explain the risks to them.

---

## 💡 The Solution: AI-Powered Risk Democratization

**CryptoVision** is an intelligent, real-time risk management platform that bridges the gap between raw blockchain data and smart investor decisions.

CryptoVision does not just display prices — it continuously ingests high-frequency exchange feeds, decentralized pool liquidity, on-chain whale activity, developer repositories, and breaking news. It runs this data through specialized machine learning models (**CryptoBERT**, **ModernFinBERT**, and **Google Gemini**) to output an objective **0–100 Composite Risk Score** alongside a **Simple-English breakdown** that any human can understand in under 30 seconds.

---

## 🧠 The 5 Pillars of the AI Risk Engine

CryptoVision evaluates every asset through a 5-dimensional risk framework:

```
                            ┌──────────────────────────────────────────────┐
                            │        CRYPTOVISION MULTI-FACTOR AI          │
                            │              RISK ENGINE (0-100)             │
                            └──────────────────────┬───────────────────────┘
                                                   │
         ┌─────────────────────┬───────────────────┼───────────────────┬─────────────────────┐
         ▼                     ▼                   ▼                   ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌───────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│ Market Volatility│  │ Liquidity Depth  │  │ Whale & On-Chain  │  │ Developer Code  │  │ NLP Sentiment &  │
│  & Beta Risk     │  │  & Slippage Risk │  │Concentration Risk │  │  Integrity Risk │  │ Media FUD Risk   │
└──────────────────┘  └──────────────────┘  └───────────────────┘  └─────────────────┘  └──────────────────┘
```

1. **Market Volatility & Beta Risk**: Quantifies historical drawdowns, price swing intensity, and standard deviation to stop users from over-allocating to hyper-volatile assets.
2. **Liquidity Depth & Slippage Risk**: Measures order book depth and volume-to-market-cap ratios to protect traders from getting trapped in illiquid pools with high exit slippage.
3. **Whale & On-Chain Concentration Risk**: Analyzes the top 10 wallet holdings and exchange inflows/outflows to detect early insider dumping before the market crashes.
4. **Developer Code & Protocol Integrity Risk**: Verifies smart contract audits, timelock safety, and GitHub development cadence to expose abandoned or dangerous projects.
5. **AI NLP Sentiment & Media Risk**: Uses specialized language models to compute live probability distributions (`Bullish %`, `Bearish %`, `Neutral %`) across breaking news and social feeds.

---

## 🔬 Architectural Choices: What We Built & Why We Chose It

Every component and model inside CryptoVision was selected with a specific risk management purpose:

### 1. Domain-Specific NLP: `ElKulako/cryptobert`
- **Why it was chosen:** Generic natural language processors fail when evaluating crypto discourse because words like *"moon"*, *"pump"*, *"rekt"*, *"dump"*, or *"hodl"* have unique contextual meanings. `CryptoBERT` is a RoBERTa transformer pre-trained specifically on cryptocurrency discussions, allowing our engine to accurately detect panic selling, artificial hype, and market sentiment shifts.

### 2. Deep Financial Analysis: `tabularisai/ModernFinBERT`
- **Why it was chosen:** Complements CryptoBERT by processing macro-economic news, central bank policies, institutional filings, and regulatory announcements with financial-grade precision.

### 3. Generative Reasoning: Google Gemini API
- **Why it was chosen:** Acts as the cognitive engine for our **AI Risk Copilot** and the **6-Section Institutional Forensic Audit Dossier**. Gemini synthesizes multi-source numeric data into plain-English explanations, tailored risk playbooks, and stress-test scenarios.

### 4. High-Performance Web Engine: Next.js 14 (App Router)
- **Why it was chosen:** Delivers instant page rendering, server-side data streaming, and strict security isolation. All sensitive AI inference and API keys remain safely guarded on the server side, never exposed to client browsers.

### 5. Multi-Source On-Chain & DEX Feeds (DexScreener & DeFi Llama)
- **Why it was chosen:** Traditional market trackers often ignore the newest small-cap tokens and meme pools where rug-pull risk is highest. By integrating DexScreener pair feeds and DeFi Llama TVL analytics, CryptoVision monitors newly launched liquidity pools and cross-chain bridge health in real time.

---

## 🌟 Flagship Features & User Experience

### 1. 📡 Live Crypto Risk Radar & Custom Token Scanner
- Interactive radar visualizing market risk tiers: **Low Risk (0–25)**, **Moderate (26–50)**, **High Risk (51–75)**, and **Critical Danger (76–100)**.
- Search and scan any custom coin symbol or smart contract address across EVM chains and Solana to get an instant safety audit.

### 2. 📖 "Simple English" Translation Hub
Designed specifically to protect non-technical investors from confusion:
- **What This Coin Actually Does**: Translates whitepaper buzzwords into clear, everyday analogies.
- **What is Happening Right Now**: Summarizes active market catalysts without confusing technical jargon.
- **Whale Movements Decoded**: Explains whether large wallet owners are accumulating or offloading on retail.
- **Team Reality Check**: Objective assessment of real developer momentum versus empty marketing promises.
- **The Golden Rule for Your Money**: One foundational safety takeaway for the selected asset.

### 3. 📑 6-Section Institutional Forensic Audit Dossier
Comprehensive, institutional-grade risk reports generated dynamically:
- **Section 1**: Asset Identity, Cycle Drawdowns & Historical Milestones
- **Section 2**: Protocol Architecture, Consensus & Network Utility
- **Section 3**: Tokenomics Health, Supply Inflation & Vesting Unlock Cliffs
- **Section 4**: Point-by-Point Breaking News & CryptoBERT Probability Breakdown
- **Section 5**: Smart Contract Security, Centralization Vectors & Red Flag Check
- **Section 6**: 30-Day & 90-Day Predictive Scenarios (Bull, Bear, Base Case) & Invalidation Playbook

### 4. 💼 Portfolio Stress-Testing & Value-at-Risk (VaR) Simulator
- Simulates user portfolios against historical black swan events (e.g., the **FTX Crash**, **Terra/Luna Collapse**, and **March 2020 Liquidity Shock**).
- Analyzes asset correlation so investors avoid holding multiple tokens that crash simultaneously.

### 5. 🤖 AI Risk Copilot
- Always-accessible conversational risk assistant.
- Inquires directly about smart contract safety, market drops, diversification advice, and regulatory developments.

---

## 🏛️ Application Architecture

```
├── src/
│   ├── app/                                # Next.js App Router & Server API Routes
│   │   ├── layout.tsx                      # Global layout & AI Copilot drawer
│   │   ├── page.tsx                        # Live Risk Radar, Heatmaps & Token Scanner
│   │   ├── coin/[id]/                      # Individual coin terminal & CryptoBERT audit
│   │   ├── defi/                           # DeFi protocol yields & chain flashcards
│   │   ├── alerts/                         # Real-time risk spike notification manager
│   │   ├── portfolio/                      # Portfolio risk optimizer, VaR & stress testing
│   │   ├── reports/                        # Printable institutional forensic audit dossiers
│   │   └── api/                            # Server-Side API Handlers
│   │       ├── coins/                      # Market data, scanning & coin analytics
│   │       ├── nlp/                        # CryptoBERT & ModernFinBERT sentiment endpoints
│   │       ├── dexscreener/                # Small-cap DEX tokens & trending pairs
│   │       ├── defi/                       # DeFi Llama protocol & TVL data feeds
│   │       ├── news/                       # Breaking crypto news & NLP impact scoring
│   │       ├── reports/                    # 6-Section forensic report synthesizer
│   │       └── risk/                       # Risk engine calculation endpoints
│   │
│   ├── components/                         # Reusable UI & Interactive Components
│   │   ├── analysis/                       # Risk radars, 6-Section modals & Plain-English cards
│   │   ├── charts/                         # TradingView Pro, Canvas candlestick graphs, Depth charts
│   │   ├── news/                           # Interactive news cards & sentiment breakdown modals
│   │   ├── defi/                           # Chain flashcards, protocol TVL cards & yield tables
│   │   ├── ai/                             # Interactive AI Risk Copilot chat interface
│   │   ├── layout/                         # Navigation bar, live price ticker tape, footer
│   │   └── ui/                             # Risk gauges, stat badges, modal dialogs
│   │
│   ├── lib/                                # Core Services & State Management
│   │   ├── server/                         # Server-only services (API keys kept secure here)
│   │   │   ├── cryptoService.ts            # Central market data engine & risk calculator
│   │   │   ├── cryptoBert.ts               # Hugging Face CryptoBERT client & tokenizer logic
│   │   │   ├── modernFinbert.ts            # ModernFinBERT financial sentiment client
│   │   │   ├── dexScreenerService.ts       # DexScreener small-cap integration
│   │   │   └── defiLlamaService.ts         # DeFi Llama protocol & TVL integration
│   │   ├── context/                        # React Context providers (LiveMarket, Alerts, Auth)
│   │   ├── store/                          # Zustand client-side application state
│   │   ├── api.ts                          # Client API service wrapper
│   │   └── utils.ts                        # Risk scoring formulas, formatting & styling helpers
│   │
│   └── types/                              # TypeScript domain interfaces & data models
```

---

## 🔒 Configured Environment Keys

To ensure security, all external API integrations are proxied exclusively through server-side route handlers (`/api/*`). The application uses the following environment variables:

- `GEMINI_API_KEY`: Powers the conversational AI Risk Copilot and 6-section forensic report generation.
- `HUGGINGFACE_API_TOKEN`: Hugging Face Inference API for `ElKulako/cryptobert` NLP sentiment analysis.
- `COINGECKO_API_KEY`: Global cryptocurrency pricing, historical candlestick data, and token metadata.
- `ETHERSCAN_API_KEY`: Smart contract verification and on-chain wallet tracking.
- `ALCHEMY_API_KEY`: High-throughput blockchain RPC node access.
- `BINANCE_API_KEY` / `BINANCE_API_SECRET`: High-frequency exchange ticker and order book depth data.
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`: Automated risk spike alert broadcasts.

---

## 🏆 Summary: Why CryptoVision is a Winning Hackathon Project

- **Direct Track Alignment**: Specifically built to tackle **AI Risk Management**, providing real-world protection against capital loss, rug pulls, and emotional trading.
- **Deep Technical Craftsmanship**: Leverages domain-specialized transformer models (`CryptoBERT`) and generative AI reasoning (`Google Gemini`) alongside on-chain DEX forensics.
- **Human-Centric Design**: Turns intimidating blockchain math and whitepaper buzzwords into straightforward, plain-English guidance anyone can understand.
- **Institutional Quality**: Features printable 6-section forensic audit dossiers, historical black-swan portfolio stress testing, and real-time risk radars.
