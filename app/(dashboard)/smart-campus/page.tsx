'use client';

import { motion } from 'framer-motion';
import { Radio, RefreshCw, Store, WashingMachine } from 'lucide-react';
import { DeviceStatusCard } from '@/components/iot/DeviceStatusCard';
import { LaundryMachineGrid } from '@/components/iot/LaundryMachineGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { useIoT } from '@/lib/hooks/useIoT';
import { Separator } from '@/components/ui/separator';

export default function SmartCampusPage() {
  const { devices, laundryMachines, hanoutDevice, isLoading, lastUpdated } = useIoT();

  const nonHanoutDevices = devices.filter(
    (d) => d.id !== hanoutDevice?.id
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Radio className="size-4 text-[#B01817]" />
          Smart Campus IoT
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="size-3 animate-spin" style={{ animationDuration: '3s' }} />
          Mise à jour auto toutes les 10s
        </div>
      </div>

      {/* Épicerie / Hanout section */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
          <Store className="size-4" />
          Épicerie Résidence (Hanout)
        </h3>

        {isLoading ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : hanoutDevice ? (
          <motion.div
            className="rounded-xl border border-border bg-card p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Big status */}
              <div className="relative flex items-center justify-center size-24 rounded-full">
                {hanoutDevice.is_active && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-green-400/20 animate-ping-slow" />
                    <span className="absolute inset-2 rounded-full bg-green-400/10 animate-ping-slow" style={{ animationDelay: '0.3s' }} />
                  </>
                )}
                <div className={`relative flex size-20 items-center justify-center rounded-full text-2xl font-bold ${
                  hanoutDevice.is_active ? 'bg-green-500/20 border-2 border-green-500/40' : 'bg-slate-700/50 border-2 border-slate-600'
                }`}>
                  {hanoutDevice.is_active ? '🟢' : '🔴'}
                </div>
              </div>

              <div className="text-center sm:text-left">
                <p className="text-xl font-bold">
                  {hanoutDevice.is_active ? 'OUVERT' : 'FERMÉ'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{hanoutDevice.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{hanoutDevice.location}</p>
                {hanoutDevice.last_event && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Dernière mise à jour :{' '}
                    {new Date(hanoutDevice.last_event.recorded_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
            Capteur Hanout non disponible
          </div>
        )}
      </section>

      <Separator />

      {/* Buanderie section */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
          <WashingMachine className="size-4" />
          Buanderie — Machines à laver
        </h3>
        <LaundryMachineGrid machines={laundryMachines} isLoading={isLoading} />
      </section>

      {/* Other IoT devices */}
      {!isLoading && nonHanoutDevices.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <Radio className="size-4" />
              Autres capteurs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nonHanoutDevices.map((device) => (
                <DeviceStatusCard key={device.id} device={device} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Last refresh info */}
      <p className="text-xs text-muted-foreground text-center pb-4">
        Données en temps réel · Actualisé à{' '}
        {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
    </div>
  );
}
