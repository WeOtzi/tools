/**
 * Global configuration context.
 *
 * Two-tier loading strategy:
 * 1. Defaults are hardcoded (defaultConfig) so the app always renders.
 * 2. On mount, fetches /config.json and shallow-merges over defaults.
 *
 * Persistence flow (dev only):
 * saveConfig() -> POST /api/save-config -> Vite middleware (vite.config.ts)
 * -> writes config.json + base64 images to public/ -> page reload.
 *
 * This approach lets non-technical users customize the landing via /config
 * without touching source code.
 */
import React, { createContext, useContext, useState, useEffect } from "react";
import defaultLogoImg from "../../assets/b9f5696472bd25bd16dc310ed8ae2d575f62d935.png";

export interface CardItem {
    id: number;
    title: string;
    description: string;
    cta: string;
    videoId: string;
    bg: string;
}

export interface SiteConfig {
    logoImg: string;
    navTitle: string;
    menuLinks: { text: string; url: string }[];
    heroTitle: string;
    heroSubtitle: string;
    heroText: string;
    pruebameText: string;
    pruebameUrl: string;
    cards: CardItem[];
    footerText: string;
    footerLinks: { text: string; url: string }[];
}

const defaultCards: CardItem[] = [
    {
        id: 1,
        title: "Cotizar un tatuaje",
        description: "Describe tu idea y recibe presupuestos de artistas verificados en minutos.",
        cta: "Comenzar",
        videoId: "dQw4w9WgXcQ",
        bg: "https://images.unsplash.com/photo-1562259954-bf6c7f31bf60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwdGF0dG9vJTIwcGFybG9yJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzcxNjU1OTAyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
        id: 2,
        title: "Chat de voz",
        description: "Habla directamente con tu artista para afinar cada detalle de tu dise\u00f1o.",
        cta: "Conectar",
        videoId: "dQw4w9WgXcQ",
        bg: "https://images.unsplash.com/photo-1688039763740-9036cb5d566e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2b2ljZSUyMHJlY29yZGluZyUyMHN0dWRpb3xlbnwxfHx8fDE3NzE2NTU5MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
        id: 3,
        title: "Portal de artista",
        description: "Gestiona tu portafolio, agenda y clientes desde un solo lugar.",
        cta: "Entrar",
        videoId: "dQw4w9WgXcQ",
        bg: "https://images.unsplash.com/photo-1635182473361-1f72e7b4be83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmFsJTIwZGVzaWduJTIwc3R1ZGlvfGVufDF8fHx8MTc3MTY1NTkwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
        id: 4,
        title: "Portal de cliente",
        description: "Revisa tus citas, historial y artistas favoritos en tu panel personal.",
        cta: "Mi cuenta",
        videoId: "dQw4w9WgXcQ",
        bg: "https://images.unsplash.com/photo-1634803828978-24dabef75a5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxjbGVhbiUyMG1pbmltYWxpc3QlMjB3b3Jrc3BhY2UlMjBvZmZpY2V8ZW58MXx8fHwxNzcxNjU1OTAyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
];

export const defaultConfig: SiteConfig = {
    logoImg: defaultLogoImg,
    navTitle: "Otzi",
    menuLinks: [
        { text: "We\u00d6tzi", url: "#" },
        { text: "Buscar Artistas", url: "#" },
        { text: "Blog", url: "#" },
        { text: "Proyecto Bauhaus", url: "#" },
        { text: "FAQ", url: "#" },
        { text: "Soporte", url: "#" },
    ],
    heroTitle: "EL ARTE DEL TATUAJE,",
    heroSubtitle: "REIMAGINADO",
    heroText: "Conectamos a los mejores artistas con amantes del tatuaje a trav\u00e9s de una plataforma innovadora impulsada por IA. Gestiona cotizaciones, citas y tu portafolio en un solo lugar.",
    pruebameText: "PULS\u00c1ME",
    pruebameUrl: "#",
    cards: defaultCards,
    footerText: "\u00a9 2026 Otzi.",
    footerLinks: [
        { text: "Privacidad", url: "#" },
        { text: "T\u00e9rminos", url: "#" }
    ]
};

interface ConfigContextType {
    config: SiteConfig;
    setConfig: (config: SiteConfig) => void;
    saveConfig: (config: SiteConfig, images?: Record<string, string>) => Promise<boolean>;
    resetConfig: () => Promise<boolean>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfigState] = useState<SiteConfig>(defaultConfig);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        fetch('/config.json')
            .then(res => {
                if (!res.ok) throw new Error("No config found");
                return res.json();
            })
            .then(data => {
                setConfigState((prev) => ({ ...prev, ...data }));
            })
            .catch((e) => {
                console.log("Using default config, /config.json not found or error:", e);
            })
            .finally(() => {
                setIsLoaded(true);
            });
    }, []);

    const saveConfig = async (newConfig: SiteConfig, images?: Record<string, string>) => {
        try {
            const payload = {
                config: newConfig,
                images: images || {}
            };

            const res = await fetch('/api/save-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                // Reload ensures Vite serves the freshly written physical files
                window.location.reload();
                return true;
            }
            return false;
        } catch (e) {
            console.error("Failed to save config:", e);
            return false;
        }
    };

    const resetConfig = async () => {
        return saveConfig(defaultConfig, {});
    };

    if (!isLoaded) return null;

    return (
        <ConfigContext.Provider value={{ config, setConfig: setConfigState, saveConfig, resetConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error("useConfig must be used within a ConfigProvider");
    }
    return context;
};
