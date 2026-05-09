import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import {
  Role,
  useCreateRole,
  useDeleteRole,
  useRolePermissions,
  useRoles,
  useSaveRolePermissions,
  useUpdateRole,
} from "@/hooks/useRoles";
import { ACTIONS, ACTION_LABEL, RESOURCES, permKey } from "@/lib/permissions";
import { toast } from "sonner";

export function RollenTab() {
  const { data: roles = [], isLoading } = useRoles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  useEffect(() => {
    if (!selectedId && roles.length) setSelectedId(roles[0].id);
  }, [roles, selectedId]);

  const selected = roles.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      {/* Rollen-Liste */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="text-sm font-semibold">Rollen</h3>
          <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ul className="divide-y">
            {roles.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setSelectedId(r.id)}
                  className={cn(
                    "w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-start justify-between gap-2",
                    selectedId === r.id && "bg-muted"
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{r.label}</span>
                      {r.is_system && (
                        <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0">
                          <Lock className="h-2.5 w-2.5" /> System
                        </Badge>
                      )}
                    </div>
                    {r.description && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {r.description}
                      </div>
                    )}
                  </div>
                  {!r.is_system && (
                    <div className="flex shrink-0 gap-0.5">
                      <span
                        role="button"
                        tabIndex={0}
                        className="rounded p-1 hover:bg-background cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditTarget(r);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        className="rounded p-1 hover:bg-background cursor-pointer text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(r);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Permissions-Matrix */}
      <div className="rounded-lg border bg-card">
        {selected ? (
          <PermissionsEditor key={selected.id} role={selected} />
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Wähle links eine Rolle
          </div>
        )}
      </div>

      <RoleFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
      />
      <RoleFormDialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
        mode="edit"
        role={editTarget}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rolle löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Die Rolle „{deleteTarget?.label}" wird gelöscht. Benutzer mit dieser
              Rolle verlieren ihre Berechtigungen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <DeleteRoleAction
            target={deleteTarget}
            onDone={() => {
              setDeleteTarget(null);
              if (deleteTarget?.id === selectedId) setSelectedId(null);
            }}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DeleteRoleAction({
  target,
  onDone,
}: {
  target: Role | null;
  onDone: () => void;
}) {
  const del = useDeleteRole();
  return (
    <AlertDialogFooter>
      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
      <AlertDialogAction
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onClick={() => {
          if (!target) return;
          del.mutate(target.id, {
            onSuccess: () => {
              toast.success("Rolle gelöscht");
              onDone();
            },
            onError: (e: Error) => toast.error(e.message),
          });
        }}
      >
        Löschen
      </AlertDialogAction>
    </AlertDialogFooter>
  );
}

function PermissionsEditor({ role }: { role: Role }) {
  const { data: perms = [], isLoading } = useRolePermissions(role.id);
  const save = useSaveRolePermissions();
  const [draft, setDraft] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDraft(new Set(perms.map((p) => permKey(p.resource, p.action))));
  }, [perms]);

  const dirty = useMemo(() => {
    const a = new Set(perms.map((p) => permKey(p.resource, p.action)));
    if (a.size !== draft.size) return true;
    for (const k of draft) if (!a.has(k)) return true;
    return false;
  }, [perms, draft]);

  const toggle = (resource: string, action: string) => {
    const k = permKey(resource, action);
    const next = new Set(draft);
    if (next.has(k)) {
      next.delete(k);
      // wenn edit weg → view bleibt; wenn view weg → edit ebenfalls weg
      if (action === "view") next.delete(permKey(resource, "edit"));
    } else {
      next.add(k);
      if (action === "edit") next.add(permKey(resource, "view"));
    }
    setDraft(next);
  };

  const handleSave = () => {
    const permissions = Array.from(draft).map((k) => {
      const [resource, action] = k.split(":");
      return { resource, action: action as "view" | "edit" };
    });
    save.mutate(
      { role_id: role.id, permissions },
      {
        onSuccess: () => toast.success("Berechtigungen gespeichert"),
        onError: (e: Error) => toast.error(e.message),
      }
    );
  };

  return (
    <div>
      <div className="flex items-start justify-between border-b p-4">
        <div>
          <h3 className="font-semibold">Rechte für „{role.label}"</h3>
          {role.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{role.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!dirty || save.isPending}
            onClick={() => setDraft(new Set(perms.map((p) => permKey(p.resource, p.action))))}
          >
            Zurücksetzen
          </Button>
          <Button size="sm" disabled={!dirty || save.isPending} onClick={handleSave}>
            {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Speichern
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Bereich</TableHead>
              {ACTIONS.map((a) => (
                <TableHead key={a} className="w-[120px] text-center">
                  {ACTION_LABEL[a]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {RESOURCES.map((res) => (
              <TableRow key={res.key}>
                <TableCell className="font-medium">{res.label}</TableCell>
                {ACTIONS.map((a) => (
                  <TableCell key={a} className="text-center">
                    <Checkbox
                      checked={draft.has(permKey(res.key, a))}
                      onCheckedChange={() => toggle(res.key, a)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function RoleFormDialog({
  open,
  onOpenChange,
  mode,
  role,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: "create" | "edit";
  role?: Role | null;
}) {
  const create = useCreateRole();
  const update = useUpdateRole();
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setKey(role?.key ?? "");
      setLabel(role?.label ?? "");
      setDescription(role?.description ?? "");
    }
  }, [open, role]);

  const submit = () => {
    if (mode === "create") {
      const slug = key.trim() || label.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      create.mutate(
        { key: slug, label: label.trim(), description: description.trim() || null },
        {
          onSuccess: () => {
            toast.success("Rolle angelegt");
            onOpenChange(false);
          },
          onError: (e: Error) => toast.error(e.message),
        }
      );
    } else if (role) {
      update.mutate(
        { id: role.id, label: label.trim(), description: description.trim() || null },
        {
          onSuccess: () => {
            toast.success("Rolle gespeichert");
            onOpenChange(false);
          },
          onError: (e: Error) => toast.error(e.message),
        }
      );
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Neue Rolle" : "Rolle bearbeiten"}</DialogTitle>
          <DialogDescription>
            Lege eine eigene Rolle an. Berechtigungen werden anschließend in der Matrix gesetzt.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="z.B. Fahrer" />
          </div>
          {mode === "create" && (
            <div>
              <Label>Schlüssel (technisch, optional)</Label>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="fahrer"
              />
            </div>
          )}
          <div>
            <Label>Beschreibung (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={submit} disabled={pending || !label.trim()}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
