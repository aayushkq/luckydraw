/**
 * =================================================================
 * AGARWAL COMPUTER - WHITE & SKY BLUE THEME CUSTOMER LUCKY DRAW
 * =================================================================
 */

// -------------------------------------------------------------
// 1. SOUND SYNTHESIS ENGINE (Offline Web Audio API)
// -------------------------------------------------------------
class SoundManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(840, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playZoom() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.45);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }

  playPop() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(980, this.ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  playFanfare() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    const startTime = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + i * 0.1);

      gain.gain.setValueAtTime(0.18, startTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + i * 0.1 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime + i * 0.1);
      osc.stop(startTime + i * 0.1 + 0.55);
    });
  }
}

const sounds = new SoundManager();

// -------------------------------------------------------------
// 2. MASTER PRIZES: 2 NON-WINNABLE SHOWCASE & 7 WINNABLE REWARDS
// -------------------------------------------------------------
const STORAGE_KEYS = {
  PRIZES: 'agarwal_master_prizes_v2026_v9',
  HISTORY: 'lucky_draw_history'
};

const DEFAULT_MASTER_PRIZES = {
  showcase: [
    {
      id: 'grand',
      name: 'iPhone 18 Pro Max',
      image: 'images/iphone-18-pro-max.webp',
      icon: '📱',
      type: 'grand',
      badgeText: 'MEGA PRIZE',
      tag: 'Grand Prize'
    },
    {
      id: 'mega',
      name: '₹20,000 Cash',
      image: 'images/cash-20000.jpg',
      icon: '💵',
      type: 'mega',
      badgeText: 'MEGA PRIZE',
      tag: 'Mega Prize'
    },
    {
      id: 'showcase3',
      name: 'Samsung S26 Ultra',
      image: 'images/samsung-s26-ultra.png?v=s26_frontback_2026',
      icon: '📱',
      type: 'grand',
      badgeText: 'MEGA PRIZE',
      tag: 'Grand Prize'
    },
    {
      id: 'showcase4',
      name: 'Samsung 65" 4K TV',
      image: 'images/samsung-65-tv.png?v=tv_4k_modern_2026',
      icon: '📺',
      type: 'mega',
      badgeText: 'MEGA PRIZE',
      tag: 'Mega Prize'
    }
  ],
  drawable: [
    { id: 'p1',  name: 'Pendrive',              image: 'images/pendrive.jpg',            icon: '💾', tag: 'Verified Reward', weight: 1, enabled: true },
    { id: 'p2',  name: 'Cooling Pad',            image: 'images/cooling-pad.jpg',         icon: '❄️', tag: 'Verified Reward', weight: 1, enabled: true },
    { id: 'p3',  name: 'Bluetooth Speaker',      image: 'images/bluetooth-speaker.png',   icon: '🔊', tag: 'Verified Reward', weight: 1, enabled: true },
    { id: 'p4',  name: 'Wireless Neckband',      image: 'images/wireless-neckband.png',   icon: '🎧', tag: 'Verified Reward', weight: 1, enabled: true },
    { id: 'p5',  name: 'Keyboard & Mouse Combo', image: 'images/keyboard-mouse-combo.jpg',icon: '⌨️', tag: 'Verified Reward', weight: 1, enabled: true },
    { id: 'p6',  name: '₹500 Cash',              image: 'images/cash-500.jpg',            icon: '💵', tag: 'Verified Reward', weight: 1, enabled: true },
    { id: 'p7',  name: '₹1,000 Cash',            image: 'images/cash-1000.jpg',           icon: '💵', tag: 'Verified Reward', weight: 0.3, enabled: true, rare: true },
    { id: 'p8',  name: 'Earbuds',                image: 'images/earbuds.png?v=tws_black_2026',     icon: '🎧', tag: 'Verified Reward', weight: 1, enabled: true },
    { id: 'p9',  name: 'Smart Glass',            image: 'images/smart-glass.png?v=camera_glasses_2026', icon: '🕶️', tag: 'Verified Reward', weight: 0.3, enabled: true, rare: true },
    { id: 'p10', name: 'Laptop Stand',           image: 'images/laptop-stand.png?v=folding_scissor_2026',icon: '💻', tag: 'Verified Reward', weight: 1, enabled: true },
    { id: 'p11', name: 'Antivirus',              image: 'images/antivirus.png',           icon: '🛡️', tag: 'Verified Reward', weight: 1, enabled: true }
  ]
};

