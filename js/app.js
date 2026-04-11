// ════════════════════════════════════════════════════════════
//  ECUAD LIBRARY KIOSK — app.js
//  All screens · Inter design system · ECUAD brand colours
// ════════════════════════════════════════════════════════════

// ── Idle timer ────────────────────────────────────────────────
let idleTimer = null;
const IDLE_MS = 60000;

function showIdleOverlay() {
  if (document.getElementById('idle-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'idle-overlay';
  overlay.className = 'idle-screen';
  overlay.innerHTML = `
    <p class="idle-eyebrow">Emily Carr University · Library</p>
    <h1 class="idle-headline">ECUAD<br><span class="hl-teal">LIBRARY</span></h1>
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


// ── Bottom nav builder ────────────────────────────────────────
// activeItem: 'home' | 'profile' | 'help' — highlights the active tab
function makeBottomNav(activeItem = 'home') {
  const nav = document.createElement('div');
  nav.className = 'bottom-nav';

  const items = [
    { id: 'home',    icon: '⌂',  label: 'Home',    route: 'home'    },
    { id: 'profile', icon: '◉',  label: 'Profile', route: 'profile' },
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


// ── Scroll hint ───────────────────────────────────────────────
// Shows a gradient fade + bouncing chevron at the bottom of `screen`
// and hides it the moment the user scrolls `scrollEl`.
function addScrollHint(screen, scrollEl) {
  const hint = document.createElement('div');
  hint.className = 'scroll-hint';
  hint.innerHTML = '<div class="scroll-hint-chevron"><span class="scroll-hint-dot"></span></div>';
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
      <span class="home-logo">ECUAD Library</span>
      <span class="home-sub">Self-Service Kiosk</span>
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
  screen.appendChild(makeBottomNav('home'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  PRINT DOCS — STEP 1: Find document by student ID
// ════════════════════════════════════════════════════════════

// All queued documents — shown by default, filtered by search
const MOCK_DOCS = [
  { id: 1,  name: 'Final_Thesis_Draft.pdf',          pages: 24, size: '3.2 MB', sent: '8:41 AM', ext: 'pdf' },
  { id: 2,  name: 'Studio_Presentation_Final.pdf',   pages: 12, size: '1.8 MB', sent: '8:39 AM', ext: 'pdf' },
  { id: 3,  name: 'Exhibition_Poster_A3.pdf',        pages: 1,  size: '4.5 MB', sent: '9:02 AM', ext: 'pdf' },
  { id: 4,  name: 'Artist_Statement_v2.docx',        pages: 2,  size: '0.3 MB', sent: '9:00 AM', ext: 'doc' },
  { id: 5,  name: 'Reading_Response_Week8.pdf',      pages: 3,  size: '0.6 MB', sent: '7:55 AM', ext: 'pdf' },
  { id: 6,  name: 'Capstone_Project_Brief.pdf',      pages: 8,  size: '1.1 MB', sent: '9:15 AM', ext: 'pdf' },
  { id: 7,  name: 'Colour_Theory_Assignment.pdf',    pages: 5,  size: '2.4 MB', sent: '9:18 AM', ext: 'pdf' },
  { id: 8,  name: 'Typography_Specimen_Sheet.pdf',   pages: 2,  size: '0.9 MB', sent: '9:22 AM', ext: 'pdf' },
  { id: 9,  name: 'Process_Journal_Oct.docx',        pages: 14, size: '0.5 MB', sent: '9:30 AM', ext: 'doc' },
  { id: 10, name: 'Wayfinding_System_Proposal.pdf',  pages: 6,  size: '3.7 MB', sent: '9:33 AM', ext: 'pdf' },
  { id: 11, name: 'Photo_Series_Contact_Sheet.pdf',  pages: 4,  size: '5.2 MB', sent: '9:40 AM', ext: 'pdf' },
  { id: 12, name: 'Service_Design_Report.pdf',       pages: 18, size: '2.0 MB', sent: '9:44 AM', ext: 'pdf' },
];

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

Router.register('print-docs', () => {
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
      <div class="doc-search-bar">
        <div class="doc-search-field">
          <span class="doc-search-icon">🔍</span>
          <input class="doc-search-input" id="doc-search-input" type="text"
            placeholder="Search by file name…" readonly />
          <button class="doc-kb-toggle" id="doc-kb-toggle">⌨</button>
        </div>
      </div>
      <p class="doc-list-label">Queued documents — tap one to select</p>
      <div class="doc-list-scroll" id="doc-list-area"></div>
      <div class="doc-keyboard-panel" id="doc-kb-panel" style="display:none"></div>
    </div>
  `;

  screen.querySelector('#back-btn').addEventListener('click', () => Router.go('print'));

  const input = screen.querySelector('#doc-search-input');
  const listArea = screen.querySelector('#doc-list-area');
  const kbPanel = screen.querySelector('#doc-kb-panel');
  const kbToggle = screen.querySelector('#doc-kb-toggle');

  function renderDocs() {
    const q = searchQuery.toLowerCase().trim();
    const filtered = q
      ? MOCK_DOCS.filter(d => d.name.toLowerCase().includes(q))
      : MOCK_DOCS;

    if (!filtered.length) {
      listArea.innerHTML = `<p class="doc-not-found">No documents match "<strong>${searchQuery}</strong>".<br>Make sure your file was sent to print@ecuad.ca</p>`;
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
        const doc = MOCK_DOCS.find(d => d.id === parseInt(el.dataset.id));
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

  // Tapping anywhere in the search bar opens the keyboard
  // (listener on the wrapper, not the readonly input — readonly blocks click on Chromium)
  screen.querySelector('.doc-search-field').addEventListener('click', () => {
    if (!kbVisible) {
      kbVisible = true;
      kbPanel.style.display = 'block';
      kbToggle.classList.add('active');
    }
  });

  screen.appendChild(makeBottomNav('home'));
  renderDocs();
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
    Router.go('print-docs-success', { doc, printer });
  });

  screen.appendChild(makeBottomNav('home'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  PRINT DOCS — STEP 4: Success
// ════════════════════════════════════════════════════════════

Router.register('print-docs-success', ({ doc, printer }) => {
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
        <button class="btn-done" id="btn-done">Done — Back to Home</button>
      </div>
      <p class="map-section-label" style="padding: 0 14px 8px; color: var(--mag);">Printer Location — First Floor</p>
      <div class="map-wrap" id="success-map" style="margin:0 14px 14px;border-radius:10px;overflow:hidden;"></div>
    </div>
  `;

  screen.querySelector('#btn-done').addEventListener('click', () => Router.go('home'));
  Wayfinding.initialize(screen.querySelector('#success-map'))
    .then(() => Wayfinding.drawRoute('studio-a'));
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
          <div class="book-call">${b.callNumber} &nbsp;·&nbsp; <span class="book-stack-tag">Shelf ${b.stack}</span></div>
        </div>
        <div class="book-chevron">›</div>
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
          <span class="detail-label">Call Number</span>
          <span class="detail-val mono">${book.callNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Genre</span>
          <span class="detail-val">${book.genre}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Location</span>
          <span class="detail-val">Shelf ${book.stack} — Level 1 Stacks</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Floor</span>
          <span class="detail-val">${floorLabel}</span>
        </div>
      </div>
      <div class="map-section">
        <p class="map-section-label">Stacks Location — ${floorLabel}</p>
        <div class="map-wrap" id="book-map"></div>
      </div>
    </div>
  `;

  screen.querySelector('#back-btn').addEventListener('click', () => Router.go('books'));
  Wayfinding.initialize(screen.querySelector('#book-map'))
    .then(() => Wayfinding.drawRoute(wayfindingRoom));
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

  addScrollHint(screen, screen.querySelector('.charge-list-scroll'));
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
  addScrollHint(screen, screen.querySelector('.charge-list-scroll'));
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

  screen.innerHTML = `
    <header class="feat-header purple">
      <button class="btn-back" id="back-btn">‹</button>
      <span class="feat-title">Profile</span>
    </header>
    <div class="maint-body">
      <div class="maint-icon">👤</div>
      <h1 class="maint-title">Coming Soon</h1>
      <p class="maint-text">Student profile and account features will be available here.</p>
    </div>
  `;

  screen.querySelector('#back-btn').addEventListener('click', () => Router.go('home'));
  screen.appendChild(makeBottomNav('profile'));
  return screen;
});


// ════════════════════════════════════════════════════════════
//  BOOT
// ════════════════════════════════════════════════════════════

Router.go('home');
