'use client';

import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HLSPlayerProps {
  url: string;
}

const HLSPlayer: React.FC<HLSPlayerProps> = ({ url }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Si la URL es absoluta, la pasamos por nuestro proxy interno para evitar errores de CORS
    const finalUrl = url.startsWith('http') 
      ? `/api/proxy?url=${encodeURIComponent(url)}` 
      : url;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(finalUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log("Autoplay blocked:", e));
      });
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = finalUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.log("Autoplay blocked:", e));
      });
    }
  }, [url]);

  return (
    <video
      ref={videoRef}
      className="main-video-element"
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      controls
      playsInline
      muted
      autoPlay
    />
  );
};

export default HLSPlayer;
