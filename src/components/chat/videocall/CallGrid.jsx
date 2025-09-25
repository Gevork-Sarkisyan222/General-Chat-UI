import React from "react";

export default function CallGrid({
  localVideoRef,
  localStream,
  remoteStreams,
  camEnabled,
  micEnabled,
}) {
  const containerRef = React.useRef(null);
  const [levels, setLevels] = React.useState({ self: 0 });
  const acRef = React.useRef(null);
  const metersRef = React.useRef(new Map());
  const rafRef = React.useRef(null);

  const [layout, setLayout] = React.useState({
    cols: 1,
    rows: 1,
    w: 320,
    h: 180,
  });

  const ASPECT = 16 / 9;
  const total = 1 + (remoteStreams?.length || 0);

  const tiles = React.useMemo(() => {
    const arr = [{ id: "self", kind: "self", stream: localStream }];
    for (const r of remoteStreams || []) {
      arr.push({ id: r.peerId, kind: "remote", stream: r.stream });
    }
    return arr;
  }, [localStream, remoteStreams]);

  const maxColsForWidth = React.useCallback((W) => {
    if (W <= 340) return 1;
    if (W <= 520) return 2;
    if (W <= 900) return 3;
    return 4;
  }, []);

  const computeBest = React.useCallback(
    (n, W, H) => {
      const preferOneColOnPhone = n <= 2 && W <= 520;
      const GAP = W <= 520 ? 10 : 12;

      let best = { cols: 1, rows: 1, w: W, h: H };
      let bestArea = 0;
      const maxCols = preferOneColOnPhone ? 1 : Math.min(n, maxColsForWidth(W));

      for (let cols = 1; cols <= maxCols; cols++) {
        const rows = Math.ceil(n / cols);
        let w = Math.floor((W - GAP * (cols - 1)) / cols);
        let h = Math.floor(w / ASPECT);

        const totalH = rows * h + GAP * (rows - 1);
        if (totalH > H) {
          h = Math.floor((H - GAP * (rows - 1)) / rows);
          w = Math.floor(h * ASPECT);
        }

        const fitW = cols * w + GAP * (cols - 1);
        const fitH = rows * h + GAP * (rows - 1);
        const scale = Math.min(W / fitW, H / fitH, 1);
        w = Math.floor(w * scale);
        h = Math.floor(h * scale);

        const area = w * h;
        if (area > bestArea) {
          bestArea = area;
          best = { cols, rows, w, h };
        }
      }
      return best;
    },
    [maxColsForWidth]
  );

  const recalc = React.useCallback(() => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    setLayout(
      computeBest(total, Math.floor(r.width) - 2, Math.floor(r.height) - 2)
    );
  }, [computeBest, total]);

  React.useEffect(() => {
    recalc();
    window.addEventListener("resize", recalc);
    window.addEventListener("orientationchange", recalc);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("orientationchange", recalc);
    };
  }, [recalc]);

  const attachMeter = React.useCallback((id, stream) => {
    if (!stream) return;
    try {
      if (!acRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        acRef.current = new Ctx();
      }
      acRef.current.resume?.();
      if (metersRef.current.has(id)) return;

      const source = acRef.current.createMediaStreamSource(stream);
      const analyser = acRef.current.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      metersRef.current.set(id, { analyser, data });
    } catch {}
  }, []);

  React.useEffect(() => {
    const ids = new Set(tiles.map((t) => t.id));
    tiles.forEach((t) => attachMeter(t.id, t.stream || null));
    for (const id of Array.from(metersRef.current.keys())) {
      if (!ids.has(id)) metersRef.current.delete(id);
    }

    const tick = () => {
      const next = {};
      metersRef.current.forEach(({ analyser, data }, id) => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        const prev = levels[id] ?? 0;
        next[id] = Math.min(1, prev * 0.7 + rms * 0.3);
      });
      setLevels((prev) => ({ ...prev, ...next }));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [tiles, attachMeter, levels]);

  const cssVars = {
    "--cols": String(layout.cols),
    "--tile-w": `${layout.w}px`,
    "--tile-h": `${layout.h}px`,
  };

  // классы-модификаторы для мобильной сетки
  const count = tiles.length;
  const gridMod =
    count === 1
      ? "call-grid--solo"
      : count === 2
      ? "call-grid--two"
      : "call-grid--many";

  return (
    <div ref={containerRef} className={`call-grid ${gridMod}`} style={cssVars}>
      {tiles.map((t) => (
        <Tile
          key={t.id}
          id={t.id}
          kind={t.kind}
          stream={t.stream}
          videoRef={t.kind === "self" ? localVideoRef : undefined}
          self={t.kind === "self"}
          speaking={(levels[t.id] ?? 0) > 0.08}
        />
      ))}
    </div>
  );
}

function Tile({ id, kind, stream, videoRef, self, speaking }) {
  const localRef = React.useRef(null);
  const ref = videoRef ?? localRef;

  React.useEffect(() => {
    const el = ref.current;
    if (!el || !stream) return;
    try {
      el.srcObject = stream;
      el.muted = kind === "self";
      el.playsInline = true;
      void el.play?.();
    } catch {}
  }, [ref, stream, kind]);

  return (
    <div
      className={[
        "tile",
        self ? "tile--self" : "",
        speaking ? "tile--speaking" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <video ref={ref} className="tile__video" autoPlay playsInline />
      <div className="tile__badges">
        <span className="pill">{self ? "Вы" : id.slice(0, 5)}</span>
      </div>
    </div>
  );
}
