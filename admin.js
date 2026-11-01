/**
 * =================================================================
 * AGARWAL COMPUTER - ADMIN DASHBOARD & ADVANCED PRIZE MANAGEMENT
 * v5 — Supports enable/disable toggle, rare (less chance) per prize
 * =================================================================
 */

// -------------------------------------------------------------
// 1. CREDENTIALS & CONSTANTS
// -------------------------------------------------------------
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin'
};

const STORAGE_KEYS = {
  PRIZES: 'agarwal_master_prizes_v2026_v9',
  HISTORY: 'lucky_draw_history',
  AUTH: 'admin_authenticated'
};

const DEFAULT_MASTER_PRIZES = {
  showcase: [
    { id: 'grand',     name: 'iPhone 18 Pro Max',  image: 'images/iphone-18-pro-max.webp', icon: '📱', type: 'grand', badgeText: 'MEGA PRIZE', tag: 'Grand Prize' },
    { id: 'mega',      name: '₹20,000 Cash',        image: 'images/cash-20000.jpg',         icon: '💵', type: 'mega',  badgeText: 'MEGA PRIZE', tag: 'Mega Prize' },
    { id: 'showcase3', name: 'Samsung S26 Ultra',   image: 'images/samsung-s26-ultra.png?v=s26_frontback_2026',  icon: '📱', type: 'grand', badgeText: 'MEGA PRIZE', tag: 'Grand Prize' },
    { id: 'showcase4', name: 'Samsung 65" 4K TV',   image: 'images/samsung-65-tv.png?v=tv_4k_modern_2026',      icon: '📺', type: 'mega',  badgeText: 'MEGA PRIZE', tag: 'Mega Prize'  }
  ],
  drawable: [
    { id: 'p1',  name: 'Pendrive',              image: 'images/pendrive.jpg',             icon: '💾', tag: 'Verified Reward', weight: 1,   enabled: true, rare: false },
    { id: 'p2',  name: 'Cooling Pad',            image: 'images/cooling-pad.jpg',          icon: '❄️', tag: 'Verified Reward', weight: 1,   enabled: true, rare: false },
    { id: 'p3',  name: 'Bluetooth Speaker',      image: 'images/bluetooth-speaker.png',    icon: '🔊', tag: 'Verified Reward', weight: 1,   enabled: true, rare: false },
    { id: 'p4',  name: 'Wireless Neckband',      image: 'images/wireless-neckband.png',    icon: '🎧', tag: 'Verified Reward', weight: 1,   enabled: true, rare: false },
    { id: 'p5',  name: 'Keyboard & Mouse Combo', image: 'images/keyboard-mouse-combo.jpg', icon: '⌨️', tag: 'Verified Reward', weight: 1,   enabled: true, rare: false },
    { id: 'p6',  name: '₹500 Cash',              image: 'images/cash-500.jpg',             icon: '💵', tag: 'Verified Reward', weight: 1,   enabled: true, rare: false },
    { id: 'p7',  name: '₹1,000 Cash',            image: 'images/cash-1000.jpg',            icon: '💵', tag: 'Verified Reward', weight: 0.3, enabled: true, rare: true  },
    { id: 'p8',  name: 'Earbuds',                image: 'images/earbuds.png?v=tws_black_2026',     icon: '🎧', tag: 'Verified Reward', weight: 1,   enabled: true, rare: false },
    { id: 'p9',  name: 'Smart Glass',            image: 'images/smart-glass.png?v=camera_glasses_2026', icon: '🕶️', tag: 'Verified Reward', weight: 0.3, enabled: true, rare: true  },
    { id: 'p10', name: 'Laptop Stand',           image: 'images/laptop-stand.png?v=folding_scissor_2026',icon: '💻', tag: 'Verified Reward', weight: 1,   enabled: true, rare: false },
    { id: 'p11', name: 'Antivirus',              image: 'images/antivirus.png',            icon: '🛡️', tag: 'Verified Reward', weight: 1,   enabled: true, rare: false }
  ]
};

// State
let currentPrizes = loadPrizesFromStorage();
let activeHistoryLogs = [];
let lastKnownHistoryJson = '';

const historyFilter = {
  search: '',
  datePreset: 'all',
  customDate: '',
  prize: 'all'
};

