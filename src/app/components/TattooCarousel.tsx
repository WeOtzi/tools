/**
 * TattooCarousel - Primary interactive component.
 *
 * Architecture overview:
 *
 * 1. SLOT-BASED POSITIONING: Cards are positioned using a circular slot system
 *    where slot 0 = active (center), -1/+1 = adjacent (sides), others = hidden.
 *    This avoids DOM reordering and enables smooth spring-animated transitions.
 *
 * 2. DUAL COLOR SYSTEM: CSS var() references (C object) work for static styles,
 *    but Framer Motion can't interpolate CSS variables. The useThemeColors hook
 *    resolves computed values so animations like fill transitions work correctly.
 *
 * 3. DRAG WITH MOMENTUM: Custom pointer event handling (not Framer's drag)
 *    to support continuous scrolling with velocity-based momentum and snap.
 *    Friction coefficient 0.93 gives a natural deceleration feel.
 *
 * 4. THEME TRANSITION: Two-phase animation - circular clip-path wipe fills
 *    the screen, then Bauhaus shapes burst outward. The actual theme flip
 *    happens at the midpoint (350ms) so the wipe covers the color change.
 *
 * 5. RESPONSIVE LAYOUT: Three breakpoints with mathematically scaled card
 *    dimensions, offsets, and font sizes. No CSS media queries - all computed
 *    in JS for precise control over animation parameters.
 */
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import svgPaths from "../../imports/svg-vxc24fmowr";
import logoImg from "../../assets/b9f5696472bd25bd16dc310ed8ae2d575f62d935.png";
import { useConfig } from "../context/ConfigContext";

// ─── Responsive breakpoint hook ─────────────────────────────
// Breakpoints chosen to match common device widths:
// Mobile: phones (<640px), Tablet: iPads/small laptops (<1180px), Desktop: rest
type Breakpoint = "mobile" | "tablet" | "desktop";

function useBreakpoint(): Breakpoint {
  const getBreakpoint = (): Breakpoint => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    if (w < 640) return "mobile";
    if (w < 1180) return "tablet";
    return "desktop";
  };
  const [bp, setBp] = useState<Breakpoint>(getBreakpoint);
  useEffect(() => {
    const onResize = () => setBp(getBreakpoint());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return bp;
}

// Card dimensions and offsets are tuned per breakpoint to maintain
// visual proportions across screen sizes. sideOffset controls how far
// adjacent cards peek in; farOffset pushes hidden cards fully offscreen.
function useLayoutConfig(bp: Breakpoint) {
  return useMemo(() => {
    if (bp === "mobile") return { cardW: 240, cardH: 300, sideOffset: 220, farOffset: 400, sideScale: 0.45, activeScale: 1, hiddenScale: 0.35 };
    if (bp === "tablet") return { cardW: 300, cardH: 370, sideOffset: 270, farOffset: 500, sideScale: 0.5, activeScale: 1, hiddenScale: 0.38 };
    return { cardW: 370, cardH: 440, sideOffset: 340, farOffset: 640, sideScale: 0.514, activeScale: 1, hiddenScale: 0.4 };
  }, [bp]);
}

// ─── Palette (CSS variables – resolved at render) ──────────
// These map to the --c-* custom properties defined in theme.css.
// Using var() references means colors automatically switch with the theme.
const C = {
  cyan: "var(--c-cyan)",
  red: "var(--c-red)",
  yellow: "var(--c-yellow)",
  dark: "var(--c-dark)",
  darkAlt: "var(--c-dark-alt)",
  slate: "var(--c-slate)",
  slateLight: "var(--c-slate-light)",
  slateMuted: "var(--c-slate-muted)",
  border: "var(--c-border)",
  borderLight: "var(--c-border-light)",
  bg: "var(--c-bg)",
  white: "var(--c-white)",
  dotInactive: "var(--c-dot-inactive)",
  headerBg: "var(--c-header-bg)",
  overlay: "var(--c-overlay)",
  overlayLight: "var(--c-overlay-light)",
};

// Framer Motion animate prop can't interpolate CSS var() strings.
// This hook reads the computed hex values so we can pass them
// directly to motion component color/fill animations.
const COLOR_KEYS = [
  "--c-cyan", "--c-red", "--c-yellow", "--c-dark", "--c-dark-alt",
  "--c-slate", "--c-slate-light", "--c-slate-muted", "--c-border",
  "--c-border-light", "--c-bg", "--c-white", "--c-dot-inactive",
] as const;

type ResolvedColors = Record<string, string>;

function useThemeColors(): ResolvedColors {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<ResolvedColors>({});

  useEffect(() => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    const resolved: ResolvedColors = {};
    for (const key of COLOR_KEYS) {
      resolved[key] = styles.getPropertyValue(key).trim();
    }
    setColors(resolved);
  }, [resolvedTheme]);

  return colors;
}

function rc(colors: ResolvedColors, key: string, fallback: string): string {
  return colors[key] || fallback;
}

// ─── Slot math (circular) ──────────────────────────────
// Maps card index to a slot relative to the active card.
// Wrapping arithmetic ensures the carousel loops infinitely.
function getSlot(i: number, active: number, N: number): number {
  let d = i - active;
  if (d > N / 2) d -= N;
  if (d < -N / 2) d += N;
  return d;
}

// Converts a slot number into animation props (x offset, scale, opacity, blur, z-index).
// Only slots -1, 0, +1 are visible; all others are pushed far offscreen.
function slotProps(slot: number, layout: ReturnType<typeof useLayoutConfig>) {
  const { sideOffset, farOffset, activeScale, sideScale, hiddenScale } = layout;
  if (slot === 0)
    return { x: 0, scale: activeScale, opacity: 1, blur: 0, z: 20 };
  if (slot === -1)
    return { x: -sideOffset, scale: sideScale, opacity: 0.4, blur: 0.5, z: 10 };
  if (slot === 1)
    return { x: sideOffset, scale: sideScale, opacity: 0.4, blur: 0.5, z: 10 };
  const dir = slot < 0 ? -1 : 1;
  return { x: dir * farOffset, scale: hiddenScale, opacity: 0, blur: 2, z: 1 };
}

// ─── Animated Geometric Icons (Interactive) ─────────────
// Each card has a unique Bauhaus-style icon composed of draggable geometric shapes.
// springIn: controlled, precise feel. springBouncy: playful, elastic feel.
// When inactive, shapes shrink/fade; when active, they expand and become draggable.

