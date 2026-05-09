import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPermissions } from "@/hooks/useRoles";
import { permKey, type PermissionAction } from "@/lib/permissions";

interface Props {
  resource: string;
  action?: PermissionAction;
  children: ReactNode;
}

/**
 * Schützt eine Route. Erlaubt Zugriff, wenn der eingeloggte Nutzer die
 * passende Berechtigung hat. Im Dev-Modus (kein eingeloggter User) wird der
 * Zugriff durchgelassen, damit die App weiter offen testbar ist.
 */
export function RequireAccess({ resource, action = "view", children }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { data: perms, isLoading } = useMyPermissions();

  // Dev-Bypass: kein User eingeloggt → wie bisher offen lassen
  if (!authLoading && !user) return <>{children}</>;

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!perms?.has(permKey(resource, action))) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
