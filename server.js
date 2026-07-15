/**
 * Satria Toko Emas — Gold Price Display backend.
 * Express + MongoDB Atlas (data) + GridFS (banner images).
 */
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// ----- Config (override via environment variables) -----
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'please-change-this-secret';
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('\n  ERROR: MONGODB_URI belum di-set di environment variable.');
  console.error('  Buat cluster gratis di https://www.mongodb.com/cloud/atlas lalu set MONGODB_URI.\n');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('  MongoDB connected'))
  .catch(err => { console.error('  MongoDB connection error:', err.message); process.exit(1); });

// GridFS bucket untuk simpan foto banner (bukan di disk, supaya tidak hilang saat redeploy)
let gridBucket;
mongoose.connection.once('open', () => {
  gridBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'banners' });
});

// ----- Schema: satu dokumen menyimpan semua data toko -----
const storeSchema = new mongoose.Schema({
  storeName: { type: String, default: 'SATRIA TOKO EMAS' },
  bannerIntervalMs: { type: Number, default: 5000 },
  banners: [{ id: String, filename: String }],           // filename = GridFS file id (string)
  karats: { type: [String], default: ['6K', '8K', '9K', '16K', '17K'] },
  prices: { type: mongoose.Schema.Types.Mixed, default: {} },
  history: [{ ts: String, prices: mongoose.Schema.Types.Mixed }],
});
const Store = mongoose.model('Store', storeSchema);

async function loadData() {
  let doc = await Store.findOne();
  if (!doc) doc = await Store.create({});
  return doc;
}

// ----- Multer: simpan file di memory, lalu di-stream ke GridFS -----
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (req, file, cb) => {
    const ok = /image\/(jpe?g|png|webp|gif)/.test(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  },
});

// ----- Middleware -----
app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 hours
}));
app.use(express.static(path.join(__dirname, 'public')));

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// ===================== PUBLIC API =====================
app.get('/api/data', async (req, res) => {
  const d = await loadData();
  res.json({
    storeName: d.storeName,
    bannerIntervalMs: d.bannerIntervalMs,
    banners: d.banners,
    karats: d.karats,
    prices: d.prices,
    serverTime: new Date().toISOString(),
  });
});

app.get('/api/history', async (req, res) => {
  res.json((await loadData()).history);
});

// Serve foto banner langsung dari GridFS (bukan folder statis)
app.get('/uploads/:id', (req, res) => {
  if (!gridBucket) return res.status(503).end();
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    gridBucket.openDownloadStream(fileId)
      .on('error', () => res.status(404).end())
      .pipe(res);
  } catch {
    res.status(404).end();
  }
});

// ===================== AUTH =====================
app.post('/api/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Wrong password' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/admin/me', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// ===================== ADMIN: BANNERS =====================
function uploadErrorMessage(err) {
  if (err.code === 'LIMIT_FILE_SIZE') return 'Ukuran foto melebihi batas maksimal 8 MB';
  if (err.message === 'Only image files are allowed') return 'Hanya file gambar (JPG, PNG, WEBP, GIF) yang diperbolehkan';
  return err.message || 'Upload gagal';
}

app.post('/api/admin/banners', requireAdmin, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: uploadErrorMessage(err) });
    if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang dipilih' });
    if (!gridBucket) return res.status(503).json({ error: 'Database belum siap, coba lagi sebentar' });

    const uploadStream = gridBucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });
    uploadStream.end(req.file.buffer);
    uploadStream.on('finish', async () => {
      const d = await loadData();
      const banner = { id: uploadStream.id.toString(), filename: uploadStream.id.toString() };
      d.banners.push(banner);
      await d.save();
      res.json(banner);
    });
    uploadStream.on('error', () => res.status(500).json({ error: 'Upload gagal' }));
  });
});

app.delete('/api/admin/banners/:id', requireAdmin, async (req, res) => {
  const d = await loadData();
  const banner = d.banners.find(b => b.id === req.params.id);
  if (banner) {
    try { await gridBucket.delete(new mongoose.Types.ObjectId(banner.filename)); } catch { /* file mungkin sudah terhapus */ }
    d.banners = d.banners.filter(b => b.id !== req.params.id);
    await d.save();
  }
  res.json({ ok: true });
});

// ===================== ADMIN: KARATS =====================
app.put('/api/admin/karats', requireAdmin, async (req, res) => {
  const { karats } = req.body;
  const d = await loadData();
  d.karats = karats;
  const prices = d.prices || {};
  for (const k of Object.keys(prices)) {
    if (!karats.includes(k)) delete prices[k]; // prune removed karats
  }
  d.prices = prices;
  d.markModified('prices');
  await d.save();
  res.json({ ok: true, karats: d.karats });
});

// ===================== ADMIN: PRICES =====================
app.put('/api/admin/prices', requireAdmin, async (req, res) => {
  const { prices } = req.body; // { '6K': { buy, sell }, ... }
  const d = await loadData();
  d.prices = prices;
  d.history.push({ ts: new Date().toISOString(), prices });
  if (d.history.length > 365) d.history = d.history.slice(-365); // bound history
  await d.save();
  res.json({ ok: true });
});

// ===================== ADMIN: SETTINGS =====================
app.put('/api/admin/settings', requireAdmin, async (req, res) => {
  const { storeName, bannerIntervalMs } = req.body;
  const d = await loadData();
  if (storeName !== undefined) d.storeName = storeName;
  if (bannerIntervalMs !== undefined) d.bannerIntervalMs = Number(bannerIntervalMs);
  await d.save();
  res.json({ ok: true });
});

// Admin page
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.listen(PORT, () => {
  console.log('\n  Satria Toko Emas — Harga Emas running:');
  console.log(`   Display : http://localhost:${PORT}`);
  console.log(`   Admin   : http://localhost:${PORT}/admin\n`);
});
