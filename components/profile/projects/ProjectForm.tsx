"use client";

import { useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import type { Project, CreateProjectPayload } from "@/lib/types/profile";

interface ProjectFormProps {
  onSubmit: (data: CreateProjectPayload) => void;
  onCancel: () => void;
  initialData?: Project;
  isPending?: boolean;
}

const TECH_SUGGESTIONS = [
  "Laravel",
  "React",
  "Vue",
  "Next.js",
  "Node.js",
  "Python",
  "Django",
  "Flask",
  "TypeScript",
  "JavaScript",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "AWS",
  "TailwindCSS",
  "Flutter",
];

const INPUT_CLASS =
  "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 " +
  "text-white text-sm placeholder-white/30 focus:outline-none focus:border-red-600/50";

export function ProjectForm({
  onSubmit,
  onCancel,
  initialData,
  isPending,
}: ProjectFormProps) {
  const [titre, setTitre] = useState(initialData?.titre ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [techStack, setTechStack] = useState<string[]>(
    initialData?.tech_stack ?? [],
  );
  const [techInput, setTechInput] = useState("");
  const [githubUrl, setGithubUrl] = useState(initialData?.github_url ?? "");
  const [liveUrl, setLiveUrl] = useState(initialData?.live_url ?? "");
  const [status, setStatus] = useState<Project["status"]>(
    initialData?.status ?? "terminé",
  );
  const [isFeatured, setIsFeatured] = useState(
    initialData?.is_featured ?? false,
  );

  const addTech = (tech: string) => {
    const t = tech.trim();
    if (t && !techStack.includes(t)) {
      setTechStack((prev) => [...prev, t]);
    }
    setTechInput("");
  };

  const removeTech = (tech: string) => {
    setTechStack((prev) => prev.filter((t) => t !== tech));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;
    onSubmit({
      titre: titre.trim(),
      description: description.trim() || undefined,
      tech_stack: techStack,
      github_url: githubUrl.trim() || undefined,
      live_url: liveUrl.trim() || undefined,
      status,
      is_featured: isFeatured,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Titre */}
      <div>
        <label className="block text-sm text-white/70 mb-1">
          Titre du projet <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
          placeholder="ex: ENSIAS Hub"
          className={INPUT_CLASS}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-white/70 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Décris ton projet..."
          className={`${INPUT_CLASS} resize-none`}
        />
      </div>

      {/* Tech Stack */}
      <div>
        <label className="block text-sm text-white/70 mb-1">
          Stack technique
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTech(techInput);
              }
            }}
            placeholder="Laravel, React..."
            list="tech-suggestions"
            className={`flex-1 ${INPUT_CLASS}`}
          />
          <datalist id="tech-suggestions">
            {TECH_SUGGESTIONS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <button
            type="button"
            onClick={() => addTech(techInput)}
            className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 bg-white/10 text-white/80
                           text-xs px-2 py-0.5 rounded-md font-mono"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTech(tech)}
                  className="text-white/40 hover:text-red-400 transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Liens */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-white/70 mb-1">GitHub URL</label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/..."
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">URL Demo</label>
          <input
            type="url"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://..."
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* Statut + Épinglé */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm text-white/70 mb-1">Statut</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Project["status"])}
            className="w-full bg-[#1e2a3a] border border-white/10 rounded-lg px-3 py-2
                       text-white text-sm focus:outline-none focus:border-red-600/50"
          >
            <option value="terminé">Terminé</option>
            <option value="en_cours">En cours</option>
            <option value="en_pause">En pause</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-5">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 accent-red-600"
          />
          <span className="text-sm text-white/70">Épingler</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-white/20 text-white/70
                     hover:text-white text-sm transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isPending || !titre.trim()}
          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold
                     hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors flex items-center gap-2"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {initialData ? "Mettre à jour" : "Ajouter le projet"}
        </button>
      </div>
    </form>
  );
}
