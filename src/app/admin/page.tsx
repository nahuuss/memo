'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface HLSServer {
  id: string;
  name: string;
  url: string;
}

interface Config {
  twitchChannel: string;
  hlsServers: HLSServer[];
}

export default function AdminPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [status, setStatus] = useState('');
  const [twitchViewersRealTime, setTwitchViewersRealTime] = useState(0);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setConfig(data));
  }, []);

  useEffect(() => {
    const fetchRealTime = async () => {
      try {
        const res = await fetch('/api/viewers');
        const data = await res.json();
        setTwitchViewersRealTime(data.twitch_viewers);
      } catch (e) {}
    };
    fetchRealTime();
    const interval = setInterval(fetchRealTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setStatus('Guardando...');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setStatus('¡Configuración guardada!');
        setTimeout(() => setStatus(''), 3000);
      }
    } catch (e) {
      setStatus('Error al guardar');
    }
  };

  const addServer = () => {
    if (!config) return;
    const newServer: HLSServer = {
      id: `server-${Date.now()}`,
      name: 'Nuevo Servidor',
      url: ''
    };
    setConfig({ ...config, hlsServers: [...config.hlsServers, newServer] });
  };

  const removeServer = (index: number) => {
    if (!config) return;
    if (config.hlsServers.length <= 1) {
      alert("Debe haber al menos un servidor.");
      return;
    }
    const newServers = config.hlsServers.filter((_, i) => i !== index);
    setConfig({ ...config, hlsServers: newServers });
  };

  const updateServer = (index: number, field: keyof HLSServer, value: string) => {
    if (!config) return;
    const newServers = [...config.hlsServers];
    newServers[index] = { ...newServers[index], [field]: value };
    setConfig({ ...config, hlsServers: newServers });
  };

  if (!config) return <div className="admin-container">Cargando...</div>;

  return (
    <div className="admin-container glass-card">
      <div className="admin-header">
        <h1>Panel de Control</h1>
        <Link href="/" className="btn btn-secondary">Volver al Sitio</Link>
      </div>

      <div className="form-group">
        <label>Nombre del Sitio</label>
        <input 
          type="text" 
          value={config.siteName} 
          onChange={(e) => setConfig({...config, siteName: e.target.value})}
        />
      </div>

      <div className="form-group">
        <label>Twitch Channel (Nombre o URL)</label>
        <input 
          type="text" 
          placeholder="ej: sekiam o https://twitch.tv/sekiam"
          value={config.twitchChannel} 
          onChange={(e) => {
            let val = e.target.value;
            if (val.includes('twitch.tv/')) {
              val = val.split('twitch.tv/')[1].split('/')[0].split('?')[0];
            }
            setConfig({...config, twitchChannel: val});
          }}
        />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Canal actual detectado: <strong>{config.twitchChannel}</strong>
        </p>
      </div>

      <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
          💡 Las métricas ahora son automáticas. 
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Se obtienen los espectadores reales de Twitch y se suman +15 para la web. 
          Los valores de abajo solo se usarán si Twitch no responde.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="form-group">
          <label>Fallback: Espectadores Web</label>
          <input 
            type="number" 
            value={config.mockWebViewers} 
            onChange={(e) => setConfig({...config, mockWebViewers: parseInt(e.target.value) || 0})}
          />
        </div>
        <div className="form-group">
          <label>Fallback: Twitch Total</label>
          <input 
            type="number" 
            value={config.mockTwitchViewers} 
            onChange={(e) => setConfig({...config, mockTwitchViewers: parseInt(e.target.value) || 0})}
          />
        </div>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(145, 71, 255, 0.1)', borderRadius: '8px', border: '1px solid var(--accent-color)' }}>
        <span style={{ fontSize: '0.9rem' }}>🔍 Detectando en tiempo real: </span>
        <strong style={{ color: 'var(--accent-color)' }}>{twitchViewersRealTime}</strong> espectadores en Twitch.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '2rem' }}>
        <h2 style={{ margin: 0 }}>Servidores HLS</h2>
        <button className="btn btn-secondary btn-sm" onClick={addServer}>+ Añadir Servidor</button>
      </div>

      {config.hlsServers.map((server, index) => (
        <div key={server.id} className="server-config-item" style={{ position: 'relative', paddingRight: '4rem' }}>
          <button 
            onClick={() => removeServer(index)}
            style={{ 
              position: 'absolute', 
              right: '1rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              background: 'rgba(255, 50, 50, 0.2)',
              border: '1px solid #ff4444',
              color: '#ff4444',
              padding: '0.5rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title="Eliminar servidor"
          >
            🗑️
          </button>
          <div className="form-group">
            <label>Nombre del Nodo</label>
            <input 
              type="text" 
              value={server.name} 
              onChange={(e) => updateServer(index, 'name', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>URL del Stream (.m3u8)</label>
            <input 
              type="text" 
              placeholder="https://servidor.com/playlist.m3u8"
              value={server.url} 
              onChange={(e) => updateServer(index, 'url', e.target.value)}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
              ⚠️ Asegúrate de que el servidor permita **CORS** (Access-Control-Allow-Origin). Los enlaces públicos de terceros podrían fallar.
            </p>
          </div>
        </div>
      ))}

      <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn" onClick={handleSave}>Guardar Cambios</button>
        {status && <span style={{ color: '#9147ff' }}>{status}</span>}
      </div>
    </div>
  );
}
