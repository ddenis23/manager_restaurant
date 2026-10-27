# Kitchen Operations Tool

> **RestaurantManager** — a Windows desktop app for running a restaurant kitchen: events, supplier orders, recipes, ingredients and staff schedules. 🇷🇴 [Versiunea în română](README.ro.md)

I built it to solve real problems from my own workplace as a cook / shift chef. It runs on **Electron** with a vanilla JavaScript, HTML5 and CSS3 front end — no framework, no backend. All data stays on the user's computer.

## Features

| Module | What it does |
|---|---|
| 📅 **Calendar** | Plan events by day with number of servings and linked recipes; calculates the required ingredients automatically. Excel export per event. |
| 🛒 **Orders** | Generates supply lists grouped by category and supplier (produce, general supplies, other), with Excel export. |
| 🍽️ **Recipes** | Recipes with ingredients and quantities in three calculation modes: per piece, per weight or per batch. Export a single recipe or the whole recipe book. |
| 📦 **Ingredients** | Ingredient catalogue with unit of measure, category and supplier. |
| 👥 **Staff schedule** | Shift planner with monthly or weekly view, table zoom and Excel export. |
| 💾 **Backup / Restore** | Saves the whole database to a `.json` file and restores it. |

Responsive UI: sidebar on desktop, bottom navigation on small screens. Dark theme with a custom design system built on CSS Custom Properties.

## Tech stack

- **Electron 34** — cross-platform desktop shell (`contextIsolation` on, `nodeIntegration` off)
- **JavaScript ES6+** — vanilla, no framework
- **HTML5 / CSS3** — Custom Properties, Grid & Flexbox, media queries, animations
- **ExcelJS** — `.xlsx` report generation
- **Web Storage API** — data persistence (`localStorage`) and session (`sessionStorage`)
- **electron-builder 25** — packaging and Windows installer (NSIS)

## Install and run

Requires [Node.js](https://nodejs.org/) 18 or newer.

```bash
git clone https://github.com/ddenis23/manager_restaurant.git
cd manager_restaurant
npm install
npm start
```

### Build the Windows installer

```bash
npm run build
```

The installer (`RestaurantManager Setup <version>.exe`) is created in `dist/`.

## Login

The app opens with a login screen. The default credentials are defined in [`app/js/auth.js`](app/js/auth.js) and should be changed before real use.

> ⚠️ This is a local UI gate, not a security mechanism. Data is stored unencrypted in `localStorage`.

## Project structure

```
.
├── main.js                 # Electron main process: window, menu, external links
├── package.json            # dependencies + electron-builder config
└── app/
    ├── index.html          # app shell, login screen, navigation
    ├── css/                # design tokens, layout, components, per-module styles
    └── js/
        ├── data.js         # localStorage helper, constants, demo data
        ├── utils.js        # DOM helpers, modals, Excel workbook helpers
        ├── auth.js         # login / logout
        ├── calendar.js     # Calendar module + exports
        ├── ingredients.js  # Ingredients module
        ├── recipes.js      # Recipes module
        ├── orders.js       # Orders module
        ├── staff.js        # Staff schedule module
        └── app.js          # backup/restore, tab routing, init
```

## License

MIT
