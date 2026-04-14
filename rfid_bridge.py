#!/usr/bin/env python3
"""
RFID WebSocket Bridge — ECUAD Library Kiosk
============================================
Reads card IDs from a Parallax serial RFID reader on /dev/serial0 (2400 baud)
and broadcasts each scanned card ID via WebSocket on ws://localhost:8765.

Serial frame format (Parallax reader):
  0x0A  +  10 ASCII hex chars  +  0x0D   =  12 bytes per scan

Logs go to: /tmp/rfid_bridge.log
PID file:   /tmp/rfid_bridge.pid
"""

import asyncio
import logging
import os
import signal
import sys

LOG_FILE  = '/tmp/rfid_bridge.log'
PID_FILE  = '/tmp/rfid_bridge.pid'
SERIAL_PORT = '/dev/serial0'
BAUD_RATE   = 2400
WS_PORT     = 8765

# ── Logging ───────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s  %(levelname)-7s  %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout),
    ]
)
log = logging.getLogger('rfid_bridge')

# ── WebSocket client registry ─────────────────────────────────
CLIENTS = set()

async def ws_handler(websocket, path=''):
    """Accept a new WebSocket client and track it."""
    CLIENTS.add(websocket)
    log.info(f'WS client connected  (total: {len(CLIENTS)})')
    try:
        await websocket.wait_closed()
    except Exception:
        pass
    finally:
        CLIENTS.discard(websocket)
        log.info(f'WS client disconnected  (total: {len(CLIENTS)})')

async def broadcast(card_id: str):
    """Send card_id to every connected WebSocket client."""
    if not CLIENTS:
        log.info(f'Scan {card_id} — no WS clients connected')
        return
    dead = set()
    for ws in list(CLIENTS):
        try:
            await ws.send(card_id)
        except Exception:
            dead.add(ws)
    CLIENTS -= dead
    log.info(f'Broadcast {card_id!r} to {len(CLIENTS) + len(dead)} client(s)  ({len(dead)} dead removed)')

# ── Serial reader ─────────────────────────────────────────────
async def serial_reader():
    """
    Continuously read the serial port and extract card IDs.
    Runs forever; errors sleep 1 s then retry.
    """
    import serial  # imported here so startup errors are logged cleanly

    log.info(f'Opening {SERIAL_PORT} at {BAUD_RATE} baud …')
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        log.info('Serial port open — waiting for card scans')
    except Exception as e:
        log.error(f'Cannot open serial port: {e}')
        log.error('RFID scanning disabled — WebSocket bridge still running')
        # Keep the bridge alive so the app doesn't spam reconnect errors
        await asyncio.Future()
        return

    buf  = bytearray()
    loop = asyncio.get_event_loop()

    while True:
        try:
            # Non-blocking read via thread executor so the event loop stays live
            chunk = await loop.run_in_executor(None, lambda: ser.read(32))
            if not chunk:
                continue

            buf.extend(chunk)

            # Parse all complete 12-byte frames: 0x0A + 10 hex chars + 0x0D
            while True:
                start = buf.find(0x0A)
                if start == -1:
                    buf.clear()
                    break
                if len(buf) - start < 12:
                    # Incomplete frame — keep buf and wait for more bytes
                    buf = buf[start:]
                    break
                if buf[start + 11] == 0x0D:
                    raw     = buf[start + 1 : start + 11]
                    card_id = raw.decode('ascii', errors='ignore').strip().upper()
                    if len(card_id) == 10:
                        await broadcast(card_id)
                    else:
                        log.warning(f'Unexpected card length {len(card_id)!r}: {raw!r}')
                    buf = buf[start + 12:]
                else:
                    # Misaligned — skip this 0x0A and keep scanning
                    buf = buf[start + 1:]

        except Exception as e:
            log.error(f'Serial read error: {e}')
            await asyncio.sleep(1)

# ── Entry point ───────────────────────────────────────────────
async def main():
    import websockets

    log.info(f'Starting WebSocket server on ws://localhost:{WS_PORT}')
    try:
        async with websockets.serve(ws_handler, 'localhost', WS_PORT):
            log.info('WebSocket server ready')
            await serial_reader()
    except OSError as e:
        log.error(f'Cannot bind port {WS_PORT}: {e}')
        log.error('Is another rfid_bridge.py still running? Check: ps aux | grep rfid')
        sys.exit(1)

if __name__ == '__main__':
    # ── PID file (prevent double-start confusion) ─────────────
    with open(PID_FILE, 'w') as fh:
        fh.write(str(os.getpid()))

    def _cleanup(signum=None, frame=None):
        log.info(f'Signal {signum} — shutting down')
        try:
            os.unlink(PID_FILE)
        except FileNotFoundError:
            pass
        sys.exit(0)

    signal.signal(signal.SIGTERM, _cleanup)
    signal.signal(signal.SIGINT,  _cleanup)

    log.info(f'=== RFID bridge starting (PID {os.getpid()}) ===')

    try:
        asyncio.run(main())
    except Exception as e:
        log.error(f'Fatal: {e}')
        sys.exit(1)
