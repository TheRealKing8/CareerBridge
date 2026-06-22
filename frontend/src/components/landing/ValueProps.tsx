/**
 * 3-column value-prop strip. Pure presentation.
 */
const VALUES = [
  {
    title: "Verified employers",
    blurb:
      "Every company on CareerBridge is reviewed by our admin team before they can post. No scams, no spam — just real opportunities.",
  },
  {
    title: "Built for East Africa",
    blurb:
      "We focus on the East African job market: local salary bands, regional employers, and the qualifications they actually look for.",
  },
  {
    title: "Free for job seekers",
    blurb:
      "Students, graduates, and experienced candidates never pay. Sign up, build a profile, and apply to as many roles as you want.",
  },
] as const;

export function ValueProps() {
  return (
    <section className="bg-card/50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Why CareerBridge
          </h2>
          <p className="mt-2 text-muted">
            A platform built for the way hiring actually works here.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-border bg-background p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-foreground">
                {v.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{v.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
