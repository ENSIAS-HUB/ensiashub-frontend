"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoveRight } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DriveDocument2 } from "@/lib/types/drive";

const DOCUMENT_TYPES = [
  { value: "cours", label: "Cours" },
  { value: "td", label: "TD" },
  { value: "tp", label: "TP" },
  { value: "examen", label: "Examen" },
  { value: "resume", label: "Résumé" },
  { value: "projet", label: "Projet" },
  { value: "autre", label: "Autre" },
] as const;

interface MoveModalProps {
  isOpen: boolean;
  doc: Pick<DriveDocument2, "id" | "titre">;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AdminModule {
  id: string;
  nom: string;
  semestre: string;
}

interface Element {
  id: string;
  nom: string;
}

export function MoveModal({ isOpen, doc, onClose, onSuccess }: MoveModalProps) {
  const qc = useQueryClient();
  const [moduleId, setModuleId] = useState<string>("");
  const [elementId, setElementId] = useState<string>("");
  const [typeDocument, setTypeDocument] = useState<string>("cours");

  // Charger les modules admin
  const { data: modulesData } = useQuery({
    queryKey: ["admin-drive-modules"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ modules: AdminModule[] }>(
        "/admin/drive/modules",
      );
      return data.modules;
    },
    enabled: isOpen,
  });

  // Charger les éléments du module sélectionné
  const { data: elementsData } = useQuery({
    queryKey: ["drive-elements", moduleId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ elements: Element[] }>(
        `/drive/modules/${moduleId}/elements`,
      );
      return data.elements;
    },
    enabled: isOpen && !!moduleId,
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.put(`/admin/drive/documents/${doc.id}/move`, {
        element_module_id: elementId,
        typeDocument,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drive-arborescence"] });
      qc.invalidateQueries({ queryKey: ["drive-mes-arborescence"] });
      toast.success("Document déplacé. Sync Azure en cours…");
      onSuccess?.();
      onClose();
    },
    onError: () => toast.error("Impossible de déplacer le document."),
  });

  const handleClose = () => {
    setModuleId("");
    setElementId("");
    setTypeDocument("cours");
    onClose();
  };

  const canSubmit = !!elementId && !!typeDocument && !mutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MoveRight className="size-4 text-[#B01817]" />
            Déplacer « {doc.titre} »
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Module */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">
              Module de destination
            </label>
            <select
              value={moduleId}
              onChange={(e) => {
                setModuleId(e.target.value);
                setElementId("");
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#B01817]"
            >
              <option value="">— Sélectionner un module —</option>
              {modulesData?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.semestre} · {m.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Élément */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">
              Élément de destination
            </label>
            <select
              value={elementId}
              onChange={(e) => setElementId(e.target.value)}
              disabled={!moduleId}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#B01817] disabled:opacity-50"
            >
              <option value="">— Sélectionner un élément —</option>
              {elementsData?.map((el) => (
                <option key={el.id} value={el.id}>
                  {el.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">
              Type de document
            </label>
            <select
              value={typeDocument}
              onChange={(e) => setTypeDocument(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#B01817]"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            size="sm"
            className="bg-[#B01817] hover:bg-[#8f1211] text-white gap-2"
            disabled={!canSubmit}
            onClick={() => mutation.mutate()}
          >
            <MoveRight className="size-3.5" />
            {mutation.isPending ? "Déplacement…" : "Déplacer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
