"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmProps {
  isOpen: boolean;
  name: string;
  docsCount: number;
  endpoint: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteConfirm({
  isOpen,
  name,
  docsCount,
  endpoint,
  onClose,
  onSuccess,
}: DeleteConfirmProps) {
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await apiClient.delete(endpoint, { params: { force: true } });
      qc.invalidateQueries({ queryKey: ["drive-arborescence"] });
      qc.invalidateQueries({ queryKey: ["drive-mes-arborescence"] });
      toast.success(`"${name}" supprimé`);
      onSuccess();
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111827] border border-white/10 rounded-2xl max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={20} className="text-red-400 shrink-0" />
          <h3 className="text-white font-semibold">
            Supprimer &quot;{name}&quot; ?
          </h3>
        </div>

        {docsCount > 0 && (
          <p className="text-white/50 text-sm mb-4">
            ⚠️ Ce dossier contient{" "}
            <span className="text-red-400 font-medium">
              {docsCount} document(s)
            </span>{" "}
            qui seront également supprimés.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? "..." : "Supprimer"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
