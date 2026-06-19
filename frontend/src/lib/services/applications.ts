import { prisma } from "@/lib/prisma";

/**
 * Applications service.
 *
 * Application state machine (mirror of `enums.ts`):
 *   SUBMITTED → UNDER_REVIEW → SHORTLISTED → REJECTED
 *            ↘ WITHDRAWN (terminal, initiated by the student)
 *
 * The `Application` table has two nullable profile FKs (`studentId`
 * for STUDENT applicants, `employeeProfileId` for EMPLOYEE applicants).
 * The `apply()` function is the single chokepoint that enforces the
 * "exactly one of these is set" rule; downstream readers can branch
 * on which FK is non-null.
 */

export type Applicant =
  | { kind: "STUDENT"; profileId: string }
  | { kind: "EMPLOYEE"; profileId: string };

export const applicationsService = {
  async apply(args: {
    applicant: Applicant;
    jobId: string;
    coverLetter?: string;
    cvUrl?: string;
  }) {
    const data: {
      jobId: string;
      coverLetter?: string;
      cvUrl?: string;
      studentId?: string;
      employeeProfileId?: string;
    } = {
      jobId: args.jobId,
      coverLetter: args.coverLetter,
      cvUrl: args.cvUrl,
    };
    if (args.applicant.kind === "STUDENT") {
      data.studentId = args.applicant.profileId;
    } else {
      data.employeeProfileId = args.applicant.profileId;
    }
    return prisma.application.create({ data });
  },

  /**
   * Lookup used by the dashboard overview: find all applications for
   * a profile regardless of which kind of applicant it is. Use this
   * when the caller already has the user id; pass it to `prisma` via
   * a relational filter.
   */
  async listForUser(userId: string, limit?: number) {
    return prisma.application.findMany({
      where: {
        OR: [
          { student: { userId } },
          { employeeProfile: { userId } },
        ],
      },
      include: { job: { include: { employer: true } } },
      orderBy: { appliedAt: "desc" },
      take: limit,
    });
  },

  async countForUser(userId: string) {
    return prisma.application.count({
      where: {
        OR: [
          { student: { userId } },
          { employeeProfile: { userId } },
        ],
      },
    });
  },

  /**
   * Direct lookup by a specific profile id. Prefer `listForUser` for
   * dashboard-side reads; these are kept for the employer-side flows
   * that already have a typed profile id.
   */
  async listForStudent(studentProfileId: string, limit?: number) {
    return prisma.application.findMany({
      where: { studentId: studentProfileId },
      include: { job: { include: { employer: true } } },
      orderBy: { appliedAt: "desc" },
      take: limit,
    });
  },

  async countForStudent(studentProfileId: string) {
    return prisma.application.count({ where: { studentId: studentProfileId } });
  },

  async listForEmployee(employeeProfileId: string, limit?: number) {
    return prisma.application.findMany({
      where: { employeeProfileId },
      include: { job: { include: { employer: true } } },
      orderBy: { appliedAt: "desc" },
      take: limit,
    });
  },

  async countForEmployee(employeeProfileId: string) {
    return prisma.application.count({
      where: { employeeProfileId },
    });
  },

  async listForEmployer(employerProfileId: string, limit?: number) {
    return prisma.application.findMany({
      where: { job: { employerId: employerProfileId } },
      include: {
        job: true,
        student: { include: { user: true } },
        employeeProfile: { include: { user: true } },
      },
      orderBy: { appliedAt: "desc" },
      take: limit,
    });
  },

  async setStatus(
    id: string,
    status:
      | "SUBMITTED"
      | "UNDER_REVIEW"
      | "SHORTLISTED"
      | "REJECTED"
      | "WITHDRAWN",
  ) {
    return prisma.application.update({ where: { id }, data: { status } });
  },

  async withdraw(id: string) {
    return prisma.application.update({
      where: { id },
      data: { status: "WITHDRAWN" },
    });
  },

  async count() {
    return prisma.application.count();
  },
};