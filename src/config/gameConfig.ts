export type ActionCost = number;
export type TimeString = string;
export type CharacterColor = 'Czerwony' | 'Niebieski' | 'Zielony' | 'Brak';
export type LocationColor = 'Zielony' | 'Czerwony' | 'Żółty' | 'Niebieski' | 'Biały' | 'Czarny';
export type MapDirection = 'Północ' | 'Północny-wschód' | 'Wschód' | 'Południe' | 'Zachód' | 'Centrum mapy';

export interface CharacterConfig {
  name: string;
  specialAbility: string;
  asylum: string[];
  enemyLocation: string;
  backpackSlots: number;
  movementCostLight: ActionCost;
  movementCostHeavy: ActionCost;
  color: CharacterColor;
}

export interface LocationConfig {
  name: string;
  friendlyAction: string;
  distanceFromCabin: number;
  totalDistanceWithPurpleFields: number;
  mapPosition: MapDirection;
  color: LocationColor;
  asylumFor: string[];
  enemyFor: string[];
}

export interface ScheduleEvent {
  time: TimeString;
  period: 'Poranek' | 'Dzień' | 'Zmierzch' | 'Noc';
  rule: string;
}

export interface CardConfig {
  type: 'MOC' | 'BUDOWLA';
  effect: string;
  costPA: ActionCost;
}

// ---------------------------------------------------------
// CHARACTERS
// ---------------------------------------------------------

export const CHARACTERS: CharacterConfig[] = [
  {
    name: 'Strażnik',
    specialAbility: 'Każdy ruch 1PA (nie zależnie czy ciężki czy lekki). Szybki start: Pierwsza akcja Ruchu w każdej turze jest darmowa (0 PA).',
    asylum: ['Palenisko'],
    enemyLocation: 'Lasek',
    backpackSlots: 4,
    movementCostLight: 1,
    movementCostHeavy: 2,
    color: 'Czerwony',
  },
  {
    name: 'Badacz',
    specialAbility: 'Wyślij 1 kryształ z Twojego pokoju w domku do banku dowolnej lokalizacji (tylko będąc w domku), koszt 1PA, raz na turę.',
    asylum: ['Wzgórze'],
    enemyLocation: 'Palenisko',
    backpackSlots: 3,
    movementCostLight: 1,
    movementCostHeavy: 2,
    color: 'Niebieski',
  },
  {
    name: 'Wędrowiec',
    specialAbility: 'Ekspert: Raz na turę, podczas akcji Czerpania, dobierasz 2 kryształy zamiast 1.',
    asylum: ['Lasek', 'Altana'],
    enemyLocation: 'Altana',
    backpackSlots: 3,
    movementCostLight: 1,
    movementCostHeavy: 2,
    color: 'Zielony',
  }
];

// ---------------------------------------------------------
// LOCATIONS
// ---------------------------------------------------------

export const LOCATIONS: Record<string, LocationConfig> = {
  LASEK: {
    name: 'Lasek',
    friendlyAction: '1PA: weź żeton teleportacji (jednorazowy skok gdziekolwiek).',
    distanceFromCabin: 3,
    totalDistanceWithPurpleFields: 5,
    mapPosition: 'Północ',
    color: 'Zielony',
    asylumFor: ['Wędrowiec'],
    enemyFor: ['Strażnik'],
  },
  PALENISKO: {
    name: 'Palenisko',
    friendlyAction: '1PA: Pobierz 3 kryształy z worka i umieść je w pokoju.',
    distanceFromCabin: 2,
    totalDistanceWithPurpleFields: 3,
    mapPosition: 'Północny-wschód',
    color: 'Czerwony',
    asylumFor: ['Strażnik'],
    enemyFor: ['Badacz'],
  },
  ALTANA: {
    name: 'Altana',
    friendlyAction: '1PA: Pobierz 2 kryształy z worka i wsadź je do plecaka.',
    distanceFromCabin: 1,
    totalDistanceWithPurpleFields: 1,
    mapPosition: 'Wschód',
    color: 'Żółty',
    asylumFor: ['Kupiec', 'Wędrowiec'],
    enemyFor: [],
  },
  WZGÓRZE: {
    name: 'Wzgórze',
    friendlyAction: '1PA: kup runę neutralną zdalnie.',
    distanceFromCabin: 4,
    totalDistanceWithPurpleFields: 7,
    mapPosition: 'Południe',
    color: 'Niebieski',
    asylumFor: ['Kupiec', 'Badacz'],
    enemyFor: [],
  },
  DOMEK: {
    name: 'Domek',
    friendlyAction: 'Neutralna dla wszystkich',
    distanceFromCabin: 0,
    totalDistanceWithPurpleFields: 0,
    mapPosition: 'Centrum mapy',
    color: 'Biały',
    asylumFor: [],
    enemyFor: [],
  },
  GRANICA: {
    name: 'Granica',
    friendlyAction: 'Neutralna dla wszystkich',
    distanceFromCabin: 2,
    totalDistanceWithPurpleFields: 3,
    mapPosition: 'Zachód',
    color: 'Czarny',
    asylumFor: [],
    enemyFor: [],
  }
};

