"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  r: number;
  vx: number;
  vy: number;
  twinkle: number;
  twinkleSpeed: number;
}

/**
 * Ambient background scene: drifting gradient blobs (#6 ambient motion),
 * a parallax dot grid, and a canvas particle field with pointer repulsion.
 * Everything pauses when the tab is hidden or the user prefers reduced motion.
 */
export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;
    let running = true;

    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const spawn = (count: number) => {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.3 + Math.random() * 0.7,
        r: 0.8 + Math.random() * 2.4,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.08 - Math.random() * 0.28,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.008 + Math.random() * 0.02,
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = width < 720 ? 26 : width < 1280 ? 46 : 68;
      spawn(density);
    };

    const readParticleColor = () => {
      const styles = getComputedStyle(document.documentElement);
      return {
        rgb: (styles.getPropertyValue("--particle-color") || "160, 255, 210").trim(),
        alpha: parseFloat(styles.getPropertyValue("--particle-alpha")) || 0.5,
      };
    };

    // Pre-render the glow once per theme instead of building a gradient every frame
    const makeSprite = (rgb: string, alpha: number) => {
      const size = 64;
      const spriteCanvas = document.createElement("canvas");
      spriteCanvas.width = size;
      spriteCanvas.height = size;
      const sctx = spriteCanvas.getContext("2d");
      if (!sctx) return spriteCanvas;
      const half = size / 2;
      const gradient = sctx.createRadialGradient(half, half, 0, half, half, half);
      gradient.addColorStop(0, `rgba(${rgb}, ${alpha})`);
      gradient.addColorStop(0.45, `rgba(${rgb}, ${alpha * 0.35})`);
      gradient.addColorStop(1, `rgba(${rgb}, 0)`);
      sctx.fillStyle = gradient;
      sctx.fillRect(0, 0, size, size);
      return spriteCanvas;
    };

    let tint = readParticleColor();
    let sprite = makeSprite(tint.rgb, tint.alpha);
    const themeObserver = new MutationObserver(() => {
      tint = readParticleColor();
      sprite = makeSprite(tint.rgb, tint.alpha);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      const { rgb, alpha } = tint;
      const coreColor = rgb;

      for (const p of particles) {
        // gentle drift
        p.x += p.vx * p.z * 2.2;
        p.y += p.vy * p.z * 2.2;
        p.twinkle += p.twinkleSpeed;

        // pointer repulsion — the field parts around the cursor
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 20000 && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / 141) * 1.9 * p.z;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        // wrap around the viewport
        if (p.y < -12) {
          p.y = height + 12;
          p.x = Math.random() * width;
        }
        if (p.x < -12) p.x = width + 12;
        if (p.x > width + 12) p.x = -12;

        const flicker = 0.45 + Math.sin(p.twinkle) * 0.45;
        const glowSize = p.r * 11;

        ctx.globalAlpha = Math.min(flicker, 1);
        ctx.drawImage(sprite, p.x - glowSize / 2, p.y - glowSize / 2, glowSize, glowSize);

        ctx.globalAlpha = Math.min(alpha * flicker * 1.8, 0.95);
        ctx.fillStyle = coreColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.z, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(draw);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = e.clientX;
      pointer.ty = e.clientY;
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Blob + grid layers drift slightly against the pointer for parallax depth.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const grid = document.querySelector<HTMLElement>(".ambient-grid");
    const blobs = Array.from(document.querySelectorAll<HTMLElement>(".ambient-blob-layer"));
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const loop = () => {
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      if (grid) grid.style.transform = `translate3d(${cx * 26}px, ${cy * 26}px, 0)`;
      blobs.forEach((layer, i) => {
        const depth = (i + 1) * 12;
        layer.style.transform = `translate3d(${cx * depth}px, ${cy * depth}px, 0)`;
      });
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-blob-layer" style={{ position: "absolute", inset: 0 }}>
        <span className="ambient-blob ambient-blob-1" />
        <span className="ambient-blob ambient-blob-3" />
      </div>
      <div className="ambient-blob-layer" style={{ position: "absolute", inset: 0 }}>
        <span className="ambient-blob ambient-blob-2" />
        <span className="ambient-blob ambient-blob-4" />
      </div>
      <div className="ambient-grid" />
      <canvas ref={canvasRef} className="ambient-canvas" />
      <div className="ambient-vignette" />
    </div>
  );
}
