// ════════════════════════════════════════════════════════════
//  ECUAD LIBRARY KIOSK — app.js
//  All screens · Inter design system · ECUAD brand colours
// ════════════════════════════════════════════════════════════

// ── Idle timer ────────────────────────────────────────────────
let idleTimer = null;
const IDLE_MS = 60000;

function showIdleOverlay() {
  if (document.getElementById('idle-overlay')) return;
  // Sign out current user when kiosk goes idle
  currentUser = null;
  const overlay = document.createElement('div');
  overlay.id = 'idle-overlay';
  overlay.className = 'idle-screen';
  overlay.innerHTML = `
    <p class="idle-eyebrow">Emily Carr University · Library</p>
    <h1 class="idle-headline">ECU<br><span class="hl-teal">LIBRARY</span></h1>
    <div class="idle-divider"></div>
    <p class="idle-cta">Tap anywhere to start</p>
    <div class="idle-bar"><span></span><span></span><span></span></div>
  `;
  overlay.addEventListener('click', () => { overlay.remove(); Router.go('home'); });
  document.getElementById('app').appendChild(overlay);
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(showIdleOverlay, IDLE_MS);
}

document.addEventListener('touchstart', () => {
  const ov = document.getElementById('idle-overlay');
  if (ov) { ov.remove(); Router.go('home'); return; }
  resetIdleTimer();
}, { passive: true });

document.addEventListener('mousedown', resetIdleTimer);

// Keep the latest RFID card in memory so routes can prefill from scans.
let lastScannedCardId = '';
let currentUser = null;

const DEMO_USERS_BY_CARD = {
  '08007828B7': { id: 'u-001', name: 'Ken Wan',        program: 'Interaction Design', photo: 'assets/Ken-Wan.png' },
  '08006F1759': { id: 'u-002', name: 'Max McDonough',  program: 'Interaction Design', photo: 'assets/Max-McDonough.png' },
};

function normalizeCardId(value) {
  return String(value || '').replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}

function resolveUserFromCard(cardId) {
  const normalized = normalizeCardId(cardId);
  if (!normalized) return null;

  if (DEMO_USERS_BY_CARD[normalized]) {
    return { ...DEMO_USERS_BY_CARD[normalized], cardId: normalized };
  }

  return {
    id: 'guest-' + normalized.slice(-4),
    name: 'Guest ' + normalized.slice(-4),
    program: 'Library User',
    cardId: normalized,
  };
}

function showScanToast(message) {
  const existing = document.getElementById('rfid-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'rfid-toast';
  toast.textContent = message;
  toast.style.cssText = [
    'position:fixed',
    'top:14px',
    'right:14px',
    'z-index:9999',
    'background:#111827',
    'color:#fff',
    'padding:10px 14px',
    'border-radius:10px',
    'font:600 14px/1.2 Inter,system-ui,sans-serif',
    'box-shadow:0 8px 20px rgba(0,0,0,0.25)',
  ].join(';');

  document.body.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 2200);
}

window.addEventListener('rfid:scan', e => {
  const cardId = normalizeCardId(e && e.detail && e.detail.id ? String(e.detail.id) : '');
  if (!cardId) return;

  lastScannedCardId = cardId;
  currentUser = resolveUserFromCard(cardId);
  showScanToast('Signed in: ' + currentUser.name);

  const homeSub = document.querySelector('.home-sub');
  if (homeSub) homeSub.textContent = 'Signed in: ' + currentUser.name;

  // Avoid force re-rendering the current screen on every scan,
  // which can feel glitchy during touch interactions.
  if (Router.current() === 'profile') {
    Router.go('profile');
  }
});


// ── Bottom nav builder ────────────────────────────────────────
// activeItem: 'home' | 'profile' | 'help' — highlights the active tab
function makeBottomNav(activeItem = 'home') {
  const nav = document.createElement('div');
  nav.className = 'bottom-nav';

  const items = [
    { id: 'home',    icon: '⌂',  label: 'Home',    route: 'home'    },
    { id: 'profile', icon: '◉',  label: currentUser ? 'Signed In' : 'Profile', route: 'profile' },
    { id: 'help',    icon: '?',  label: 'Get Help', route: 'help'   },
  ];

  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'nav-item' + (item.id === activeItem ? ' active' : '');
    btn.innerHTML = `
      <span class="nav-item-icon">${item.icon}</span>
      <span class="nav-item-label">${item.label}</span>
    `;
    btn.addEventListener('click', () => Router.go(item.route));
    nav.appendChild(btn);
  });

  return nav;
}


// ── Touch scroll (RPi Chromium fix) ───────────────────────────
// RPi Chromium kiosk doesn't honour native touch-action:pan-y when
// overflow:hidden is on html/body. This global IIFE manually drives
// scrollTop/scrollLeft on the nearest scrollable ancestor.
//
// KEY POINTS:
//  • touchmove uses { passive:false } so we can call preventDefault(),
//    preventing Chromium from swallowing the event as a page gesture.
//  • Detection uses known CSS class names first (reliable on old Blink),
//    then falls back to computed overflowY check.
(function () {
  // Every scrollable container class in this app:
  var SCROLL_Y_CLASSES = [
    'screen-body', 'home-scroll', 'results-area', 'book-list-area',
    'doc-list-scroll', 'feedback-body', 'charge-list-scroll', 'wizard-body-scroll'
  ];
  var SCROLL_X_CLASSES = ['stack-filter-row'];

  var startY = 0, startX = 0, scrollEl = null, scrollAxis = 'y';

  function getScrollParent(el) {
    while (el && el !== document.body) {
      var cl = el.classList;
      if (cl) {
        if (SCROLL_Y_CLASSES.some(function(c){ return cl.contains(c); }) &&
            el.scrollHeight > el.clientHeight + 1) return { el: el, axis: 'y' };
        if (SCROLL_X_CLASSES.some(function(c){ return cl.contains(c); }) &&
            el.scrollWidth  > el.clientWidth  + 1) return { el: el, axis: 'x' };
      }
      // Fallback: check computed style
      try {
        var oy = window.getComputedStyle(el).overflowY;
        if ((oy === 'auto' || oy === 'scroll' || oy === 'overlay') &&
             el.scrollHeight > el.clientHeight + 1) return { el: el, axis: 'y' };
        var ox = window.getComputedStyle(el).overflowX;
        if ((ox === 'auto' || ox === 'scroll' || ox === 'overlay') &&
             el.scrollWidth  > el.clientWidth  + 1) return { el: el, axis: 'x' };
      } catch(e) {}
      el = el.parentElement;
    }
    return null;
  }

  document.addEventListener('touchstart', function (e) {
    var f = getScrollParent(e.target);
    scrollEl   = f ? f.el   : null;
    scrollAxis = f ? f.axis : 'y';
    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!scrollEl) return;
    e.preventDefault(); // stops Chromium treating this as a page-level gesture
    var t = e.touches[0];
    if (scrollAxis === 'y') { scrollEl.scrollTop  += startY - t.clientY; startY = t.clientY; }
    else                    { scrollEl.scrollLeft += startX - t.clientX; startX = t.clientX; }
  }, { passive: false }); // must be non-passive to allow preventDefault

  document.addEventListener('touchend',    function () { scrollEl = null; }, { passive: true });
  document.addEventListener('touchcancel', function () { scrollEl = null; }, { passive: true });
})();

