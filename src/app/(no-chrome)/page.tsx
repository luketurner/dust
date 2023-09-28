import { getServerUser } from "@/auth"
import { getDailyQuote } from "@/quote";
import { DateTime } from "luxon";
import { redirect } from "next/navigation";
import IndexPageClient from "./client";

export default async function IndexPage() {
  const { user } = await getServerUser();

  if (user) { redirect('/today'); }

  const quote = await getDailyQuote(DateTime.now().toISODate()!);

  return (
    <IndexPageClient quote={quote} />
  );
}