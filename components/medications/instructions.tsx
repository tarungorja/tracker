import { cn } from "@/lib/utils";

/**
 * Render the free-text instruction string into readable, structured markup.
 * Recognises ALL-CAPS section headings and "•" bullet lines.
 */
export function Instructions({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const lines = text.split("\n");

  return (
    <div className={cn("space-y-1", className)}>
      {lines.map((raw, i) => {
        const line = raw.trim();
        if (line === "") return <div key={i} className="h-1.5" />;

        const isBullet = line.startsWith("•");
        const isHeading = /^[A-Z][A-Z\s]+$/.test(line) && line.length < 40;

        if (isHeading) {
          return (
            <p
              key={i}
              className="pt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              {line}
            </p>
          );
        }
        if (isBullet) {
          return (
            <p key={i} className="flex gap-1.5 pl-1 text-sm text-foreground/80">
              <span className="text-primary">•</span>
              <span>{line.replace(/^•\s*/, "")}</span>
            </p>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-foreground/80">
            {line}
          </p>
        );
      })}
    </div>
  );
}
