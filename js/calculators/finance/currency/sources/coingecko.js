// currency/sources/coingecko.js
import { createRatesSource } from "./rates-source.js";

const API_URL =
  "https://api.coingecko.com/api/v3/simple/price";

const COINS = [
  { id: "bitcoin", code: "BTC" },
  { id: "ethereum", code: "ETH" },
  { id: "tether", code: "USDT" },
  { id: "usd-coin", code: "USDC" },
  { id: "solana", code: "SOL" },
  { id: "binancecoin", code: "BNB" }
];

const FIAT_CODES = ["usd", "eur", "rub"];

export const coingeckoSource = createRatesSource({
  id: "coingecko",
  label: "CoinGecko · рыночные цены",
  kind: "market",

  async fetchRates() {
    const coinIds = COINS.map(coin => coin.id).join(",");
    const currencies = FIAT_CODES.join(",");

    const url =
      `${API_URL}` +
      `?ids=${coinIds}` +
      `&vs_currencies=${currencies}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Не удалось загрузить данные CoinGecko");
    }

    const data = await response.json();

    const usdReference = data.bitcoin?.usd;

    if (!usdReference) {
      throw new Error("CoinGecko не вернул базовую цену USD");
    }

    const rates = {
  USD: 1,
  EUR: usdReference / data.bitcoin.eur,
  RUB: usdReference / data.bitcoin.rub
};

    for (const coin of COINS) {
      const priceInUsd = data[coin.id]?.usd;

      if (Number.isFinite(priceInUsd) && priceInUsd > 0) {
       rates[coin.code] = priceInUsd;       }
    }

    return {
      sourceId: "coingecko",
      kind: "market",
      updatedAt: Date.now(),
      base: "USD",
      rates
    };
  }
});