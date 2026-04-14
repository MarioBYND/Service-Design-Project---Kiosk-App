// ════════════════════════════════════════════════════════════
//  RFID WebSocket Client — ECUAD Library Kiosk
// ════════════════════════════════════════════════════════════
//
//  Connects to rfid_bridge.py (ws://localhost:8765) and fires
//  a custom 'rfid-scan' event on document whenever a card is read.
//
//  Event detail: { cardId: "08007828B7" }
//
//  Auto-reconnects every 3 s if the bridge is not yet up.
// ════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var WS_URL       = 'ws://localhost:8765';
  var RECONNECT_MS = 3000;
  var ws           = null;

  function connect() {
    try {
      ws = new WebSocket(WS_URL);
    } catch (e) {
      console.warn('[RFID] Cannot create WebSocket:', e);
      setTimeout(connect, RECONNECT_MS);
      return;
    }

    ws.onopen = function () {
      console.log('[RFID] Connected to bridge');
    };

    ws.onmessage = function (e) {
      var cardId = String(e.data).trim().toUpperCase();
      if (!cardId) return;
      console.log('[RFID] Card scanned:', cardId);
      document.dispatchEvent(new CustomEvent('rfid-scan', {
        detail: { cardId: cardId }
      }));
    };

    ws.onerror = function () {
      // onclose always fires after onerror — reconnect handled there
    };

    ws.onclose = function () {
      console.log('[RFID] Bridge disconnected — retry in ' + RECONNECT_MS + ' ms');
      ws = null;
      setTimeout(connect, RECONNECT_MS);
    };
  }

  connect();
})();