// Weighted random picker
function weightedRandom(items) {
  const pool = items.filter(p => p.enabled !== false);
  if (pool.length === 0) return items[0]; // fallback
  const total = pool.reduce((s, p) => s + (p.weight || 1), 0);
  let r = Math.random() * total;
  for (const item of pool) {
    r -= (item.weight || 1);
    if (r <= 0) return item;
  }
  return pool[pool.length - 1];
}

function getActivePrizes() {
  try {
    let raw = localStorage.getItem(STORAGE_KEYS.PRIZES);
    if (!raw) {
      raw = localStorage.getItem('agarwal_master_prizes_v2026_v8') || localStorage.getItem('agarwal_master_prizes_v2026_v7') || localStorage.getItem('agarwal_master_prizes_v2026_v6') || localStorage.getItem('agarwal_master_prizes_v2026_v5');
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.showcase && parsed.drawable && parsed.drawable.length >= 7) {
        // Upgrade showcase images
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
        try { localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(parsed)); } catch(e){}
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading master prizes:', err);
  }
  const defaults = JSON.parse(JSON.stringify(DEFAULT_MASTER_PRIZES));
  try { localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(defaults)); } catch(e){}
  return defaults;
}

// -------------------------------------------------------------
// 3. APPLICATION STATE
// -------------------------------------------------------------
const state = {
  currentUser: null,
  hasDrawn: false,
  chosenBoxIndex: null,
  wonPrize: null,
  boxAssignments: [],
  hasRevealedAll: false,
  totalBoxes: 15
};

// -------------------------------------------------------------
// 4. DOM ELEMENTS
// -------------------------------------------------------------
const dom = {
  loginView: document.getElementById('login-view'),
  drawView: document.getElementById('draw-view'),
  loginForm: document.getElementById('lucky-login-form'),
  userPhoneInput: document.getElementById('user-phone'),
  userBillInput: document.getElementById('user-bill'),
  loginErrorMsg: document.getElementById('login-error-msg'),
  loginMarqueeTrack: document.getElementById('login-marquee-track'),
  displayPhone: document.getElementById('display-phone'),
  displayBill: document.getElementById('display-bill'),
  boxesViewport: document.getElementById('boxes-viewport'),
  boxesContainer: document.getElementById('boxes-container'),
  belowGiftActionDock: document.getElementById('below-gift-action-dock'),
  showAllGiftsBtn: document.getElementById('show-all-gifts-btn'),
  tvNewDrawBar: document.getElementById('tv-new-draw-bar'),
  tvStartNewDrawBtn: document.getElementById('tv-start-new-draw-btn'),
  drawStatusPill: document.getElementById('draw-status-pill'),
  drawStatusText: document.getElementById('draw-status-text'),
  instructionsText: document.getElementById('instructions-text'),
  soundToggleBtn: document.getElementById('sound-toggle-btn'),
  soundIcon: document.getElementById('sound-icon'),
  resetSessionBtn: document.getElementById('reset-session-btn'),
  winBanner: document.getElementById('win-banner'),
  winToastTitle: document.getElementById('win-toast-title'),
  rulesBtn: document.getElementById('rules-btn'),
  rulesModal: document.getElementById('rules-modal'),
  closeRulesBtn: document.getElementById('close-rules-btn'),
  rulesOkayBtn: document.getElementById('rules-okay-btn')
};

// -------------------------------------------------------------
// 5. INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  renderLoginMarquee();
  checkExistingSession();
});

