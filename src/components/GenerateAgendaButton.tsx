'use client';

import { upsertAgenda } from "@/actions/agenda";
import { useRouter } from "next/navigation";
import { Button } from "react-aria-components";

export default function GenerateAgendaButton({ date }: { date: string }) {
  const router = useRouter();
  return (
    <Button onPress={async () => { await upsertAgenda(date); router.refresh(); }}>
      Generate Agenda
    </Button>
  )
}