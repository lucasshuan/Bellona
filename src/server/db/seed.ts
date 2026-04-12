import "dotenv/config";

import { db } from "@/server/db/client";
import { games, INITIAL_PERMISSION_DEFINITIONS, permissions } from "@/server/db/schema";

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
