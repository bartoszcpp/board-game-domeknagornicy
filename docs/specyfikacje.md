# Specyfikacje — Domek na górnicy

> Transkrypcja z pliku źródłowego `docs/zrodla/domek-na-gornicy-specyfikacje.pdf`.
> Plik źródłowy jest wersją nadrzędną — w razie rozbieżności obowiązuje oryginał.
> Dane w tej tabeli są odwzorowane w `src/config/gameConfig.ts`.

## Postacie

| Postać    | Cecha specjalna | Azyl (przyjazna lokalizacja) | Wroga lokalizacja | Sloty w plecaku | Lekki plecak | Ciężki plecak | Kolor    |
|-----------|-----------------|------------------------------|-------------------|-----------------|--------------|---------------|----------|
| Kupiec    | Każdy ruch to 1 PA (niezależnie od obciążenia plecaka) | Altana: (1 PA) Pobierz 2 kryształy z worka do plecaka | Wzgórze | 6 | 0–6 | brak | Żółty |
| Strażnik  | Szybki start: pierwsza akcja Ruchu w każdej turze jest darmowa (0 PA) | Palenisko: (1 PA) Pobierz 3 kryształy z worka do pokoju w domku | Lasek | 6 | 0–3 | 4–6 | Czerwony |
| Badacz    | Wyślij 1 kryształ z pokoju w domku do banku dowolnej lokalizacji (tylko w domku) – 1 PA, raz na turę | Wzgórze: zdalny zakup runy neutralnej za 2 kryształy (1 PA, raz na grę) | Palenisko | 6 | 0–3 | 4–6 | Niebieski |
| Wędrowiec | Ekspert: raz na turę podczas Czerpania dobierasz 2 kryształy zamiast 1 | Lasek: (1 PA) Weź żeton teleportu (jednorazowy skok gdziekolwiek) | Altana | 6 | 0–3 | 4–6 | Zielony |

## Lokalizacje

| Lokalizacja | Azyl dla   | Wróg dla  | Akcja dla przyjaznej postaci | Odległość (standard) | Odległość (z fioletowymi) | Pozycja na mapie | Kolor    |
|-------------|------------|-----------|------------------------------|----------------------|---------------------------|------------------|----------|
| Lasek       | Wędrowiec  | Strażnik  | 1 PA: weź żeton teleportacji | 3 | 5 | Północ | Zielony |
| Palenisko   | Strażnik   | Badacz    | 1 PA: pobierz 3 kryształy z worka do pokoju | 2 | 3 | Północny-wschód | Czerwony |
| Altana      | Kupiec     | Wędrowiec | 1 PA: pobierz 2 kryształy z worka do plecaka | 1 | 1 | Wschód | Żółty |
| Wzgórze     | Badacz     | Kupiec    | 1 PA: kup runę neutralną zdalnie za 2 kryształy (1x na grę) | 4 | 7 | Południe | Niebieski |
| Domek       | —          | —         | Neutralna dla wszystkich | 0 | 0 | Centrum mapy | Biały |
| Granica     | —          | —         | Neutralna dla wszystkich | 2 | 3 | Zachód | Czarny |

## Harmonogram (Godzina → Typ → Zasada)

| Godzina    | Typ      | Zasada |
|------------|----------|--------|
| 08:00–12:00| Poranek  | Dołóż `1 kryształ * liczba graczy` na stół w domku |
| 13:00–18:00| Dzień    | Nic nie dokładaj |
| 19:00–00:00| Zmierzch | Fioletowe pola na mapie aktywne |
| Po północy | Noc      | W każdej turze przed ruchem: `-1 karta z ręki` albo (brak/rezygnacja) `-1 PA` |

## Karty

### Karty mocy (jednorazowe w momencie zagrania, chyba że napisano inaczej)

- Po zapadnięciu zmierzchu ignorujesz pola fioletowe.
- Usuń wybraną budowlę ze swojej lokalizacji (nie musisz tam być).
- Pobierz jednorazowo 2 kryształy z worka do pokoju. Nie tracisz dodatkowego PA.
- Przesuń się o 2 pola za darmo (0 PA).
- Do końca tej tury ignorujesz wagę plecaka (zawsze 1 PA za ruch).
- Wykorzystując 2 PA przejdź bezpośrednio do sąsiedniej lokalizacji bez powrotu do domku.
- Jednorazowo po 19:00: w Nocy Twój ruch kosztuje 0 PA przez całą turę.
- Przenieś się natychmiast do Domku.
- Wszyscy gracze poza Tobą oddają po 1 krysztale do worka (lub -1 PA w kolejnej turze).
- Wszyscy gracze poza Tobą odrzucają 1 kartę z ręki (lub omijają kolejkę).
- Wymień dowolną liczbę kryształów z plecaka na losowe z worka.
- Najbliższa runa kupiona w tej turze kosztuje o 1 kryształ mniej.
- Odrzuć 2 inne karty z ręki, aby dobrać 2 kryształy z worka.
- Zbierz do 2 kryształów z Banku w Twojej lokalizacji do pokoju.
- Zmień kolor 1 kryształu w plecaku na dowolny inny z worka.
- KAŻDORAZOWO: jeśli ktoś wejdzie na Twoje pole, dostajesz 1 kryształ z worka.
- Usuń wybraną zagraną kartę mocy.
- Skopiuj efekt dowolnej zagranej Karty Mocy innego gracza.

### Karty budowli

- Kupienie runy w tej lokalizacji wymaga 2 PA (działa dla wszystkich).
- Po zakupie runy kupujący ma klątwę – omija następną kolejkę.
- Po zakupie runy gracz zostaje zesłany na wygnanie do Granicy.
- Jeśli inny gracz kupi tu runę, odrzuca 2 (zamiast 1) losowe karty z ręki.
- Tylko właściciel budowli może korzystać z Banku; inni płacą tylko z plecaka.
- Wejście na pole tej lokalizacji kończy ruch gracza.
- Na początku każdej godziny (8–24) dołóż 1 kryształ z worka do Banku tej lokalizacji.
- Będąc w Domku, za 1 PA przenieś się natychmiast do tej budowli (dla wszystkich).
- Bank staje się wyłączną własnością przyjaciela lokalizacji (inni tylko wpłacają).
- Każdy inny wchodzący musi przerzucić 1 kryształ do pokoju przyjaciela.
- Wchodząc tu, wylosuj kryształ: Twój kolor +1 PA, inny -1 PA.
- Jeśli spotkają się tu dwaj gracze, wymieniają się zawartością plecaków.
- Jeśli rozpoczynasz turę w tej lokalizacji, otrzymujesz 4 PA zamiast 3.
- Raz na turę darmowa akcja (0 PA): wylosuj kryształ i dodaj do wybranego Banku.
- Raz na turę dobierz 1 kartę za 0 PA.
- Ruch z tej lokalizacji do Domku kosztuje zawsze 0 PA.
- Wymień do 2 kryształów z plecaka na 2 wybrane z worka (nie losujesz).
- Akcja „Zakup Runy" w tej lokalizacji kosztuje 0 PA.
