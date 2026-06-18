import { PrismaClient } from "@prisma/client";
async function main() {
  const p = new PrismaClient();
  const intern = await p.job.findFirst({ where: { title: "Software Engineering Intern" } });
  const saf = await p.employerProfile.findFirst({ where: { companyName: "Safaricom PLC" } });
  console.log("INTERN=" + intern?.id);
  console.log("SAFARICOM=" + saf?.id);
  await p.$disconnect();
}
main();
