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
  { name: "Leona Au", url: "https://www.youtube.com/@leonaau" },
  { name: "Bang Bang Education", url: "https://www.youtube.com/@bangbangeducation" },
  { name: "Werkstatt School", url: "https://www.youtube.com/@werkstatt.school" },

  // UI/UX и продуктовый дизайн
  { name: "Дизайн Кабак", url: "https://www.youtube.com/@designkabak" },
  { name: "Илья Сидоренко", url: "https://www.youtube.com/@ilyasidorenko" },
  { name: "Дима Малишевский", url: "https://www.youtube.com/@malyshevsky" },
  { name: "Саша Окунев", url: "https://www.youtube.com/@sashaokunevdesign" },
  { name: "Bonnie & Slide", url: "https://www.youtube.com/@bonnieandslide" },
  { name: "Контур.Школа", url: "https://www.youtube.com/@konaborturschool" },

  // Графический дизайн и айдентика
  { name: "Логомашина", url: "https://www.youtube.com/@logomachine" },
  { name: "Студия Лебедева", url: "https://www.youtube.com/@artlebedevstudio" },
  { name: "Дизайн-село", url: "https://www.youtube.com/@designselo" },
  { name: "Вадим Паясь", url: "https://www.youtube.com/@vadimpyas" },

  // Моушн и анимация
  { name: "VideoSmile", url: "https://www.youtube.com/@videosmile" },
  { name: "Хохлов Сабатовский", url: "https://www.youtube.com/@khokhlovsabatovskiy" },

  // 3D и визуализация
  { name: "CG Fish", url: "https://www.youtube.com/@cgfish" },
  { name: "Артём Солоухин", url: "https://www.youtube.com/@artyomsolukhin" },

  // Типографика и шрифты
  { name: "Юрий Гордон", url: "https://www.youtube.com/@yurigordon" },
  { name: "TypeType", url: "https://www.youtube.com/@typetype" },

  // Веб-дизайн и разработка
  { name: "Фрилансер по жизни", url: "https://www.youtube.com/@freelancerlife" },
  { name: "Вастрик", url: "https://www.youtube.com/@vastrik" },

  // Креатив и брендинг
  { name: "SETTERS", url: "https://www.youtube.com/@setters" },
  { name: "QMARKETING", url: "https://www.youtube.com/@qmarketing" },

  // Образование и карьера
  { name: "Skillbox Дизайн", url: "https://www.youtube.com/@skillboxdesign" },
  { name: "Нетология", url: "https://www.youtube.com/@netaborlogy" },
  { name: "Яндекс Практикум", url: "https://www.youtube.com/@yaborandexpraktikum" },
  { name: "GeekBrains", url: "https://www.youtube.com/@geekbrains" },
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
