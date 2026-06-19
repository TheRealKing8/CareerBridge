/**
 * CareerBridge seed script.
 *
 * Idempotent: re-running this against an existing DB will print "already
 * seeded" and exit. The two parts of the seed are independent — admin
 * first (always), then sample data (only if the User table is empty).
 *
 * 1. ADMIN — created from environment variables:
 *      - SEED_ADMIN_EMAIL
 *      - SEED_ADMIN_PASSWORD
 *    Both are required; the script refuses to run if either is missing
 *    or the password is < 12 characters. This prevents accidentally
 *    creating a default admin someone forgets to change.
 *
 * 2. SAMPLE DATA — demo users, jobs, applications, notifications for
 *    populating dashboards during development. Every sample user gets
 *    the same password (`DemoPass1234!`) for convenience. Plain-text
 *    credentials are intentionally loud; do NOT run this against
 *    production.
 *
 * Run with: `npm run db:seed`
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Dev-only password for every seeded sample user. Logged at the end.
const DEMO_PASSWORD = "DemoPass1234!";

// ─────────────────────────────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────────────────────────────

async function seedAdmin(): Promise<"created" | "exists"> {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Refusing to seed admin: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env.",
    );
    process.exit(1);
  }
  if (password.length < 12) {
    console.error(
      "Refusing to seed admin: SEED_ADMIN_PASSWORD must be at least 12 characters.",
    );
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return "exists";

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName: "Admin",
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });
  console.log(`✓ Admin seeded: ${admin.email} (id=${admin.id})`);
  return "created";
}

// ─────────────────────────────────────────────────────────────────────
// Sample data
// ─────────────────────────────────────────────────────────────────────

type SeededUser = { id: string; email: string; role: string };

const SAMPLE_EMAILS = [
  "hr@acme.example",
  "jobs@lakehub.example",
  "jane@demo.careerbridge",
  "brian@demo.careerbridge",
  "aisha@demo.careerbridge",
  "emily@demo.careerbridge",
] as const;

async function seedSampleData(): Promise<"seeded" | "skipped"> {
  const existingSample = await prisma.user.count({
    where: { email: { in: [...SAMPLE_EMAILS] } },
  });
  if (existingSample > 0) {
    return "skipped";
  }

  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const result = await prisma.$transaction(async (tx) => {
    // 2 verified employers + profiles.
    const acme = await tx.user.create({
      data: {
        email: "hr@acme.example",
        passwordHash: demoHash,
        fullName: "Acme HR",
        role: "EMPLOYER",
        status: "ACTIVE",
        emailVerified: new Date(),
        employerProfile: {
          create: {
            companyName: "Acme Corp",
            companyWebsite: "https://acme.example",
            industry: "Software",
            companySize: "50-200",
            location: "Nairobi, Kenya",
            description: "Acme Corp builds developer tools used across East Africa.",
            verified: true,
            verifiedAt: new Date(),
          },
        },
      },
      select: { id: true, email: true },
    });

    const lakehub = await tx.user.create({
      data: {
        email: "jobs@lakehub.example",
        passwordHash: demoHash,
        fullName: "LakeHub Talent",
        role: "EMPLOYER",
        status: "ACTIVE",
        emailVerified: new Date(),
        employerProfile: {
          create: {
            companyName: "LakeHub",
            companyWebsite: "https://lakehub.example",
            industry: "Education",
            companySize: "10-50",
            location: "Kisumu, Kenya",
            description: "LakeHub runs tech training and placement programs for graduates.",
            verified: true,
            verifiedAt: new Date(),
          },
        },
      },
      select: { id: true, email: true },
    });

    // Fetch the employerProfile ids — needed for Job FK.
    const [acmeProfile, lakehubProfile] = await Promise.all([
      tx.employerProfile.findUniqueOrThrow({
        where: { userId: acme.id },
        select: { id: true },
      }),
      tx.employerProfile.findUniqueOrThrow({
        where: { userId: lakehub.id },
        select: { id: true },
      }),
    ]);

    // 3 students with profiles.
    const jane = await tx.user.create({
      data: {
        email: "jane@demo.careerbridge",
        passwordHash: demoHash,
        fullName: "Jane Wanjiku",
        role: "STUDENT",
        status: "ACTIVE",
        emailVerified: new Date(),
        studentProfile: {
          create: {
            university: "University of Nairobi",
            course: "BSc Computer Science",
            graduationYear: 2026,
            phone: "+254712000001",
            bio: "Backend-leaning full-stack developer; comfortable with TypeScript and Python.",
            cvUrl: "https://example.com/cv/jane.pdf",
            linkedinUrl: "https://linkedin.com/in/jane-demo",
            githubUrl: "https://github.com/jane-demo",
          },
        },
      },
      select: { id: true, email: true },
    });

    const brian = await tx.user.create({
      data: {
        email: "brian@demo.careerbridge",
        passwordHash: demoHash,
        fullName: "Brian Otieno",
        role: "STUDENT",
        status: "ACTIVE",
        emailVerified: new Date(),
        studentProfile: {
          create: {
            university: "Strathmore University",
            course: "BSc Informatics",
            graduationYear: 2025,
            phone: "+254712000002",
            bio: "Frontend engineer focused on React and design systems.",
            linkedinUrl: "https://linkedin.com/in/brian-demo",
            portfolioUrl: "https://brian-demo.example",
          },
        },
      },
      select: { id: true, email: true },
    });

    const aisha = await tx.user.create({
      data: {
        email: "aisha@demo.careerbridge",
        passwordHash: demoHash,
        fullName: "Aisha Mohammed",
        role: "STUDENT",
        status: "ACTIVE",
        emailVerified: new Date(),
        studentProfile: {
          create: {
            university: "Kenyatta University",
            course: "BSc Mathematics",
            graduationYear: 2027,
          },
        },
      },
      select: { id: true, email: true },
    });

    // 1 experienced employee with a populated profile.
    const emily = await tx.user.create({
      data: {
        email: "emily@demo.careerbridge",
        passwordHash: demoHash,
        fullName: "Emily Kariuki",
        role: "EMPLOYEE",
        status: "ACTIVE",
        emailVerified: new Date(),
        employeeProfile: {
          create: {
            currentJobTitle: "Mid-level Software Engineer",
            currentCompany: "Sailort Co",
            yearsOfExperience: 4,
            skills: "TypeScript, React, Node.js, PostgreSQL",
            phone: "+254712000003",
            bio: "Four years of full-stack experience; currently exploring rotational programs to broaden into product.",
            linkedinUrl: "https://linkedin.com/in/emily-demo",
            githubUrl: "https://github.com/emily-demo",
            location: "Nairobi, Kenya",
          },
        },
      },
      select: { id: true, email: true },
    });

    const janeProfile = await tx.studentProfile.findUniqueOrThrow({
      where: { userId: jane.id },
      select: { id: true },
    });
    const brianProfile = await tx.studentProfile.findUniqueOrThrow({
      where: { userId: brian.id },
      select: { id: true },
    });
    const aishaProfile = await tx.studentProfile.findUniqueOrThrow({
      where: { userId: aisha.id },
      select: { id: true },
    });
    const emilyProfile = await tx.employeeProfile.findUniqueOrThrow({
      where: { userId: emily.id },
      select: { id: true },
    });

    // 4 jobs across the type/status combos.
    const internshipOpen = await tx.job.create({
      data: {
        employerId: acmeProfile.id,
        title: "Backend Engineer Intern",
        description:
          "Six-month internship on the platform team. You'll work in TypeScript / Node.js, write Prisma migrations, and own a small feature end-to-end.",
        type: "INTERNSHIP",
        location: "Nairobi, Kenya",
        remote: false,
        salaryMin: 25000,
        salaryMax: 35000,
        salaryCurrency: "KES",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "OPEN",
        publishedAt: new Date(),
      },
      select: { id: true },
    });

    const gradTraineeOpen = await tx.job.create({
      data: {
        employerId: lakehubProfile.id,
        title: "Graduate Trainee — Software Engineering",
        description:
          "One-year rotational program for recent graduates. Three four-month rotations across product, infrastructure, and data.",
        type: "GRADUATE_TRAINEE",
        location: "Kisumu, Kenya",
        remote: true,
        salaryMin: 60000,
        salaryMax: 80000,
        salaryCurrency: "KES",
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: "OPEN",
        publishedAt: new Date(),
      },
      select: { id: true },
    });

    const draft = await tx.job.create({
      data: {
        employerId: acmeProfile.id,
        title: "Senior Frontend Engineer",
        description:
          "Lead our React + Next.js efforts. 5+ years experience required. This posting is a draft and not visible to students yet.",
        type: "FULL_TIME",
        location: "Nairobi, Kenya",
        remote: true,
        salaryMin: 250000,
        salaryMax: 350000,
        salaryCurrency: "KES",
        status: "DRAFT",
      },
      select: { id: true },
    });

    const closed = await tx.job.create({
      data: {
        employerId: lakehubProfile.id,
        title: "Data Analyst (Closed)",
        description:
          "Past posting kept around so the admin UI can show what 'CLOSED' looks like.",
        type: "CONTRACT",
        location: "Kisumu, Kenya",
        remote: false,
        salaryCurrency: "KES",
        status: "CLOSED",
        publishedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
      select: { id: true },
    });

    // 3 applications in different states.
    await tx.application.create({
      data: {
        jobId: internshipOpen.id,
        studentId: janeProfile.id,
        coverLetter:
          "I'm a final-year CS student and your internship description matches exactly what I want to learn.",
        status: "SUBMITTED",
      },
    });
    await tx.application.create({
      data: {
        jobId: internshipOpen.id,
        studentId: brianProfile.id,
        coverLetter:
          "Frontend-leaning but eager to learn backend. Have shipped two side projects in TypeScript.",
        status: "UNDER_REVIEW",
      },
    });
    await tx.application.create({
      data: {
        jobId: gradTraineeOpen.id,
        studentId: janeProfile.id,
        coverLetter: "The rotational structure is exactly what I'm looking for.",
        status: "SHORTLISTED",
      },
    });
    // 1 application from an EMPLOYEE applicant — exercises the new
    // Application.employeeProfileId column.
    await tx.application.create({
      data: {
        jobId: gradTraineeOpen.id,
        studentId: null,
        employeeProfileId: emilyProfile.id,
        coverLetter:
          "Experienced engineer looking for a structured rotational program. Excited about the three-track rotation model.",
        status: "UNDER_REVIEW",
      },
    });

    // 1 saved job (Brian saves the graduate trainee role).
    await tx.savedJob.create({
      data: {
        studentId: brianProfile.id,
        jobId: gradTraineeOpen.id,
      },
    });

    // 2 notifications — one read, one unread.
    await tx.notification.create({
      data: {
        userId: jane.id,
        type: "APPLICATION_STATUS",
        title: "You're shortlisted",
        message: "Acme Corp has shortlisted you for Backend Engineer Intern.",
        link: "/dashboard/applications",
      },
    });
    await tx.notification.create({
      data: {
        userId: acme.id,
        type: "NEW_APPLICANT",
        title: "New applicant",
        message: "Brian Otieno applied to Backend Engineer Intern.",
        link: "/employer/applicants",
        readAt: new Date(),
      },
    });

    // Touch unused vars so TS doesn't complain when nothing is wired.
    void aishaProfile;
    void aisha.id;
    void draft.id;
    void closed.id;

    return {
      users: [
        { email: acme.email, role: "EMPLOYER" },
        { email: lakehub.email, role: "EMPLOYER" },
        { email: jane.email, role: "STUDENT" },
        { email: brian.email, role: "STUDENT" },
        { email: aisha.email, role: "STUDENT" },
        { email: emily.email, role: "EMPLOYEE" },
      ] as SeededUser[],
    };
  });

  return "seeded";
}

function printCredentials(users: SeededUser[]) {
  console.log("");
  console.log("Sample data seeded. Sign in as any of these:");
  console.log("");
  console.log(`  ${"Email".padEnd(32)}  ${"Role".padEnd(10)}  Password`);
  console.log(`  ${"─".repeat(32)}  ${"─".repeat(10)}  ${"─".repeat(13)}`);
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "(missing SEED_ADMIN_EMAIL)";
  console.log(`  ${adminEmail.padEnd(32)}  ADMIN       (from env)`);
  for (const u of users) {
    console.log(`  ${u.email.padEnd(32)}  ${u.role.padEnd(10)}  ${DEMO_PASSWORD}`);
  }
  console.log("");
}

// ─────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("CareerBridge seed starting…");
  await seedAdmin();

  const sampleResult = await seedSampleData();
  if (sampleResult === "skipped") {
    console.log(
      "Sample data skipped — User table already has rows. Drop users first or run `npm run db:reset` if you want a fresh sample.",
    );
    return;
  }

  // Re-read the sample users for the credentials table.
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: [
          "hr@acme.example",
          "jobs@lakehub.example",
          "jane@demo.careerbridge",
          "brian@demo.careerbridge",
          "aisha@demo.careerbridge",
          "emily@demo.careerbridge",
        ],
      },
    },
    select: { email: true, role: true },
    orderBy: { role: "asc" },
  });
  printCredentials(users as SeededUser[]);
  console.log("✓ Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
