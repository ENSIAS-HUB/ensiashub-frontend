"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Radio,
  RefreshCw,
  Store,
  WashingMachine,
  WifiOff,
  AlertCircle,
} from "lucide-react";
import { DeviceStatusCard } from "@/components/iot/DeviceStatusCard";
import { LaundryMachineGrid } from "@/components/iot/LaundryMachineGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useIoT } from "@/lib/hooks/useIoT";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const REFETCH_SECONDS = 10;

export default function SmartCampusPage() {
  const {
    devices,
    laundryMachines,
    hanoutDevice,
    isLoading,
    isError,
    refetch,
    lastUpdated,
    refetchInterval,
  } = useIoT();

  const nonHanoutDevices = devices.filter((d) => d.id !== hanoutDevice?.id);

  // Countdown to next auto-refresh
  const [countdown, setCountdown] = useState(REFETCH_SECONDS);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountdown(REFETCH_SECONDS);
  }, [lastUpdated]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => (c <= 1 ? REFETCH_SECONDS : c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [refetchInterval]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Radio className="size-4 text-[#B01817]" />
          Smart Campus IoT
        </h2>

        <div className="flex items-center gap-3">
          {/* Hors ligne indicator */}
          {isError && (
            <span className="flex items-center gap-1.5 text-xs text-destructive font-medium">
              <WifiOff className="size-3.5" />
              Hors ligne
            </span>
          )}

          {/* LIVE badge */}
          {!isError && !isLoading && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-green-400" />
              </span>
              LIVE
            </span>
          )}

          {/* Countdown */}
          <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
            <RefreshCw className={cn("size-3", isLoading && "animate-spin")} />
            {isLoading
              ? "Actualisation…"
              : `Prochain rafraîchissement dans ${countdown}s`}
          </span>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center">
          <AlertCircle className="size-10 text-destructive" />
          <div>
            <p className="font-semibold">Impossible de joindre les capteurs</p>
            <p className="text-sm text-muted-foreground mt-1">
              Vérifiez que le backend IoT est accessible.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="gap-2"
          >
            <RefreshCw className="size-4" />
            Réessayer
          </Button>
        </div>
      )}

      {/* Épicerie / Hanout section */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
          <Store className="size-4" />
          Épicerie Résidence (Hanout)
        </h3>

        {isLoading ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : hanoutDevice ? (
          <motion.div
            className="rounded-xl border border-border bg-card p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Big status */}
              <div className="relative flex items-center justify-center size-24 rounded-full">
                {hanoutDevice.is_active && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-green-400/20 animate-ping-slow" />
                    <span
                      className="absolute inset-2 rounded-full bg-green-400/10 animate-ping-slow"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </>
                )}
                <div
                  className={`relative flex size-20 items-center justify-center rounded-full text-2xl font-bold ${
                    hanoutDevice.is_active
                      ? "bg-green-500/20 border-2 border-green-500/40"
                      : "bg-slate-700/50 border-2 border-slate-600"
                  }`}
                >
                  {hanoutDevice.is_active ? "🟢" : "🔴"}
                </div>
              </div>

              <div className="text-center sm:text-left">
                <p className="text-xl font-bold">
                  {hanoutDevice.is_active ? "OUVERT" : "FERMÉ"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {hanoutDevice.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {hanoutDevice.location}
                </p>
                {hanoutDevice.last_event && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Dernière mise à jour :{" "}
                    {new Date(
                      hanoutDevice.last_event.recorded_at,
                    ).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
            Capteur Hanout non disponible
          </div>
        )}
      </section>

      <Separator />

      {/* Buanderie section */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
          <WashingMachine className="size-4" />
          Buanderie — Machines à laver
        </h3>
        <LaundryMachineGrid machines={laundryMachines} isLoading={isLoading} />
      </section>

      {/* Other IoT devices */}
      {!isLoading && nonHanoutDevices.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <Radio className="size-4" />
              Autres capteurs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nonHanoutDevices.map((device) => (
                <DeviceStatusCard key={device.id} device={device} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Last refresh timestamp */}
      {!isError && (
        <p className="text-xs text-muted-foreground text-center pb-4">
          Données en temps réel · Actualisé à{" "}
          {lastUpdated.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
