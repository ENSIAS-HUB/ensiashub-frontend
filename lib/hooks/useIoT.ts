'use client';

import { useQuery } from '@tanstack/react-query';
import { getIoTDevices, getLaundryMachines } from '@/lib/api/iot';

export function useIoT() {
  const devices = useQuery({
    queryKey: ['iot-devices'],
    queryFn: () => getIoTDevices(),
    refetchInterval: 10_000,
  });

  const laundry = useQuery({
    queryKey: ['laundry-machines'],
    queryFn: () => getLaundryMachines(),
    refetchInterval: 10_000,
  });

  const contactDevices = (devices.data?.data.data ?? []).filter((d) => d.type === 'contact');
  const hanoutDevice = contactDevices.find((d) =>
    d.name.toLowerCase().includes('epicerie') || d.name.toLowerCase().includes('hanout')
  );

  return {
    devices: devices.data?.data.data ?? [],
    laundryMachines: laundry.data?.data.data ?? [],
    hanoutDevice,
    isLoading: devices.isLoading || laundry.isLoading,
    lastUpdated: new Date(),
  };
}
