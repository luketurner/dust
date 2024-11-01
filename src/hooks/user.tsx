import { User } from "@prisma/client";
import { createContext, useContext } from "react";

export interface UserContextData {
  user: User | null | undefined
}

const UserContext = createContext<UserContextData>({ user: null });

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children, user }: { children: React.ReactNode; user?: User | null; }) {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  )
}