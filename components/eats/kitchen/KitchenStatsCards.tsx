"use client";

import {
  Clock,
  CheckCircle,
  CheckCheck,
  ChefHat,
  XCircle,
  Timer,
} from "lucide-react";
import type { KitchenStats } from "@/lib/types";

interface CardConfig {
  key: keyof KitchenStats;
  label: string;
  icon: React.ElementType;
  borderLeft: string;
  textValue: string;
  textIcon: string;
}

import type React from "react";

const CARDS: CardConfig[] = [
  {
    key: "pending",
    label: "En attente",
    icon: Timer,
    borderLeft: "border-l-yellow-500",
    textValue: "text-yellow-400",
    textIcon: "text-yellow-500",
  },
  {
    key: "confirmed",
    label: "Confirmées",
    icon: CheckCircle,
    borderLeft: "border-l-blue-500",
    textValue: "text-blue-400",
    textIcon: "text-blue-500",
  },
  {
    key: "preparing",
    label: "En préparation",
    icon: ChefHat,
    borderLeft: "border-l-orange-500",
    textValue: "text-orange-400",
    textIcon: "text-orange-500",
  },
  {
    key: "ready",
    label: "Prêtes",
    icon: Clock,
    borderLeft: "border-l-green-500",
    textValue: "text-green-400",
    textIcon: "text-green-500",
  },
  {
    key: "completed_today",
    label: "Complétées",
    icon: CheckCheck,
    borderLeft: "border-l-slate-400",
    textValue: "text-slate-300",
    textIcon: "text-slate-400",
  },
  {
    key: "cancelled_today",
    label: "Annulées",
    icon: XCircle,
    borderLeft: "border-l-red-500",
    textValue: "text-red-400",
    textIcon: "text-red-500",
  },
];

interface KitchenStatsCardsProps {
  stats: KitchenStats;
}

export default function KitchenStatsCards({ stats }: KitchenStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {CARDS.map(
        ({ key, label, icon: Icon, borderLeft, textValue, textIcon }) => (
          <div
            key={key}
            className={`rounded-xl p-4 bg-[#111827] border border-white/5 border-l-4 ${borderLeft} flex flex-col gap-2`}
          >
            <Icon size={20} className={textIcon} />
            <span className={`text-3xl font-bold ${textValue}`}>
              {stats[key]}
            </span>
            <div>
              <div className="text-sm text-white/50 leading-tight">{label}</div>
              {(key === "completed_today" || key === "cancelled_today") && (
                <div className="text-xs text-white/30">aujourd&apos;hui</div>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
