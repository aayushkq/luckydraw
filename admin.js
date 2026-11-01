/**
 * =================================================================
 * AGARWAL COMPUTER - ADMIN DASHBOARD & ADVANCED PRIZE MANAGEMENT
 * =================================================================
 */

// -------------------------------------------------------------
// 1. CREDENTIALS & CONSTANTS
// -------------------------------------------------------------
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin' // Also accepts 'admin123'
};

const STORAGE_KEYS = {
  PRIZES: 'agarwal_master_prizes_v2026_real_v3',
  HISTORY: 'lucky_draw_history',
  AUTH: 'admin_authenticated'
};

const DEFAULT_MASTER_PRIZES = {
  showcase: [
    {
      id: 'grand',
      name: 'iPhone 18 Pro Max',
      image: 'images/iphone-18-pro-max.webp',
      icon: '📱',
      type: 'grand',
      badgeText: 'SHOWCASE ONLY',
      tag: 'Grand Showcase Item'
    },
    {
      id: 'mega',
      name: '₹20,000 Cash',
      image: 'images/cash-20000.jpg',
      icon: '💵',
      type: 'mega',
      badgeText: 'MEGA SHOWCASE',
      tag: 'Mega Showcase Item'
    }
  ],
  drawable: [
    { id: 'p1', name: 'Pendrive', image: 'images/pendrive.jpg', icon: '💾', tag: 'Verified Reward' },
    { id: 'p2', name: 'Cooling Pad', image: 'images/cooling-pad.jpg', icon: '❄️', tag: 'Verified Reward' },
    { id: 'p3', name: 'Bluetooth Speaker', image: 'images/bluetooth-speaker.png', icon: '🔊', tag: 'Verified Reward' },
    { id: 'p4', name: 'Wireless Neckband', image: 'images/wireless-neckband.png', icon: '🎧', tag: 'Verified Reward' },
    { id: 'p5', name: 'Keyboard & Mouse Combo', image: 'images/keyboard-mouse-combo.jpg', icon: '⌨️', tag: 'Verified Reward' },
    { id: 'p6', name: '₹500 Cash', image: 'images/cash-500.jpg', icon: '💵', tag: 'Verified Reward' },
    { id: 'p7', name: '₹1,000 Cash', image: 'images/cash-1000.jpg', icon: '💵', tag: 'Verified Reward' }
  ]
};

// Application State
let currentPrizes = loadPrizesFromStorage();
let activeHistoryLogs = [];
let lastKnownHistoryJson = '';

// History Filter State
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
  loginScreen: document.getElementById('admin-login-screen'),
  dashboardView: document.getElementById('admin-dashboard-view'),
  loginForm: document.getElementById('admin-login-form'),
  adminUser: document.getElementById('admin-user'),
  adminPass: document.getElementById('admin-pass'),
  errorBanner: document.getElementById('admin-error-banner'),
  logoutBtn: document.getElementById('admin-logout-btn'),
  
  // Tabs
  tabPrizesBtn: document.getElementById('tab-prizes-btn'),
  tabHistoryBtn: document.getElementById('tab-history-btn'),
  panelPrizes: document.getElementById('panel-prizes'),
  panelHistory: document.getElementById('panel-history'),
  
  // Prizes Management
  showcaseContainer: document.getElementById('showcase-prizes-container'),
  drawableContainer: document.getElementById('drawable-prizes-container'),
  saveAllBtn: document.getElementById('save-all-prizes-btn'),
  resetDefaultBtn: document.getElementById('reset-default-prizes-btn'),
  
  // History & Real-Time Controls
  historyTableBody: document.getElementById('history-table-body'),
  clearHistoryBtn: document.getElementById('clear-history-btn'),
  refreshHistoryBtn: document.getElementById('refresh-history-btn'),
  refreshIcon: document.getElementById('refresh-icon'),
  exportCsvBtn: document.getElementById('export-csv-btn'),
  
  // Stats
  statTotalDraws: document.getElementById('stat-total-draws'),
  statTodayDraws: document.getElementById('stat-today-draws'),
  statCashTotal: document.getElementById('stat-cash-total'),
  statTopPrize: document.getElementById('stat-top-prize'),
  
  // Filters
  searchInput: document.getElementById('history-search-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  dateFilter: document.getElementById('history-date-filter'),
  customDateContainer: document.getElementById('custom-date-container'),
  customDateInput: document.getElementById('history-custom-date'),
  prizeFilter: document.getElementById('history-prize-filter'),
  resetFiltersBtn: document.getElementById('reset-filters-btn'),
  countText: document.getElementById('history-count-text'),
  syncIndicator: document.getElementById('history-sync-indicator')
};

