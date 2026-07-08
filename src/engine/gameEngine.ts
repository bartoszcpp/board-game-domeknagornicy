export type CrystalColor = 'żółty' | 'czerwony' | 'niebieski' | 'zielony';
export type GamePhase = 'Poranek' | 'Dzień' | 'Zmierzch' | 'Noc';
export type CharacterName = 'Strażnik' | 'Badacz' | 'Wędrowiec';
export type LocationName = 'DOMEK' | 'LASEK' | 'PALENISKO' | 'ALTANA' | 'WZGÓRZE' | 'GRANICA';

export interface Player {
  id: string;
  characterName: CharacterName;
  pa: number;
  backpack: CrystalColor[];
  runes: LocationName[];
  cardsInHand: string[];
  currentLocation: LocationName;
}

export interface BoardState {
  banks: Record<LocationName, CrystalColor[]>;
  cabinTable: CrystalColor[];
  bag: CrystalColor[];
}

export interface GameState {
  currentTurn: number;
  currentHour: number;
  phase: GamePhase;
  players: Player[];
  activePlayerIndex: number;
  board: BoardState;
  isGameOver: boolean;
}

export type GameAction =
  | { type: 'MOVE_PLAYER'; playerId: string; toLocation: LocationName; fieldsCount: number }
  | { type: 'DRAW_CRYSTAL_FROM_TABLE'; playerId: string; count: number }
  | { type: 'DRAW_CRYSTAL_FROM_BAG'; playerId: string }
  | { type: 'END_TURN'; playerId: string };

export type EngineResult = 
  | { success: true; state: GameState }
  | { success: false; error: string };

export function getPhaseByHour(hour: number): GamePhase {
  if (hour >= 8 && hour <= 12) return 'Poranek';
  if (hour >= 13 && hour <= 18) return 'Dzień';
  if (hour >= 19 && hour <= 24) return 'Zmierzch';
  return 'Noc';
}

export function isBackpackHeavy(player: Player): boolean {
  if (player.characterName === 'Strażnik') return false;
  return player.backpack.length > 2;
}

export function calculateMoveCost(player: Player, fieldsCount: number): number {
  return fieldsCount * (isBackpackHeavy(player) ? 2 : 1);
}

export function refillCabinTable(board: BoardState, playerCount: number): BoardState {
  const newBag = [...board.bag];
  const drawnCrystals: CrystalColor[] = [];

  for (let i = 0; i < playerCount; i++) {
    if (newBag.length > 0) {
      drawnCrystals.push(newBag.pop()!);
    }
  }

  return {
    ...board,
    bag: newBag,
    cabinTable: [...board.cabinTable, ...drawnCrystals]
  };
}