function setupEventListeners() {
  dom.loginForm.addEventListener('submit', handleLoginSubmit);

  dom.soundToggleBtn.addEventListener('click', () => {
    const isEnabled = sounds.toggle();
    dom.soundIcon.textContent = isEnabled ? '🔊' : '🔇';
    dom.soundToggleBtn.querySelector('.btn-text').textContent = isEnabled ? 'Sound' : 'Muted';
    sounds.playClick();
  });

  dom.resetSessionBtn.addEventListener('click', () => {
    sounds.playClick();
    if (confirm('Log out from Agarwal Computer Lucky Draw?')) {
      resetSession();
    }
  });

  // Action Button under the drawn prize
  dom.showAllGiftsBtn.addEventListener('click', handleShowAllGifts);

  // New Draw Button
  dom.tvStartNewDrawBtn.addEventListener('click', () => {
    sounds.playClick();
    resetSession();
  });

  // Rules Modal
  dom.rulesBtn.addEventListener('click', () => {
    sounds.playClick();
    dom.rulesModal.classList.remove('hidden');
  });

  dom.closeRulesBtn.addEventListener('click', () => {
    sounds.playClick();
    dom.rulesModal.classList.add('hidden');
  });

  dom.rulesOkayBtn.addEventListener('click', () => {
    sounds.playClick();
    dom.rulesModal.classList.add('hidden');
  });
}

// -------------------------------------------------------------
// 6. LOGIN VIEW: RANDOMIZED CONTINUOUS MARQUEE RIBBON WITH INTERLEAVED UNIQUE SHOWCASE TRAPS
// -------------------------------------------------------------
function renderLoginMarquee() {
  if (!dom.loginMarqueeTrack) return;

  const master = getActivePrizes();
  const showcasePool = (master.showcase || []).slice();
  const regularPool = (master.drawable || []).filter(p => p.enabled !== false);

  if (showcasePool.length === 0 || regularPool.length === 0) return;

  // Shuffle helper (Fisher-Yates) for randomized ribbon on each visit
  const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // 1. Shuffle both pools randomly
  // Shuffled showcases ensures EVERY showcase prize is completely unique in the cycle
  const shuffledShowcases = shuffle(showcasePool);
  const shuffledRegulars = shuffle(regularPool);

  // 2. Interleave so each UNIQUE showcase item is separated by EXACTLY 3 regular rewards:
  // [Showcase A -> Reg 1 -> Reg 2 -> Reg 3 -> Showcase B -> Reg 4 -> Reg 5 -> Reg 6 -> Showcase C ...]
  // This guarantees:
  // - Showcase items are NEVER consecutive ("not one after another")
  // - In any typical visible viewport window (6-8 cards moving across screen),
  //   there are ALWAYS 2 DIFFERENT showcase items visible gliding across the ribbon!
  // - ZERO duplicate showcase items visible at once (only 1 of each showcase item on screen at any time;
  //   identical items are spaced 16 cards / ~2,880px apart so 2 iPhones NEVER appear simultaneously)
  const oneCycle = [];
  let regIdx = 0;

  for (let s = 0; s < shuffledShowcases.length; s++) {
    // 1 Unique Showcase Trap
    oneCycle.push({ ...shuffledShowcases[s], isShowcaseTrap: true });

    // Exactly 3 regular store rewards between each showcase prize
    for (let r = 0; r < 3; r++) {
      const regPrize = shuffledRegulars[regIdx % shuffledRegulars.length];
      regIdx++;
      oneCycle.push({ ...regPrize, isShowcaseTrap: false });
    }
  }

  // Duplicate cycle for 100% seamless infinite CSS scroll (0% to -50%)
  const fullTrackList = [...oneCycle, ...oneCycle];

  const html = fullTrackList.map(p => {
    if (p.isShowcaseTrap) {
      const badgeText = p.type === 'grand' ? '⭐ GRAND PRIZE' : '🔥 MEGA PRIZE';
      return `
        <div class="marquee-card showcase-trap" title="${p.name} - Showcase Prize">
          <span class="marquee-trap-badge">${badgeText}</span>
          <div class="marquee-card-img-wrap">
            ${p.image 
              ? `<img src="${p.image}" alt="${p.name}" class="marquee-card-img" />` 
              : `<span class="marquee-card-icon">${p.icon || '📱'}</span>`}
          </div>
          <div class="marquee-card-info">
            <span class="marquee-card-name">${p.name}</span>
            <span class="marquee-card-sub">★ MEGA SHOWCASE ★</span>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="marquee-card" title="${p.name} - Verified Store Reward">
          <div class="marquee-card-img-wrap">
            ${p.image 
              ? `<img src="${p.image}" alt="${p.name}" class="marquee-card-img" />` 
              : `<span class="marquee-card-icon">${p.icon || '🎁'}</span>`}
          </div>
          <div class="marquee-card-info">
            <span class="marquee-card-name">${p.name}</span>
            <span class="marquee-card-sub">Store Reward</span>
          </div>
        </div>
      `;
    }
  }).join('');

  dom.loginMarqueeTrack.innerHTML = html;
}

