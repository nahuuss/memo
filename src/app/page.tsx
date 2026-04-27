'use client';

import React, { useState, useEffect } from 'react';
import HLSPlayer from '@/components/HLSPlayer';
import TwitchEmbed from '@/components/TwitchEmbed';

interface HLSServer {
  id: string;
  name: string;
  url: string;
}

interface Config {
  siteName: string;
  twitchChannel: string;
  hlsServers: HLSServer[];
}

export default function Home() {
  const [config, setConfig] = useState<Config | null>(null);
  const [showTwitch, setShowTwitch] = useState(true);
  const [currentServer, setCurrentServer] = useState<HLSServer | null>(null);
  const [webViewers, setWebViewers] = useState(0);
  const [twitchViewers, setTwitchViewers] = useState(0);

  // Cargar configuración inicial
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setCurrentServer(data.hlsServers[0]);
      });
  }, []);

  // Efecto para actualizar espectadores
  useEffect(() => {
    const fetchViewers = async () => {
      try {
        const res = await fetch('/api/viewers');
        const data = await res.json();
        setWebViewers(data.web_viewers);
        setTwitchViewers(data.twitch_viewers);
      } catch (e) {
        console.error("Error fetching viewers:", e);
      }
    };

    fetchViewers();
    const interval = setInterval(fetchViewers, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!config || !currentServer) {
    return <div style={{ color: 'white', padding: '2rem' }}>Iniciando sistema...</div>;
  }

  return (
    <main className="main-container">
      <header>
        <div className="logo">{config.siteName}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="status-badge">EN VIVO</div>
          <a href="/admin" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <span>⚙️</span> Config
          </a>
        </div>
      </header>

      <div className="content-grid">
        <div className="video-section">
          <div className="player-wrapper">
            <HLSPlayer url={currentServer.url} />
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1>{config.siteName} - Información del Stream</h1>
                <p>Estás visualizando la transmisión mediante el nodo: <strong>{currentServer.name}</strong></p>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div className="web-viewers-badge">
                  <span className="stat-label">Espectadores Web</span>
                  <span className="stat-value">{webViewers}</span>
                </div>
                <div className="web-viewers-badge" style={{ color: '#9147ff' }}>
                  <span className="stat-label">Twitch Total</span>
                  <span className="stat-value">{twitchViewers}</span>
                </div>
              </div>
            </div>

            <div className="video-controls">
              <div className="server-selector">
                {config.hlsServers.map((server: any) => (
                  <button 
                    key={server.id}
                    className={`server-btn ${currentServer.id === server.id ? 'active' : ''}`}
                    onClick={() => setCurrentServer(server)}
                  >
                    {server.name}
                  </button>
                ))}
              </div>

              <button 
                className="btn btn-secondary" 
                onClick={() => setShowTwitch(!showTwitch)}
              >
                {showTwitch ? 'Ocultar Twitch Metrics' : 'Mostrar Twitch Metrics'}
              </button>
            </div>

            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-label">Calidad</span>
                <span className="stat-value">1080p60</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Latencia</span>
                <span className="stat-value">~1.2s</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Protocolo</span>
                <span className="stat-value">HLS/ABR</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="glass-card chat-container" style={{ marginBottom: '0' }}>
              <iframe
                src={`https://www.twitch.tv/embed/${config.twitchChannel}/chat?parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}&darkpopout`}
                title="Twitch Chat"
                allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>

            <div className={`twitch-embed-mini ${!showTwitch ? 'hidden' : ''}`} style={{ width: '100%' }}>
              <TwitchEmbed channel={config.twitchChannel} muted={true} autoplay={true} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
