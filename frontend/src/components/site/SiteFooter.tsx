import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                CB
              </div>
              <span className="text-lg font-semibold text-foreground">CareerBridge</span>
            </div>
            <p className="mt-3 text-sm text-muted">
              Connecting students, graduates, and employers through opportunities.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">For Job Seekers</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <Link href="/jobs" className="hover:text-foreground">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-foreground">
                  Browse Companies
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground">
                  Create Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">For Employers</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <Link href="/register?role=employer" className="hover:text-foreground">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Employer Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <Link href="/" className="hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted">
          © {new Date().getFullYear()} CareerBridge. All rights reserved.
        </div>
      </div>
    </footer>
  );
}