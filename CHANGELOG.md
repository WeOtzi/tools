# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [1.0.0] - 2026-02-22

### Agregado

- Carrusel circular infinito con posicionamiento matematico basado en slots
- Animaciones de fisicas de resorte (spring physics) via Framer Motion para todas las interacciones
- Iconos geometricos Bauhaus interactivos y arrastrables (Quote, Voice, Artist, Client)
- Sistema de temas claro/oscuro con transicion artistica (wipe circular + explosion geometrica)
- Soporte responsive con hook `useBreakpoint` para Mobile (<640px), Tablet (<1180px) y Desktop
- Sistema de drag con momentum y snap para navegacion del carrusel
- Modal de video con integracion YouTube y decoraciones Bauhaus flotantes
- Header adaptativo con menu desplegable para mobile/tablet y navegacion horizontal para desktop
- Paginacion con indicadores geometricos animados (circulo, triangulo, cuadrado, diamante)
- Widget de IA conversacional ElevenLabs integrado como elemento flotante
- Panel de configuracion en `/config` para edicion visual de todo el contenido
- Middleware Vite personalizado para guardar configuracion e imagenes en `public/`
- Sistema de variables CSS para paleta Bauhaus en ambos modos de tema
- Background parallax dinamico que cambia con la tarjeta activa del carrusel
- Nudge periodico (cada 30s) para guiar interaccion del usuario con el logo
- Navegacion por teclado (flechas izquierda/derecha)
- Componentes shadcn/ui (Radix primitives) como base del sistema de diseno
- Tipografia dual: Space Grotesk (principal) y Caveat (acentos manuscritos)
- Subida de imagenes con preview optimista en panel de configuracion
