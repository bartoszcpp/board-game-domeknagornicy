import { setup } from 'xstate';

export const gameMachine = setup({
  types: {
    context: {} as { players: any[], currentTurn: number },
    events: {} as { type: 'START_GAME' } | { type: 'NEXT_TURN' },
  },
}).createMachine({
  id: 'domek-na-gornicy',
  initial: 'setup',
  context: {
    players: [],
    currentTurn: 0,
  },
  states: {
    setup: {
      on: { START_GAME: 'playing' }
    },
    playing: {
      initial: 'day',
      states: {
        day: { on: { NEXT_TURN: 'dusk' } },
        dusk: { on: { NEXT_TURN: 'night' } },
        night: { on: { NEXT_TURN: 'day' } },
      }
    }
  }
});