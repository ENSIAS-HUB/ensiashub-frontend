'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { getMe, logout as apiLogout } from '@/lib/api/auth';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cold-start: read token from localStorage (may differ from Zustand hydration timing)
    const storedToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('sanctum_token')
        : null;

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    // Token present but user not yet in store → restore session
    if (!user) {
      getMe()
        .then((res) => {
          setAuth(res.data.data, storedToken);
        })
        .catch(() => {
          logout();
          router.push('/login');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    try {
      await apiLogout();
    } finally {
      logout();
      router.push('/login');
    }
  };

  return { user, token, isAuthenticated, isLoading, signOut };
}
