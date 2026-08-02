# OpenTAX web

The OpenTAX trading interface: markets, a professional chart + order book trading screen, wallet, portfolio, staking, earn, swap, alerts, launchpad, referral, developer portal, and backoffice.

Market data **streams live from Kraken** (public REST + WebSocket, no key) with a graceful fallback to seeded mock data when the feed is unreachable. A **LIVE/DEMO** toggle in the header switches sources. Orders and balances are paper-trading mocks; the real OpenDAX REST/WS APIs (Peatio + Barong + Ranger) plug in behind the same `MarketDataProvider` interface.

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
- Data layer: `src/lib/provider.ts` (interface), `src/lib/kraken.ts` (live), `src/lib/mockProvider.ts` (demo), `src/lib/DataContext.tsx` (React hooks)
