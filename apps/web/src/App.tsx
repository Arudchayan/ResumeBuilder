import { useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { GalleryPage } from "./pages/GalleryPage";
import { EditorPage } from "./pages/EditorPage";
import { ProductModals } from "./components/ProductModals";
import { useAppStore } from "./lib/store";

export function App() {
  const ready = useAppStore((s) => s.ready);
  const screen = useAppStore((s) => s.screen);
  const bootstrap = useAppStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center text-slate-600">
        Loading your workspace…
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <a href="#main" className="skip-to-content">
        Skip to content
      </a>
      {screen === "gallery" ? <GalleryPage /> : <EditorPage />}
      <ProductModals />
    </ErrorBoundary>
  );
}
