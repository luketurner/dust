'use client';

import { upsertAgendaAction } from "@/actions/agenda";
import { useRouter } from "next/navigation";

export default function GenerateAgendaButton({ date }: { date: string }) {
  const router = useRouter();
  return (
    <button onClick={async () => { await upsertAgendaAction(date); router.refresh(); }}>
      Generate Agenda
    </button>
  )
}