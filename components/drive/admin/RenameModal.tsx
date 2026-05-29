"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { toast } from "sonner";

interface RenameModalProps {
  isOpen: boolean;
  currentName: string;
  endpoint: string;
  onClose: () => void;
  onSuccess: () => void;
  /** Nom du champ envoyé au backend (default: "nom" pour modules/éléments, "titre" pour documents) */
  fieldName?: "nom" | "titre";
}

export function RenameModal({
  isOpen,
  currentName,
  endpoint,
  onClose,
  onSuccess,
  fieldName = "nom",
}: RenameModalProps) {
  const [nom, setNom] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const handleSave = async () => {
    if (!nom.trim() || nom === currentName) return;
    setLoading(true);
    try {
      await apiClient.put(endpoint, { [fieldName]: nom });
      qc.invalidateQueries({ queryKey: ["drive-arborescence"] });
      qc.invalidateQueries({ queryKey: ["drive-mes-arborescence"] });
      toast.success("Renommé avec succès");
      onSuccess();
    } catch {
      toast.error("Erreur lors du renommage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111827] border border-white/10 rounded-2xl max-w-sm p-6">
        <h3 className="text-white font-semibold mb-4">Renommer</h3>
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          autoFocus
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !nom.trim() || nom === currentName}
            className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? "..." : "Sauvegarder"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
