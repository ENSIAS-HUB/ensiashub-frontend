'use client';

import { motion } from 'framer-motion';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import type { IoTDevice } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DeviceStatusCardProps {
  device: IoTDevice;
}

export function DeviceStatusCard({ device }: DeviceStatusCardProps) {
  const isOpen = device.last_event?.status === 'open' || device.is_active;

  return (
    <motion.div
      className={cn(
        'rounded-xl border bg-card p-5 space-y-3',
        isOpen ? 'border-green-500/30' : 'border-border'
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOpen ? (
            <Wifi className="size-4 text-green-400" />
          ) : (
            <WifiOff className="size-4 text-muted-foreground" />
          )}
          <span className="text-sm font-semibold">{device.name}</span>
        </div>

        {/* Status badge with pulsing ring */}
        <div className="relative flex items-center justify-center">
          {isOpen && (
            <span className="absolute inline-flex size-full rounded-full bg-green-400/30 animate-ping-slow" />
          )}
          <span
            className={cn(
              'relative inline-flex size-3 rounded-full',
              isOpen ? 'bg-green-400' : 'bg-muted-foreground'
            )}
          />
        </div>
      </div>

      {/* Big status badge */}
      <div
        className={cn(
          'flex items-center justify-center rounded-lg py-3 text-sm font-bold tracking-wide',
          isOpen
            ? 'bg-green-500/15 text-green-400'
            : 'bg-slate-700/50 text-muted-foreground'
        )}
      >
        {isOpen ? '🟢 OUVERT' : '🔴 FERMÉ'}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Activity className="size-3" />
          {device.location}
        </p>
        {device.last_event && (
          <p className="text-xs text-muted-foreground">
            Mis à jour :{' '}
            {new Date(device.last_event.recorded_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </motion.div>
  );
}
