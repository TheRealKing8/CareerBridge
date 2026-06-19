import { prisma } from "@/lib/prisma";
import type { JobCreateInput } from "@/lib/validators";

/**
 * Jobs service. Wraps Prisma access for the Job table.
 *
 * State transitions (approve / close / reopen) live here as well so
 * the route handlers don't have to enforce them.
 */
export const jobsService = {
  async listOpen(filters: {
    q?: string;
    type?: string;
    skip?: number;
    take?: number;
  }) {
    const where: {
      status: string;
      type?: string;
      OR?: Array<Record<string, { contains: string }>>;
    } = { status: "OPEN" };
    if (filters.type) where.type = filters.type;
    if (filters.q && filters.q.trim()) {
      where.OR = [
        { title: { contains: filters.q.trim() } },
        { description: { contains: filters.q.trim() } },
        { location: { contains: filters.q.trim() } },
      ];
    }
    return prisma.job.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: filters.skip ?? 0,
      take: filters.take ?? 12,
      include: { employer: { select: { companyName: true } } },
    });
  },

  async countOpen(filters: { q?: string; type?: string }) {
    const where: { status: string; type?: string; OR?: Array<Record<string, { contains: string }>> } = {
      status: "OPEN",
    };
    if (filters.type) where.type = filters.type;
    if (filters.q && filters.q.trim()) {
      where.OR = [
        { title: { contains: filters.q.trim() } },
        { description: { contains: filters.q.trim() } },
        { location: { contains: filters.q.trim() } },
      ];
    }
    return prisma.job.count({ where });
  },

  async findOpenById(id: string) {
    return prisma.job.findUnique({
      where: { id },
      include: {
        employer: { include: { user: { select: { fullName: true, email: true } } } },
      },
    });
  },

  async listAll(status?: "DRAFT" | "OPEN" | "CLOSED" | "EXPIRED") {
    return prisma.job.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      include: { employer: true },
    });
  },

  async findById(id: string) {
    return prisma.job.findUnique({ where: { id } });
  },

  async listForEmployer(employerProfileId: string) {
    return prisma.job.findMany({
      where: { employerId: employerProfileId },
      include: { _count: { select: { applications: true } } },
      orderBy: { publishedAt: "desc" },
    });
  },

  /**
   * Create a new job for an employer profile. Always starts in
   * DRAFT — admins approve via `transitionStatus`.
   */
  async create(employerProfileId: string, input: JobCreateInput) {
    return prisma.job.create({
      data: {
        employerId: employerProfileId,
        title: input.title,
        description: input.description,
        type: input.type,
        location: input.location ?? null,
        remote: input.remote ?? false,
        salaryMin: input.salaryMin ?? null,
        salaryMax: input.salaryMax ?? null,
        salaryCurrency: input.salaryCurrency ?? "KES",
        deadline: input.deadline ?? null,
        status: "DRAFT",
      },
    });
  },

  /**
   * State machine for admin moderation. Returns the resulting job,
   * or null when the transition isn't valid.
   */
  async transitionStatus(
    id: string,
    action: "approve" | "close" | "reopen",
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return { ok: false, error: "Job not found." };
    switch (action) {
      case "approve":
        if (job.status !== "DRAFT") {
          return {
            ok: false,
            error: `Cannot approve a job in status ${job.status}.`,
          };
        }
        await prisma.job.update({
          where: { id },
          data: { status: "OPEN", publishedAt: new Date() },
        });
        return { ok: true };
      case "close":
        if (job.status !== "OPEN") {
          return {
            ok: false,
            error: `Cannot close a job in status ${job.status}.`,
          };
        }
        await prisma.job.update({ where: { id }, data: { status: "CLOSED" } });
        return { ok: true };
      case "reopen":
        if (job.status !== "CLOSED") {
          return {
            ok: false,
            error: `Cannot reopen a job in status ${job.status}.`,
          };
        }
        await prisma.job.update({ where: { id }, data: { status: "OPEN" } });
        return { ok: true };
    }
  },

  async delete(id: string) {
    return prisma.job.delete({ where: { id } });
  },

  async countByStatus() {
    const [open, draft, expired] = await Promise.all([
      prisma.job.count({ where: { status: "OPEN" } }),
      prisma.job.count({ where: { status: "DRAFT" } }),
      prisma.job.count({ where: { status: "EXPIRED" } }),
    ]);
    return { open, draft, expired };
  },
};
