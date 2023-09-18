'use client';

import { signIn } from "next-auth/react"
import { Button } from "react-aria-components";

export default function LoginButton() {
  return (
    <Button className="p-2 rounded bg-slate-300" onPress={(e) => signIn('github')}>
      Log in with Github
    </Button>
  )
}