// ---------------------------------------------------------
// SCHEDULE
// ---------------------------------------------------------

export const SCHEDULE: ScheduleEvent[] = [
  { time: '08:00', period: 'Poranek', rule: 'Dołóż 1 kryształ * liczba graczy na stół w domku' },
  { time: '09:00', period: 'Poranek', rule: 'Dołóż 1 kryształ * liczba graczy na stół w domku' },
  { time: '10:00', period: 'Poranek', rule: 'Dołóż 1 kryształ * liczba graczy na stół w domku' },
  { time: '11:00', period: 'Poranek', rule: 'Dołóż 1 kryształ * liczba graczy na stół w domku' },
  { time: '12:00', period: 'Poranek', rule: 'Dołóż 1 kryształ * liczba graczy na stół w domku' },
  { time: '13:00', period: 'Dzień', rule: 'Nic nie dokładaj' },
  { time: '14:00', period: 'Dzień', rule: 'Nic nie dokładaj' },
  { time: '15:00', period: 'Dzień', rule: 'Nic nie dokładaj' },
  { time: '16:00', period: 'Dzień', rule: 'Nic nie dokładaj' },
  { time: '17:00', period: 'Dzień', rule: 'Nic nie dokładaj' },
  { time: '18:00', period: 'Dzień', rule: 'Nic nie dokładaj' },
  { time: '19:00', period: 'Zmierzch', rule: 'Fioletowe pola na mapie aktywne' },
  { time: '20:00', period: 'Zmierzch', rule: 'Fioletowe pola na mapie aktywne' },
  { time: '21:00', period: 'Zmierzch', rule: 'Fioletowe pola na mapie aktywne' },
  { time: '22:00', period: 'Zmierzch', rule: 'Fioletowe pola na mapie aktywne' },
  { time: '23:00', period: 'Zmierzch', rule: 'Fioletowe pola na mapie aktywne' },
  { time: '00:00', period: 'Zmierzch', rule: 'Fioletowe pola na mapie aktywne' },
  { time: 'Po północy', period: 'Noc', rule: 'W każdej turze przed wykonaniem ruchu każdy z graczy -1 karta z ręki albo -1PA' }
];

// ---------------------------------------------------------
// CARDS
// ---------------------------------------------------------

