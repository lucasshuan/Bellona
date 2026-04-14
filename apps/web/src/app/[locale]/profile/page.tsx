import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/auth";

export default async function ProfileRedirectPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/");
  }

  const target = session.user.username || session.user.id;
  redirect(`/profile/${target}`);
}