// No-op kept so existing enableTouchScroll() call sites don't break.
function enableTouchScroll() {}

// ── Scroll hint ───────────────────────────────────────────────
// Shows a gradient fade + bouncing chevron at the bottom of `screen`
// and hides it the moment the user scrolls `scrollEl`.
function addScrollHint(screen, scrollEl, colorClass) {
  const hint = document.createElement('div');
  hint.className = 'scroll-hint' + (colorClass ? ' ' + colorClass : '');
  hint.innerHTML = '<svg class="scroll-hint-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 329.97 176.3" aria-hidden="true"><path fill="currentColor" d="M322.85,98.56l-153.29,76.64c-2.96,1.48-6.19,1.45-9.14-.02L6.26,98.1C2.94,96.44.04,93.08.04,89.17l-.04-79.4C1.1,3.2,8.42-2.26,14.85.94l150.17,74.99L315.42.75c3.32-1.66,7.27-.26,10.01,1.62,2.38,1.63,4.55,4.79,4.54,8.38l-.04,78.39c0,4.34-3.26,7.51-7.09,9.42Z"/></svg>';
  screen.appendChild(hint);
  scrollEl.addEventListener('scroll', () => hint.classList.add('hidden'), { once: true, passive: true });
}


// ════════════════════════════════════════════════════════════
//  HOME
// ════════════════════════════════════════════════════════════

