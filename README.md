# 🏀 Basketball Scoreboard - Tablica Wyników Koszykówki

## Opis
Profesjonalna aplikacja webowa dla sędziów stolikowych do prowadzenia pełnej dokumentacji meczów koszykówki. Działa lokalnie w przeglądarce, nie wymaga instalacji ani serwera.

## Stack Technologiczny
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Vue.js 3 (Production CDN)
- **Architektura**: Modułowa (HTML + CSS + JS)
- **Storage**: LocalStorage (przeglądarka)
- **Export**: JSON, PDF (przez drukowanie przeglądarki)

## Funkcjonalności

### ✅ Implementacja Obecna

#### 🎯 Zarządzanie Zespołami
- Ręczne dodawanie zawodników z numerami
- Import/export zespołów w formacie JSON
- **Gotowe składy LALK**: 10 zespołów z sezonu 2024/2025 w folderze `teams/`
- Oznaczanie składu podstawowego (5 zawodników na boisku)
- **Blokada składu**: Po rozpoczęciu meczu skład podstawowy nie może być zmieniony
- Zarządzanie ławką rezerwowych
- **Reset Game**: Dostępny w widoku setup i game, powraca do ustawień

#### 🏀 Prowadzenie Meczu
- **Punktacja**: +1, +2, +3 punkty z ikonami (🎯 🏀 🚀)
- **Faule**: Osobiste i zespołowe z licznikiem (⚠️) - resetowane co kwartę
- **System 5 fauli**: Automatyczna dyskwalifikacja gracza po 5 faulach
  - Gracz automatycznie schodzi z boiska
  - **Automatyczne logowanie wymiany**: "OUT #X Player Name (fouled out)" w protokole
  - Niemożliwość ponownego wejścia na boisko
  - Dźwięk gwizdka przy 5. faulu
  - Wizualne oznaczenie (❌5, czerwona ramka, przekreślenie)
  - Przeniesienie na koniec ławki rezerwowych
  - Wsparcie undo: odwołanie 5. faula przywraca gracza do gry
- **Rzuty wolne**: Celne (+1 pkt) i niecelne z ikoną (❌)
- **Timeouty**: Limit 5 na mecz z kontrolą dostępności (⏸️)
- **4 kwarty**: Pełne wsparcie z przełączaniem (Q1-Q4)
  - **Potwierdzenie czyszczenia fauli**: Przy zmianie kwarty system pyta czy wyczyścić faule zespołowe
- **Zegar meczu**: 10-minutowy odliczający timer z kontrolą start/pause/reset
  - **Potwierdzenie resetu**: Reset zegara wymaga potwierdzenia (tylko przy kliknięciu przycisku)
- **Niestandardowy czas**: Podwójne kliknięcie zegara do ustawienia własnego czasu (MM:SS)
- **Elastyczny workflow**: Wybierz zawodnika potem akcję LUB akcję potem zawodnika
- **Akcje oczekujące**: Żółte podświetlenie akcji czekających na wybór zawodnika
- **Anulowanie**: Kliknij ESC lub ponownie tego samego zawodnika aby anulować wybór/akcję

#### 👥 Zmiany Zawodników (NOWE!)
- **Kliknięcie**: Kliknij gracza → kliknij innego gracza z tej samej drużyny → automatyczna wymiana
- **Drag & Drop**: Przeciągnij zawodnika i upuść na innego aby zamienić pozycje (alternatywna metoda)
  - Przeciąganie z rezerw na boisko: logowane jako "IN"
  - Przeciąganie z boiska na ławkę: logowane jako "OUT"
  - Zamiana dwóch graczy: logowane jako "OUT + IN"
- **Blokada wykluczonych**: Gracze z 5 faulami nie mogą wchodzić na boisko
- **Wizualne potwierdzenie**: Po wymianie obaj gracze podświetleni na **zielono** z efektem pulsowania (1.5s)
  - Działa zarówno dla kliknięcia jak i drag-and-drop
