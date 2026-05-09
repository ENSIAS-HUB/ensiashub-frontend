import apiClient from './client';
import type { MenuItem, Order, ApiResponse, PaginatedResponse } from '@/lib/types';

export const getMenuItems = () =>
  apiClient.get<ApiResponse<MenuItem[]>>('/menu-items');

export const createMenuItem = (data: Partial<MenuItem>) =>
  apiClient.post<ApiResponse<MenuItem>>('/menu-items', data);

export const getOrders = () =>
  apiClient.get<PaginatedResponse<Order>>('/orders');

export const createOrder = (lines: Array<{ menu_item_id: string; quantity: number }>) =>
  apiClient.post<ApiResponse<Order>>('/orders', { lines });
