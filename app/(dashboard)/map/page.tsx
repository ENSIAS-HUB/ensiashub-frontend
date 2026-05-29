import { Suspense } from "react";
import MapPageClient from "./components/MapPageClient";

// Loading fallback shown while the client bundle hydrates
function MapFallback() {
  return (
    <div className="flex h-[calc(100vh-3rem)] w-full items-center justify-center bg-[#0b0d0f] rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <div className="size-9 rounded-full border-2 border-[#B01817] border-t-transparent animate-spin" />
        <p className="text-xs text-white/40 font-mono">
          Chargement de la carte…
        </p>
      </div>
    </div>
  );
}

export default function SmartCampusMapPage() {
  return (
    <Suspense fallback={<MapFallback />}>
      <MapPageClient />
    </Suspense>
  );
}

