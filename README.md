# Umaiza's Puzzle World

Colourful puzzle PWA for Umaiza (Phase 1: no login, data saved on the device).

## Put it on GitHub Pages
1. Create a new GitHub repository (e.g. `umaiza-puzzles`).
2. Upload everything from this folder (keep the folders `js`, `css`, `icons`, `books`).
3. Settings -> Pages -> Deploy from branch `main` / root.
4. Open `https://<your-name>.github.io/umaiza-puzzles/` on the computer, then "Add to Home screen" on the phone.

## First use
- Parent PIN is **1234**. Change it in Parent area (gear button) -> Settings.
- Fill Profile (father's / mother's name etc.) in Parent area -> Profile. It prints on every certificate.
- Certificates come after every 10 puzzles (change to 20 in Settings).

## What is inside
- 18 auto-generated game types, 5 levels each (levels go up and down by themselves).
- 7 puzzle books (350 puzzles) as a library with print, check answer and star rewards.
- Dashboard: sort A-Z / category / level / stars / own order, card size, hide, rename, colour, emoji.
- Parent area: edit profile, history (edit/delete), levels, certificates, print worksheets, backup.

## Updating later
When you change any file, also change `V='uw-v4'` at the top of `sw.js` (e.g. `uw-v5`) so phones fetch the new version.


## Levels (1-10)
- Every game now has 10 levels. They go up by themselves (3 first-try wins in a row) and down gently (2 misses in a row).
- Parent area -> Levels: set each game by hand, or "Set ALL games to level N".
- Parent area -> Settings -> "Highest level allowed": caps every game (e.g. 6) so it never goes higher.

## Adding more puzzle books later
Book pictures live in `books/` and the list in `books.json`; book names/colours live in `bookmeta.json`.
A new book = new webp files + new rows in `books.json` + one new row in `bookmeta.json`, then bump `V` in `sw.js`.
