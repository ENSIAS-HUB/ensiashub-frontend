'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

type EmptyVariant = 'drive' | 'feed' | 'groups' | 'eats' | 'notifications' | 'default';

const VARIANT_CONTENT: Record<EmptyVariant, { title: string; description: string }> = {
  drive:         { title: 'Le Drive est vide',        description: 'Sois le premier à contribuer ! 📚' },
  feed:          { title: 'Le feed est calme…',       description: "Passe une pause à l'Agora 🌲" },
  groups:        { title: 'Aucun groupe trouvé',      description: "L'union fait la force ! 💪" },
  eats:          { title: 'Menu indisponible',        description: 'Reviens plus tard 🍽️' },
  notifications: { title: 'Tout est calme',           description: 'Pas de nouvelles, bonnes nouvelles ! 🎉' },
  default:       { title: '',                         description: '' },
};

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: EmptyVariant;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  variant,
}: EmptyStateProps) {
  const preset = variant && variant !== 'default' ? VARIANT_CONTENT[variant] : null;
  const resolvedTitle = title ?? preset?.title ?? '';
  const resolvedDesc = description ?? preset?.description;
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Icon className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold">{resolvedTitle}</p>
        {resolvedDesc && (
          <p className="text-sm text-muted-foreground max-w-xs">{resolvedDesc}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
