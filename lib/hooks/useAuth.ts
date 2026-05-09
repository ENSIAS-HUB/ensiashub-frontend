'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { getMe, logout as apiLogout } from '@/lib/api/auth';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token && !user) {
      getMe()
        .then((res) => setAuth(res.data.data, token))
        .catch(() => logout());
    }
  }, [token, user, setAuth, logout]);

  const signOut = async () => {
    try {
      await apiLogout();
    } finally {
      logout();
      router.push('/login');
    }
  };

  return { user, isAuthenticated, signOut };
}