// -------------------------------------------------------------
// 7. LOGIN / VERIFICATION (Step 1)
// -------------------------------------------------------------
function handleLoginSubmit(e) {
  e.preventDefault();
  sounds.playClick();

  const phone = dom.userPhoneInput.value.trim();
  const bill = dom.userBillInput.value.trim().toUpperCase();

  if (!phone || phone.length < 7) {
    showLoginError('Please enter a valid mobile number (minimum 7 digits).');
    return;
  }

  if (!bill || bill.length < 3) {
    showLoginError('Please enter a valid store invoice or bill number.');
    return;
  }

  hideLoginError();

  state.currentUser = { phone, bill };
  localStorage.setItem('lucky_draw_user', JSON.stringify(state.currentUser));

  if (dom.displayPhone) dom.displayPhone.textContent = phone;
  if (dom.displayBill) dom.displayBill.textContent = bill;

  transitionToDrawView();
}

function showLoginError(msg) {
  dom.loginErrorMsg.textContent = msg;
  dom.loginErrorMsg.classList.remove('hidden');
}

function hideLoginError() {
  dom.loginErrorMsg.classList.add('hidden');
}

function transitionToDrawView() {
  dom.loginView.classList.remove('active-view');
  setTimeout(() => {
    dom.drawView.classList.add('active-view');
    initLuckyDrawBoxes();
  }, 180);
}

function checkExistingSession() {
  const savedUser = localStorage.getItem('lucky_draw_user');
  if (savedUser) {
    try {
      state.currentUser = JSON.parse(savedUser);
      if (dom.displayPhone) dom.displayPhone.textContent = state.currentUser.phone;
      if (dom.displayBill) dom.displayBill.textContent = state.currentUser.bill;
      dom.loginView.classList.remove('active-view');
      dom.drawView.classList.add('active-view');
      initLuckyDrawBoxes();
    } catch {
      localStorage.removeItem('lucky_draw_user');
    }
  }
}

function resetSession() {
  localStorage.removeItem('lucky_draw_user');
  state.currentUser = null;
  state.hasDrawn = false;
  state.chosenBoxIndex = null;
  state.wonPrize = null;
  state.boxAssignments = [];
  state.hasRevealedAll = false;

  dom.boxesContainer.style.transform = 'translate(0px, 0px) scale(1)';
  dom.belowGiftActionDock.classList.add('hidden');
  dom.belowGiftActionDock.classList.remove('disappearing');
  dom.tvNewDrawBar.classList.add('hidden');
  dom.winBanner.classList.add('hidden');

  dom.userPhoneInput.value = '';
  dom.userBillInput.value = '';
  dom.drawView.classList.remove('active-view');
  dom.loginView.classList.add('active-view');
}