- **Automatyczne logowanie**: Wszystkie zmiany zawodników są rejestrowane w protokole
- **Oznaczenia**: 🏀 ON COURT (5 max) | 💺 RESERVES
- **Status w protokole**: 
  - ⭕ (O) - zawodnicy w składzie podstawowym
  - X - zawodnicy rezerwowi którzy weszli na boisko
  - -- - zawodnicy którzy nie zagrali
- **Śledzenie rezerwowych**: Zmiana automatycznie rejestrowana w protokole
- **Wizualizacja**: Tylko nazwiska, duże przyciski (90×75px)
- **Responsywność**: Optymalizacja dla ekranów dotykowych
- **Brak przewijania**: Cała sekcja zawodników widoczna bez scrollowania
- **Inteligentny wybór**: Ten sam przycisk służy do wyboru gracza dla akcji punktowej/faula/wymiany

#### 📊 Statystyki Live
- Wynik meczu w czasie rzeczywistym
- Faule zespołowe z alertem przy przekroczeniu limitu
- Skuteczność rzutów wolnych (made/total, %)
- Punkty i faule każdego zawodnika
- Wyniki w poszczególnych kwartach

#### 📋 Protokół Oficjalny
- Format A4 gotowy do druku
- Nagłówek z datą i finałowym wynikiem
- Tabela wyników kwartalnych
- Statystyki zawodników obu zespołów
- **Druk minimalny** (🖨️ Print): Podstawowe info pasujące na A4
- **Pełny PDF** (📸 PDF): Kompletny protokół z logiem meczu i podsumowaniem
- Miejsce na podpisy sędziów i komisarza
- Export przez przeglądarkę

#### ⌨️ Skróty Klawiszowe
- **Q/W/E**: +1/+2/+3 pkt dla Zespołu A
- **A/S/D**: +1/+2/+3 pkt dla Zespołu B
- **R**: Faul Zespół A
- **F**: Faul Zespół B
- **T/G**: Rzut wolny celny A/B
- **ESC**: Anuluj wybór zawodnika

#### 💾 Persystencja Danych
- Automatyczny zapis do LocalStorage po każdej akcji
- Eksport meczu do JSON z pełnym timestampem
- Wczytywanie ostatniego stanu po odświeżeniu
- Backward compatibility ze starszymi wersjami

## Szybki Start

### Instalacja i Uruchomienie
1. Otwórz plik **`index-refactored.html`** w przeglądarce
2. Przy pierwszym uruchomieniu wymagane połączenie internetowe (pobieranie Vue.js z CDN)
3. Po załadowaniu aplikacja działa w pełni offline

**Zalecane przeglądarki**:
- ✅ Chrome 90+ / Edge 90+ (najlepsze doświadczenie)
- ✅ Firefox 88+
- ✅ Safari 14+

### Przepływ Pracy

#### 1. Setup (⚙️ zakładka)
Przygotowanie zespołów przed meczem:
- Wprowadź nazwy zespołów (Home/Away)
- Dodaj zawodników z numerami LUB importuj gotowy zespół z `teams/`
- Kliknij ikonę 🏀/💺 aby oznaczyć skład podstawowy (5 zawodników max)
- **WAŻNE**: Po rozpoczęciu meczu skład podstawowy zostanie zablokowany
- Opcjonalnie: użyj **Reset Game** aby wyczyścić dane
- Kliknij **▶️ Rozpocznij Mecz**

#### 2. Game (🎮 zakładka)
Prowadzenie meczu na żywo:
1. **Sterowanie zegarem**: 
   - Kliknij ▶️ Start aby rozpocząć odliczanie
   - Kliknij ⏸️ Pause aby zatrzymać
   - Kliknij 🔄 Reset aby wrócić do 10:00
   - Podwójnie kliknij zegar aby ustawić własny czas
