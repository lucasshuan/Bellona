import "dotenv/config";
import { db } from "@/server/db/client";
import { games } from "@/server/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const allGames = await db.select().from(games);
  console.log("All games in DB:", allGames);

  const g = await db
    .select()
    .from(games)
    .where(eq(games.slug, "superfighters-deluxe"));
  console.log("Matching game:", g);
}
main().catch(console.error);
