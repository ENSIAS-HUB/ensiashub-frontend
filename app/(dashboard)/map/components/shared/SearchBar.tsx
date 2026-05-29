"use client";

import { useState, useRef, useCallback, useEffect, KeyboardEvent } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import centroid from "@turf/centroid";
import type { Feature, Polygon, MultiPolygon } from "geojson";
import campusGeoJson from "../../data/campus-geojson";
import { useMapStore } from "../../store/mapStore";
import { SEARCHABLE_ROOMS } from "../../data/indoor/admin-building";
import type { SearchSuggestion } from "../../types/map.types";
import type { MapRef } from "react-map-gl/mapbox";

// -- Helpers ------------------------------------------------------------------

/** Remove diacritics and lowercase for accent-insensitive search */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getIcon(id: string, hasIndoorMap: boolean): string {
  if (hasIndoorMap) return "🔴";
  if (id.includes("amphi") || id === "grand-amphi") return "🎭";
  if (id.includes("terrain")) return "⚽";
  if (id.includes("parking")) return "🅿️";
  if (id.includes("salle")) return "📚";
  if (id.includes("batiment")) return "🏛️";
  if (id.includes("securite")) return "🔒";
  if (id.includes("foyer") || id.includes("buvette") || id.includes("agora"))
    return "☕";
  return "📍";
}

function getCategory(id: string, hasIndoorMap: boolean): string {
  if (hasIndoorMap) return "Plan intérieur disponible";
  if (id.includes("terrain")) return "Terrain";
  if (id.includes("parking")) return "Parking";
  if (id.includes("amphi") || id === "grand-amphi") return "Amphithéâtre";
  if (id.includes("batiment")) return "Bâtiment";
  if (id.includes("salle")) return "Salle";
  return "Lieu";
}

function getCentroid(feature: Feature): [number, number] | null {
  try {
    const c = centroid(feature as Feature<Polygon | MultiPolygon>);
    return c.geometry.coordinates as [number, number];
  } catch {
    return null;
  }
}

// -- Suggestion list built from real GeoJSON (module-level, computed once) ----

interface GeoSuggestion extends SearchSuggestion {
  icon: string;
  category: string;
  center: [number, number] | null;
  /** Normalised label for fast accent-insensitive search */
  labelNorm: string;
  sublabelNorm: string;
  idNorm: string;
  hasIndoorMap: boolean;
}

function buildGeoSuggestions(): GeoSuggestion[] {
  const results: GeoSuggestion[] = [];

  for (const f of campusGeoJson.features) {
    if (f.properties?.type === "campus") continue;
    const id = (f.properties?.id as string) ?? "";
    const name = (f.properties?.name as string) ?? id;
    const hasIndoorMap = f.properties?.hasIndoorMap === true;
    const cat = getCategory(id, hasIndoorMap);

    results.push({
      kind: "building",
      label: name,
      sublabel: cat,
      buildingId: id,
      icon: getIcon(id, hasIndoorMap),
      category: cat,
      center: getCentroid(f),
      labelNorm: normalize(name),
      sublabelNorm: normalize(cat),
      idNorm: normalize(id),
      hasIndoorMap,
    });
  }

  for (const r of SEARCHABLE_ROOMS) {
    const floorLabel = r.floor === 0 ? "RDC" : "1er étage";
    const sub = `Administration — ${floorLabel}`;
    results.push({
      kind: "room",
      label: r.name,
      sublabel: sub,
      buildingId: "administration",
      roomId: r.id,
      icon: "🚪",
      category: "Salle intérieure",
      center: null,
      labelNorm: normalize(r.name),
      sublabelNorm: normalize(sub),
      idNorm: normalize(r.id),
      hasIndoorMap: false,
    });
  }

  // Sort: hasIndoorMap → alphabetical within group
  return results.sort((a, b) => {
    if (a.hasIndoorMap !== b.hasIndoorMap) return a.hasIndoorMap ? -1 : 1;
    return a.labelNorm.localeCompare(b.labelNorm);
  });
}

const ALL_GEO_SUGGESTIONS = buildGeoSuggestions();

// -- Component -----------------------------------------------------------------

