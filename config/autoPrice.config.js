/**
 * Konfigurasi fitur OPSIONAL auto-fetch harga emas.
 * WAJIB dikalibrasi dengan harga riil client sebelum dipakai produksi,
 * karena harga toko emas mengandung margin & kebijakan lokal.
 *
 * purity      = rasio kandungan emas (24K = 1.0)
 * gramsPerUnit= gram per satuan harga yang ditampilkan
 * sellMarkup  = markup harga jual di atas harga dasar
 * buyMargin   = potongan harga beli di bawah harga dasar
 * roundTo     = pembulatan harga (mis. 1000 → ribuan terdekat)
 */
module.exports = {
  // Daftar gratis: goldapi.io → simpan key sebagai environment variable GOLD_API_KEY
  goldApiKey: process.env.GOLD_API_KEY || 'YOUR_GOLDAPI_IO_KEY',

  karatRules: {
    '6K':  { purity: 0.250, gramsPerUnit: 1, sellMarkup: 0.12, buyMargin: 0.05, roundTo: 1000 },
    '8K':  { purity: 0.333, gramsPerUnit: 1, sellMarkup: 0.12, buyMargin: 0.05, roundTo: 1000 },
    '9K':  { purity: 0.375, gramsPerUnit: 1, sellMarkup: 0.12, buyMargin: 0.05, roundTo: 1000 },
    '16K': { purity: 0.667, gramsPerUnit: 1, sellMarkup: 0.12, buyMargin: 0.05, roundTo: 1000 },
    '17K': { purity: 0.708, gramsPerUnit: 1, sellMarkup: 0.12, buyMargin: 0.05, roundTo: 1000 },
  },
};
