import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INITIAL_PERMISSION_DEFINITIONS = [
  { key: "manage_games", name: "Manage Games" },
  { key: "manage_players", name: "Manage Players" },
  { key: "manage_rankings", name: "Manage Rankings" },
  { key: "manage_users", name: "Manage Users" }, // New permission added
] as const;

const GAMES_TO_SEED = [
  {
    name: "Superfighters Deluxe",
    slug: "superfighters-deluxe",
    description:
      "Superfighters Deluxe is a unique action game that combines brawling, shooting and platforming in dynamic sandboxy 2D levels. Lots of weapons and fun gameplay systems interlock to create absurd action-movie chaos.",
    thumbnailImageUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/855860/header.jpg?t=1774470652",
    backgroundImageUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/855860/ss_0f1d0d077ce556fc003e2f2cd330d0fb8ce8dd7c.1920x1080.jpg?t=1774470652",
    steamUrl: "https://store.steampowered.com/app/855860/Superfighters_Deluxe/",
  },
];

async function seedPermissions() {
  console.log("Seeding permissions...");
  for (const definition of INITIAL_PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { key: definition.key },
      update: { name: definition.name },
      create: {
        key: definition.key,
        name: definition.name,
      },
    });
  }
  console.log("Permissions seeded.");
}

async function seedGames() {
  console.log("Seeding games...");
  for (const game of GAMES_TO_SEED) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: {
        name: game.name,
        description: game.description,
        thumbnailImageUrl: game.thumbnailImageUrl,
        backgroundImageUrl: game.backgroundImageUrl,
        steamUrl: game.steamUrl,
      },
      create: {
        name: game.name,
        slug: game.slug,
        description: game.description,
        thumbnailImageUrl: game.thumbnailImageUrl,
        backgroundImageUrl: game.backgroundImageUrl,
        steamUrl: game.steamUrl,
      },
    });
  }
  console.log("Games seeded.");
}

async function main() {
  try {
    await seedPermissions();
    await seedGames();
    console.log("Seed completed successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
