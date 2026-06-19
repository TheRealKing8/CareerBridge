/**
 * Layout for the `(auth)` route group — `/login` and `/register`.
 *
 * Wraps the page in a centered column with a soft background. No
 * `SiteHeader` / `SiteFooter` / `ChatWidget` — those live in the root
 * layout and we still get the chat widget here (that's intentional:
 * users should be able to ask the AI for help signing in).
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 sm:py-20">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}