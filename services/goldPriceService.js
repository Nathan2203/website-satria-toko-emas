/**
 * Layanan auto-fetch harga emas (OPSIONAL).
 * TIDAK terhubung ke aplikasi utama secara default — dipakai oleh
 * scripts/updatePricesAuto.js. Butuh Node 18+ (global fetch).
 *
 * Ganti provider/endpoint sesuai langganan client.
 */

const OUNCE_TO_GRAM = 31.1035;

/** Ambil harga spot emas dunia (USD per troy ounce). */
async function fetchSpotGold(config) {
  // Contoh: goldapi.io. Ganti dengan provider pilihan client.
  const res = await fetch('https://www.goldapi.io/api/XAU/USD', {
    headers: { 'x-access-token': config.goldApiKey, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Gold API error: ${res.status}`);
  const data = await res.json();
  return { usdPerOunce: data.price };
}

/** Ambil kurs USD → IDR (endpoint gratis tanpa key). */
async function fetchUsdToIdr() {
  const res = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!res.ok) throw new Error(`FX API error: ${res.status}`);
  const data = await res.json();
  return data.rates.IDR;
}

/**
 * Hitung harga beli/jual per kadar dari harga spot dunia.
 * Hasil HARUS dikalibrasi via config.karatRules.
 */
async function buildAutoPrices(config) {
  const { usdPerOunce } = await fetchSpotGold(config);
  const usdIdr = await fetchUsdToIdr();

  const idrPerGram24k = (usdPerOunce / OUNCE_TO_GRAM) * usdIdr;

  const prices = {};
  for (const [karat, rule] of Object.entries(config.karatRules)) {
    const base = idrPerGram24k * rule.purity * rule.gramsPerUnit;
    const sell = Math.round((base * (1 + rule.sellMarkup)) / rule.roundTo) * rule.roundTo;
    const buy = Math.round((base * (1 - rule.buyMargin)) / rule.roundTo) * rule.roundTo;
    prices[karat] = { buy, sell };
  }
  return prices;
}

module.exports = { buildAutoPrices, fetchSpotGold, fetchUsdToIdr };
