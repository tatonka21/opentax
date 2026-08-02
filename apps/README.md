# apps/

Custom OpenTAX applications layered on top of the OpenDAX exchange stack:
Web3 tools, trading utilities, AI agents ("AI employees").

Planned layout:

```
apps/
├── shared/          # API client (Barong JWT + Envoy gateway), types, SDK
├── web3/            # Wallet explorer, price alerts, portfolio tracker
├── trading/         # Order-bot sandbox, backtester, charts
└── agents/          # AI agents: paper trading, reporting, compliance, ops
```

Not started yet — see `docs/ROADMAP.md` Phase 2 & 3.
