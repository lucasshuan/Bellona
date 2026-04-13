"use server";

import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getServerAuthSession();
  if (!session?.user) throw new Error("Unauthorized");

  const bio = formData.get("bio") as string;
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;

  const errors: { username?: string; name?: string } = {};

  if (username) {
    const existingUsername = await db.query.users.findFirst({
      where: and(eq(users.username, username), ne(users.id, session.user.id)),
    });
    if (existingUsername) {
      errors.username = "usernameTaken";
    }
  }

  if (name) {
    const existingName = await db.query.users.findFirst({
      where: and(eq(users.name, name), ne(users.id, session.user.id)),
    });
    if (existingName) {
      errors.name = "nameTaken";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  await db
    .update(users)
    .set({
      bio,
      name,
      username,
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/");
  revalidatePath(`/profile/${session.user.id}`);
  revalidatePath(`/profile/${username}`);
  
  return { success: true, slug: username };
}
