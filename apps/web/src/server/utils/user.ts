import { db } from "@/server/db";

/**
 * Generates a unique username based on a base string.
 * It appends a small random hash if the name is already taken.
 */
export async function generateUniqueUsername(base: string): Promise<string> {
  // Clean base name: remove special characters, spaces, and make lowercase
  let username = base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, "") // Remove non-alphanumeric
    .substring(0, 20); // Limit length

  if (!username) username = "user";

  let isUnique = false;
  let finalUsername = username;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const existing = await db.user.findFirst({
      where: {
        username: finalUsername,
      },
    });

    if (!existing) {
      isUnique = true;
    } else {
      // Append a small random string
      const suffix = Math.random().toString(36).substring(2, 6);
      finalUsername = `${username}${suffix}`.substring(0, 25);
      attempts++;
    }
  }

  // Fallback to a completely random one if we still can't find one (unlikely)
  if (!isUnique) {
    finalUsername = `user_${Math.random().toString(36).substring(2, 10)}`;
  }

  return finalUsername;
}