export const CARDS: CardConfig[] = [
  // KARTY MOCY
  { type: 'MOC', effect: 'Po zapadnięciu zmierzchu ignorujesz pola fioletowe', costPA: 1 },
  { type: 'MOC', effect: 'Usuń wybraną budowlę ze swojej lokalizacji.', costPA: 1 },
  { type: 'MOC', effect: 'Pobierz jednorazowo 2 kryształy z worka i umieść je w pokoju. Nie tracisz dodatkowego PA.', costPA: 1 },
  { type: 'MOC', effect: 'Przesuń się o 2 pola za darmo (0PA).', costPA: 1 },
  { type: 'MOC', effect: 'Do końca tej tury ignorujesz wagę plecaka.', costPA: 1 },
  { type: 'MOC', effect: 'Wykorzystując 2PA możesz przejść bezpośrednio do sąsiedniej lokalizacji bez powrotu do domku.', costPA: 1 },
  { type: 'MOC', effect: 'Jeśli jest Noc (po 18:00), Twój ruch kosztuje 1PA przez całą turę.', costPA: 1 },
  { type: 'MOC', effect: 'Przenieś się natychmiast do Domku.', costPA: 1 },
  { type: 'MOC', effect: 'Wszyscy gracze poza Tobą muszą oddać po 1 krysztale do worka lub tracą 1 PA w kolejnej turze.', costPA: 1 },
  { type: 'MOC', effect: 'Wszyscy gracze poza Tobą muszą odrzucić 1 kartę z ręki lub omijają kolejkę.', costPA: 1 },
  { type: 'MOC', effect: 'Wymień dowolną liczbę kryształów w swoim plecaku na nowe, losowe z worka.', costPA: 1 },
  { type: 'MOC', effect: 'Najbliższa runa, którą kupisz w tej turze, kosztuje o 1 kryształ mniej.', costPA: 1 },
  { type: 'MOC', effect: 'Odrzuć 2 inne karty z ręki, aby dobrać 2 kryształy z worka.', costPA: 1 },
  { type: 'MOC', effect: 'Zbierz do 2 kryształów z Banku w lokalizacji, w której stoisz do Twojego pokoju.', costPA: 1 },
  { type: 'MOC', effect: 'Zmień kolor 1 kryształu w swoim plecaku na dowolny inny kolor z worka.', costPA: 1 },
  { type: 'MOC', effect: 'KAŻDORAZOWO: Jeśli ktoś wejdzie na pole, na którym stoisz, otrzymujesz 1 kryształ z worka.', costPA: 1 },
  { type: 'MOC', effect: 'Usuń wybraną zagraną kartę mocy.', costPA: 1 },
  { type: 'MOC', effect: 'Skopiuj efekt dowolnej zagranej Karty Mocy przez innego gracza.', costPA: 1 },

  // KARTY BUDOWLI
  { type: 'BUDOWLA', effect: 'Kupienie runy w tej lokalizacji wymaga 2PA. Karta działa dla wszystkich.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Po zakupie runy gracz, który ją kupił ma klątwę. Omija następną kolejkę.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Po zakupie runy gracz zostaje zesłany na wygnanie do lokalizacji granica.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Jeśli inny gracz kupi tu runę, musi odrzucić 2 (zamiast 1) losowe karty z ręki.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Tylko właściciel budowli może korzystać z Banku w tej lokalizacji. Inni płacą z plecaka.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Wejście na pole tej lokalizacji kończy ruch gracza.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Na początku każdej godziny (od 8 do 24) dołóż 1 kryształ z worka do Banku w tej lokalizacji.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Będąc w Domku, możesz za 1 PA przenieść się natychmiast do tej budowli.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Bank w tej lokalizacji staje się wyłączną własnością przyjaciela lokalizacji. Można tylko wpłacać.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Każdy inny gracz wchodzący musi przerzucić 1 kryształ do pokoju przyjaciela.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Wchodząc tutaj, wylosuj kryształ. Twój kolor: +1 PA. Inny: -1 PA.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Jeśli w tej lokalizacji spotka się dwóch graczy, muszą wymienić się zawartością plecaków.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Jeśli rozpoczynasz swoją turę w tej lokalizacji, otrzymujesz 4 PA zamiast 3.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Raz na turę możesz wykonać darmową akcję (0 PA): Wylosuj 1 kryształ i dodaj go do wybranego Banku.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Raz na turę możesz dobrać 1 kartę za 0 PA.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Ruch z tej lokalizacji do Domku kosztuje Cię zawsze 1 PA.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Wymień do 2 kryształów ze swojego plecaka na 2 dowolnie wybrane z worka.', costPA: 1 },
  { type: 'BUDOWLA', effect: 'Wykonanie akcji "Zakup Runy" w tej lokalizacji kosztuje 0 PA.', costPA: 1 }
];
