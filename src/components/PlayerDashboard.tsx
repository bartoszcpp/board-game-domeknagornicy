'use client';

import { LOCATIONS } from '@/config/gameConfig';
import {
  CHARACTER_RELATIONSHIPS,
  getBackpackCapacity,
  getRuneCost,
  RUNE_LOCATIONS,
  type GamePhase,
  type LocationName,
} from '@/engine/gameEngine';
import { useGameStore } from '@/store/useGameStore';
import { CrystalRow } from './CrystalSquare';
import { NightPenaltyModal } from './NightPenaltyModal';

const PHASE_STYLES: Record<GamePhase, string> = {
  'Poranek': 'bg-amber-100 text-amber-800',
  'Dzień': 'bg-sky-100 text-sky-800',
  'Zmierzch': 'bg-violet-100 text-violet-800',
  'Noc': 'bg-indigo-900 text-indigo-100',
};

const PHASE_ICONS: Record<GamePhase, string> = {
  'Poranek': '🌅',
  'Dzień': '☀️',
  'Zmierzch': '🌆',
  'Noc': '🌙',
};

const ALL_LOCATIONS: LocationName[] = ['DOMEK', 'LASEK', 'PALENISKO', 'ALTANA', 'WZGÓRZE', 'GRANICA'];

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/**
 * Szacuje liczbę pól między lokalizacjami. Trasy prowadzą przez Domek, więc
 * podróż między dwiema lokalizacjami sumuje ich odległości od Domku.
 * W Zmierzchu/Nocy aktywne są fioletowe pola, więc używamy dłuższego dystansu.
 */