interface SearchBarProps {
  mapRef?: React.RefObject<MapRef | null>;
  onSuggestionSelect?: (suggestion: GeoSuggestion) => void;
}

export function SearchBar({ mapRef, onSuggestionSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFlyingTo, setIsFlyingTo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setDestination, setSelectedBuilding } = useMapStore();

  const normQuery = normalize(query.trim());

  const filtered: GeoSuggestion[] =
    normQuery.length >= 1
      ? ALL_GEO_SUGGESTIONS.filter(
          (s) =>
            s.labelNorm.includes(normQuery) ||
            s.sublabelNorm.includes(normQuery) ||
            s.idNorm.includes(normQuery),
        ).slice(0, 7)
      : [];

  const showDropdown = open && query.trim().length >= 1;

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const select = useCallback(
    (s: GeoSuggestion) => {
      setQuery(s.label);
      setOpen(false);
      setActiveIndex(-1);

      if (s.kind === "room" && s.roomId) {
        setDestination({
          label: s.label,
          roomId: s.roomId,
          buildingId: s.buildingId,
        });
      }

      // Open building popup automatically for outdoor buildings
      if (s.kind === "building" && s.center) {
        setSelectedBuilding({
          id: s.buildingId,
          name: s.label,
          hasIndoorMap: s.hasIndoorMap,
          coordinates: s.center,
        });
      }

      if (s.center && mapRef?.current) {
        setIsFlyingTo(true);
        const map = mapRef.current.getMap();
        map.flyTo({
          center: s.center,
          zoom: 19,
          pitch: 30,
          duration: 1200,
          essential: true,
        });
        setTimeout(() => setIsFlyingTo(false), 1400);
      }

      onSuggestionSelect?.(s);
    },
    [setDestination, mapRef, onSuggestionSelect],
  );

  const clearQuery = useCallback(() => {
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        clearQuery();
        return;
      }
      if (!showDropdown) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        select(filtered[activeIndex]);
      }
    },
    [showDropdown, filtered, activeIndex, select, clearQuery],
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      {/* Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 size-3.5 text-white/30 pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher une salle, un bâtiment…"
          className="w-full h-8 pl-8 pr-8 rounded-xl dark:bg-white/5 bg-white border dark:border-white/10 border-gray-200 hover:border-gray-300
                     text-[12px] dark:text-white text-gray-700 dark:placeholder:text-white/25 placeholder:text-gray-400
                     focus:outline-none dark:focus:border-[#B01817]/50 focus:border-[#B01817]/50
                     transition-colors"
        />
        {/* Right-side status icon */}
        <div className="absolute right-2.5 flex items-center pointer-events-none">
          {isFlyingTo ? (
            <Loader2 className="size-3 text-white/40 animate-spin" />
          ) : (
            query && (
              <button
                onMouseDown={clearQuery}
                className="pointer-events-auto p-0.5 text-white/30 hover:text-white/70 transition-colors"
                aria-label="Effacer la recherche"
              >
                <X className="size-3" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1 left-0 right-0 z-30 rounded-xl
                       border border-slate-700 bg-slate-800 overflow-hidden shadow-xl"
            role="listbox"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 flex items-center gap-2 text-white/40">
                <Search className="size-3.5 shrink-0" />
                <span className="text-[11px]">
                  Aucun résultat pour{" "}
                  <span className="text-white/60">&ldquo;{query}&rdquo;</span>
                </span>
              </li>
            ) : (
              filtered.map((s, i) => (
                <li
                  key={`${s.buildingId}-${s.label}-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                >
                  <button
                    onMouseDown={() => select(s)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left
                      transition-colors
                      ${i === activeIndex ? "bg-slate-700" : "hover:bg-slate-700/60"}`}
                  >
                    <span className="text-base leading-none shrink-0">
                      {s.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-white truncate">
                        {s.label}
                      </p>
                      <p
                        className={`text-[10px] truncate ${s.hasIndoorMap ? "text-[#B01817]" : "text-white/40"}`}
                      >
                        {s.sublabel}
                      </p>
                    </div>
                    {s.hasIndoorMap && (
                      <span className="text-[8px] bg-[#B01817]/20 text-[#f87171] px-1.5 py-0.5 rounded-full shrink-0">
                        🗺️
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
