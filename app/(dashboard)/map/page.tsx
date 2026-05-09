'use client';

import { motion } from 'framer-motion';
import { Map, MapPin } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

export default function MapPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <h2 className="text-base font-semibold flex items-center gap-2">
        <Map className="size-4 text-[#B01817]" />
        Carte du Campus
      </h2>

      <motion.div
        className="rounded-xl border border-border bg-card overflow-hidden h-[70vh] flex items-center justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <EmptyState
          icon={MapPin}
          title="Carte interactive"
          description="L'intégration de la carte interactive du campus ENSIAS est en cours de développement."
        />
      </motion.div>
    </div>
  );
}
