import { getServerUser } from "@/auth"
import Footer from "@/components/Footer";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";

export default async function RootTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await getServerUser();

  return (
    <div className="container max-w-4xl m-auto">
      <main>
        {children}
      </main>
      <Footer />
    </div>
  )
}