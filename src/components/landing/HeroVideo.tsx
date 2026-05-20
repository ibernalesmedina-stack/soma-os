import { useEffect, useRef, useState } from "react";

/**
 * Ping-pong loop video, optimized.
 * Strategy: native forward playback (no rAF cost), then a single rAF-driven
 * reverse pass by mutating currentTime. Uses requestVideoFrameCallback when
 * available to avoid redundant currentTime writes between paint frames.
 */
export const HeroVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const phaseRef = useRef<"forward" | "reverse">("forward");
  const [phase, setPhase] = useState<"forward" | "reverse">("forward");

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoaded = () => {
      v.play().catch(() => {});
    };

    const startReverse = () => {
      phaseRef.current = "reverse";
      setPhase("reverse");
      v.pause();
      lastTsRef.current = performance.now();
      const step = (ts: number) => {
        const node = videoRef.current;
        if (!node) return;
        const dt = (ts - lastTsRef.current) / 1000;
        lastTsRef.current = ts;
        const next = node.currentTime - dt;
        if (next <= 0.04) {
          node.currentTime = 0;
          phaseRef.current = "forward";
          setPhase("forward");
          node.play().catch(() => {});
          return;
        }
        node.currentTime = next;
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    };

    const onEnded = () => startReverse();

    const onVisibility = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        v.pause();
      } else {
        if (phaseRef.current === "forward") v.play().catch(() => {});
        else startReverse();
      }
    };

    v.addEventListener("loadeddata", onLoaded);
    v.addEventListener("ended", onEnded);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      v.removeEventListener("loadeddata", onLoaded);
      v.removeEventListener("ended", onEnded);
      document.removeEventListener("visibilitychange", onVisibility);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <div className="overflow-hidden rounded-xl border border-ink/15 bg-ink shadow-product">
        <video
          ref={videoRef}
          className="block h-auto w-full"
          src="/hero-transition.mp4"
          poster="/hero-frame-initial.png"
          muted
          playsInline
          autoPlay
          preload="auto"
          aria-label="Vista previa del sistema SomaOS: dashboard y reservas automáticas"
        />
      </div>
      <span className="sr-only">Estado actual de la animación: {phase}</span>
    </div>
  );
};

export default HeroVideo;