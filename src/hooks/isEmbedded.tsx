import { createContext, useContext } from "react";

const IsEmbeddedContext = createContext(false);

export function useIsEmbedded() {
  return useContext(IsEmbeddedContext);
}

export function Embedded({ children }: { children: React.ReactNode }) {
  return (
    <IsEmbeddedContext.Provider value={true}>
      {children}
    </IsEmbeddedContext.Provider>
  )
}