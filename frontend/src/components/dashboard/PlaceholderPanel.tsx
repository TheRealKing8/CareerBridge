/**
 * Shared "Coming in Phase 2c" placeholder card.
 *
 * Each dashboard's sub-pages render this with a short description
 * of what will live there. Keeps the placeholders consistent without
 * copy-pasting the same JSX across 14+ files.
 */
export function PlaceholderPanel({
  title,
  description,
  phase = "Phase 2c",
}: {
  title: string;
  description: string;
  phase?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 shadow-sm">
      <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
        {phase}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">{description}</p>
      <p className="mt-6 text-xs text-muted">
        For now, this page exists only so the navigation links in your
        dashboard go somewhere. The full UI lands in the next phase.
      </p>
    </div>
  );
}