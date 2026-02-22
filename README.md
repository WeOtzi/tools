# We Otzi - Landing Page de Herramientas

Landing page interactiva para artistas del tatuaje y clientes, construida con React 18, TypeScript, Vite y Tailwind CSS v4. Presenta un carrusel circular con animaciones basadas en fisicas de resorte (spring physics) y un sistema de temas claro/oscuro con transiciones artisticas estilo Bauhaus.

## Filosofia de Diseno

El proyecto sigue principios del movimiento **Bauhaus**, caracterizado por:

- **Paleta de colores primarios**: Cian (`#11B4D4`), Rojo (`#D92525`), Amarillo (`#F2C029`)
- **Formas geometricas puras**: Circulos, cuadrados y triangulos en iconografia interactiva
- **Tipografia geometrica moderna**: Space Grotesk como fuente principal, Caveat como fuente de acento
- **Micro-interacciones fisicas**: Todas las transiciones usan configuraciones spring de Framer Motion

## Stack Tecnologico

| Capa | Tecnologia |
|------|------------|
| Core | React 18, TypeScript, Vite 6 |
| Estilos | Tailwind CSS v4, CSS custom properties |
| Animaciones | Framer Motion (motion/react) |
| UI Base | Radix UI primitives, shadcn/ui |
| Temas | next-themes con transicion artistica |
| Enrutamiento | React Router v7 |
| IA | ElevenLabs Conversational AI widget |

## Arquitectura

```
src/
├── main.tsx                          # Entry point
├── elevenlabs.d.ts                   # Type declarations para el widget de IA
├── styles/
│   ├── index.css                     # Barrel de imports CSS
│   ├── fonts.css                     # Google Fonts (Space Grotesk, Caveat)
│   ├── tailwind.css                  # Tailwind v4 config con tw-animate-css
│   └── theme.css                     # Variables CSS para temas claro/oscuro
├── imports/
│   ├── Body.tsx                      # Componente estatico exportado de Figma
│   └── svg-vxc24fmowr.ts            # SVG paths para iconos de navegacion
├── assets/
│   └── *.png                         # Logo y assets estaticos
└── app/
    ├── App.tsx                       # Router + proveedores globales
    ├── context/
    │   └── ConfigContext.tsx          # Estado global de configuracion con persistencia
    ├── pages/
    │   └── ConfigPage.tsx            # Panel de administracion
    ├── components/
    │   ├── TattooCarousel.tsx        # Componente principal: carrusel circular con fisicas
    │   ├── ThemeProvider.tsx         # Wrapper de next-themes
    │   ├── figma/
    │   │   └── ImageWithFallback.tsx  # Imagen con estado de error
    │   └── ui/                       # Componentes shadcn/ui (Radix primitives)
public/
└── config.json                       # Configuracion del sitio (titulos, tarjetas, enlaces)
```

## Rutas

| Ruta | Vista | Descripcion |
|------|-------|-------------|
| `/` | LandingView | Carrusel interactivo + widget de IA |
| `/config` | ConfigPage | Panel de administracion para personalizar contenido |

## Instalacion

### Requisitos

- Node.js 18.x o superior
- npm (v9+) o pnpm

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/WeOtzi/tools.git
cd tools

# Instalar dependencias
npm install

# Servidor de desarrollo (HMR via Vite)
npm run dev

# Build para produccion
npm run build
```

El servidor de desarrollo se levanta en `http://localhost:5173/`.

## Configuracion

El contenido del sitio se gestiona mediante `public/config.json`, que controla:

- Logo e imagen de navegacion
- Titulo, subtitulo y texto hero
- Tarjetas del carrusel (titulo, descripcion, CTA, video de YouTube, imagen de fondo)
- Enlaces de navegacion y footer
- Texto del boton CTA principal

El panel de administracion en `/config` permite editar todo visualmente y guarda los cambios via un middleware Vite personalizado (`/api/save-config`).

## Sistema de Temas

Soporta modo claro y oscuro con:

- Deteccion automatica de preferencia del sistema
- Persistencia en `localStorage` (key: `weotzi-theme`)
- Transicion artistica con wipe circular y explosion de formas geometricas Bauhaus
- Variables CSS dedicadas para el carrusel (`--c-cyan`, `--c-red`, etc.) en ambos modos

## Assets Binarios

Los siguientes archivos binarios no estan incluidos en el repositorio y deben agregarse manualmente:

- `src/assets/b9f5696472bd25bd16dc310ed8ae2d575f62d935.png` -- Logo principal

## Atribuciones

- Componentes UI basados en [shadcn/ui](https://ui.shadcn.com/) (Licencia MIT)
- Fotografias de [Unsplash](https://unsplash.com) (Licencia Unsplash)
- Proyecto original exportado desde Figma Make

## Licencia

Proyecto privado de We Otzi.
