import { AnimatedBar } from "@/components/motion/decor";
import { cn } from "@/lib/cn";

interface PlacesIndicatorProps {
  restantes: number;
  total: number;
  className?: string;
}

/** Niveau de disponibilité d'une activité, utilisé pour la couleur et le libellé. */
export function getAvailability(restantes: number, total: number): "full" | "low" | "ok" {
  if (restantes <= 0) return "full";
  if (restantes <= Math.max(2, Math.ceil(total * 0.2))) return "low";
  return "ok";
}

/**
 * Jauge de remplissage d'une activité avec libellé textuel
 * (l'information n'est jamais transmise par la couleur seule).
 * La barre se remplit lorsqu'elle apparaît à l'écran.
 */
export function PlacesIndicator({ restantes, total, className }: PlacesIndicatorProps) {
  const availability = getAvailability(restantes, total);
  const ratio = total === 0 ? 1 : (total - restantes) / total;

  const label =
    availability === "full" ? "Complet" : `${restantes} place${restantes > 1 ? "s" : ""} libre${restantes > 1 ? "s" : ""}`;

  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between text-xs">
        <span
          className={cn(
            "font-extrabold tracking-wide uppercase",
            availability === "full" && "text-red-700",
            availability === "low" && "text-amber-700",
            availability === "ok" && "text-brand-700",
          )}
        >
          {label}
        </span>
        <span className="font-bold text-ink-subtle tabular-nums">
          {total - restantes}/{total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Taux de remplissage"
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <AnimatedBar
          value={ratio}
          className="h-3 rounded-full border-2 border-ink bg-card p-px"
          barClassName={cn(
            availability === "full" && "bg-sun",
            availability === "low" && "bg-amber-400",
            availability === "ok" && "bg-brand-500",
          )}
        />
      </div>
    </div>
  );
}