const springIn = { type: "spring" as const, stiffness: 260, damping: 22 };
const springBouncy = { type: "spring" as const, stiffness: 320, damping: 18 };

const dragProps = {
  drag: true as const,
  dragConstraints: { top: 0, left: 0, right: 0, bottom: 0 },
  dragElastic: 0.4,
  dragTransition: { bounceStiffness: 400, bounceDamping: 15 },
};

function GeoIconQuote({ active }: { active: boolean }) {
  const constraintRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={constraintRef} className="relative" style={{ width: 192, height: 192, pointerEvents: active ? "auto" : "none" }}>
      <motion.div
        className="absolute bottom-0 left-0 cursor-grab active:cursor-grabbing"
        style={{ width: 120, height: 100 }}
        {...(active ? dragProps : {})}
        dragConstraints={constraintRef}
        whileHover={active ? { scale: 1.15, rotate: 8 } : {}}
        whileTap={active ? { scale: 0.9 } : {}}
        animate={{ scale: active ? 1 : 0.7, opacity: active ? 0.9 : 0.5, y: active ? 0 : 10 }}
        transition={{ ...springIn, delay: active ? 0.05 : 0 }}
      >
        <svg width="120" height="100" viewBox="0 0 120 100">
          <polygon points="60,0 120,100 0,100" style={{ fill: C.cyan }} />
        </svg>
      </motion.div>
      <motion.div
        className="absolute rounded-full cursor-grab active:cursor-grabbing"
        style={{ width: 96, height: 96, backgroundColor: C.yellow, top: 0, right: 16 }}
        {...(active ? dragProps : {})}
        dragConstraints={constraintRef}
        whileHover={active ? { scale: 1.2, rotate: -10 } : {}}
        whileTap={active ? { scale: 0.85 } : {}}
        animate={{ scale: active ? 1 : 0.6, opacity: active ? 0.9 : 0.4, x: active ? 0 : 10, y: active ? 0 : 8 }}
        transition={{ ...springBouncy, delay: active ? 0.12 : 0 }}
      />
      <motion.div
        className="absolute cursor-grab active:cursor-grabbing"
        style={{ width: 32, height: 128, backgroundColor: C.red, top: 38, left: 3 }}
        {...(active ? dragProps : {})}
        dragConstraints={constraintRef}
        whileHover={active ? { scaleY: 1.15, rotate: -18 } : {}}
        whileTap={active ? { scaleY: 0.8 } : {}}
        animate={{ rotate: active ? -12 : -6, scaleY: active ? 1 : 0.5, opacity: active ? 0.9 : 0.3 }}
        transition={{ ...springIn, delay: active ? 0.18 : 0 }}
      />
      <motion.div
        className="absolute"
        style={{ width: 128, height: 8, backgroundColor: C.darkAlt, bottom: -28, right: -16 }}
        animate={{ rotate: 45, scaleX: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ ...springBouncy, delay: active ? 0.25 : 0 }}
      />
    </div>
  );
}

function GeoIconVoice({ active }: { active: boolean }) {
  const constraintRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={constraintRef} className="relative" style={{ width: 128, height: 128, pointerEvents: active ? "auto" : "none" }}>
      <motion.div
        className="absolute inset-0 rounded-full cursor-grab active:cursor-grabbing"
        style={{ border: `4px solid ${C.yellow}` }}
        {...(active ? dragProps : {})}
        dragConstraints={constraintRef}
        whileHover={active ? { scale: 1.12, rotate: 15 } : {}}
        whileTap={active ? { scale: 0.9 } : {}}
        animate={{ scale: active ? 1 : 0.8, opacity: active ? 1 : 0.5, rotate: active ? 0 : -30 }}
        transition={{ ...springBouncy, delay: active ? 0.05 : 0 }}
      />
      <motion.div
        className="absolute rounded-full cursor-grab active:cursor-grabbing"
        style={{ inset: 16, border: `4px solid ${C.cyan}` }}
        {...(active ? dragProps : {})}
        dragConstraints={constraintRef}
        whileHover={active ? { scale: 1.2, rotate: -20 } : {}}
        whileTap={active ? { scale: 0.85 } : {}}
        animate={{ scale: active ? 1 : 0.6, opacity: active ? 0.6 : 0.3, rotate: active ? 0 : 45 }}
        transition={{ ...springIn, delay: active ? 0.13 : 0 }}
      />
      <motion.div
        className="absolute rounded-full cursor-grab active:cursor-grabbing"
        style={{ inset: 32, backgroundColor: C.red }}
        {...(active ? dragProps : {})}
        dragConstraints={constraintRef}
        whileHover={active ? { scale: 1.3 } : {}}
        whileTap={active ? { scale: 0.7 } : {}}
        animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ ...springBouncy, delay: active ? 0.22 : 0 }}
      />
    </div>
  );
}

function GeoIconArtist({ active }: { active: boolean }) {
  const constraintRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={constraintRef} className="relative" style={{ width: 128, height: 128, pointerEvents: active ? "auto" : "none" }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: C.red }}
        animate={{ scale: active ? 1 : 0.7, opacity: active ? 0.2 : 0.1 }}
        transition={{ ...springIn, delay: active ? 0.05 : 0 }}
      />
      <motion.div
        className="absolute rounded-full cursor-grab active:cursor-grabbing"
        style={{ top: -8, left: 8, right: -8, bottom: 8, border: `4px solid ${C.red}` }}
        {...(active ? dragProps : {})}
        dragConstraints={constraintRef}
        whileHover={active ? { scale: 1.1, rotate: 10 } : {}}
        whileTap={active ? { scale: 0.9 } : {}}
        animate={{ scale: active ? 1 : 0.75, opacity: active ? 1 : 0.4, x: active ? 0 : -8, y: active ? 0 : 8 }}
        transition={{ ...springBouncy, delay: active ? 0.12 : 0 }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 cursor-grab active:cursor-grabbing"
        style={{ width: 64, height: 64, backgroundColor: C.cyan }}
        {...(active ? dragProps : {})}
        dragConstraints={constraintRef}
        whileHover={active ? { scale: 1.2, rotate: 60 } : {}}
        whileTap={active ? { scale: 0.8, rotate: 30 } : {}}
        animate={{ rotate: active ? 45 : 0, scale: active ? 1 : 0.4, x: "-50%", y: "-50%", opacity: active ? 1 : 0.3 }}
        transition={{ ...springBouncy, delay: active ? 0.2 : 0 }}
      />
    </div>
  );
}

