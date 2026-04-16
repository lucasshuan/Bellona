"use server";

import { getClient } from "@/lib/apollo/apollo-client";
import { UPDATE_PROFILE } from "@/lib/apollo/queries/user-mutations";
import { GET_USER } from "@/lib/apollo/queries/user";
import { getServerAuthSession } from "@/auth";
import { revalidatePath } from "next/cache";

import {
  GetUserQuery,
  UpdateProfileMutation,
} from "@/lib/apollo/generated/graphql";
import { normalizeOptionalText } from "@/lib/utils";

import { createSafeAction } from "@/lib/action-utils";

export const checkUsernameAvailability = createSafeAction(
  "checkUsernameAvailability",
  async (username: string, currentUserId?: string) => {
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername) {
      return { available: true };
    }

    const { data } = await getClient().query<GetUserQuery>({
      query: GET_USER,
      variables: { username: normalizedUsername },
      fetchPolicy: "network-only",
    });

    return {
      available: !data?.user || data.user.id === currentUserId,
    };
  },
);

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
