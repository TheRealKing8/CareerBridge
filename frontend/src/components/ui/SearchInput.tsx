/**
 * SearchInput — a reusable text input with a magnifier icon and an
 * explicit `cursor-text` affordance so the field is obviously clickable
 * across the app (hero, jobs page, admin users page).
 *
 * Renders a plain `<input type="text">` inside a relative wrapper with
 * an absolutely-positioned SVG search icon. The wrapper applies
 * `cursor-text` to the input itself so the I-beam appears anywhere the
 * user clicks inside the field, even on the icon area.
 *
 * The component is intentionally unstyled at the wrapper level —
 * callers control border / background / sizing so the field matches
 * each context (transparent inside the hero search pill, card-coloured
 * on /jobs, panel-coloured in admin).
 */
interface SearchInputProps {
  name: string;
  placeholder: string;
  defaultValue?: string;
  className?: string;
  inputClassName?: string;
  /** Override the magnifier icon (rarely needed). */
  iconClassName?: string;
  ariaLabel?: string;
}

export function SearchInput({
  name,
  placeholder,
  defaultValue,
  className = "",
  inputClassName = "",
  iconClassName = "",
  ariaLabel,
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Magnifier — sits inside the field on the left. `pointer-events-none`
          so clicks fall through to the input, keeping the whole row a
          single hit-target. */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted ${iconClassName}`}
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>

      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        // `cursor-text` is the explicit affordance: a text-selection I-beam
        // anywhere inside the field, so users know they can click to type.
        className={`w-full cursor-text rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none ${inputClassName}`}
      />
    </div>
  );
}