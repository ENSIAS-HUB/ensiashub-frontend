"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDriveFormData,
  useDriveModulesForUpload,
  useDriveUpload,
} from "@/lib/hooks/useDriveUpload";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

const DOC_TYPES = [
  { value: "Cours", label: "Cours" },
  { value: "TD/TP", label: "TD/TP" },
  { value: "Anciens examens", label: "Anciens examens" },
  { value: "Résumé", label: "Résumé" },
  { value: "Projet", label: "Projet" },
  { value: "Autre", label: "Autre" },
];

const SEMESTERS = ["S1", "S2", "S3", "S4", "S5", "S6"];

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
    ".pptx",
  ],
  "text/plain": [".txt"],
  "application/zip": [".zip"],
  "application/x-rar-compressed": [".rar"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/gif": [".gif"],
  "video/mp4": [".mp4"],
};

export default function UploadModal({ open, onClose }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [titre, setTitre] = useState("");
  const [docType, setDocType] = useState("Cours");
  const [semestre, setSemestre] = useState("");
  const [filiereId, setFiliereId] = useState("");
  const [anneeId, setAnneeId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [elementId, setElementId] = useState("");

  const { data: formData } = useDriveFormData();
  const { data: modulesData, isLoading: loadingModules } =
    useDriveModulesForUpload({
      filiere_id: filiereId || undefined,
      annee_id: anneeId || undefined,
      semestre: semestre || undefined,
    });

  const modules = modulesData?.modules ?? [];
  const selectedModule = modules.find((m) => m.id === moduleId);

  const upload = useDriveUpload(() => handleClose());
  const isPending = upload.isPending;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const picked = acceptedFiles[0];
      if (!picked) return;
      setFile(picked);
      if (!titre) setTitre(picked.name.replace(/\.[^.]+$/, ""));
    },
    [titre],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
  });

  const handleSubmit = () => {
    if (!file || !titre || !elementId || !docType) return;
    upload.mutate({ file, titre, element_module_id: elementId, type: docType });
  };

  const handleClose = () => {
    if (isPending) return;
    setFile(null);
    setTitre("");
    setDocType("Cours");
    setSemestre("");
    setFiliereId("");
    setAnneeId("");
    setModuleId("");
    setElementId("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-[#111827] border border-white/10 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            Ajouter un document
          </h2>
          <button
            onClick={handleClose}
            disabled={isPending}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-indigo-500 bg-indigo-500/10"
                : file
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-white/20 hover:border-white/40"
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-3 text-white">
                <FileText size={24} className="text-green-400" />
                <div className="text-left">
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="ml-auto text-gray-400 hover:text-red-400"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="text-gray-400">
                <Upload size={32} className="mx-auto mb-2" />
                <p className="text-sm">
                  {isDragActive
                    ? "Déposez le fichier ici…"
                    : "Glissez un fichier ou cliquez pour parcourir"}
                </p>
                <p className="text-xs mt-1">
                  PDF, Word, Excel, PPT, Zip… (max 100 MB)
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="doc-title" className="text-gray-300 text-sm">
              Titre *
            </Label>
            <Input
              id="doc-title"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Titre du document"
              className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <Label className="text-gray-300 text-sm">Type *</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1f2937] border-white/10">
                  {DOC_TYPES.map((t) => (
                    <SelectItem
                      key={t.value}
                      value={t.value}
                      className="text-white"
                    >
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Semestre */}
            <div>
              <Label className="text-gray-300 text-sm">Semestre</Label>
              <Select
                value={semestre}
                onValueChange={(v) => {
                  setSemestre(v === "__all__" ? "" : v);
                  setModuleId("");
                  setElementId("");
                }}
              >
                <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f2937] border-white/10">
                  <SelectItem value="__all__" className="text-white">
                    Tous
                  </SelectItem>
                  {SEMESTERS.map((s) => (
                    <SelectItem key={s} value={s} className="text-white">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Filière */}
            <div>
              <Label className="text-gray-300 text-sm">Filière</Label>
              <Select
                value={filiereId}
                onValueChange={(v) => {
                  setFiliereId(v);
                  setModuleId("");
                  setElementId("");
                }}
              >
                <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f2937] border-white/10">
                  {formData?.filieres.map((f) => (
                    <SelectItem key={f.id} value={f.id} className="text-white">
                      {f.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Année */}
            <div>
              <Label className="text-gray-300 text-sm">Année</Label>
              <Select
                value={anneeId}
                onValueChange={(v) => {
                  setAnneeId(v);
                  setModuleId("");
                  setElementId("");
                }}
              >
                <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f2937] border-white/10">
                  {formData?.annees.map((a) => (
                    <SelectItem key={a.id} value={a.id} className="text-white">
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Module */}
            <div>
              <Label className="text-gray-300 text-sm">Module *</Label>
              <Select
                value={moduleId}
                onValueChange={(v) => {
                  setModuleId(v);
                  setElementId("");
                }}
                disabled={!filiereId || !anneeId || loadingModules}
              >
                <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white disabled:opacity-40">
                  <SelectValue placeholder={loadingModules ? "…" : "—"} />
                </SelectTrigger>
                <SelectContent className="bg-[#1f2937] border-white/10">
                  {modules.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-white">
                      {m.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Élément */}
            <div>
              <Label className="text-gray-300 text-sm">Élément *</Label>
              <Select
                value={elementId}
                onValueChange={setElementId}
                disabled={!moduleId || !selectedModule?.elementModules?.length}
              >
                <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white disabled:opacity-40">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f2937] border-white/10">
                  {selectedModule?.elementModules?.map((el) => (
                    <SelectItem
                      key={el.id}
                      value={el.id}
                      className="text-white"
                    >
                      {el.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Progress */}
          {isPending && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Upload en cours…</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-indigo-500 h-1.5 rounded-full animate-pulse w-full" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isPending}
            className="text-gray-300 hover:text-white"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || !titre || !elementId || isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Upload…
              </>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Publier
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
