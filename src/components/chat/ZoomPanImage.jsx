import { useRef, useEffect, useState } from "react";

export default function ZoomPanImage({ src, alt, minScale = 1, maxScale = 5 }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const [baseSize, setBaseSize] = useState({ w: 0, h: 0 });
  const scaleRef = useRef(1);
  const txRef = useRef(0);
  const tyRef = useRef(0);

  const pointers = useRef(new Map());
  const startScale = useRef(1);
  const startDist = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const clampScale = (s) => Math.min(maxScale, Math.max(minScale, s));
  const getDistance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const getCenter = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

  const applyTransform = () => {
    const el = imgRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${txRef.current}px, ${tyRef.current}px, 0) scale(${scaleRef.current})`;
  };

  const clampAndApply = () => {
    const c = containerRef.current;
    const { w: bw, h: bh } = baseSize;
    if (!c || !bw || !bh) return;

    const cw = c.clientWidth;
    const ch = c.clientHeight;
    const s = scaleRef.current;
    const dispW = bw * s;
    const dispH = bh * s;

    if (dispW <= cw) {
      txRef.current = (cw - dispW) / 2;
    } else {
      txRef.current = clamp(txRef.current, cw - dispW, 0);
    }
    if (dispH <= ch) {
      tyRef.current = (ch - dispH) / 2;
    } else {
      tyRef.current = clamp(tyRef.current, ch - dispH, 0);
    }
    applyTransform();
  };

  const recalcBaseSize = () => {
    const c = containerRef.current;
    const img = imgRef.current;
    if (!c || !img || !img.naturalWidth || !img.naturalHeight) return;

    const cw = c.clientWidth;
    const ch = c.clientHeight;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    const fit = Math.min(cw / nw, ch / nh);
    const bw = Math.max(1, Math.floor(nw * fit));
    const bh = Math.max(1, Math.floor(nh * fit));
    setBaseSize({ w: bw, h: bh });

    if (scaleRef.current === 1) {
      txRef.current = (cw - bw) / 2;
      tyRef.current = (ch - bh) / 2;
      applyTransform();
    } else {
      clampAndApply();
    }
  };

  const toLocal = (x, y) => {
    const r = containerRef.current.getBoundingClientRect();
    return { x: x - r.left, y: y - r.top };
  };

  const zoomAt = (clientX, clientY, nextScale) => {
    const c = containerRef.current;
    const { w: bw, h: bh } = baseSize;
    if (!c || !bw || !bh) return;

    const prev = scaleRef.current;
    const next = clampScale(nextScale);
    if (next === prev) return;

    const pt = toLocal(clientX, clientY);
    const dispWPrev = bw * prev,
      dispHPrev = bh * prev;
    const dispWNext = bw * next,
      dispHNext = bh * next;

    const ox = pt.x - txRef.current;
    const oy = pt.y - tyRef.current;
    const kx = dispWNext / dispWPrev;
    const ky = dispHNext / dispHPrev;

    txRef.current = pt.x - ox * kx;
    tyRef.current = pt.y - oy * ky;

    scaleRef.current = next;
    clampAndApply();
  };

  useEffect(() => {
    const c = containerRef.current,
      img = imgRef.current;
    if (!c || !img) return;

    c.style.overflow = "hidden";
    c.style.overscrollBehavior = "contain";
    c.style.touchAction = "none";
    img.style.willChange = "transform";
    img.style.transformOrigin = "0 0";
    img.style.userSelect = "none";
    img.draggable = false;

    const onLoad = () => recalcBaseSize();
    if (img.complete) recalcBaseSize();
    else img.addEventListener("load", onLoad);
    const onResize = () => recalcBaseSize();
    window.addEventListener("resize", onResize);

    let lastTap = 0;
    const onPointerDown = (e) => {
      img.setPointerCapture?.(e.pointerId);
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      const now = Date.now();
      if (now - lastTap < 300) {
        zoomAt(e.clientX, e.clientY, scaleRef.current > 1 ? 1 : 2);
      }
      lastTap = now;

      if (pointers.current.size === 1) {
        isPanning.current = scaleRef.current > 1;
        lastPos.current = { x: e.clientX, y: e.clientY };
      } else if (pointers.current.size === 2) {
        const [p1, p2] = [...pointers.current.values()];
        startDist.current = getDistance(p1, p2);
        startScale.current = scaleRef.current;
      }
    };

    const onPointerMove = (e) => {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()];
        const dist = getDistance(a, b) || 1;
        const center = getCenter(a, b);
        zoomAt(
          center.x,
          center.y,
          clampScale((dist / (startDist.current || dist)) * startScale.current)
        );
        isPanning.current = false;
      } else if (isPanning.current && scaleRef.current > 1) {
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        lastPos.current = { x: e.clientX, y: e.clientY };
        txRef.current += dx;
        tyRef.current += dy;
        clampAndApply();
      }
    };

    const onPointerUp = () => {
      pointers.current.clear();
      isPanning.current = false;
      clampAndApply();
    };

    const onWheel = (e) => {
      zoomAt(
        e.clientX,
        e.clientY,
        clampScale(scaleRef.current * Math.exp(-e.deltaY * 0.002))
      );
      e.preventDefault();
    };

    c.addEventListener("wheel", onWheel, { passive: false });
    img.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      c.removeEventListener("wheel", onWheel);
      img.removeEventListener("load", onLoad);
      img.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          display: "block",
          width: baseSize.w ? `${baseSize.w}px` : "100%",
          height: baseSize.h ? `${baseSize.h}px` : "100%",
          transform: "translate3d(0,0,0) scale(1)",
          transition: "transform 0.05s linear",
        }}
      />
    </div>
  );
}
