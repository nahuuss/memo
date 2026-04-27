import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const configPath = path.join(process.cwd(), 'src/data/config.json');

export async function GET() {
  try {
    const fileContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(fileContent);
    const channel = config.twitchChannel || 'sekiam';

    // 1. Intentamos obtener espectadores REALES de Twitch usando DecAPI
    let twitchViewers = 0;
    try {
      // Añadimos timestamp para evitar caché agresivo
      const timestamp = Date.now();
      const response = await fetch(`https://decapi.me/twitch/viewercount/${channel}?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const text = await response.text();
      
      const parsed = parseInt(text);
      if (!isNaN(parsed)) {
        twitchViewers = parsed;
      } else {
        // Si DecAPI devuelve "Channel is offline" o similar
        twitchViewers = 0;
      }
    } catch (e) {
      console.error("Error fetching from DecAPI:", e);
      twitchViewers = config.mockTwitchViewers || 0;
    }

    // 2. Espectadores Web = Twitch + 15 (con variación)
    const variation = Math.floor(Math.random() * 5) - 2;
    // Si twitchViewers es 0, usamos el mock de web o 1
    const webViewers = twitchViewers > 0 
      ? twitchViewers + 15 + variation 
      : (config.mockWebViewers || 1);

    return NextResponse.json({
      is_live: twitchViewers > 0,
      web_viewers: Math.max(1, webViewers),
      twitch_viewers: twitchViewers
    });
  } catch (error) {
    return NextResponse.json({ 
      web_viewers: 1, 
      twitch_viewers: 0 
    });
  }
}
