#!/bin/bash
# ════════════════════════════════════════════════════════════
#  ECUAD Library Kiosk — launch script (reliable)
#  Raspberry Pi 3 · Raspberry Pi OS
# ════════════════════════════════════════════════════════════
#
#  Fixes "Address already in use" and "scan does nothing"
#  by killing stale processes before starting fresh ones,
#  and waiting for services to be ready before Chromium opens.
#
#  Log: /tmp/kiosk_launch.log
# ════════════════════════════════════════════════════════════

KIOSK_DIR="/home/pi/kiosk"
HTTP_PORT=3456
WS_PORT=8765
LOG="/tmp/kiosk_launch.log"

# ── All output to log file ────────────────────────────────────
exec >> "$LOG" 2>&1
echo ""
echo "══════════════════════════════════════════"
echo " Kiosk launch  $(date)"
echo "══════════════════════════════════════════"

# ── 1. Kill anything left over from the previous session ─────
echo "[launch] Killing stale processes…"
pkill -f "rfid_bridge.py"    2>/dev/null && echo "[launch] Killed old rfid_bridge"
pkill -f "http.server $HTTP_PORT" 2>/dev/null && echo "[launch] Killed old HTTP server"
pkill -f "chromium"          2>/dev/null && echo "[launch] Killed old Chromium"

# Give OS time to release the ports
sleep 1

# ── 2. Display / cursor setup ─────────────────────────────────
xset s off
xset s noblank
xset -dpms
unclutter -idle 1 &

# ── 3. Start HTTP file server ─────────────────────────────────
echo "[launch] Starting HTTP server on port $HTTP_PORT…"
python3 -m http.server $HTTP_PORT --directory "$KIOSK_DIR" &
HTTP_PID=$!
echo "[launch] HTTP PID: $HTTP_PID"

# Wait until the HTTP server is actually accepting connections (up to 10 s)
HTTP_READY=0
for i in $(seq 1 20); do
  if curl -s -o /dev/null "http://localhost:$HTTP_PORT/"; then
    echo "[launch] HTTP server ready after $((i * 500)) ms"
    HTTP_READY=1
    break
  fi
  sleep 0.5
done

if [ "$HTTP_READY" -eq 0 ]; then
  echo "[launch] ERROR: HTTP server did not come up — check disk / python3"
fi

# ── 4. Start RFID WebSocket bridge ───────────────────────────
echo "[launch] Starting RFID bridge on port $WS_PORT…"
python3 "$KIOSK_DIR/rfid_bridge.py" &
RFID_PID=$!
echo "[launch] RFID bridge PID: $RFID_PID"

# Give the bridge a moment to bind the WebSocket port
sleep 1

# ── 5. Launch Chromium kiosk ──────────────────────────────────
echo "[launch] Starting Chromium…"
chromium-browser \
  --kiosk \
  --no-sandbox \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-restore-session-state \
  --noerrdialogs \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --check-for-update-interval=31536000 \
  --app="http://localhost:$HTTP_PORT"

# ── 6. Cleanup when Chromium exits ───────────────────────────
echo "[launch] Chromium exited — shutting down services"
kill "$HTTP_PID" "$RFID_PID" 2>/dev/null
echo "[launch] Done"
