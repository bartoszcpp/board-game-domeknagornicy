'use client';

import { useGameStore } from '@/store/useGameStore';

/**
 * Modal Głębokiej nocy (po północy). Pojawia się na początku tury gracza w fazie
 * "Noc" i wymusza decyzję: odrzuć 1 kartę LUB strać 1 PA. Nakładka blokuje
 * pozostałe akcje dopóki gracz nie dokona wyboru.
 */
export function NightPenaltyModal() {
  const pending = useGameStore((s) => s.state.nightPenaltyPending);
  const activePlayer = useGameStore((s) => s.state.players[s.state.activePlayerIndex]);
  const resolveNightPenalty = useGameStore((s) => s.resolveNightPenalty);

  if (!pending) return null;

  const hasCards = activePlayer.cardsInHand.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="night-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-indigo-500/40 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <div className="mb-1 flex items-center gap-2 text-2xl">
          <span aria-hidden>🌙</span>
          <h2 id="night-modal-title" className="font-bold tracking-tight">
            Głęboka noc
          </h2>
        </div>
        <p className="mb-5 text-sm text-slate-300">
          Minęła północ. Zanim <span className="font-semibold text-indigo-300">{activePlayer.characterName}</span>{' '}
          wykona ruch, musi ponieść karę nocy. Wybierz jedną z opcji:
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={!hasCards}
            onClick={() => resolveNightPenalty('discardCard')}
            className="flex items-center justify-between rounded-lg border border-indigo-500/50 bg-indigo-600/20 px-4 py-3 text-left font-medium transition hover:bg-indigo-600/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>Odrzuć 1 kartę z ręki</span>
            <span className="text-xs text-slate-400">
              {hasCards ? `w ręce: ${activePlayer.cardsInHand.length}` : 'brak kart'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => resolveNightPenalty('losePA')}
            className="flex items-center justify-between rounded-lg border border-rose-500/50 bg-rose-600/20 px-4 py-3 text-left font-medium transition hover:bg-rose-600/40"
          >
            <span>Strać 1 PA w tej turze</span>
            <span className="text-xs text-slate-400">obecne PA: {activePlayer.pa}</span>
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          Pozostałe akcje są zablokowane do czasu dokonania wyboru.
        </p>
      </div>
    </div>
  );
}