// -------------------------------------------------------------
// 3. INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
  setupRealtimeListeners();
});

function setupEventListeners() {
  // Auth
  dom.loginForm.addEventListener('submit', handleLogin);
  dom.logoutBtn.addEventListener('click', handleLogout);
  
  // Tab Switching
  dom.tabPrizesBtn.addEventListener('click', () => switchTab('prizes'));
  dom.tabHistoryBtn.addEventListener('click', () => switchTab('history'));
  
  // Prizes
  dom.saveAllBtn.addEventListener('click', handleSavePrizes);
  dom.resetDefaultBtn.addEventListener('click', handleResetDefaults);
  
  // History Actions
  dom.clearHistoryBtn.addEventListener('click', handleClearHistory);
  dom.refreshHistoryBtn.addEventListener('click', handleRefreshHistory);
  dom.exportCsvBtn.addEventListener('click', exportHistoryToCSV);
  
  // Search & Filter Events
  dom.searchInput.addEventListener('input', handleSearchInput);
  dom.clearSearchBtn.addEventListener('click', handleClearSearch);
  dom.dateFilter.addEventListener('change', handleDateFilterChange);
  dom.customDateInput.addEventListener('change', handleCustomDateChange);
  dom.prizeFilter.addEventListener('change', handlePrizeFilterChange);
  dom.resetFiltersBtn.addEventListener('click', handleResetFilters);
}

// -------------------------------------------------------------
// 4. REALTIME SYNC: INSTANT REFLECTION AS SOON AS GIFT IS CLICKED
// -------------------------------------------------------------
function setupRealtimeListeners() {
  // Native Storage Event: fires cross-tab immediately on localStorage change
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

  // Polling fallback every 2.5 seconds to guarantee background sync
  setInterval(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]';
      if (raw !== lastKnownHistoryJson) {
        lastKnownHistoryJson = raw;
        flashSyncIndicator('⚡ Synced');
        renderHistoryUI(true);
      }
    } catch (e) {
      console.error('Polling error:', e);
    }
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
// 5. AUTHENTICATION HANDLERS
// -------------------------------------------------------------
function checkAuth() {
  const isAuth = sessionStorage.getItem(STORAGE_KEYS.AUTH);
  if (isAuth === 'true') {
    showDashboard();
  } else {
    showLogin();
  }
}

function handleLogin(e) {
  e.preventDefault();
  const user = dom.adminUser.value.trim();
  const pass = dom.adminPass.value.trim();

  const isValidUser = user.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase();
  const isValidPass = pass === ADMIN_CREDENTIALS.password || pass === 'admin123';

  if (isValidUser && isValidPass) {
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
// 6. PRIZE MANAGEMENT STORAGE & UI
// -------------------------------------------------------------
function loadPrizesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRIZES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.showcase && parsed.drawable && parsed.drawable.length >= 7) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading prizes:', err);
  }
  return JSON.parse(JSON.stringify(DEFAULT_MASTER_PRIZES));
}

function savePrizesToStorage(prizes) {
  localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
}

function renderPrizesUI() {
  dom.showcaseContainer.innerHTML = '';
  dom.drawableContainer.innerHTML = '';

  currentPrizes.showcase.forEach((prize, index) => {
    const card = createPrizeCard(prize, index, 'showcase');
    dom.showcaseContainer.appendChild(card);
  });

  currentPrizes.drawable.forEach((prize, index) => {
    const card = createPrizeCard(prize, index, 'drawable');
    dom.drawableContainer.appendChild(card);
  });
}

