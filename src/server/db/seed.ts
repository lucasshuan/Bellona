import "dotenv/config";

import { db } from "@/server/db/client";
import {
  games,
  INITIAL_PERMISSION_DEFINITIONS,
  permissions,
} from "@/server/db/schema";

const GAMES_TO_SEED = [
  {
    name: "Superfighters Deluxe",
    slug: "superfighters-deluxe",
    description:
      "A fast-paced, pixel-art fighting game with tons of weapons and gameplay variety.",
    thumbnailImageUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/855860/header.jpg?t=1774470652",
    backgroundImageUrl:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/855860/ss_0f1d0d077ce556fc003e2f2cd330d0fb8ce8dd7c.1920x1080.jpg?t=1774470652",
    steamUrl: "https://store.steampowered.com/app/855860/Superfighters_Deluxe/",
  },
];

async function seedGames() {
  for (const game of GAMES_TO_SEED) {
    await db
      .insert(games)
      .values(game)
      .onConflictDoNothing({
        target: [games.name],
      });

    console.log(`Game seeded: ${game.name}`);
  }
}

async function seedPermissionsForGames() {
  const gameList = await db
    .select({
      id: games.id,
      name: games.name,
    })
    .from(games);

  if (gameList.length === 0) {
    console.log("No games found. Skipping permission seeding.");
    return;
  }

  for (const game of gameList) {
    await db
      .insert(permissions)
      .values(
        INITIAL_PERMISSION_DEFINITIONS.map((definition) => ({
          gameId: game.id,
          key: definition.key,
          name: definition.name,
        })),
      )
      .onConflictDoNothing({
        target: [permissions.gameId, permissions.key],
      });

    console.log(`Permissions seeded for game: ${game.name}`);
  }
}

async function main() {
  await seedGames();
  await seedPermissionsForGames();
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
