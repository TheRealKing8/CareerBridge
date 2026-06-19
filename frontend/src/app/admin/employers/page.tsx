import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { EmployerRowActions } from "@/components/admin/EmployerRowActions";

/**
 * /admin/employers — employer verification + account-status queue.
 *
 * Lists all employer accounts. Admins can:
 *   - Toggle EmployerProfile.verified
 *   - Toggle User.status between ACTIVE and SUSPENDED
 *
 * The page uses real Prisma data; the action component talks to
 * `/api/admin/employers/[id]`. Both paths are admin-gated.
 */
export default async function AdminEmployersPage() {
  await requireRole(["ADMIN"]);

  const employers = await prisma.user.findMany({
    where: { role: "EMPLOYER" },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { employerProfile: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Employers</h1>
        <p className="mt-1 text-sm text-muted">
          Verify company profiles and manage account status.{" "}
          <Link
            href="/admin"
            className="text-primary hover:underline"
          >
            Back to overview
          </Link>
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {employers.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            No employer accounts yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Verified</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employers.map((e) => {
                  const verified = e.employerProfile?.verified ?? false;
                  return (
                    <tr key={e.id}>
                      <td className="px-4 py-3 font-medium">
                        {e.employerProfile?.companyName ?? e.fullName}
                      </td>
                      <td className="px-4 py-3 text-muted">{e.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            e.status === "SUSPENDED"
                              ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
                              : e.status === "PENDING"
                                ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                                : "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                          }
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {verified ? (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Verified
                          </span>
                        ) : (
                          <span className="text-xs text-muted">Unverified</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {e.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <EmployerRowActions
                          userId={e.id}
                          verified={verified}
                          status={e.status as "ACTIVE" | "PENDING" | "SUSPENDED"}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}