function GeoIconClient({ active }: { active: boolean }) {
  const constraintRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={constraintRef} className="relative" style={{ width: 128, height: 128, pointerEvents: active ? "auto" : "none" }}>
      <motion.div
        className="absolute cursor-grab active:cursor-grabbing"
        style={{ width: 88, height: 88, backgroundColor: C.cyan, top: 0, left: 0 }}
        {...(active ? dragProps : {})}
        dragConstraints={constraintRef}
        whileHover={active ? { scale: 1.1, rotate: 8 } : {}}
        whileTap={active ? { scale: 0.9 } : {}}
        animate={{ scale: active ? 1 : 0.6, opacity: active ? 0.25 : 0.1, rotate: active ? 0 : -10 }}
        transition={{ ...springIn, delay: active ? 0.05 : 0 }}
      />
      <motion.div
        className="absolute rounded-full cursor-grab active:cursor-grabbing"
        style={{ width: 72, height: 72, border: `4px solid ${C.yellow}`, bottom: 0, right: 0 }}
        {...(active ? dragProps : {})}
        dragConstraints={constraintRef}
        whileHover={active ? { scale: 1.15, rotate: -12 } : {}}
        whileTap={active ? { scale: 0.85 } : {}}
        animate={{ scale: active ? 1 : 0.5, opacity: active ? 1 : 0.4, x: active ? 0 : -10, y: active ? 0 : -10 }}
        transition={{ ...springBouncy, delay: active ? 0.12 : 0 }}
      />
      <motion.div
        className="absolute cursor-grab active:cursor-grabbing"
        style={{ width: 40, height: 40, backgroundColor: C.red, top: 44, left: 28 }}
        {...(active ? dragProps : {})}
        dragConstraints={constraintRef}
        whileHover={active ? { scale: 1.25, rotate: 30 } : {}}
        whileTap={active ? { scale: 0.8 } : {}}
        animate={{ rotate: active ? 15 : 0, scale: active ? 1 : 0, opacity: active ? 0.8 : 0 }}
        transition={{ ...springBouncy, delay: active ? 0.2 : 0 }}
      />
    </div>
  );
}

const geoIcons = [GeoIconQuote, GeoIconVoice, GeoIconArtist, GeoIconClient];

// ─── Video Modal ────────────────────────────────────────
// Fullscreen YouTube embed with Bauhaus-styled decorative elements.
// Bauhaus offset shadow (cyan border + red shadow) reinforces the design language.

