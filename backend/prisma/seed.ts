import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Starting seed...");

  // Create Skills (upsert to avoid duplicates)
  const frontend = await prisma.skill.upsert({
    where: { name: "Frontend" },
    update: {},
    create: { name: "Frontend" },
  });

  const backend = await prisma.skill.upsert({
    where: { name: "Backend" },
    update: {},
    create: { name: "Backend" },
  });

  console.log("✅ Skills created");

  // Create Developers with their skills (upsert to avoid duplicates)
  const alice = await prisma.developer.upsert({
    where: { name: "Alice" },
    update: {},
    create: {
      name: "Alice",
      skills: {
        connect: [{ id: frontend.id }],
      },
    },
  });

  const bob = await prisma.developer.upsert({
    where: { name: "Bob" },
    update: {},
    create: {
      name: "Bob",
      skills: {
        connect: [{ id: backend.id }],
      },
    },
  });

  const carol = await prisma.developer.upsert({
    where: { name: "Carol" },
    update: {},
    create: {
      name: "Carol",
      skills: {
        connect: [{ id: frontend.id }, { id: backend.id }],
      },
    },
  });

  const dave = await prisma.developer.upsert({
    where: { name: "Dave" },
    update: {},
    create: {
      name: "Dave",
      skills: {
        connect: [{ id: backend.id }],
      },
    },
  });

  console.log("✅ Developers created:");
  console.log(`   - Alice (Frontend)`);
  console.log(`   - Bob (Backend)`);
  console.log(`   - Carol (Frontend, Backend)`);
  console.log(`   - Dave (Backend)`);

  console.log("🌱 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
