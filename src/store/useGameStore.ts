'use client';

import { create } from 'zustand';
import {
  gameReducer,
  type GameAction,
  type GameState,
  type LocationName,
  type NightPenaltyChoice,
  type Player,
} from '@/engine/gameEngine';
import { createInitialState } from '@/engine/setup';

interface GameStore {
  state: GameState;
  /** Ostatni komunikat błędu z silnika (null gdy akcja się powiodła). */
  lastError: string | null;

  /** Wygodny dostęp do aktualnie aktywnego gracza. */
  getActivePlayer: () => Player;

  /** Surowa metoda: wysyła dowolną akcję do reduktora. Zwraca czy się powiodła. */
  dispatch: (action: GameAction) => boolean;

  // Akcje-skróty wypełniające automatycznie id aktywnego gracza.
  movePlayer: (toLocation: LocationName, fieldsCount: number) => boolean;
  drawFromTable: (count: number) => boolean;
  drawFromBag: () => boolean;
  depositToBank: () => boolean;
  depositToRoom: () => boolean;
  withdrawFromRoom: (count: number) => boolean;
  buyRune: () => boolean;
  resolveNightPenalty: (choice: NightPenaltyChoice) => boolean;
  endTurn: () => boolean;

  clearError: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  const activePlayerId = (): string => {
    const { state } = get();
    return state.players[state.activePlayerIndex].id;
  };

  const dispatch = (action: GameAction): boolean => {
    const result = gameReducer(get().state, action);
    if (result.success) {
      set({ state: result.state, lastError: null });
      return true;
    }
    set({ lastError: result.error });
    return false;
  };

  return {
    state: createInitialState(),
    lastError: null,

    getActivePlayer: () => {
      const { state } = get();
      return state.players[state.activePlayerIndex];
    },

    dispatch,

    movePlayer: (toLocation, fieldsCount) =>
      dispatch({ type: 'MOVE_PLAYER', playerId: activePlayerId(), toLocation, fieldsCount }),

    drawFromTable: (count) =>
      dispatch({ type: 'DRAW_CRYSTAL_FROM_TABLE', playerId: activePlayerId(), count }),

    drawFromBag: () => dispatch({ type: 'DRAW_CRYSTAL_FROM_BAG', playerId: activePlayerId() }),

    depositToBank: () => dispatch({ type: 'DEPOSIT_TO_BANK', playerId: activePlayerId() }),

    depositToRoom: () => dispatch({ type: 'DEPOSIT_TO_ROOM', playerId: activePlayerId() }),

    withdrawFromRoom: (count) =>
      dispatch({ type: 'WITHDRAW_FROM_ROOM', playerId: activePlayerId(), count }),

    buyRune: () => dispatch({ type: 'BUY_RUNE', playerId: activePlayerId() }),

    resolveNightPenalty: (choice) =>
      dispatch({ type: 'RESOLVE_NIGHT_PENALTY', playerId: activePlayerId(), choice }),

    endTurn: () => dispatch({ type: 'END_TURN', playerId: activePlayerId() }),

    clearError: () => set({ lastError: null }),

    resetGame: () => set({ state: createInitialState(), lastError: null }),
  };
});
