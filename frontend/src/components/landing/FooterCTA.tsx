import Link from "next/link";

/**
 * Bottom-of-landing CTA strip. Two buttons: one for job seekers,
 * one for employers.
 */
export function FooterCTA() {
  return (
    <section className="bg-primary py-16 text-primary-foreground sm:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to find your next role?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-primary-foreground/90 sm:text-lg">
          Create a free profile in under two minutes. Apply to verified
          opportunities, track every application, and get hired faster.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-card"
          >
            Get started — it&apos;s free
          </Link>
          <Link
            href="/register?role=employer"
            className="inline-flex items-center justify-center rounded-lg border border-primary-foreground/30 bg-transparent px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
          >
            Post a job
          </Link>
        </div>
      </div>
    </section>
  );
}
