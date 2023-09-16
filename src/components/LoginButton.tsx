'use client';

import { signIn } from "next-auth/react"

export default function LoginButton() {
  return (
  <a href="/api/auth/signin" className="p-2 rounded bg-orange-200" onClick={(e) => { e.preventDefault(); signIn(); }}>
    Log in / Sign Up
  </a>
  )
}