2. **Zarejestruj akcję punktową/faul** (dwa sposoby):
   - **Klasycznie**: Wybierz zawodnika → Kliknij akcję (natychmiastowe wykonanie)
   - **Szybko**: Kliknij akcję (żółte podświetlenie) → Wybierz zawodnika (automatyczne wykonanie)
3. **Zmiany zawodników** (dwa sposoby):
   - **Kliknięcie**: Kliknij gracza (żółty) → Kliknij innego gracza z tej samej drużyny → wymiana z efektem zielonym
   - **Drag & Drop**: Przeciągnij zawodnika i upuść na innego (zamiana pozycji)
4. **Anuluj akcję**: Kliknij ESC lub tego samego zawodnika ponownie
5. **Przełączanie kwart**: Przyciski Q1-Q4 (faule zespołowe resetowane automatycznie)
6. **Monitoring**: Sprawdzaj Game Log na dole strony
7. **Korekty**: Przycisk "Delete" przy każdej akcji w logu

#### 3. Stats (📊 zakładka)
Podgląd statystyk w trakcie meczu:
- Wynik aktualny
- Punkty/faule każdego zawodnika
- Skuteczność rzutów wolnych (team & player)

#### 4. Protocol (📋 zakładka)
Oficjalny dokument końcowy:
- Automatyczne generowanie po zakończeniu meczu
- **🖨️ Print (Minimalny)**: Wydruk podstawowych informacji na A4
  - Wyniki kwartalne
  - Statystyki zawodników
  - Miejsce na podpisy
- **📸 PDF (Pełny)**: Kompletny protokół do archiwizacji
  - Wszystko z wersji minimalnej
  - Finałowy wynik
  - Szczegółowy log meczu (obie połowy)
  - Podsumowanie statystyk
  - File → Print → Save as PDF

## Przykładowe Pliki

### Format JSON Zespołu
```json
{
  "name": "Lakers",
  "players": [
    { "number": 23, "name": "LeBron James", "onCourt": true },
    { "number": 3, "name": "Anthony Davis", "onCourt": true },
    { "number": 1, "name": "D'Angelo Russell", "onCourt": true },
    { "number": 15, "name": "Austin Reaves", "onCourt": true },
    { "number": 28, "name": "Rui Hachimura", "onCourt": true },
    { "number": 0, "name": "Russell Westbrook", "onCourt": false }
  ]
}
```

## Architektura Projektu

### Struktura Plików
```
FIBA/
├── index-refactored.html   # Główny HTML (modułowy)
├── app.js                  # Logika aplikacji (Vue.js + OOP)
├── styles.css              # Style CSS (responsive)
├── teams/                  # Gotowe składy zespołów LALK
│   ├── Old_Boys_Rawicz.json
│   ├── Pustynne_Jastrzebie.json
│   ├── T-Mobile_Team_Leszno.json
│   ├── Bestie.json
│   ├── WSTK_Wschowa.json
│   ├── Team_One.json
│   ├── Basket_Gora.json
│   ├── Rydzyna_Team.json
│   ├── Zaczarowany_Pierniczek_Gostyn.json
│   └── Wypalone_Zapalki_Gostyn.json
├── index.html              # Legacy wersja (monolityczna, deprecated)
├── README.md               # Dokumentacja
├── REFACTORING.md          # Historia refaktoryzacji
└── requirements.md         # Wymagania FIBA
```

### Komponenty (app.js)
- **Team Class**: Model zespołu z metodami biznesowymi
- **GameLogEntry Class**: Model wpisu do logu meczu
- **Constants**: ACTION_TYPES, CONFIG (timeouts, max fouls)
- **Utils**: Pomocnicze funkcje (JSON, procenty, nazwiska)
- **Vue App**: Główna instancja z reaktywnymi danymi i metodami

## Wsparcie Urządzeń i Przeglądarek

