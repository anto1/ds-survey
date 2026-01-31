import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const channels = [
  // UI/UX Design
  { name: "The Futur", url: "https://www.youtube.com/@thefutur" },
  { name: "Flux Academy", url: "https://www.youtube.com/@FluxAcademy" },
  { name: "DesignCourse", url: "https://www.youtube.com/@DesignCourse" },
  { name: "Figma", url: "https://www.youtube.com/@Figma" },
  { name: "Malewicz", url: "https://www.youtube.com/@MaszeID" },
  { name: "Jesse Showalter", url: "https://www.youtube.com/@JesseShowalter" },
  { name: "Mizko", url: "https://www.youtube.com/@Mizko" },
  { name: "AJ&Smart", url: "https://www.youtube.com/@AJSmart" },
  { name: "NNgroup", url: "https://www.youtube.com/@NNgroup" },
  { name: "Satori Graphics", url: "https://www.youtube.com/@SatoriGraphics" },
  { name: "Envato Tuts+", url: "https://www.youtube.com/@EnvatoTuts" },
  { name: "Will Paterson", url: "https://www.youtube.com/@WillPaterson" },
  { name: "CharliMarieTV", url: "https://www.youtube.com/@CharliMarieTV" },
  { name: "Cuberto Design", url: "https://www.youtube.com/@CubertoDesign" },
  { name: "Punit Chawla", url: "https://www.youtube.com/@PunitChawla" },

  // Motion & Animation
  { name: "Ben Marriott", url: "https://www.youtube.com/@BenMarriott" },
  { name: "School of Motion", url: "https://www.youtube.com/@SchoolofMotion" },
  { name: "Motion Design School", url: "https://www.youtube.com/@MotionDesignSchool" },
  { name: "ECAbrams", url: "https://www.youtube.com/@ECAbrams" },
  { name: "Dope Motions", url: "https://www.youtube.com/@DopeMotions" },

  // Brand & Identity
  { name: "The Brand Identity", url: "https://www.youtube.com/@TheBrandIdentity" },
  { name: "Logo Geek", url: "https://www.youtube.com/@LogoGeek" },
  { name: "Aaron Draplin", url: "https://www.youtube.com/@DraplinDesignCo" },
  { name: "Chris Do", url: "https://www.youtube.com/@thechrisdo" },

  // Web Design & Development
  { name: "Kevin Powell", url: "https://www.youtube.com/@KevinPowell" },
  { name: "Juxtopposed", url: "https://www.youtube.com/@juaborstudio" },
  { name: "Hyperplexed", url: "https://www.youtube.com/@Hyperplexed" },
  { name: "Fireship", url: "https://www.youtube.com/@Fireship" },
  { name: "Web Dev Simplified", url: "https://www.youtube.com/@WebDevSimplified" },
  { name: "Codrops", url: "https://www.youtube.com/@coaborstudio" },

  // 3D & Visual
  { name: "Blender Guru", url: "https://www.youtube.com/@blenderguru" },
  { name: "Ducky 3D", url: "https://www.youtube.com/@TheDucky3D" },
  { name: "Polygon Runway", url: "https://www.youtube.com/@PolygonRunway" },
  { name: "Derek Elliott", url: "https://www.youtube.com/@DerekElliott" },
  { name: "CG Cookie", url: "https://www.youtube.com/@CGCookie" },

  // Typography & Editorial
  { name: "TypeWolf", url: "https://www.youtube.com/@Typewolf" },
  { name: "Futur Academy", url: "https://www.youtube.com/@FuturAcademy" },

  // Product Design
  { name: "Vaexperience", url: "https://www.youtube.com/@vaexperience" },
  { name: "Rachel How", url: "https://www.youtube.com/@rachelhow" },
  { name: "Femke Design", url: "https://www.youtube.com/@femkedesign" },
  { name: "Caler Edwards", url: "https://www.youtube.com/@CalerEdwards" },
  { name: "Howard Pinsky", url: "https://www.youtube.com/@IceflowStudios" },

  // Creative Process & Inspiration
  { name: "Abstract: The Art of Design", url: null },
  { name: "Design Pilot", url: "https://www.youtube.com/@DesignPilot" },
  { name: "Mike Locke", url: "https://www.youtube.com/@MikeLockeDesign" },
  { name: "Pixel & Bracket", url: "https://www.youtube.com/@PixelAndBracket" },

  // Freelance & Business
  { name: "The Freelance Movement", url: "https://www.youtube.com/@FreelanceMovement" },
  { name: "Roberto Blake", url: "https://www.youtube.com/@RobertoBlake" },
  { name: "Ran Segall", url: "https://www.youtube.com/@RanSegall" },

  // Adobe & Tools
  { name: "Adobe Creative Cloud", url: "https://www.youtube.com/@AdobeCreativeCloud" },
  { name: "Dansky", url: "https://www.youtube.com/@Dansky" },
  { name: "Spoon Graphics", url: "https://www.youtube.com/@SpoonGraphics" },
  { name: "Yes I'm a Designer", url: "https://www.youtube.com/@YesImADesigner" },

  // Design Critique & Commentary
  { name: "Design Theory", url: "https://www.youtube.com/@DesignTheory" },
  { name: "Flux", url: "https://www.youtube.com/@FluxWithRanSegall" },
  { name: "Laith Wallace", url: "https://www.youtube.com/@LaithWallace" },

  // Illustration & Drawing
  { name: "Bam Animation", url: "https://www.youtube.com/@BamAnimation" },
  { name: "Art with Flo", url: "https://www.youtube.com/@ArtwithFlo" },
  { name: "Proko", url: "https://www.youtube.com/@Proko" },

  // Career & Growth
  { name: "Design with Canva", url: "https://www.youtube.com/@Canva" },
  { name: "Jeff Su", url: "https://www.youtube.com/@JeffSu" },
  { name: "Sara Dietschy", url: "https://www.youtube.com/@saradietschy" },

  // Newer / Emerging
  { name: "DesignerUp", url: "https://www.youtube.com/@DesignerUp" },
  { name: "Butter", url: "https://www.youtube.com/@butterdesign" },
  { name: "Chethan KVS", url: "https://www.youtube.com/@chethankvsdesign" },
  { name: "Design Buddy", url: "https://www.youtube.com/@DesignBuddy" },
];

async function main() {
  console.log("Seeding database...");

  // Clear existing channels
  await prisma.channel.deleteMany();

  // Insert channels
  for (const channel of channels) {
    await prisma.channel.create({
      data: {
        name: channel.name,
        slug: slugify(channel.name),
        youtubeUrl: channel.url,
        status: "approved",
      },
    });
  }

  console.log(`Seeded ${channels.length} channels`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
