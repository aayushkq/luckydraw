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
  PRIZES: 'agarwal_master_prizes_v2026_real_v3',
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

function getActivePrizes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRIZES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.showcase && parsed.drawable && parsed.drawable.length >= 7) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading master prizes:', err);
  }
  return JSON.parse(JSON.stringify(DEFAULT_MASTER_PRIZES));
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
  hasRevealedAll: false
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
// 6. LOGIN VIEW: LONG CONTINUOUS MARQUEE RIBBON (RIGHT TO LEFT)
// -------------------------------------------------------------
function renderLoginMarquee() {
  if (!dom.loginMarqueeTrack) return;

  const master = getActivePrizes();
  const allPrizes = [...master.showcase, ...master.drawable];

  // Repeat 4 times so track is over 5,000px long, fitting ANY screen ratio (Ultrawide, 4K, Laptop, Mobile)
  let html = '';
  for (let repeat = 0; repeat < 4; repeat++) {
    allPrizes.forEach(p => {
      html += `
        <div class="marquee-card">
          <div class="marquee-card-img-wrap">
            ${p.image 
              ? `<img src="${p.image}" alt="${p.name}" class="marquee-card-img" />` 
              : `<span class="marquee-card-icon">${p.icon || '🎁'}</span>`}
          </div>
          <div class="marquee-card-info">
            <span class="marquee-card-name">${p.name}</span>
            <span class="marquee-card-sub">${p.type === 'grand' || p.type === 'mega' ? 'Showcase Item' : 'Store Reward'}</span>
          </div>
        </div>
      `;
    });
  }

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
  dom.boxesContainer.innerHTML = '';
  dom.boxesContainer.style.transform = 'translate(0px, 0px) scale(1)';

  state.hasDrawn = false;
  state.chosenBoxIndex = null;
  state.wonPrize = null;
  state.boxAssignments = new Array(9).fill(null);
  state.hasRevealedAll = false;

  if (dom.drawStatusPill) dom.drawStatusPill.className = 'badge-status draw-ready';
  if (dom.drawStatusText) dom.drawStatusText.textContent = 'Pick 1 Box';
  dom.instructionsText.innerHTML = 'Select any <strong>1 of the 9 gift boxes</strong> below to reveal your prize!';
  
  dom.belowGiftActionDock.classList.add('hidden');
  dom.belowGiftActionDock.classList.remove('disappearing');
  dom.tvNewDrawBar.classList.add('hidden');
  dom.winBanner.classList.add('hidden');

  for (let i = 0; i < 9; i++) {
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

  // Animate 3D unboxing after camera settles
  setTimeout(() => {
    openWinningBox(boxIndex);
  }, 550);
}

function zoomToBox(boxEl) {
  const vpRect = dom.boxesViewport.getBoundingClientRect();
  const boxRect = boxEl.getBoundingClientRect();

  const vpCenterX = vpRect.left + vpRect.width / 2;
  const vpCenterY = vpRect.top + vpRect.height / 2;

  const boxCenterX = boxRect.left + boxRect.width / 2;
  const boxCenterY = boxRect.top + boxRect.height / 2;

  // Well-proportioned scale
  const scale = window.innerWidth < 650 ? 1.35 : 1.52;
  const deltaX = (vpCenterX - boxCenterX);
  const deltaY = (vpCenterY - boxCenterY);

  dom.boxesContainer.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
}

function distributePrizes(winningIndex) {
  const master = getActivePrizes();
  const drawablePool = master.drawable;
  const showcasePool = master.showcase;

  // Winner strictly receives one of the 7 drawable items
  const drawableShuffled = [...drawablePool].sort(() => Math.random() - 0.5);
  const wonPrize = drawableShuffled[0];
  state.wonPrize = wonPrize;
  state.boxAssignments[winningIndex] = wonPrize;

  // The remaining 8 boxes contain the other 6 drawable + 2 showcase items
  const remainingDrawable = drawableShuffled.slice(1);
  const remaining8Pool = [...remainingDrawable, ...showcasePool].sort(() => Math.random() - 0.5);

  let poolIdx = 0;
  for (let i = 0; i < 9; i++) {
    if (i !== winningIndex) {
      state.boxAssignments[i] = remaining8Pool[poolIdx++];
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

  // Record participation
  recordDrawParticipation(boxIndex, prize);

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
    const historyItem = {
      timestamp: new Date().toLocaleString(),
      phone: state.currentUser ? state.currentUser.phone : 'Anonymous',
      bill: state.currentUser ? state.currentUser.bill : 'N/A',
      prizeName: prize.name,
      prizeImage: prize.image || '',
      boxIndex: boxIndex
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

  // 3. AFTER ZOOM-OUT SETTLES, REVEAL REMAINING 8 BOXES SEQUENTIALLY
  setTimeout(() => {
    const unopenedIndices = [];
    for (let i = 0; i < 9; i++) {
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
            dom.instructionsText.innerHTML = `✨ All 9 gifts revealed!`;
            dom.tvNewDrawBar.classList.remove('hidden');
          }, 350);
        }
      }, step * 220);
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
