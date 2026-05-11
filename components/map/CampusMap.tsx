'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import type { POI } from '@/lib/types';

// ── Centre campus ENSIAS ──────────────────────────────────────────────────────
const ENSIAS_CENTER: [number, number] = [33.9716, -6.8498];
const DEFAULT_ZOOM = 17;

// ── Custom icons ──────────────────────────────────────────────────────────────
function createCustomIcon(color: string, size: number = 32, glow: boolean = false): L.DivIcon {
  const shadow = glow
    ? `filter: drop-shadow(0 0 8px ${color});`
    : `filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));`;

  return L.divIcon({
    className: '',
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
    html: `
      <svg width="${size}" height="${size}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"
        style="${shadow}">
        <path d="M16 0C9.373 0 4 5.373 4 12c0 9 12 28 12 28S28 21 28 12C28 5.373 22.627 0 16 0z"
          fill="${color}" fill-opacity="0.95"/>
        <circle cx="16" cy="12" r="5" fill="white" fill-opacity="0.9"/>
      </svg>`,
  });
}

const POI_ICON   = createCustomIcon('#B01817');
const POI_ACTIVE = createCustomIcon('#B01817', 40, true);

const CATEGORY_BADGE: Record<string, string> = {
  salle:       'bg-blue-500/20 text-blue-400',
  bureau:      'bg-violet-500/20 text-violet-400',
  restauration:'bg-orange-500/20 text-orange-400',
  residence:   'bg-emerald-500/20 text-emerald-400',
  autre:       'bg-slate-500/20 text-slate-400',
};

// ── Recenter button ───────────────────────────────────────────────────────────
function RecenterButton() {
  const map = useMap();
  return (
    <div className="leaflet-bottom leaflet-left" style={{ marginBottom: '2rem', marginLeft: '0.75rem' }}>
      <div className="leaflet-control">
        <button
          onClick={() => map.setView(ENSIAS_CENTER, DEFAULT_ZOOM)}
          title="Recentrer sur le campus"
          style={{
            background: '#1E293B',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: '#fff',
            padding: '6px 10px',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          ⊕ Campus
        </button>
      </div>
    </div>
  );
}

// ── FlyTo helper ─────────────────────────────────────────────────────────────
interface FlyToProps { target: [number, number] | null }
function FlyTo({ target }: FlyToProps) {
  const map = useMap();
  const prev = useRef<string>('');
  useEffect(() => {
    if (!target) return;
    const key = target.join(',');
    if (key === prev.current) return;
    prev.current = key;
    map.flyTo(target, 19, { duration: 1.2 });
  }, [map, target]);
  return null;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface CampusMapProps {
  selectedPOI: POI | null;
  onSelectPOI: (poi: POI | null) => void;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CampusMap({ selectedPOI, onSelectPOI }: CampusMapProps) {
  const { data: poisData } = useQuery({
    queryKey: ['pois'],
    queryFn: () => apiClient.get<{ data: POI[] }>('/poi').then((r) => r.data.data),
    retry: 1,
  });

  const pois: POI[] = poisData ?? [];

  return (
    <MapContainer
      center={ENSIAS_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      className="z-0"
    >
      {/* Dark tile layer — CartoDB Dark Matter */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={20}
      />

      <ZoomControl position="bottomright" />
      <RecenterButton />
      <FlyTo target={selectedPOI ? [selectedPOI.latitude, selectedPOI.longitude] : null} />

      {/* POI markers */}
      {pois.map((poi) => (
        <Marker
          key={poi.id}
          position={[poi.latitude, poi.longitude]}
          icon={selectedPOI?.id === poi.id ? POI_ACTIVE : POI_ICON}
          eventHandlers={{ click: () => onSelectPOI(poi) }}
        >
          <Popup className="campus-popup">
            <div className="text-slate-900 min-w-[160px]">
              <p className="font-semibold text-sm leading-tight">{poi.name}</p>
              {poi.description && (
                <p className="text-xs text-slate-600 mt-1">{poi.description}</p>
              )}
              <span
                className={`inline-block mt-2 text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  CATEGORY_BADGE[poi.category] ?? CATEGORY_BADGE.autre
                }`}
              >
                {poi.category}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* IoT devices are shown in the sidebar panel, not as map markers (no lat/lng in API) */}
    </MapContainer>
  );
}
