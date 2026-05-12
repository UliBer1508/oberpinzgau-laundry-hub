import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
  fallback?: string;
}

export function BackButton({ className, fallback = "/" }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        "h-9 gap-1.5 px-2 text-sidebar-foreground hover:bg-sidebar-accent shrink-0",
        className,
      )}
      aria-label="Zurück"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Zurück</span>
    </Button>
  );
}
