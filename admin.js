/**
 * =================================================================
 * LUCKY DRAW FESTIVAL - SECURE ADMIN DASHBOARD & CONTROLLER
 * =================================================================
 */

// -------------------------------------------------------------
// 1. CREDENTIALS & CONSTANTS
// -------------------------------------------------------------
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin' // Also accept 'admin123'
};

const STORAGE_KEYS = {
  PRIZES: 'lucky_draw_master_prizes',
  HISTORY: 'lucky_draw_history',
  AUTH: 'admin_authenticated'
};

const DEFAULT_MASTER_PRIZES = {
  showcase: [
    {
      id: 'grand',
      name: 'iPhone 16 Pro Max',
      image: '',
      icon: '📱',
      type: 'grand',
      badgeText: '👑 GRAND PRIZE',
      tag: 'Grand Showcase Item'
    },
    {
      id: 'mega',
      name: '$5,000 Gold Gift Card',
      image: '',
      icon: '💎',
      type: 'mega',
      badgeText: '💎 MEGA PRIZE',
      tag: 'Mega Showcase Item'
    }
  ],
  drawable: [
    { id: 'p1', name: 'Price 1', image: '', icon: '🎁', tag: 'Standard Reward' },
    { id: 'p2', name: 'Price 2', image: '', icon: '🎧', tag: 'Standard Reward' },
    { id: 'p3', name: 'Price 3', image: '', icon: '⌚', tag: 'Standard Reward' },
    { id: 'p4', name: 'Price 4', image: '', icon: '🛍️', tag: 'Standard Reward' },
    { id: 'p5', name: 'Price 5', icon: '☕', tag: 'Standard Reward' },
    { id: 'p6', name: 'Price 6', icon: '🎟️', tag: 'Standard Reward' },
    { id: 'p7', name: 'Price 7', icon: '💳', tag: 'Standard Reward' }
  ]
};

// Application State
let currentPrizes = loadPrizesFromStorage();

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
  tabPrizesBtn: document.getElementById('tab-prizes-btn'),
  tabHistoryBtn: document.getElementById('tab-history-btn'),
  panelPrizes: document.getElementById('panel-prizes'),
  panelHistory: document.getElementById('panel-history'),
  showcaseContainer: document.getElementById('showcase-prizes-container'),
  drawableContainer: document.getElementById('drawable-prizes-container'),
  saveAllBtn: document.getElementById('save-all-prizes-btn'),
  resetDefaultBtn: document.getElementById('reset-default-prizes-btn'),
  historyTableBody: document.getElementById('history-table-body'),
  clearHistoryBtn: document.getElementById('clear-history-btn')
};

// -------------------------------------------------------------
// 3. INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

function setupEventListeners() {
  // Login Form
  dom.loginForm.addEventListener('submit', handleLogin);

  // Logout
  dom.logoutBtn.addEventListener('click', handleLogout);

  // Tabs
  dom.tabPrizesBtn.addEventListener('click', () => switchTab('prizes'));
  dom.tabHistoryBtn.addEventListener('click', () => switchTab('history'));

  // Save & Reset
  dom.saveAllBtn.addEventListener('click', handleSavePrizes);
  dom.resetDefaultBtn.addEventListener('click', handleResetDefaults);

  // History Clear
  dom.clearHistoryBtn.addEventListener('click', handleClearHistory);
}

// -------------------------------------------------------------
// 4. AUTHENTICATION HANDLERS
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

  // Validate Admin Credentials
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
  renderHistoryTable();
}

function switchTab(tabName) {
  if (tabName === 'prizes') {
    dom.tabPrizesBtn.classList.add('active');
    dom.tabHistoryBtn.classList.remove('active');
    dom.panelPrizes.classList.remove('hidden');
    dom.panelHistory.classList.add('hidden');
  } else {
    dom.tabPrizesBtn.classList.remove('active');
    dom.tabHistoryBtn.classList.add('active');
    dom.panelPrizes.classList.add('hidden');
    dom.panelHistory.classList.remove('hidden');
    renderHistoryTable();
  }
}

// -------------------------------------------------------------
// 5. STORAGE & PRIZE DATA LOGIC
// -------------------------------------------------------------
function loadPrizesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRIZES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.showcase && parsed.drawable) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading saved prizes:', err);
  }
  return JSON.parse(JSON.stringify(DEFAULT_MASTER_PRIZES));
}

function savePrizesToStorage(prizes) {
  localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
}

// -------------------------------------------------------------
// 6. RENDER PRIZES MANAGEMENT CARDS
// -------------------------------------------------------------
function renderPrizesUI() {
  // Render Showcase (2)
  dom.showcaseContainer.innerHTML = '';
  currentPrizes.showcase.forEach((prize, index) => {
    const card = createPrizeCard(prize, 'showcase', index);
    dom.showcaseContainer.appendChild(card);
  });

  // Render Drawable (7)
  dom.drawableContainer.innerHTML = '';
  currentPrizes.drawable.forEach((prize, index) => {
    const card = createPrizeCard(prize, 'drawable', index);
    dom.drawableContainer.appendChild(card);
  });
}

