import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let targetUrl = searchParams.get('url');
  const origin = new URL(request.url).origin;

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  try {
    let finalData: any = null;
    let finalContentType: string = 'application/vnd.apple.mpegurl';
    let maxRedirects = 3;

    while (maxRedirects > 0) {
      // Intentamos simular un navegador real al máximo para evitar el error 403
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          'Referer': 'https://www.google.com/',
          'Origin': 'https://www.google.com'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        // Si sigue dando 403, devolvemos el error detallado para que el usuario sepa que es un bloqueo de IP de Vercel
        throw new Error(`Target responded with ${response.status}. Esto suele ocurrir porque el sitio de origen bloquea las IPs de servidores cloud como Vercel.`);
      }

      const contentType = response.headers.get('content-type') || '';
      const data = await response.arrayBuffer();
      const text = new TextDecoder().decode(data);

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
          continue;
        }
      }

      if (text.includes('#EXTM3U')) {
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
            if (absoluteUrl.startsWith(origin + '/api/proxy')) return absoluteUrl;
            return `${origin}/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
          }
          return line;
        });

        const rewrittenText = rewrittenLines.join('\n');
        finalData = new TextEncoder().encode(rewrittenText);
        finalContentType = contentType || 'application/vnd.apple.mpegurl';
      } else {
        finalData = data;
        finalContentType = contentType;
      }
      break;
    }

    if (!finalData) throw new Error("Failed to process data");

    return new Response(finalData, {
      status: 200,
      headers: {
        'Content-Type': finalContentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=5'
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
