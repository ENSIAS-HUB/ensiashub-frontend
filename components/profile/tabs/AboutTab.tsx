"use client";

import type { UserProfile } from "@/lib/types/profile";

interface AboutTabProps {
  user: UserProfile;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-white font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/40 text-sm w-24 flex-shrink-0">{label}</span>
      <span className="text-white/80 text-sm">{value}</span>
    </div>
  );
}

export function AboutTab({ user }: AboutTabProps) {
  const hasContent =
    !!user.bio ||
    user.competences.length > 0 ||
    !!user.filiere ||
    user.clubs.length > 0;

  if (!hasContent) {
    return (
      <p className="text-center text-white/40 py-12">
        Aucune information disponible
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bio */}
      {user.bio && (
        <Section title="À propos">
          <p className="text-white/70 text-sm leading-relaxed">{user.bio}</p>
        </Section>
      )}

      {/* Compétences */}
      {user.competences.length > 0 && (
        <Section title="Compétences">
          <div className="flex flex-wrap gap-2">
            {user.competences.map((comp) => (
              <span
                key={comp}
                className="bg-white/5 border border-white/10 text-white/80
                           text-sm px-3 py-1 rounded-lg font-mono"
              >
                {comp}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Parcours académique */}
      {(user.filiere || user.annee || user.specialite) && (
        <Section title="Parcours académique">
          <div className="space-y-2">
            {user.filiere && <InfoRow label="Filière" value={user.filiere} />}
            {user.annee && <InfoRow label="Année" value={String(user.annee)} />}
            {user.specialite && (
              <InfoRow label="Spécialité" value={user.specialite} />
            )}
          </div>
        </Section>
      )}

      {/* Clubs */}
      {user.clubs.length > 0 && (
        <Section title="Clubs">
          <div className="flex flex-wrap gap-3">
            {user.clubs.map((club) => (
              <div
                key={club.id}
                className="flex items-center gap-2 bg-white/5 border border-white/10
                           rounded-lg px-3 py-2"
              >
                {club.avatar_url && (
                  <img
                    src={club.avatar_url}
                    alt={club.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <span className="text-white/80 text-sm">{club.name}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
