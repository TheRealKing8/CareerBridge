import { z } from "zod";
import { COMMON_PASSWORDS } from "@/lib/common-passwords";

/**
 * Zod schemas for the API boundary.
 *
 * Strength notes (added in the post-quick-wins pass):
 *   - Passwords must include at least one letter and one digit, in
 *     addition to the length floor. Catches the bulk of automated
 *     password-spray attempts.
 *   - Common passwords are blocked outright, regardless of length
 *     ("Password123!" is still a bad password). Comparison is
 *     case-insensitive — the set is pre-lowercased.
 *   - All schemas that accept passwords use `passwordSchema` below so
 *     the rules stay in one place.
 */

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
export type LoginInput = z.infer<typeof loginSchema>;

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.")
  .refine((v) => /[A-Za-z]/.test(v), {
    message: "Password must include at least one letter.",
  })
  .refine((v) => /\d/.test(v), {
    message: "Password must include at least one number.",
  })
  .refine((v) => !COMMON_PASSWORDS.has(v.toLowerCase()), {
    message: "That password is too common. Try a more unique one.",
  });

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters.")
      .max(120, "Full name is too long."),
    email: z.string().email("Enter a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
    role: z.enum(["STUDENT", "EMPLOYER", "EMPLOYEE"], {
      message: "Choose Student, Employer, or Employee.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is missing."),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const jobCreateSchema = z.object({
  title: z.string().min(3, "Title is too short.").max(140, "Title is too long."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(8000, "Description is too long."),
  type: z.enum([
    "INTERNSHIP",
    "ATTACHMENT",
    "GRADUATE_TRAINEE",
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
  ]),
  location: z.string().max(140).optional().nullable(),
  remote: z.boolean().optional().default(false),
  salaryMin: z.number().int().nonnegative().optional().nullable(),
  salaryMax: z.number().int().nonnegative().optional().nullable(),
  salaryCurrency: z.string().length(3).optional().nullable(),
  deadline: z.coerce.date().optional().nullable(),
});
export type JobCreateInput = z.infer<typeof jobCreateSchema>;

/**
 * Employee profile update schema. Used by the future /dashboard/profile
 * form for EMPLOYEE users; mirrored server-side by the service layer.
 * All fields optional so partial PATCHes work.
 */
export const employeeProfileUpdateSchema = z.object({
  currentJobTitle: z.string().max(140).optional().nullable(),
  currentCompany: z.string().max(140).optional().nullable(),
  yearsOfExperience: z.number().int().min(0).max(70).optional().nullable(),
  skills: z.string().max(1000).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  cvUrl: z.string().url().max(500).optional().nullable(),
  linkedinUrl: z.string().url().max(500).optional().nullable(),
  githubUrl: z.string().url().max(500).optional().nullable(),
  portfolioUrl: z.string().url().max(500).optional().nullable(),
  location: z.string().max(140).optional().nullable(),
});
export type EmployeeProfileUpdateInput = z.infer<
  typeof employeeProfileUpdateSchema
>;

/**
 * Helper: format Zod's flat error map as `{ field: firstMessage }`.
 */
export function flattenZodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}