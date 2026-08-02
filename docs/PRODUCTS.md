# OpenTAX Product Suite

The complete enterprise crypto exchange + crypto services platform, built as a
suite of web products layered on the OpenDAX exchange core (Peatio + Barong +
Ranger) and extended with Web3 and AI capabilities.

## A. Core Exchange (OpenDAX)

| # | Product | Status |
| --- | --- | --- |
| A1 | Trading platform (spot) — chart, order book, order form, trades | OpenDAX BaseApp |
| A2 | Admin panel — users, KYC, funds, markets | OpenDAX Tower |
| A3 | Auth + KYC + 2FA | OpenDAX Barong |
| A4 | Market data API + WebSocket | OpenDAX Ranger |
| A5 | Matching engine + accounting | OpenDAX Peatio |

## B. Trading & Markets Products

| # | Product | Status |
| --- | --- | --- |
| B1 | Advanced charting (lightweight-charts/trading-view) | To build |
| B2 | Markets directory — spot/derivatives list, sorting, search, favorites | To build |
| B3 | Order types UX — limit/market/stop-limit/OCO, TP/SL | To build |
| B4 | Paper trading / demo mode | To build |
| B5 | Copy trading / social trading feed | To build |
| B6 | Recurring buys / DCA automation | To build |
| B7 | Price alerts (push/web) | To build |
| B8 | OTC desk (RFQ workflow) | To build |
| B9 | Futures/margin (later phase) | Backlog |
| B10 | Trading API developer portal + key management | To build |

## C. Wallet & Funds

| # | Product | Status |
| --- | --- | --- |
| C1 | Spot wallet — balances, transfers, history | To build |
| C2 | Deposit/withdraw flows (crypto + fiat) | To build |
| C3 | Address book / allowlist | To build |
| C4 | Fee schedule & VIP tiers | To build |
| C5 | Non-custodial Web3 wallet (browser extension-style UI) | To build |
| C6 | Fiat on/off ramp integrations (Ach, cards, P2P) | Backlog |

## D. Earn & Crypto Services

| # | Product | Status |
| --- | --- | --- |
| D1 | Staking — lock, rewards, history | To build |
| D2 | Lending / Earn — flexible + fixed terms | To build |
| D3 | Swap / DEX aggregator (1inch/0x style) | To build |
| D4 | Token launchpad (IDO/ICO flow) | To build |
| D5 | Bridge / cross-chain (bridge aggregator) | Backlog |
| D6 | Crypto payments / merchant invoicing | To build |
| D7 | NFT marketplace (optional niche) | Backlog |

## E. Compliance, Risk & Backoffice

| # | Product | Status |
| --- | --- | --- |
| E1 | KYC workflow (Barong local or 3rd-party) | OpenDAX |
| E2 | AML / transaction monitoring dashboard | To build |
| E3 | Risk engine — limits, exposure, velocity checks | To build |
| E4 | Admin ops console (approvals, withdrawals review) | To build |
| E5 | Reporting & analytics (P&L, volume, fees) | To build |
| E6 | Audit log / immutable trail | To build |

## F. AI Employee Platform

| # | Product | Status |
| --- | --- | --- |
| F1 | AI support agent (help desk, docs RAG) | To build |
| F2 | AI trading assistant — market summaries, sentiment | To build |
| F3 | AI analyst — portfolio/reporting automation | To build |
| F4 | AI compliance assistant — KYC/AML screening support | To build |
| F5 | AI risk monitor — anomaly alerts | To build |
| F6 | Agent orchestration (multi-agent ops) | To build |

## G. Platform & Integration

| # | Product | Status |
| --- | --- | --- |
| G1 | Developer portal + API docs (OpenAPI) | To build |
| G2 | Webhooks system | To build |
| G3 | Referral / affiliate program | To build |
| G4 | Notification center (email/SMS/push) | To build |
| G5 | Mobile-responsive web app (PWA) | To build |
| G6 | Theme/customization (white-label) | To build |

## Build order

1. **Frontend foundation** (`apps/web`) — design system, routing, mock API, shell layout
2. **Trading suite (B1–B4)** + markets — flagship pages
3. **Wallet & funds (C1–C4)**
4. **Earn & services (D1–D4)** — staking, earn, swap, launchpad
5. **Compliance/backoffice (E)** + admin console
6. **AI platform (F)** — agents on top of the above
7. **Integration (G)** — portal, webhooks, referral, PWA

Each product ships as a typed module (`apps/web/src/features/<product>`) sharing
the design system and the API SDK, so everything composes into one platform.
