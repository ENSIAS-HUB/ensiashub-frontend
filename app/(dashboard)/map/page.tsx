'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Map, Search, MapPin, Radio, Wifi, WifiOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getIoTDevices, getLaundryMachines } from '@/lib/api/iot';
import apiClient from '@/lib/api/client';
import type { POI } from '@/lib/types';
import { cn } from '@/lib/utils';

// Leaflet must be loaded client-side only
const CampusMap = dynamic(() => import('@/components/map/CampusMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="size-10 rounded-full border-2 border-[#B01817] border-t-transparent animate-spin" />
        <p className="text-xs text-muted-foreground">Chargement de la carte…</p>
      </div>
    </div>
  ),
});

const CATEGORIES = ['salle', 'bureau', 'restauration', 'residence', 'autre'] as const;
type Category = typeof CATEGORIES[number];

const CAT_LABEL: Record<Category, string> = {
  salle:        'Salles',
  bureau:       'Bureaux',
  restauration: 'Restauration',
  residence:    'Résidences',
  autre:        'Autre',
};

const CAT_COLOR: Record<Category, string> = {
  salle:        'bg-blue-500/20 text-blue-400 border-blue-500/30',
  bureau:       'bg-violet-500/20 text-violet-400 border-violet-500/30',
  restauration: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  residence:    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  autre:        'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export default function MapPage() {
  const [search, setSearch]           = useState('');
  const [activeCategory, setActive]   = useState<Category | 'all'>('all');
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  const { data: poisData, isLoading: poisLoading } = useQuery({
    queryKey: ['pois'],
    queryFn: () => apiClient.get<{ data: POI[] }>('/poi').then((r) => r.data.data),
    retry: 1,
  });

  const { data: devicesData } = useQuery({
    queryKey: ['iot-devices'],
    queryFn: () => getIoTDevices(),
    refetchInterval: 15_000,
  });

  const { data: laundryData } = useQuery({
    queryKey: ['laundry'],
    queryFn: () => getLaundryMachines(),
    refetchInterval: 15_000,
  });

  const pois = poisData ?? [];

  const filtered = useMemo(() => {
    return pois.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !search || p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [pois, activeCategory, search]);

  // devicesData may be an AxiosResponse (cached from admin page using same queryKey)
  // or a raw array — handle both shapes defensively
  const devicesRaw: any = devicesData;
  const devicesArr: any[] = Array.isArray(devicesRaw)
    ? devicesRaw
    : Array.isArray(devicesRaw?.data)
    ? devicesRaw.data
    : [];

  const laundryRaw: any = laundryData;
  const laundryArr: any[] = Array.isArray(laundryRaw)
    ? laundryRaw
    : Array.isArray(laundryRaw?.data)
    ? laundryRaw.data
    : [];

  const activeDevices     = devicesArr.filter((d: any) => d.statutActuel ?? d.is_active).length;
  const availableMachines = laundryArr.filter((m: any) => m.status === 'disponible' || m.is_available).length;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── Left panel ─────────────────────────────────────────────────── */}
      <motion.aside
        className="flex w-72 shrink-0 flex-col border-r border-border bg-card overflow-hidden"
        initial={{ x: -288, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 }}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-border space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Map className="size-4 text-[#B01817]" />
            Carte du Campus
          </h2>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un lieu…"
              className="pl-7 h-8 text-xs"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActive('all')}
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full border transition-colors',
                activeCategory === 'all'
                  ? 'bg-[#B01817]/20 text-[#B01817] border-[#B01817]/40'
                  : 'border-border text-muted-foreground hover:border-foreground/20'
              )}
            >
              Tous
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full border transition-colors',
                  activeCategory === cat
                    ? `${CAT_COLOR[cat]} border-opacity-100`
                    : 'border-border text-muted-foreground hover:border-foreground/20'
                )}
              >
                {CAT_LABEL[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* POI list */}
        <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {poisLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-2">
                <Skeleton className="size-3 rounded-full shrink-0" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Aucun lieu trouvé.</p>
          ) : (
            filtered.map((poi) => (
              <button
                key={poi.id}
                onClick={() => setSelectedPOI(selectedPOI?.id === poi.id ? null : poi)}
                className={cn(
                  'w-full flex items-start gap-2 rounded-md px-2 py-2 text-left transition-colors',
                  selectedPOI?.id === poi.id
                    ? 'bg-[#B01817]/15 text-[#B01817]'
                    : 'hover:bg-muted text-foreground'
                )}
              >
                <MapPin className="size-3 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{poi.name}</p>
                  {poi.description && (
                    <p className="text-[10px] text-muted-foreground truncate">{poi.description}</p>
                  )}
                  <Badge
                    variant="outline"
                    className={cn('mt-0.5 text-[9px] h-3.5 px-1 border', CAT_COLOR[poi.category as Category] ?? CAT_COLOR.autre)}
                  >
                    {CAT_LABEL[poi.category as Category] ?? poi.category}
                  </Badge>
                </div>
              </button>
            ))
          )}
        </div>

        {/* IoT mini-status strip */}
        <div className="border-t border-border px-4 py-3 space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="size-3" />
            Appareils IoT
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-muted/50 p-2 text-center">
              <div className="flex items-center justify-center gap-1">
                <span className={cn('size-1.5 rounded-full', activeDevices > 0 ? 'bg-green-400 animate-pulse' : 'bg-slate-500')} />
                <p className="text-xs font-bold">{activeDevices}/{devicesArr.length}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">Actifs</p>
            </div>
            <div className="rounded-md bg-muted/50 p-2 text-center">
              <div className="flex items-center justify-center gap-1">
                {availableMachines > 0
                  ? <Wifi className="size-3 text-green-400" />
                  : <WifiOff className="size-3 text-slate-500" />}
                <p className="text-xs font-bold">{availableMachines}/{laundryArr.length}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">Machines libres</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <motion.div
        className="flex-1 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <CampusMap selectedPOI={selectedPOI} onSelectPOI={setSelectedPOI} />
      </motion.div>
    </div>
  );
}

