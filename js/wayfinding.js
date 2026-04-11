// ════════════════════════════════════════════════════════════
//  ECUAD Library Kiosk — wayfinding.js
//  Indoor wayfinding overlay module.
//  Logic extracted verbatim from indoor-wayfinding-path-builder/app.js.
//  Public API:  Wayfinding.initialize(container) → Promise
//               Wayfinding.drawRoute(destinationId)
//               Wayfinding.clearRoute()
// ════════════════════════════════════════════════════════════

const Wayfinding = (() => {

  // ── Bundled asset path ────────────────────────────────────
  const FLOOR_PLAN_PATH = 'maps/floor-1.svg';

  // ── Bundled config (inline — no fetch required) ───────────
  const CONFIG = {
    calibration: { offsetX: 8.5, offsetY: -3, scaleX: 0.97, scaleY: 0.97 },
    kioskId: 'lobby',
    visibleLabelIds: ['main-entrance', 'east-exit'],
    manualPathAttachments: {
      'main-entrance': ['Path 1'],
      'lobby':         ['Path 2'],
      'east-exit':     ['Path 2'],
      'studio-a':      ['lobby'],
      'computer-lab':  ['lobby'],
      'room-13':       ['Path 3'],
      'room-12':       ['Path 4'],
      'room-11':       ['Path 5'],
      'room-10':       ['Path 5'],
      'room-9':        ['Path 5'],
      'room-7':        ['Path 5'],
      'room-8':        ['Path 6'],
      'room-6':        ['Path 6'],
    },
    rooms: [
      { id: 'main-entrance', name: 'Main Entrance',    markerType: 'entrance',  xPct: 58.62, yPct: 81.58 },
      { id: 'lobby',         name: 'Kiosk',            markerType: 'kiosk',     xPct: 74.37, yPct: 78.10 },
      { id: 'studio-a',      name: 'Printer 1',        markerType: 'printer',   xPct: 63.81, yPct: 51.60 },
      { id: 'computer-lab',  name: 'Printer 2',        markerType: 'printer',   xPct: 63.81, yPct: 61.08 },
      { id: 'east-exit',     name: 'Service Desk',     markerType: 'service',   xPct: 75.76, yPct: 69.95 },
      { id: 'room-6',        name: 'Charging Spot 1',  markerType: 'charging',  xPct: 17.39, yPct: 21.50 },
      { id: 'room-7',        name: 'Charging Spot 2',  markerType: 'charging',  xPct: 16.92, yPct: 37.69 },
      { id: 'room-8',        name: 'Bookshelf E',      markerType: 'bookshelf', xPct:  7.93, yPct: 23.66 },
      { id: 'room-9',        name: 'Bookshelf D',      markerType: 'bookshelf', xPct:  8.31, yPct: 36.37 },
      { id: 'room-10',       name: 'Bookshelf C',      markerType: 'bookshelf', xPct:  8.40, yPct: 49.44 },
      { id: 'room-11',       name: 'Bookshelf B',      markerType: 'bookshelf', xPct: 18.40, yPct: 52.20 },
      { id: 'room-12',       name: 'Bookshelf A',      markerType: 'bookshelf', xPct: 31.93, yPct: 52.44 },
      { id: 'room-13',       name: 'Computers',        markerType: 'computer',  xPct: 51.02, yPct: 62.27 },
      { id: 'destination-14', name: 'Path 1', xPct: 58.62, yPct: 81.58 },
      { id: 'destination-15', name: 'Path 2', xPct: 60.00, yPct: 63.00 },
      { id: 'destination-16', name: 'Path 3', xPct: 50.00, yPct: 49.00 },
      { id: 'destination-18', name: 'Path 4', xPct: 32.03, yPct: 44.05 },
      { id: 'destination-19', name: 'Path 5', xPct: 12.20, yPct: 43.81 },
      { id: 'destination-20', name: 'Path 6', xPct: 11.92, yPct: 24.38 },
    ],
  };

  // ── Module state ──────────────────────────────────────────
  let _container     = null;
  let _imgEl         = null;
  let _svgEl         = null;
  let _config        = null;
  let _routePath     = null;
  let _highlightedId = null;
  let _observer      = null;
  // ── Calibration helper ────────────────────────────────────
  // Applies offsetX/Y and scaleX/Y from config.calibration to a rendered
  // pixel coordinate.  All drawn points (icons, route, pulse) pass through here.
  function _cal(x, y) {
    const c = (_config && _config.calibration) || {};
    return {
      x: x * (c.scaleX !== undefined ? c.scaleX : 1) + (c.offsetX || 0),
      y: y * (c.scaleY !== undefined ? c.scaleY : 1) + (c.offsetY || 0),
    };
  }


  // ── Public API ────────────────────────────────────────────

  /**
   * Mount the wayfinding map into `container`, load the SVG floor plan and
   * JSON config, then call drawRoute / clearRoute to control the overlay.
   * Returns a Promise that resolves when the config has loaded.
   */
  function initialize(container) {
    // Teardown any previous instance
    if (_observer) { _observer.disconnect(); _observer = null; }
    _container     = container;
    _routePath     = null;
    _highlightedId = null;
    _config        = null;

    // Container must be a positioned block so the SVG overlay can sit on top
    _container.style.position = 'relative';
    _container.style.overflow = 'hidden';

    // Floor plan image — fills container, no letter-boxing so % coords map directly
    _imgEl = document.createElement('img');
    _imgEl.src = FLOOR_PLAN_PATH;
    _imgEl.style.cssText = 'display:block;width:100%;height:100%;object-fit:fill;border:none;';
    _container.appendChild(_imgEl);

    // SVG overlay — positioned over the image
    _svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    _svgEl.style.cssText = 'position:absolute;top:0;left:0;overflow:visible;pointer-events:none;';
    _container.appendChild(_svgEl);

    // Re-render whenever the container is resized (Raspberry Pi screen rotation, etc.)
    _observer = new ResizeObserver(() => _render());
    _observer.observe(_container);

    // Show error if the floor plan can't be found
    _imgEl.addEventListener('error', () => {
      _container.innerHTML = '<p style="padding:20px 16px;color:#ef4444;font:600 13px/1.5 Inter,system-ui,sans-serif;">Map unavailable — floor plan could not be loaded.</p>';
    });

    // Re-render on image load
    _imgEl.addEventListener('load', () => _render());
    if (_imgEl.complete && _imgEl.naturalWidth) {
      // already cached — schedule a render after the caller's .then() resolves
      setTimeout(() => _render(), 0);
    }

    // Config is inlined — no fetch needed, works with file:// and any server
    _config = CONFIG;

    _render();
    return Promise.resolve();
  }

  /** Draw the shortest route from the kiosk to `destinationId` and highlight it. */
  function drawRoute(destinationId) {
    if (!_config) return;
    _highlightedId = destinationId;
    const kioskId  = _config.kioskId || 'lobby';
    const routing  = _buildRoutingData();
    const result   = _findRoute(kioskId, destinationId, routing.graph, routing.allPoints);
    _routePath     = result ? result.path : null;
    _render();
  }

  /** Clear the route line, leaving all destination markers visible. */
  function clearRoute() {
    _routePath     = null;
    _highlightedId = null;
    _render();
  }


  // ── Rendering ─────────────────────────────────────────────

  function _render() {
    if (!_svgEl || !_config) return;
    _svgEl.innerHTML = '';

    // Bail until the image has rendered dimensions
    if (!_imgEl || !_imgEl.complete || !_imgEl.naturalWidth) return;

    // Calculate the exact rendered rect of the floor plan.
    // object-fit:contain letterboxes the image — the SVG overlay must cover
    // only the image area (not the bars) so markers align with the floor plan.
    const cRect = _container.getBoundingClientRect();
    const cW    = cRect.width;
    const cH    = cRect.height;
    const nW    = _imgEl.naturalWidth;
    const nH    = _imgEl.naturalHeight;
    const scale = Math.min(cW / nW, cH / nH);
    const rW    = nW * scale;
    const rH    = nH * scale;
    const left  = (cW - rW) / 2;
    const top_  = (cH - rH) / 2;

    _svgEl.style.left   = `${left}px`;
    _svgEl.style.top    = `${top_}px`;
    _svgEl.style.width  = `${rW}px`;
    _svgEl.style.height = `${rH}px`;
    _svgEl.setAttribute('viewBox', `0 0 ${rW} ${rH}`);
    _svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Inject label font style once
    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = '.wf-label{font:600 11px/1 Inter,system-ui,sans-serif;fill:#111827;}';
    _svgEl.appendChild(styleEl);

    const routing   = _buildRoutingData();
    const allPoints = routing.allPoints;

    // ── Route lines ──────────────────────────────────────────
    if (_routePath && _routePath.length > 1) {
      const svgPts = _routePath
        .map(id => allPoints.find(p => p.id === id))
        .filter(Boolean)
        .map(pt => _cal(_pctToPxX(pt.xPct, rW), _pctToPxY(pt.yPct, rH)));

      const pathData = _buildSmoothRoutePath(svgPts);

      // Background solid line
      const bgLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      bgLine.setAttribute('d', pathData);
      bgLine.setAttribute('fill', 'none');
      bgLine.setAttribute('stroke', '#2563eb');
      bgLine.setAttribute('stroke-width', '4.5');
      bgLine.setAttribute('opacity', '0.35');
      bgLine.setAttribute('stroke-linecap', 'round');
      bgLine.setAttribute('stroke-linejoin', 'round');
      _svgEl.appendChild(bgLine);

      // Animated dotted line
      const dottedLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      dottedLine.setAttribute('d', pathData);
      dottedLine.setAttribute('fill', 'none');
      dottedLine.setAttribute('stroke', '#2563eb');
      dottedLine.setAttribute('stroke-width', '7');
      dottedLine.setAttribute('stroke-linecap', 'round');
      dottedLine.setAttribute('stroke-linejoin', 'round');
      dottedLine.setAttribute('stroke-dasharray', '0.01 15');

      const animDots = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      animDots.setAttribute('attributeName', 'stroke-dashoffset');
      animDots.setAttribute('values', '0;-180');
      animDots.setAttribute('dur', '2.6s');
      animDots.setAttribute('repeatCount', 'indefinite');
      dottedLine.appendChild(animDots);

      _svgEl.appendChild(dottedLine);
    }

    // ── Destination markers ───────────────────────────────────
    const visibleLabels = new Set(_config.visibleLabelIds || []);

    routing.destinationRooms.forEach(room => {
      const { x: cx, y: cy } = _cal(_pctToPxX(room.xPct, rW), _pctToPxY(room.yPct, rH));

      _svgEl.appendChild(_makeDestinationMarker(room, cx, cy, room.id === _highlightedId));

      if (!visibleLabels.has(room.id)) return;

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      // Per-label placement: service desk goes right, entrance goes below
      if (room.id === 'east-exit') {
        label.setAttribute('x', cx + 14);
        label.setAttribute('y', cy + 4);
        label.setAttribute('text-anchor', 'start');
      } else {
        label.setAttribute('x', cx);
        label.setAttribute('y', cy + 28);
        label.setAttribute('text-anchor', 'middle');
      }
      label.setAttribute('class', 'wf-label');
      label.textContent = room.name;
      _svgEl.appendChild(label);
    });
  }


  // ── Routing (verbatim from prototype) ─────────────────────

  function _buildRoutingData() {
    const destinationRooms = _config.rooms.filter(r => !_isPathRoom(r));
    const pathRooms        = _getOrderedPathRooms();

    const pathNodes = pathRooms.map((room, index) => ({
      id:           `path-node-${index + 1}`,
      name:         room.name,
      xPct:         room.xPct,
      yPct:         room.yPct,
      sourceRoomId: room.id,
    }));

    const allPoints       = [...destinationRooms, ...pathNodes];
    const graph           = {};
    const pathNodeByName  = new Map(pathNodes.map(n => [n.name.toLowerCase(), n]));
    const manualMap       = _config.manualPathAttachments || {};

    allPoints.forEach(p => { graph[p.id] = []; });

    // Chain consecutive path nodes
    for (let i = 0; i < pathNodes.length - 1; i++) {
      _addBidirectionalEdge(graph, pathNodes[i].id, pathNodes[i + 1].id);
    }

    // Connect destinations to path nodes (manual first, nearest as fallback)
    destinationRooms.forEach(room => {
      if (!pathNodes.length) return;
      const manual = manualMap[room.id];
      if (Array.isArray(manual) && manual.length) {
        manual.forEach(pathName => {
          const node = pathNodeByName.get(String(pathName).toLowerCase());
          if (node) {
            // Normal case: attach to a named path node
            _addBidirectionalEdge(graph, room.id, node.id);
          } else {
            // Direct case: treat as a destination room ID (e.g. 'lobby')
            // so the route skips the path network entirely for this leg
            const dest = destinationRooms.find(d => d.id === pathName);
            if (dest) _addBidirectionalEdge(graph, room.id, dest.id);
          }
        });
        return;
      }
      const nearest = _nearestPathNode(room, pathNodes);
      _addBidirectionalEdge(graph, room.id, nearest.id);
    });

    return { destinationRooms, pathNodes, allPoints, graph };
  }

  function _addBidirectionalEdge(graph, a, b) {
    if (!a || !b || a === b) return;
    if (!graph[a]) graph[a] = [];
    if (!graph[b]) graph[b] = [];
    if (!graph[a].includes(b)) graph[a].push(b);
    if (!graph[b].includes(a)) graph[b].push(a);
  }

  function _nearestPathNode(room, pathNodes) {
    let best = pathNodes[0];
    let bestDist = Infinity;
    pathNodes.forEach(node => {
      const d = Math.hypot(node.xPct - room.xPct, node.yPct - room.yPct);
      if (d < bestDist) { bestDist = d; best = node; }
    });
    return best;
  }

  function _findRoute(startId, endId, graph, allPoints) {
    const ids      = new Set(allPoints.map(p => p.id));
    const dist     = {};
    const prev     = {};
    const unvisited = new Set(ids);

    ids.forEach(id => { dist[id] = Infinity; });
    dist[startId] = 0;

    while (unvisited.size) {
      let current = null;
      let best    = Infinity;
      for (const id of unvisited) {
        if (dist[id] < best) { best = dist[id]; current = id; }
      }
      if (!current || best === Infinity) break;
      if (current === endId) break;
      unvisited.delete(current);

      for (const neighbor of (graph[current] || [])) {
        if (!unvisited.has(neighbor)) continue;
        const a   = allPoints.find(p => p.id === current);
        const b   = allPoints.find(p => p.id === neighbor);
        const alt = dist[current] + (a && b ? Math.hypot(b.xPct - a.xPct, b.yPct - a.yPct) : Infinity);
        if (alt < dist[neighbor]) { dist[neighbor] = alt; prev[neighbor] = current; }
      }
    }

    if (dist[endId] === Infinity) return null;

    const path = [];
    let curr = endId;
    while (curr) { path.unshift(curr); curr = prev[curr]; }
    return { path, distance: dist[endId] };
  }

  function _getOrderedPathRooms() {
    return _config.rooms
      .filter(r => _isPathRoom(r))
      .sort((a, b) => _extractPathNumber(a.name) - _extractPathNumber(b.name));
  }

  function _isPathRoom(room) {
    return /^path\s+\d+$/i.test((room.name || '').trim());
  }

  function _extractPathNumber(name) {
    const m = String(name || '').trim().match(/^path\s+(\d+)$/i);
    return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
  }


  // ── Geometry helpers (verbatim from prototype) ────────────

  function _pctToPxX(xPct, width)  { return (xPct / 100) * width;  }
  function _pctToPxY(yPct, height) { return (yPct / 100) * height; }

  function _buildSmoothRoutePath(points) {
    if (!points.length) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const ctrl  = points[i];
      const next  = points[i + 1];
      const midX  = (ctrl.x + next.x) / 2;
      const midY  = (ctrl.y + next.y) / 2;
      d += ` Q ${ctrl.x} ${ctrl.y}, ${midX} ${midY}`;
    }
    const sl = points[points.length - 2];
    const la = points[points.length - 1];
    d += ` Q ${sl.x} ${sl.y}, ${la.x} ${la.y}`;
    return d;
  }


  // ── Marker drawing (verbatim from prototype) ──────────────

  function _makeDestinationMarker(room, cx, cy, isHighlighted) {
    const ns         = 'http://www.w3.org/2000/svg';
    const markerType = room.markerType || 'generic';
    const group      = document.createElementNS(ns, 'g');
    group.setAttribute('transform', `translate(${cx} ${cy}) scale(1.75)`);

    // Transparent touch target
    const tt = document.createElementNS(ns, 'circle');
    tt.setAttribute('cx', '0'); tt.setAttribute('cy', '0');
    tt.setAttribute('r', '16'); tt.setAttribute('fill', 'transparent');
    group.appendChild(tt);

    // Destination pulse animation
    if (isHighlighted) {
      const pulse = document.createElementNS(ns, 'circle');
      pulse.setAttribute('cx', '0'); pulse.setAttribute('cy', '0');
      pulse.setAttribute('r', '7');
      pulse.setAttribute('fill', 'none');
      pulse.setAttribute('stroke', '#f59e0b');
      pulse.setAttribute('stroke-width', '1.1');
      pulse.setAttribute('opacity', '0.9');

      const animR = document.createElementNS(ns, 'animate');
      animR.setAttribute('attributeName', 'r');
      animR.setAttribute('values', '7;13;7');
      animR.setAttribute('dur', '1.4s');
      animR.setAttribute('repeatCount', 'indefinite');

      const animO = document.createElementNS(ns, 'animate');
      animO.setAttribute('attributeName', 'opacity');
      animO.setAttribute('values', '0.9;0;0.9');
      animO.setAttribute('dur', '1.4s');
      animO.setAttribute('repeatCount', 'indefinite');

      pulse.append(animR, animO);
      group.appendChild(pulse);
    }

    if (markerType === 'entrance') {
      const s = document.createElementNS(ns, 'polygon');
      s.setAttribute('points', '0,-7 7,0 0,7 -7,0');
      s.setAttribute('fill', '#0ea5e9');
      group.appendChild(s);

    } else if (markerType === 'kiosk') {
      const pin = document.createElementNS(ns, 'path');
      pin.setAttribute('d', 'M0,-7 C3.6,-7 6,-4.4 6,-1.5 C6,1.9 2.9,4.8 0,8 C-2.9,4.8 -6,1.9 -6,-1.5 C-6,-4.4 -3.6,-7 0,-7 Z');
      pin.setAttribute('fill', '#dc2626');
      pin.setAttribute('stroke', '#7f1d1d');
      pin.setAttribute('stroke-width', '0.9');
      group.appendChild(pin);
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', '0'); dot.setAttribute('cy', '-1.8');
      dot.setAttribute('r', '2'); dot.setAttribute('fill', '#ffffff');
      group.appendChild(dot);

    } else if (markerType === 'printer') {
      const body = document.createElementNS(ns, 'rect');
      body.setAttribute('x', '-6.5'); body.setAttribute('y', '-2');
      body.setAttribute('width', '13'); body.setAttribute('height', '7');
      body.setAttribute('rx', '1.5'); body.setAttribute('fill', '#f10080');
      group.appendChild(body);
      const paper = document.createElementNS(ns, 'rect');
      paper.setAttribute('x', '-4.5'); paper.setAttribute('y', '-6');
      paper.setAttribute('width', '9'); paper.setAttribute('height', '4.5');
      paper.setAttribute('rx', '0.8'); paper.setAttribute('fill', '#ff80c0');
      group.appendChild(paper);

    } else if (markerType === 'bookshelf') {
      const shelf = document.createElementNS(ns, 'rect');
      shelf.setAttribute('x', '-6.5'); shelf.setAttribute('y', '-6');
      shelf.setAttribute('width', '13'); shelf.setAttribute('height', '12');
      shelf.setAttribute('rx', '1.5'); shelf.setAttribute('fill', '#0f766e');
      group.appendChild(shelf);
      ['-3', '0', '3'].forEach(x => {
        const d = document.createElementNS(ns, 'line');
        d.setAttribute('x1', x); d.setAttribute('y1', '-5');
        d.setAttribute('x2', x); d.setAttribute('y2', '5');
        d.setAttribute('stroke', '#99f6e4'); d.setAttribute('stroke-width', '1.2');
        group.appendChild(d);
      });

    } else if (markerType === 'charging') {
      const bolt = document.createElementNS(ns, 'polygon');
      bolt.setAttribute('points', '-1,-7 4,-7 0,-1 4,-1 -3,7 -1,1 -5,1');
      bolt.setAttribute('fill', '#b4d000');
      bolt.setAttribute('stroke', '#96ae00');
      bolt.setAttribute('stroke-width', '0.8');
      group.appendChild(bolt);

    } else if (markerType === 'computer') {
      const scr = document.createElementNS(ns, 'rect');
      scr.setAttribute('x', '-6.5'); scr.setAttribute('y', '-6');
      scr.setAttribute('width', '13'); scr.setAttribute('height', '8');
      scr.setAttribute('rx', '1.2'); scr.setAttribute('fill', '#1d4ed8');
      group.appendChild(scr);
      const stand = document.createElementNS(ns, 'rect');
      stand.setAttribute('x', '-1.2'); stand.setAttribute('y', '2.5');
      stand.setAttribute('width', '2.4'); stand.setAttribute('height', '3');
      stand.setAttribute('fill', '#60a5fa');
      group.appendChild(stand);
      const base = document.createElementNS(ns, 'rect');
      base.setAttribute('x', '-4.5'); base.setAttribute('y', '5.5');
      base.setAttribute('width', '9'); base.setAttribute('height', '1.8');
      base.setAttribute('rx', '0.8'); base.setAttribute('fill', '#60a5fa');
      group.appendChild(base);

    } else if (markerType === 'service') {
      const hex = document.createElementNS(ns, 'polygon');
      hex.setAttribute('points', '-6,0 -3,-6 3,-6 6,0 3,6 -3,6');
      hex.setAttribute('fill', '#7c3aed');
      group.appendChild(hex);
      const center = document.createElementNS(ns, 'circle');
      center.setAttribute('cx', '0'); center.setAttribute('cy', '0');
      center.setAttribute('r', '1.6'); center.setAttribute('fill', '#ede9fe');
      group.appendChild(center);

    } else {
      // generic
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', '0'); c.setAttribute('cy', '0');
      c.setAttribute('r', '6'); c.setAttribute('fill', '#2563eb');
      group.appendChild(c);
    }

    return group;
  }


  // ── Expose public API ─────────────────────────────────────
  return { initialize, drawRoute, clearRoute };

})();
