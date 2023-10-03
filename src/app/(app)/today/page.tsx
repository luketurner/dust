import { getServerUserOrRedirect } from "@/auth"
import { DateTime } from 'luxon';
import { upsertAgendaServer } from "@/agenda";
import AgendaPageClient from "./client";
import { getDailyQuote } from "@/quote";
import { prisma } from "@/db/client";

export default async function AgendaPage() {
  const { user } = await getServerUserOrRedirect();

  const today = DateTime.now().toISODate();
  if (!today) throw new Error('Sorry, this function only works on Earth');

  const quote = await getDailyQuote(today);

  const agenda = await upsertAgendaServer(user.id, today);

  const allTags = await prisma.tag.findMany({
    where: {
      userId: user.id,
    }
  });

  return (
    <AgendaPageClient allTags={allTags} date={today} agenda={agenda} quote={quote} />
  );
}