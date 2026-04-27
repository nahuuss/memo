# Implementación de Reproductor Híbrido - clon_twitch_hls
Fecha: 2026-04-26

## Descripción del Cambio
Se ha desarrollado una aplicación en **Next.js** que replica la arquitectura de `watch.lacafedeseki.com`. Esta aplicación permite visualizar un stream HLS de baja latencia mientras mantiene un embed de Twitch minimizado para asegurar que las métricas de visualización y el engagement del canal se contabilicen correctamente.

## Características Técnicas
- **Framework**: Next.js 14+ (App Router).
- **Video HLS Dual**: Soporte para múltiples servidores de origen (EU-1, EU-2, LATAM) seleccionables por el usuario.
- **Contador de Espectadores Web**: Sistema de monitoreo en tiempo real (vía API interna) para mostrar cuántos usuarios están conectados específicamente a la web.
- **Twitch Integration**: Uso del SDK oficial de Twitch para el embed del reproductor y chat.
- **UI Premium**: Diseño con estética "Dark Mode", glassmorphism y tipografía moderna (Outfit).
- **Panel de Administración**: Ruta dedicada (`/admin`) para gestionar dinámicamente el canal de Twitch y las URLs de los servidores HLS sin modificar el código.
- **Acceso a Configuración**: Botón de acceso rápido (⚙️ Configuración) en el reproductor para facilitar la administración.
- **Procesamiento de URLs**: El panel ahora acepta URLs completas de Twitch (ej. `https://twitch.tv/user`) y extrae automáticamente el nombre del canal para los embeds.
- **Personalización de Marca**: El sitio ha sido renombrado a **AniMeMoOoTV**.
- **Persistencia Local**: Sistema de guardado robusto mediante `fs` en `src/data/config.json`, permitiendo cambios persistentes sin base de datos externa.

## Estructura del Proyecto
- `src/components/HLSPlayer.tsx`: Componente de video para streams externos.
- `src/components/TwitchEmbed.tsx`: Integración del reproductor oficial de Twitch.
- `src/app/page.tsx`: Layout principal con lógica de alternancia y chat integrado.
- `src/app/globals.css`: Sistema de diseño basado en variables CSS y efectos visuales modernos.

## Verificación
- La aplicación se probó localmente en `http://localhost:3001`.
- Se verificó la carga simultánea del stream HLS y el embed de Twitch.
- Se confirmó el correcto funcionamiento del chat mediante el parámetro `parent`.

---
*Documento generado para registrar la construcción del prototipo similar solicitado.*