// -------------------------------------------------------------
// 8. LUCKY DRAW ARENA & 3x3 BOXES SETUP (Step 2)
// -------------------------------------------------------------
function initLuckyDrawBoxes() {
  const master = getActivePrizes();
  const totalBoxes = master.drawable.length + master.showcase.length;
  state.totalBoxes = totalBoxes;

  dom.boxesContainer.innerHTML = '';
  dom.boxesContainer.style.transform = 'translate(0px, 0px) scale(1)';

  state.hasDrawn = false;
  state.chosenBoxIndex = null;
  state.wonPrize = null;
  state.boxAssignments = new Array(totalBoxes).fill(null);
  state.hasRevealedAll = false;

  if (dom.drawStatusPill) dom.drawStatusPill.className = 'badge-status draw-ready';
  if (dom.drawStatusText) dom.drawStatusText.textContent = 'Pick 1 Box';
  dom.instructionsText.innerHTML = `Select any <strong>1 of the ${totalBoxes} gift boxes</strong> below to reveal your prize!`;
  
  dom.belowGiftActionDock.classList.add('hidden');
  dom.belowGiftActionDock.classList.remove('disappearing');
  dom.tvNewDrawBar.classList.add('hidden');
  dom.winBanner.classList.add('hidden');

  for (let i = 0; i < totalBoxes; i++) {
    const boxEl = createBoxElement(i);
    dom.boxesContainer.appendChild(boxEl);
  }
}

function createBoxElement(index) {
  const boxItem = document.createElement('div');
  boxItem.className = 'gift-box-item can-pick';
  boxItem.dataset.boxIndex = index;

  boxItem.innerHTML = `
    <div class="box-inner-card">
      <!-- FRONT FACE (SKY BLUE WITH WHITE SILK RIBBONS) -->
      <div class="box-face box-front">
        <div class="ribbon-vertical"></div>
        <div class="ribbon-horizontal"></div>
        <div class="gift-bow-badge">${index + 1}</div>
        <div class="box-label-text">Box #${index + 1}</div>
      </div>

      <!-- BACK FACE (REVEALED PRIZE WITH BIG IMAGE - ZERO OVERFLOW) -->
      <div class="box-face box-back" id="box-back-${index}">
        <div class="box-back-header">
          <span class="box-num-pill">Box #${index + 1}</span>
          <span class="box-state-tag" id="box-tag-${index}">REVEALED</span>
        </div>
        
        <div class="prize-media-container" id="box-media-${index}">
          <div class="prize-icon-display" id="box-icon-${index}">🎁</div>
        </div>

        <h4 class="prize-title-display" id="box-title-${index}">Prize</h4>
      </div>
    </div>
  `;

  boxItem.addEventListener('click', () => handleBoxClick(index));
  return boxItem;
}

// -------------------------------------------------------------
// 9. SCREEN ZOOM-IN & CINEMATIC DRAWING
// -------------------------------------------------------------
function handleBoxClick(boxIndex) {
  if (state.hasDrawn) return;

  const boxEl = dom.boxesContainer.children[boxIndex];
  if (!boxEl || boxEl.classList.contains('is-opened')) return;

  state.hasDrawn = true;
  state.chosenBoxIndex = boxIndex;

  sounds.playClick();
  sounds.playZoom();

  // Dim other 8 boxes for clean focus
  Array.from(dom.boxesContainer.children).forEach(b => {
    b.classList.remove('can-pick');
    if (b !== boxEl) {
      b.classList.add('dimmed-box');
    }
  });

  // Zoom into clicked box
  zoomToBox(boxEl);

  // Distribute prizes (guaranteed 1 of 7 drawable prizes, 2 showcase placed in other 8)
  distributePrizes(boxIndex);

  // IMMEDIATELY RECORD PARTICIPATION ON GIFT CLICK (Instant Realtime Reflection in Admin Panel)
  recordDrawParticipation(boxIndex, state.wonPrize);

  // Animate 3D unboxing after camera settles
  setTimeout(() => {
    openWinningBox(boxIndex);
  }, 550);
}

