import { useState } from "react";
import { Download, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface Props {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  fullWidth?: boolean;
}

export function PWAInstallButton({
  variant = "outline",
  size = "sm",
  className,
  fullWidth,
}: Props) {
  const { canInstall, platform, promptInstall, hasNativePrompt } =
    usePWAInstall();
  const [showIOSDialog, setShowIOSDialog] = useState(false);

  if (!canInstall) return null;

  const handleClick = async () => {
    if (hasNativePrompt) {
      await promptInstall();
    } else if (platform === "ios") {
      setShowIOSDialog(true);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        className={`${fullWidth ? "w-full" : ""} ${className ?? ""}`}
      >
        <Download className="h-4 w-4 mr-2" />
        App installieren
      </Button>

      <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>App auf iPhone installieren</DialogTitle>
            <DialogDescription>
              Folge diesen Schritten in Safari, um das Wäscheportal zum
              Home-Bildschirm hinzuzufügen.
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-4 mt-2">
            <li className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                1
              </div>
              <div className="flex-1 text-sm">
                Tippe unten in der Safari-Leiste auf das{" "}
                <Share className="inline h-4 w-4 -mt-0.5" />{" "}
                <strong>Teilen</strong>-Symbol.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                2
              </div>
              <div className="flex-1 text-sm">
                Wähle{" "}
                <strong>
                  Zum Home-Bildschirm <Plus className="inline h-4 w-4 -mt-0.5" />
                </strong>
                .
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                3
              </div>
              <div className="flex-1 text-sm">
                Tippe oben rechts auf <strong>Hinzufügen</strong> – fertig!
              </div>
            </li>
          </ol>
          <p className="text-xs text-muted-foreground mt-4">
            Hinweis: Funktioniert nur in Safari, nicht in Chrome oder anderen
            iOS-Browsern.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
