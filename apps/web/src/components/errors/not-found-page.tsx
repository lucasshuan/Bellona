"use client";

import { useEffect, useRef, useState } from "react";

import { Link } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, RotateCcw } from "lucide-react";

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      decay: number;
      color: string;
      isStar: boolean;
    };

    const particles: Particle[] = [];
    const COLORS = ["#c00b3b", "#8f0c1b", "#e7d7f3", "#f7f0f3", "#ff4466"];

    const spawnParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.6 - 0.1,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.7 + 0.3,
      decay: Math.random() * 0.003 + 0.001,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      isStar: Math.random() > 0.6,
    });

    for (let i = 0; i < 120; i++) particles.push(spawnParticle());

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y < -10) {
          particles[i] = spawnParticle();
          particles[i].y = canvas.height + 5;
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.isStar) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size * 2);
          ctx.lineTo(p.x, p.y + p.size * 2);
          ctx.moveTo(p.x - p.size * 2, p.y);
          ctx.lineTo(p.x + p.size * 2, p.y);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.7;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
}

function GlitchText() {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const trigger = () => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 400);
    };

    const interval = setInterval(trigger, 2800 + Math.random() * 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative select-none"
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      <span
        className={cn(
          "block text-[clamp(7rem,22vw,18rem)] leading-none font-black tracking-tighter",
          "bg-clip-text text-transparent",
          "bg-linear-to-b from-white via-[#f7f0f3] to-[#c00b3b]",
          glitching && "animate-[glitch-shake_0.4s_steps(4,end)]",
        )}
        style={{
          textShadow: glitching
            ? "4px 0 0 #c00b3b, -4px 0 0 #e7d7f3"
            : "0 0 60px rgba(192,11,59,0.35)",
          WebkitTextStroke: glitching ? "1px rgba(192,11,59,0.6)" : undefined,
        }}
        aria-label="404"
      >
        404
      </span>

      {glitching && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 block text-[clamp(7rem,22vw,18rem)] leading-none font-black tracking-tighter text-[#c00b3b]/60"
            style={{
              transform: "translate(6px, 2px)",
              clipPath: "inset(30% 0 40% 0)",
            }}
          >
            404
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 block text-[clamp(7rem,22vw,18rem)] leading-none font-black tracking-tighter text-[#e7d7f3]/40"
            style={{
              transform: "translate(-5px, -2px)",
              clipPath: "inset(60% 0 10% 0)",
            }}
          >
            404
          </span>
        </>
      )}
    </div>
  );
}

function Scanlines() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.025]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
        backgroundSize: "100% 3px",
      }}
    />
  );
}

export function NotFoundPage() {
  return (
    <main className="relative flex min-h-[calc(100vh-137px)] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      <ParticleCanvas />
      <Scanlines />

      <div
        aria-hidden="true"
        className="animate-breathe pointer-events-none absolute top-1/2 left-1/2 -z-10 aspect-square w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, #c00b3b 22%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        <GlitchText />

        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Essa batalha não existe
          </h1>
          <p className="text-muted mx-auto max-w-md text-sm leading-7 sm:text-base">
            O campo de batalha que você procura foi desativado, nunca existiu,
            ou foi deletado do servidor.{" "}
            <span className="text-[#c00b3b]">Recalibrar coordenadas?</span>
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs text-white/50 backdrop-blur-sm">
          <span className="size-1.5 animate-pulse rounded-full bg-[#c00b3b]" />
          ERR_ROUTE_NOT_FOUND · HTTP 404
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className={cn(
              buttonVariants({ intent: "primary", size: "lg" }),
              "group gap-2",
            )}
          >
            <Home className="size-4 transition-transform group-hover:-translate-y-0.5" />
            Voltar para o início
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className={cn(
              buttonVariants({ intent: "secondary", size: "lg" }),
              "group gap-2",
            )}
          >
            <RotateCcw className="size-4 transition-transform group-hover:-rotate-45" />
            Página anterior
          </button>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 h-px w-64 -translate-x-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(192,11,59,0.6), transparent)",
        }}
      />
    </main>
  );
}
