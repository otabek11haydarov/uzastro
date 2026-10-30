"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  base: number;
  speed: number;
  phase: number;
  hue: number;
}

export default function Starfield({ density = 0.00012 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let raf = 0;
    let shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor(w * h * density);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.2,
        base: Math.random() * 0.6 + 0.25,
        speed: Math.random() * 1.6 + 0.4,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.2 ? 200 : Math.random() < 0.3 ? 265 : 220,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = reduce ? s.base : s.base * (0.55 + 0.45 * Math.sin(t / 1000 * s.speed + s.phase));
        ctx.beginPath();
        ctx.fillStyle = `hsla(${s.hue}, 90%, 85%, ${a})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce) {
        if (!shooting && Math.random() < 0.0025) {
          shooting = { x: Math.random() * w * 0.8, y: Math.random() * h * 0.4, vx: 9, vy: 4, life: 1 };
        }
        if (shooting) {
          const g = ctx.createLinearGradient(shooting.x, shooting.y, shooting.x - shooting.vx * 9, shooting.y - shooting.vy * 9);
          g.addColorStop(0, `rgba(255,255,255,${shooting.life})`);
          g.addColorStop(1, "rgba(53,200,255,0)");
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(shooting.x, shooting.y);
          ctx.lineTo(shooting.x - shooting.vx * 9, shooting.y - shooting.vy * 9);
          ctx.stroke();
          shooting.x += shooting.vx;
          shooting.y += shooting.vy;
          shooting.life -= 0.018;
          if (shooting.life <= 0 || shooting.x > w || shooting.y > h) shooting = null;
        }
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0" />;
}
