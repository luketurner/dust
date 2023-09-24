import { getServerUserOrRedirect } from "@/auth"
import { DateTime } from 'luxon';
import { notFound, redirect } from "next/navigation";
import { findAgendaServer, upsertAgendaServer } from "@/agenda";
import AgendaPageClient from "./client";

interface AgendaPageProps {
  params: { date: string }
}

export default async function AgendaPage({ params: { date } }: AgendaPageProps) {
  const { user } = await getServerUserOrRedirect();

  let today = DateTime.now();

  let parsedDate: DateTime;
  if (date === 'today') {
    parsedDate = today;
  } else {
    parsedDate = DateTime.fromFormat(date, 'yyyy-MM-dd');
  }

  if (!parsedDate.isValid) { return notFound(); }

  const canonicalDate = parsedDate.toISODate();

  if (!canonicalDate) { return notFound(); }

  const isToday = canonicalDate === today.toISODate();
  if (isToday && date !== 'today') { return redirect('/today'); }

  let agenda;
  if (isToday) {
    agenda = await upsertAgendaServer(user.id, canonicalDate);
  } else {
    // don't eagerly generate agendas for other days
    agenda = await findAgendaServer(user.id, canonicalDate);
  }

  return (
    <AgendaPageClient date={canonicalDate} agenda={agenda} />
  );
}