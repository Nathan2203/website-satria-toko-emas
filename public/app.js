// ---------- Public display logic ----------
const RUPIAH = n => (n || n === 0) ? Number(n).toLocaleString('id-ID') : '-';

let state = { banners: [], karats: [], prices: {}, bannerIntervalMs: 5000 };
let bannerIdx = 0, bannerTimer = null, chart = null;

async function loadData() {
  try {
    state = await (await fetch('/api/data')).json();
    renderBanners();
    renderPrices();
    renderKaratOptions();
  } catch (e) { console.error('Failed to load data', e); }
}

function renderBanners() {
  const track = document.getElementById('bannerTrack');
  const dots = document.getElementById('bannerDots');
  track.innerHTML = '';
  dots.innerHTML = '';

  if (!state.banners.length) {
    track.innerHTML = '<div class="banner-empty">Foto / Banner akan tampil di sini</div>';
    return;
  }
  state.banners.forEach((b, i) => {
    const img = document.createElement('img');
    img.src = '/uploads/' + b.filename;
    img.className = 'banner-img' + (i === 0 ? ' active' : '');
    track.appendChild(img);

    const dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dots.appendChild(dot);
  });
  bannerIdx = 0;
  startBannerRotation();
}

function startBannerRotation() {
  clearInterval(bannerTimer);
  if (state.banners.length <= 1) return;
  bannerTimer = setInterval(() => {
    bannerIdx = (bannerIdx + 1) % state.banners.length;
    showBanner(bannerIdx);
  }, state.bannerIntervalMs || 5000);
}

function showBanner(idx) {
  document.querySelectorAll('.banner-img').forEach((el, i) => el.classList.toggle('active', i === idx));
  document.querySelectorAll('.dot').forEach((el, i) => el.classList.toggle('active', i === idx));
}

function renderPrices() {
  const body = document.getElementById('priceBody');
  body.innerHTML = '';
  state.karats.forEach(k => {
    const p = state.prices[k] || {};
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="karat">${k}</td><td>${RUPIAH(p.buy)}</td><td>${RUPIAH(p.sell)}</td>`;
    body.appendChild(tr);
  });
  fitPrices();
}

// ---------- Auto-fit: pastikan panel harga SELALU muat tanpa scroll ----------
// Konten (.prices-inner) diperkecil proporsional bila lebih tinggi dari area
// yang tersedia, sehingga berapa pun jumlah kadar (mis. tambah 18K/20K) tetap
// tampil penuh tanpa scrollbar, baik di laptop full screen maupun TV.
function fitPrices() {
  const prices = document.querySelector('.prices');
  const inner = document.getElementById('pricesInner');
  if (!prices || !inner) return;

  inner.style.transform = 'none'; // reset dulu agar ukuran asli terukur benar
  const cs = getComputedStyle(prices);
  const availW = prices.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const availH = prices.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const rect = inner.getBoundingClientRect();

  if (rect.width > 0 && rect.height > 0) {
    // Skala mengisi ruang: MEMBESAR di layar besar, MENGECIL di layar kecil /
    // saat kadar banyak. Batas lebar & tinggi sekaligus (0.96 = sedikit napas
    // di tepi) supaya tidak pernah menyentuh sisi dan tidak pernah scroll.
    const scale = Math.min(availW / rect.width, availH / rect.height) * 0.96;
    inner.style.transform = `scale(${scale})`;
  }
}
// Hitung ulang saat ukuran/orientasi layar berubah (mis. masuk/keluar full screen)
window.addEventListener('resize', fitPrices);
window.addEventListener('orientationchange', fitPrices);

// ---------- Clock ----------
const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
function tickClock() {
  const now = new Date();
  const date = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  document.getElementById('clock').innerHTML =
    `${date}<br><span class="time">${now.toLocaleTimeString('id-ID')}</span>`;
}

// ---------- Chart ----------
function renderKaratOptions() {
  const sel = document.getElementById('chartKarat');
  const current = sel.value;
  sel.innerHTML = state.karats.map(k => `<option value="${k}">${k}</option>`).join('');
  if (state.karats.includes(current)) sel.value = current;
}

async function renderChart() {
  const history = await (await fetch('/api/history')).json();
  const karat = document.getElementById('chartKarat').value;
  const labels = history.map(h => new Date(h.ts).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }));
  const buy = history.map(h => h.prices[karat]?.buy ?? null);
  const sell = history.map(h => h.prices[karat]?.sell ?? null);

  if (chart) chart.destroy();
  chart = new Chart(document.getElementById('priceChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Harga Beli', data: buy, borderColor: '#d4af37', backgroundColor: 'rgba(212,175,55,.1)', tension: .3, fill: true },
        { label: 'Harga Jual', data: sell, borderColor: '#e07a7a', backgroundColor: 'rgba(224,122,122,.1)', tension: .3, fill: true },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // tinggi mengikuti .chart-wrap, tidak membengkak
      plugins: { legend: { labels: { color: '#eee' } } },
      scales: {
        x: { ticks: { color: '#bbb', maxRotation: 60 }, grid: { color: 'rgba(255,255,255,.05)' } },
        y: { ticks: { color: '#bbb' }, grid: { color: 'rgba(255,255,255,.05)' } },
      },
    },
  });
}

// ---------- Events ----------
document.getElementById('chartToggle').onclick = () => {
  document.getElementById('chartModal').classList.add('open');
  renderChart();
};
document.getElementById('chartClose').onclick = () =>
  document.getElementById('chartModal').classList.remove('open');
document.getElementById('chartKarat').onchange = renderChart;

// ---------- Init ----------
loadData();
tickClock();
setInterval(loadData, 30000); // auto refresh price every 30s
setInterval(tickClock, 1000);

// Hitung ulang skala setelah semua aset (termasuk logo) selesai dimuat,
// karena tinggi logo baru pasti setelah gambarnya termuat.
window.addEventListener('load', fitPrices);
const logoImg = document.querySelector('.brand-logo');
if (logoImg) logoImg.addEventListener('load', fitPrices);