function createPrizeCard(prize, index, group) {
  const card = document.createElement('div');
  card.className = `admin-prize-card ${group === 'showcase' ? 'showcase-card' : ''}`;

  const isShowcase = group === 'showcase';
  const badgeLabel = isShowcase ? prize.badgeText || 'SHOWCASE ONLY' : `Prize #${index + 1}`;

  card.innerHTML = `
    <div class="admin-prize-header">
      <span class="admin-prize-badge ${isShowcase ? 'showcase-badge' : ''}">${badgeLabel}</span>
      <span style="font-size: 1.1rem;">${prize.icon || '🎁'}</span>
    </div>

    <div class="input-group">
      <label style="font-size: 0.76rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
        Prize Title / Display Name
      </label>
      <input 
        type="text" 
        id="name-${group}-${index}" 
        value="${prize.name}" 
        class="admin-input-text"
        placeholder="Enter prize title"
        required
      />
    </div>

    <div class="image-upload-wrapper">
      <div class="image-preview-box" id="preview-box-${group}-${index}">
        ${prize.image ? `<img src="${prize.image}" alt="${prize.name}" />` : `<span class="image-preview-fallback">${prize.icon || '🎁'}</span>`}
      </div>

      <div class="image-upload-controls">
        <label class="upload-file-label">
          <span>📁 Replace Image</span>
          <input type="file" id="file-${group}-${index}" accept="image/*" class="file-input-hidden" />
        </label>
        <button type="button" id="remove-img-${group}-${index}" class="remove-img-btn ${prize.image ? '' : 'hidden'}">
          Remove Photo
        </button>
      </div>
    </div>
  `;

  const fileInput = card.querySelector(`#file-${group}-${index}`);
  const removeBtn = card.querySelector(`#remove-img-${group}-${index}`);

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert('Image file size too large! Please choose an image under 2.5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      currentPrizes[group][index].image = base64Data;
      updatePreview(group, index, base64Data);
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

  return card;
}

function updatePreview(group, index, imageData) {
  const box = document.getElementById(`preview-box-${group}-${index}`);
  if (!box) return;

  if (imageData) {
    box.innerHTML = `<img src="${imageData}" alt="Preview" style="width:100%; height:100%; object-fit:cover;" />`;
  } else {
    const icon = currentPrizes[group][index].icon || '🎁';
    box.innerHTML = `<span class="image-preview-fallback">${icon}</span>`;
  }
}

function handleSavePrizes() {
  currentPrizes.showcase.forEach((prize, idx) => {
    const nameInput = document.getElementById(`name-showcase-${idx}`);
    if (nameInput) prize.name = nameInput.value.trim() || prize.name;
  });

  currentPrizes.drawable.forEach((prize, idx) => {
    const nameInput = document.getElementById(`name-drawable-${idx}`);
    if (nameInput) prize.name = nameInput.value.trim() || prize.name;
  });

  savePrizesToStorage(currentPrizes);
  populatePrizeFilterOptions();
  alert('✅ All Prizes, Names, and Photos saved successfully!\nThey are now live on the customer draw page.');
}

function handleResetDefaults() {
  if (confirm('Are you sure you want to reset all 9 prizes and photos back to factory defaults?')) {
    currentPrizes = JSON.parse(JSON.stringify(DEFAULT_MASTER_PRIZES));
    savePrizesToStorage(currentPrizes);
    renderPrizesUI();
    populatePrizeFilterOptions();
    alert('Reset to default prizes!');
  }
}

// -------------------------------------------------------------
// 7. FILTER CONTROLS & PRIZE DROPDOWN POPULATION
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
    opt.value = name;
    opt.textContent = name;
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
// 8. CUSTOMER DRAW LOGS & REAL-TIME AUDIT
// -------------------------------------------------------------
function readAllHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    lastKnownHistoryJson = raw || '[]';
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error parsing history:', e);
  }
  return [];
}