function createPrizeCard(prize, group, index) {
  const card = document.createElement('div');
  const isShowcase = group === 'showcase';
  card.className = `admin-prize-card ${isShowcase ? 'showcase-card' : ''}`;

  const badgeTitle = isShowcase 
    ? (index === 0 ? '👑 GRAND SHOWCASE' : '💎 MEGA SHOWCASE') 
    : `🎁 DRAWABLE PRIZE #${index + 1}`;

  const imagePreviewContent = prize.image 
    ? `<img src="${prize.image}" alt="${prize.name}" id="preview-img-${group}-${index}" />` 
    : `<span class="image-preview-fallback" id="preview-fallback-${group}-${index}">${prize.icon || '🎁'}</span>`;

  card.innerHTML = `
    <div class="admin-prize-header">
      <span class="admin-prize-badge ${isShowcase ? 'showcase-badge' : ''}">${badgeTitle}</span>
      <span style="font-size: 0.8rem; color: var(--text-muted);">${isShowcase ? 'Never Won' : 'Can Win'}</span>
    </div>

    <!-- Prize Name Input -->
    <div class="input-group" style="margin-bottom: 0.8rem;">
      <label style="font-size: 0.85rem; color: #fff;">Prize Title / Name:</label>
      <div class="input-wrapper">
        <input 
          type="text" 
          id="name-${group}-${index}" 
          value="${prize.name}" 
          placeholder="e.g. ${prize.name}" 
        />
      </div>
    </div>

    <!-- Item Photo Uploader & Preview -->
    <div class="input-group" style="margin-bottom: 0.5rem;">
      <label style="font-size: 0.85rem; color: #fff;">Item Photo (Shown on Box Open):</label>
      <div class="image-upload-wrapper">
        <div class="image-preview-box" id="preview-box-${group}-${index}">
          ${imagePreviewContent}
        </div>
        <div class="image-upload-controls">
          <label class="upload-file-label" for="file-${group}-${index}">
            📁 Upload Item Photo
          </label>
          <input 
            type="file" 
            id="file-${group}-${index}" 
            class="file-input-hidden" 
            accept="image/*" 
          />
          <button 
            type="button" 
            class="remove-img-btn ${prize.image ? '' : 'hidden'}" 
            id="remove-btn-${group}-${index}">
            ✕ Remove Photo
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach File Upload Listener
  const fileInput = card.querySelector(`#file-${group}-${index}`);
  const removeBtn = card.querySelector(`#remove-btn-${group}-${index}`);

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image is larger than 2MB. Please select a smaller photo for optimal performance.');
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
    }
  });

  // Attach Remove Photo Listener
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

// -------------------------------------------------------------
// 7. SAVE ALL PRIZES
// -------------------------------------------------------------
function handleSavePrizes() {
  // Read current text values from inputs
  currentPrizes.showcase.forEach((prize, idx) => {
    const nameInput = document.getElementById(`name-showcase-${idx}`);
    if (nameInput) prize.name = nameInput.value.trim() || prize.name;
  });

  currentPrizes.drawable.forEach((prize, idx) => {
    const nameInput = document.getElementById(`name-drawable-${idx}`);
    if (nameInput) prize.name = nameInput.value.trim() || prize.name;
  });

  savePrizesToStorage(currentPrizes);
  alert('✅ All Prizes, Names, and Photos saved successfully!\nThey are now live on the main Lucky Draw page.');
}

function handleResetDefaults() {
  if (confirm('Are you sure you want to reset all 9 prizes and photos back to factory defaults?')) {
    currentPrizes = JSON.parse(JSON.stringify(DEFAULT_MASTER_PRIZES));
    savePrizesToStorage(currentPrizes);
    renderPrizesUI();
    alert('Reset to default prizes!');
  }
}

// -------------------------------------------------------------
// 8. CUSTOMER DRAW LOGS / HISTORY
// -------------------------------------------------------------
function renderHistoryTable() {
  let logs = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) logs = JSON.parse(raw);
  } catch (e) {
    logs = [];
  }

  dom.historyTableBody.innerHTML = '';

  if (!logs || logs.length === 0) {
    dom.historyTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          No draw participation records found yet. Customer draws will automatically appear here.
        </td>
      </tr>
    `;
    return;
  }

  logs.forEach((item, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td style="color: var(--text-muted);">${item.timestamp || '-'}</td>
      <td><strong>${item.phone}</strong></td>
      <td><span style="color: var(--primary-gold); font-weight:700;">${item.bill}</span></td>
      <td>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          ${item.prizeImage ? `<img src="${item.prizeImage}" style="width:28px; height:28px; object-fit:cover; border-radius:4px; border:1px solid #ffd700;" />` : ''}
          <strong style="color: #68d391;">${item.prizeName}</strong>
        </div>
      </td>
      <td><span class="box-tag">Box #${(item.boxIndex ?? 0) + 1}</span></td>
    `;
    dom.historyTableBody.appendChild(tr);
  });
}

function handleClearHistory() {
  if (confirm('Are you sure you want to delete all customer participation logs?')) {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    renderHistoryTable();
  }
}
