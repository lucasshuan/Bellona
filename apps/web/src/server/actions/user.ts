"use server";

import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getServerAuthSession();
  if (!session?.user) throw new Error("Unauthorized");

  const bio = formData.get("bio") as string;
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;

  const profileColor = formData.get("profileColor") as string;
  const country = formData.get("country") as string;

  const errors: { username?: string; name?: string } = {};

  if (username) {
    const existingUsername = await db.user.findFirst({
      where: {
        username: username,
        id: { not: session.user.id },
      },
    });
    if (existingUsername) {
      errors.username = "username.taken";
    }
  }

  if (name) {
    const existingName = await db.user.findFirst({
      where: {
        name: name,
        id: { not: session.user.id },
      },
    });
    if (existingName) {
      errors.name = "name.taken";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  await db.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      bio,
      name,
      username,
      profileColor,
      country,
    },
  });

  revalidatePath("/");
  revalidatePath(`/profile/${session.user.id}`);
  revalidatePath(`/profile/${username}`);

  return { success: true, slug: username };
}
