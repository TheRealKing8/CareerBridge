/**
 * Single source of truth for the string-typed enum columns.
 *
 * The SQLite Prisma connector does not support `enum` blocks, so each
 * constrained column is typed as `String` in `prisma/schema.prisma`
 * and validated at the application boundary with these constants.
 *
 * Usage at the API layer (Zod, later):
 *   z.enum(USER_ROLES)
 *   z.enum(JOB_TYPES)
 *
 * When we move to PostgreSQL, these constants can be replaced by
 * Prisma-generated `enum` imports without changing call sites.
 */

export const USER_ROLES = ["STUDENT", "EMPLOYER", "EMPLOYEE", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["PENDING", "ACTIVE", "SUSPENDED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const JOB_TYPES = [
  "INTERNSHIP",
  "ATTACHMENT",
  "GRADUATE_TRAINEE",
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const JOB_STATUSES = ["DRAFT", "OPEN", "CLOSED", "EXPIRED"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const APPLICATION_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "REJECTED",
  "WITHDRAWN",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  "APPLICATION_STATUS",
  "NEW_APPLICANT",
  "JOB_APPROVED",
  "JOB_REJECTED",
  "GENERIC",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];