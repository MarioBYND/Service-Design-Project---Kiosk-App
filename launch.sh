#!/bin/bash
# ════════════════════════════════════════════════════════════
#  ECUAD Library Kiosk — launch script
#  Raspberry Pi 3 · Raspberry Pi OS
# ════════════════════════════════════════════════════════════

# Resolve kiosk project directory from this script location.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Disable screen blanking (only when running under X)
if command -v xset >/dev/null 2>&1 && [ -n "$DISPLAY" ]; then
  xset s off
  xset s noblank
  xset -dpms
fi

# Hide mouse cursor after 1s idle (requires: sudo apt install unclutter)
if command -v unclutter >/dev/null 2>&1 && [ -n "$DISPLAY" ]; then
  unclutter -idle 1 &
fi

# Start RFID bridge (requires: sudo apt install python3-serial)
python3 "$SCRIPT_DIR/rfid_bridge.py" > "$SCRIPT_DIR/rfid_bridge.log" 2>&1 &
sleep 1

# Start a local HTTP server so fetch() works for maps and fonts
python3 -m http.server 3456 --directory "$SCRIPT_DIR" &
sleep 2

# Resolve Chromium command name across Raspberry Pi OS variants.
if command -v chromium-browser >/dev/null 2>&1; then
  CHROMIUM_BIN="chromium-browser"
elif command -v chromium >/dev/null 2>&1; then
  CHROMIUM_BIN="chromium"
else
  echo "Chromium not found. Install with: sudo apt install -y chromium-browser"
  exit 1
fi

# Launch Chromium in kiosk mode pointing to localhost
"$CHROMIUM_BIN" \
  --kiosk \
  --no-sandbox \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-restore-session-state \
  --noerrdialogs \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --check-for-update-interval=31536000 \
  --app=http://localhost:3456

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
# ════════════════════════════════════════════════════════════