function zoomToBox(boxEl) {
  const vpRect = dom.boxesViewport.getBoundingClientRect();
  const contRect = dom.boxesContainer.getBoundingClientRect();
  const boxRect = boxEl.getBoundingClientRect();

  const vpCenterX = vpRect.left + vpRect.width / 2;
  const vpCenterY = vpRect.top + vpRect.height / 2;

  const contCenterX = contRect.left + contRect.width / 2;
  const contCenterY = contRect.top + contRect.height / 2;

  const boxCenterX = boxRect.left + boxRect.width / 2;
  const boxCenterY = boxRect.top + boxRect.height / 2;

  // Well-proportioned scale for 5x3 grid (enlarged boxes)
  const scale = window.innerWidth < 650 ? 2.1 : (window.innerWidth < 1000 ? 1.7 : 1.55);
  // Exact mathematical centering taking transform-origin (container center) & scale into account
  const deltaX = vpCenterX - (contCenterX + (boxCenterX - contCenterX) * scale);
  const deltaY = vpCenterY - (contCenterY + (boxCenterY - contCenterY) * scale);

  dom.boxesContainer.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
}

function distributePrizes(winningIndex) {
  const master = getActivePrizes();
  const drawablePool = master.drawable;
  const showcasePool = master.showcase;
  const totalBoxes = state.totalBoxes;

  // Winner: weighted random pick from ENABLED drawable prizes only
  const wonPrize = weightedRandom(drawablePool);
  state.wonPrize = wonPrize;
  state.boxAssignments[winningIndex] = wonPrize;

  // Remaining boxes: all other drawables + all showcase items, shuffled
  const remainingDrawable = drawablePool.filter(p => p.id !== wonPrize.id);
  const remainingPool = [...remainingDrawable, ...showcasePool].sort(() => Math.random() - 0.5);

  let poolIdx = 0;
  for (let i = 0; i < totalBoxes; i++) {
    if (i !== winningIndex) {
      state.boxAssignments[i] = remainingPool[poolIdx++] || wonPrize;
    }
  }
}

// -------------------------------------------------------------
// 10. UNBOXING & FLOATING BUTTON DIRECTLY UNDER PRIZE
// -------------------------------------------------------------
function openWinningBox(boxIndex) {
  const boxEl = dom.boxesContainer.children[boxIndex];
  const prize = state.wonPrize;

  const titleEl = document.getElementById(`box-title-${boxIndex}`);
  const mediaContainer = document.getElementById(`box-media-${boxIndex}`);
  const tagEl = document.getElementById(`box-tag-${boxIndex}`);

  titleEl.textContent = prize.name;
  tagEl.textContent = 'YOU WON THIS!';
  tagEl.className = 'box-state-tag tag-won';

  if (prize.image) {
    mediaContainer.innerHTML = `<img src="${prize.image}" alt="${prize.name}" class="box-prize-img" />`;
  } else {
    mediaContainer.innerHTML = `<div class="prize-icon-display">${prize.icon || '🎁'}</div>`;
  }

  // 3D Flip
  boxEl.classList.add('is-opened', 'winner-box');

  // Trigger celebration confetti
  triggerGiftSprinklers(boxEl);
  sounds.playFanfare();

  // Status updates
  if (dom.drawStatusPill) dom.drawStatusPill.className = 'badge-status draw-finished';
  if (dom.drawStatusText) dom.drawStatusText.textContent = `Won: ${prize.name}!`;
  dom.instructionsText.innerHTML = `You opened Box #${boxIndex + 1} and won <strong>${prize.name}</strong>!`;

  // Show victory toast
  dom.winToastTitle.textContent = prize.name;
  dom.winBanner.classList.remove('hidden');

  // Action button appears directly UNDER the drawn prize
  setTimeout(() => {
    dom.belowGiftActionDock.classList.remove('hidden', 'disappearing');
  }, 400);
}

function triggerGiftSprinklers(boxEl) {
  if (typeof confetti !== 'function') return;

  const rect = boxEl.getBoundingClientRect();
  const originX = (rect.left + rect.width / 2) / window.innerWidth;
  const originY = (rect.top + rect.height * 0.45) / window.innerHeight;

  confetti({
    particleCount: 45,
    spread: 60,
    startVelocity: 30,
    ticks: 100,
    origin: { x: originX, y: originY },
    colors: ['#0284c7', '#38bdf8', '#0ea5e9', '#ffffff', '#ffd700']
  });
}

