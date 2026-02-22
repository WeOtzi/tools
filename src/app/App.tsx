/**
 * Application root.
 *
 * Provider hierarchy: ConfigProvider (global site data) wraps ThemeProvider
 * (light/dark mode) wraps BrowserRouter. This ordering matters because theme
 * colors depend on config state and the router needs both available.
 *
 * Routes:
 *   /       -> LandingView (carousel + ElevenLabs AI widget)
 *   /config -> ConfigPage  (admin panel for content editing)
 */
import { BrowserRouter, Routes, Route } from "react-router";
import { TattooCarousel } from "./components/TattooCarousel";
import { ThemeProvider } from "./components/ThemeProvider";
import { ConfigProvider } from "./context/ConfigContext";
import { ConfigPage } from "./pages/ConfigPage";

function LandingView() {
  return (
    <>
      <TattooCarousel />
      <div className="fixed bottom-20 right-4 z-[9999] flex items-end justify-end gap-3">
        <elevenlabs-convai agent-id="agent_4401kgn1dvsefcwah28x07g6dfe4" />
      </div>
    </>
  );
}

function App() {
  return (
    <ConfigProvider>
      <ThemeProvider>
        <BrowserRouter>
          <div className="h-screen w-full overflow-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Routes>
              <Route path="/" element={<LandingView />} />
              <Route path="/config" element={
                <div className="h-screen w-full overflow-y-auto">
                  <ConfigPage />
                </div>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;
