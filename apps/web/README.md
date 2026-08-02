# OpenTAX web

The OpenTAX trading interface: markets, a professional chart + order book trading screen, wallet, portfolio, staking, earn, swap, alerts, launchpad, referral, developer portal, and backoffice — powered by mock data for now, wired to the OpenDAX REST/WS APIs (Peatio + Barong + Ranger) once deployed.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # typecheck + production bundle
npm run typecheck
```

## Stack

- Vite 5 + React 18 + TypeScript (strict)
- Tailwind CSS 3 (dark-only design system, `src/index.css`)
- react-router-dom 6, lightweight-charts 4
- Mock data layer in `src/lib/mock.ts` — swap `api` calls for the live exchange client later