function recordDrawParticipation(boxIndex, prize) {
  try {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const historyItem = {
      id: 'draw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: now.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      isoDate: now.toISOString(),
      dateStr: dateStr, // "2026-10-31" for instant exact date filtering
      phone: state.currentUser ? state.currentUser.phone : 'Walk-in Customer',
      bill: state.currentUser ? state.currentUser.bill : 'N/A',
      prizeName: prize.name,
      prizeImage: prize.image || '',
      prizeIcon: prize.icon || '🎁',
      boxIndex: boxIndex,
      status: 'Handed Over'
    };

    let history = [];
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) history = JSON.parse(raw);
    history.unshift(historyItem);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Error logging draw:', e);
  }
}

// -------------------------------------------------------------
// 11. BUTTON DISAPPEARS -> ZOOM-OUT -> SEQUENTIAL REVEAL ALL
// -------------------------------------------------------------
function handleShowAllGifts() {
  if (state.hasRevealedAll) return;
  state.hasRevealedAll = true;

  sounds.playClick();

  // 1. BUTTON DISAPPEARS IMMEDIATELY
  dom.belowGiftActionDock.classList.add('disappearing');
  setTimeout(() => {
    dom.belowGiftActionDock.classList.add('hidden');
  }, 180);

  // Dismiss top toast
  dom.winBanner.classList.add('hidden');

  // 2. CAMERA SMOOTHLY ZOOMS OUT TO FULL 3x3 GRID
  dom.boxesContainer.style.transform = 'translate(0px, 0px) scale(1)';

  // Remove dimming from all boxes
  Array.from(dom.boxesContainer.children).forEach(b => {
    b.classList.remove('dimmed-box');
  });

  dom.instructionsText.innerHTML = `Revealing all remaining gifts...`;

  // 3. AFTER ZOOM-OUT SETTLES, REVEAL REMAINING BOXES SEQUENTIALLY
  setTimeout(() => {
    const unopenedIndices = [];
    for (let i = 0; i < state.totalBoxes; i++) {
      if (i !== state.chosenBoxIndex) {
        unopenedIndices.push(i);
      }
    }

    unopenedIndices.forEach((idx, step) => {
      setTimeout(() => {
        revealUnopenedBox(idx);
        sounds.playPop();

        // When the final box opens, pop up the "Start New Draw" bar
        if (step === unopenedIndices.length - 1) {
          setTimeout(() => {
            dom.instructionsText.innerHTML = `✨ All ${state.totalBoxes} gifts revealed!`;
            dom.tvNewDrawBar.classList.remove('hidden');
          }, 350);
        }
      }, step * 160);
    });
  }, 650);
}

function revealUnopenedBox(boxIndex) {
  const boxEl = dom.boxesContainer.children[boxIndex];
  const prize = state.boxAssignments[boxIndex];

  const titleEl = document.getElementById(`box-title-${boxIndex}`);
  const mediaContainer = document.getElementById(`box-media-${boxIndex}`);
  const tagEl = document.getElementById(`box-tag-${boxIndex}`);

  titleEl.textContent = prize.name;

  if (prize.image) {
    mediaContainer.innerHTML = `<img src="${prize.image}" alt="${prize.name}" class="box-prize-img" />`;
  } else {
    mediaContainer.innerHTML = `<div class="prize-icon-display">${prize.icon || '🎁'}</div>`;
  }

  if (prize.type === 'grand' || prize.type === 'mega') {
    boxEl.classList.add('grand-showcase-box');
    tagEl.textContent = 'SHOWCASE';
    tagEl.className = 'box-state-tag tag-grand';
  } else {
    tagEl.textContent = 'MISSED';
    tagEl.className = 'box-state-tag tag-missed';
  }

  boxEl.classList.add('is-opened');
}
