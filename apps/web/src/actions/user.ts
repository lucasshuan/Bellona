"use server";

import { getClient } from "@/lib/apollo/apollo-client";
import { UPDATE_PROFILE } from "@/lib/apollo/queries/user-mutations";
import { getServerAuthSession } from "@/auth";
import { revalidatePath } from "next/cache";

import { UpdateProfileMutation } from "@/lib/apollo/generated/graphql";
import { normalizeOptionalText } from "@/lib/utils";

import { createSafeAction } from "@/lib/action-utils";

export const updateProfile = createSafeAction(
  "updateProfile",
  async (formData: FormData) => {
    const session = await getServerAuthSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const data = {
      name: (formData.get("name") as string).trim(),
      username: (formData.get("username") as string).trim(),
      bio: normalizeOptionalText(formData.get("bio") as string),
      profileColor: formData.get("profileColor") as string,
      country: normalizeOptionalText(formData.get("country") as string),
    };

    const { data: result } = await getClient().mutate<UpdateProfileMutation>({
      mutation: UPDATE_PROFILE,
      variables: { input: data },
    });

    if (result?.updateProfile) {
      const updatedUsername = result.updateProfile.username;
      revalidatePath("/");
      revalidatePath(`/profile/${session.user.id}`);
      revalidatePath(`/profile/${updatedUsername}`);
      return updatedUsername;
    }

    throw new Error("update.failed");
  },
);
