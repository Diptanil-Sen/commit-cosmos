import { useEffect, useRef, useCallback } from 'react';
import { drawFrame, updateUniverse, generateBgStars } from '../utils/renderer';
import { pingCommit } from '../utils/soundEngine';

export default function CosmosCanvas({
  sun,
  planets,
  speed = 1,
  onTooltip,
  onCommitFlash,
  screenshotRef,
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    sun: null,
    planets: [],
    bgStars: generateBgStars(500),
    camX: 0,
    camY: 0,
    camZ: 1,
    targetZ: 1,
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastTime: null,
    speed: 1,
  });

  useEffect(() => {
    if (screenshotRef) {
      screenshotRef.current = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        const user = stateRef.current.sun?.name || 'cosmos';
        link.download = `commit-cosmos-${user}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
    }
  }, [screenshotRef]);

  useEffect(() => {
    stateRef.current.speed = speed;
  }, [speed]);

  useEffect(() => {
    stateRef.current.sun = sun ?? null;
    stateRef.current.planets = planets ?? [];
    if (sun) {
      stateRef.current.camX = 0;
      stateRef.current.camY = 0;
      stateRef.current.camZ = 1;
      stateRef.current.targetZ = 1;
    }
  }, [sun, planets]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function loop(ts) {
      const s = stateRef.current;
      const dt = Math.min((ts - (s.lastTime ?? ts)), 50) * s.speed;
      s.lastTime = ts;
      s.camZ += (s.targetZ - s.camZ) * 0.1;
      if (s.sun && s.planets.length) {
        updateUniverse(s.sun, s.planets, dt);
      }
      drawFrame(ctx, canvas.width, canvas.height, s.sun, s.planets, s.bgStars, s.camX, s.camY, s.camZ);
      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    window.__cosmos_zoom = (factor) => {
      stateRef.current.targetZ = Math.min(5, Math.max(0.1, stateRef.current.targetZ * factor));
    };
    window.__cosmos_reset_cam = () => {
      stateRef.current.camX = 0;
      stateRef.current.camY = 0;
      stateRef.current.targetZ = 1;
    };
    window.__cosmos_focus_planet = (planet) => {
      if (!planet) return;
      stateRef.current.targetZ = 2.5;
      stateRef.current.camX = -(planet.x ?? 0);
      stateRef.current.camY = -(planet.y ?? 0);
    };
  }, []);

  const handleMouseDown = useCallback((e) => {
    stateRef.current.dragging = true;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
  }, []);

  const handleMouseMove = useCallback((e) => {
    const s = stateRef.current;
    if (s.dragging) {
      s.camX += (e.clientX - s.lastX) / s.camZ;
      s.camY += (e.clientY - s.lastY) / s.camZ;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
    } else {
      const canvas = canvasRef.current;
      if (!canvas || !s.sun) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left - canvas.width / 2) / s.camZ - s.camX;
      const my = (e.clientY - rect.top - canvas.height / 2) / s.camZ - s.camY;
      const hit = hitTest(mx, my, s.sun, s.planets);
      onTooltip?.(hit ? { x: e.clientX, y: e.clientY, ...hit } : null);
    }
  }, [onTooltip]);

  const handleMouseUp = useCallback(() => {
    stateRef.current.dragging = false;
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    stateRef.current.targetZ = Math.min(5, Math.max(0.1, stateRef.current.targetZ * factor));
  }, []);

  const touchRef = useRef({ dist: 0 });

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) touchRef.current.dist = pinchDist(e.touches);
    stateRef.current.lastX = e.touches[0].clientX;
    stateRef.current.lastY = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const s = stateRef.current;
    if (e.touches.length === 1) {
      s.camX += (e.touches[0].clientX - s.lastX) / s.camZ;
      s.camY += (e.touches[0].clientY - s.lastY) / s.camZ;
      s.lastX = e.touches[0].clientX;
      s.lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      const newDist = pinchDist(e.touches);
      const factor = newDist / (touchRef.current.dist || newDist);
      s.targetZ = Math.min(5, Math.max(0.1, s.targetZ * factor));
      touchRef.current.dist = newDist;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchRef.current.dist = 0;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab', touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
}

function hitTest(mx, my, sun, planets) {
  if (sun) {
    const dx = mx - (sun.x ?? 0);
    const dy = my - (sun.y ?? 0);
    if (Math.sqrt(dx * dx + dy * dy) < (sun.r ?? 38) + 8) return { type: 'sun', data: sun };
  }
  for (const planet of planets ?? []) {
    const dx = mx - (planet.x ?? 0);
    const dy = my - (planet.y ?? 0);
    if (Math.sqrt(dx * dx + dy * dy) < (planet.r ?? 10) + 6) return { type: 'planet', data: planet };
  }
  return null;
}

function pinchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}