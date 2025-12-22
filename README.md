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
- Oznaczanie składu podstawowego (5 zawodników na boisku)
- Zarządzanie ławką rezerwowych

#### 🏀 Prowadzenie Meczu
- **Punktacja**: +1, +2, +3 punkty z ikonami (🎯 🏀 🚀)
- **Faule**: Osobiste i zespołowe z licznikiem (⚠️)
- **Rzuty wolne**: Celne/niecelne z ikonami (✅/❌)
- **Timeouty**: Limit 5 na mecz z kontrolą dostępności (⏸️)
- **4 kwarty**: Pełne wsparcie z przełączaniem (Q1-Q4)
- **Wybór zawodnika**: Kliknięcie przycisku zawodnika przed akcją

#### 👥 Zmiany Zawodników (NOWE!)
- **Drag & Drop**: Przeciągnij zawodnika i upuść na innego aby zamienić pozycje
- **Oznaczenia**: 🏀 ON COURT (5 max) | 💺 RESERVES
- **Wizualizacja**: Tylko nazwiska, duże przyciski (90×75px)
- **Responsywność**: Optymalizacja dla ekranów dotykowych
- **Scrollowanie**: Sekcja zawodników przewijalna, przyciski akcji zawsze widoczne

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
- Szczegółowy log meczu podzielony na połowy
- Miejsce na podpisy sędziów i komisarza
- Export do PDF przez przeglądarkę

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
- Dodaj zawodników z numerami
- Kliknij ikonę 🏀/💺 aby oznaczyć skład podstawowy (5 zawodników max)
- Opcjonalnie: importuj gotowy skład z JSON
- Kliknij **▶️ Rozpocznij Mecz**

#### 2. Game (🎮 zakładka)
Prowadzenie meczu na żywo:
1. **Wybierz zawodnika**: Kliknij jego przycisk (podświetli się)
2. **Zarejestruj akcję**: Kliknij odpowiedni przycisk (+1/+2/+3/Foul/FT)
3. **Zmiany zawodników**: Przeciągnij zawodnika i upuść na innego (zamiana pozycji)
4. **Przełączanie kwart**: Przyciski Q1-Q4
5. **Monitoring**: Sprawdzaj Game Log na dole strony
6. **Korekty**: Przycisk "Delete" przy każdej akcji w logu

#### 3. Stats (📊 zakładka)
Podgląd statystyk w trakcie meczu:
- Wynik aktualny
- Punkty/faule każdego zawodnika
- Skuteczność rzutów wolnych (team & player)

#### 4. Protocol (📋 zakładka)
Oficjalny dokument końcowy:
- Automatyczne generowanie po zakończeniu meczu
- **🖨️ Print**: Wydruk bezpośrednio z przeglądarki
- **📸 PDF**: File → Print → Save as PDF

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

### 🔒 Bezpieczeństwo i Prywatność
- 100% lokalnie - zero telemetrii
- Brak zewnętrznych API (poza CDN Vue.js)
- Pełna kontrola nad danymi
- Export/backup w każdej chwili

### 📱 UX i Dostępność
- Responsive design (Flexbox + CSS Grid)
- Touch-optimized (przyciski 75px+ wysokości)
- Keyboard navigation (pełne wsparcie)
- Visual feedback (ikony, kolory, stany hover/active)
- Scrollable player sections (przyciski akcji zawsze widoczne)

## Roadmap i Potencjalne Ulepszenia

### 🔮 Przyszłe Funkcje
- ⏱️ **Integracja z zegarem meczu** - synchronizacja z zewnętrznym timerem
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

**Licencja**: Aplikacja stworzona dla FIBA. Używaj zgodnie z regulaminem organizacji.

**Kontakt**: W razie problemów technicznych lub propozycji funkcjonalności, skontaktuj się z deweloperem.

**Changelog**:
- **v2.0** (Grudzień 2024): Refaktoryzacja modułowa + drag & drop substitutions
- **v1.0** (Grudzień 2024): Wersja początkowa z pełnym protokołem meczu

---

**Wersja**: 2.0  
**Data ostatniej aktualizacji**: Grudzień 22, 2025  
**Deweloper**: Łukasz Nowak + GitHub Copilot (AI)  
**Stack**: Vue.js 3 Production, HTML5, CSS3 Grid/Flexbox, LocalStorage API

