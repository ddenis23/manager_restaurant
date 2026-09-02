# Kitchen Operations Tool

> **KitchenManager** — aplicație desktop pentru gestiunea unui restaurant: evenimente, comenzi către furnizori, rețete, ingrediente și programul personalului.

Construită cu **Electron** peste un front-end scris în JavaScript vanilla, HTML5 și CSS3 — fără framework, fără backend. Toate datele sunt stocate local, pe calculatorul utilizatorului.

---

## Funcționalități

| Modul | Descriere |
|---|---|
| 📅 **Calendar** | Planificarea evenimentelor pe zile, cu număr de porții, rețete asociate și calculul automat al ingredientelor necesare. Export Excel per eveniment. |
| 🛒 **Comenzi** | Generarea listelor de aprovizionare grupate pe categorii și furnizori (legume & fructe, aprovizionare generală, altele), cu export Excel. |
| 🍽️ **Rețete** | Rețete cu ingrediente și cantități, în trei moduri de calcul: per bucată, per greutate sau per rețetă. Export individual sau al întregului recepetar. |
| 📦 **Ingrediente** | Nomenclator de ingrediente cu unitate de măsură, categorie și furnizor asociat. |
| 👥 **Program** | Planificator de ture pentru personal, cu vizualizare lunară sau săptămânală, zoom pe tabel și export Excel. |
| 💾 **Backup / Restore** | Salvarea completă a bazei de date într-un fișier `.json` și restaurarea ei. |

Interfața este responsivă: sidebar pe desktop, bottom navigation pe ecrane mici. Tema este dark, cu un design system propriu construit pe CSS Custom Properties.

---

## Stack tehnic

- **Electron 34** — shell desktop cross-platform (`contextIsolation` activ, `nodeIntegration` dezactivat)
- **JavaScript ES6+** — logica aplicației, vanilla, fără framework
- **HTML5 / CSS3** — CSS Custom Properties, Grid & Flexbox, media queries, animații
- **ExcelJS 4.3** — generarea rapoartelor `.xlsx`
- **Web Storage API** — persistența datelor (`localStorage`) și a sesiunii (`sessionStorage`)
- **electron-builder 25** — împachetare și installer Windows (NSIS)

---

## Instalare și rulare

Necesită [Node.js](https://nodejs.org/) 18 sau mai nou.

```bash
git clone https://github.com/ddenis23/Kitchen-Operations-Tool.git
cd Kitchen-Operations-Tool
npm install
npm start
```

### Build installer Windows

```bash
npm run build
```

Installer-ul rezultat (`RestaurantManager Setup <versiune>.exe`, conform `productName` din `package.json`) apare în directorul `dist/`.

---

## Autentificare

Aplicația pornește cu un ecran de login. Credențialele implicite sunt definite în [`app/js/auth.js`](app/js/auth.js) și trebuie schimbate înainte de utilizare reală:

```js
var USERS = { admin: 'unda' };
```

> ⚠️ Autentificarea este una locală, de tip *gate* pentru interfață — nu este un mecanism de securitate. Datele sunt stocate necriptat în `localStorage`.

---

## Structura proiectului

```
.
├── main.js                 # Electron main process — fereastră, meniu, linkuri externe
├── package.json            # dependențe + configurație electron-builder
└── app/
    ├── index.html          # shell-ul aplicației, ecranul de login, navigația
    ├── icon.png            # iconița aplicației
    ├── css/
    │   ├── variables.css   # design tokens: paletă, tipografie, spacing
    │   ├── layout.css      # sidebar, header, bottom nav, grid principal
    │   ├── components.css  # butoane, carduri, modale, tabele
    │   ├── calendar.css    # stiluri specifice calendarului
    │   ├── sections.css
    │   ├── login.css
    │   └── animations.css
    └── js/
        ├── data.js         # helper localStorage, constante, date demo
        ├── utils.js        # helpere DOM, modale, workbook Excel, resize
        ├── auth.js         # login / logout
        ├── calendar.js     # modulul Calendar + exporturi
        ├── ingredients.js  # modulul Ingrediente
        ├── recipes.js      # modulul Rețete
        ├── orders.js       # modulul Comenzi
        ├── staff.js        # modulul Program personal
        └── app.js          # backup/restore, tab switching, init
```

Scripturile sunt încărcate în ordine în `index.html`; fiecare modul își expune funcțiile de randare (`renderCal`, `renderOrders`, …) apelate de router-ul de tab-uri din `app.js`.

---

## Licență

MIT
