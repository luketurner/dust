import { getServerUserOrRedirect } from "@/auth"
import SettingsPageClient, { ClientGitExportConfig } from "./client";
import { prisma } from "@/db/client";

export default async function SettingsPage() {
  const { user } = await getServerUserOrRedirect();

  const gitExportConfigs = await prisma.gitExportConfig.findMany({
    where: { userId: user.id }
  });

  for (const config of gitExportConfigs) {
    if (config.sshPrivateKey) {
      delete config.sshPrivateKey;
      config.hasPrivateKey = true;
    }
  }

  return (
    <SettingsPageClient user={user} gitExportConfigs={gitExportConfigs} />
  );
}