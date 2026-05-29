"use client";

import { Code, ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { Project } from "@/lib/types/profile";

const STATUS_COLORS: Record<Project["status"], string> = {
  terminé: "bg-green-500/20 text-green-400",
  en_cours: "bg-blue-500/20 text-blue-400",
  en_pause: "bg-yellow-500/20 text-yellow-400",
};

const STATUS_LABELS: Record<Project["status"], string> = {
  terminé: "Terminé",
  en_cours: "En cours",
  en_pause: "En pause",
};

interface ProjectCardProps {
  project: Project;
  isOwnProfile: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
}

export function ProjectCard({
  project,
  isOwnProfile,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  return (
    <div
      className="rounded-xl border border-white/10 bg-[#0f1923]
                    hover:border-white/20 transition-all group overflow-hidden"
    >
      {/* Image / placeholder */}
      <div className="relative h-36 bg-gradient-to-br from-[#1e2a3a] to-[#0f1923] overflow-hidden">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.titre}
            className="w-full h-full object-cover opacity-80
                       group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Code size={40} className="text-white/20" />
          </div>
        )}
        {project.is_featured && (
          <span
            className="absolute top-2 left-2 bg-yellow-500/20 text-yellow-400
                           text-xs px-2 py-0.5 rounded-full border border-yellow-500/30"
          >
            ⭐ Épinglé
          </span>
        )}
        <span
          className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full
                      ${STATUS_COLORS[project.status]}`}
        >
          {STATUS_LABELS[project.status]}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-white">{project.titre}</h3>

        {project.description && (
          <p className="text-white/60 text-sm line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Tech Stack */}
        {project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tech_stack.map((tech) => (
              <span
                key={tech}
                className="bg-white/5 border border-white/10 text-white/70
                           text-xs px-2 py-0.5 rounded-md font-mono"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Liens + Actions */}
        <div className="flex items-center gap-3 pt-1">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white/50
                         hover:text-white text-xs transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>{" "}
              Code
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-green-400/70
                         hover:text-green-400 text-xs transition-colors"
            >
              <ExternalLink size={12} /> Demo
            </a>
          )}
          {isOwnProfile && (
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => onEdit(project)}
                className="text-white/30 hover:text-white transition-colors"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => onDelete(project.id)}
                className="text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
