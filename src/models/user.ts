import { prisma } from "@/db/client";

export async function allUsersReport() {
  return `Users: ${await prisma.user.count()}, Accounts: ${await prisma.account.count()}, Sessions: ${await prisma.session.count()}, Tasks: ${await prisma.task.count()}, GitExportConfigs: ${await prisma.gitExportConfig.count()}`;
}