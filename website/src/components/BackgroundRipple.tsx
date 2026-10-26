import React, { useRef, useEffect, useState } from 'react';

interface RipplePoint {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export const BackgroundRipple: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<RipplePoint[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid
      const gridSize = 36;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw cursor ambient glow if active
      if (mousePos) {
        const glowGradient = ctx.createRadialGradient(
          mousePos.x,
          mousePos.y,
          0,
          mousePos.x,
          mousePos.y,
          320
        );
        glowGradient.addColorStop(0, 'rgba(224, 68, 24, 0.08)');
        glowGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.03)');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Process and render expanding ripples
      ripplesRef.current = ripplesRef.current.filter((r) => r.opacity > 0.005);

      for (const ripple of ripplesRef.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity * 0.25})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Secondary subtle inner echo
        if (ripple.radius > 20) {
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius - 15, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(224, 68, 24, ${ripple.opacity * 0.15})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();

        ripple.radius += 2.2;
        ripple.opacity *= 0.965;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  const addRipple = (clientX: number, clientY: number) => {
    ripplesRef.current.push({
      x: clientX,
      y: clientY,
      radius: 5,
      maxRadius: 280,
      opacity: 0.8,
    });
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (Math.random() > 0.82) {
      addRipple(e.clientX, e.clientY);
    }
  };

  return (
    <div
      onMouseMove={handlePointerMove}
      onClick={(e) => addRipple(e.clientX, e.clientY)}
      className="absolute inset-0 pointer-events-auto overflow-hidden bg-black z-0 select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Vignette mask */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{
        background: 'radial-gradient(circle at 50% 50%, transparent 40%, #000000 95%)'
      }} />
    </div>
  );
};
