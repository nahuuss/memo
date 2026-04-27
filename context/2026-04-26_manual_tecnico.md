# Manual Técnico - AniMeMoOoTV

## Arquitectura del Sistema
AniMeMoOoTV es una aplicación híbrida de streaming construida con **Next.js 14+ (App Router)** que integra múltiples fuentes de video en una interfaz premium única.

### Componentes Core
1. **HLSPlayer (`src/components/HLSPlayer.tsx`)**: 
   - Utiliza `hls.js` para reproducir transmisiones de baja latencia.
   - Integrado con un **CORS Proxy** automático para permitir fuentes externas de cualquier origen.
   - Configurado con `lowLatencyMode` y buffer optimizado.

2. **TwitchEmbed (`src/components/TwitchEmbed.tsx`)**:
   - Implementado mediante Iframe oficial de Twitch.
   - Soporta `autoplay` silenciado por defecto.
   - Ajustado para cumplir con las políticas de visibilidad de Twitch (evitando errores de "style visibility").

3. **CORS Proxy (`src/app/api/proxy/route.ts`)**:
   - **Recursivo**: Reescribe los manifiestos `.m3u8` para que todos los segmentos (.ts) pasen por el proxy, saltando bloqueos de dominio.
   - **Inteligente**: Detecta archivos `.m3u` (listas de canales) y extrae automáticamente el primer stream reproducible.

### Persistencia y Configuración
- **Almacenamiento Local**: Se utiliza un archivo JSON (`src/data/config.json`) como base de datos local para evitar dependencias externas (Firebase, etc.).
- **API de Configuración**: `/api/config` maneja lecturas y escrituras atómicas mediante el módulo `fs` de Node.js.

### Sistema de Métricas
- **API de Viewers (`src/app/api/viewers/route.ts`)**:
  - Obtiene espectadores reales de Twitch en tiempo real usando `decapi.me`.
  - Calcula automáticamente los "Espectadores Web" sumando una variación dinámica de +15 a la métrica de Twitch.
  - Posee un sistema de **cache busting** para asegurar datos siempre frescos.

## Instalación y Despliegue
1. Instalar dependencias: `npm install`
2. Ejecutar en desarrollo: `npm run dev`
3. Generar build de producción: `npm run build`
4. Iniciar producción: `npm start`

## Consideraciones de Seguridad
- El proxy permite acceso a recursos externos. Se recomienda limitar los dominios permitidos en entornos de producción pública.
- El panel de administración actualmente es de acceso libre por conveniencia del usuario, pero puede protegerse con NextAuth o Middleware.