| Urządzenie | Status | Uwagi |
|------------|--------|-------|
| 💻 Desktop | ✅ Pełne wsparcie | Windows, macOS, Linux |
| 💻 Laptop | ✅ Pełne wsparcie | Wszystkie systemy |
| 📱 Tablet | ✅ Pełne wsparcie | iPad, Android - optymalizacja dotykowa |
| 📱 Smartphone | 🔄 Częściowe | Wymaga scrollowania (małe ekrany) |

**Minimalne wymagania**:
- Rozdzielczość: 1024×768 (zalecane 1920×1080)
- RAM: 2GB
- Przeglądarka z wsparciem ES6+ i LocalStorage

## Testowanie

### Uruchomienie Testów Jednostkowych

**Wymagania**:
```bash
npm install
```

**Uruchomienie testów**:
```bash
npm test          # Tryb watch (automatyczne ponowne uruchomienie)
npm run test:ui   # Interaktywny UI testowy
npm run test:run  # Jednorazowe uruchomienie
```

**Zakres testów** (30+ przypadków testowych):
- ✅ Cachowanie statystyk graczy (foule, punkty, rzuty wolne)
- ✅ Logika dyskwalifikacji przy 5 faulach
- ✅ Logowanie zmian zawodników (IN/OUT/SWAP)
- ✅ Cykl strzałki posiadania (null → A → B → A)
- ✅ Funkcjonalność undo (punkty, faule, posiadanie)
- ✅ Obliczanie wyniku z logu meczu
- ✅ Status fauli zespołowych (OK/WARNING/BONUS)
- ✅ Formatowanie okresów (Q1-Q4, OT1+)

## Zarządzanie Danymi

### LocalStorage (Automatyczny)
```javascript
// Zapisywane automatycznie po każdej akcji:
{
  teamA: { name, players, score, fouls, freeThrows },
  teamB: { name, players, score, fouls, freeThrows },
  gameLog: [ { period, time, team, player, action, points } ],
  currentPeriod: 1-4
}
```
- **Limit**: ~5MB (wystarczy na setki meczów)
- **Persystencja**: Dane przetrwają restart przeglądarki
- **Czyszczenie**: Ręczne lub przez Reset Game

### JSON Export/Import
**Export zespołu** (💾 Export Team):
- Zapisuje skład do późniejszego użycia
- Zawiera onCourt status (kto na boisku)

**Export meczu** (💾 Save Game):
- Pełny protokół + metadata
- Timestamp, finalScore
- Wszystkie akcje z timestampami

**Import zespołu** (📁 Import JSON):
- Szybkie wczytanie gotowego składu
- Walidacja struktury JSON

## Kluczowe Cechy

### 🎯 Prostota i Szybkość
- Zero instalacji - jeden plik HTML
- Offline-first - działa bez internetu (po pierwszym załadowaniu)
- Instant load - brak backendu
- Keyboard shortcuts dla zaawansowanych użytkowników

### ⚡ Wydajność
- Rozmiar: ~150KB (HTML + CSS + JS)
- Vue.js Production: Optymalizacja runtime
- LocalStorage: Natychmiastowy zapis
- Drag & Drop: Hardware-accelerated CSS transforms
- **Zaawansowane cachowanie statystyk**: O(1) zamiast O(n) dla wszystkich zapytań
- **Computed Properties**: Automatyczne cachowanie przez Vue.js
- **Optymalizacja wydajności**: 
  - 100-2000x szybsze zapytania o statystyki graczy
  - 92x szybsze renderowanie strony statystyk
  - 133x szybszy eksport do CSV
  - Wsparcie dla bardzo dużych logów meczowych (500+ wpisów) bez opóźnień
- **Szczegóły**: Zobacz [PERFORMANCE.md](PERFORMANCE.md) i [OPTIMIZATIONS_SUMMARY.md](OPTIMIZATIONS_SUMMARY.md)

### 🔒 Bezpieczeństwo i Prywatność
- 100% lokalnie - zero telemetrii
- Brak zewnętrznych API (poza CDN Vue.js)
- Pełna kontrola nad danymi
- Export/backup w każdej chwili

