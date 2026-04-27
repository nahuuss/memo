import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const origin = new URL(request.url).origin;

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Target responded with ${response.status}`);
    }

    let contentType = response.headers.get('content-type') || '';
    let data: ArrayBuffer = await response.arrayBuffer();
    
    // Solo procesamos como texto si parece ser un manifiesto o lista
    const isM3U = targetUrl.includes('.m3u') || contentType.includes('mpegurl') || contentType.includes('application/x-mpegurl') || contentType.includes('text/plain');
    
    if (isM3U) {
      let text = new TextDecoder().decode(data);

      if (text.includes('#EXTM3U')) {
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
        const lines = text.split('\n');
        
        // Caso A: Es una lista de canales (M3U) -> Redirigimos al primer stream reproducible
        const isChannelList = !text.includes('#EXT-X-STREAM-INF') && !text.includes('#EXT-X-MEDIA-SEQUENCE');
        
        if (isChannelList) {
          const firstStream = lines.find(line => {
            const t = line.trim();
            return t && !t.startsWith('#') && (t.startsWith('http') || t.includes('.m3u8'));
          });
          
          if (firstStream) {
            let streamUrl = firstStream.trim();
            if (!streamUrl.startsWith('http')) {
              streamUrl = new URL(streamUrl, baseUrl).href;
            }
            return GET(new Request(`${origin}/api/proxy?url=${encodeURIComponent(streamUrl)}`));
          }
        }

        // Caso B: Es un manifiesto HLS -> Reescribimos TODAS las URLs para que pasen por el proxy
        const rewrittenLines = lines.map(line => {
          const trimmed = line.trim();
          // Ignorar comentarios pero procesar URLs
          if (trimmed && !trimmed.startsWith('#')) {
            let absoluteUrl = trimmed;
            if (!trimmed.startsWith('http')) {
              try {
                absoluteUrl = new URL(trimmed, baseUrl).href;
              } catch (e) {
                return line; // No es una URL válida
              }
            }
            
            // EVITAR DOBLE PROXY: si ya es una URL de nuestro proxy, no la envolvemos
            if (absoluteUrl.startsWith(origin + '/api/proxy')) {
              return absoluteUrl;
            }
            
            return `${origin}/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
          }
          return line;
        });

        text = rewrittenLines.join('\n');
        data = new TextEncoder().encode(text);
      }
    }

    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=5'
      },
    });
  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: 'Failed to fetch target URL' }, { status: 500 });
  }
}
