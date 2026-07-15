/**
 * Satria Toko Emas — Gold Price Display backend.
 * Express + JSON file storage. No external database required.
 */
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// ----- Config (override via environment variables) -----
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'please-change-this-secret';

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');

// ----- Ensure folders exist -----
for (const dir of [DATA_DIR, UPLOAD_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ----- Default data (created on first run) -----
const DEFAULT_DATA = {
  storeName: 'SATRIA TOKO EMAS',
  bannerIntervalMs: 5000,
  banners: [],                          // [{ id, filename }]
  karats: ['6K', '8K', '9K', '16K', '17K'],
  prices: {},                           // { '6K': { buy, sell }, ... }
  history: [],                          // [{ ts, prices }]
};

// ----- Tiny JSON data layer -----
function loadData() {
  try {
    return { ...DEFAULT_DATA, ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) };
  } catch {
    saveData(DEFAULT_DATA);
    return { ...DEFAULT_DATA };
  }
}
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ----- Multer: image uploads -----
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `banner_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
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
  cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 hours
}));
app.use(express.static(path.join(__dirname, 'public')));

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// ===================== PUBLIC API =====================
app.get('/api/data', (req, res) => {
  const d = loadData();
  res.json({
    storeName: d.storeName,
    bannerIntervalMs: d.bannerIntervalMs,
    banners: d.banners,
    karats: d.karats,
    prices: d.prices,
    serverTime: new Date().toISOString(),
  });
});

app.get('/api/history', (req, res) => {
  res.json(loadData().history);
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
// Terjemahkan error multer menjadi pesan Bahasa Indonesia yang jelas.
function uploadErrorMessage(err) {
  if (err.code === 'LIMIT_FILE_SIZE') return 'Ukuran foto melebihi batas maksimal 8 MB';
  if (err.message === 'Only image files are allowed') return 'Hanya file gambar (JPG, PNG, WEBP, GIF) yang diperbolehkan';
  return err.message || 'Upload gagal';
}

app.post('/api/admin/banners', requireAdmin, (req, res) => {
  // Panggil multer manual agar error (mis. file > 8 MB) bisa dikirim sebagai JSON,
  // bukan halaman error 500 default Express yang tidak bisa dibaca frontend.
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: uploadErrorMessage(err) });
    if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang dipilih' });
    const d = loadData();
    const banner = { id: Date.now().toString(), filename: req.file.filename };
    d.banners.push(banner);
    saveData(d);
    res.json(banner);
  });
});

app.delete('/api/admin/banners/:id', requireAdmin, (req, res) => {
  const d = loadData();
  const banner = d.banners.find(b => b.id === req.params.id);
  if (banner) {
    const fp = path.join(UPLOAD_DIR, banner.filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    d.banners = d.banners.filter(b => b.id !== req.params.id);
    saveData(d);
  }
  res.json({ ok: true });
});

// ===================== ADMIN: KARATS =====================
app.put('/api/admin/karats', requireAdmin, (req, res) => {
  const { karats } = req.body;
  const d = loadData();
  d.karats = karats;
  for (const k of Object.keys(d.prices)) {
    if (!karats.includes(k)) delete d.prices[k]; // prune removed karats
  }
  saveData(d);
  res.json({ ok: true, karats: d.karats });
});

// ===================== ADMIN: PRICES =====================
app.put('/api/admin/prices', requireAdmin, (req, res) => {
  const { prices } = req.body; // { '6K': { buy, sell }, ... }
  const d = loadData();
  d.prices = prices;
  d.history.push({ ts: new Date().toISOString(), prices });
  if (d.history.length > 365) d.history = d.history.slice(-365); // bound history
  saveData(d);
  res.json({ ok: true });
});

// ===================== ADMIN: SETTINGS =====================
app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const { storeName, bannerIntervalMs } = req.body;
  const d = loadData();
  if (storeName !== undefined) d.storeName = storeName;
  if (bannerIntervalMs !== undefined) d.bannerIntervalMs = Number(bannerIntervalMs);
  saveData(d);
  res.json({ ok: true });
});

// Admin page
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.listen(PORT, () => {
  console.log('\n  Satria Toko Emas — Harga Emas running:');
  console.log(`   Display : http://localhost:${PORT}`);
  console.log(`   Admin   : http://localhost:${PORT}/admin\n`);
});
