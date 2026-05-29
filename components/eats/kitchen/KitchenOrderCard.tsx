"use client";

import { useState } from "react";
import { Clock, User, ChevronDown, ChevronUp } from "lucide-react";
import type { KitchenOrder, KitchenOrderStatus } from "@/lib/types";
import KitchenStatusBadge from "./KitchenStatusBadge";

const NEXT_ACTIONS: Partial<
  Record<KitchenOrderStatus, { status: KitchenOrderStatus; label: string; className: string }[]>
> = {
  pending: [
    { status: "confirmed", label: "Confirmer",    className: "bg-blue-600 hover:bg-blue-700 text-white" },
    { status: "cancelled", label: "Annuler",       className: "bg-red-100 hover:bg-red-200 text-red-700" },
  ],
  confirmed: [
    { status: "preparing", label: "Commencer",    className: "bg-orange-500 hover:bg-orange-600 text-white" },
    { status: "cancelled", label: "Annuler",       className: "bg-red-100 hover:bg-red-200 text-red-700" },
  ],
  preparing: [
    { status: "ready",     label: "Marquer prête", className: "bg-green-600 hover:bg-green-700 text-white" },
    { status: "cancelled", label: "Annuler",        className: "bg-red-100 hover:bg-red-200 text-red-700" },
  ],
  ready: [
    { status: "completed", label: "Récupérée",    className: "bg-gray-700 hover:bg-gray-800 text-white" },
  ],
};

function elapsedText(createdAt: string): { text: string; isLate: boolean } {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diffMs / 60_000);
  const isLate = mins >= 15;
  if (mins < 1) return { text: "< 1 min", isLate };
  if (mins < 60) return { text: `${mins} min`, isLate };
  return { text: `${Math.floor(mins / 60)}h ${mins % 60}min`, isLate };
}

interface KitchenOrderCardProps {
  order: KitchenOrder;
  onUpdateStatus: (orderId: string, status: KitchenOrderStatus) => void;
  isPending?: boolean;
}

export default function KitchenOrderCard({
  order,
  onUpdateStatus,
  isPending: isMutating = false,
}: KitchenOrderCardProps) {
  const [expanded, setExpanded] = useState(true);
  const elapsed = elapsedText(order.created_at);
  const actions = NEXT_ACTIONS[order.status] ?? [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-400 font-mono">
            #{order.id.slice(-6).toUpperCase()}
          </span>
          <span className="font-semibold text-gray-800 text-sm">
            {order.customer?.name ?? "Client inconnu"}
          </span>
          {(order.customer?.filiere || order.customer?.annee) && (
            <span className="text-xs text-gray-500">
              {[order.customer.filiere, order.customer.annee]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <KitchenStatusBadge status={order.status} size="sm" />
          <span
            className={`text-xs font-medium flex items-center gap-1 ${
              elapsed.isLate ? "text-red-600" : "text-gray-500"
            }`}
          >
            <Clock size={12} />
            {elapsed.text}
          </span>
        </div>
      </div>

      {/* Items toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 transition"
      >
        <span>{order.items.length} article(s)</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <ul className="px-4 pb-2 divide-y divide-gray-50 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="py-1.5 flex justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-gray-800">
                  {item.quantity}× {item.name}
                </span>
                {item.special_instructions && (
                  <span className="text-xs text-amber-700 italic">
                    ↳ {item.special_instructions}
                  </span>
                )}
              </div>
              <span className="text-gray-500 shrink-0">
                {(item.unit_price * item.quantity).toFixed(2)} DH
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="mx-4 mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          <strong>Note :</strong> {order.notes}
        </div>
      )}

      {/* Total */}
      <div className="px-4 py-2 border-t border-gray-100 flex justify-between text-sm font-semibold text-gray-800">
        <span>Total</span>
        <span>{order.total_price.toFixed(2)} DH</span>
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="px-4 py-3 flex gap-2 flex-wrap border-t border-gray-100">
          {actions.map((action) => (
            <button
              key={action.status}
              disabled={isMutating}
              onClick={() => onUpdateStatus(order.id, action.status)}
              className={`flex-1 min-w-[80px] px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 ${action.className}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
