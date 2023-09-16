import Layout from "../components/layout"
import { signIn, signOut, useSession } from "next-auth/react"
import { auth } from "auth"
import { GetServerSidePropsContext } from "next";

export function getServerProps() {
  const { data: session } = useSession();
  return { session }
}

export default function IndexPage() {
  const { data: session } = useSession();
  return (
    <Layout>
      {session ? (
        <main className="text-center">
          <h1 className="text-4xl mt-4 mb-8">DUST</h1>
          <p className="mb-8">
            Hey, you're logged in! Noice.
          </p>
          <a href="/api/auth/signout" className="p-2 rounded bg-orange-200" onClick={(e) => { e.preventDefault(); signOut(); }}>
            Sign Out
          </a>
        </main>
      ) : (
        <main className="text-center">
          <h1 className="text-4xl mt-4 mb-8">DUST</h1>
          <p className="mb-8">
            Dust is a task management app.
          </p>
          <div>
            <a href="/api/auth/signin" className="p-2 rounded bg-orange-200" onClick={(e) => { e.preventDefault(); signIn(); }}>
              Log in / Sign Up
            </a>
          </div>
        </main>
      )}
    </Layout>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return { props: { session: await auth(context.req, context.res) } }
}