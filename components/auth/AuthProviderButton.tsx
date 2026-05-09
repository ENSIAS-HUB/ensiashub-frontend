'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface AuthProviderButtonProps {
  provider: 'google' | 'microsoft' | 'email';
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

const variants = {
  primary: 'bg-[#B01817] hover:bg-[#D42B2A] text-white border-transparent shadow-[0_0_0_0_rgba(176,24,23,0)] hover:shadow-[0_0_16px_rgba(176,24,23,0.4)]',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700',
  outline: 'bg-transparent hover:bg-slate-800/50 text-foreground border-border',
};

export function AuthProviderButton({
  label,
  icon: Icon,
  onClick,
  variant = 'secondary',
  disabled = false,
}: AuthProviderButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.96 }}
    >
      <Button
        type="button"
        className={`w-full h-12 gap-3 text-sm font-medium border transition-all duration-200 ${variants[variant]}`}
        onClick={onClick}
        disabled={disabled}
      >
        <Icon className="size-5 shrink-0" />
        {label}
      </Button>
    </motion.div>
  );
}
