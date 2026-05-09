import apiClient from './client';
import type { IoTDevice, LaundryMachine, DeviceEvent, ApiResponse } from '@/lib/types';

export const getIoTDevices = () =>
  apiClient.get<ApiResponse<IoTDevice[]>>('/iot-devices');

export const getLaundryMachines = () =>
  apiClient.get<ApiResponse<LaundryMachine[]>>('/laundry-machine');

export const getDeviceEvents = (deviceId?: string) =>
  apiClient.get<ApiResponse<DeviceEvent[]>>('/device-events', {
    params: deviceId ? { device_id: deviceId } : undefined,
  });
