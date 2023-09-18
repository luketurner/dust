'use client';

import { signIn } from "next-auth/react"
import { Button } from "react-aria-components";

export default function LoginButton() {
  return (
    <Button className="p-3 rounded bg-orange-200 hover:bg-orange-300" onPress={(e) => signIn('github')}>
      Log in with Github
    </Button>
  )
}