import { Dispatch, useCallback } from "react";
import { ImmerReducer, useImmerReducer } from "use-immer";
import { useIsEmbedded } from "./isEmbedded";

export type ServerReducer<A> = (action: A) => Promise<void | A>;

export interface Action {
  type: string;
}

export interface ServerErrorAction {
  type: 'server-error'
  failedAction: Action
  error: unknown
}

export function useClientServerReducer<S, A extends Action>(
  clientReducer: ImmerReducer<S, A | ServerErrorAction>,
  serverReducer: ServerReducer<A>,
  initialClientState: S
): [S, Dispatch<A | ServerErrorAction>] {
  const [clientState, clientDispatch] = useImmerReducer(clientReducer, initialClientState);
  const isEmbedded = useIsEmbedded();

  const serverDispatch = useCallback(async (action: A) => {
    try {
      const result = await serverReducer(action);
      if (result) {
        console.debug("[clientServerReducer] Server result dispatched", result);
        clientDispatch(result);
      }
    } catch (e) {
      console.debug("[clientServerReducer] Server error", action);
      clientDispatch({ type: 'server-error', failedAction: action, error: e })
    }

  }, [serverReducer, clientDispatch]);

  const dispatch = useCallback((action: A | ServerErrorAction) => {
    if (isEmbedded) return;
    console.debug("[clientServerReducer] Action dispatched", action);
    clientDispatch(action);
    if (action.type !== 'server-error') serverDispatch(action as A);
  }, [clientDispatch, serverDispatch, isEmbedded]);

  return [clientState, dispatch];
}