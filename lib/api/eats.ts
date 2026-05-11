import apiClient from './client';
import type { MenuItem, Order, ApiResponse, PaginatedResponse } from '@/lib/types';

export const getMenuItems = () =>
  apiClient.get<ApiResponse<MenuItem[]>>('/menu-items');

export const createMenuItem = (data: Partial<MenuItem>) =>
  apiClient.post<ApiResponse<MenuItem>>('/menu-items', data);

export const getOrders = () =>
  apiClient.get<PaginatedResponse<Order>>('/orders');

export const getMyOrders = () =>
  apiClient.get<ApiResponse<Order[]>>('/orders', { params: { my: true } });

export const createOrder = (lines: Array<{ menu_item_id: string; quantity: number }>) =>
  apiClient.post<ApiResponse<Order>>('/orders', { lines });

export const cancelOrder = (id: string) =>
  apiClient.delete<ApiResponse<void>>(`/orders/${id}`);