// -------------------------------------------------------------
// 2. DOM ELEMENTS
// -------------------------------------------------------------
const dom = {
  loginScreen:       document.getElementById('admin-login-screen'),
  dashboardView:     document.getElementById('admin-dashboard-view'),
  loginForm:         document.getElementById('admin-login-form'),
  adminUser:         document.getElementById('admin-user'),
  adminPass:         document.getElementById('admin-pass'),
  errorBanner:       document.getElementById('admin-error-banner'),
  logoutBtn:         document.getElementById('admin-logout-btn'),
  tabPrizesBtn:      document.getElementById('tab-prizes-btn'),
  tabHistoryBtn:     document.getElementById('tab-history-btn'),
  panelPrizes:       document.getElementById('panel-prizes'),
  panelHistory:      document.getElementById('panel-history'),
  showcaseContainer: document.getElementById('showcase-prizes-container'),
  drawableContainer: document.getElementById('drawable-prizes-container'),
  saveAllBtn:        document.getElementById('save-all-prizes-btn'),
  resetDefaultBtn:   document.getElementById('reset-default-prizes-btn'),
  historyTableBody:  document.getElementById('history-table-body'),
  clearHistoryBtn:   document.getElementById('clear-history-btn'),
  refreshHistoryBtn: document.getElementById('refresh-history-btn'),
  refreshIcon:       document.getElementById('refresh-icon'),
  exportCsvBtn:      document.getElementById('export-csv-btn'),
  statTotalDraws:    document.getElementById('stat-total-draws'),
  statTodayDraws:    document.getElementById('stat-today-draws'),
  statCashTotal:     document.getElementById('stat-cash-total'),
  statTopPrize:      document.getElementById('stat-top-prize'),
  searchInput:       document.getElementById('history-search-input'),
  clearSearchBtn:    document.getElementById('clear-search-btn'),
  dateFilter:        document.getElementById('history-date-filter'),
  customDateContainer: document.getElementById('custom-date-container'),
  customDateInput:   document.getElementById('history-custom-date'),
  prizeFilter:       document.getElementById('history-prize-filter'),
  resetFiltersBtn:   document.getElementById('reset-filters-btn'),
  countText:         document.getElementById('history-count-text'),
  syncIndicator:     document.getElementById('history-sync-indicator')
};

// -------------------------------------------------------------
// 3. INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
  setupRealtimeListeners();
  injectAdminStyles();
});

function injectAdminStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* ── Toggle Switch ── */
    .prize-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-top: 0.65rem;
      flex-wrap: wrap;
    }
    .toggle-label-text {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .toggle-group {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 38px;
      height: 21px;
    }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute;
      inset: 0;
      background: #cbd5e1;
      border-radius: 999px;
      cursor: pointer;
      transition: background 0.25s ease;
    }
    .toggle-slider::before {
      content: '';
      position: absolute;
      width: 15px; height: 15px;
      left: 3px; top: 3px;
      background: white;
      border-radius: 50%;
      transition: transform 0.25s ease;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    }
    .toggle-switch input:checked + .toggle-slider { background: #0284c7; }
    .toggle-switch input:checked + .toggle-slider::before { transform: translateX(17px); }
    .toggle-switch input.rare-chk:checked + .toggle-slider { background: #f59e0b; }

    .enabled-badge {
      font-size: 0.68rem; font-weight: 700; padding: 2px 8px;
      border-radius: 999px; letter-spacing: 0.5px;
    }
    .enabled-badge.on  { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .enabled-badge.off { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
    .rare-badge {
      font-size: 0.68rem; font-weight: 700; padding: 2px 8px;
      border-radius: 999px; letter-spacing: 0.5px;
      background: #fef3c7; color: #92400e; border: 1px solid #fcd34d;
    }

    /* ── Drawable card disabled state ── */
    .admin-prize-card.prize-disabled {
      opacity: 0.55;
    }

    /* ── Admin Dashboard Redesign ── */
    .admin-header {
      background: linear-gradient(90deg, #0f172a 0%, #1e3a5f 100%) !important;
    }
    .admin-container { padding: 1.5rem; }
    .admin-tabs { margin-bottom: 1.25rem; }
    .admin-tab-btn {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      color: #64748b;
      padding: 0.55rem 1.4rem;
      border-radius: var(--radius-pill);
      font-weight: 700; font-size: 0.84rem;
      cursor: pointer; transition: all 0.2s ease;
      font-family: var(--font-body);
    }
    .admin-tab-btn.active {
      background: #0284c7;
      border-color: #0284c7;
      color: white;
      box-shadow: 0 3px 10px rgba(2,132,199,0.3);
    }
    .admin-section-header h3 { font-size: 1.05rem; font-weight: 800; }
    .admin-section-header p { font-size: 0.82rem; color: var(--text-muted); margin-top: 0.2rem; }

    .admin-prize-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
    }
    .admin-prize-card {
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem;
      transition: box-shadow 0.2s, border-color 0.2s;
    }
    .admin-prize-card:hover { border-color: #bae6fd; box-shadow: 0 4px 16px rgba(2,132,199,0.08); }
    .admin-prize-card.showcase-card { border-color: #fcd34d; background: #fffbeb; }
    .admin-prize-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 0.7rem;
    }
    .admin-prize-badge {
      font-size: 0.64rem; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.8px; padding: 2px 8px; border-radius: 999px;
      background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;
    }
    .admin-prize-badge.showcase-badge {
      background: #fef3c7; color: #92400e; border-color: #fcd34d;
    }
    .admin-input-text {
      width: 100%; padding: 0.52rem 0.75rem;
      border: 1.5px solid #e2e8f0; border-radius: 8px;
      font-family: var(--font-body); font-size: 0.88rem;
      color: var(--text-main); background: #f8fafc; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .admin-input-text:focus {
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2,132,199,0.12);
      background: white;
    }
    .image-preview-box {
      width: 100%; height: 90px; border-radius: 8px;
      border: 1.5px solid #e2e8f0; background: #f8fafc;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; margin-bottom: 0.5rem;
    }
    .image-preview-box img { width: 100%; height: 100%; object-fit: contain; }
    .image-preview-fallback { font-size: 2rem; }
    .image-upload-controls { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .upload-file-label {
      display: inline-flex; align-items: center; gap: 0.3rem;
      background: #f0f9ff; color: #0284c7; border: 1px solid #bae6fd;
      border-radius: 6px; padding: 0.3rem 0.7rem; font-size: 0.76rem;
      font-weight: 700; cursor: pointer; transition: background 0.2s;
      font-family: var(--font-body);
    }
    .upload-file-label:hover { background: #e0f2fe; }
    .file-input-hidden { display: none; }
    .remove-img-btn {
      background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5;
      border-radius: 6px; padding: 0.3rem 0.7rem; font-size: 0.76rem;
      font-weight: 700; cursor: pointer; transition: background 0.2s;
      font-family: var(--font-body);
    }
    .remove-img-btn:hover { background: #fecaca; }
    .remove-img-btn.hidden { display: none; }
    .admin-sticky-bar {
      position: sticky; bottom: 0;
      background: rgba(255,255,255,0.96);
      backdrop-filter: blur(8px);
      border-top: 1px solid #e2e8f0;
      padding: 0.9rem 1.2rem;
      display: flex; align-items: center;
      justify-content: space-between; gap: 1rem;
      margin: 1.5rem -1.5rem -1.5rem;
      border-radius: 0 0 12px 12px;
    }
    .admin-sticky-info { font-size: 0.82rem; color: var(--text-muted); }
    .admin-sticky-actions { display: flex; gap: 0.6rem; align-items: center; }

    /* Stats grid */
    .admin-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 0.85rem;
      margin-bottom: 1.2rem;
    }
    .stat-card {
      background: white;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.9rem 1rem;
      display: flex; align-items: center; gap: 0.8rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .stat-icon-wrap {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem; flex-shrink: 0;
    }
    .stat-label { font-size: 0.74rem; color: var(--text-muted); font-weight: 600; display: block; }
    .stat-value { font-size: 1.35rem; font-weight: 800; color: var(--text-main); display: block; line-height: 1.2; }
    .stat-value.stat-small { font-size: 0.85rem; }

    /* History */
    .history-filter-toolbar {
      display: flex; gap: 0.65rem; flex-wrap: wrap;
      align-items: center; margin-bottom: 0.75rem;
      background: #f8fafc; border: 1.5px solid #e2e8f0;
      border-radius: 10px; padding: 0.7rem 1rem;
    }
    .filter-search-box {
      position: relative; flex: 1; min-width: 180px;
    }
    .search-icon {
      position: absolute; left: 0.7rem; top: 50%;
      transform: translateY(-50%); font-size: 0.9rem; pointer-events: none;
    }
    .filter-search-box input {
      width: 100%; padding: 0.48rem 2rem 0.48rem 2.1rem;
      border: 1.5px solid #e2e8f0; border-radius: 8px;
      font-size: 0.85rem; font-family: var(--font-body);
      background: white; color: var(--text-main); outline: none;
    }
    .filter-search-box input:focus { border-color: #0284c7; }
    .clear-search-btn {
      position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; color: #94a3b8;
      font-size: 1rem; padding: 0; line-height: 1;
    }
    .filter-controls-group { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
    .filter-select-wrap { display: flex; align-items: center; gap: 0.4rem; }
    .filter-label-icon { font-size: 0.9rem; }
    .filter-select {
      padding: 0.42rem 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
      font-size: 0.82rem; font-family: var(--font-body); background: white;
      color: var(--text-main); outline: none; cursor: pointer;
    }
    .filter-select:focus { border-color: #0284c7; }
    .filter-custom-date input {
      padding: 0.42rem 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
      font-size: 0.82rem; font-family: var(--font-body); background: white; outline: none;
    }
    .history-results-bar {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.6rem;
    }
    .sync-tag {
      background: #dcfce7; color: #15803d;
      padding: 2px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700;
    }
    .history-table-wrapper { overflow-x: auto; border-radius: 10px; border: 1.5px solid #e2e8f0; }
    .admin-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .admin-table thead { background: #f1f5f9; }
    .admin-table th {
      padding: 0.75rem 1rem; text-align: left;
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: #64748b; white-space: nowrap;
    }
    .admin-table td { padding: 0.7rem 1rem; border-top: 1px solid #f1f5f9; }
    .admin-table tbody tr:hover { background: #f8fafc; }
    .admin-table .row-just-added { background: #f0fdf4 !important; animation: rowFlash 1.5s ease; }
    @keyframes rowFlash {
      0% { background: #dcfce7 !important; } 100% { background: #f0fdf4 !important; }
    }
    .live-sync-badge {
      display: inline-flex; align-items: center; gap: 0.4rem;
      font-size: 0.7rem; font-weight: 700;
      background: #dcfce7; color: #15803d;
      padding: 2px 10px; border-radius: 999px; margin-left: 0.6rem;
    }
    .live-pulse-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #15803d; animation: pulseDot 1.4s infinite;
    }
    .history-header-flex {
      display: flex; align-items: flex-start; justify-content: space-between;
      flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;
    }
    .history-top-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .primary-outline {
      border-color: #bae6fd !important; color: #0284c7 !important;
    }
    .primary-outline:hover { background: #e0f2fe !important; }
    .btn-refresh-icon.spinning {
      display: inline-block; animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}

// -------------------------------------------------------------
// 4. EVENT LISTENERS
// -------------------------------------------------------------
function setupEventListeners() {
  dom.loginForm.addEventListener('submit', handleLogin);
  dom.logoutBtn.addEventListener('click', handleLogout);
  dom.tabPrizesBtn.addEventListener('click', () => switchTab('prizes'));
  dom.tabHistoryBtn.addEventListener('click', () => switchTab('history'));
  dom.saveAllBtn.addEventListener('click', handleSavePrizes);
  dom.resetDefaultBtn.addEventListener('click', handleResetDefaults);
  dom.clearHistoryBtn.addEventListener('click', handleClearHistory);
  dom.refreshHistoryBtn.addEventListener('click', handleRefreshHistory);
  dom.exportCsvBtn.addEventListener('click', exportHistoryToCSV);
  dom.searchInput.addEventListener('input', handleSearchInput);
  dom.clearSearchBtn.addEventListener('click', handleClearSearch);
  dom.dateFilter.addEventListener('change', handleDateFilterChange);
  dom.customDateInput.addEventListener('change', handleCustomDateChange);
  dom.prizeFilter.addEventListener('change', handlePrizeFilterChange);
  dom.resetFiltersBtn.addEventListener('click', handleResetFilters);
}

// -------------------------------------------------------------
// 5. REALTIME SYNC
// -------------------------------------------------------------
function setupRealtimeListeners() {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.HISTORY) {
      flashSyncIndicator('⚡ Live New Draw Received!');
      renderHistoryUI(true);
    } else if (e.key === STORAGE_KEYS.PRIZES) {
      currentPrizes = loadPrizesFromStorage();
      renderPrizesUI();
      populatePrizeFilterOptions();
    }
  });

  setInterval(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]';
      if (raw !== lastKnownHistoryJson) {
        lastKnownHistoryJson = raw;
        flashSyncIndicator('⚡ Synced');
        renderHistoryUI(true);
      }
    } catch (e) { console.error('Polling error:', e); }
  }, 2500);
}

function flashSyncIndicator(text) {
  if (!dom.syncIndicator) return;
  dom.syncIndicator.textContent = text;
  dom.syncIndicator.style.background = '#dcfce7';
  dom.syncIndicator.style.color = '#15803d';
  setTimeout(() => {
    dom.syncIndicator.textContent = '⚡ Live Auto-Sync Active';
    dom.syncIndicator.style.background = '';
    dom.syncIndicator.style.color = '';
  }, 2500);
}

// -------------------------------------------------------------
// 6. AUTHENTICATION
// -------------------------------------------------------------
function checkAuth() {
  if (sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'true') showDashboard();
  else showLogin();
}

function handleLogin(e) {
  e.preventDefault();
  const user = dom.adminUser.value.trim();
  const pass = dom.adminPass.value.trim();
  if (user.toLowerCase() === ADMIN_CREDENTIALS.username && (pass === ADMIN_CREDENTIALS.password || pass === 'admin123')) {
    dom.errorBanner.classList.add('hidden');
    sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    showDashboard();
  } else {
    dom.errorBanner.classList.remove('hidden');
    dom.adminPass.value = '';
    dom.adminPass.focus();
  }
}

function handleLogout() {
  sessionStorage.removeItem(STORAGE_KEYS.AUTH);
  dom.adminUser.value = '';
  dom.adminPass.value = '';
  showLogin();
}

function showLogin() {
  dom.loginScreen.classList.remove('hidden');
  dom.dashboardView.classList.add('hidden');
}

function showDashboard() {
  dom.loginScreen.classList.add('hidden');
  dom.dashboardView.classList.remove('hidden');
  renderPrizesUI();
  populatePrizeFilterOptions();
  renderHistoryUI();
}

function switchTab(tab) {
  if (tab === 'prizes') {
    dom.tabPrizesBtn.classList.add('active');
    dom.tabHistoryBtn.classList.remove('active');
    dom.panelPrizes.classList.remove('hidden');
    dom.panelHistory.classList.add('hidden');
  } else {
    dom.tabPrizesBtn.classList.remove('active');
    dom.tabHistoryBtn.classList.add('active');
    dom.panelPrizes.classList.add('hidden');
    dom.panelHistory.classList.remove('hidden');
    renderHistoryUI();
  }
}

// -------------------------------------------------------------
// 7. PRIZE MANAGEMENT
// -------------------------------------------------------------
function loadPrizesFromStorage() {
  try {
    let raw = localStorage.getItem(STORAGE_KEYS.PRIZES);
    if (!raw) {
      raw = localStorage.getItem('agarwal_master_prizes_v2026_v8') || localStorage.getItem('agarwal_master_prizes_v2026_v7') || localStorage.getItem('agarwal_master_prizes_v2026_v6') || localStorage.getItem('agarwal_master_prizes_v2026_v5');
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.showcase && parsed.drawable && parsed.drawable.length >= 7) {
        // Upgrade showcase images to new front-and-back S26 and modern 4K TV
        parsed.showcase = parsed.showcase.map(sc => {
          if (sc.id === 'showcase3') {
            return { ...sc, image: 'images/samsung-s26-ultra.png?v=s26_frontback_2026' };
          }
          if (sc.id === 'showcase4') {
            return { ...sc, image: 'images/samsung-65-tv.png?v=tv_4k_modern_2026' };
          }
          return sc;
        });
        // Upgrade drawable reward images
        parsed.drawable = parsed.drawable.map(p => {
          if (p.id === 'p8') {
            return { ...p, image: 'images/earbuds.png?v=tws_black_2026' };
          }
          if (p.id === 'p9') {
            return { ...p, image: 'images/smart-glass.png?v=camera_glasses_2026' };
          }
          if (p.id === 'p10') {
            return { ...p, image: 'images/laptop-stand.png?v=folding_scissor_2026' };
          }
          return { weight: 1, enabled: true, rare: false, ...p };
        });
        savePrizesToStorage(parsed);
        return parsed;
      }
    }
  } catch (err) { console.error('Error loading prizes:', err); }
  const defaults = JSON.parse(JSON.stringify(DEFAULT_MASTER_PRIZES));
  savePrizesToStorage(defaults);
  return defaults;
}

function savePrizesToStorage(prizes) {
  localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
}

function renderPrizesUI() {
  dom.showcaseContainer.innerHTML = '';
  dom.drawableContainer.innerHTML = '';
  currentPrizes.showcase.forEach((prize, index) => {
    dom.showcaseContainer.appendChild(createPrizeCard(prize, index, 'showcase'));
  });
  currentPrizes.drawable.forEach((prize, index) => {
    dom.drawableContainer.appendChild(createPrizeCard(prize, index, 'drawable'));
  });
}

function createPrizeCard(prize, index, group) {
  const card = document.createElement('div');
  const isShowcase = group === 'showcase';
  const isEnabled = isShowcase ? true : (prize.enabled !== false);
  const isRare = !isShowcase && prize.rare === true;

  card.className = `admin-prize-card ${isShowcase ? 'showcase-card' : ''} ${(!isShowcase && !isEnabled) ? 'prize-disabled' : ''}`;
  card.id = `card-${group}-${index}`;

  const badgeLabel = isShowcase ? (prize.badgeText || 'MEGA PRIZE') : `Prize #${index + 1}`;

  card.innerHTML = `
    <div class="admin-prize-header">
      <span class="admin-prize-badge ${isShowcase ? 'showcase-badge' : ''}">${badgeLabel}</span>
      <span style="font-size: 1.05rem;">${prize.icon || '🎁'}</span>
    </div>

    <div class="input-group" style="margin-bottom: 0.6rem;">
      <label style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 0.3rem;">
        Prize Name
      </label>
      <input
        type="text"
        id="name-${group}-${index}"
        value="${prize.name}"
        class="admin-input-text"
        placeholder="Enter prize name"
      />
    </div>

    <div class="image-preview-box" id="preview-box-${group}-${index}">
      ${prize.image
        ? `<img src="${prize.image}" alt="${prize.name}" />`
        : `<span class="image-preview-fallback">${prize.icon || '🎁'}</span>`}
    </div>

    <div class="image-upload-controls">
      <label class="upload-file-label">
        <span>📁 Replace Image</span>
        <input type="file" id="file-${group}-${index}" accept="image/*" class="file-input-hidden" />
      </label>
      <button type="button" id="remove-img-${group}-${index}" class="remove-img-btn ${prize.image ? '' : 'hidden'}">
        Remove
      </button>
    </div>

    ${!isShowcase ? `
    <div class="prize-toggle-row">
      <div class="toggle-group">
        <span class="toggle-label-text">Winnable</span>
        <label class="toggle-switch">
          <input type="checkbox" id="enabled-${group}-${index}" ${isEnabled ? 'checked' : ''} />
          <span class="toggle-slider"></span>
        </label>
        <span class="enabled-badge ${isEnabled ? 'on' : 'off'}" id="enabled-badge-${group}-${index}">
          ${isEnabled ? 'ON' : 'OFF'}
        </span>
      </div>
      <div class="toggle-group">
        <span class="toggle-label-text">Rare</span>
        <label class="toggle-switch">
          <input type="checkbox" class="rare-chk" id="rare-${group}-${index}" ${isRare ? 'checked' : ''} />
          <span class="toggle-slider"></span>
        </label>
        ${isRare ? `<span class="rare-badge">RARE</span>` : ''}
      </div>
    </div>
    ` : ''}
  `;

  // File input
  const fileInput = card.querySelector(`#file-${group}-${index}`);
  const removeBtn = card.querySelector(`#remove-img-${group}-${index}`);

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) { alert('Image too large! Please choose under 2.5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      currentPrizes[group][index].image = ev.target.result;
      updatePreview(group, index, ev.target.result);
      removeBtn.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener('click', () => {
    currentPrizes[group][index].image = '';
    updatePreview(group, index, '');
    removeBtn.classList.add('hidden');
    fileInput.value = '';
  });

  if (!isShowcase) {
    // Enabled toggle
    const enabledChk = card.querySelector(`#enabled-${group}-${index}`);
    const enabledBadge = card.querySelector(`#enabled-badge-${group}-${index}`);
    enabledChk.addEventListener('change', () => {
      const val = enabledChk.checked;
      currentPrizes[group][index].enabled = val;
      enabledBadge.textContent = val ? 'ON' : 'OFF';
      enabledBadge.className = `enabled-badge ${val ? 'on' : 'off'}`;
      card.classList.toggle('prize-disabled', !val);
    });

    // Rare toggle
    const rareChk = card.querySelector(`#rare-${group}-${index}`);
    rareChk.addEventListener('change', () => {
      const val = rareChk.checked;
      currentPrizes[group][index].rare = val;
      currentPrizes[group][index].weight = val ? 0.3 : 1;
    });
  }

  return card;
}

function updatePreview(group, index, imageData) {
  const box = document.getElementById(`preview-box-${group}-${index}`);
  if (!box) return;
  if (imageData) {
    box.innerHTML = `<img src="${imageData}" alt="Preview" style="width:100%;height:100%;object-fit:contain;" />`;
  } else {
    box.innerHTML = `<span class="image-preview-fallback">${currentPrizes[group][index].icon || '🎁'}</span>`;
  }
}

function handleSavePrizes() {
  currentPrizes.showcase.forEach((prize, idx) => {
    const el = document.getElementById(`name-showcase-${idx}`);
    if (el) prize.name = el.value.trim() || prize.name;
  });
  currentPrizes.drawable.forEach((prize, idx) => {
    const el = document.getElementById(`name-drawable-${idx}`);
    if (el) prize.name = el.value.trim() || prize.name;
  });
  savePrizesToStorage(currentPrizes);
  populatePrizeFilterOptions();
  alert('✅ All prizes, toggles, and photos saved!\nChanges are now live on the customer draw page.');
}

function handleResetDefaults() {
  if (confirm('Reset ALL prizes to factory defaults?')) {
    currentPrizes = JSON.parse(JSON.stringify(DEFAULT_MASTER_PRIZES));
    savePrizesToStorage(currentPrizes);
    renderPrizesUI();
    populatePrizeFilterOptions();
    alert('Reset to default prizes!');
  }
}

// -------------------------------------------------------------
// 8. FILTER CONTROLS
// -------------------------------------------------------------
function populatePrizeFilterOptions() {
  if (!dom.prizeFilter) return;
  const currentSelection = dom.prizeFilter.value;
  dom.prizeFilter.innerHTML = '<option value="all">All Prizes</option>';
  const allNames = new Set();
  currentPrizes.drawable.forEach(p => allNames.add(p.name));
  currentPrizes.showcase.forEach(p => allNames.add(p.name));
  allNames.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name;
    if (name === currentSelection) opt.selected = true;
    dom.prizeFilter.appendChild(opt);
  });
}

function handleSearchInput(e) {
  historyFilter.search = e.target.value.trim().toLowerCase();
  dom.clearSearchBtn.classList.toggle('hidden', historyFilter.search.length === 0);
  renderHistoryUI();
}
function handleClearSearch() {
  dom.searchInput.value = '';
  historyFilter.search = '';
  dom.clearSearchBtn.classList.add('hidden');
  renderHistoryUI();
}
function handleDateFilterChange(e) {
  historyFilter.datePreset = e.target.value;
  if (historyFilter.datePreset === 'custom') {
    dom.customDateContainer.classList.remove('hidden');
    dom.customDateInput.focus();
  } else {
    dom.customDateContainer.classList.add('hidden');
    dom.customDateInput.value = '';
    historyFilter.customDate = '';
  }
  renderHistoryUI();
}
function handleCustomDateChange(e) {
  historyFilter.customDate = e.target.value;
  renderHistoryUI();
}
function handlePrizeFilterChange(e) {
  historyFilter.prize = e.target.value;
  renderHistoryUI();
}
function handleResetFilters() {
  dom.searchInput.value = '';
  dom.clearSearchBtn.classList.add('hidden');
  dom.dateFilter.value = 'all';
  dom.customDateContainer.classList.add('hidden');
  dom.customDateInput.value = '';
  dom.prizeFilter.value = 'all';
  historyFilter.search = '';
  historyFilter.datePreset = 'all';
  historyFilter.customDate = '';
  historyFilter.prize = 'all';
  renderHistoryUI();
}

// -------------------------------------------------------------
// 9. HISTORY & STATS
// -------------------------------------------------------------
function readAllHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    lastKnownHistoryJson = raw || '[]';
    if (raw) return JSON.parse(raw);
  } catch (e) { console.error('Error parsing history:', e); }
  return [];
}

function matchesDate(item, preset, customDate) {
  if (preset === 'all') return true;
  let itemDateStr = item.dateStr || (item.isoDate ? item.isoDate.split('T')[0] : '');
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  if (preset === 'today') return itemDateStr === todayStr;
  if (preset === 'yesterday') {
    const yest = new Date(now); yest.setDate(yest.getDate() - 1);
    return itemDateStr === `${yest.getFullYear()}-${pad(yest.getMonth() + 1)}-${pad(yest.getDate())}`;
  }
  if (preset === 'last7') {
    const d7 = new Date(now); d7.setDate(d7.getDate() - 7);
    const itemD = item.isoDate ? new Date(item.isoDate) : null;
    return itemD ? itemD >= d7 : true;
  }
  if (preset === 'thisMonth') {
    const yyyyMm = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    return itemDateStr ? itemDateStr.startsWith(yyyyMm) : true;
  }
  if (preset === 'custom' && customDate) return itemDateStr === customDate;
  return true;
}

function calculateStats(allLogs) {
  dom.statTotalDraws.textContent = allLogs.length;
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  let todayCount = 0, cashSum = 0;
  const prizeCounts = {};
  allLogs.forEach(item => {
    if ((item.dateStr || '') === todayStr) todayCount++;
    const name = item.prizeName || '';
    if (name.includes('₹') || name.toLowerCase().includes('cash')) {
      const m = name.replace(/,/g, '').match(/\d+/);
      if (m) cashSum += parseInt(m[0], 10);
    }
    if (name) prizeCounts[name] = (prizeCounts[name] || 0) + 1;
  });
  dom.statTodayDraws.textContent = todayCount;
  dom.statCashTotal.textContent = `₹${cashSum.toLocaleString('en-IN')}`;
  let topName = 'None', topCount = 0;
  for (const [pName, count] of Object.entries(prizeCounts)) {
    if (count > topCount) { topCount = count; topName = pName; }
  }
  dom.statTopPrize.textContent = topCount > 0 ? `${topName} (${topCount})` : 'None';
}

function renderHistoryUI(highlightNewest = false) {
  const allLogs = readAllHistory();
  activeHistoryLogs = allLogs;
  calculateStats(allLogs);

  const filtered = allLogs.filter(item => {
    if (historyFilter.search) {
      const q = historyFilter.search;
      if (!(item.phone || '').toLowerCase().includes(q) &&
          !(item.bill || '').toLowerCase().includes(q) &&
          !(item.prizeName || '').toLowerCase().includes(q)) return false;
    }
    if (!matchesDate(item, historyFilter.datePreset, historyFilter.customDate)) return false;
    if (historyFilter.prize !== 'all' && item.prizeName !== historyFilter.prize) return false;
    return true;
  });

  dom.countText.innerHTML = `Showing <strong>${filtered.length}</strong> of ${allLogs.length} records`;
  dom.historyTableBody.innerHTML = '';

  if (filtered.length === 0) {
    dom.historyTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:2.5rem 1rem;color:var(--text-muted);">
          <div style="font-size:1.8rem;margin-bottom:0.4rem;">🔍</div>
          <strong style="color:var(--text-main);">No matching records found</strong>
          <p style="font-size:0.82rem;margin-top:0.25rem;">Adjust your filters to see results.</p>
        </td>
      </tr>`;
    return;
  }

  filtered.forEach((item, i) => {
    const tr = document.createElement('tr');
    if (highlightNewest && i === 0) tr.className = 'row-just-added';
    tr.innerHTML = `
      <td style="color:var(--text-muted);font-size:0.8rem;">${i + 1}</td>
      <td style="color:var(--text-muted);font-size:0.82rem;">${item.timestamp || '-'}</td>
      <td><strong style="font-size:0.9rem;color:var(--text-main);">${item.phone || 'Anonymous'}</strong></td>
      <td>
        <span style="color:var(--c-sky-primary);font-weight:800;font-family:monospace;font-size:0.9rem;background:var(--c-sky-pale);padding:2px 7px;border-radius:4px;border:1px solid var(--c-sky-border);">
          ${item.bill || 'N/A'}
        </span>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:0.6rem;">
          <div style="width:32px;height:32px;border-radius:4px;background:#f8fafc;border:1px solid var(--border-light);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;">
            ${item.prizeImage
              ? `<img src="${item.prizeImage}" alt="${item.prizeName}" style="width:100%;height:100%;object-fit:contain;" />`
              : `<span style="font-size:1.1rem;">${item.prizeIcon || '🎁'}</span>`}
          </div>
          <strong style="color:var(--text-main);font-size:0.88rem;">${item.prizeName}</strong>
        </div>
      </td>
      <td>
        <span style="background:#f1f5f9;padding:2px 8px;border-radius:999px;font-size:0.75rem;font-weight:700;color:var(--text-muted);">
          Box #${(item.boxIndex ?? 0) + 1}
        </span>
      </td>`;
    dom.historyTableBody.appendChild(tr);
  });
}

function handleRefreshHistory() {
  if (dom.refreshIcon) {
    dom.refreshIcon.classList.add('spinning');
    setTimeout(() => dom.refreshIcon.classList.remove('spinning'), 650);
  }
  flashSyncIndicator('⚡ Synced just now');
  renderHistoryUI();
}

function handleClearHistory() {
  if (confirm('⚠️ Delete ALL customer draw records? This cannot be undone.')) {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    lastKnownHistoryJson = '[]';
    renderHistoryUI();
    flashSyncIndicator('History Cleared');
  }
}

// -------------------------------------------------------------
// 10. CSV EXPORT
// -------------------------------------------------------------
function exportHistoryToCSV() {
  const allLogs = readAllHistory();
  if (!allLogs.length) { alert('No records to export.'); return; }

  const rows = allLogs.filter(item => {
    if (historyFilter.search) {
      const q = historyFilter.search;
      if (!(item.phone || '').toLowerCase().includes(q) &&
          !(item.bill || '').toLowerCase().includes(q) &&
          !(item.prizeName || '').toLowerCase().includes(q)) return false;
    }
    if (!matchesDate(item, historyFilter.datePreset, historyFilter.customDate)) return false;
    if (historyFilter.prize !== 'all' && item.prizeName !== historyFilter.prize) return false;
    return true;
  });

  if (!rows.length) { alert('No records match your filters.'); return; }

  const csvRows = [['S.No', 'Date & Time', 'Customer Mobile', 'Invoice/Bill #', 'Prize Won', 'Box Selected']];
  rows.forEach((item, idx) => {
    csvRows.push([
      idx + 1,
      `"${(item.timestamp || '').replace(/"/g, '""')}"`,
      `"${(item.phone || '').replace(/"/g, '""')}"`,
      `"${(item.bill || '').replace(/"/g, '""')}"`,
      `"${(item.prizeName || '').replace(/"/g, '""')}"`,
      `"Box #${(item.boxIndex ?? 0) + 1}"`
    ]);
  });

  const csv = '\uFEFF' + csvRows.map(r => r.join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Agarwal_Draw_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
