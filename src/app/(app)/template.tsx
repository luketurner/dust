import { getServerUser } from "@/auth"
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default async function RootTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await getServerUser();

  return (
    <div className="container max-w-4xl">
      <nav className="flex flex-row flex-wrap">
        <a href="/" className="text-lg">DUST</a>
        <div className="flex-1"></div>
        {user ? <>
          <Link href="/manage" className="p-2 rounded bg-red-200 mr-2">
            Manage tasks
          </Link>
          <LogoutButton />
        </> : <>
          <LoginButton />
        </>}
      </nav>
      <main>
        {children}
      </main>
      <footer>
        Copyright Luke Turner 2023 -- <a href="https://github.com/luketurner/dust">github</a>
      </footer>
    </div>
  )
}