import Link from "next/link";

export function AiAssistantCta() {
  return (
    <section className="bg-gradient-to-r from-primary to-secondary py-16 text-white">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
          Powered by AI
        </span>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Ask CareerBridge AI</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/80">
          &ldquo;How do I prepare for an internship interview?&rdquo; — get instant, tailored career
          advice from our AI assistant, available 24/7.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-sm text-white/70 sm:flex-row sm:gap-6">
          <p>&ldquo;How do I improve my CV?&rdquo;</p>
          <p>&ldquo;What skills do software companies need?&rdquo;</p>
        </div>
        <Link
          href="/dashboard/ai"
          className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-base font-semibold text-primary shadow-lg transition-transform hover:scale-105"
        >
          Open CareerBridge AI
        </Link>
      </div>
    </section>
  );
}