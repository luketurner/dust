import { getServerUser } from "@/auth"
import LoginButton from "@/components/LoginButton";
import { redirect } from "next/navigation";

export default async function IndexPage() {
  const { user } = await getServerUser();

  if (user) { redirect('/today'); }

  return (
    <div className="text-center">
      <h1 className="text-8xl mt-12 mb-8 font-thin text-orange-300">DUST</h1>
      <p className="mb-12">
        Task management for people that don't like tasks.
      </p>
      <div>
        <LoginButton />
      </div>
    </div>
  );
}