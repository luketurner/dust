import { getServerUser } from "@/auth"
import LoginButton from "@/components/LoginButton";
import { redirect } from "next/navigation";

export default async function IndexPage() {
  const { user } = await getServerUser();

  if (user) { redirect('/today'); }

  return (
    <main className="text-center">
      <h1 className="text-4xl mt-4 mb-8">DUST</h1>
      <p className="mb-8">
        Task management for people that don't like tasks.
      </p>
      <div>
        <LoginButton />
      </div>
    </main>
  );
}