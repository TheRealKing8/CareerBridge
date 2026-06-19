// DEV ONLY — these accounts have a real password (`password123`) so the
// auth flow can be tested end-to-end with `npm run seed && sign in`.
// Do NOT reuse this seed in any non-dev environment: real users would
// inherit the same password and the world would burn.
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DEV_PASSWORD = "password123";
const DEV_HASH = bcrypt.hashSync(DEV_PASSWORD, 12);

async function main() {
  // Clear in dependency order
  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.job.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  // Students
  const alice = await prisma.user.create({
    data: {
      email: "alice@student.test",
      passwordHash: DEV_HASH,
      fullName: "Alice Wanjiku",
      role: "STUDENT",
      status: "ACTIVE",
      studentProfile: {
        create: {
          university: "University of Nairobi",
          course: "BSc Computer Science",
          graduationYear: 2026,
        },
      },
    },
  });

  // Admin — one seed account so manual admin flow can be tested.
  await prisma.user.create({
    data: {
      email: "admin@careerbridge.test",
      passwordHash: DEV_HASH,
      fullName: "Platform Admin",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // Employers (one verified, one pending)
  const safaricom = await prisma.user.create({
    data: {
      email: "jobs@safaricom.test",
      passwordHash: DEV_HASH,
      fullName: "Jane Achieng",
      role: "EMPLOYER",
      status: "ACTIVE",
      employerProfile: {
        create: {
          companyName: "Safaricom PLC",
          industry: "Telecommunications",
          companyWebsite: "https://safaricom.co.ke",
          companyLogoUrl: null,
          location: "Nairobi, Kenya",
          description:
            "Safaricom is Kenya's largest mobile network operator, home of M-Pesa. We connect over 40 million customers and invest in the next generation of African tech talent.",
          verified: true,
          verifiedAt: new Date(),
        },
      },
    },
    include: { employerProfile: true },
  });

  const equity = await prisma.user.create({
    data: {
      email: "hr@equity-bank.test",
      passwordHash: DEV_HASH,
      fullName: "Peter Mwangi",
      role: "EMPLOYER",
      status: "ACTIVE",
      employerProfile: {
        create: {
          companyName: "Equity Bank",
          industry: "Banking & Finance",
          companyWebsite: "https://equitybank.co.ke",
          location: "Nairobi, Kenya",
          description:
            "Equity Bank is one of Africa's largest financial inclusion success stories, with operations in Kenya, Uganda, Tanzania, Rwanda, and beyond.",
          verified: true,
          verifiedAt: new Date(),
        },
      },
    },
    include: { employerProfile: true },
  });

  const craft = await prisma.user.create({
    data: {
      email: "careers@craft-silicon.test",
      passwordHash: DEV_HASH,
      fullName: "Susan Otieno",
      role: "EMPLOYER",
      status: "ACTIVE",
      employerProfile: {
        create: {
          companyName: "Craft Silicon",
          industry: "Fintech Software",
          companyWebsite: "https://craftsilicon.com",
          location: "Nairobi, Kenya",
          description:
            "Craft Silicon builds banking and microfinance software for emerging markets, serving 200+ institutions across Africa and Asia.",
          verified: true,
          verifiedAt: new Date(),
        },
      },
    },
    include: { employerProfile: true },
  });

  const twiga = await prisma.user.create({
    data: {
      email: "people@twiga-foods.test",
      passwordHash: DEV_HASH,
      fullName: "David Kiprop",
      role: "EMPLOYER",
      status: "ACTIVE",
      employerProfile: {
        create: {
          companyName: "Twiga Foods",
          industry: "Agritech & Logistics",
          companyWebsite: "https://twiga.com",
          location: "Nairobi, Kenya",
          description:
            "Twiga Foods is a B2B food distribution platform connecting smallholder farmers with urban retailers across Kenya.",
          verified: true,
          verifiedAt: new Date(),
        },
      },
    },
    include: { employerProfile: true },
  });

  // Jobs
  const jobs = [
    {
      employerId: safaricom.employerProfile!.id,
      title: "Software Engineering Intern",
      type: "INTERNSHIP",
      location: "Nairobi, Kenya",
      remote: false,
      salaryMin: 25000,
      salaryMax: 40000,
      salaryCurrency: "KES",
      description:
        "Join Safaricom's digital products team for a 3-month internship. You'll work on real production code alongside senior engineers building the next generation of M-Pesa services.\n\nResponsibilities:\n- Build features in React/Node.js\n- Write tests and documentation\n- Participate in code reviews and team standups\n\nRequirements:\n- 3rd or 4th year CS / SE student\n- Solid foundation in JavaScript and at least one backend language\n- Eagerness to learn",
      status: "OPEN",
      publishedAt: new Date(),
    },
    {
      employerId: safaricom.employerProfile!.id,
      title: "Graduate Trainee â€” Data Analytics",
      type: "GRADUATE_TRAINEE",
      location: "Nairobi, Kenya",
      remote: false,
      salaryMin: 80000,
      salaryMax: 120000,
      salaryCurrency: "KES",
      description:
        "A 12-month structured graduate program for fresh analytics talent. Rotations across Customer Insights, Fraud Detection, and Network Analytics.\n\nYou will learn:\n- SQL and Python at scale\n- Tableau / Power BI dashboarding\n- Statistical modeling and A/B testing",
      status: "OPEN",
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      employerId: equity.employerProfile!.id,
      title: "Frontend Developer (React, TypeScript)",
      type: "FULL_TIME",
      location: "Nairobi, Kenya",
      remote: true,
      salaryMin: 180000,
      salaryMax: 280000,
      salaryCurrency: "KES",
      description:
        "Help us rebuild our digital banking experience from the ground up. Equity's mobile and web apps serve millions of customers â€” quality matters.\n\nYou'll have:\n- A modern React + TypeScript stack\n- Direct collaboration with design and product\n- A culture that ships incrementally",
      status: "OPEN",
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      employerId: equity.employerProfile!.id,
      title: "Risk & Compliance Analyst â€” Attachment",
      type: "ATTACHMENT",
      location: "Nairobi, Kenya",
      remote: false,
      salaryMin: 15000,
      salaryMax: 25000,
      salaryCurrency: "KES",
      description:
        "2-month industrial attachment for university students. Work with the Risk team on KYC reviews, transaction monitoring, and regulatory reporting.",
      status: "OPEN",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      employerId: craft.employerProfile!.id,
      title: "Backend Engineer (Java / Spring Boot)",
      type: "FULL_TIME",
      location: "Nairobi, Kenya",
      remote: false,
      salaryMin: 200000,
      salaryMax: 350000,
      salaryCurrency: "KES",
      description:
        "Craft Silicon's core banking platform is built in Java. Join a 30-person engineering team maintaining and extending systems used by 200+ banks across Africa and Asia.",
      status: "OPEN",
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      employerId: craft.employerProfile!.id,
      title: "Product Designer (Part-Time Contract)",
      type: "PART_TIME",
      location: "Remote",
      remote: true,
      salaryMin: 50000,
      salaryMax: 80000,
      salaryCurrency: "KES",
      description:
        "Own the design of a new mobile loan officer app. We're looking for someone who can take a feature from rough sketch to high-fidelity prototype in Figma, then work with engineers through implementation.",
      status: "OPEN",
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      employerId: twiga.employerProfile!.id,
      title: "Data Science Intern",
      type: "INTERNSHIP",
      location: "Nairobi, Kenya",
      remote: false,
      salaryMin: 30000,
      salaryMax: 50000,
      salaryCurrency: "KES",
      description:
        "Work with Twiga's Data Science team on demand forecasting, route optimization, and supplier scoring models. Python, pandas, and a bit of ML are the daily tools.",
      status: "OPEN",
      publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      employerId: twiga.employerProfile!.id,
      title: "Operations Associate â€” Contract (6 months)",
      type: "CONTRACT",
      location: "Nairobi, Kenya",
      remote: false,
      salaryMin: 60000,
      salaryMax: 90000,
      salaryCurrency: "KES",
      description:
        "Support our B2B sales team in matching farmer supply to vendor demand. The role is hands-on, fast-paced, and central to Twiga's mission of reducing food waste in African supply chains.",
      status: "OPEN",
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const j of jobs) {
    await prisma.job.create({ data: j });
  }

  // One CLOSED job to test that filter
  await prisma.job.create({
    data: {
      employerId: safaricom.employerProfile!.id,
      title: "Marketing Coordinator (Closed)",
      type: "FULL_TIME",
      location: "Nairobi, Kenya",
      remote: false,
      salaryMin: 100000,
      salaryMax: 150000,
      salaryCurrency: "KES",
      description: "This position has been filled.",
      status: "CLOSED",
      publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  });

  // A saved job and an application for Alice
  const aliceProfile = await prisma.studentProfile.findUnique({
    where: { userId: alice.id },
  });
  const aliceIntern = await prisma.job.findFirst({
    where: { title: "Software Engineering Intern" },
  });
  if (aliceProfile && aliceIntern) {
    await prisma.savedJob.create({
      data: { studentId: aliceProfile.id, jobId: aliceIntern.id },
    });
    await prisma.application.create({
      data: {
        studentId: aliceProfile.id,
        jobId: aliceIntern.id,
        status: "UNDER_REVIEW",
        coverLetter: "Excited to apply for the Safaricom internshipâ€¦",
      },
    });
    await prisma.notification.create({
      data: {
        userId: alice.id,
        type: "APPLICATION_STATUS",
        title: "Application received",
        message: "Your application for Software Engineering Intern at Safaricom PLC is under review.",
      },
    });
  }

  console.log("✅ Seed complete:");
  console.log(`  - 1 student (Alice)`);
  console.log("  - 4 verified employers");
  console.log("  - 1 admin (platform owner)");
  console.log("  - 8 OPEN jobs + 1 CLOSED job");
  console.log("  - 1 saved job, 1 application, 1 notification");
  console.log("");
  console.log(`🔑 DEV test password for ALL seeded accounts: ${DEV_PASSWORD}`);
  console.log("   Sign in at /login with any of:");
  console.log("     - alice@student.test          (STUDENT)");
  console.log("     - jobs@safaricom.test        (EMPLOYER)");
  console.log("     - hr@equity-bank.test        (EMPLOYER)");
  console.log("     - careers@craft-silicon.test (EMPLOYER)");
  console.log("     - people@twiga-foods.test    (EMPLOYER)");
  console.log("     - admin@careerbridge.test    (ADMIN)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
