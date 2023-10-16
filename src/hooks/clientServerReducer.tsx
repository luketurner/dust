import { Dispatch, useCallback } from "react";
import { ImmerReducer, useImmerReducer } from "use-immer";
import { useIsEmbedded } from "./isEmbedded";

export type ServerReducer<A> = (action: A) => Promise<void | A>;
export type EffectReducer<A> = (action: A) => Promise<void | A>;

export interface Action {
  type: string;
}

export interface ServerErrorAction {
  type: 'server-error'
  failedAction: Action
  error: unknown
}

export interface EffectErrorAction {
  type: 'effect-error'
  failedAction: Action
  error: unknown
}

export function useClientServerReducer<S, A extends Action>(
  stateReducer: ImmerReducer<S, A | ServerErrorAction | EffectErrorAction>,
  effectReducer: EffectReducer<A | ServerErrorAction | EffectErrorAction>,
  serverReducer: ServerReducer<A | ServerErrorAction | EffectErrorAction>,
  initialClientState: S
): [S, Dispatch<A | ServerErrorAction | EffectErrorAction>] {
  const [clientState, stateDispatch] = useImmerReducer(stateReducer, initialClientState);
  const isEmbedded = useIsEmbedded();
  let dispatch: (action: A | ServerErrorAction | EffectErrorAction) => void = () => {};

  const serverDispatch = useCallback(async (action: A | ServerErrorAction | EffectErrorAction) => {
    try {
      const result = await serverReducer(action);
      if (result) {
        console.debug("[clientServerReducer] Server result dispatched", result);
        dispatch(result);
      }
    } catch (e) {
      console.debug("[clientServerReducer] Server error", action);
      dispatch({ type: 'server-error', failedAction: action, error: e })
    }

  }, [serverReducer, dispatch]);

  const effectDispatch = useCallback(async (action: A | ServerErrorAction | EffectErrorAction) => {
    try {
      const result = await effectReducer(action);
      if (result) {
        console.debug("[clientServerReducer] Effect result dispatched", result);
        dispatch(result);
      }
    } catch (e) {
      console.debug("[clientServerReducer] Effect error", action);
      dispatch({ type: 'effect-error', failedAction: action, error: e })
    }

  }, [effectReducer, dispatch]);

  dispatch = useCallback((action: A | ServerErrorAction | EffectErrorAction) => {
    if (isEmbedded) return;
    console.debug("[clientServerReducer] Action dispatched", action);
    stateDispatch(action);
    effectDispatch(action);
    serverDispatch(action);
  }, [stateDispatch, serverDispatch, effectDispatch, isEmbedded]);

  return [clientState, dispatch];
}