import React, { useRef, useEffect, useState } from 'react';

interface FadingVideoProps {
  src: string | string[];
  className?: string;
  style?: React.CSSProperties;
}

export const FadingVideo: React.FC<FadingVideoProps> = ({ src, className = '', style }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [opacity, setOpacity] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const sources = Array.isArray(src) ? src : [src];
  const currentSrc = sources[currentIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isFadingOut = false;

    const handleLoadedData = () => {
      // Fade in over 500ms using requestAnimationFrame
      let start: number | null = null;
      const fadeIn = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / 500, 1);
        setOpacity(progress);
        if (progress < 1) {
          requestAnimationFrame(fadeIn);
        }
      };
      requestAnimationFrame(fadeIn);
    };

    const handleTimeUpdate = () => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      const remaining = video.duration - video.currentTime;
      if (remaining <= 0.55 && !isFadingOut) {
        isFadingOut = true;
        // Fade out over 550ms
        let start: number | null = null;
        const fadeOut = (timestamp: number) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / 550, 1);
          setOpacity(1 - progress);
          if (progress < 1) {
            requestAnimationFrame(fadeOut);
          }
        };
        requestAnimationFrame(fadeOut);
      }
    };

    const handleEnded = () => {
      isFadingOut = false;
      if (sources.length === 1) {
        video.currentTime = 0;
        video.play().catch(() => {});
        handleLoadedData();
      } else {
        setCurrentIndex((prev) => (prev + 1) % sources.length);
      }
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentSrc, sources.length]);

  return (
    <video
      ref={videoRef}
      src={currentSrc}
      autoPlay
      muted
      playsInline
      preload="auto"
      className={className}
      style={{
        ...style,
        opacity,
        transition: 'opacity 50ms linear',
      }}
    />
  );
};
