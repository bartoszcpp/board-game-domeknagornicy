export type CrystalColor = 'żółty' | 'czerwony' | 'niebieski' | 'zielony';
export type GamePhase = 'Poranek' | 'Dzień' | 'Zmierzch' | 'Noc';
export type CharacterName = 'Strażnik' | 'Badacz' | 'Wędrowiec';
export type LocationName = 'DOMEK' | 'LASEK' | 'PALENISKO' | 'ALTANA' | 'WZGÓRZE' | 'GRANICA';

export interface Player {
  id: string;
  characterName: CharacterName;
  pa: number;
  backpack: CrystalColor[];
  room: CrystalColor[];
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
  /**
   * Podczas Głębokiej nocy (po północy) aktywny gracz musi rozstrzygnąć karę
   * (odrzucić kartę lub stracić 1 PA), zanim wykona jakąkolwiek inną akcję.
   */
  nightPenaltyPending: boolean;
}

export type NightPenaltyChoice = 'discardCard' | 'losePA';

export type GameAction =
  | { type: 'MOVE_PLAYER'; playerId: string; toLocation: LocationName; fieldsCount: number }
  | { type: 'DRAW_CRYSTAL_FROM_TABLE'; playerId: string; count: number }
  | { type: 'DRAW_CRYSTAL_FROM_BAG'; playerId: string }
  | { type: 'DEPOSIT_TO_BANK'; playerId: string }
  | { type: 'DEPOSIT_TO_ROOM'; playerId: string }
  | { type: 'WITHDRAW_FROM_ROOM'; playerId: string; count: number }
  | { type: 'BUY_RUNE'; playerId: string }
  | { type: 'RESOLVE_NIGHT_PENALTY'; playerId: string; choice: NightPenaltyChoice }
  | { type: 'END_TURN'; playerId: string };

export type EngineResult = 
  | { success: true; state: GameState }
  | { success: false; error: string };

/** Relacja postać → jej azyl i wroga lokalizacja (na potrzeby kosztu run). */
export const CHARACTER_RELATIONSHIPS: Record<CharacterName, { asylum: LocationName; enemy: LocationName }> = {
  'Strażnik': { asylum: 'PALENISKO', enemy: 'LASEK' },
  'Badacz': { asylum: 'WZGÓRZE', enemy: 'PALENISKO' },
  'Wędrowiec': { asylum: 'LASEK', enemy: 'ALTANA' },
};

/** Lokalizacje, w których można kupić runę (cel gry: komplet 4 run). */
export const RUNE_LOCATIONS: LocationName[] = ['LASEK', 'PALENISKO', 'ALTANA', 'WZGÓRZE'];

/**
 * Koszt runy w kryształach: 2 w azylu, 6 u wroga, 4 w lokalizacji neutralnej.
 */
export function getRuneCost(character: CharacterName, location: LocationName): number {
  const rel = CHARACTER_RELATIONSHIPS[character];
  if (location === rel.asylum) return 2;
  if (location === rel.enemy) return 6;
  return 4;
}

