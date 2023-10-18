import { getServerUserOrRedirect } from "@/models/auth"
import SettingsPageClient from "./client";
import { prisma } from "@/db/client";
import { gitConfigForClient } from "@/models/gitExportConfig";

export default async function SettingsPage() {
  const { user } = await getServerUserOrRedirect();

  const gitExportConfigs = await prisma.gitExportConfig.findMany({
    where: { userId: user.id },
    include: {
      exportAttempts: {
        orderBy: { startedAt: 'desc' },
        take: 10,
      }
    }
  });

  const clientConfigs = gitExportConfigs.map(config => gitConfigForClient(config));

  return (
    <SettingsPageClient user={user} gitExportConfigs={clientConfigs} />
  );
}