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

# Resolve kiosk project directory from this script's location
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HTTP_PORT=3456
LOG="/tmp/kiosk_launch.log"

# All output goes to the log file (useful for debugging reboots)
exec >> "$LOG" 2>&1
echo ""
echo "══════════════════════════════════════"
echo " Kiosk launch  $(date)"
echo "══════════════════════════════════════"

# ── 1. Kill stale processes from the previous session ────────
echo "[launch] Cleaning up stale processes…"
pkill -f "rfid_bridge.py"         2>/dev/null && echo "[launch] Killed old rfid_bridge"
pkill -f "http.server $HTTP_PORT" 2>/dev/null && echo "[launch] Killed old HTTP server"
pkill -f "chromium"               2>/dev/null && echo "[launch] Killed old Chromium"
sleep 1  # Brief wait for ports to be released

# ── 2. Display / cursor setup ─────────────────────────────────
if command -v xset >/dev/null 2>&1 && [ -n "$DISPLAY" ]; then
  xset s off
  xset s noblank
  xset -dpms
fi

if command -v unclutter >/dev/null 2>&1 && [ -n "$DISPLAY" ]; then
  unclutter -idle 1 &
fi

# ── 3. Start RFID bridge ──────────────────────────────────────
echo "[launch] Starting RFID bridge…"
python3 "$SCRIPT_DIR/rfid_bridge.py" > /tmp/rfid_bridge.log 2>&1 &
RFID_PID=$!
echo "[launch] RFID bridge PID: $RFID_PID"

# ── 4. Start HTTP file server ─────────────────────────────────
echo "[launch] Starting HTTP server on port $HTTP_PORT…"
python3 -m http.server $HTTP_PORT --directory "$SCRIPT_DIR" &
HTTP_PID=$!
echo "[launch] HTTP server PID: $HTTP_PID"

# Wait until the HTTP server is accepting connections (up to 10 s)
HTTP_READY=0
for i in $(seq 1 20); do
  if curl -s -o /dev/null "http://localhost:$HTTP_PORT/"; then
    echo "[launch] HTTP server ready after $((i * 500)) ms"
    HTTP_READY=1
    break
  fi
  sleep 0.5
done
[ "$HTTP_READY" -eq 0 ] && echo "[launch] WARNING: HTTP server did not become ready"

# Wait until the RFID bridge is accepting requests (up to 5 s)
RFID_READY=0
for i in $(seq 1 10); do
  if curl -s -o /dev/null "http://127.0.0.1:8765/health"; then
    echo "[launch] RFID bridge ready after $((i * 500)) ms"
    RFID_READY=1
    break
  fi
  sleep 0.5
done
[ "$RFID_READY" -eq 0 ] && echo "[launch] WARNING: RFID bridge not responding — scans may not work"

# ── 5. Resolve Chromium binary name ──────────────────────────
if command -v chromium-browser >/dev/null 2>&1; then
  CHROMIUM_BIN="chromium-browser"
elif command -v chromium >/dev/null 2>&1; then
  CHROMIUM_BIN="chromium"
else
  echo "[launch] ERROR: Chromium not found. Install: sudo apt install -y chromium-browser"
  exit 1
fi

# ── 6. Launch Chromium kiosk ──────────────────────────────────
echo "[launch] Starting Chromium ($CHROMIUM_BIN)…"
"$CHROMIUM_BIN" \
  --kiosk \
  --no-sandbox \
  --password-store=basic \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-restore-session-state \
  --noerrdialogs \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --check-for-update-interval=31536000 \
  --app="http://localhost:$HTTP_PORT"

# ── 7. Cleanup when Chromium exits ───────────────────────────
echo "[launch] Chromium exited — shutting down services"
kill "$HTTP_PID" "$RFID_PID" 2>/dev/null
echo "[launch] Done"

# ── Raspberry Pi Setup ───────────────────────────────────────
#
# 1. PORTRAIT: add to /boot/config.txt → display_rotate=1
#
# 2. RUN ON BOOT: add to /etc/xdg/lxsession/LXDE-pi/autostart:
#      @/home/pi/kiosk/launch.sh
#    Then: chmod +x /home/pi/kiosk/launch.sh
#
# 3. FONTS OFFLINE: Open the kiosk once with internet so
#    Chromium caches Google Fonts. Or download Inter and add
#    @font-face rules pointing to local /home/pi/kiosk/fonts/
#
# 4. DIAGNOSE ISSUES:
#    - Launch log:   tail -f /tmp/kiosk_launch.log
#    - RFID log:     tail -f /tmp/rfid_bridge.log
#    - RFID health:  curl http://127.0.0.1:8765/health
#    - Last scan:    curl http://127.0.0.1:8765/last-scan
# ════════════════════════════════════════════════════════════
