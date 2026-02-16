# Custom FinAid Dashboard

Interactive web application for projecting aggregate Federal Work Study (FWS) and Arizona Financial Aid Trust (AFAT) awards over time for M.D. students at the University of Arizona College of Medicine–Tucson.

## Features

- **Interactive chart**: Cumulative aggregate dollar amounts over projected years
- **Real-time updates**: Chart and summary cards update as you adjust variables
- **Variable controls**: Sliders and number inputs for all parameters
- **Grant vs. loan comparison**: Annual and cumulative totals, plus comparison to Graduate PLUS loan costs (origination fee + daily-compounded interest)

## Variables

- Total M.D. students enrolled (450–550)
- % awarded AFAT (0–50%)
- % awarded FWS (0–50%)
- Average AFAT amount per student (fixed at $3,000)
- Average FWS amount per student ($3,000–$15,000)
- Total years projected (0–30)
- Grad PLUS loan interest rate (5.30%–10.50%)

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
```

Output is in the `dist/` folder. Serve with any static host (e.g. GitHub Pages, Netlify, Vercel).

### Preview production build locally

```bash
npm run preview
```

## Deployment

- **GitHub Pages**: Build, then enable Pages for the repo and set the source to the `dist` folder (or use a GitHub Actions workflow).
- **Netlify / Vercel**: Connect the repo; build command `npm run build`, publish directory `dist`.

## How it works

- Grant totals: AFAT and FWS amounts based on student counts and average awards.
- Loan comparison: Same amounts as Graduate PLUS loans with 4.228% origination fee and daily-compounded interest at the selected rate.