export function getBackpackCapacity(player: Player): number {
  return player.characterName === 'Strażnik' ? 4 : 3;
}

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

  // Głęboka noc: dopóki gracz nie rozstrzygnie kary, blokujemy pozostałe akcje.
  if (state.nightPenaltyPending && action.type !== 'RESOLVE_NIGHT_PENALTY') {
    return {
      success: false,
      error: 'Trwa Głęboka noc. Najpierw wybierz: odrzuć 1 kartę lub strać 1 PA.',
    };
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

    case 'DEPOSIT_TO_BANK': {
      if (activePlayer.currentLocation === 'DOMEK') {
        return { success: false, error: 'W Domku nie ma Banku. Skorzystaj z prywatnego pokoju.' };
      }
      if (activePlayer.backpack.length === 0) {
        return { success: false, error: 'Twój plecak jest pusty.' };
      }

      const loc = activePlayer.currentLocation;
      const updatedBanks = {
        ...state.board.banks,
        [loc]: [...state.board.banks[loc], ...activePlayer.backpack],
      };
      const updatedPlayers = state.players.map((p) =>
        p.id === activePlayer.id ? { ...p, backpack: [] } : p
      );

      return {
        success: true,
        state: { ...state, players: updatedPlayers, board: { ...state.board, banks: updatedBanks } },
      };
    }

    case 'DEPOSIT_TO_ROOM': {
      if (activePlayer.currentLocation !== 'DOMEK') {
        return { success: false, error: 'Do prywatnego pokoju można odkładać tylko w Domku.' };
      }
      if (activePlayer.backpack.length === 0) {
        return { success: false, error: 'Twój plecak jest pusty.' };
      }

      const updatedPlayers = state.players.map((p) =>
        p.id === activePlayer.id ? { ...p, backpack: [], room: [...p.room, ...p.backpack] } : p
      );

      return { success: true, state: { ...state, players: updatedPlayers } };
    }

    case 'WITHDRAW_FROM_ROOM': {
      if (activePlayer.currentLocation !== 'DOMEK') {
        return { success: false, error: 'Z prywatnego pokoju można pobierać tylko w Domku.' };
      }
      if (activePlayer.room.length === 0) {
        return { success: false, error: 'Twój pokój jest pusty.' };
      }

      const capacity = getBackpackCapacity(activePlayer);
      const freeSlots = capacity - activePlayer.backpack.length;
      const countToTake = Math.min(action.count, activePlayer.room.length, freeSlots);

      if (countToTake <= 0) {
        return { success: false, error: 'Brak wolnego miejsca w plecaku.' };
      }

      const newRoom = [...activePlayer.room];
      const taken = newRoom.splice(0, countToTake);
      const updatedPlayers = state.players.map((p) =>
        p.id === activePlayer.id ? { ...p, room: newRoom, backpack: [...p.backpack, ...taken] } : p
      );

      return { success: true, state: { ...state, players: updatedPlayers } };
    }

    case 'BUY_RUNE': {
      const loc = activePlayer.currentLocation;

      if (!RUNE_LOCATIONS.includes(loc)) {
        return { success: false, error: 'W tej lokalizacji nie można kupić runy.' };
      }
      if (activePlayer.runes.includes(loc)) {
        return { success: false, error: 'Masz już runę z tej lokalizacji.' };
      }
      if (activePlayer.pa < 1) {
        return { success: false, error: 'Brak punktów akcji (wymagane 1 PA).' };
      }

      const cost = getRuneCost(activePlayer.characterName, loc);
      const bank = state.board.banks[loc];
      const available = activePlayer.backpack.length + bank.length;

      if (available < cost) {
        return {
          success: false,
          error: `Za mało kryształów na runę. Wymagane: ${cost}, dostępne (plecak + Bank): ${available}.`,
        };
      }

      // Płacimy najpierw z plecaka, resztę z lokalnego Banku; kryształy wracają do worka.
      const newBackpack = [...activePlayer.backpack];
      const newBank = [...bank];
      const returnedToBag: CrystalColor[] = [];
      let remaining = cost;

      while (remaining > 0 && newBackpack.length > 0) {
        returnedToBag.push(newBackpack.pop()!);
        remaining--;
      }
      while (remaining > 0 && newBank.length > 0) {
        returnedToBag.push(newBank.pop()!);
        remaining--;
      }

      const updatedPlayers = state.players.map((p) =>
        p.id === activePlayer.id
          ? { ...p, pa: p.pa - 1, backpack: newBackpack, runes: [...p.runes, loc] }
          : p
      );

      return {
        success: true,
        state: {
          ...state,
          players: updatedPlayers,
          board: {
            ...state.board,
            banks: { ...state.board.banks, [loc]: newBank },
            bag: [...state.board.bag, ...returnedToBag],
          },
        },
      };
    }

    case 'RESOLVE_NIGHT_PENALTY': {
      if (!state.nightPenaltyPending) {
        return { success: false, error: 'Brak oczekującej kary nocy do rozstrzygnięcia.' };
      }

      if (action.choice === 'discardCard') {
        if (activePlayer.cardsInHand.length === 0) {
          return {
            success: false,
            error: 'Nie masz kart do odrzucenia. Musisz stracić 1 PA.',
          };
        }
        const newHand = activePlayer.cardsInHand.slice(1);
        const updatedPlayers = state.players.map((p) =>
          p.id === activePlayer.id ? { ...p, cardsInHand: newHand } : p
        );
        return { success: true, state: { ...state, players: updatedPlayers, nightPenaltyPending: false } };
      }

      // losePA
      const updatedPlayers = state.players.map((p) =>
        p.id === activePlayer.id ? { ...p, pa: Math.max(0, p.pa - 1) } : p
      );
      return { success: true, state: { ...state, players: updatedPlayers, nightPenaltyPending: false } };
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
          state: {
            ...state,
            activePlayerIndex: nextPlayerIndex,
            players: updatedPlayers,
            // Kolejny gracz w Nocy również musi rozstrzygnąć karę przed ruchem.
            nightPenaltyPending: state.phase === 'Noc',
          }
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
          board: updatedBoard,
          // Nowa runda w Głębokiej nocy: pierwszy gracz musi rozstrzygnąć karę.
          nightPenaltyPending: newPhase === 'Noc',
        }
      };
    }

    default:
      return { success: false, error: 'Nieobsługiwany typ akcji.' };
  }
}