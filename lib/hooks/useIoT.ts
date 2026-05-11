'use client';

import { useQuery } from '@tanstack/react-query';
import { getIoTDevices, getLaundryMachines } from '@/lib/api/iot';

const REFETCH_INTERVAL = 10_000;

export function useIoT() {
  const devices = useQuery({
    queryKey: ['iot-devices'],
    queryFn: () => getIoTDevices(),
    refetchInterval: REFETCH_INTERVAL,
  });

  const laundry = useQuery({
    queryKey: ['laundry-machines'],
    queryFn: () => getLaundryMachines(),
    refetchInterval: REFETCH_INTERVAL,
  });

  const contactDevices = (devices.data?.data.data ?? []).filter((d) => d.type === 'contact');
  const hanoutDevice = contactDevices.find((d) =>
    d.name.toLowerCase().includes('epicerie') || d.name.toLowerCase().includes('hanout')
  );

  // Use React Query's own timestamp for when data was last successfully fetched
  const dataUpdatedAt = Math.max(
    devices.dataUpdatedAt ?? 0,
    laundry.dataUpdatedAt ?? 0
  );

  return {
    devices: devices.data?.data.data ?? [],
    laundryMachines: laundry.data?.data.data ?? [],
    hanoutDevice,
    isLoading: devices.isLoading || laundry.isLoading,
    isError: devices.isError || laundry.isError,
    refetch: () => {
      devices.refetch();
      laundry.refetch();
    },
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : new Date(),
    refetchInterval: REFETCH_INTERVAL,
  };
}
