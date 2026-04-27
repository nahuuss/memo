'use client';

import React from 'react';

interface TwitchEmbedProps {
  channel: string;
  width?: string | number;
  height?: string | number;
  muted?: boolean;
  autoplay?: boolean;
}

const TwitchEmbed: React.FC<TwitchEmbedProps> = ({ 
  channel, 
  muted = true,
  autoplay = true 
}) => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  // Usamos el embed por iframe para tener control total sobre los atributos 'allow'
  // y evitar problemas de inicialización del SDK de JS.
  const embedUrl = `https://player.twitch.tv/?channel=${channel}&parent=${hostname}&muted=${muted}&autoplay=${autoplay}&quality=low`;

  return (
    <div style={{ width: '100%', height: '100%', background: '#000' }}>
      <iframe
        src={embedUrl}
        title="Twitch Stream"
        allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture"
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
      />
    </div>
  );
};

export default TwitchEmbed;
