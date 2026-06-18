import { PrismaClient } from "@prisma/client";
async function main() {
  const p = new PrismaClient();
  const matches = await p.job.findMany({
    where: {
      OR: [
        { title: { contains: "engineer" } },
        { description: { contains: "engineer" } },
        { location: { contains: "engineer" } },
      ],
    },
    select: { title: true, employer: { select: { companyName: true } } },
  });
  console.log(JSON.stringify(matches, null, 2));
  await p.$disconnect();
}
main();
