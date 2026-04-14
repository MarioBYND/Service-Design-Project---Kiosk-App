# ECU Kiosk

Static kiosk app for Raspberry Pi (Chromium kiosk mode) with local serial RFID support.

## RFID integration (Parallax serial reader)

This project now uses a small local bridge service:

- `rfid_bridge.py` reads RFID scans from `/dev/serial0` at `2400` baud.
- The bridge exposes scan events on `http://127.0.0.1:8765/events` (SSE).
- `js/rfid.js` subscribes to that stream and emits browser event `rfid:scan`.
- `js/app.js` listens for scans and routes to Print Docs with the scanned ID prefilled.

## Raspberry Pi setup

1. Install serial dependency:

	sudo apt update
	sudo apt install -y python3-serial

2. Ensure serial is enabled and login shell over serial is disabled.

3. Confirm your reader still works from terminal:

	minicom -b 2400 -D /dev/serial0

4. Launch kiosk as usual:

	./launch.sh

`launch.sh` now starts both:

- `rfid_bridge.py` (logs to `/home/pi/kiosk/rfid_bridge.log`)
- static web server on port `3456`

## Quick verification

1. Check bridge health in a browser on Pi:

	http://127.0.0.1:8765/health

2. Scan a card.

3. In kiosk UI, app should navigate to Print Docs and prefill search with the scanned card ID.

## Notes

- Front-end JavaScript in Chromium cannot open `/dev/serial0` directly.
- Local bridge process is the correct architecture for serial hardware in this stack.