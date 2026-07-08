/**
 * OPSIONAL: tarik harga emas otomatis & tulis ke data/db.json.
 * Jalankan manual:   npm run auto-update
 * Atau jadwalkan (cron / Windows Task Scheduler) untuk update harian.
 *
 * Aplikasi utama tetap berjalan dengan update manual di panel admin.
 */
const fs = require('fs');
const path = require('path');
const config = require('../config/autoPrice.config');
const { buildAutoPrices } = require('../services/goldPriceService');

const DATA_FILE = path.join(__dirname, '..', 'data', 'db.json');

async function main() {
  const prices = await buildAutoPrices(config);

  const db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  db.prices = prices;
  db.karats = Object.keys(prices);
  db.history = db.history || [];
  db.history.push({ ts: new Date().toISOString(), prices });
  if (db.history.length > 365) db.history = db.history.slice(-365);

  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  console.log('Harga otomatis ter-update:', prices);
}

main().catch(err => {
  console.error('Auto update gagal:', err.message);
  process.exit(1);
});