function VideoModal({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute inset-0 cursor-pointer"
        style={{ backgroundColor: C.overlay }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 w-[90vw] max-w-[800px] aspect-video"
        initial={{ scale: 0.8, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
      >
        <motion.button
          className="absolute -top-12 right-0 cursor-pointer bg-transparent"
          onClick={onClose}
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke={C.white} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </motion.button>
        <div className="w-full h-full overflow-hidden" style={{ border: `3px solid ${C.cyan}`, boxShadow: `12px 12px 0px 0px ${C.red}` }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Video"
          />
        </div>
        <div className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full" style={{ backgroundColor: C.yellow }} />
        <div className="absolute -top-4 -left-4 w-6 h-6" style={{ backgroundColor: C.cyan, transform: "rotate(45deg)" }} />
      </motion.div>
    </motion.div>
  );
}

// ─── Unified Carousel Card ──────────────────────────
// Absolute-positioned card that animates between active/inactive states.
// All content positions are pixel-calculated per breakpoint to avoid
// layout shifts during transitions.

function useCardPositions(bp: Breakpoint, cardW: number, cardH: number, isLargeIcon: boolean) {
  return useMemo(() => {
    const pad = bp === "mobile" ? 14 : bp === "tablet" ? 18 : cardW * 0.076;

    if (bp === "mobile") {
      return {
        pad,
        iconLeft: isLargeIcon ? 10 : 20, iconTop: isLargeIcon ? 10 : 14, iconScale: isLargeIcon ? 0.5 : 0.6,
        titleTop: isLargeIcon ? 120 : 100, titleFontSize: 16,
        descTop: isLargeIcon ? 145 : 125, descFontSize: 11, descLineHeight: "15px",
        videoTop: isLargeIcon ? 190 : 170, videoFontSize: 14, playSize: 20,
        ctaBottom: 20, ctaFontSize: 11,
      };
    }
    if (bp === "tablet") {
      return {
        pad,
        iconLeft: isLargeIcon ? 14 : 24, iconTop: isLargeIcon ? 12 : 18, iconScale: isLargeIcon ? 0.6 : 0.7,
        titleTop: isLargeIcon ? 145 : 125, titleFontSize: 20,
        descTop: isLargeIcon ? 175 : 155, descFontSize: 12, descLineHeight: "17px",
        videoTop: isLargeIcon ? 225 : 205, videoFontSize: 16, playSize: 22,
        ctaBottom: 30, ctaFontSize: 12,
      };
    }
    return {
      pad,
      iconLeft: isLargeIcon ? cardW * 0.092 : cardW * 0.143, iconTop: isLargeIcon ? 20 : 28, iconScale: 1,
      titleTop: isLargeIcon ? 190 : 165, titleFontSize: 28,
      descTop: isLargeIcon ? 228 : 200, descFontSize: 14, descLineHeight: "20px",
      videoTop: isLargeIcon ? 280 : 260, videoFontSize: 18, playSize: 26,
      ctaBottom: 44, ctaFontSize: 13,
    };
  }, [bp, cardW, cardH, isLargeIcon]);
}

function CarouselCard({
  item, index, slot, onClick, onPlayVideo, layout, dragX, bp,
}: {
  item: any; index: number; slot: number; onClick: () => void;
  onPlayVideo: () => void; layout: ReturnType<typeof useLayoutConfig>;
  dragX: number; bp: Breakpoint;
}) {
  const isActive = slot === 0;
  const GeoIcon = geoIcons[index];
  const isLargeIcon = index === 0;
  const { cardW, cardH } = layout;
  const tc = useThemeColors();
  const pos = useCardPositions(bp, cardW, cardH, isLargeIcon);

  const inactiveIconScale = bp === "mobile" ? 0.35 : bp === "tablet" ? 0.45 : (isLargeIcon ? 0.6 : 0.88);
  const inactiveIconTop = bp === "mobile" ? 20 : bp === "tablet" ? 30 : cardH * 0.104;

  const sp = slotProps(slot, layout);

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        width: cardW, height: cardH, top: "50%", left: "50%",
        marginLeft: -cardW / 2, marginTop: -cardH / 2, willChange: "transform",
      }}
      animate={{
        x: sp.x + dragX, scale: sp.scale, opacity: sp.opacity,
        filter: `blur(${sp.blur}px)`, zIndex: sp.z,
      }}
      transition={
        dragX !== 0
          ? { x: { type: "tween", duration: 0.05, ease: "linear" }, type: "spring", stiffness: 180, damping: 26, mass: 0.9 }
          : { type: "spring", stiffness: 180, damping: 26, mass: 0.9 }
      }
      onClick={onClick}
    >
      <div className="relative size-full overflow-hidden" style={{ backgroundColor: C.white }}>
        <motion.div
          className="absolute rounded-tl-full"
          style={{ width: cardW * 0.286, height: cardW * 0.286, backgroundColor: C.bg, bottom: 2, right: 2, transformOrigin: "bottom right" }}
          animate={{ scale: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
          transition={{ ...springIn, delay: isActive ? 0.1 : 0 }}
        />
        <motion.div
          className="absolute left-[2px] right-[2px] top-[2px]"
          style={{
            height: bp === "mobile" ? 5 : bp === "tablet" ? 6 : 8,
            background: `linear-gradient(to right, ${C.red}, ${C.yellow} 50%, ${C.cyan})`,
            transformOrigin: "left",
          }}
          animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
          transition={{
            scaleX: { type: "spring", stiffness: 200, damping: 24, delay: isActive ? 0.08 : 0 },
            opacity: { duration: 0.15, delay: isActive ? 0.05 : 0 },
          }}
        />
        <motion.div
          className="absolute"
          animate={{
            left: isActive ? pos.iconLeft : "50%",
            top: isActive ? pos.iconTop : inactiveIconTop,
            x: isActive ? 0 : "-50%",
            scale: isActive ? pos.iconScale : inactiveIconScale,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <GeoIcon active={isActive} />
        </motion.div>
        <motion.div
          className="absolute uppercase"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: isActive ? C.dark : C.darkAlt }}
          animate={{
            top: isActive ? pos.titleTop : (bp === "mobile" ? 80 : bp === "tablet" ? 100 : cardH * 0.4),
            left: isActive ? pos.pad : "50%",
            x: isActive ? 0 : "-50%",
            fontSize: isActive ? pos.titleFontSize : (bp === "mobile" ? 11 : bp === "tablet" ? 14 : 18),
            letterSpacing: isActive ? "-0.8px" : "1.8px",
            opacity: 1,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25, fontSize: { type: "spring", stiffness: 150, damping: 22 } }}
        >
          {item.title}
        </motion.div>
        <motion.p
          className="absolute"
          style={{
            left: pos.pad, right: pos.pad, fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 400, fontSize: pos.descFontSize, lineHeight: pos.descLineHeight, color: C.slateLight,
          }}
          animate={{ top: isActive ? pos.descTop : pos.descTop + 20, opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }}
          transition={{ type: "spring", stiffness: 220, damping: 24, delay: isActive ? 0.15 : 0 }}
        >
          {item.description}
        </motion.p>
        <motion.div
          className="absolute"
          style={{ left: pos.pad }}
          animate={{ top: isActive ? pos.videoTop : pos.videoTop + 30, opacity: isActive ? 1 : 0, y: isActive ? 0 : 15 }}
          transition={{ type: "spring", stiffness: 220, damping: 24, delay: isActive ? 0.25 : 0 }}
        >
          <motion.button
            className="flex items-center gap-2 cursor-pointer bg-transparent"
            onClick={(e) => { e.stopPropagation(); onPlayVideo(); }}
            whileHover={{ scale: 1.06, rotate: -1 }}
            whileTap={{ scale: 0.95, rotate: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            style={{ transform: "rotate(-2deg)" }}
          >
            <motion.div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: pos.playSize, height: pos.playSize, backgroundColor: C.red }}
              whileHover={{ backgroundColor: rc(tc, "--c-cyan", "#11B4D4"), scale: 1.15 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <svg width={bp === "mobile" ? 8 : 10} height={bp === "mobile" ? 10 : 12} viewBox="0 0 10 12" fill="none">
                <path d="M1 1.5v9l8-4.5-8-4.5z" style={{ fill: "#FFFFFF" }} />
              </svg>
            </motion.div>
            <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 600, fontSize: pos.videoFontSize, color: C.slate }}>
              Reprod\u00faceme...
            </span>
          </motion.button>
        </motion.div>
        <motion.div
          className="absolute"
          style={{ left: pos.pad, bottom: pos.ctaBottom }}
          animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
          transition={{ type: "spring", stiffness: 250, damping: 22, delay: isActive ? 0.3 : 0 }}
        >
          <motion.button
            className="flex items-center gap-3 relative cursor-pointer bg-transparent overflow-visible"
            onClick={(e) => e.stopPropagation()}
            whileHover="hover" whileTap="tap" initial="rest"
            style={{ padding: bp === "mobile" ? "4px 0" : "8px 0" }}
          >
            <motion.div
              className="absolute -left-2 top-0 bottom-0 rounded-sm"
              style={{ backgroundColor: C.cyan, transformOrigin: "left", zIndex: -1 }}
              variants={{ rest: { width: 0, opacity: 0 }, hover: { width: "calc(100% + 16px)", opacity: 0.08 }, tap: { width: "calc(100% + 16px)", opacity: 0.15 } }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0"
              style={{ height: 2, backgroundColor: C.cyan, transformOrigin: "left" }}
              animate={{ scaleX: isActive ? 1 : 0 }}
              variants={{ rest: {}, hover: { height: 3, backgroundColor: rc(tc, "--c-dark", "#0F172A") }, tap: { height: 3, backgroundColor: rc(tc, "--c-red", "#D92525") } }}
              transition={{ type: "spring", stiffness: 240, damping: 20, delay: isActive ? 0.38 : 0 }}
            />
            <span
              className="uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: pos.ctaFontSize, lineHeight: "20px", letterSpacing: "1.4px", color: C.dark }}
            >
              {item.cta}
            </span>
            <motion.svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              animate={{ x: isActive ? 0 : -6, opacity: isActive ? 1 : 0 }}
              variants={{ rest: { x: 0 }, hover: { x: 6 }, tap: { x: 10, scale: 1.2 } }}
              transition={{ ...springIn, delay: isActive ? 0.4 : 0 }}
            >
              <path d={svgPaths.p304eaa0} style={{ fill: C.dark }} />
            </motion.svg>
          </motion.button>
        </motion.div>
        <motion.div
          aria-hidden className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 1, borderWidth: 1, borderColor: C.border }}
          animate={{ opacity: isActive ? 0 : 1, borderWidth: 1, borderColor: C.border }}
          style={{ borderStyle: "solid" }} transition={{ duration: 0.3 }}
        />
        <motion.div
          aria-hidden className="absolute inset-0 pointer-events-none"
          style={{ borderStyle: "solid" }}
          initial={{ opacity: 0, borderWidth: 2, borderColor: C.cyan, boxShadow: "0px 0px 0px 0px rgba(17, 180, 212, 0)" }}
          animate={{
            opacity: isActive ? 1 : 0, borderWidth: 2, borderColor: C.cyan,
            boxShadow: isActive ? "15px 15px 0px 0px rgba(17, 180, 212, 0.2)" : "0px 0px 0px 0px rgba(17, 180, 212, 0)",
          }}
          transition={{
            opacity: { duration: 0.25, delay: isActive ? 0.05 : 0 },
            boxShadow: { type: "spring", stiffness: 180, damping: 22, delay: isActive ? 0.15 : 0 },
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── Continuous drag + momentum carousel ────────────────
// Custom pointer event handling instead of Framer's drag API because
// we need momentum-based coasting with snap-to-card behavior.
// Velocity is tracked per-frame and used to predict landing position.

function useDragCarousel(
  activeIndex: number,
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>,
  sideOffset: number,
  N: number,
) {
  const [dragX, setDragX] = useState(0);
  const dragXRef = useRef(0);
  const dragging = useRef(false);
  const captured = useRef(false);
  const startX = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const rafId = useRef(0);

  useEffect(() => { dragXRef.current = dragX; }, [dragX]);

  const cancelMomentum = useCallback(() => {
    if (rafId.current) { cancelAnimationFrame(rafId.current); rafId.current = 0; }
  }, []);

  // Momentum: apply friction each frame, snap when boundary crossed or velocity dies
  const startMomentum = useCallback(
    (initialVel: number) => {
      const friction = 0.93;
      let vel = initialVel;
      let offset = dragXRef.current;

      const tick = () => {
        vel *= friction;
        offset += vel;

        if (Math.abs(offset) > sideOffset * 0.35) {
          const steps = Math.round(-offset / sideOffset);
          if (steps !== 0) {
            setActiveIndex((prev) => { let next = prev + steps; next = ((next % N) + N) % N; return next; });
          }
          setDragX(0); velocity.current = 0; return;
        }

        if (Math.abs(vel) < 0.4) {
          if (Math.abs(offset) > sideOffset * 0.25) {
            const dir = offset < 0 ? 1 : -1;
            setActiveIndex((prev) => { let next = prev + dir; next = ((next % N) + N) % N; return next; });
          }
          setDragX(0); return;
        }

        setDragX(offset);
        rafId.current = requestAnimationFrame(tick);
      };

      rafId.current = requestAnimationFrame(tick);
    },
    [sideOffset, setActiveIndex],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, a")) return;
      if (e.button !== 0) return;

      cancelMomentum();
      dragging.current = true; captured.current = false;
      startX.current = e.clientX; lastX.current = e.clientX;
      lastTime.current = performance.now(); velocity.current = 0;
    },
    [cancelMomentum],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const totalDX = e.clientX - startX.current;

      if (!captured.current && Math.abs(totalDX) > 5) {
        captured.current = true;
        try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* ignore */ }
      }
      if (!captured.current) return;

      const now = performance.now();
      const dt = now - lastTime.current;
      const dx = e.clientX - lastX.current;
      if (dt > 0) { velocity.current = (dx / dt) * 16; }

      lastX.current = e.clientX; lastTime.current = now;
      setDragX(totalDX);
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;

      if (captured.current) {
        try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      }
      if (!captured.current) { setDragX(0); return; }

      const totalDX = e.clientX - startX.current;
      const vel = velocity.current;

      if (Math.abs(vel) > 2) {
        startMomentum(vel);
      } else {
        if (Math.abs(totalDX) > sideOffset * 0.25) {
          const dir = totalDX < 0 ? 1 : -1;
          setActiveIndex((prev) => { let next = prev + dir; next = ((next % N) + N) % N; return next; });
        }
        setDragX(0);
      }
    },
    [sideOffset, setActiveIndex, startMomentum],
  );

  useEffect(() => cancelMomentum, [cancelMomentum]);
  useEffect(() => { setDragX(0); cancelMomentum(); }, [activeIndex, cancelMomentum]);

  return {
    dragX,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}

// ─── Theme Transition Overlay ───────────────────────
// Two-phase animation for switching light/dark themes:
// Phase 1 (0-350ms): Circular clip-path wipe expands from button origin
// Phase 2 (0-1400ms): 15 Bauhaus shapes burst outward with staggered delays
// The actual theme flip happens at 350ms so the wipe covers the color change.

type ThemeTransitionState = {
  origin: { x: number; y: number };
  targetTheme: "light" | "dark";
} | null;

const THEME_BG = { light: "#F8FBFC", dark: "#0B1120" };

const bauhausShapes = [
  { shape: "circle", color: "#EF4444", size: 56, angle: -30, distance: 900, rotate: 360 },
  { shape: "triangle", color: "#22D3EE", size: 52, angle: 80, distance: 1000, rotate: -440 },
  { shape: "square", color: "#F2C029", size: 48, angle: 200, distance: 850, rotate: 320 },
  { shape: "circle", color: "#D92525", size: 36, angle: 145, distance: 750, rotate: -280 },
  { shape: "triangle", color: "#11B4D4", size: 34, angle: -75, distance: 800, rotate: 400 },
  { shape: "square", color: "#FACC15", size: 32, angle: 30, distance: 700, rotate: -200 },
  { shape: "circle", color: "#22D3EE", size: 30, angle: 250, distance: 1100, rotate: 520 },
  { shape: "triangle", color: "#EF4444", size: 28, angle: 310, distance: 950, rotate: -360 },
  { shape: "square", color: "#11B4D4", size: 22, angle: 5, distance: 1200, rotate: 600 },
  { shape: "circle", color: "#F2C029", size: 20, angle: 120, distance: 650, rotate: -180 },
  { shape: "triangle", color: "#D92525", size: 20, angle: -110, distance: 880, rotate: 480 },
  { shape: "square", color: "#22D3EE", size: 18, angle: 170, distance: 1050, rotate: -520 },
  { shape: "circle", color: "#FACC15", size: 14, angle: 55, distance: 600, rotate: 300 },
  { shape: "square", color: "#EF4444", size: 12, angle: -150, distance: 700, rotate: -400 },
  { shape: "triangle", color: "#11B4D4", size: 14, angle: 280, distance: 780, rotate: 540 },
];

function ThemeTransitionOverlay({
  transition, onComplete, setTheme,
}: {
  transition: NonNullable<ThemeTransitionState>; onComplete: () => void; setTheme: (t: string) => void;
}) {
  const { origin, targetTheme } = transition;
  const bgColor = THEME_BG[targetTheme];
  const hasFlipped = useRef(false);

  useEffect(() => {
    const flipTimer = setTimeout(() => {
      if (!hasFlipped.current) { hasFlipped.current = true; setTheme(targetTheme); }
    }, 350);
    const cleanupTimer = setTimeout(onComplete, 1600);
    return () => { clearTimeout(flipTimer); clearTimeout(cleanupTimer); };
  }, [targetTheme, setTheme, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}
      initial={{ opacity: 1 }} animate={{ opacity: [1, 1, 1, 0] }}
      transition={{ duration: 1.5, times: [0, 0.55, 0.75, 1], ease: "easeInOut" }}
    >
      <motion.div
        className="absolute inset-0" style={{ backgroundColor: bgColor }}
        initial={{ clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }}
        animate={{ clipPath: `circle(200vmax at ${origin.x}px ${origin.y}px)` }}
        transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
      />
      {bauhausShapes.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * s.distance;
        const ty = Math.sin(rad) * s.distance;
        return (
          <motion.div
            key={i} className="absolute"
            style={{ left: origin.x - s.size / 2, top: origin.y - s.size / 2, width: s.size, height: s.size }}
            initial={{ scale: 0, x: 0, y: 0, rotate: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.4, 1, 0.6], x: [0, tx * 0.3, tx * 0.7, tx], y: [0, ty * 0.3, ty * 0.7, ty],
              rotate: [0, s.rotate * 0.5, s.rotate], opacity: [0, 1, 0.9, 0],
            }}
            transition={{ duration: 1.4, delay: i * 0.03, ease: [0.23, 1, 0.32, 1] }}
          >
            <svg width={s.size} height={s.size} viewBox="0 0 24 24">
              {s.shape === "circle" && <circle cx="12" cy="12" r="11" fill={s.color} />}
              {s.shape === "triangle" && <polygon points="12,1 23,22 1,22" fill={s.color} />}
              {s.shape === "square" && <rect x="1" y="1" width="22" height="22" fill={s.color} />}
            </svg>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─── Main Carousel ────────────────────────────────
// Composes header, hero section, carousel cards, pagination,
// footer, background, video modal, and theme transition overlay.

export function TattooCarousel() {
  const { config } = useConfig();
  const items = config.cards;
  const N = items.length > 0 ? items.length : 1;

  const [activeIndex, setActiveIndex] = useState(0);
  const [videoModal, setVideoModal] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const bp = useBreakpoint();
  const layout = useLayoutConfig(bp);
  const isMobile = bp === "mobile";
  const isDesktop = bp === "desktop";
  const tc = useThemeColors();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [themeTransition, setThemeTransition] = useState<ThemeTransitionState>(null);
  const [isNudging, setIsNudging] = useState(false);
  const hasClickedRef = useRef(false);

  // Gentle attention-grab for first-time visitors who haven't interacted yet
  useEffect(() => {
    const nudgeInterval = setInterval(() => {
      if (!hasClickedRef.current) {
        setIsNudging(true);
        setTimeout(() => setIsNudging(false), 2000);
      }
    }, 30000);
    return () => clearInterval(nudgeInterval);
  }, []);

  const triggerThemeSwitch = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setThemeTransition({
      origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      targetTheme: isDark ? "light" : "dark",
    });
  }, [isDark]);

  const next = useCallback(() => { setActiveIndex((p) => (p + 1) % N); }, [N]);
  const prev = useCallback(() => { setActiveIndex((p) => (p - 1 + N) % N); }, [N]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (videoModal) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev, videoModal]);

  useEffect(() => { if (isDesktop) setMenuOpen(false); }, [isDesktop]);

  const { dragX, handlers: dragHandlers } = useDragCarousel(activeIndex, setActiveIndex, layout.sideOffset, N);

  return (
    <div
      className="flex flex-col relative size-full select-none"
      style={{ fontFamily: "'Space Grotesk', sans-serif", backgroundColor: C.bg }}
    >
      {/* HEADER */}
      <header
        className="relative shrink-0 w-full z-40 flex items-center"
        style={{ height: 73, backgroundColor: C.headerBg, backdropFilter: "blur(2px)" }}
      >
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ borderBottom: `1px solid ${C.border}` }} />

        {!isDesktop && (
          <>
            <motion.button
              className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 cursor-pointer bg-transparent p-0"
              onClick={() => { hasClickedRef.current = true; setMenuOpen((v) => !v); }}
              whileTap={{ scale: 0.95 }}
            >
              {config.logoImg && (
                <motion.img
                  src={config.logoImg} alt={config.navTitle}
                  style={{ height: 32, width: "auto", objectFit: "contain" }}
                  animate={isNudging ? { rotate: [0, -3, 3, -3, 3, 0], x: [0, -1, 1, -1, 1, 0], scale: [1, 1.05, 1.05, 1] } : {}}
                  whileHover={{ rotate: -8, scale: 1.1 }}
                  transition={isNudging ? { duration: 0.5, repeat: 1 } : { type: "spring", stiffness: 300, damping: 15 }}
                />
              )}
              <motion.span
                style={{ fontFamily: "'Caveat', cursive", fontWeight: 600, fontSize: 16, color: C.slate }}
                animate={isNudging ? { x: [0, 4, 0, 4, 0], scale: [1, 1.1, 1], color: [C.slate, C.cyan, C.slate] } : { opacity: [0.6, 1, 0.6] }}
                whileHover={{ scale: 1.15, x: 5, color: rc(tc, "--c-cyan", "#11B4D4") }}
                transition={isNudging ? { duration: 0.6 } : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {config.pruebameText}
              </motion.span>
            </motion.button>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <motion.button
                className="cursor-pointer bg-transparent p-1.5"
                onClick={triggerThemeSwitch}
                whileHover={{ scale: 1.15, rotate: 15 }} whileTap={{ scale: 0.9 }}
                aria-label="Toggle dark mode"
              >
                <motion.div animate={{ rotate: isDark ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                  {isDark ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="5" style={{ fill: C.yellow }} />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" style={{ stroke: C.yellow }} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" style={{ fill: C.slate }} />
                    </svg>
                  )}
                </motion.div>
              </motion.button>
              <motion.button
                className="cursor-pointer" initial="initial" whileHover="hover" whileTap={{ scale: 0.97 }}
                variants={{
                  initial: { backgroundColor: rc(tc, "--c-red", "#D92525"), boxShadow: `4px 4px 0px ${C.dark}`, scale: 1 },
                  hover: { backgroundColor: rc(tc, "--c-yellow", "#F2C029"), boxShadow: `6px 6px 0px ${C.dark}`, scale: 1.04 },
                }}
                style={{ padding: "6px 16px", border: `2px solid ${C.dark}` }}
              >
                <motion.span
                  className="uppercase block"
                  variants={{ initial: { color: rc(tc, "--c-white", "#FFFFFF") }, hover: { color: rc(tc, "--c-dark", "#0F172A") } }}
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.7px" }}
                >
                  {config.pruebameText}
                </motion.span>
              </motion.button>
            </div>
          </>
        )}

        {isDesktop && (
          <>
            <div className="absolute left-10 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <motion.button
                className="bg-transparent p-0 border-0 cursor-pointer flex items-center gap-3"
                onClick={() => { hasClickedRef.current = true; }}
              >
                {config.logoImg && (
                  <motion.img
                    src={config.logoImg} alt={config.navTitle}
                    style={{ height: 32, width: "auto", objectFit: "contain" }}
                    animate={isNudging ? { rotate: [0, -2, 2, -2, 2, 0], scale: [1, 1.08, 1] } : {}}
                    whileHover={{ rotate: -10, scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  />
                )}
                <span className="uppercase" style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px", color: C.dark }}>
                  {config.navTitle}
                </span>
              </motion.button>
            </div>
            <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <ul className="flex items-center gap-6 lg:gap-8 m-0 p-0 list-none">
                {config.menuLinks?.map((link, idx) => (
                  <li key={idx}>
                    <motion.a
                      href={link.url} className="uppercase no-underline whitespace-nowrap block"
                      style={{ fontWeight: 500, fontSize: 14, letterSpacing: "1.4px", color: C.slate }}
                      whileHover={{ color: rc(tc, "--c-dark", "#0F172A") }} aria-label={link.text}
                    >
                      {link.text}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-4">
              <motion.button
                className="cursor-pointer bg-transparent p-1.5"
                onClick={triggerThemeSwitch}
                whileHover={{ scale: 1.15, rotate: 15 }} whileTap={{ scale: 0.9 }}
                aria-label="Toggle dark mode"
              >
                <motion.div animate={{ rotate: isDark ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                  {isDark ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="5" style={{ fill: C.yellow }} />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" style={{ stroke: C.yellow }} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" style={{ fill: C.slate }} />
                    </svg>
                  )}
                </motion.div>
              </motion.button>
              <motion.button
                className="cursor-pointer" initial="initial" whileHover="hover" whileTap={{ scale: 0.97 }}
                variants={{
                  initial: { backgroundColor: rc(tc, "--c-red", "#D92525"), boxShadow: `4px 4px 0px ${C.dark}`, scale: 1 },
                  hover: { backgroundColor: rc(tc, "--c-yellow", "#F2C029"), boxShadow: `6px 6px 0px ${C.dark}`, scale: 1.04 },
                }}
                style={{ padding: "8px 22px", border: `2px solid ${C.dark}` }}
              >
                <motion.span
                  className="uppercase block"
                  variants={{ initial: { color: rc(tc, "--c-white", "#FFFFFF") }, hover: { color: rc(tc, "--c-dark", "#0F172A") } }}
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.7px" }}
                >
                  {config.pruebameText}
                </motion.span>
              </motion.button>
            </div>
          </>
        )}
      </header>

      {/* MOBILE/TABLET SLIDE-DOWN MENU */}
      <AnimatePresence>
        {menuOpen && !isDesktop && (
          <motion.div
            className="absolute left-0 right-0 z-50 overflow-hidden"
            style={{ top: 73, backgroundColor: C.white, borderBottom: `2px solid ${C.cyan}`, boxShadow: "0 8px 32px rgba(15,23,42,0.12)" }}
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <nav className="py-6">
              <ul className="flex flex-col items-center gap-4 m-0 p-0 list-none">
                {config.menuLinks?.map((link, idx) => (
                  <li key={idx}>
                    <motion.a
                      href={link.url} className="uppercase no-underline block"
                      style={{ fontWeight: 500, fontSize: 15, letterSpacing: "1.4px", color: C.slate }}
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ color: rc(tc, "--c-dark", "#0F172A") }}
                      onClick={() => setMenuOpen(false)} aria-label={link.text}
                    >
                      {link.text}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="h-1" style={{ background: `linear-gradient(to right, ${C.red}, ${C.yellow} 50%, ${C.cyan})` }} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && !isDesktop && (
          <motion.div
            className="fixed inset-0 z-[45] cursor-pointer" style={{ backgroundColor: C.overlayLight }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SECTION HEADER */}
      <motion.div
        className="relative z-30 flex flex-col items-center text-center shrink-0"
        style={{ padding: isMobile ? "20px 24px 0" : "28px 40px 0" }}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 24, delay: 0.1 }}
      >
        <motion.h1
          className="uppercase"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isMobile ? 28 : bp === "tablet" ? 36 : 44, letterSpacing: "-1px", color: C.dark, lineHeight: 1.1, margin: 0 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.15 }}
        >
          {config.heroTitle}
        </motion.h1>
        <motion.p
          style={{ fontFamily: "'Caveat', cursive", fontWeight: 600, fontSize: isMobile ? 20 : bp === "tablet" ? 24 : 28, color: C.dark, margin: isMobile ? "8px 0 0" : "10px 0 0", letterSpacing: "0.5px" }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.25 }}
        >
          {config.heroSubtitle}
        </motion.p>
        <motion.div
          style={{ width: isMobile ? 60 : 80, height: 4, background: `linear-gradient(to right, ${C.red}, ${C.yellow})`, margin: isMobile ? "12px 0" : "16px 0", borderRadius: 2 }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.35 }}
        />
        <motion.p
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400, fontSize: isMobile ? 13 : 15, lineHeight: "1.65", color: C.slateLight, maxWidth: 620, margin: 0 }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.4 }}
        >
          {config.heroText}
        </motion.p>
      </motion.div>

      {/* CAROUSEL */}
      <div
        className="flex-1 relative w-full z-30 min-h-0 overflow-hidden"
        style={{ touchAction: "pan-y", paddingBottom: isMobile ? 80 : 100 }}
        {...dragHandlers}
      >
        <div className="relative size-full">
          {items.map((item, i) => {
            const slot = getSlot(i, activeIndex, N);
            return (
              <CarouselCard
                key={item.id} item={item} index={i} slot={slot}
                layout={layout} dragX={dragX} bp={bp}
                onClick={() => { if (slot === -1) prev(); else if (slot === 1) next(); }}
                onPlayVideo={() => setVideoModal(item.videoId)}
              />
            );
          })}
        </div>
        {!isMobile && (
          <motion.button
            className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 cursor-pointer p-3 sm:p-4 rounded-full bg-transparent z-40"
            onClick={prev} whileHover={{ scale: 1.15, x: -3 }} whileTap={{ scale: 0.9 }} aria-label="Previous"
          >
            <svg width="18" height="30" viewBox="0 0 17.6625 30" fill="none"><path d={svgPaths.p2e30e7b0} style={{ fill: C.dark }} /></svg>
          </motion.button>
        )}
        {!isMobile && (
          <motion.button
            className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 cursor-pointer p-3 sm:p-4 rounded-full bg-transparent z-40"
            onClick={next} whileHover={{ scale: 1.15, x: 3 }} whileTap={{ scale: 0.9 }} aria-label="Next"
          >
            <svg width="18" height="30" viewBox="0 0 17.6625 30" fill="none"><path d={svgPaths.p1c1e7c40} style={{ fill: C.dark }} /></svg>
          </motion.button>
        )}
      </div>

      {/* PAGINATION */}
      <div className="relative shrink-0 flex items-center justify-center gap-4 z-50" style={{ paddingBottom: isMobile ? 80 : 100 }}>
        {items.map((item, i) => (
          <motion.button
            key={item.id} onClick={() => setActiveIndex(i)}
            className="cursor-pointer p-0 bg-transparent" aria-label={`Ir a ${item.title}`}
            whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.85 }}
          >
            <motion.div
              className="relative flex items-center justify-center"
              animate={{ width: i === activeIndex ? 30 : 16, height: i === activeIndex ? 30 : 16, rotate: i === activeIndex ? [0, 60, 90, 0][i % 4] : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <motion.svg
                viewBox="0 0 24 24" className="absolute w-full h-full"
                animate={{ x: i === activeIndex ? 3 : 0, y: i === activeIndex ? 3 : 0, opacity: i === activeIndex ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <path d={["M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z","M12 3L21.5 20H2.5z","M3 3h18v18H3z","M12 2l10 10-10 10L2 12z"][i % 4]} style={{ fill: [C.cyan, C.red, C.yellow, C.cyan][i % 4] }} />
              </motion.svg>
              <svg viewBox="0 0 24 24" className="relative w-full h-full overflow-visible">
                <motion.path
                  d={["M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z","M12 3L21.5 20H2.5z","M3 3h18v18H3z","M12 2l10 10-10 10L2 12z"][i % 4]}
                  style={{ fill: "rgba(0,0,0,0)", stroke: rc(tc, "--c-dark", "#0F172A") }} strokeWidth={2}
                  animate={{
                    fill: i === activeIndex ? [rc(tc, "--c-cyan", "#11B4D4"), rc(tc, "--c-red", "#D92525"), rc(tc, "--c-yellow", "#F2C029"), rc(tc, "--c-cyan", "#11B4D4")][i % 4] : "rgba(0,0,0,0)",
                    stroke: i === activeIndex ? [rc(tc, "--c-cyan", "#11B4D4"), rc(tc, "--c-red", "#D92525"), rc(tc, "--c-yellow", "#F2C029"), rc(tc, "--c-cyan", "#11B4D4")][i % 4] : rc(tc, "--c-dark", "#0F172A"),
                    strokeWidth: i === activeIndex ? 0 : 2,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              </svg>
            </motion.div>
          </motion.button>
        ))}
      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center px-6 sm:px-10 py-4" style={{ backgroundColor: C.bg }}>
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ borderTop: `1px solid ${C.borderLight}` }} />
        <div className="hidden sm:flex items-center gap-4 absolute left-10">
          {config.footerLinks.map((link, idx) => (
            <motion.a key={idx} href={link.url} className="uppercase no-underline"
              style={{ fontWeight: 400, fontSize: 12, letterSpacing: "1.2px", color: C.slateMuted }}
              whileHover={{ color: rc(tc, "--c-cyan", "#11B4D4") }}
            >
              {link.text}
            </motion.a>
          ))}
        </div>
        <span className="uppercase text-center" style={{ fontWeight: 400, fontSize: 12, letterSpacing: "1.2px", color: C.slateMuted }}>
          {config.footerText}
        </span>
      </footer>

      {/* BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex} className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.02, filter: "blur(7px)" }}
            animate={{ opacity: isDark ? 0.1 : 0.25, scale: 1.05, filter: "blur(5px)" }}
            exit={{ opacity: 0, scale: 1.08, filter: "blur(9px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ backgroundImage: `url(${items[activeIndex].bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(17,180,212,0.04) 0%, transparent 70%)` }}
        />
      </div>

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {videoModal && <VideoModal videoId={videoModal} onClose={() => setVideoModal(null)} />}
      </AnimatePresence>

      {/* THEME TRANSITION OVERLAY */}
      <AnimatePresence>
        {themeTransition && (
          <ThemeTransitionOverlay
            key="theme-transition" transition={themeTransition}
            onComplete={() => setThemeTransition(null)} setTheme={setTheme}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
