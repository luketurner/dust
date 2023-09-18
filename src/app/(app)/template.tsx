import { getServerUser } from "@/auth"
import Footer from "@/components/Footer";
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
    <div className="container max-w-4xl m-auto">
      <nav className="flex flex-row flex-wrap mb-2">
        <a href="/" className="text-lg p-2 rounded hover:bg-slate-300">DUST</a>
        <div className="flex-1"></div>
        {user ? <>
          <Link href="/today" className="p-2 rounded hover:bg-slate-300 mr-2">
            Today
          </Link>
          <Link href="/manage" className="p-2 rounded hover:bg-slate-300 mr-2">
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
      <Footer />
    </div>
  )
}