function matchesDate(item, preset, customDate) {
  if (preset === 'all') return true;

  // Extract YYYY-MM-DD from item
  let itemDateStr = item.dateStr;
  if (!itemDateStr && item.isoDate) {
    itemDateStr = item.isoDate.split('T')[0];
  }
  if (!itemDateStr && item.timestamp) {
    const d = new Date(item.timestamp);
    if (!isNaN(d.getTime())) {
      const pad = (n) => String(n).padStart(2, '0');
      itemDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  if (preset === 'today') {
    return itemDateStr === todayStr;
  }

  if (preset === 'yesterday') {
    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const yestStr = `${yest.getFullYear()}-${pad(yest.getMonth() + 1)}-${pad(yest.getDate())}`;
    return itemDateStr === yestStr;
  }

  if (preset === 'last7') {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const itemD = item.isoDate ? new Date(item.isoDate) : (item.timestamp ? new Date(item.timestamp) : null);
    if (itemD && !isNaN(itemD.getTime())) {
      return itemD >= sevenDaysAgo;
    }
    return true;
  }

  if (preset === 'thisMonth') {
    const yyyyMm = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    return itemDateStr ? itemDateStr.startsWith(yyyyMm) : true;
  }

  if (preset === 'custom' && customDate) {
    return itemDateStr === customDate;
  }

  return true;
}

function calculateStats(allLogs) {
  dom.statTotalDraws.textContent = allLogs.length;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  let todayCount = 0;
  let cashSum = 0;
  const prizeCounts = {};

  allLogs.forEach(item => {
    // Today count
    let itemDate = item.dateStr || (item.isoDate ? item.isoDate.split('T')[0] : '');
    if (itemDate === todayStr) todayCount++;

    // Cash rewards tally
    const name = item.prizeName || '';
    if (name.includes('₹') || name.toLowerCase().includes('cash')) {
      const numMatch = name.replace(/,/g, '').match(/\d+/);
      if (numMatch) {
        cashSum += parseInt(numMatch[0], 10);
      }
    }

    // Prize frequency
    if (name) {
      prizeCounts[name] = (prizeCounts[name] || 0) + 1;
    }
  });

  dom.statTodayDraws.textContent = todayCount;
  dom.statCashTotal.textContent = `₹${cashSum.toLocaleString('en-IN')}`;

  // Most drawn prize
  let topName = 'None';
  let topCount = 0;
  for (const [pName, count] of Object.entries(prizeCounts)) {
    if (count > topCount) {
      topCount = count;
      topName = pName;
    }
  }

  dom.statTopPrize.textContent = topCount > 0 ? `${topName} (${topCount})` : 'None';
  dom.statTopPrize.title = topCount > 0 ? `${topName} won ${topCount} times` : '';
}

function renderHistoryUI(highlightNewest = false) {
  const allLogs = readAllHistory();
  activeHistoryLogs = allLogs;

  // 1. Calculate & Render Overall Stats
  calculateStats(allLogs);

  // 2. Filter records based on active controls
  const filtered = allLogs.filter(item => {
    // Search query
    if (historyFilter.search) {
      const q = historyFilter.search;
      const phoneMatch = (item.phone || '').toLowerCase().includes(q);
      const billMatch = (item.bill || '').toLowerCase().includes(q);
      const prizeMatch = (item.prizeName || '').toLowerCase().includes(q);
      if (!phoneMatch && !billMatch && !prizeMatch) {
        return false;
      }
    }

    // Date filter
    if (!matchesDate(item, historyFilter.datePreset, historyFilter.customDate)) {
      return false;
    }

    // Prize filter
    if (historyFilter.prize !== 'all') {
      if (item.prizeName !== historyFilter.prize) return false;
    }

    return true;
  });

  // 3. Update Results Count
  dom.countText.innerHTML = `Showing <strong>${filtered.length}</strong> of ${allLogs.length} customer records`;

  // 4. Render Table Rows
  dom.historyTableBody.innerHTML = '';

  if (filtered.length === 0) {
    dom.historyTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2.5rem 1rem;">
          <div style="font-size: 1.8rem; margin-bottom: 0.4rem;">🔍</div>
          <strong style="color: var(--text-main);">No matching draw records found</strong>
          <p style="font-size: 0.82rem; margin-top: 0.25rem;">Try adjusting your search keywords, prize selection, or date filter.</p>
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach((item, i) => {
    const tr = document.createElement('tr');
    if (highlightNewest && i === 0) {
      tr.className = 'row-just-added';
    }

    tr.innerHTML = `
      <td style="color: var(--text-muted); font-size: 0.8rem;">${i + 1}</td>
      <td style="color: var(--text-muted); font-size: 0.82rem;">${item.timestamp || '-'}</td>
      <td>
        <strong style="font-size: 0.9rem; color: var(--text-main);">${item.phone || 'Anonymous'}</strong>
      </td>
      <td>
        <span style="color: var(--c-sky-primary); font-weight: 800; font-family: monospace; font-size: 0.9rem; background: var(--c-sky-pale); padding: 2px 7px; border-radius: 4px; border: 1px solid var(--c-sky-border);">
          ${item.bill || 'N/A'}
        </span>
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <div style="width: 32px; height: 32px; border-radius: 4px; background: #f8fafc; border: 1px solid var(--border-light); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
            ${item.prizeImage ? `<img src="${item.prizeImage}" alt="${item.prizeName}" style="width: 100%; height: 100%; object-fit: contain;" />` : `<span style="font-size: 1.1rem;">${item.prizeIcon || '🎁'}</span>`}
          </div>
          <div>
            <strong style="color: var(--text-main); font-size: 0.88rem; display: block;">${item.prizeName}</strong>
          </div>
        </div>
      </td>
      <td>
        <span class="box-tag" style="background: #f1f5f9; padding: 2px 8px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">
          Box #${(item.boxIndex ?? 0) + 1}
        </span>
      </td>
    `;

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
  if (confirm('⚠️ Are you sure you want to delete ALL customer participation records? This cannot be undone.')) {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    lastKnownHistoryJson = '[]';
    renderHistoryUI();
    flashSyncIndicator('History Cleared');
  }
}

// -------------------------------------------------------------
// 9. EXPORT FILTERED RECORDS TO CSV / EXCEL
// -------------------------------------------------------------
function exportHistoryToCSV() {
  const allLogs = readAllHistory();
  if (!allLogs || allLogs.length === 0) {
    alert('No records available to export.');
    return;
  }

  // Filter based on active criteria
  const rowsToExport = allLogs.filter(item => {
    if (historyFilter.search) {
      const q = historyFilter.search;
      const phoneMatch = (item.phone || '').toLowerCase().includes(q);
      const billMatch = (item.bill || '').toLowerCase().includes(q);
      const prizeMatch = (item.prizeName || '').toLowerCase().includes(q);
      if (!phoneMatch && !billMatch && !prizeMatch) return false;
    }
    if (!matchesDate(item, historyFilter.datePreset, historyFilter.customDate)) return false;
    if (historyFilter.prize !== 'all' && item.prizeName !== historyFilter.prize) return false;
    return true;
  });

  if (rowsToExport.length === 0) {
    alert('No records match your active filters to export.');
    return;
  }

  const csvRows = [];
  // CSV Header
  csvRows.push(['S.No', 'Date & Time', 'Customer Mobile', 'Invoice / Bill #', 'Prize Won', 'Box Selected']);

  rowsToExport.forEach((item, idx) => {
    csvRows.push([
      idx + 1,
      `"${(item.timestamp || '').replace(/"/g, '""')}"`,
      `"${(item.phone || '').replace(/"/g, '""')}"`,
      `"${(item.bill || '').replace(/"/g, '""')}"`,
      `"${(item.prizeName || '').replace(/"/g, '""')}"`,
      `"Box #${(item.boxIndex ?? 0) + 1}"`
    ]);
  });

  const csvString = '\uFEFF' + csvRows.map(r => r.join(',')).join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const dateTag = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `Agarwal_Computer_Lucky_Draw_Audit_${dateTag}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
