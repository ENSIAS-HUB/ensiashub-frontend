"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  useUserProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "@/lib/hooks/useProfile";
import type { Project, CreateProjectPayload } from "@/lib/types/profile";
import { ProjectCard } from "../projects/ProjectCard";
import { ProjectForm } from "../projects/ProjectForm";

interface ProjectsTabProps {
  username: string;
  isOwnProfile: boolean;
}

export function ProjectsTab({ username, isOwnProfile }: ProjectsTabProps) {
  const { data: projects, isLoading } = useUserProjects(username);
  const { mutate: createProject, isPending: creating } = useCreateProject();
  const { mutate: updateProject, isPending: updating } = useUpdateProject();
  const { mutate: deleteProject } = useDeleteProject();

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleCreate = (data: CreateProjectPayload) => {
    createProject(data, { onSuccess: () => setShowForm(false) });
  };

  const handleUpdate = (data: CreateProjectPayload) => {
    if (!editingProject) return;
    updateProject(
      { id: editingProject.id, ...data },
      { onSuccess: () => setEditingProject(null) },
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Supprimer ce projet ?")) {
      deleteProject(id);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isOwnProfile && !showForm && !editingProject && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl border border-dashed border-white/20
                     text-white/50 hover:text-white hover:border-white/40
                     transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={16} /> Ajouter un projet
        </button>
      )}

      {(showForm || editingProject) && isOwnProfile && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-5">
          <h3 className="text-white font-semibold mb-4">
            {editingProject ? "Modifier le projet" : "Nouveau projet"}
          </h3>
          <ProjectForm
            onSubmit={editingProject ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingProject(null);
            }}
            initialData={editingProject ?? undefined}
            isPending={creating || updating}
          />
        </div>
      )}

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isOwnProfile={isOwnProfile}
              onEdit={(p) => setEditingProject(p)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        !showForm && (
          <p className="text-center text-white/40 py-12">
            {isOwnProfile
              ? "Aucun projet ajouté. Commencez par en ajouter un !"
              : "Aucun projet."}
          </p>
        )
      )}
    </div>
  );
}
