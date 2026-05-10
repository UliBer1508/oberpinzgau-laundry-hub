import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  label: string;
  description?: string;
  icon: LucideIcon;
  variant?: "primary" | "info" | "warning" | "success" | "neutral";
  onClick: () => void;
}

const variantStyles: Record<NonNullable<QuickActionCardProps["variant"]>, string> = {
  primary: "bg-primary/10 text-primary",
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  neutral: "bg-muted text-foreground",
};

export function QuickActionCard({
  label,
  description,
  icon: Icon,
  variant = "primary",
  onClick,
}: QuickActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col items-start gap-2 rounded-xl border bg-card p-3 text-left",
        "min-h-[92px] transition-all",
        "hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
          variantStyles[variant],
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-0.5">
        <div className="font-semibold text-sm leading-tight">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground leading-tight">{description}</div>
        )}
      </div>
    </button>
  );
}
