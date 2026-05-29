"use client";

import { useState } from "react";
import { RefreshCw, ChefHat } from "lucide-react";
import {
  useKitchenOrders,
  useKitchenStats,
  useUpdateKitchenOrderStatus,
} from "@/lib/hooks/useKitchen";
import type { KitchenOrderFilters, KitchenOrderStatus } from "@/lib/types";
import KitchenStatsCards from "./KitchenStatsCards";
import KitchenOrdersBoard from "./KitchenOrdersBoard";

const DEFAULT_STATS = {
  pending: 0,
  confirmed: 0,
  preparing: 0,
  ready: 0,
  completed_today: 0,
  cancelled_today: 0,
};

export default function KitchenDashboard() {
  const [filters, setFilters] = useState<KitchenOrderFilters>({});
  const [showHistory, setShowHistory] = useState(false);

  const {
    data: orders = [],
    isLoading: ordersLoading,
    refetch: refetchOrders,
    isFetching,
  } = useKitchenOrders(filters);

  const { data: stats = DEFAULT_STATS, refetch: refetchStats } =
    useKitchenStats();

  const { mutate: updateStatus, isPending: isMutating } =
    useUpdateKitchenOrderStatus();

  const handleUpdateStatus = (orderId: string, status: KitchenOrderStatus) => {
    updateStatus({ orderId, status });
  };

  const handleRefresh = () => {
    refetchOrders();
    refetchStats();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-xl">
            <ChefHat size={24} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl">Interface Cuisine</h1>
            <p className="text-white/50 text-sm">ENSIAS Eats — Gestion des commandes</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Rechercher…"
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                search: e.target.value || undefined,
              }))
            }
          />

          {/* Date filter */}
          <input
            type="date"
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                date: e.target.value || undefined,
              }))
            }
          />

          {/* History toggle */}
          <button
            onClick={() => setShowHistory((v) => !v)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition ${
              showHistory
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Historique
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition disabled:opacity-50"
            title="Rafraîchir"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <KitchenStatsCards stats={stats} />

      {/* Board */}
      {ordersLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm animate-pulse">
          Chargement des commandes…
        </div>
      ) : (
        <KitchenOrdersBoard
          orders={orders}
          onUpdateStatus={handleUpdateStatus}
          isMutating={isMutating}
          showHistory={showHistory}
        />
      )}
    </div>
  );
}
