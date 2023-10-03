import { getServerUserOrRedirect } from "@/auth"
import SettingsPageClient, { ClientGitExportConfig } from "./client";
import { prisma } from "@/db/client";

export default async function SettingsPage() {
  const { user } = await getServerUserOrRedirect();

  const gitExportConfig = await prisma.gitExportConfig.findFirst({
    where: { userId: user.id }
  });

  if (gitExportConfig?.sshPrivateKey) {
    delete gitExportConfig.sshPrivateKey;
    gitExportConfig.hasPrivateKey = true;
  }

  return (
    <SettingsPageClient user={user} gitExportConfig={gitExportConfig} />
  );
}