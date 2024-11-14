import { createContext, useContext } from "react";

const IsEmbeddedContext = createContext(false);

/**
 * Hook returns true if the component is rendering inside a readonly display window.
 */
export function useIsEmbedded() {
  return useContext(IsEmbeddedContext);
}

/**
 * Use this component to wrap content that's embedded in a readonly display window.
 */
export function Embedded({ children }: { children: React.ReactNode }) {
  return (
    <IsEmbeddedContext.Provider value={true}>
      {children}
    </IsEmbeddedContext.Provider>
  )
}