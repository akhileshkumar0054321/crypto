import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── API helpers ───────────────────────────────────────────────────────────────
export const coinApi = {
  getAll:      ()           => api.get("/api/coins"),
  getOne:      (id: string) => api.get(`/api/coins/${id}`),
  getHistory:  (id: string, days = 30) => api.get(`/api/coins/${id}/history?days=${days}`),
  getOhlc:     (id: string, days = 7)  => api.get(`/api/coins/${id}/ohlc?days=${days}`),
  getOnchain:  (id: string) => api.get(`/api/coins/${id}/onchain`),
  getTrending: ()           => api.get("/api/coins/trending"),
  getGlobal:   ()           => api.get("/api/coins/global"),
  getViability:(id: string) => api.get(`/api/coins/${id}/viability`),
  getTokenomics:(id: string)=> api.get(`/api/coins/${id}/tokenomics`),
  getAudit:    (id: string) => api.get(`/api/coins/${id}/audit`),
  getTrades:   (id: string) => api.get(`/api/coins/${id}/trades`),
  getNews:     (id: string) => api.get(`/api/coins/${id}/news`),
  getNewsImpact:(id: string, headline?: string) => {
    const qs = headline ? `?headline=${encodeURIComponent(headline)}` : "";
    return api.get(`/api/coins/${id}/news-impact${qs}`);
  },
  getScenarios:(id: string) => api.get(`/api/coins/${id}/scenarios`),
  scanCoin:    (query: string) => api.post("/api/coins/scan", { query }),
};

export const settingsApi = {
  getKeys: () => api.get("/api/settings/keys"),
};

export const riskApi = {
  getScore:      (id: string) => api.get(`/api/risk/${id}`),
  getFactors:    (id: string) => api.get(`/api/risk/factors/${id}`),
  getHistory:    (id: string) => api.get(`/api/risk/${id}/history`),
  getLeaderboard:()           => api.get("/api/risk/leaderboard"),
  analyze:       (id: string) => api.post("/api/risk/analyze", { coin_id: id }),
};

export const newsApi = {
  getMarketNews: (category?: string, query?: string) => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (query) params.append("q", query);
    const qs = params.toString();
    return api.get(`/api/news${qs ? `?${qs}` : ""}`);
  },
};

export const finbertApi = {
  classify: (sentence: string) => api.post("/api/nlp/modern-finbert", { sentence }),
  batchClassify: (sentences: string[]) => api.post("/api/nlp/modern-finbert", { sentences }),
  getDefaultSuite: () => api.get("/api/nlp/modern-finbert"),
};

export const dexScreenerApi = {
  getTrending: (refresh = false) => api.get(`/api/dexscreener/trending${refresh ? "?refresh=true" : ""}`),
  getProfiles: () => api.get("/api/dexscreener/profiles"),
  scanToken: (query: string) => api.post("/api/dexscreener/scan", { query }),
};

export const alertApi = {
  getAll:  ()                                 => api.get("/api/alerts"),
  create:  (data: Record<string, unknown>)    => api.post("/api/alerts", data),
  update:  (id: string, data: Record<string, unknown>) => api.put(`/api/alerts/${id}`, data),
  delete:  (id: string)                       => api.delete(`/api/alerts/${id}`),
  toggle:  (id: string)                       => api.patch(`/api/alerts/${id}/toggle`),
};

export const reportApi = {
  getAll:    ()           => api.get("/api/reports"),
  generate:  (id: string) => api.post("/api/reports/generate", { coin_id: id }),
  getOne:    (id: string) => api.get(`/api/reports/${id}`),
};

export const portfolioApi = {
  getAll:    ()                                 => api.get("/api/portfolio"),
  getRisk:   ()                                 => api.get("/api/portfolio/risk"),
  addCoin:   (data: Record<string, unknown>)    => api.post("/api/portfolio/coins", data),
  removeCoin:(id: string)                       => api.delete(`/api/portfolio/coins/${id}`),
};

export const authApi = {
  login:    (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  register: (email: string, username: string, password: string) =>
    api.post("/api/auth/register", { email, username, password }),
  me:       () => api.get("/api/auth/me"),
};
