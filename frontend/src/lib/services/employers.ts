import { prisma } from "@/lib/prisma";

/**
 * Employer service. The EmployerProfile table is the canonical
 * company record; the User row is its owner.
 *
 * All admin moderation actions (verify, suspend) go through here so
 * the route handlers don't have to know about the join semantics.
 */
export const employersService = {
  async listAll() {
    return prisma.user.findMany({
      where: { role: "EMPLOYER" },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { employerProfile: true },
    });
  },

  async findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { employerProfile: true },
    });
  },

  async setVerified(userId: string, verified: boolean) {
    return prisma.employerProfile.upsert({
      where: { userId },
      create: {
        userId,
        companyName: "Company",
        verified,
        verifiedAt: verified ? new Date() : null,
      },
      update: {
        verified,
        verifiedAt: verified ? new Date() : null,
      },
    });
  },

  /**
   * Admin moderation action: update the employer profile and/or user
   * status, and emit a Notification for the user so they see the
   * change in their dashboard.
   */
  async moderate(
    userId: string,
    args: {
      verified?: boolean;
      status?: "ACTIVE" | "SUSPENDED";
    },
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employerProfile: true },
    });
    if (!user || user.role !== "EMPLOYER") return null;

    const verifiedChanged = typeof args.verified === "boolean";
    const statusChanged = args.status === "ACTIVE" || args.status === "SUSPENDED";
    if (!verifiedChanged && !statusChanged) return user;

    const notificationType: string | null = verifiedChanged
      ? args.verified
        ? "JOB_APPROVED"
        : "JOB_REJECTED"
      : "GENERIC";
    const notificationMessage: string = verifiedChanged
      ? args.verified
        ? "Your company has been verified on CareerBridge."
        : "Your company verification has been removed."
      : args.status === "SUSPENDED"
        ? "Your account has been suspended. Contact support to appeal."
        : "Your account has been reactivated.";
    const notificationTitle: string = verifiedChanged
      ? args.verified
        ? "Company verified"
        : "Verification removed"
      : "Account status changed";

    await prisma.$transaction(async (tx) => {
      if (verifiedChanged) {
        await tx.employerProfile.upsert({
          where: { userId },
          create: {
            userId,
            companyName: user.employerProfile?.companyName ?? user.fullName,
            verified: args.verified,
            verifiedAt: args.verified ? new Date() : null,
          },
          update: {
            verified: args.verified,
            verifiedAt: args.verified ? new Date() : null,
          },
        });
      }
      if (statusChanged) {
        await tx.user.update({
          where: { id: userId },
          data: { status: args.status },
        });
      }
      await tx.notification.create({
        data: {
          userId,
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
        },
      });
    });
    return user;
  },
};