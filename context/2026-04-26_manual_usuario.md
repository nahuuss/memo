# Manual de Usuario - AniMeMoOoTV

## Introducción
Bienvenido a **AniMeMoOoTV**, tu plataforma personalizada de streaming híbrido. Aquí puedes gestionar tus propios servidores HLS y sincronizarlos con tu chat de Twitch.

## Panel de Administración (`/admin`)
Para acceder, haz clic en el botón **⚙️ Config** en la cabecera del sitio.

### 1. Configuración de Marca
- **Nombre del Sitio**: Cambia el nombre que aparece en la parte superior (actualmente AniMeMoOoTV).
- **Canal de Twitch**: Ingresa el nombre de tu canal o la URL completa (ej. `https://twitch.tv/tu_usuario`). El sistema extraerá el nombre automáticamente.

### 2. Gestión de Servidores HLS
- **Añadir Servidores**: Haz clic en **"+ Añadir Servidor"** para agregar nuevas fuentes.
- **Eliminar Servidores**: Usa el icono de la papelera **🗑️** para quitar nodos que ya no uses.
- **Soporte de Listas M3U**: Puedes pegar enlaces directos a listas (ej. `https://m3u.cl/lista/AR.m3u`). El sistema detectará el primer canal de la lista y lo reproducirá.

### 3. Métricas de Espectadores
- El sistema muestra dos valores:
  1. **Twitch Total**: Espectadores reales en Twitch (actualizado cada 10 seg).
  2. **Espectadores Web**: Espectadores en tu sitio (Twitch + 15 de diferencia automática).
- **Fallback**: Si por algún motivo Twitch no responde, el sistema usará los valores que definas en los campos "Fallback" del panel.

## Solución de Problemas Comunes
- **El video no carga**: Asegúrate de que el enlace termine en `.m3u8` o `.m3u`. Si el servidor de origen está caído, el reproductor mostrará un círculo de carga infinito.
- **Autoplay no funciona**: Los navegadores modernos requieren que hagas **un clic** en cualquier lugar de la página para permitir que los videos empiecen a sonar automáticamente.
- **Chat no disponible**: Si ves un mensaje de error en el chat, asegúrate de que tu canal de Twitch sea correcto y que no tengas bloqueadores de anuncios muy agresivos.

## Guardar Cambios
Siempre que realices un cambio en el panel, recuerda hacer clic en el botón morado **"Guardar Cambios"** al final de la página para que la configuración sea permanente.
