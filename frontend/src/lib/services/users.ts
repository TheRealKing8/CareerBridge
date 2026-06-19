import { prisma } from "@/lib/prisma";
import { USER_ROLES, type UserRole } from "@/lib/enums";

/**
 * User service — all read/write paths for the User table that aren't
 * authentication concerns live here. Auth lives in `./auth.ts`.
 */
export const usersService = {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        employerProfile: true,
        employeeProfile: true,
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async listLatest(limit = 10) {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  },

  /**
   * Admin-only user search. Pass a role to filter to that role only.
   * `q` is matched (case-insensitive) against fullName and email.
   */
  async list({
    role,
    q,
    take = 100,
  }: {
    role?: UserRole;
    q?: string;
    take?: number;
  } = {}) {
    return prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(q
          ? {
              OR: [
                { fullName: { contains: q } },
                { email: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
      take,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        studentProfile: { select: { university: true } },
        employerProfile: { select: { companyName: true, verified: true } },
        employeeProfile: { select: { currentCompany: true } },
      },
    });
  },

  async setStatus(id: string, status: "ACTIVE" | "SUSPENDED" | "PENDING") {
    return prisma.user.update({ where: { id }, data: { status } });
  },

  async setRole(id: string, role: UserRole) {
    return prisma.user.update({ where: { id }, data: { role } });
  },

  /**
   * Delete a user and all their data. Cascading FKs handle the profiles
   * and applications. ADMIN users cannot be deleted via this path —
   * the API guards against that to keep at least one admin in the DB.
   */
  async delete(id: string) {
    const target = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });
    if (!target) return { deleted: false, reason: "not_found" as const };
    if (target.role === "ADMIN") {
      return { deleted: false, reason: "is_admin" as const };
    }
    await prisma.user.delete({ where: { id } });
    return { deleted: true as const };
  },
};

export { USER_ROLES };
export type { UserRole };
export type UserWithProfiles = NonNullable<
  Awaited<ReturnType<typeof usersService.findById>>
>;
export type ListedUser = NonNullable<
  Awaited<ReturnType<typeof usersService.list>>[number]
>;