#!/bin/bash
# ════════════════════════════════════════════════════════════
#  ECUAD Library Kiosk — launch script
#  Raspberry Pi 3 · Raspberry Pi OS
# ════════════════════════════════════════════════════════════

# Disable screen blanking
xset s off
xset s noblank
xset -dpms

# Hide mouse cursor after 1s idle (requires: sudo apt install unclutter)
unclutter -idle 1 &

# Start a local HTTP server so fetch() works for maps and fonts
python3 -m http.server 3456 --directory /home/pi/kiosk &
sleep 2

# Launch Chromium in kiosk mode pointing to localhost
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
