'use client';

import { useAuthStore } from '@/lib/store/authStore';
import type { RoleType } from '@/lib/types';

interface RoleGuardProps {
  allowedRoles: RoleType[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renders `children` only when the authenticated user's role is in `allowedRoles`.
 * Falls back to `fallback` (default: null) otherwise.
 * Note: this is a UI-only guard. Actual access control is enforced server-side.
 */
export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const role = useAuthStore((s) => s.user?.role);
  if (!role || !allowedRoles.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
