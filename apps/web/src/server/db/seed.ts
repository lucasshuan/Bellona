import "dotenv/config";

import { db } from "@/server/db/client";
import { INITIAL_PERMISSION_DEFINITIONS } from "@ares/core";

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

async function seedGames() {
  for (const game of GAMES_TO_SEED) {
    await db.game.upsert({
      where: { name: game.name },
      update: {},
      create: game,
    });

    console.log(`Game seeded: ${game.name}`);
  }
}

async function seedPermissions() {
  for (const definition of INITIAL_PERMISSION_DEFINITIONS) {
    await db.permission.upsert({
      where: { key: definition.key },
      update: {},
      create: {
        key: definition.key,
        name: definition.name,
      },
    });
  }

  console.log("Global permissions seeded.");
}

async function main() {
  await seedGames();
  await seedPermissions();
}

main()
  .then(async () => {
    console.log("Seed completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed.", error);
    process.exit(1);
  });