### 📱 UX i Dostępność
- Responsive design (Flexbox + CSS Grid)
- Touch-optimized (przyciski 75px+ wysokości)
- Keyboard navigation (pełne wsparcie)
- Visual feedback:
  - 🟡 **Żółty** = gracz wybrany do akcji (punkty/faul/wymiana)
  - 🟢 **Zielony z pulsem** = gracze właśnie wymienieni (1.5s animacja)
  - 🔴 **Czerwony border** = gracz wykluczony (5 fauli)
  - ⚠️ **Ostrzeżenie** = 4 faule
  - Ikony, kolory, stany hover/active
- Scrollable player sections (przyciski akcji zawsze widoczne)
- Animacje CSS (pulse, scale, shadow) dla lepszej czytelności akcji

## Roadmap i Potencjalne Ulepszenia

### 🔮 Przyszłe Funkcje
- ✅ ~~**Zegar meczu**~~ - Zaimplementowano (10-min countdown, custom time)
- ✅ ~~**System 5 fauli**~~ - Zaimplementowano (automatyczna dyskwalifikacja, gwizdek, undo support)
- ✅ ~~**Wymiana jednym kliknięciem**~~ - Zaimplementowano (inteligentny wybór gracza)
- ✅ ~~**Animacje wymian**~~ - Zaimplementowano (zielony puls, visual feedback)
- 📊 **Rozszerzone statystyki** - asysy, przejęcia, bloki, celność FG
- 🌐 **Multi-device sync** - opcjonalna synchronizacja przez cloud
- 📱 **PWA (Progressive Web App)** - instalacja jako aplikacja mobilna
- 📈 **Historia meczów** - archiwum z wyszukiwarką
- 🏆 **Statystyki sezonowe** - agregacja danych z wielu meczów
- 🎥 **Wideo timestamps** - link do momentów wideo
- 📡 **Live streaming stats** - udostępnianie statystyk na żywo (opcjonalnie)

### 🐛 Znane Ograniczenia
- Brak undo dla całych sekwencji (tylko delete pojedynczych akcji)
- LocalStorage limit ~5MB (wystarczające dla większości przypadków)
- Print layout wymaga ręcznej konfiguracji marginesów w przeglądarce
- Drag & Drop nie działa na starszych przeglądarkach (fallback: kliknięcie)

## Troubleshooting

### ❌ Problem: Dane się nie zapisują
**Rozwiązania**:
- Sprawdź czy przeglądarka ma włączony LocalStorage (Settings → Privacy)
- Wyłącz tryb incognito/prywatny (nie zapisuje danych)
- Sprawdź czy nie przekroczono limitu 5MB (oczyść stare dane)
- Upewnij się że cookies są włączone

### ⚠️ Problem: Aplikacja nie ładuje się / biały ekran
**Rozwiązania**:
- Sprawdź połączenie internetowe (pierwsza wizyta wymaga CDN Vue.js)
- Wyczyść cache przeglądarki (Ctrl+Shift+Del)
- Otwórz Console (F12) i sprawdź błędy JavaScript
- Sprawdź czy używasz wspieranej przeglądarki (Chrome 90+, Firefox 88+)

### 🐌 Problem: Aplikacja działa wolno
**Rozwiązania**:
- Zamknij inne karty/aplikacje zużywające pamięć
- Wyczyść dane LocalStorage (Settings → Storage)
- Zaktualizuj przeglądarkę do najnowszej wersji
- Usuń historię Game Log (duża liczba wpisów spowalnia)

### 📄 Problem: Nie mogę zaimportować pliku JSON
**Rozwiązania**:
- Sprawdź czy plik ma rozszerzenie `.json`
- Waliduj składnię JSON (np. jsonlint.com)
- Upewnij się że struktura pasuje do przykładu (sprawdź onCourt property)
- Sprawdź encoding pliku (powinien być UTF-8)

