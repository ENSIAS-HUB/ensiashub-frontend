import apiClient from './client';
import type { User, ApiResponse } from '@/lib/types';

export const getAuthRedirect = (provider: 'google' | 'microsoft') =>
  `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/redirect/${provider}`;

export const getMe = () =>
  apiClient.get<ApiResponse<User>>('/me');

export const logout = () =>
  apiClient.post('/logout');
