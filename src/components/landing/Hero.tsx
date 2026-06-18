import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary py-20 text-white sm:py-28">
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-accent blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white blur-3xl"
          aria-hidden
        />
      </div>
      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Find Your Next Opportunity
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 sm:text-xl">
          Internships, Attachments, Graduate Trainee Programs, and Full-Time Jobs
          from top employers — all in one place.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/jobs"
            className="w-full rounded-lg bg-white px-6 py-3 text-base font-semibold text-primary shadow-lg transition-transform hover:scale-105 sm:w-auto"
          >
            Find Jobs
          </Link>
          <Link
            href="/register?role=employer"
            className="w-full rounded-lg border-2 border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20 sm:w-auto"
          >
            Post a Job
          </Link>
        </div>
      </div>
    </section>
  );
}