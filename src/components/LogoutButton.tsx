'use client';

import { signOut } from "next-auth/react"

export default function LogoutButton() {
  return (
  <a href="/api/auth/signout" className="p-2 rounded bg-orange-200" onClick={(e) => { e.preventDefault(); signOut(); }}>
    Sign Out
  </a>
  )
}