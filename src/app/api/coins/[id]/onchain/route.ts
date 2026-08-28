import { NextRequest, NextResponse } from "next/server";
import { cryptoStore } from "@/lib/server/cryptoService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(params);
  const coin = await cryptoStore.getCoin(id);
  const risk = coin ? cryptoStore.computeRisk(coin) : null;
  return NextResponse.json({
    coin_id: id,
    active_addresses_24h: Math.floor(Math.random() * 500000) + 120000,
    whale_transactions_24h: Math.floor(Math.random() * 1200) + 340,
    exchange_inflow_usd: (coin?.volume_24h || 10000000) * 0.15,
    exchange_outflow_usd: (coin?.volume_24h || 10000000) * 0.18,
    netflow_direction: "OUTFLOW (Accumulation)",
    gas_average_gwei: 18.4,
    onchain_risk_score: risk?.onchain_score || 25.0,
    contract_security_verified: !risk?.honeypot_detected,
  });
}
