/**
 * =================================================================
 * AGARWAL COMPUTERS - TV SHOWROOM & HIGH-END LUCKY DRAW SYSTEM
 * Flow Sequence:
 * 1. Screen Zooms In smoothly on selected box.
 * 2. Box 3D flips open + champagne sprinkler fountain.
 * 3. In-view "Reveal Other Boxes" button appears right beside/under box.
 * 4. User clicks button:
 *    - Button instantly vanishes!
 *    - Screen smoothly zooms out to 3x3 overview.
 *    - Other 8 boxes open one-by-one sequentially!
 * 5. "Start New Draw" pops down at the top for next customer!
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
    osc.frequency.exponentialRampToValueAtTime(840, this.ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.07);
  }

  playZoom() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  playPop() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(980, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
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

      gain.gain.setValueAtTime(0.22, startTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + i * 0.1 + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime + i * 0.1);
      osc.stop(startTime + i * 0.1 + 0.6);
    });
  }
}

const sounds = new SoundManager();

// -------------------------------------------------------------
// 2. MASTER PRIZES & RIGGED SHOWCASE SETUP
// -------------------------------------------------------------
const STORAGE_KEYS = {
  PRIZES: 'lucky_draw_master_prizes',
  HISTORY: 'lucky_draw_history'
};

const DEFAULT_MASTER_PRIZES = {
  showcase: [
    {
      id: 'grand',
      name: 'iPhone 16 Pro Max',
      image: '',
      icon: '📱',
      type: 'grand',
      badgeText: '👑 GRAND SHOWCASE',
      tag: 'Grand Showcase Item'
    },
    {
      id: 'mega',
      name: '$5,000 Gold Gift Card',
      image: '',
      icon: '💎',
      type: 'mega',
      badgeText: '💎 MEGA SHOWCASE',
      tag: 'Mega Showcase Item'
    }
  ],
  drawable: [
    { id: 'p1', name: 'Price 1', image: '', icon: '🎁', tag: 'Standard Reward' },
    { id: 'p2', name: 'Price 2', image: '', icon: '🎧', tag: 'Standard Reward' },
    { id: 'p3', name: 'Price 3', image: '', icon: '⌚', tag: 'Standard Reward' },
    { id: 'p4', name: 'Price 4', image: '', icon: '🛍️', tag: 'Standard Reward' },
    { id: 'p5', name: 'Price 5', image: '', icon: '☕', tag: 'Standard Reward' },
    { id: 'p6', name: 'Price 6', image: '', icon: '🎟️', tag: 'Standard Reward' },
    { id: 'p7', name: 'Price 7', image: '', icon: '💳', tag: 'Standard Reward' }
  ]
};

function getActivePrizes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRIZES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.showcase && parsed.drawable) return parsed;
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
  checkExistingSession();
});

function setupEventListeners() {
  dom.loginForm.addEventListener('submit', handleLoginSubmit);

  dom.soundToggleBtn.addEventListener('click', () => {
    const isEnabled = sounds.toggle();
    dom.soundIcon.textContent = isEnabled ? '🔊' : '🔇';
    dom.soundToggleBtn.querySelector('.btn-text').textContent = isEnabled ? 'Sound ON' : 'Sound OFF';
    sounds.playClick();
  });

  dom.resetSessionBtn.addEventListener('click', () => {
    sounds.playClick();
    if (confirm('Log out from Agarwal Computers Lucky Draw?')) {
      resetSession();
    }
  });

  // Button directly down from gift ("SHOW ALL GIFTS")
  dom.showAllGiftsBtn.addEventListener('click', handleShowAllGifts);

  // New Draw Pop-Down Button ("Start New Draw")
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
// 6. LOGIN / VERIFICATION (Step 1)
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

  dom.displayPhone.textContent = phone;
  dom.displayBill.textContent = bill;

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
  }, 200);
}

function checkExistingSession() {
  const savedUser = localStorage.getItem('lucky_draw_user');
  if (savedUser) {
    try {
      state.currentUser = JSON.parse(savedUser);
      dom.displayPhone.textContent = state.currentUser.phone;
      dom.displayBill.textContent = state.currentUser.bill;
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
// 7. LUCKY DRAW ARENA & BOX GENERATION (Step 2)
// -------------------------------------------------------------
function initLuckyDrawBoxes() {
  dom.boxesContainer.innerHTML = '';
  dom.boxesContainer.style.transform = 'translate(0px, 0px) scale(1)';

  state.hasDrawn = false;
  state.chosenBoxIndex = null;
  state.wonPrize = null;
  state.boxAssignments = new Array(9).fill(null);
  state.hasRevealedAll = false;

  dom.drawStatusPill.className = 'badge-status draw-ready';
  dom.drawStatusText.textContent = 'Pick 1 Box to Open';
  dom.instructionsText.innerHTML = 'Select any <strong>1 of the 9 executive gift boxes</strong> below to reveal your prize!';
  
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
      <!-- FRONT FACE -->
      <div class="box-face box-front">
        <div class="ribbon-vertical"></div>
        <div class="ribbon-horizontal"></div>
        <div class="gift-bow-badge">${index + 1}</div>
        <div class="box-label-text">Box #${index + 1}</div>
      </div>

      <!-- BACK FACE -->
      <div class="box-face box-back" id="box-back-${index}">
        <span class="box-state-tag" id="box-tag-${index}">REVEALED</span>
        
        <div class="prize-media-container" id="box-media-${index}">
          <div class="prize-icon-display" id="box-icon-${index}">🎁</div>
        </div>

        <h4 class="prize-title-display" id="box-title-${index}">Prize</h4>
        <small class="box-tag">Box #${index + 1}</small>
      </div>
    </div>
  `;

  boxItem.addEventListener('click', () => handleBoxClick(index));
  return boxItem;
}

// -------------------------------------------------------------
// 8. SCREEN ZOOM-IN & CINEMATIC UNBOXING
// -------------------------------------------------------------
function handleBoxClick(boxIndex) {
  if (state.hasDrawn) return;

  const boxEl = dom.boxesContainer.children[boxIndex];
  if (!boxEl || boxEl.classList.contains('is-opened')) return;

  state.hasDrawn = true;
  state.chosenBoxIndex = boxIndex;

  sounds.playClick();
  sounds.playZoom();

  // Dim other 8 boxes for focus
  Array.from(dom.boxesContainer.children).forEach(b => {
    b.classList.remove('can-pick');
    if (b !== boxEl) {
      b.classList.add('dimmed-box');
    }
  });

  // Calculate coordinates to zoom screen directly into the clicked box
  zoomToBox(boxEl);

  // Distribute prizes (guaranteed Price 1-7, showcase in remaining 8)
  distributePrizes(boxIndex);

  // After camera zoom settles (600ms), animate box opening
  setTimeout(() => {
    openWinningBox(boxIndex);
  }, 600);
}

function zoomToBox(boxEl) {
  const vpRect = dom.boxesViewport.getBoundingClientRect();
  const boxRect = boxEl.getBoundingClientRect();

  const vpCenterX = vpRect.left + vpRect.width / 2;
  const vpCenterY = vpRect.top + vpRect.height / 2;

  const boxCenterX = boxRect.left + boxRect.width / 2;
  const boxCenterY = boxRect.top + boxRect.height / 2;

  const scale = window.innerWidth < 650 ? 1.4 : 1.65;
  const deltaX = (vpCenterX - boxCenterX);
  const deltaY = (vpCenterY - boxCenterY);

  dom.boxesContainer.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
}

function distributePrizes(winningIndex) {
  const master = getActivePrizes();
  const drawablePool = master.drawable;
  const showcasePool = master.showcase;

  const drawableShuffled = [...drawablePool].sort(() => Math.random() - 0.5);
  const wonPrize = drawableShuffled[0];
  state.wonPrize = wonPrize;
  state.boxAssignments[winningIndex] = wonPrize;

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
// 9. UNBOXING, SPRINKLERS & FLOATING BUTTON APPEARANCE
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

  // 3D Box Open
  boxEl.classList.add('is-opened', 'winner-box');

  // Champagne sprinklers fountain
  triggerGiftSprinklers(boxEl);
  sounds.playFanfare();

  // Record participation
  recordDrawParticipation(boxIndex, prize);

  // Status update
  dom.drawStatusPill.className = 'badge-status draw-finished';
  dom.drawStatusText.textContent = `Won: ${prize.name}!`;
  dom.instructionsText.innerHTML = `You opened Box #${boxIndex + 1} and won <strong>${prize.name}</strong>!`;

  // Show victory toast
  dom.winToastTitle.textContent = prize.name;
  dom.winBanner.classList.remove('hidden');

  // ACTION BUTTON DOWN FROM GIFT: Appears smoothly below the gift
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
    particleCount: 50,
    spread: 55,
    startVelocity: 35,
    ticks: 120,
    origin: { x: originX, y: originY },
    colors: ['#2563eb', '#38bdf8', '#60a5fa', '#ffffff', '#1d4ed8']
  });

  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 75,
      startVelocity: 25,
      ticks: 90,
      origin: { x: originX, y: originY },
      colors: ['#2563eb', '#ffffff', '#93c5fd']
    });
  }, 160);
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
// 10. BUTTON DISAPPEARS -> ZOOM-OUT -> SEQUENTIAL REVEAL -> NEW DRAW BAR
// -------------------------------------------------------------
function handleShowAllGifts() {
  if (state.hasRevealedAll) return;
  state.hasRevealedAll = true;

  sounds.playClick();

  // 1. BUTTON DISAPPEARS IMMEDIATELY!
  dom.belowGiftActionDock.classList.add('disappearing');
  setTimeout(() => {
    dom.belowGiftActionDock.classList.add('hidden');
  }, 200);

  // Dismiss top toast
  dom.winBanner.classList.add('hidden');

  // 2. SMOOTH CAMERA ZOOM-OUT to full 3x3 overview
  dom.boxesContainer.style.transform = 'translate(0px, 0px) scale(1)';

  // Remove dimming from all 8 boxes
  Array.from(dom.boxesContainer.children).forEach(b => {
    b.classList.remove('dimmed-box');
  });

  dom.instructionsText.innerHTML = `Revealing all boxes sequentially...`;

  // 3. AFTER ZOOM-OUT SETTLES (750ms), REVEAL REMAINING 8 BOXES ONE BY ONE
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

        // When the final (8th) box opens, pop down the "Start New Draw" bar!
        if (step === unopenedIndices.length - 1) {
          setTimeout(() => {
            dom.instructionsText.innerHTML = `✨ All 9 gifts revealed!`;
            dom.tvNewDrawBar.classList.remove('hidden');
          }, 350);
        }
      }, step * 240); // 240ms interval between each box opening
    });
  }, 750);
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

  if (prize.type === 'grand') {
    boxEl.classList.add('grand-showcase-box');
    tagEl.textContent = prize.badgeText || 'GRAND SHOWCASE';
    tagEl.className = 'box-state-tag tag-grand';
  } else if (prize.type === 'mega') {
    boxEl.classList.add('mega-showcase-box');
    tagEl.textContent = prize.badgeText || 'MEGA SHOWCASE';
    tagEl.className = 'box-state-tag tag-mega';
  } else {
    tagEl.textContent = 'MISSED GIFT';
    tagEl.className = 'box-state-tag tag-missed';
  }

  boxEl.classList.add('is-opened');
}
