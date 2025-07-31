# WeatherWatcher

WeatherWatcher je progresivní webová aplikace (PWA) pro sledování aktuálního a předpovězeného počasí s možností nastavení denních upozornění podle vlastních pravidel. Aplikace využívá open‑source modely **ICON‑D2** a **ICON‑EU** z API [Open‑Meteo](https://open-meteo.com/).

## Funkce

* **Aktuální počasí** – zobrazení teploty, srážek a vlhkosti pro Prahu.
* **Hodinová předpověď (48 h)** – horizontální seznam s hodnotami každou hodinu.
* **Týdenní předpověď (7 dní)** – seznam karet s maximem a minimem teploty a srážkami.
* **Nastavitelná upozornění** – v modálu lze zvolit čas a definovat sadu pravidel (např. „teplota > 25 °C po dobu ≥ 3 h“). Pokud jsou pravidla splněna, server odešle push notifikaci.
* **Offline režim** – díky servisnímu workeru aplikace funguje i bez připojení a využívá strategii „stale‑while‑revalidate“.
* **Instalace na plochu** – manifest umožňuje nainstalovat aplikaci na mobil či desktop (displej `standalone`).

## Struktura repozitáře

| Složka / soubor             | Popis                                                      |
| --------------------------- | ---------------------------------------------------------- |
| `public/`                   | Statické soubory – šablona HTML, manifest, ikony, service worker |
| `src/`                      | Zdrojové kódy front‑endu (React, TypeScript)               |
| `server/`                   | Jednoduchý Node.js server pro push notifikace (Express)    |
| `.github/workflows/ci.yml`  | Nastavení CI/CD – lint, testy, build a nasazení na GitHub Pages |

## Lokální spuštění (front‑end)

1. **Instalace závislostí**

   ```bash
   npm install
   ```

2. **Spuštění vývojového serveru**

   ```bash
   npm start
   ```

   Aplikace bude dostupná na `http://localhost:3000`. Service worker se v dev režimu neregistruje; pro testování PWA použijte `npm run build` a otevřete soubory v produkčním režimu.

## Lokální spuštění serveru pro notifikace

Server je samostatná Node.js aplikace ve složce `server`. Slouží k ukládání push subscription, plánování úloh a odesílání push notifikací pomocí [web‑push](https://github.com/web-push-libs/web-push).

1. **Nainstalujte závislosti serveru**

   ```bash
   cd server
   npm install
   ```

2. **Vytvořte VAPID klíče** (pokud je ještě nemáte). Můžete použít následující skript v Node.js:

   ```js
   const webpush = require('web-push');
   const keys = webpush.generateVAPIDKeys();
   console.log(keys);
   ```

   Klíče zadejte do proměnných prostředí `VAPID_PUBLIC_KEY` a `VAPID_PRIVATE_KEY` nebo je upravte přímo v `server/index.js`.

3. **Spusťte server**

   ```bash
   node index.js
   ```

   Server poslouchá na portu `4000` a poskytuje API:

   * `POST /api/subscribe` – uloží push subscription.
   * `POST /api/schedule` – naplánuje denní kontrolu počasí podle definovaných pravidel a pošle notifikaci, pokud jsou splněna.

## Nasazení

Workflow v `.github/workflows/ci.yml` při každém pushi do větve `main` spustí lint, testy, sestavení a poté nasadí statické soubory z `build/` na GitHub Pages (větev `gh-pages`).

Pro produkční provoz backendu je potřeba nasadit server (např. na Heroku, Render.com či jiný Node.js hosting) a upravit v klientu URL pro API (`/api/…` → `https://your-domain/api/…`).

## Poznámky k push notifikacím na iOS

Pro plně funkční webové push notifikace na iOS je nezbytné, aby uživatel přidal PWA na domovskou obrazovku (přes Safari → sdílet → „Přidat na plochu“) a potvrdil oznámení. Aplikace také vyžaduje HTTPS a zobrazuje notifikace pouze tehdy, pokud v servisním workeru voláte `event.waitUntil(self.registration.showNotification(...))` – to je implementováno v souboru `public/service-worker.js`.

## Licence

Tento projekt je poskytován „tak jak je“ pro demonstrační účely. Můžete jej upravit a rozšířit dle svých potřeb.