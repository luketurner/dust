import { getServerUserOrRedirect } from "@/models/auth"
import { DateTime } from 'luxon';
import { upsertAgendaServer } from "@/models/agenda";
import AgendaPageClient from "./client";
import { getDailyQuote } from "@/models/quote";
import { prisma } from "@/db/client";

export default async function AgendaPage() {
  const { user } = await getServerUserOrRedirect();

  const today = DateTime.now().setZone(user.timezone ?? 'utc').toISODate();
  if (!today) throw new Error('Sorry, this function only works on Earth');

  const quote = await getDailyQuote(today);

  const agenda = await upsertAgendaServer(user.id, today);

  const allTags = await prisma.tag.findMany({
    where: {
      userId: user.id,
    }
  });

  return (
    <AgendaPageClient user={user} allTags={allTags} date={today} agenda={agenda} quote={quote} />
  );
}