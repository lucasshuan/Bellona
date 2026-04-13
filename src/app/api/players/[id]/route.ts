import { db } from "@/server/db";
import { players, playerUsernames, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { formatDate } from "@/lib/date-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await db
      .select({
        player: players,
        accountName: users.name,
        accountUsername: users.username,
        accountImage: users.image,
      })
      .from(players)
      .leftJoin(users, eq(users.id, players.userId))
      .where(eq(players.id, id))
      .limit(1);

    if (!result[0]) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const { player, accountName, accountUsername, accountImage } = result[0];

    const usernames = await db
      .select()
      .from(playerUsernames)
      .where(eq(playerUsernames.playerId, id));

    return NextResponse.json({
      displayName: accountName || usernames[0]?.username || "Unknown Player",
      country: player.country,
      usernames: usernames.map((u) => u.username),
      joinedAt: formatDate(player.createdAt, "en"), // Simplified, could use locale from request
      avatarUrl: accountImage,
      accountName,
      accountUsername,
    });
  } catch (error) {
    console.error("Error fetching player hover data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
