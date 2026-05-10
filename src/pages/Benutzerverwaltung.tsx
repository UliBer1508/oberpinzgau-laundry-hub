import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Plus, Trash2, Pencil, Search, Loader2, ShieldAlert, Users, ShieldCheck, Mail, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RollenTab } from "@/components/benutzer/RollenTab";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ALL_ROLES,
  ROLE_LABEL,
  type AppRole,
  type Benutzer,
  useBenutzer,
  useCurrentUserRole,
  useDeleteBenutzer,
  useSetUserRole,
  useUpdateBenutzerProfil,
} from "@/hooks/useBenutzer";
import { useAuth } from "@/contexts/AuthContext";
import {
  BenutzerCreateDialog,
  BenutzerEditDialog,
} from "@/components/benutzer/BenutzerDialogs";
import { toast } from "sonner";

const ROLE_BADGE: Record<AppRole, string> = {
  admin: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  waeschekraft: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  kunde: "bg-slate-100 text-slate-700 hover:bg-slate-200",
};

export default function Benutzerverwaltung() {
  const { user, loading: authLoading } = useAuth();
  const { data: currentRole, isLoading: roleLoading } = useCurrentUserRole();
  const { data: benutzer = [], isLoading } = useBenutzer();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Benutzer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Benutzer | null>(null);

  const setRole = useSetUserRole();
  const updateProfil = useUpdateBenutzerProfil();
  const deleteBenutzer = useDeleteBenutzer();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return benutzer.filter((b) => {
      if (roleFilter !== "all" && b.role !== roleFilter) return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q)
      );
    });
  }, [benutzer, search, roleFilter]);

  // Auth/role guard
  if (authLoading || roleLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (currentRole !== "admin") {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex flex-col items-center justify-center h-full gap-3 p-12 text-center">
              <ShieldAlert className="h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Keine Berechtigung</h2>
              <p className="text-muted-foreground max-w-md">
                Diese Seite ist nur für Administratoren zugänglich. Bitte wende dich an einen Admin, um Rollen zugewiesen zu bekommen.
              </p>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-14 items-center gap-3 border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4 md:px-6">
            <SidebarTrigger className="hidden h-9 w-9 rounded-lg hover:bg-sidebar-accent shrink-0" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Benutzerverwaltung</h1>
            </div>
            <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Neuer Benutzer
            </Button>
          </header>

          <main className="flex-1 p-4 md:p-6 space-y-4">
            <Tabs defaultValue="benutzer" className="space-y-4">
              <TabsList>
                <TabsTrigger value="benutzer" className="gap-2">
                  <Users className="h-4 w-4" /> Benutzer
                </TabsTrigger>
                <TabsTrigger value="rollen" className="gap-2">
                  <ShieldCheck className="h-4 w-4" /> Rollen & Rechte
                </TabsTrigger>
              </TabsList>

              <TabsContent value="rollen" className="space-y-4">
                <RollenTab />
              </TabsContent>

              <TabsContent value="benutzer" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name oder E-Mail suchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Rolle filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Rollen</SelectItem>
                  {ALL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64 rounded-xl border bg-card">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center h-64 rounded-xl border border-dashed bg-card">
                <p className="text-muted-foreground">Keine Benutzer gefunden</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((b) => (
                  <div
                    key={b.id}
                    className="group relative rounded-xl border bg-card p-4 sm:p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                          {initials(b.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{b.name}</div>
                          {b.telefon && (
                            <div className="text-xs text-muted-foreground truncate">{b.telefon}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditTarget(b)}
                          title="Bearbeiten"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(b)}
                          disabled={b.id === user?.id}
                          title={b.id === user?.id ? "Eigener Account" : "Löschen"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Select
                        value={b.role ?? ""}
                        onValueChange={(v) =>
                          setRole.mutate(
                            { user_id: b.id, role: v as AppRole },
                            {
                              onSuccess: () => toast.success("Rolle aktualisiert"),
                              onError: (e: Error) => toast.error(e.message),
                            }
                          )
                        }
                      >
                        <SelectTrigger className="h-8 w-auto inline-flex border-0 p-0 shadow-none [&>svg]:ml-1">
                          {b.role ? (
                            <Badge className={ROLE_BADGE[b.role]}>{ROLE_LABEL[b.role]}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">— keine Rolle —</span>
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_ROLES.map((r) => (
                            <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mt-3 border-t pt-3 grid gap-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{b.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        Erstellt am {format(new Date(b.created_at), "dd.MM.yyyy", { locale: de })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>

      <BenutzerCreateDialog open={createOpen} onOpenChange={setCreateOpen} />

      <BenutzerEditDialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
        benutzer={editTarget}
        isPending={updateProfil.isPending}
        onSave={(input) =>
          updateProfil.mutate(input, {
            onSuccess: () => {
              toast.success("Benutzer gespeichert");
              setEditTarget(null);
            },
            onError: (e: Error) => toast.error(e.message),
          })
        }
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Benutzer löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} ({deleteTarget?.email}) wird unwiderruflich gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleteTarget) return;
                deleteBenutzer.mutate(deleteTarget.id, {
                  onSuccess: () => {
                    toast.success("Benutzer gelöscht");
                    setDeleteTarget(null);
                  },
                  onError: (e: Error) => toast.error(e.message),
                });
              }}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
