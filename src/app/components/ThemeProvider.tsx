/**
 * Theme provider using next-themes.
 *
 * Persists theme choice to localStorage under key "weotzi-theme".
 * The class-based approach (attribute="class") works with the Tailwind v4
 * dark variant defined in theme.css via @custom-variant dark.
 *
 * Flash prevention: index.html contains an inline script that reads
 * this same storage key and applies the .dark class before React hydrates.
 */
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            storageKey="weotzi-theme"
            disableTransitionOnChange={false}
        >
            {children}
        </NextThemesProvider>
    );
}
