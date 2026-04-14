#!/usr/bin/env python3
"""
Local RFID bridge for Raspberry Pi kiosk.

- Reads Parallax serial RFID data from /dev/serial0 (2400 baud by default)
- Publishes scans over Server-Sent Events (SSE) on localhost
- Provides /health and /last-scan endpoints for diagnostics

Run:
  python3 rfid_bridge.py
"""

import json
import queue
import re
import signal
import threading
import time
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

try:
    import serial  # pyserial
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "Missing dependency: pyserial. Install with: sudo apt install python3-serial"
    ) from exc


SERIAL_DEVICE = "/dev/serial0"
BAUD_RATE = 2400
HOST = "127.0.0.1"
PORT = 8765


class BridgeState:
    def __init__(self):
        self.last_scan = None
        self.listeners = []
        self.lock = threading.Lock()

    def add_listener(self):
        q = queue.Queue(maxsize=10)
        with self.lock:
            self.listeners.append(q)
        return q

    def remove_listener(self, q):
        with self.lock:
            if q in self.listeners:
                self.listeners.remove(q)

    def publish_scan(self, payload):
        with self.lock:
            self.last_scan = payload
            listeners = list(self.listeners)

        for q in listeners:
            try:
                q.put_nowait(payload)
            except queue.Full:
                # Drop oldest queued message and enqueue latest scan.
                try:
                    _ = q.get_nowait()
                    q.put_nowait(payload)
                except queue.Empty:
                    pass


STATE = BridgeState()
STOP_EVENT = threading.Event()


def iso_now():
    return datetime.now(timezone.utc).isoformat()


def sanitize_card(raw_line):
    # Keep only visible ID characters. Parallax readers often append CR/LF and framing chars.
    card = re.sub(r"[^0-9A-Za-z]", "", raw_line or "").upper()
    if len(card) < 4:
        return None
    return card


def serial_reader_loop(device, baud):
    backoff_seconds = 2

    while not STOP_EVENT.is_set():
        try:
            with serial.Serial(device, baudrate=baud, timeout=1) as ser:
                print(f"[rfid-bridge] Listening on {device} @ {baud} baud")
                while not STOP_EVENT.is_set():
                    raw = ser.readline().decode("ascii", errors="ignore").strip()
                    if not raw:
                        continue

                    card_id = sanitize_card(raw)
                    if not card_id:
                        continue

                    payload = {
                        "id": card_id,
                        "raw": raw,
                        "timestamp": iso_now(),
                    }
                    print(f"[rfid-bridge] scan: {card_id}")
                    STATE.publish_scan(payload)
        except Exception as err:
            print(f"[rfid-bridge] serial error: {err}")
            STOP_EVENT.wait(backoff_seconds)


class RequestHandler(BaseHTTPRequestHandler):
    server_version = "RFIDBridge/1.0"

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(HTTPStatus.NO_CONTENT)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            body = {
                "ok": True,
                "service": "rfid-bridge",
                "serial_device": SERIAL_DEVICE,
                "baud": BAUD_RATE,
                "last_scan": STATE.last_scan,
            }
            self._send_json(body)
            return

        if self.path == "/last-scan":
            self._send_json({"last_scan": STATE.last_scan})
            return

        if self.path == "/events":
            self._stream_events()
            return

        self.send_response(HTTPStatus.NOT_FOUND)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, body):
        payload = json.dumps(body).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _stream_events(self):
        listener_q = STATE.add_listener()

        self.send_response(HTTPStatus.OK)
        self._send_cors_headers()
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.end_headers()

        # Send initial connection event.
        self.wfile.write(b"event: ready\n")
        self.wfile.write(f"data: {json.dumps({'timestamp': iso_now()})}\n\n".encode("utf-8"))
        self.wfile.flush()

        try:
            while not STOP_EVENT.is_set():
                try:
                    payload = listener_q.get(timeout=15)
                    self.wfile.write(b"event: scan\n")
                    self.wfile.write(f"data: {json.dumps(payload)}\n\n".encode("utf-8"))
                    self.wfile.flush()
                except queue.Empty:
                    # Keepalive comment to prevent some clients/proxies from closing idle stream.
                    self.wfile.write(b": keepalive\n\n")
                    self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            pass
        finally:
            STATE.remove_listener(listener_q)

    def log_message(self, format_str, *args):
        # Quieter logs for kiosk runtime.
        return


def main():
    reader_thread = threading.Thread(
        target=serial_reader_loop,
        args=(SERIAL_DEVICE, BAUD_RATE),
        daemon=True,
    )
    reader_thread.start()

    httpd = ThreadingHTTPServer((HOST, PORT), RequestHandler)
    print(f"[rfid-bridge] HTTP server running at http://{HOST}:{PORT}")

    def _shutdown(*_):
        STOP_EVENT.set()
        httpd.shutdown()

    signal.signal(signal.SIGINT, _shutdown)
    signal.signal(signal.SIGTERM, _shutdown)

    try:
        httpd.serve_forever(poll_interval=0.5)
    finally:
        STOP_EVENT.set()
        reader_thread.join(timeout=2)
        httpd.server_close()


if __name__ == "__main__":
    main()
