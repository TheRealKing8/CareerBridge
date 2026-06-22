/**
 * 3-step "How it works" strip on the landing page.
 * Pure presentation — no I/O, no client JS.
 */
const STEPS = [
  {
    number: "1",
    title: "Browse verified listings",
    blurb:
      "Internships, attachments, graduate programs, and full-time roles — all from employers we've verified.",
  },
  {
    number: "2",
    title: "Apply with one click",
    blurb:
      "Your profile, education, and CV are attached automatically. Track every application from your dashboard.",
  },
  {
    number: "3",
    title: "Land the role",
    blurb:
      "Get notified when employers respond. Message them directly, accept offers, and start your career.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            How CareerBridge works
          </h2>
          <p className="mt-2 text-muted">
            From discovery to your first day — in three steps.
          </p>
        </div>

        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <li
              key={s.number}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
                {s.number}
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{s.blurb}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
