"use client";

import type { KitchenOrder, KitchenOrderStatus } from "@/lib/types";
import KitchenOrderCard from "./KitchenOrderCard";

const ACTIVE_STATUSES: KitchenOrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
];
const HISTORY_STATUSES: KitchenOrderStatus[] = ["completed", "cancelled"];

const SECTION_LABELS: Record<KitchenOrderStatus, string> = {
  pending:   "En attente",
  confirmed: "Confirmées",
  preparing: "En préparation",
  ready:     "Prêtes à récupérer",
  completed: "Récupérées",
  cancelled: "Annulées",
};

interface KitchenOrdersBoardProps {
  orders: KitchenOrder[];
  onUpdateStatus: (orderId: string, status: KitchenOrderStatus) => void;
  isMutating?: boolean;
  showHistory?: boolean;
}

function Section({
  title,
  orders,
  onUpdateStatus,
  isMutating,
}: {
  title: string;
  orders: KitchenOrder[];
  onUpdateStatus: (orderId: string, status: KitchenOrderStatus) => void;
  isMutating?: boolean;
}) {
  if (orders.length === 0) return null;

  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
        {title} · {orders.length}
      </h3>
      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <KitchenOrderCard
            key={order.id}
            order={order}
            onUpdateStatus={onUpdateStatus}
            isPending={isMutating}
          />
        ))}
      </div>
    </section>
  );
}

export default function KitchenOrdersBoard({
  orders,
  onUpdateStatus,
  isMutating,
  showHistory = false,
}: KitchenOrdersBoardProps) {
  const byStatus = (statuses: KitchenOrderStatus[]) =>
    statuses.reduce<Record<string, KitchenOrder[]>>((acc, s) => {
      acc[s] = orders.filter((o) => o.status === s);
      return acc;
    }, {});

  const active  = byStatus(ACTIVE_STATUSES);
  const history = byStatus(HISTORY_STATUSES);

  const activeStatuses  = ACTIVE_STATUSES.filter((s) => active[s].length > 0);
  const historyStatuses = HISTORY_STATUSES.filter((s) => history[s].length > 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Active orders — 4 columns at most */}
      {activeStatuses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {activeStatuses.map((s) => (
            <Section
              key={s}
              title={SECTION_LABELS[s]}
              orders={active[s]}
              onUpdateStatus={onUpdateStatus}
              isMutating={isMutating}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 text-sm">
          Aucune commande active pour le moment.
        </div>
      )}

      {/* History */}
      {showHistory && historyStatuses.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-600 mb-3 border-t pt-4">
            Historique du jour
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {historyStatuses.map((s) => (
              <Section
                key={s}
                title={SECTION_LABELS[s]}
                orders={history[s]}
                onUpdateStatus={onUpdateStatus}
                isMutating={isMutating}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