function fieldsBetween(from: LocationName, to: LocationName, phase: GamePhase): number {
  if (from === to) return 0;
  const useLong = phase === 'Zmierzch' || phase === 'Noc';
  const dist = (loc: LocationName) =>
    useLong ? LOCATIONS[loc].totalDistanceWithPurpleFields : LOCATIONS[loc].distanceFromCabin;

  if (from === 'DOMEK') return dist(to);
  if (to === 'DOMEK') return dist(from);
  return dist(from) + dist(to);
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex min-w-[120px] flex-col rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`text-2xl font-bold ${accent ?? 'text-slate-900'}`}>{value}</span>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'ghost';
}) {
  const variants = {
    default: 'bg-slate-800 text-white hover:bg-slate-700',
    primary: 'bg-emerald-600 text-white hover:bg-emerald-500',
    ghost: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export function PlayerDashboard() {
  const state = useGameStore((s) => s.state);
  const lastError = useGameStore((s) => s.lastError);
  const {
    movePlayer,
    drawFromTable,
    drawFromBag,
    depositToBank,
    depositToRoom,
    withdrawFromRoom,
    buyRune,
    endTurn,
    resetGame,
  } = useGameStore.getState();

  const player = state.players[state.activePlayerIndex];
  const location = player.currentLocation;
  const inCabin = location === 'DOMEK';
  const capacity = getBackpackCapacity(player);
  const relationship = CHARACTER_RELATIONSHIPS[player.characterName];
  const localBank = state.board.banks[location] ?? [];

  const canBuyRuneHere = RUNE_LOCATIONS.includes(location) && !player.runes.includes(location);
  const runeCost = canBuyRuneHere ? getRuneCost(player.characterName, location) : 0;

  const blocked = state.nightPenaltyPending;

  const relationLabel = (loc: LocationName): string => {
    if (loc === relationship.asylum) return 'azyl';
    if (loc === relationship.enemy) return 'wróg';
    if (RUNE_LOCATIONS.includes(loc)) return 'neutralna';
    return '';
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <NightPenaltyModal />

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Domek na górnicy · Tura {state.currentTurn}</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{player.characterName}</h1>
          <p className="text-sm text-slate-500">
            Azyl: {LOCATIONS[relationship.asylum].name} · Wróg: {LOCATIONS[relationship.enemy].name}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <StatCard label="Punkty akcji" value={String(player.pa)} accent="text-emerald-600" />
          <StatCard label="Godzina" value={formatHour(state.currentHour)} />
          <div
            className={`flex min-w-[120px] flex-col justify-center rounded-xl px-4 py-3 shadow-sm ${PHASE_STYLES[state.phase]}`}
          >
            <span className="text-xs font-medium uppercase tracking-wide opacity-70">Faza dnia</span>
            <span className="text-lg font-bold">
              {PHASE_ICONS[state.phase]} {state.phase}
            </span>
          </div>
        </div>
      </header>

      {lastError && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {lastError}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plecak */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">🎒 Plecak</h2>
            <span className="text-xs text-slate-500">
              {player.backpack.length}/{capacity} slotów
            </span>
          </div>
          <CrystalRow crystals={player.backpack} capacity={capacity} emptyLabel="plecak jest pusty" />
        </section>

        {/* Prywatny pokój */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">🏠 Prywatny pokój (schowek)</h2>
            <span className="text-xs text-slate-500">{player.room.length} kryształów</span>
          </div>
          <CrystalRow crystals={player.room} emptyLabel="pokój jest pusty" />
          <p className="mt-2 text-xs text-slate-400">Bezpieczne miejsce — nikt tu nie sięgnie.</p>
        </section>
      </div>

      {/* Lokalizacja + Bank */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">
            📍 {LOCATIONS[location].name}
            {relationLabel(location) && (
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {relationLabel(location)}
              </span>
            )}
          </h2>
        </div>
        {inCabin ? (
          <div className="text-sm text-slate-600">
            <p>
              Stół w Domku: <span className="font-medium">{state.board.cabinTable.length}</span> kryształów ·
              Worek: <span className="font-medium">{state.board.bag.length}</span>
            </p>
            <div className="mt-2">
              <CrystalRow crystals={state.board.cabinTable} emptyLabel="stół jest pusty" />
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-1 text-sm text-slate-600">🏦 Bank lokalny (wspólny — inni też mogą pobierać):</p>
            <CrystalRow crystals={localBank} emptyLabel="bank jest pusty" />
          </div>
        )}
      </section>

      {/* Runy */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 font-semibold text-slate-800">
          ᚱ Zebrane runy ({player.runes.length}/4)
        </h2>
        <div className="flex flex-wrap gap-2">
          {RUNE_LOCATIONS.map((loc) => {
            const owned = player.runes.includes(loc);
            return (
              <span
                key={loc}
                className={`rounded-lg px-3 py-1 text-sm font-medium ${
                  owned
                    ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {owned ? '✔ ' : '○ '}
                {LOCATIONS[loc].name}
              </span>
            );
          })}
        </div>
      </section>

      {/* Akcje */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-slate-800">⚡ Akcje</h2>

        <div className="flex flex-wrap gap-3">
          {inCabin && (
            <>
              <ActionButton
                onClick={() => drawFromTable(3)}
                disabled={blocked || player.pa < 1 || state.board.cabinTable.length === 0}
              >
                Pobierz kryształy ze stołu (1 PA)
              </ActionButton>
              <ActionButton
                onClick={() => drawFromBag()}
                disabled={blocked || player.pa < 1 || state.board.cabinTable.length > 0}
              >
                Czerp z worka (1 PA)
              </ActionButton>
              <ActionButton
                onClick={() => depositToRoom()}
                disabled={blocked || player.backpack.length === 0}
                variant="ghost"
              >
                Odłóż do pokoju (0 PA)
              </ActionButton>
              <ActionButton
                onClick={() => withdrawFromRoom(capacity)}
                disabled={blocked || player.room.length === 0}
                variant="ghost"
              >
                Weź z pokoju (0 PA)
              </ActionButton>
            </>
          )}

          {!inCabin && (
            <ActionButton
              onClick={() => depositToBank()}
              disabled={blocked || player.backpack.length === 0}
              variant="ghost"
            >
              Wpłać kryształy do Banku (0 PA)
            </ActionButton>
          )}

          <ActionButton
            onClick={() => buyRune()}
            disabled={blocked || !canBuyRuneHere || player.pa < 1}
            variant="primary"
          >
            Kup Runę{canBuyRuneHere ? ` (${runeCost} 💎 + 1 PA)` : ''}
          </ActionButton>
        </div>

        {/* Ruch */}
        <h3 className="mb-2 mt-5 text-sm font-semibold text-slate-600">Ruch</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_LOCATIONS.filter((loc) => loc !== location).map((loc) => {
            const fields = fieldsBetween(location, loc, state.phase);
            const heavy = player.characterName !== 'Strażnik' && player.backpack.length > 2;
            const cost = fields * (heavy ? 2 : 1);
            return (
              <button
                key={loc}
                type="button"
                onClick={() => movePlayer(loc, fields)}
                disabled={blocked || player.pa < cost}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                → {LOCATIONS[loc].name}{' '}
                <span className="text-slate-400">({cost} PA)</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => resetGame()}
            className="text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            ↺ Restart gry
          </button>
          <ActionButton onClick={() => endTurn()} disabled={blocked}>
            Zakończ turę →
          </ActionButton>
        </div>
      </section>
    </div>
  );
}