Router.register('home', () => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  screen.innerHTML = `
    <div class="home-header">
      <span class="home-logo">ECU Library</span>
      <span class="home-sub">${currentUser ? 'Signed in: ' + currentUser.name : 'Self-Service Kiosk'}</span>
    </div>
    <div class="home-scroll">
      <div class="home-grid">
        <button class="home-tile home-tile-teal" data-route="books">
          <span class="tile-name">FIND<br>A BOOK</span>
          <span class="tile-desc">Find your shelf in the stacks</span>
          <span class="tile-arrow">›</span>
        </button>
        <button class="home-tile home-tile-mag" data-route="print">
          <span class="tile-name">PRINTING<br>HELP</span>
          <span class="tile-desc">Step-by-step instructions</span>
          <span class="tile-arrow">›</span>
        </button>
        <button class="home-tile home-tile-lime" data-route="charge">
          <span class="tile-name">CHARGING<br>SPOTS</span>
          <span class="tile-desc">Find outlet or USB port</span>
          <span class="tile-arrow">›</span>
        </button>
        <button class="home-tile home-tile-purple" data-route="help">
          <span class="tile-name">GET<br>HELP</span>
          <span class="tile-desc">Speak to staff or find library info</span>
          <span class="tile-arrow">›</span>
        </button>
      </div>
      <div class="home-map-section">
        <p class="home-map-label">Library Map</p>
        <div class="home-map-wrap" id="home-map"></div>
      </div>
    </div>
  `;

  screen.querySelectorAll('[data-route]').forEach(btn => {
    btn.addEventListener('click', () => Router.go(btn.dataset.route));
  });

  Wayfinding.initialize(screen.querySelector('#home-map'), {
    onMarkerClick: room => {
      const STACK_FOR_ROOM = { 'room-8': 'E', 'room-9': 'D', 'room-10': 'C', 'room-11': 'B', 'room-12': 'A' };
      if (STACK_FOR_ROOM[room.id])         { Router.go('books',  { stack: STACK_FOR_ROOM[room.id] }); return; }
      if (room.markerType === 'printer')   { Router.go('print',  { printer: room.id }); return; }
      if (room.id === 'room-6')            { Router.go('charge', { spotId: 1 });        return; }
      if (room.id === 'room-7')            { Router.go('charge', { spotId: 2 });        return; }
      if (room.markerType === 'service')   { Router.go('help');   return; }
    }
  });
  enableTouchScroll(screen.querySelector('.home-scroll'));
  screen.appendChild(makeBottomNav('home'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  PRINTING HELP (sub-menu)
// ════════════════════════════════════════════════════════════

Router.register('print', ({ printer } = {}) => {
  const screen = document.createElement('div');
  screen.className = 'screen';
  const printerRoom = printer === 'computer-lab' ? 'computer-lab' : 'studio-a';

  screen.innerHTML = `
    <header class="feat-header neutral">
      <button class="btn-back" id="back-btn">‹</button>
      <span class="feat-title" style="color:var(--black)">Printing Help</span>
    </header>
    <div class="print-tiles">
      <button class="print-tile purple" data-route="print-guide">
        <span class="print-tile-name">PRINT<br>GUIDE</span>
        <span class="print-tile-desc">Step-by-step guide to printing</span>
        <span class="print-tile-arrow">›</span>
      </button>
      <button class="print-tile mag" data-route="print-docs">
        <span class="print-tile-name">PRINT<br>DOCS</span>
        <span class="print-tile-desc">Send a doc to the printers</span>
        <span class="print-tile-arrow">›</span>
      </button>
    </div>
    <div class="print-locations">
      <p class="section-label">Printer Locations — First Floor</p>
      <div class="map-wrap" id="print-map"></div>
    </div>
  `;

  screen.querySelector('#back-btn').addEventListener('click', () => Router.go('home'));
  screen.querySelectorAll('[data-route]').forEach(btn => {
    btn.addEventListener('click', () => Router.go(btn.dataset.route));
  });

  Wayfinding.initialize(screen.querySelector('#print-map'))
    .then(() => Wayfinding.drawRoute(printerRoom));
  screen.appendChild(makeBottomNav('home'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  PRINT GUIDE (step-by-step)
// ════════════════════════════════════════════════════════════

Router.register('print-guide', () => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  const steps = [
    { title: 'Connect to Library WiFi', body: 'Make sure your device is connected to ECUAD-Library. Look for it in your WiFi settings — no password required.' },
    { title: 'Go to the Print Portal', body: 'Open a browser and go to print.ecuad.ca or scan the QR code on the printer. Log in with your ECUAD student ID.' },
    { title: 'Upload Your Document', body: 'Tap "Upload File" and select your file. Supported formats: PDF, DOCX, JPEG, PNG. Maximum file size 50 MB.' },
    { title: 'Choose Print Settings', body: 'Select colour or black & white, number of copies, and paper size. Colour: $0.25/page · B&W: $0.10/page.' },
    { title: 'Confirm and Pay', body: 'Review your job and tap "Send to Printer". Payment is deducted from your print balance. Top up at the Library Desk.' },
    { title: 'Collect Your Print', body: 'Walk to the printer near the main entrance. Tap your student card on the reader. Jobs expire after 24 hours.' },
  ];

  screen.innerHTML = `
    <header class="feat-header purple">
      <button class="btn-back" id="back-btn">‹</button>
      <span class="feat-title">Print Guide</span>
    </header>
    <div class="screen-body">
      <div class="steps-list">
        ${steps.map((s, i) => `
          <div class="step-item">
            <div class="step-num purple-bg">${i + 1}</div>
            <div class="step-text">
              <div class="step-title">${s.title}</div>
              <div class="step-body">${s.body}</div>
            </div>
          </div>
        `).join('')}
        <div class="step-footer purple-bg">
          Still need help? Ask a staff member at the Library Desk.
        </div>
      </div>
    </div>
  `;

  screen.querySelector('#back-btn').addEventListener('click', () => Router.go('print'));
  enableTouchScroll(screen.querySelector('.screen-body'));
  screen.appendChild(makeBottomNav('home'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  PRINT DOCS — STEP 1: Find document by student ID
// ════════════════════════════════════════════════════════════

// Per-user queued documents — keyed by user id
const USER_DOCS = {
  'u-001': [  // Ken Wan
    { id: 1, name: 'Ken_Wan_Thesis_Proposal.pdf',         pages: 18, size: '2.4 MB', sent: '8:31 AM', ext: 'pdf' },
    { id: 2, name: 'Ken_Wan_UX_Research_Report.pdf',      pages: 12, size: '1.7 MB', sent: '8:44 AM', ext: 'pdf' },
    { id: 3, name: 'Ken_Wan_Interaction_Prototype.pdf',   pages: 6,  size: '3.1 MB', sent: '9:02 AM', ext: 'pdf' },
    { id: 4, name: 'Ken_Wan_Process_Journal.docx',        pages: 22, size: '0.8 MB', sent: '9:15 AM', ext: 'doc' },
    { id: 5, name: 'Wayfinding_System_Proposal.pdf',      pages: 8,  size: '4.2 MB', sent: '9:28 AM', ext: 'pdf' },
  ],
  'u-002': [  // Max McDonough
    { id: 1, name: 'Max_McDonough_Capstone_Brief.pdf',    pages: 10, size: '1.9 MB', sent: '8:38 AM', ext: 'pdf' },
    { id: 2, name: 'Max_McDonough_Exhibition_Poster.pdf', pages: 1,  size: '5.3 MB', sent: '8:52 AM', ext: 'pdf' },
    { id: 3, name: 'Max_McDonough_Studio_Critique.pdf',   pages: 4,  size: '0.6 MB', sent: '9:05 AM', ext: 'pdf' },
    { id: 4, name: 'Max_McDonough_Design_Manifesto.docx', pages: 3,  size: '0.4 MB', sent: '9:18 AM', ext: 'doc' },
    { id: 5, name: 'Service_Design_Research_v2.pdf',      pages: 14, size: '2.8 MB', sent: '9:33 AM', ext: 'pdf' },
  ],
  default: [
    { id: 1,  name: 'Final_Thesis_Draft.pdf',          pages: 24, size: '3.2 MB', sent: '8:41 AM', ext: 'pdf' },
    { id: 2,  name: 'Studio_Presentation_Final.pdf',   pages: 12, size: '1.8 MB', sent: '8:39 AM', ext: 'pdf' },
    { id: 3,  name: 'Exhibition_Poster_A3.pdf',        pages: 1,  size: '4.5 MB', sent: '9:02 AM', ext: 'pdf' },
    { id: 4,  name: 'Artist_Statement_v2.docx',        pages: 2,  size: '0.3 MB', sent: '9:00 AM', ext: 'doc' },
    { id: 5,  name: 'Reading_Response_Week8.pdf',      pages: 3,  size: '0.6 MB', sent: '7:55 AM', ext: 'pdf' },
    { id: 6,  name: 'Capstone_Project_Brief.pdf',      pages: 8,  size: '1.1 MB', sent: '9:15 AM', ext: 'pdf' },
  ],
};

function getDocsForUser() {
  if (currentUser && USER_DOCS[currentUser.id]) return USER_DOCS[currentUser.id];
  return USER_DOCS.default;
}

function makeWizardSteps(activeStep) {
  // activeStep: 1-based; connector lines drawn via CSS ::after
  const labels = ['Find Doc', 'Settings', 'Confirm'];
  return `
    <div class="wizard-steps">
      ${labels.map((l, i) => `
        <div class="wizard-step ${i + 1 === activeStep ? 'active' : i + 1 < activeStep ? 'done' : ''}">
          <div class="wizard-step-dot">${i + 1 < activeStep ? '✓' : i + 1}</div>
          <span class="wizard-step-label">${l}</span>
        </div>
      `).join('')}
    </div>
  `;
}

Router.register('print-docs', ({ cardId, source } = {}) => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  let searchQuery = '';
  let kbVisible = false;

  const EXT_ICON = { pdf: '📄', doc: '📝' };

  screen.innerHTML = `
    <header class="feat-header mag">
      <button class="btn-back" id="back-btn">‹</button>
      <span class="feat-title">Print Docs</span>
    </header>
    ${makeWizardSteps(1)}
    <div class="wizard-body">
      <div id="print-signin-area"></div>
    </div>
  `;

  screen.querySelector('#back-btn').addEventListener('click', () => {
    window.removeEventListener('rfid:scan', onScanWhileOnScreen);
    Router.go('print');
  });

  const wizardBody = screen.querySelector('.wizard-body');

  function renderPrintArea() {
    const area = screen.querySelector('#print-signin-area');
    if (!area) return;

    if (!currentUser) {
      area.innerHTML = `<p class="checkout-hint">Scan your library card to see your print queue.</p>`;
      return;
    }

    // User is signed in — show the full search + doc list UI
    area.innerHTML = `
      <div class="doc-search-bar">
        <div class="doc-search-field">
          <span class="doc-search-icon">🔍</span>
          <input class="doc-search-input" id="doc-search-input" type="text"
            placeholder="Search by file name..." readonly />
          <button class="doc-kb-toggle" id="doc-kb-toggle">⌨</button>
        </div>
      </div>
      <p class="doc-list-label">Queued documents for <strong>${currentUser.name}</strong> — tap one to select</p>
      <div class="doc-list-scroll" id="doc-list-area"></div>
      <div class="doc-keyboard-panel" id="doc-kb-panel" style="display:none"></div>
    `;

    const input    = area.querySelector('#doc-search-input');
    const listArea = area.querySelector('#doc-list-area');
    const kbPanel  = area.querySelector('#doc-kb-panel');
    const kbToggle = area.querySelector('#doc-kb-toggle');
    let kbVisible  = false;

    function renderDocs() {
      const docs = getDocsForUser();
      const q = searchQuery.toLowerCase().trim();
      const filtered = q ? docs.filter(d => d.name.toLowerCase().includes(q)) : docs;

      if (!filtered.length) {
        listArea.innerHTML = `<p class="doc-not-found">No documents match "<strong>${searchQuery}</strong>".<br>Make sure your file was sent to print@ecu.ca</p>`;
        return;
      }

      listArea.innerHTML = filtered.map(d => `
        <div class="doc-item" data-id="${d.id}">
          <div class="doc-icon">${EXT_ICON[d.ext] || '📄'}</div>
          <div class="doc-info">
            <div class="doc-name">${d.name}</div>
            <div class="doc-meta">${d.pages} page${d.pages !== 1 ? 's' : ''} · ${d.size} · Sent ${d.sent}</div>
          </div>
          <div class="doc-select-indicator">›</div>
        </div>
      `).join('');

      listArea.querySelectorAll('.doc-item').forEach(el => {
        el.addEventListener('click', () => {
          const doc = getDocsForUser().find(d => d.id === parseInt(el.dataset.id));
          Router.go('print-docs-settings', { doc });
        });
      });
    }

    input.addEventListener('input', e => { searchQuery = e.target.value; renderDocs(); });

    const kb = Keyboard.create(q => { searchQuery = q; input.value = q; renderDocs(); });
    kb.bindInput(input);
    kbPanel.appendChild(kb.el);

    kbToggle.addEventListener('click', () => {
      kbVisible = !kbVisible;
      kbPanel.style.display = kbVisible ? 'block' : 'none';
      kbToggle.classList.toggle('active', kbVisible);
    });

    area.querySelector('.doc-search-field').addEventListener('click', () => {
      if (!kbVisible) {
        kbVisible = true;
        kbPanel.style.display = 'block';
        kbToggle.classList.add('active');
      }
    });

    renderDocs();
  }

  function onScanWhileOnScreen() {
    if (!screen.isConnected) { window.removeEventListener('rfid:scan', onScanWhileOnScreen); return; }
    renderPrintArea();
  }
  window.addEventListener('rfid:scan', onScanWhileOnScreen);

  enableTouchScroll(screen.querySelector('.doc-list-scroll'));
  screen.appendChild(makeBottomNav('home'));
  renderPrintArea();
  return screen;
});


// ════════════════════════════════════════════════════════════
//  PRINT DOCS — STEP 2: Printer + settings
// ════════════════════════════════════════════════════════════

Router.register('print-docs-settings', ({ doc }) => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  const printers = [
    { id: 'pr1', name: 'Printer A — Near Entrance', status: 'ready',  statusLabel: 'Ready' },
    { id: 'pr2', name: 'Printer B — Study Area',    status: 'busy',   statusLabel: 'Busy'  },
  ];

  screen.innerHTML = `
    <header class="feat-header mag">
      <button class="btn-back" id="back-btn">‹</button>
      <span class="feat-title">Print Docs</span>
    </header>
    ${makeWizardSteps(2)}
    <div class="wizard-body wizard-body-scroll">
      <div class="settings-section">
        <p class="settings-section-title">Printer</p>
        <div class="printer-list">
          ${printers.map(p => `
            <div class="printer-item ${p.id === 'pr1' ? 'selected' : ''}" data-pid="${p.id}">
              <div class="printer-info">
                <div class="printer-name">${p.name}</div>
                <div class="printer-status ${p.status}">${p.statusLabel}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="settings-section">
        <p class="settings-section-title">Colour</p>
        <div class="toggle-group" id="colour-toggle">
          <button class="toggle-btn active" data-val="bw">Black &amp; White — $0.10/pg</button>
          <button class="toggle-btn" data-val="colour">Colour — $0.25/pg</button>
        </div>
      </div>

      <div class="settings-section">
        <p class="settings-section-title">Paper Size</p>
        <div class="toggle-group" id="size-toggle">
          <button class="toggle-btn active" data-val="letter">Letter (8.5×11)</button>
          <button class="toggle-btn" data-val="a3">A3 (11×17)</button>
        </div>
      </div>

      <div class="settings-section">
        <p class="settings-section-title">Copies</p>
        <div class="copies-control">
          <button class="copies-btn" id="copies-minus">−</button>
          <span class="copies-val" id="copies-val">1</span>
          <button class="copies-btn" id="copies-plus">+</button>
        </div>
      </div>

      <button class="btn-next-step" id="btn-next">Review &amp; Confirm ›</button>
    </div>
  `;

  screen.querySelector('#back-btn').addEventListener('click', () => Router.go('print-docs', {}));

  // Printer selection
  let selectedPrinter = printers[0];
  screen.querySelectorAll('.printer-item').forEach(el => {
    el.addEventListener('click', () => {
      screen.querySelectorAll('.printer-item').forEach(p => p.classList.remove('selected'));
      el.classList.add('selected');
      selectedPrinter = printers.find(p => p.id === el.dataset.pid);
    });
  });

  // Toggle groups
  function bindToggle(groupId) {
    const group = screen.querySelector('#' + groupId);
    group.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }
  bindToggle('colour-toggle');
  bindToggle('size-toggle');

  // Copies
  let copies = 1;
  screen.querySelector('#copies-minus').addEventListener('click', () => {
    if (copies > 1) { copies--; screen.querySelector('#copies-val').textContent = copies; }
  });
  screen.querySelector('#copies-plus').addEventListener('click', () => {
    if (copies < 10) { copies++; screen.querySelector('#copies-val').textContent = copies; }
  });

  screen.querySelector('#btn-next').addEventListener('click', () => {
    const colour = screen.querySelector('#colour-toggle .toggle-btn.active').dataset.val;
    const size = screen.querySelector('#size-toggle .toggle-btn.active').dataset.val;
    const pricePerPage = colour === 'colour' ? 0.25 : 0.10;
    const total = (pricePerPage * doc.pages * copies).toFixed(2);
    Router.go('print-docs-confirm', { doc, printer: selectedPrinter, colour, size, copies, total });
  });

  enableTouchScroll(screen.querySelector('.wizard-body-scroll'));
  screen.appendChild(makeBottomNav('home'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  PRINT DOCS — STEP 3: Confirm + send
// ════════════════════════════════════════════════════════════

Router.register('print-docs-confirm', ({ doc, printer, colour, size, copies, total }) => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  const colourLabel = colour === 'colour' ? 'Colour' : 'Black & White';
  const sizeLabel = size === 'a3' ? 'A3 (11×17)' : 'Letter (8.5×11)';

  screen.innerHTML = `
    <header class="feat-header mag">
      <button class="btn-back" id="back-btn">‹</button>
      <span class="feat-title">Print Docs</span>
    </header>
    ${makeWizardSteps(3)}
    <div class="wizard-body wizard-body-scroll">
      <div class="confirm-card">
        <div class="confirm-card-header">Review Your Print Job</div>
        <div class="confirm-row">
          <span class="confirm-row-label">Document</span>
          <span class="confirm-row-val">${doc.name}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-row-label">Pages</span>
          <span class="confirm-row-val">${doc.pages}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-row-label">Printer</span>
          <span class="confirm-row-val">${printer.name}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-row-label">Colour</span>
          <span class="confirm-row-val">${colourLabel}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-row-label">Paper Size</span>
          <span class="confirm-row-val">${sizeLabel}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-row-label">Copies</span>
          <span class="confirm-row-val">${copies}</span>
        </div>
        <div class="confirm-cost">
          <span class="confirm-cost-label">Total Cost</span>
          <span class="confirm-cost-amount">$${total}</span>
        </div>
        <p class="confirm-note">Cost will be deducted from your print balance. Top up at the Library Desk.</p>
      </div>
      <button class="btn-next-step" id="btn-send">🖨&nbsp; Send to Printer</button>
    </div>
  `;

  screen.querySelector('#back-btn').addEventListener('click', () =>
    Router.go('print-docs-settings', { doc })
  );

  screen.querySelector('#btn-send').addEventListener('click', () => {
    Router.go('print-docs-success', { doc, printer, colour, size, copies, total });
  });

  enableTouchScroll(screen.querySelector('.wizard-body-scroll'));
  screen.appendChild(makeBottomNav('home'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  PRINT DOCS — STEP 4: Success
// ════════════════════════════════════════════════════════════

Router.register('print-docs-success', ({ doc, printer, colour, size, copies, total }) => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  screen.innerHTML = `
    <header class="feat-header mag">
      <span class="feat-title">Print Docs</span>
    </header>
    <div class="screen-body">
      <div class="print-success">
        <div class="success-circle">✓</div>
        <h2 class="success-title">Sent to Printer!</h2>
        <p class="success-body">
          <strong>${doc.name}</strong> has been sent to <strong>${printer.name}</strong>.<br><br>
          Walk to the printer and tap your student card on the reader to release your job.
        </p>
        <button class="btn-next-step" id="btn-receipt" style="margin-bottom:10px;">View Receipt</button>
        <button class="btn-done" id="btn-done">Done — Back to Home</button>
      </div>
      <p class="map-section-label" style="padding: 0 14px 8px; color: var(--mag);">Printer Location — First Floor</p>
      <div class="map-wrap" id="success-map" style="margin:0 14px 14px;border-radius:10px;overflow:hidden;"></div>
    </div>
  `;

  screen.querySelector('#btn-receipt').addEventListener('click', () =>
    Router.go('print-receipt', { doc, printer, colour, size, copies, total })
  );
  screen.querySelector('#btn-done').addEventListener('click', () =>
    Router.go('print-feedback')
  );
  enableTouchScroll(screen.querySelector('.screen-body'));
  Wayfinding.initialize(screen.querySelector('#success-map'))
    .then(() => Wayfinding.drawRoute('studio-a'));
  screen.appendChild(makeBottomNav('home'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  PRINT RECEIPT
// ════════════════════════════════════════════════════════════

Router.register('print-receipt', ({ doc, printer, colour, size, copies, total }) => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  const colourLabel = colour === 'colour' ? 'Colour' : 'Black & White';
  const sizeLabel   = size === 'a3' ? 'A3 (11×17)' : 'Letter (8.5×11)';
  const userName    = currentUser ? currentUser.name : 'Guest';

  screen.innerHTML = `
    <header class="feat-header mag">
      <button class="btn-back" id="back-btn">‹</button>
      <span class="feat-title">Receipt</span>
    </header>
    <div class="screen-body">
      <div class="receipt-card">
        <div class="receipt-logo">ECU Library</div>
        <div class="receipt-subtitle">Print Confirmation</div>
        <div class="receipt-divider"></div>
        <div class="receipt-row"><span>Student</span><span>${userName}</span></div>
        <div class="receipt-row"><span>Date</span><span>${dateStr}</span></div>
        <div class="receipt-row"><span>Time</span><span>${timeStr}</span></div>
        <div class="receipt-divider"></div>
        <div class="receipt-row"><span>Document</span><span class="receipt-doc-name">${doc.name}</span></div>
        <div class="receipt-row"><span>Pages</span><span>${doc.pages}</span></div>
        <div class="receipt-row"><span>Copies</span><span>${copies}</span></div>
        <div class="receipt-row"><span>Colour</span><span>${colourLabel}</span></div>
        <div class="receipt-row"><span>Paper</span><span>${sizeLabel}</span></div>
        <div class="receipt-row"><span>Printer</span><span>${printer.name}</span></div>
        <div class="receipt-divider"></div>
        <div class="receipt-total"><span>Total Charged</span><span>$${total}</span></div>
        <div class="receipt-note">Deducted from your print balance.<br>Top up at the Library Desk.</div>
      </div>
      <button class="btn-next-step" id="btn-feedback" style="margin: 0 14px 14px;">Leave Feedback</button>
      <button class="btn-done" id="btn-home" style="margin: 0 14px 20px;">Done — Back to Home</button>
    </div>
  `;

  screen.querySelector('#back-btn').addEventListener('click', () => Router.go('print-docs-success', { doc, printer, colour, size, copies, total }));
  screen.querySelector('#btn-feedback').addEventListener('click', () => Router.go('print-feedback'));
  screen.querySelector('#btn-home').addEventListener('click', () => Router.go('home'));
  enableTouchScroll(screen.querySelector('.screen-body'));
  screen.appendChild(makeBottomNav('home'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  PRINT FEEDBACK
// ════════════════════════════════════════════════════════════

Router.register('print-feedback', () => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  screen.innerHTML = `
    <header class="feat-header mag">
      <span class="feat-title">Feedback</span>
    </header>
    <div class="feedback-body">
      <div class="feedback-question">How was your printing experience?</div>
      <div class="feedback-emojis">
        <button class="feedback-emoji-btn" data-val="5">😊<span>Great</span></button>
        <button class="feedback-emoji-btn" data-val="3">😐<span>Okay</span></button>
        <button class="feedback-emoji-btn" data-val="1">😞<span>Difficult</span></button>
      </div>
      <div class="feedback-question" style="margin-top:24px;">What did you use today?</div>
      <div class="feedback-chips">
        <button class="feedback-chip" data-tag="print">🖨 Printing</button>
        <button class="feedback-chip" data-tag="books">📚 Find a Book</button>
        <button class="feedback-chip" data-tag="charge">🔌 Charging</button>
        <button class="feedback-chip" data-tag="map">🗺 Map</button>
        <button class="feedback-chip" data-tag="staff">👤 Staff Help</button>
      </div>
      <button class="btn-next-step" id="btn-submit" style="margin-top:auto;" disabled>Submit Feedback</button>
    </div>
  `;

  let selectedRating = null;
  const submitBtn = screen.querySelector('#btn-submit');

  screen.querySelectorAll('.feedback-emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      screen.querySelectorAll('.feedback-emoji-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedRating = btn.dataset.val;
      submitBtn.disabled = false;
    });
  });

  screen.querySelectorAll('.feedback-chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('selected'));
  });

  submitBtn.addEventListener('click', () => Router.go('feedback-thanks'));
  screen.appendChild(makeBottomNav('home'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  FEEDBACK THANK YOU
// ════════════════════════════════════════════════════════════

Router.register('feedback-thanks', () => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  screen.innerHTML = `
    <header class="feat-header mag">
      <span class="feat-title">Feedback</span>
    </header>
    <div class="maint-body">
      <h1 class="maint-title">Thank You!</h1>
      <p class="maint-text">Your feedback helps us improve the ECU Library experience for everyone.</p>
      <button class="btn-next-step" id="btn-home" style="max-width:320px;margin:24px auto 0;">Back to Home</button>
    </div>
  `;

  screen.querySelector('#btn-home').addEventListener('click', () => Router.go('home'));
  screen.appendChild(makeBottomNav('home'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  FIND A BOOK
// ════════════════════════════════════════════════════════════

Router.register('books', ({ stack } = {}) => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  const STACKS = [
    { id: 'All', label: 'All Shelves' },
    { id: 'A',   label: 'Shelf A — Fine Art' },
    { id: 'B',   label: 'Shelf B — Photography & Catalogues' },
    { id: 'C',   label: 'Shelf C — Design & Artist\'s Books' },
    { id: 'D',   label: 'Shelf D — Literature & Comics' },
    { id: 'E',   label: 'Shelf E — Social Sciences & More' },
  ];

  let activeStack = stack || 'All';
  let searchQuery = '';
  let kbVisible = false;

  screen.innerHTML = `
    <header class="feat-header teal">
      <button class="btn-back" id="back-btn">‹</button>
      <span class="feat-title">Find a Book</span>
    </header>
    <div class="book-search-bar">
      <div class="book-search-field">
        <span class="book-search-icon">🔍</span>
        <input class="book-search-input" id="search-input" type="text"
          placeholder="Search title or author…" readonly />
        <button class="book-kb-toggle" id="kb-toggle" title="Toggle keyboard">⌨</button>
      </div>
    </div>
    <div class="genre-chips" id="stack-chips">
      ${STACKS.map(s => `<button class="genre-chip${s.id === activeStack ? ' active' : ''}" data-stack="${s.id}">${s.label}</button>`).join('')}
    </div>
    <div class="book-list-area" id="book-list-area"></div>
    <div class="book-keyboard-panel" id="kb-panel" style="display:none"></div>
  `;

  const input    = screen.querySelector('#search-input');
  const listArea = screen.querySelector('#book-list-area');
  const kbPanel  = screen.querySelector('#kb-panel');
  const kbToggle = screen.querySelector('#kb-toggle');

  function renderBooks() {
    const q = searchQuery.toLowerCase().trim();
    let books = DATA.books;

    // Stack filter only applies when NOT typing — typing searches all shelves
    if (!q && activeStack !== 'All') {
      books = books.filter(b => b.stack === activeStack);
    }
    if (q) {
      books = DATA.books.filter(b =>
        b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }

    if (!books.length) {
      listArea.innerHTML = `<div class="no-results">No results${q ? ' for "<strong>' + q + '</strong>"' : ''}.<br>Try a different search or shelf.</div>`;
      return;
    }

    listArea.innerHTML = books.map(b => `
      <div class="book-item" data-id="${b.id}">
        <div class="book-spine book-spine-${(b.genre||'').replace(/[^a-z]/gi,'').toLowerCase().slice(0,6)}"></div>
        <div class="book-meta">
          <div class="book-title">${b.title}</div>
          <div class="book-author">${b.author}${b.year ? ' · ' + b.year : ''}</div>
          <div class="book-call">${b.callNumber} &nbsp;·&nbsp; <span class="book-stack-tag">Shelf ${b.stack} · Row ${b.row}</span></div>
        </div>
        <span class="book-status-badge book-status-${b.status}">${b.status === 'available' ? 'Available' : b.status === 'checked-out' ? 'Checked Out' : 'On Hold'}</span>
      </div>
    `).join('');

    listArea.querySelectorAll('.book-item').forEach(el => {
      el.addEventListener('click', () => {
        const book = DATA.books.find(b => b.id === parseInt(el.dataset.id));
        Router.go('book-detail', { book });
      });
    });
  }

  // Stack chips
  screen.querySelectorAll('.genre-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      screen.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeStack = chip.dataset.stack;
      searchQuery = '';
      input.value = '';
      renderBooks();
    });
  });

  // Keyboard
  const kb = Keyboard.create(q => { searchQuery = q; input.value = q; renderBooks(); });
  kb.bindInput(input);
  kbPanel.appendChild(kb.el);

  kbToggle.addEventListener('click', () => {
    kbVisible = !kbVisible;
    kbPanel.style.display = kbVisible ? 'block' : 'none';
    kbToggle.classList.toggle('active', kbVisible);
  });

  // Tapping anywhere in the search bar opens the keyboard
  // (listener on the wrapper, not the readonly input — readonly blocks click on Chromium)
  screen.querySelector('.book-search-field').addEventListener('click', () => {
    if (!kbVisible) {
      kbVisible = true;
      kbPanel.style.display = 'block';
      kbToggle.classList.add('active');
    }
  });

  input.addEventListener('input', e => { searchQuery = e.target.value; renderBooks(); });

  screen.querySelector('#back-btn').addEventListener('click', () => Router.go('home'));
  enableTouchScroll(screen.querySelector('.book-list-area'));
  screen.appendChild(makeBottomNav('home'));

  renderBooks();
  return screen;
});


// ════════════════════════════════════════════════════════════
//  BOOK DETAIL
// ════════════════════════════════════════════════════════════

Router.register('book-detail', ({ book }) => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  const STACK_ROOM = { A: 'room-12', B: 'room-11', C: 'room-10', D: 'room-9', E: 'room-8' };
  const wayfindingRoom = STACK_ROOM[book.stack] || 'room-12';
  const floorLabel = book.floor === 1 ? 'First Floor' : 'Bottom Floor';

  const statusLabel = book.status === 'available' ? 'Available' : book.status === 'checked-out' ? 'Checked Out' : 'On Hold';

  screen.innerHTML = `
    <header class="feat-header teal">
      <button class="btn-back" id="back-btn">‹</button>
      <span class="feat-title">Book Location</span>
    </header>
    <div class="screen-body">
      <div class="detail-card">
        <div class="detail-title">${book.title}</div>
        <div class="detail-author">${book.author} &middot; ${book.year}</div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="book-status-badge book-status-${book.status}">${statusLabel}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Call Number</span>
          <span class="detail-val mono">${book.callNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Genre</span>
          <span class="detail-val">${book.genre}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Location</span>
          <span class="detail-val">Shelf ${book.stack} · Row ${book.row} — Level 1 Stacks</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Floor</span>
          <span class="detail-val">${floorLabel}</span>
        </div>
      </div>
      <div id="checkout-area"></div>
      <div class="map-section">
        <p class="map-section-label">Stacks Location — ${floorLabel}</p>
        <div class="map-wrap" id="book-map"></div>
      </div>
    </div>
  `;

  // Render the checkout area based on current sign-in state
  function renderCheckoutArea() {
    const area = screen.querySelector('#checkout-area');
    if (!area) return;
    if (book.status !== 'available') {
      area.innerHTML = `<p class="checkout-hint">${statusLabel} — this copy is not available right now.</p>`;
    } else if (!currentUser) {
      area.innerHTML = `<p class="checkout-hint">Scan your library card to check out this book.</p>`;
    } else {
      area.innerHTML = `<button class="btn-next-step" id="btn-checkout" style="margin:0 14px 10px;">Check Out This Book</button>`;
      area.querySelector('#btn-checkout').addEventListener('click', () => Router.go('book-checkout', { book }));
    }
  }

  renderCheckoutArea();

  // Listen for card scans while on this screen — reveal checkout button immediately
  function onScanWhileOnScreen() {
    if (!screen.isConnected) {
      window.removeEventListener('rfid:scan', onScanWhileOnScreen);
      return;
    }
    renderCheckoutArea();
  }
  window.addEventListener('rfid:scan', onScanWhileOnScreen);

  screen.querySelector('#back-btn').addEventListener('click', () => {
    window.removeEventListener('rfid:scan', onScanWhileOnScreen);
    Router.go('books');
  });

  enableTouchScroll(screen.querySelector('.screen-body'));
  Wayfinding.initialize(screen.querySelector('#book-map'))
    .then(() => Wayfinding.drawRoute(wayfindingRoom));
  screen.appendChild(makeBottomNav('home'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  BOOK CHECKOUT
// ════════════════════════════════════════════════════════════

Router.register('book-checkout', ({ book }) => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const dueDateStr = dueDate.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  const userName = currentUser ? currentUser.name : 'Guest';
  const userId   = currentUser ? currentUser.id : '';

  // QR encodes the checkout info as plain text — scannable on any phone
  const qrText = encodeURIComponent(
    'ECU Library Checkout\n' +
    'Book: ' + book.title + '\n' +
    'Student: ' + userName + ' (' + userId + ')\n' +
    'Due: ' + dueDateStr + '\n' +
    'Return to: ECU Library, 520 E 1st Ave, Vancouver'
  );
  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + qrText;

  screen.innerHTML = `
    <header class="feat-header teal">
      <button class="btn-back" id="back-btn">‹</button>
      <span class="feat-title">Check Out</span>
    </header>
    <div class="screen-body">
      <div class="checkout-success">
        <div class="success-circle" style="background:var(--teal);">✓</div>
        <h2 class="success-title">Checked Out!</h2>
        <p class="success-body">Checked out to <strong>${userName}</strong>.<br>Please return by <strong>${dueDateStr}</strong>.</p>
      </div>
      <div class="receipt-card">
        <div class="receipt-logo">ECU Library</div>
        <div class="receipt-subtitle">Checkout Receipt</div>
        <div class="receipt-divider"></div>
        <div class="receipt-row"><span>Student</span><span>${userName}</span></div>
        <div class="receipt-row"><span>ID</span><span>${userId}</span></div>
        <div class="receipt-divider"></div>
        <div class="receipt-row"><span>Title</span><span class="receipt-doc-name">${book.title}</span></div>
        <div class="receipt-row"><span>Author</span><span>${book.author}</span></div>
        <div class="receipt-row"><span>Location</span><span>Shelf ${book.stack} · Row ${book.row}</span></div>
        <div class="receipt-divider"></div>
        <div class="receipt-total"><span>Due Date</span><span>${dueDateStr}</span></div>
      </div>
      <div class="qr-section">
        <p class="qr-label">Scan to save — get a due date reminder on your phone</p>
        <img class="qr-code" src="${qrUrl}" alt="Checkout QR code"
          onerror="this.style.display='none';this.nextElementSibling.style.display='block'" />
        <p class="qr-fallback" style="display:none;">QR code requires internet connection.</p>
      </div>
      <button class="btn-done" id="btn-home" style="margin:0 14px 20px;">Done — Back to Home</button>
    </div>
  `;

  // Mark book as checked out in memory for this session
  book.status = 'checked-out';

  screen.querySelector('#back-btn').addEventListener('click', () => Router.go('book-detail', { book }));
  screen.querySelector('#btn-home').addEventListener('click', () => Router.go('home'));
  enableTouchScroll(screen.querySelector('.screen-body'));
  screen.appendChild(makeBottomNav('home'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  CHARGING SPOTS
// ════════════════════════════════════════════════════════════

Router.register('charge', ({ spotId } = {}) => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  const spots = DATA.chargingSpots;
  let selectedId = spotId || 1;
  let mapReady = false;

  screen.innerHTML = `
    <header class="feat-header lime">
      <button class="btn-back" id="back-btn">‹</button>
      <span class="feat-title">Charging Spots</span>
    </header>
    <div class="charge-map-section">
      <p class="section-label" style="color:var(--lime-dk)">Floor Plan — Charging Locations ⚡</p>
      <div class="map-wrap" id="charge-map"></div>
    </div>
    <div class="charge-list-scroll">
      <div class="charge-list" id="charge-list">
        ${spots.map(s => `
          <div class="charge-item${s.active ? '' : ' charge-item-inactive'}${s.id === selectedId ? ' active' : ''}"
               data-id="${s.id}">
            <div class="charge-badge${s.active ? '' : ' charge-badge-inactive'}">${s.id}</div>
            <div class="charge-item-body">
              <div class="charge-name">${s.name}</div>
              <div class="charge-desc">${s.description}</div>
              ${s.active
                ? `<div class="charge-seats">${s.seats} charging ${s.seats === 1 ? 'spot' : 'spots'}</div>`
                : `<div class="charge-unavailable">Not currently available</div>`
              }
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  screen.querySelector('#back-btn').addEventListener('click', () => Router.go('home'));

  Wayfinding.initialize(screen.querySelector('#charge-map'))
    .then(() => {
      mapReady = true;
      const initial = spots.find(s => s.id === selectedId);
      if (initial && initial.wayfindingRoom) Wayfinding.drawRoute(initial.wayfindingRoom);
    });

  // Only active spots are tappable
  screen.querySelectorAll('.charge-item:not(.charge-item-inactive)').forEach(el => {
    el.addEventListener('click', () => {
      const id  = parseInt(el.dataset.id);
      const spot = spots.find(s => s.id === id);
      if (!spot || !spot.active) return;
      selectedId = id;
      screen.querySelectorAll('.charge-item').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      if (mapReady && spot.wayfindingRoom) Wayfinding.drawRoute(spot.wayfindingRoom);
    });
  });

  enableTouchScroll(screen.querySelector('.charge-list-scroll'));
  addScrollHint(screen, screen.querySelector('.charge-list-scroll'), 'scroll-hint--lime');
  screen.appendChild(makeBottomNav('home'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  GET HELP
// ════════════════════════════════════════════════════════════

Router.register('help', () => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  screen.innerHTML = `
    <header class="feat-header purple">
      <button class="btn-back" id="back-btn">‹</button>
      <span class="feat-title">Get Help</span>
    </header>
    <div class="charge-map-section">
      <p class="section-label" style="color:var(--purple)">Service Desk — Route from here</p>
      <div class="map-wrap" id="help-map"></div>
    </div>
    <div class="charge-list-scroll">
      <div class="help-body">

        <div class="help-card">
          <div class="help-card-title">Library Desk</div>
          <div class="help-row">
            <span class="help-row-icon">📍</span>
            <span class="help-row-text">
              <strong>Location</strong>
              First Floor, near the main entrance. Look for the purple kiosk marker on the map.
            </span>
          </div>
          <div class="help-row">
            <span class="help-row-icon">🕐</span>
            <span class="help-row-text">
              <strong>Hours</strong>
              Mon–Thu 8:00 am – 8:00 pm<br>
              Fri 8:00 am – 5:00 pm<br>
              Sat–Sun 12:00 pm – 5:00 pm
            </span>
          </div>
          <div class="help-row">
            <span class="help-row-icon">📞</span>
            <span class="help-row-text">
              <strong>Phone</strong>
              604-844-3840
            </span>
          </div>
          <div class="help-row">
            <span class="help-row-icon">✉️</span>
            <span class="help-row-text">
              <strong>Email</strong>
              library@ecuad.ca
            </span>
          </div>
        </div>

        <div class="help-card">
          <div class="help-card-title">Quick Reference</div>
          <div class="help-row">
            <span class="help-row-icon">🖨️</span>
            <span class="help-row-text">
              <strong>Printing</strong>
              Printers are on the First Floor. See "Printing Help" for step-by-step instructions.
            </span>
          </div>
          <div class="help-row">
            <span class="help-row-icon">🔋</span>
            <span class="help-row-text">
              <strong>Charging</strong>
              Outlets and USB ports are available throughout the library. See "Charging Spots".
            </span>
          </div>
          <div class="help-row">
            <span class="help-row-icon">📚</span>
            <span class="help-row-text">
              <strong>Books &amp; Catalogue</strong>
              Use "Find a Book" to locate items in the stacks, or search online at library.ecuad.ca
            </span>
          </div>
        </div>

      </div>
    </div>
  `;

  screen.querySelector('#back-btn').addEventListener('click', () => Router.go('home'));
  Wayfinding.initialize(screen.querySelector('#help-map'))
    .then(() => Wayfinding.drawRoute('east-exit'));
  enableTouchScroll(screen.querySelector('.charge-list-scroll'));
  addScrollHint(screen, screen.querySelector('.charge-list-scroll'), 'scroll-hint--purple');
  screen.appendChild(makeBottomNav('help'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  MAP: all screens use Wayfinding.initialize() — see wayfinding.js
// ════════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════
//  PROFILE (placeholder — to be implemented)
// ════════════════════════════════════════════════════════════

Router.register('profile', () => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  const signedInMarkup = currentUser
    ? `
      <div class="profile-body">
        <img class="profile-photo" src="${currentUser.photo}" alt="${currentUser.name}" />
        <div class="profile-name">${currentUser.name}</div>
        <div class="profile-program">${currentUser.program}</div>
        <button class="profile-signout-btn" id="signout-btn">Sign Out</button>
      </div>
    `
    : `
      <div class="profile-body">
        <div class="profile-avatar">👤</div>
        <div class="profile-name">Not Signed In</div>
        <div class="profile-hint">Scan your card at the kiosk reader to sign in.</div>
      </div>
    `;

  screen.innerHTML = `
    <header class="feat-header purple">
      <button class="btn-back" id="back-btn">‹</button>
      <span class="feat-title">Profile</span>
    </header>
    ${signedInMarkup}
  `;

  screen.querySelector('#back-btn').addEventListener('click', () => Router.go('home'));
  const signoutBtn = screen.querySelector('#signout-btn');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', () => {
      currentUser = null;
      Router.go('home');
    });
  }
  screen.appendChild(makeBottomNav('profile'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  BOOT
// ════════════════════════════════════════════════════════════

Router.go('home');
