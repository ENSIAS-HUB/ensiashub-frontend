"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users,
  BookOpen,
  FileText,
  Radio,
  Plus,
  Trash2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getFilieres,
  getModules,
  createFiliere,
  createModule,
  deleteFiliere,
  deleteModule,
} from "@/lib/api/drive";
import { getGroups } from "@/lib/api/groups";
import { getIoTDevices } from "@/lib/api/iot";
import apiClient from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/authStore";
import type { Filiere, Module, User, RoleType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Role labels ───────────────────────────────────────────────────────────────
const ROLE_LABELS: Record<RoleType, string> = {
  etudiant: "Étudiant",
  delegue: "Délégué",
  president_club: "Président de Club",
  chef_scolarite: "Chef de Scolarité",
  admin: "Admin",
  superAdmin: "Super Admin",
  cuisinier: "Cuisinier",
};

const ROLE_COLOR: Record<RoleType, string> = {
  etudiant: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  delegue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  president_club: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  chef_scolarite: "bg-[#B01817]/20 text-[#B01817] border-[#B01817]/30",
  admin: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  superAdmin: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  cuisinier: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  color = "text-[#B01817]",
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  loading: boolean;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-5 flex items-center gap-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay }}
    >
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-lg bg-current/10",
          color,
        )}
      >
        <Icon className={cn("size-5", color)} />
      </div>
      <div>
        {loading ? (
          <>
            <Skeleton className="h-6 w-12 mb-1" />
            <Skeleton className="h-3 w-20" />
          </>
        ) : (
          <>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ── Users widget ──────────────────────────────────────────────────────────────
function UsersWidget() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const r = await apiClient.get("/adhesions");
      // Returns {success, data: paginator{data: [{user, group}, ...], ...}}
      const items: any[] = r.data?.data?.data ?? [];
      return items
        .map((a: any) => a.user)
        .filter(Boolean)
        .map(
          (u: any): User => ({
            id: u.id ?? "",
            name:
              `${u.prenom ?? ""} ${u.nom ?? ""}`.trim() ||
              u.emailInstitutionnel ||
              "Inconnu",
            email: u.emailInstitutionnel ?? u.email ?? "",
            avatar: u.photoProfil ?? undefined,
            role: ((Array.isArray(u.roles) ? u.roles[0] : u.roles) ??
              "etudiant") as User["role"],
            created_at: u.created_at ?? "",
          }),
        );
    },
    retry: 1,
  });

  const users = data ?? [];

  return (
    <motion.div
      className="rounded-xl border border-border bg-card overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Users className="size-4 text-[#B01817]" />
          Gestion des Utilisateurs
        </h3>
        <Badge variant="outline" className="text-[10px]">
          {users.length} membres
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <AlertCircle className="size-6 text-destructive" />
          <p className="text-xs text-muted-foreground">
            Impossible de charger les membres.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 h-7 text-xs"
          >
            <RefreshCw className="size-3" /> Réessayer
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border/50 max-h-72 overflow-y-auto">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3 px-5 py-3">
              <Avatar className="size-7">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-[10px] bg-[#B01817]/20 text-[#B01817]">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] h-4 px-1.5 border shrink-0",
                  ROLE_COLOR[user.role],
                )}
              >
                {ROLE_LABELS[user.role]}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Drive widget ──────────────────────────────────────────────────────────────
function DriveWidget() {
  const queryClient = useQueryClient();
  const [filiereDialog, setFiliereDialog] = useState(false);
  const [moduleDialog, setModuleDialog] = useState(false);
  const [newFiliere, setNewFiliere] = useState({ name: "", code: "" });
  const [newModule, setNewModule] = useState({
    name: "",
    semester: "",
    filiere_id: "",
  });
  const [activeFiliereId, setActiveFiliere] = useState<string | undefined>();

  const { data: filieresData, isLoading: fLoading } = useQuery({
    queryKey: ["filieres"],
    queryFn: getFilieres,
  });
  const { data: modulesData, isLoading: mLoading } = useQuery({
    queryKey: ["modules", activeFiliereId],
    queryFn: () => getModules(activeFiliereId),
    enabled: !!activeFiliereId,
  });

  const createFiliereMutation = useMutation({
    mutationFn: () => createFiliere({ nom: newFiliere.name } as any),
    onSuccess: () => {
      toast.success("Filière créée !");
      queryClient.invalidateQueries({ queryKey: ["filieres"] });
      setFiliereDialog(false);
      setNewFiliere({ name: "", code: "" });
    },
    onError: () => toast.error("Erreur lors de la création."),
  });

  const createModuleMutation = useMutation({
    mutationFn: () => {
      const semNum = Number(newModule.semester) || 1;
      return createModule({
        nom: newModule.name,
        filiere_id: activeFiliereId,
        semestre: `S${semNum}`,
        annee: Math.ceil(semNum / 2),
      } as any);
    },
    onSuccess: () => {
      toast.success("Module créé !");
      queryClient.invalidateQueries({ queryKey: ["modules", activeFiliereId] });
      setModuleDialog(false);
      setNewModule({ name: "", semester: "", filiere_id: "" });
    },
    onError: () => toast.error("Erreur lors de la création."),
  });

  const deleteFiliereMutation = useMutation({
    mutationFn: (id: string) => deleteFiliere(id),
    onSuccess: () => {
      toast.success("Filière supprimée.");
      queryClient.invalidateQueries({ queryKey: ["filieres"] });
      if (activeFiliereId) setActiveFiliere(undefined);
    },
    onError: () => toast.error("Erreur lors de la suppression."),
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (id: string) => deleteModule(id),
    onSuccess: () => {
      toast.success("Module supprimé.");
      queryClient.invalidateQueries({ queryKey: ["modules", activeFiliereId] });
    },
    onError: () => toast.error("Erreur lors de la suppression."),
  });

  // FiliereController returns {success, data: paginator} → paginator → data array
  const rawFilieres: any[] = (filieresData as any)?.data?.data?.data ?? [];
  const filieres = rawFilieres.map((f: any) => ({
    ...f,
    name: f.nom ?? "",
    code: f.code ?? (f.nom ? String(f.nom).slice(0, 2).toUpperCase() : ""),
  }));
  const rawModules: any[] = (modulesData as any)?.data?.data?.data ?? [];
  const modules = rawModules.map((m: any) => ({
    ...m,
    name: m.nom ?? "",
    semester: m.semestre ? parseInt(String(m.semestre).replace("S", "")) : 0,
  }));

  return (
    <motion.div
      className="rounded-xl border border-border bg-card overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
    >
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BookOpen className="size-4 text-[#B01817]" />
          Gestion The Drive
        </h3>
      </div>

      <Tabs defaultValue="filieres" className="p-4 space-y-3">
        <TabsList className="h-7">
          <TabsTrigger value="filieres" className="text-xs h-6">
            Filières
          </TabsTrigger>
          <TabsTrigger value="modules" className="text-xs h-6">
            Modules
          </TabsTrigger>
        </TabsList>

        {/* Filières */}
        <TabsContent value="filieres" className="space-y-2 mt-0">
          <Button
            size="sm"
            className="h-7 text-xs gap-1.5 bg-[#B01817] hover:bg-[#8f1211] text-white w-full"
            onClick={() => setFiliereDialog(true)}
          >
            <Plus className="size-3" /> Ajouter une filière
          </Button>
          {fLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded-md" />
            ))
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {filieres.map((f) => (
                <div
                  key={f.id}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 cursor-pointer transition-colors",
                    activeFiliereId === f.id
                      ? "bg-[#B01817]/15 text-[#B01817]"
                      : "hover:bg-muted",
                  )}
                  onClick={() => setActiveFiliere(f.id)}
                >
                  <div>
                    <p className="text-xs font-medium">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {f.code}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-6 text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFiliereMutation.mutate(f.id);
                    }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Modules */}
        <TabsContent value="modules" className="space-y-2 mt-0">
          {/* Filière selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs justify-between gap-1"
              >
                {activeFiliereId
                  ? (filieres.find((f) => f.id === activeFiliereId)?.name ??
                    "Filière")
                  : "Sélectionner une filière"}
                <ChevronDown className="size-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {filieres.map((f) => (
                <DropdownMenuItem
                  key={f.id}
                  onClick={() => setActiveFiliere(f.id)}
                >
                  {f.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {activeFiliereId && (
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5 bg-[#B01817] hover:bg-[#8f1211] text-white w-full"
              onClick={() => setModuleDialog(true)}
            >
              <Plus className="size-3" /> Ajouter un module
            </Button>
          )}

          {mLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded-md" />
            ))
          ) : !activeFiliereId ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Sélectionne une filière.
            </p>
          ) : modules.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Aucun module.
            </p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {modules.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted"
                >
                  <div>
                    <p className="text-xs font-medium">{m.name}</p>
                    {m.semester && (
                      <p className="text-[10px] text-muted-foreground">
                        S{m.semester}
                      </p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-6 text-destructive hover:bg-destructive/10"
                    onClick={() => deleteModuleMutation.mutate(m.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Filière dialog */}
      <Dialog open={filiereDialog} onOpenChange={setFiliereDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Nouvelle filière</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Nom</Label>
              <Input
                value={newFiliere.name}
                onChange={(e) =>
                  setNewFiliere((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Ex: Génie Logiciel"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Code</Label>
              <Input
                value={newFiliere.code}
                onChange={(e) =>
                  setNewFiliere((p) => ({ ...p, code: e.target.value }))
                }
                placeholder="Ex: GL"
                className="h-8 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              size="sm"
              disabled={
                !newFiliere.name ||
                !newFiliere.code ||
                createFiliereMutation.isPending
              }
              onClick={() => createFiliereMutation.mutate()}
              className="bg-[#B01817] hover:bg-[#8f1211] text-white"
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module dialog */}
      <Dialog open={moduleDialog} onOpenChange={setModuleDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Nouveau module</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Nom du module</Label>
              <Input
                value={newModule.name}
                onChange={(e) =>
                  setNewModule((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Ex: Algorithmique"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Semestre</Label>
              <Input
                value={newModule.semester}
                onChange={(e) =>
                  setNewModule((p) => ({ ...p, semester: e.target.value }))
                }
                placeholder="Ex: 1"
                type="number"
                min={1}
                max={12}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              size="sm"
              disabled={!newModule.name || createModuleMutation.isPending}
              onClick={() => createModuleMutation.mutate()}
              className="bg-[#B01817] hover:bg-[#8f1211] text-white"
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // Route guard — redirect if not chef_scolarite
  useEffect(() => {
    if (user && user.role !== "chef_scolarite") {
      router.replace("/feed");
    }
  }, [user, router]);

  // Stat queries
  const { data: groupsData, isLoading: gLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
  });
  const { data: devicesData, isLoading: dLoading } = useQuery({
    queryKey: ["iot-devices"],
    queryFn: getIoTDevices,
  });

  const totalGroups = (() => {
    const raw = groupsData?.data;
    if (!raw) return 0;
    if (Array.isArray(raw)) return raw.length;
    if (Array.isArray(raw.data)) return raw.data.length;
    if (Array.isArray((raw as any).data?.data))
      return (raw as any).data.data.length;
    return 0;
  })();
  // IotDeviceController returns a raw array (no wrapper, no paginator)
  const iotArray: any[] = Array.isArray(devicesData)
    ? devicesData
    : ((devicesData as any)?.data ?? []);
  const totalDevices = Array.isArray(iotArray) ? iotArray.length : 0;
  const activeDevices = Array.isArray(iotArray)
    ? iotArray.filter((d: any) => d.statutActuel).length
    : 0;

  if (user && user.role !== "chef_scolarite") return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex size-9 items-center justify-center rounded-lg bg-[#B01817]/15">
          <ShieldCheck className="size-5 text-[#B01817]" />
        </div>
        <div>
          <h1 className="text-base font-bold">Espace Administration</h1>
          <p className="text-xs text-muted-foreground">Chef de Scolarité</p>
        </div>
        <Badge className="ml-auto bg-[#B01817]/15 text-[#B01817] border-[#B01817]/30 border">
          Admin
        </Badge>
      </motion.div>

      <Separator className="opacity-50" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label="Groupes actifs"
          value={totalGroups}
          loading={gLoading}
          delay={0.05}
        />
        <StatCard
          icon={Radio}
          label="Devices IoT"
          value={totalDevices}
          loading={dLoading}
          delay={0.1}
          color="text-blue-400"
        />
        <StatCard
          icon={Radio}
          label="Devices actifs"
          value={activeDevices}
          loading={dLoading}
          delay={0.15}
          color="text-green-400"
        />
        <StatCard
          icon={FileText}
          label="Modules Drive"
          value="—"
          loading={false}
          delay={0.2}
          color="text-violet-400"
        />
      </div>

      {/* Widgets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UsersWidget />
        <DriveWidget />
      </div>
    </div>
  );
}
