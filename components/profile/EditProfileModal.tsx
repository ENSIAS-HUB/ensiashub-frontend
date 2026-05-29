"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import type { UserProfile, UpdateProfilePayload } from "@/lib/types/profile";
import { useUpdateProfile } from "@/lib/hooks/useProfile";

interface EditProfileModalProps {
  user: UserProfile;
  onClose: () => void;
}

const INPUT_CLASS =
  "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 " +
  "text-white text-sm placeholder-white/30 focus:outline-none focus:border-red-600/50";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-white/70 mb-1">{label}</label>
      {children}
    </div>
  );
}

export function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [form, setForm] = useState<UpdateProfilePayload>({
    username: user.username,
    bio: user.bio ?? "",
    ville: user.ville ?? "",
    linkedin_url: user.linkedin_url ?? "",
    github_url: user.github_url ?? "",
    website_url: user.website_url ?? "",
    specialite: user.specialite ?? "",
    phone: "",
    competences: [...user.competences],
  });
  const [compInput, setCompInput] = useState("");

  const set = (field: keyof UpdateProfilePayload, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addComp = (comp: string) => {
    const c = comp.trim();
    if (c && !form.competences?.includes(c)) {
      setForm((prev) => ({
        ...prev,
        competences: [...(prev.competences ?? []), c],
      }));
    }
    setCompInput("");
  };

  const removeComp = (comp: string) => {
    setForm((prev) => ({
      ...prev,
      competences: prev.competences?.filter((c) => c !== comp),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UpdateProfilePayload = {
      username: form.username || undefined,
      bio: form.bio || undefined,
      ville: form.ville || undefined,
      linkedin_url: form.linkedin_url || undefined,
      github_url: form.github_url || undefined,
      website_url: form.website_url || undefined,
      specialite: form.specialite || undefined,
      phone: form.phone || undefined,
      competences: form.competences,
    };
    updateProfile(payload, { onSuccess: () => onClose() });
  };

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg bg-[#111827] rounded-2xl
                      border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-white font-semibold">Modifier le profil</h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body + Footer inside form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col overflow-hidden flex-1"
        >
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
            {/* Username */}
            <Field label="Nom d'utilisateur">
              <input
                type="text"
                value={form.username ?? ""}
                onChange={(e) => set("username", e.target.value)}
                placeholder="ex: yasser.moulay"
                className={INPUT_CLASS}
              />
            </Field>

            {/* Bio */}
            <Field label="Bio">
              <textarea
                value={form.bio ?? ""}
                onChange={(e) => set("bio", e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Parle de toi..."
                className={`${INPUT_CLASS} resize-none`}
              />
              <p className="text-xs text-white/30 text-right mt-0.5">
                {(form.bio ?? "").length}/500
              </p>
            </Field>

            {/* Ville + Spécialité */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ville">
                <input
                  type="text"
                  value={form.ville ?? ""}
                  onChange={(e) => set("ville", e.target.value)}
                  placeholder="Rabat"
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Spécialité">
                <input
                  type="text"
                  value={form.specialite ?? ""}
                  onChange={(e) => set("specialite", e.target.value)}
                  placeholder="SSE, GL, DATA..."
                  className={INPUT_CLASS}
                />
              </Field>
            </div>

            {/* URLs */}
            <Field label="LinkedIn URL">
              <input
                type="url"
                value={form.linkedin_url ?? ""}
                onChange={(e) => set("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="GitHub URL">
              <input
                type="url"
                value={form.github_url ?? ""}
                onChange={(e) => set("github_url", e.target.value)}
                placeholder="https://github.com/..."
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Portfolio / Site Web">
              <input
                type="url"
                value={form.website_url ?? ""}
                onChange={(e) => set("website_url", e.target.value)}
                placeholder="https://..."
                className={INPUT_CLASS}
              />
            </Field>

            {/* Compétences */}
            <Field label="Compétences">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={compInput}
                  onChange={(e) => setCompInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addComp(compInput);
                    }
                  }}
                  placeholder="Laravel, React..."
                  className={`flex-1 ${INPUT_CLASS}`}
                />
                <button
                  type="button"
                  onClick={() => addComp(compInput)}
                  className="px-3 py-2 rounded-lg bg-white/10 text-white
                             hover:bg-white/20 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              {(form.competences?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.competences?.map((comp) => (
                    <span
                      key={comp}
                      className="inline-flex items-center gap-1 bg-white/10 text-white/80
                                 text-xs px-2 py-0.5 rounded-md"
                    >
                      {comp}
                      <button
                        type="button"
                        onClick={() => removeComp(comp)}
                        className="text-white/40 hover:text-red-400 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Field>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/70
                         hover:text-white text-sm transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold
                         hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors flex items-center gap-2"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
