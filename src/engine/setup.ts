import { CARDS } from '@/config/gameConfig';
import type { CharacterName, CrystalColor, GameState, LocationName, Player } from './gameEngine';

export const CRYSTAL_COLORS: CrystalColor[] = ['żółty', 'czerwony', 'niebieski', 'zielony'];

const ALL_LOCATIONS: LocationName[] = ['DOMEK', 'LASEK', 'PALENISKO', 'ALTANA', 'WZGÓRZE', 'GRANICA'];

const DEFAULT_CHARACTERS: CharacterName[] = ['Strażnik', 'Badacz', 'Wędrowiec'];

/**
 * Buduje deterministyczny worek kryształów (bez losowości), aby uniknąć
 * rozjazdu SSR/hydratacji w Next.js. Kolory są ułożone naprzemiennie.
 */
function buildBag(perColor: number): CrystalColor[] {
  const bag: CrystalColor[] = [];
  for (let i = 0; i < perColor; i++) {
    for (const color of CRYSTAL_COLORS) {
      bag.push(color);
    }
  }
  return bag;
}

function emptyBanks(): Record<LocationName, CrystalColor[]> {
  return ALL_LOCATIONS.reduce((acc, loc) => {
    acc[loc] = [];
    return acc;
  }, {} as Record<LocationName, CrystalColor[]>);
}

/**
 * Tworzy początkowy stan gry zgodnie z sekcją "Setup" zasad:
 * - wszyscy gracze startują w Domku,
 * - każdy dostaje 2 karty,
 * - na stole w Domku ląduje 3 kryształy * liczba graczy.
 *
 * Setup jest w pełni deterministyczny, dzięki czemu ten sam stan renderuje
 * się identycznie na serwerze i kliencie.
 */
export function createInitialState(
  characters: CharacterName[] = DEFAULT_CHARACTERS
): GameState {
  const playerCount = characters.length;

  const players: Player[] = characters.map((characterName, index) => ({
    id: `player-${index + 1}`,
    characterName,
    pa: 3,
    backpack: [],
    room: [],
    runes: [],
    // Każdy gracz dostaje 2 karty (deterministycznie z konfiguracji).
    cardsInHand: [
      CARDS[index * 2 % CARDS.length].effect,
      CARDS[(index * 2 + 1) % CARDS.length].effect,
    ],
    currentLocation: 'DOMEK',
  }));

  const bag = buildBag(15);
  const cabinTable: CrystalColor[] = [];
  const initialTableCrystals = 3 * playerCount;
  for (let i = 0; i < initialTableCrystals && bag.length > 0; i++) {
    cabinTable.push(bag.pop()!);
  }

  return {
    currentTurn: 1,
    currentHour: 8,
    phase: 'Poranek',
    players,
    activePlayerIndex: 0,
    board: {
      banks: emptyBanks(),
      cabinTable,
      bag,
    },
    isGameOver: false,
    nightPenaltyPending: false,
  };
}
