import { getServerUser } from "@/models/auth";
import ManualPageClient from "./client";

export default async function ManualPage() {
  const { user } = await getServerUser();
  return (
    <ManualPageClient user={user} />
  );
}