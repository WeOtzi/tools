# Documentación del Proyecto: We Otzi Landing Page

Esta es la documentación oficial e integral de la aplicación **We Otzi Landing Page** (v03). Cubre todos los aspectos técnicos, de experiencia de usuario (UX), arquitectura de componentes, requisitos del sistema y guía de instalación.

---

## 1. Introducción y Propósito

El proyecto consiste en una **Landing Page interactiva y altamente visual** diseñada bajo los principios del estilo **Bauhaus**, caracterizada por el uso de colores primarios (Cian, Rojo, Amarillo), formas geométricas puras, y tipografía moderna geométrica (Space Grotesk). El objetivo es ofrecer una experiencia premium y dinámica para artistas del tatuaje y clientes, destacando mediante micro-interacciones avanzadas, animaciones físicas y soporte continuo de un agente conversacional de IA.

---

## 2. Experiencia de Usuario (UX) e Interfaz (UI)

La aplicación está diseñada para dejar una impresión duradera ("efecto WOW") utilizando principios de diseño modernos y dinámicos:

### 2.1. Estilo Visual Bauhaus
- **Paleta de Colores**: 
  - Primarios: Cian (`#11B4D4` / `#22D3EE`), Rojo (`#D92525` / `#EF4444`), Amarillo (`#F2C029` / `#FACC15`).
  - Neutros: Oscuro (`#0F172A`), Pizarra, Blanco y grises sutiles para fondos y bordes.
- **Formas Geométricas**: Integración exhaustiva de formas puras (círculos, cuadrados, triángulos) en la iconografía, botones y elementos decorativos interactivos.
- **Tipografía**: Uso exclusivo de la familia `Space Grotesk` para aportar un carácter técnico y limpio.

### 2.2. Micro-interacciones y Animaciones (Framer Motion)
- **Física de Resortes (Spring Animations)**: Todas las transiciones (hover, tap, drag) utilizan configuraciones de `spring` (bouncy, in) para generar una sensación de respuesta natural y física.
- **Iconografía Arrastrable**: Los iconos geométricos (`GeoIconQuote`, `GeoIconVoice`, etc.) reaccionan al cursor (`drag`), permitiendo a los usuarios interactuar físicamente con ellos, deformándolos y reposicionándolos temporalmente.
- **Transiciones de Tema Artísticas**: El cambio entre modo Claro (Light) y Oscuro (Dark) no es instantáneo, sino que cuenta con una transición coordinada de colores que respeta el flujo estético ("Artistic Theme Transition").

### 2.3. Accesibilidad y Responsividad
- La aplicación cuenta con un hook personalizado (`useBreakpoint`) que adapta matemáticamente las dimensiones, desplazamientos (offsets) y escalas de los elementos (como las tarjetas del carrusel) según tres puntos de ruptura: **Mobile (<640px)**, **Tablet (<1180px)** y **Desktop**.

---

## 3. Arquitectura a Nivel Técnico

La aplicación es una Single Page Application (SPA) construida con tecnologías modernas del ecosistema React.

### 3.1. Stack Tecnológico (Tech Stack)
- **Core**: React 18, TypeScript, Vite.
- **Enrutamiento**: React Router v7 (`react-router`) utilizado en `App.tsx` para manejar las vistas (`/` y `/config`).
- **Estilos**: 
  - Tailwind CSS v4 para la estructura y utilidades base.
  - CSS Vanilla (`theme.css`) para la gestión avanzada de variables CSS y el sistema de temas (Light/Dark variables).
- **Animaciones**: Framer Motion (`motion/react`).
- **Componentes UI (Base)**: Radix UI primitives (`@radix-ui/react-*`), con integraciones secundarias de MUI (`@mui/material`).
- **Manejo de Temas**: `next-themes` envuelto en un `ThemeProvider` personalizado.
- **Agente IA**: Integración nativa del widget `elevenlabs-convai` para soporte por voz.

---

## 4. Componentes Principales

### 4.1. `App.tsx` (Core Entry)
Configura el enrutador (`BrowserRouter`), inyecta los proveedores globales (`ConfigProvider`, `ThemeProvider`) y define la estructura de rutas:
- **`LandingView` (RUTA: `/`)**: Muestra el componente principal `TattooCarousel` y el widget flotante de ElevenLabs.
- **`ConfigPage` (RUTA: `/config`)**: Página accesible para la configuración o "Demo Mode" del administrador de la plataforma.

### 4.2. `TattooCarousel.tsx`
El componente más complejo de la aplicación. Es un **carrusel circular infinito y arrastrable** con sistema de físicas.
- **Gestión Matemática (Slots)**: Calcula las posiciones de las tarjetas basándose en su `slot` (activo = 0, izquierda = -1, derecha = 1, oculto = otro).
- **Interacciones `useDragCarousel`**: Maneja el Momentum de arrastre (drag) usando físicas para predecir el comportamiento e inercia del usuario al deslizar las tarjetas.
- **`CarouselCard`**: Tarjeta individual que adapta su posición relativa absoluta (top, left, width, height) basándose en las variables matemáticas que devuelven el layout dinámico por Breakpoint.
- **Iconos Dinámicos (`GeoIcon*`)**: Cada tarjeta tiene su propio renderizado de SVG compuestos y animados (Cita, Voz, Artista, Cliente) que son independientes e interactivos.
- **`VideoModal`**: Un modal inmersivo con efecto de desenfoque y elementos flotantes Bauhaus para reproducir los testimonios y explicaciones integrados.

### 4.3. `ThemeProvider.tsx` & Variables de Entorno (`theme.css`)
Carga el tema usando `next-themes`. Importante denotar la estructura del archivo `theme.css`, donde se definen las raíces variables (e.g. `--c-cyan`, `--c-red`), asegurando que las clases de Tailwind y `Framer Motion` puedan usarlos tanto en modo claro (`:root`) como en oscuro (`.dark`).

---

## 5. Requisitos del Sistema

Para levantar el entorno de desarrollo y realizar un proceso de compilación, se requiere:
- **Node.js**: Versión 18.x o superior.
- **Gestor de paquetes**: `npm` (v9+) o `pnpm` (recomendado ya que el `package.json` incluye overrides de pnpm).
- **Navegador**: Cualquier navegador web moderno con soporte avanzado de CSS (variables, grid, flexbox) y soporte para JavaScript ES2020+.

---

## 6. Guía de Instalación y Ejecución

Sigue estos pasos para operar la aplicación en un entorno local:

### 6.1. Acceso al Directorio
Abre una terminal y sitúate en la raíz del proyecto (donde se encuentra el archivo `package.json`):

```bash
cd ruta/al/directorio/del/proyecto/v03
```

### 6.2. Instalación de Dependencias
Instala todas las dependencias listadas en el `package.json`.

```bash
npm install
# Opcional si prefieres pnpm:
pnpm install
```

### 6.3. Ejecución del Servidor de Desarrollo
Para arrancar el aplicativo localmente con **Hot Module Replacement (HMR)** gracias a Vite:

```bash
npm run dev
# O con pnpm:
pnpm run dev
```

Esto levantará el servidor local, generará un enlace (normalmente `http://localhost:5173/`) y permitirá visualizar el resultado de la aplicación interactiva en tiempo real.

### 6.4. Compilación para Producción (Build)
Cuando el desarrollo concluya y se requiera el empaquetado final para despliegue:

```bash
npm run build
# O con pnpm:
pnpm run build
```

Este comando utilizará Vite para generar una versión lista para producción en el directorio `/dist/`.
