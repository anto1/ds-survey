import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const channels = [
  // Дизайн-каналы
  { name: "Dear Designers", url: "https://www.youtube.com/@dear-designers" },
  { name: "Sort of Design", url: "https://www.youtube.com/@sortofdesign" },
  { name: "Filipp Grant", url: "https://www.youtube.com/@filippgrant" },
  { name: "Leo Naau", url: "https://www.youtube.com/@leonaau" },
  { name: "Bang Bang Education", url: "https://www.youtube.com/@bangbangeducation" },
  { name: "Werkstatt School", url: "https://www.youtube.com/@werkstatt.school" },

  // UI/UX и продуктовый дизайн
  { name: "Bonnie & Slide", url: "https://www.youtube.com/@bonnieandslide" },

  // Графический дизайн и айдентика
  { name: "Логомашина", url: "https://www.youtube.com/@logomachine" },
  { name: "Студия Лебедева", url: "https://www.youtube.com/@artlebedevstudio" },

  // Типографика и шрифты
  { name: "TypeType", url: "https://www.youtube.com/@typetype" },

  // Другие
  { name: "Design Workout", url: "https://www.youtube.com/@DesignWorkout" },
  { name: "Не о дизайне", url: "https://www.youtube.com/@notaboutdesign" },
];

async function main() {
  console.log("Seeding database...");

  let created = 0;
  let skipped = 0;

  for (const channel of channels) {
    const slug = slugify(channel.name);

    // Use upsert to avoid duplicates and preserve existing data
    const existing = await prisma.channel.findUnique({
      where: { slug },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.channel.create({
      data: {
        name: channel.name,
        slug,
        youtubeUrl: channel.url,
        status: "approved",
      },
    });
    created++;
  }

  console.log(`Seeded: ${created} new, ${skipped} existing`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
