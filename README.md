# Domek na górnicy 🏠💎

Cyfrowa implementacja planszowej gry **Domek na górnicy**. Gracze wcielają się
w postacie, wędrują po mapie, zbierają kryształy i kupują runy — cel: zdobyć
komplet 4 run i wrócić z nimi do Domku.

Projekt jest budowany warstwowo: najpierw **headless** silnik gry (czysta logika,
bez UI), a następnie warstwa interfejsu w React.

## Stos technologiczny

- **[Next.js 16](https://nextjs.org)** (App Router, Turbopack) + **React 19**
- **[Zustand](https://github.com/pmndrs/zustand)** — globalny stan gry
- **[Tailwind CSS 4](https://tailwindcss.com)** — style UI
- **[XState](https://stately.ai/docs/xstate)** — szkielet maszyny stanów (faza dnia)
- **TypeScript** — w całości

> ⚠️ **Next.js w tym repo może różnić się od wersji, którą znasz.** Przed pisaniem
> kodu zajrzyj do `node_modules/next/dist/docs/` (patrz `AGENTS.md`).

## Wymagania

- **Node.js ≥ 20** (Next 16 nie działa na starszych wersjach).

```bash
nvm use 22   # lub dowolna wersja 20+
```

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja: [http://localhost:3000](http://localhost:3000).

Pozostałe skrypty:

```bash
npm run build   # build produkcyjny
npm run start   # serwer produkcyjny
npm run lint    # ESLint
```

## Struktura projektu

```
src/
├── app/                    # Next.js App Router (layout, strona, style globalne)
│   └── page.tsx            # renderuje PlayerDashboard
├── config/
│   └── gameConfig.ts       # dane gry: postacie, lokalizacje, harmonogram, karty
├── engine/                 # HEADLESS silnik gry (czysta logika, bez React)
│   ├── gameEngine.ts       # typy stanu + gameReducer(state, action)
│   ├── navigation.ts       # graf mapy i wyznaczanie kosztu tras (Dijkstra)
│   └── setup.ts            # createInitialState() — początkowy stan gry
├── machine/
│   └── gameMachine.ts      # szkielet maszyny XState (faza dnia)
├── store/
│   ├── useGameStore.ts     # Zustand: stan + akcje podpięte do silnika
│   └── useUIStore.ts       # Zustand: stan UI (np. panele)
└── components/
    ├── PlayerDashboard.tsx # główny widok gracza
    ├── NightPenaltyModal.tsx # modal Głębokiej nocy
    └── CrystalSquare.tsx   # kryształy jako kolorowe kwadraty

docs/
├── zasady-gry.md           # zasady (transkrypcja z pliku źródłowego)
├── specyfikacje.md         # tabele postaci/lokalizacji/kart
└── zrodla/                 # oryginalne pliki .docx / .pdf
```

## Architektura

### 1. Silnik headless (`src/engine`)

Cała logika gry to czysta funkcja:

```ts
gameReducer(state: GameState, action: GameAction): EngineResult
```

Reducer nie zna Reacta — przyjmuje stan i akcję, zwraca nowy stan **albo** błąd
(`{ success: false, error }`). Dzięki temu logikę można testować i uruchamiać
niezależnie od UI. Obsługiwane akcje m.in.: ruch, czerpanie kryształów, wpłata do
Banku, odkładanie do prywatnego pokoju, zakup runy, kara nocy, koniec tury.

### 2. Stan globalny (`src/store/useGameStore.ts`)

Store Zustand trzyma `GameState` i wystawia akcje-skróty (`movePlayer`,
`buyRune`, `depositToBank`, `resolveNightPenalty`, `endTurn`, …), które pod spodem
wywołują `gameReducer` i aktualizują stan. Błędy silnika trafiają do `lastError`.

### 3. Interfejs (`src/components`)

`PlayerDashboard` prezentuje aktywnego gracza: imię postaci, Punkty Akcji (PA),
godzinę i fazę dnia, zawartość plecaka i prywatnego pokoju (kolorowe kwadraty),
lokalny Bank, zebrane runy oraz przyciski akcji. `NightPenaltyModal` pojawia się
po północy i wymusza wybór *odrzuć kartę / strać 1 PA*, blokując pozostałe akcje.

## Zasady gry (skrót)

- Gra startuje o **8:00**; każda tura daje graczowi **3 PA**.
- **Cel:** zdobyć 4 runy (Lasek, Palenisko, Altana, Wzgórze) i wrócić do Domku.
- **Koszt runy:** azyl 2 💎 · neutralna 4 💎 · wroga lokalizacja 6 💎 (płatność
  z plecaka + lokalnego Banku).
- **Bank** jest wspólny (kryształy można stamtąd podbierać), **prywatny pokój**
  w Domku jest bezpiecznym schowkiem.
- **Faza dnia** (Poranek → Dzień → Zmierzch → Noc) zmienia zasady ruchu; po północy
  obowiązuje kara nocy.

Pełne zasady: [`docs/zasady-gry.md`](docs/zasady-gry.md) ·
Specyfikacje: [`docs/specyfikacje.md`](docs/specyfikacje.md).

## Status prac

- [x] **Krok 1–2** — dane gry i konfiguracja (`gameConfig.ts`)
- [x] **Krok 3** — headless silnik: reducer + nawigacja po mapie
- [x] **Krok 4** — warstwa UI: Zustand + `PlayerDashboard` + modal nocy
- [ ] Kolejne kroki — plansza/mapa, karty, tryb wieloosobowy
