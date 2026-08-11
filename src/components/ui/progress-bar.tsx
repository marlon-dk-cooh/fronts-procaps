import * as React from "react";

import { cn } from "@/utils/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Progreso 0-100. Si se omite, la barra se anima en modo indeterminado. */
  value?: number;
  /** Texto opcional mostrado sobre la barra (ej. "Pensando..."). */
  label?: string;
  /** Muestra el porcentaje numérico. Solo aplica cuando `value` está definido. */
  showValue?: boolean;
  size?: "sm" | "default" | "lg";
}

const sizeClasses: Record<NonNullable<ProgressBarProps["size"]>, string> = {
  sm: "h-1",
  default: "h-1.5",
  lg: "h-2.5",
};

/** Techo asintótico del avance simulado cuando no se conoce el progreso real. */
const AUTO_PROGRESS_CEILING = 92;
/** Controla qué tan rápido se acerca al techo (ms). Menor = más rápido. */
const AUTO_PROGRESS_SPEED = 3200;

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, label, showValue = false, size = "default", ...props }, ref) => {
    const isDeterminate = typeof value === "number" && !Number.isNaN(value);
    const clamped = isDeterminate ? Math.min(100, Math.max(0, value as number)) : 0;

    // Sin `value`: simula un avance continuo que se acerca a un techo sin
    // llegar nunca a 100%, para dar sensación de progreso real mientras dura la espera.
    const [autoProgress, setAutoProgress] = React.useState(0);

    React.useEffect(() => {
      if (isDeterminate) return;
      setAutoProgress(0);
      let frame: number;
      let start: number | null = null;

      const tick = (timestamp: number) => {
        if (start === null) start = timestamp;
        const elapsed = timestamp - start;
        const progress =
          AUTO_PROGRESS_CEILING * (1 - Math.exp(-elapsed / AUTO_PROGRESS_SPEED));
        setAutoProgress(progress);
        frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, [isDeterminate]);

    const width = isDeterminate ? clamped : autoProgress;

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {(label || (showValue && isDeterminate)) && (
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            {label && <span className="italic">{label}</span>}
            {showValue && isDeterminate && <span>{Math.round(clamped)}%</span>}
          </div>
        )}
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-muted",
            sizeClasses[size]
          )}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={isDeterminate ? clamped : undefined}
        >
          <div
            className={cn(
              "h-full rounded-full bg-primary",
              isDeterminate ? "transition-[width] duration-300 ease-out" : "transition-none"
            )}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
