import { getServerUser } from "@/auth"
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";

export default async function RootTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await getServerUser();

  return (
    <div className="container max-w-4xl">
      <main>
        {children}
      </main>
      <footer>
        Copyright Luke Turner 2023 -- <a href="https://github.com/luketurner/dust">github</a>
      </footer>
    </div>
  )
}