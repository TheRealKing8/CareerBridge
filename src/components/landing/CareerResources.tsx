interface Resource {
  slug: string;
  title: string;
  blurb: string;
  tag: string;
}

const RESOURCES: Resource[] = [
  {
    slug: "cv-writing",
    title: "CV Writing",
    blurb: "Craft a CV that lands interviews — structure, keywords, and the 6-second scan.",
    tag: "Guide",
  },
  {
    slug: "interview-prep",
    title: "Interview Preparation",
    blurb: "Behavioral questions, technical rounds, and how to close the loop with recruiters.",
    tag: "Playbook",
  },
  {
    slug: "career-growth",
    title: "Career Growth",
    blurb: "From first job to senior — building a portfolio, finding mentors, and asking for promotions.",
    tag: "Long read",
  },
];

export function CareerResources() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Career Resources</h2>
        <p className="mt-1 text-muted">Practical advice from people who&apos;ve hired and been hired.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {RESOURCES.map((r) => (
          <article
            key={r.slug}
            className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary"
          >
            <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {r.tag}
            </span>
            <h3 className="mt-3 text-lg font-semibold text-foreground">{r.title}</h3>
            <p className="mt-2 text-sm text-muted">{r.blurb}</p>
          </article>
        ))}
      </div>
    </section>
  );
}