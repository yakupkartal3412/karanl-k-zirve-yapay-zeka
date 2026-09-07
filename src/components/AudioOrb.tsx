import { useEffect, useRef } from "react";
import { getAnalyserNode } from "../utils/audioPlayer";

export type VoiceState = "idle" | "listening" | "thinking" | "speaking";

interface AudioOrbProps {
  state: VoiceState;
  isMuted?: boolean;
}

export function AudioOrb({ state, isMuted = false }: AudioOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let analyser: AnalyserNode | null = null;
    try {
      analyser = getAnalyserNode();
    } catch {}

    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    let time = 0;
    let smoothEnergy = 0;
    let smoothRadius = 0;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.28;

      // Audio frequency analysis
      let rawEnergy = 0;
      if (analyser && !isMuted && (state === "listening" || state === "speaking")) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        const bins = Math.min(32, dataArray.length);
        for (let i = 0; i < bins; i++) {
          sum += dataArray[i];
        }
        rawEnergy = sum / (bins * 255);
      }

      // Smooth interpolation for elegant, calm motion
      smoothEnergy += (rawEnergy - smoothEnergy) * 0.2;
      const targetExpansion = state === "speaking" ? smoothEnergy * 0.35 : smoothEnergy * 0.25;
      smoothRadius += (targetExpansion - smoothRadius) * 0.15;

      const speed = state === "thinking" ? 1.8 : state === "speaking" ? 1.4 : 0.8;
      time += 0.02 * speed;

      // 1. Subtle, calm background aura (Very soft ambient glow)
      const auraRadius = baseRadius * (1.3 + smoothRadius * 1.2);
      const auraGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.5,
        centerX,
        centerY,
        auraRadius
      );

      if (state === "thinking") {
        auraGradient.addColorStop(0, "rgba(56, 189, 248, 0.25)");
        auraGradient.addColorStop(0.5, "rgba(99, 102, 241, 0.1)");
        auraGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else if (state === "speaking") {
        auraGradient.addColorStop(0, "rgba(16, 185, 129, 0.28)");
        auraGradient.addColorStop(0.5, "rgba(20, 184, 166, 0.12)");
        auraGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else if (state === "listening") {
        auraGradient.addColorStop(0, "rgba(16, 185, 129, 0.22)");
        auraGradient.addColorStop(0.5, "rgba(16, 185, 129, 0.08)");
        auraGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        auraGradient.addColorStop(0, "rgba(255, 255, 255, 0.06)");
        auraGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      }

      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Main Fluid Minimalist Organic Circle (ChatGPT style)
      // Uses 3 harmonic sines for a calm, liquid feel without visual noise
      const segments = 64;
      const currentRadius = baseRadius * (1 + smoothRadius);
      const wobbleAmount =
        state === "speaking"
          ? 6 + smoothEnergy * 14
          : state === "listening"
          ? 4 + smoothEnergy * 8
          : state === "thinking"
          ? 5
          : 2.5;

      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;

        const wave1 = Math.sin(theta * 3 + time * 1.5) * wobbleAmount;
        const wave2 = Math.cos(theta * 2 - time * 1.2) * (wobbleAmount * 0.6);
        const breathe = Math.sin(time) * 3;

        const r = currentRadius + wave1 + wave2 + breathe;
        const x = centerX + Math.cos(theta) * r;
        const y = centerY + Math.sin(theta) * r;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Clean, elegant gradient inside orb
      const orbGrad = ctx.createRadialGradient(
        centerX - currentRadius * 0.3,
        centerY - currentRadius * 0.3,
        currentRadius * 0.1,
        centerX,
        centerY,
        currentRadius * 1.1
      );

      if (state === "thinking") {
        orbGrad.addColorStop(0, "#e0f2fe");
        orbGrad.addColorStop(0.35, "#38bdf8");
        orbGrad.addColorStop(0.75, "#2563eb");
        orbGrad.addColorStop(1, "#1e1b4b");
      } else if (state === "speaking") {
        orbGrad.addColorStop(0, "#ecfdf5");
        orbGrad.addColorStop(0.35, "#34d399");
        orbGrad.addColorStop(0.75, "#059669");
        orbGrad.addColorStop(1, "#064e3b");
      } else if (state === "listening") {
        orbGrad.addColorStop(0, "#f0fdf4");
        orbGrad.addColorStop(0.4, "#10b981");
        orbGrad.addColorStop(0.8, "#047857");
        orbGrad.addColorStop(1, "#022c22");
      } else {
        orbGrad.addColorStop(0, "#f4f4f5");
        orbGrad.addColorStop(0.4, "#a1a1aa");
        orbGrad.addColorStop(0.8, "#52525b");
        orbGrad.addColorStop(1, "#18181b");
      }

      ctx.fillStyle = orbGrad;
      ctx.fill();

      // 3. Very subtle, soft inner specular highlight for gentle depth
      const innerGlow = ctx.createRadialGradient(
        centerX - currentRadius * 0.25,
        centerY - currentRadius * 0.28,
        0,
        centerX,
        centerY,
        currentRadius * 0.7
      );
      innerGlow.addColorStop(0, "rgba(255, 255, 255, 0.45)");
      innerGlow.addColorStop(0.6, "rgba(255, 255, 255, 0.05)");
      innerGlow.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius * 0.9, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state, isMuted]);

  return (
    <div
      ref={containerRef}
      className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center select-none"
    >
      <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />
    </div>
  );
}
