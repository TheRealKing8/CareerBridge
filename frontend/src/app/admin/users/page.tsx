import Link from "next/link";
import { requireRole } from "@/lib/session";
import { usersService } from "@/lib/services/users";
import { USER_ROLES, type UserRole } from "@/lib/enums";
import { UserRowActions } from "@/components/admin/UserRowActions";
import { SearchInput } from "@/components/ui/SearchInput";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * /admin/users — all platform users, filterable by role, searchable by
 * name/email. Admins can:
 *   - Change a user's role (STUDENT / EMPLOYER / EMPLOYEE / ADMIN).
 *   - Suspend / reactivate accounts.
 *   - Delete a non-admin user (cascades to profile + applications).
 *
 * `?role=` filters to a single role; `?q=` does a case-sensitive
 * contains-match on name and email. Both are optional.
 *
 * Self-edits (role changes, self-suspend, self-delete) are disabled
 * in the row actions and re-checked in the API route as a defense
 * in depth — see /api/admin/users/[id].
 */
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const me = await requireRole(["ADMIN"]);
  const { role: roleParam, q } = await searchParams;

  const roleFilter: UserRole | undefined = (USER_ROLES as readonly string[]).includes(
    roleParam ?? "",
  )
    ? (roleParam as UserRole)
    : undefined;
  const trimmedQ = q?.trim() || undefined;

  const users = await usersService.list({
    role: roleFilter,
    q: trimmedQ,
    take: 200,
  });

  // Counts for the filter chips — total per role, ignoring the search
  // query so the chips always show "all students", "all employers", etc.
  const counts = await Promise.all(
    USER_ROLES.map(async (r) => ({
      role: r,
      count: await usersService.list({ role: r, take: 1000 }).then((rs) => rs.length),
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted">
          All platform users. Change role, suspend, or delete.
        </p>
      </div>

      {/* Role filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          href="/admin/users"
          label={`All (${counts.reduce((n, c) => n + c.count, 0)})`}
          active={!roleFilter}
        />
        {counts.map(({ role, count }) => (
          <FilterChip
            key={role}
            href={`/admin/users?role=${role}${trimmedQ ? `&q=${encodeURIComponent(trimmedQ)}` : ""}`}
            label={`${role} (${count})`}
            active={roleFilter === role}
          />
        ))}
      </div>

      {/* Search */}
      <form action="/admin/users" method="get" className="flex gap-2">
        {roleFilter ? (
          <input type="hidden" name="role" value={roleFilter} />
        ) : null}
        <SearchInput
          name="q"
          defaultValue={trimmedQ ?? ""}
          placeholder="Search by name or email…"
          className="flex-1"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          Search
        </button>
        {trimmedQ ? (
          <Link
            href={roleFilter ? `/admin/users?role=${roleFilter}` : "/admin/users"}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-card"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {users.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            No users match these filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Profile</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => {
                  const isSelf = u.id === me.id;
                  const profileLabel =
                    u.employerProfile?.companyName ??
                    u.employeeProfile?.currentCompany ??
                    (u.studentProfile?.university ?? "—");
                  return (
                    <tr key={u.id}>
                      <td className="px-4 py-3 font-medium">
                        {u.fullName}
                        {isSelf ? (
                          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            You
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-muted">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            u.role === "ADMIN"
                              ? "rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dash-dark:bg-purple-900/40 dash-dark:text-purple-200"
                              : u.role === "EMPLOYER"
                                ? "rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dash-dark:bg-blue-900/40 dash-dark:text-blue-200"
                                : u.role === "EMPLOYEE"
                                  ? "rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800 dash-dark:bg-teal-900/40 dash-dark:text-teal-200"
                                  : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800 dash-dark:bg-slate-800/60 dash-dark:text-slate-200"
                          }
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            u.status === "SUSPENDED"
                              ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dash-dark:bg-red-900/40 dash-dark:text-red-200"
                              : u.status === "PENDING"
                                ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dash-dark:bg-amber-900/40 dash-dark:text-amber-200"
                                : "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dash-dark:bg-green-900/40 dash-dark:text-green-200"
                          }
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {profileLabel}
                        {u.employerProfile?.verified ? (
                          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Verified
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {u.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <UserRowActions
                          userId={u.id}
                          currentRole={u.role as UserRole}
                          currentStatus={u.status as "ACTIVE" | "SUSPENDED" | "PENDING"}
                          isSelf={isSelf}
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

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-white"
          : "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition hover:bg-background"
      }
    >
      {label}
    </Link>
  );
}
