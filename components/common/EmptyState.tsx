'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

type EmptyVariant = 'drive' | 'feed' | 'groups' | 'eats' | 'notifications' | 'default';

const VARIANT_CONTENT: Record<EmptyVariant, { title: string; description: string }> = {
  drive:         { title: 'Le Drive est vide',   description: 'Sois le premier à contribuer.' },
  feed:          { title: 'Le feed est calme…',  description: "Rien à afficher pour l'instant." },
  groups:        { title: 'Aucun groupe trouvé', description: 'Rejoins ou crée un groupe.' },
  eats:          { title: 'Menu indisponible',   description: 'Reviens plus tard.' },
  notifications: { title: 'Tout est calme',      description: 'Aucune notification récente.' },
  default:       { title: '',                    description: '' },
};

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
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
      className="flex flex-col items-center justify-center gap-3 py-16 text-center"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-[13px] font-medium">{resolvedTitle}</p>
        {resolvedDesc && (
          <p className="text-xs text-muted-foreground max-w-[200px]">{resolvedDesc}</p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 h-7 px-3 rounded-md text-[12px] font-medium bg-[#B01817] text-white hover:bg-[#D42B2A] transition-colors duration-150"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
