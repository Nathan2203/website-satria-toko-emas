// ---------- Admin panel logic ----------
const $ = sel => document.querySelector(sel);
let karats = [];

// ---- Auth ----
async function checkAuth() {
  const { isAdmin } = await (await fetch('/api/admin/me')).json();
  if (isAdmin) showDashboard();
}

$('#loginForm').onsubmit = async (e) => {
  e.preventDefault();
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: $('#password').value }),
  });
  if (res.ok) showDashboard();
  else $('#loginError').textContent = 'Password salah';
};

$('#logoutBtn').onclick = async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  location.reload();
};

async function showDashboard() {
  $('#loginView').hidden = true;
  $('#dashView').hidden = false;
  await loadAll();
}

async function loadAll() {
  const d = await (await fetch('/api/data')).json();
  karats = d.karats;
  renderPriceTable(d.prices);
  renderBanners(d.banners);
  $('#storeName').value = d.storeName || '';
  $('#interval').value = (d.bannerIntervalMs || 5000) / 1000;
}

// ---- Prices ----
function renderPriceTable(prices) {
  const tbody = $('#priceTable tbody');
  tbody.innerHTML = '';
  karats.forEach(k => {
    const p = prices[k] || {};
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${k}</td>
      <td><input type="number" data-karat="${k}" data-field="buy" value="${p.buy ?? ''}" /></td>
      <td><input type="number" data-karat="${k}" data-field="sell" value="${p.sell ?? ''}" /></td>
      <td><button class="del" data-del="${k}">&times;</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.del').forEach(btn => {
    btn.onclick = () => {
      const snapshot = collectPrices();
      karats = karats.filter(k => k !== btn.dataset.del);
      renderPriceTable(snapshot);
    };
  });
}

function collectPrices() {
  const prices = {};
  document.querySelectorAll('#priceTable input').forEach(inp => {
    const { karat, field } = inp.dataset;
    if (!prices[karat]) prices[karat] = {};
    prices[karat][field] = inp.value === '' ? null : Number(inp.value);
  });
  return prices;
}

$('#addKaratBtn').onclick = () => {
  const v = $('#newKarat').value.trim().toUpperCase();
  if (v && !karats.includes(v)) {
    const snapshot = collectPrices();
    karats.push(v);
    renderPriceTable(snapshot);
    $('#newKarat').value = '';
  }
};

$('#savePricesBtn').onclick = async () => {
  const prices = collectPrices();
  await fetch('/api/admin/karats', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ karats }),
  });
  await fetch('/api/admin/prices', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prices }),
  });
  flash('#priceSaved', 'Tersimpan ✓');
};

// ---- Banners ----
const MAX_BANNER_BYTES = 8 * 1024 * 1024; // 8 MB, samakan dengan batas di server.js

$('#uploadBtn').onclick = async () => {
  const file = $('#bannerFile').files[0];
  if (!file) { alert('Silakan pilih foto terlebih dahulu.'); return; }

  // Cek ukuran di browser dulu → feedback instan tanpa upload sia-sia
  if (file.size > MAX_BANNER_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    alert(`Ukuran foto ${mb} MB melebihi batas maksimal 8 MB.\nSilakan pilih foto yang lebih kecil atau kompres dulu.`);
    return;
  }

  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch('/api/admin/banners', { method: 'POST', body: fd });

  if (!res.ok) {
    // Backstop: kalau server yang menolak (mis. bukan file gambar), tampilkan pesannya
    const data = await res.json().catch(() => ({}));
    alert(data.error || 'Upload gagal. Silakan coba lagi.');
    return;
  }

  $('#bannerFile').value = '';
  loadAll();
};

function renderBanners(banners) {
  const grid = $('#bannerList');
  grid.innerHTML = '';
  banners.forEach(b => {
    const div = document.createElement('div');
    div.className = 'banner-item';
    div.innerHTML = `<img src="/uploads/${b.filename}" /><button data-id="${b.id}">Hapus</button>`;
    div.querySelector('button').onclick = async () => {
      await fetch('/api/admin/banners/' + b.id, { method: 'DELETE' });
      loadAll();
    };
    grid.appendChild(div);
  });
}

// ---- Settings ----
$('#saveSettingsBtn').onclick = async () => {
  await fetch('/api/admin/settings', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storeName: $('#storeName').value,
      bannerIntervalMs: Number($('#interval').value) * 1000,
    }),
  });
  flash('#settingsSaved', 'Tersimpan ✓');
};

function flash(sel, msg) {
  const el = $(sel);
  el.textContent = msg;
  setTimeout(() => (el.textContent = ''), 2000);
}

checkAuth();