export function gameReducer(state: GameState, action: GameAction): EngineResult {
  if (state.isGameOver) {
    return { success: false, error: 'Gra została już zakończona.' };
  }

  const activePlayer = state.players[state.activePlayerIndex];

  if (activePlayer.id !== action.playerId) {
    return { success: false, error: 'To nie jest tura tego gracza.' };
  }

  switch (action.type) {
    case 'MOVE_PLAYER': {
      const requiredPA = calculateMoveCost(activePlayer, action.fieldsCount);

      if (activePlayer.pa < requiredPA) {
        return { success: false, error: `Niewystarczająca liczba PA. Wymagane: ${requiredPA}, Posiadane: ${activePlayer.pa}` };
      }

      const updatedPlayers = state.players.map((p) =>
        p.id === activePlayer.id
          ? { ...p, pa: p.pa - requiredPA, currentLocation: action.toLocation }
          : p
      );

      return { success: true, state: { ...state, players: updatedPlayers } };
    }

    case 'DRAW_CRYSTAL_FROM_TABLE': {
      if (activePlayer.currentLocation !== 'DOMEK') {
        return { success: false, error: 'Pobranie kryształów ze stołu jest możliwe tylko w Domku.' };
      }
      if (activePlayer.pa < 1) {
        return { success: false, error: 'Brak punktów akcji (wymagane 1 PA).' };
      }
      if (state.board.cabinTable.length === 0) {
        return { success: false, error: 'Stół w Domku jest pusty. Użyj akcji pobrania z worka.' };
      }

      const actualCountToDraw = Math.min(action.count, 3, state.board.cabinTable.length);
      const maxSlots = activePlayer.characterName === 'Strażnik' ? 4 : 3;
      
      if (activePlayer.backpack.length + actualCountToDraw > maxSlots) {
        return { success: false, error: 'Kryształy nie zmieszczą się w plecaku.' };
      }

      const newCabinTable = [...state.board.cabinTable];
      const takenCrystals = newCabinTable.splice(0, actualCountToDraw);

      const updatedPlayers = state.players.map((p) =>
        p.id === activePlayer.id
          ? { ...p, pa: p.pa - 1, backpack: [...p.backpack, ...takenCrystals] }
          : p
      );

      return {
        success: true,
        state: {
          ...state,
          players: updatedPlayers,
          board: { ...state.board, cabinTable: newCabinTable }
        }
      };
    }

    case 'DRAW_CRYSTAL_FROM_BAG': {
      if (activePlayer.currentLocation !== 'DOMEK') {
        return { success: false, error: 'Czerpanie z worka jest możliwe tylko w Domku.' };
      }
      if (activePlayer.pa < 1) {
        return { success: false, error: 'Brak punktów akcji (wymagane 1 PA).' };
      }
      if (state.board.cabinTable.length > 0) {
        return { success: false, error: 'Nie można czerpać z worka, dopóki na stole są kryształy.' };
      }
      if (state.board.bag.length === 0) {
        return { success: false, error: 'Worek z kryształami jest pusty.' };
      }

      const crystalsToDrawCount = activePlayer.characterName === 'Wędrowiec' ? 2 : 1;
      const maxSlots = activePlayer.characterName === 'Strażnik' ? 4 : 3;
      
      if (activePlayer.backpack.length + crystalsToDrawCount > maxSlots) {
        return { success: false, error: 'Brak wolnego miejsca w plecaku na wyciągnięcie kryształów.' };
      }

      const newBag = [...state.board.bag];
      const drawnCrystals: CrystalColor[] = [];
      
      for (let i = 0; i < crystalsToDrawCount; i++) {
        if (newBag.length > 0) {
          drawnCrystals.push(newBag.pop()!);
        }
      }

      const updatedPlayers = state.players.map((p) =>
        p.id === activePlayer.id
          ? { ...p, pa: p.pa - 1, backpack: [...p.backpack, ...drawnCrystals] }
          : p
      );

      return {
        success: true,
        state: {
          ...state,
          players: updatedPlayers,
          board: { ...state.board, bag: newBag }
        }
      };
    }

    case 'END_TURN': {
      const nextPlayerIndex = state.activePlayerIndex + 1;
      const isRoundOver = nextPlayerIndex >= state.players.length;

      let updatedPlayers = state.players.map((p, idx) => 
        idx === state.activePlayerIndex ? { ...p, pa: 3 } : p
      );

      if (!isRoundOver) {
        return {
          success: true,
          state: { ...state, activePlayerIndex: nextPlayerIndex, players: updatedPlayers }
        };
      }

      const newHour = state.currentHour + 1 > 24 ? 1 : state.currentHour + 1;
      const newTurn = state.currentTurn + 1;
      const newPhase = getPhaseByHour(newHour);
      let updatedBoard = { ...state.board };

      if (newPhase === 'Poranek' && newHour <= 12) {
        updatedBoard = refillCabinTable(updatedBoard, state.players.length);
      }

      if (newPhase === 'Noc') {
        updatedPlayers = updatedPlayers.map((p) => ({ ...p, pa: 2 }));
      }

      return {
        success: true,
        state: {
          ...state,
          currentTurn: newTurn,
          currentHour: newHour,
          phase: newPhase,
          activePlayerIndex: 0,
          players: updatedPlayers,
          board: updatedBoard
        }
      };
    }

    default:
      return { success: false, error: 'Nieobsługiwany typ akcji.' };
  }
}