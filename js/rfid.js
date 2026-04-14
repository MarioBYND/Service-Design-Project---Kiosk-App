// Local RFID event client.
// Connects to the Pi-side bridge and emits browser events on each scan.
const RFID = (() => {
  const EVENTS_URL = 'http://127.0.0.1:8765/events';
  let source = null;
  let retryTimer = null;
  let connected = false;

  function emit(type, detail) {
    window.dispatchEvent(new CustomEvent(type, { detail }));
  }

  function connect() {
    if (source) {
      source.close();
      source = null;
    }

    try {
      source = new EventSource(EVENTS_URL);

      source.addEventListener('open', () => {
        connected = true;
        emit('rfid:status', { connected: true });
      });

      source.addEventListener('scan', event => {
        try {
          const payload = JSON.parse(event.data || '{}');
          if (!payload.id) return;
          emit('rfid:scan', payload);
        } catch (_err) {
          // Ignore malformed payloads.
        }
      });

      source.addEventListener('error', () => {
        if (connected) {
          connected = false;
          emit('rfid:status', { connected: false });
        }
        scheduleReconnect();
      });
    } catch (_err) {
      scheduleReconnect();
    }
  }

  function scheduleReconnect() {
    if (retryTimer) return;
    if (source) {
      source.close();
      source = null;
    }
    retryTimer = setTimeout(() => {
      retryTimer = null;
      connect();
    }, 3000);
  }

  function start() {
    connect();
  }

  function stop() {
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    if (source) {
      source.close();
      source = null;
    }
    connected = false;
    emit('rfid:status', { connected: false });
  }

  return { start, stop };
})();

RFID.start();
