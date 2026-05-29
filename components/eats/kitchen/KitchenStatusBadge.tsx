"use client";

import type { KitchenOrderStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  KitchenOrderStatus,
  { label: string; className: string }
> = {
  pending:   { label: "En attente",   className: "bg-yellow-100 text-yellow-800 border border-yellow-300" },
  confirmed: { label: "Confirmé",     className: "bg-blue-100   text-blue-800   border border-blue-300"   },
  preparing: { label: "En préparation", className: "bg-orange-100 text-orange-800 border border-orange-300" },
  ready:     { label: "Prête",        className: "bg-green-100  text-green-800  border border-green-300"  },
  completed: { label: "Récupérée",    className: "bg-gray-100   text-gray-600   border border-gray-300"   },
  cancelled: { label: "Annulée",      className: "bg-red-100    text-red-800    border border-red-300"    },
};

interface KitchenStatusBadgeProps {
  status: KitchenOrderStatus;
  size?: "sm" | "md";
}

export default function KitchenStatusBadge({
  status,
  size = "md",
}: KitchenStatusBadgeProps) {
  const { label, className } = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${className}`}
    >
      {label}
    </span>
  );
}
