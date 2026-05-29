import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export interface DriveAccessFull {
  full_access: true;
  filieres: { id: string; nom: string; slug: string; badge: string | null; is_tronc_commun: boolean }[];
}

export interface DriveAccessStudent {
  full_access: false;
  filiere: { id: string; nom: string; badge: string | null } | null;
  annee: string;
}

export type DriveAccess = DriveAccessFull | DriveAccessStudent;

export function useDriveAccess() {
  return useQuery<DriveAccess>({
    queryKey: ["drive-access"],
    queryFn: () => apiClient.get("/me/drive-access").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
