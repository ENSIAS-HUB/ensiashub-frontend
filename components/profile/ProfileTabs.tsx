"use client";

export type TabId = "about" | "projects" | "activity" | "connections";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "about", label: "À propos" },
  { id: "projects", label: "Projets" },
  { id: "activity", label: "Activité" },
  { id: "connections", label: "Connexions" },
];

interface ProfileTabsProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
  return (
    <div className="flex border-b border-white/10 bg-[#111827] rounded-xl overflow-hidden">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={[
            "flex-1 py-3 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "text-white border-b-2 border-red-600"
              : "text-white/50 hover:text-white/80",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
