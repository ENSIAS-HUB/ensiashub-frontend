'use client';

import { motion } from 'framer-motion';
import { WashingMachine } from 'lucide-react';
import type { LaundryMachine } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LaundryMachineGridProps {
  machines: LaundryMachine[];
  isLoading: boolean;
}

function getMachineStatus(machine: LaundryMachine) {
  // Heuristic: if last_updated is recent (< 5 min) and not available → en marche
  const lastUpdate = new Date(machine.last_updated);
  const minutesAgo = (Date.now() - lastUpdate.getTime()) / 60_000;

  if (!machine.is_available && minutesAgo < 60) {
    return 'running'; // EN MARCHE
  }
  if (machine.is_available) {
    return 'available'; // DISPONIBLE
  }
  return 'offline'; // HORS SERVICE
}

const STATUS_CONFIG = {
  available: {
    label: 'DISPONIBLE',
    bg: 'bg-green-500/15 border-green-500/30',
    text: 'text-green-400',
    dot: 'bg-green-400',
    pulse: true,
    spin: false,
  },
  running: {
    label: 'EN MARCHE',
    bg: 'bg-blue-500/15 border-blue-500/30',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
    pulse: false,
    spin: true,
  },
  offline: {
    label: 'HORS SERVICE',
    bg: 'bg-[#B01817]/10 border-[#B01817]/20',
    text: 'text-[#D42B2A]',
    dot: 'bg-[#B01817]',
    pulse: false,
    spin: false,
  },
};

function MachineCard({ machine }: { machine: LaundryMachine }) {
  const status = getMachineStatus(machine);
  const config = STATUS_CONFIG[status];

  return (
    <motion.div
      className={cn('rounded-xl border p-4 bg-card flex flex-col items-center gap-3', config.bg)}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="relative">
        <WashingMachine
          className={cn('size-8', config.text, config.spin && 'animate-spin-slow')}
        />
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card',
            config.dot,
            config.pulse && 'animate-ping-slow'
          )}
        />
        {config.pulse && (
          <span className={cn('absolute -top-0.5 -right-0.5 size-2.5 rounded-full', config.dot)} />
        )}
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold truncate max-w-[80px]">{machine.name}</p>
        <p className={cn('text-[10px] font-bold mt-0.5', config.text)}>{config.label}</p>
      </div>
    </motion.div>
  );
}

export function LaundryMachineGrid({ machines, isLoading }: LaundryMachineGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (machines.length === 0) {
    return (
      <div className="flex items-center justify-center h-28 rounded-xl border border-border bg-card text-sm text-muted-foreground">
        Aucune machine disponible
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {machines.map((machine) => (
        <MachineCard key={machine.id} machine={machine} />
      ))}
    </div>
  );
}
