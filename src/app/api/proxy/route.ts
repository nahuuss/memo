import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let targetUrl = searchParams.get('url');
  const origin = new URL(request.url).origin;

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  try {
    // Implementamos un bucle para resolver redirecciones de listas M3U sin recursividad
    let finalData: ArrayBuffer | null = null;
    let finalContentType: string = 'application/vnd.apple.mpegurl';
    let maxRedirects = 3;

    while (maxRedirects > 0) {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        // En Vercel es mejor no usar caché agresivo en el proxy
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Target responded with ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const data = await response.arrayBuffer();
      const text = new TextDecoder().decode(data);

      // Si es una lista M3U (lista de canales), extraemos el primer stream y volvemos a intentar
      if (text.includes('#EXTM3U') && !text.includes('#EXT-X-STREAM-INF') && !text.includes('#EXT-X-MEDIA-SEQUENCE')) {
        const lines = text.split('\n');
        const firstStream = lines.find(line => {
          const t = line.trim();
          return t && !t.startsWith('#') && (t.startsWith('http') || t.includes('.m3u8'));
        });

        if (firstStream) {
          let nextUrl = firstStream.trim();
          if (!nextUrl.startsWith('http')) {
            const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
            nextUrl = new URL(nextUrl, baseUrl).href;
          }
          targetUrl = nextUrl;
          maxRedirects--;
          continue; // Reintento con la nueva URL
        }
      }

      // Si llegamos aquí, es un manifiesto HLS o un fragmento de video
      if (text.includes('#EXTM3U')) {
        // Es un manifiesto HLS: reescribimos URLs para que pasen por el proxy
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
        const lines = text.split('\n');
        
        const rewrittenLines = lines.map(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            let absoluteUrl = trimmed;
            if (!trimmed.startsWith('http')) {
              try {
                absoluteUrl = new URL(trimmed, baseUrl).href;
              } catch (e) { return line; }
            }
            // Evitar doble proxy
            if (absoluteUrl.startsWith(origin + '/api/proxy')) return absoluteUrl;
            return `${origin}/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
          }
          return line;
        });

        const rewrittenText = rewrittenLines.join('\n');
        finalData = new TextEncoder().encode(rewrittenText);
        finalContentType = contentType || 'application/vnd.apple.mpegurl';
      } else {
        // Es un fragmento binario o algo que no necesita reescritura
        finalData = data;
        finalContentType = contentType;
      }
      break; // Salimos del bucle
    }

    if (!finalData) throw new Error("Failed to process data");

    return new Response(finalData, {
      status: 200,
      headers: {
        'Content-Type': finalContentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=5',
        'X-Proxy-Target': targetUrl
      },
    });
  } catch (error: any) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ 
      error: 'Proxy Error', 
      message: error.message,
      url: targetUrl 
    }, { status: 500 });
  }
}
