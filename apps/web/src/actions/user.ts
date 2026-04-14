"use server";

import { getClient } from "@/lib/apollo/apollo-client";
import { UPDATE_PROFILE } from "@/lib/apollo/queries/user-mutations";
import { getServerAuthSession } from "@/auth";
import { revalidatePath } from "next/cache";

import { User } from "@/lib/apollo/types";

export async function updateProfile(formData: FormData) {
  const session = await getServerAuthSession();
  if (!session?.user) throw new Error("Unauthorized");

  const bio = formData.get("bio") as string;
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const profileColor = formData.get("profileColor") as string;
  const country = formData.get("country") as string;

  try {
    const { data: result } = await getClient().mutate<{ updateProfile: User }>({
      mutation: UPDATE_PROFILE,
      variables: {
        input: {
          bio,
          name,
          username,
          profileColor,
          country,
        },
      },
    });

    if (result?.updateProfile) {
      const updatedUsername = result.updateProfile.username;
      revalidatePath("/");
      revalidatePath(`/profile/${session.user.id}`);
      revalidatePath(`/profile/${updatedUsername}`);
      return { success: true, slug: updatedUsername };
    }

    return { success: false, errors: { username: "update.failed" } };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Username taken")) {
      return { success: false, errors: { username: "username.taken" } };
    }
    throw error;
  }
}