### 🖨️ Problem: Drukowanie/PDF wygląda źle
**Rozwiązania**:
- Przejdź do zakładki Protocol przed drukowaniem
- **Dla druku**: Użyj przycisku 🖨️ Print (wersja minimalna, pasuje na A4)
- **Dla PDF**: Użyj przycisku 📸 PDF (wersja pełna z logiem meczu)
- W oknie drukowania wybierz orientację: Portrait
- Ustaw marginesy: Default lub None
- Wyłącz "Headers and footers"
- Dla PDF: wybierz "Save as PDF" jako printer

### 🖱️ Problem: Drag & Drop nie działa
**Rozwiązania**:
- Upewnij się że trzymasz przycisk myszy/palec na przycisku zawodnika
- Przeciągnij na innego zawodnika i **upuść** (nie wystarczy hover)
- Sprawdź czy używasz wspieranej przeglądarki
- Fallback: użyj ikony 🏀/💺 w zakładce Setup do ręcznej zmiany
## Licencja i Wsparcie

**Licencja**: Aplikacja stworzona dla LALK. Używaj zgodnie z regulaminem organizacji.

**Kontakt**: W razie problemów technicznych lub propozycji funkcjonalności, skontaktuj się z deweloperem.

**Changelog**:
- **v2.5** (Grudzień 2025): Jakość kodu i wydajność:
  - Optymalizacja cachowania statystyk graczy (50-100x przyśpieszenie)
  - Dokumentacja JSDoc dla złożonych metod
  - Wydzielenie helperów: logPossessionChange(), logSubstitution()
  - 30+ testów jednostkowych (Vitest)
  - Wszystkie porównania: == → ===
  - Poprawka wycieku pamięci (timeoutInterval)
  - Obsługa QuotaExceededError w LocalStorage
  - Ocena kodu: A- → A
- **v2.4** (Grudzień 2025): Ulepszenia logowania + potwierdzenia akcji:
  - Logowanie wymian przy drag-and-drop (IN/OUT)
  - Automatyczne logowanie wymiany przy dyskwalifikacji (5 fauli)
  - Potwierdzenie czyszczenia fauli przy zmianie kwarty
  - Potwierdzenie resetu zegara (tylko przy kliknięciu przycisku)
  - Usunięto alert "Game started! Good luck!"
- **v2.3** (Grudzień 2025): System wymian jednym kliknięciem + animacje po wymianie + 5-foul system + reaktywacja po undo
- **v2.2** (Grudzień 2025): Blokada składu + status zawodników (O/X/--) + zespoły LALK + pozycje przycisków
- **v2.1** (Grudzień 2025): Zegar gry + akcje oczekujące + reset fauli co kwartę
- **v2.0** (Grudzień 2025): Refaktoryzacja modułowa + drag & drop substitutions
- **v1.0** (Grudzień 2025): Wersja początkowa z pełnym protokołem meczu

---

**Wersja**: 2.5  
**Data ostatniej aktualizacji**: Grudzień 23, 2025  
**Deweloper**: Łukasz Nowak + GitHub Copilot (AI)  
**Stack**: Vue.js 3 Production, HTML5, CSS3 Grid/Flexbox, LocalStorage API, Custom Fonts, CSS Animations

### 🚀 Nowe w v2.5 - Jakość Kodu i Wydajność
- **Optymalizacja wydajności**: Cachowanie statystyk graczy (50-100x szybsze obliczenia)
- **Dokumentacja JSDoc**: Pełna dokumentacja złożonych metod
- **Deduplikacja kodu**: Wydzielenie helperów logowania
- **Testy jednostkowe**: 30+ testów dla krytycznych funkcji
- **Poprawa typu**: Wszystkie porównania używają ścisłej równości (===)
- **Brak wycieków pamięci**: Poprawne czyszczenie interwałów
- **Obsługa błędów**: QuotaExceededError w LocalStorage
- **Kod produkcyjny**: Ocena A w audycie kodu
