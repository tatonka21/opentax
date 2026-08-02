# Architecture

## Topology

OpenTAX is a multi-service, single-VM deployment for the free tier, routing all
public traffic through Traefik via Host-header-based labels.

```
                         Internet
                            |
                      [Traefik :80/:443]   (proxy)
                            |
     +----------------------+-----------------------+
     |                                              |
 [Envoy gateway]                          [BaseApp frontend :3000]
     |  /api, /admin, /assets/                (trading UI)
     |                                              |
 +---+---+---------+---------+---------+            |
 |       |         |         |         |            |
[Peatio][Barong]  [Ranger]  [Tower]   [applogic]   (all no host ports)
 |   :8000   :8001    WS      /tower     :8081
 +---+---+---+-----------------+-------------------+
     |       |
 [MySQL] [Redis]
 [RabbitMQ] [Vault] [InfluxDB]
```

## Component responsibilities

- **Peatio** — order book, matching (when Finex disabled), member balances,
  deposit/withdraw processing, trade accounting. REST API on `:8000`.
- **Barong** — user identity, JWT issuance, 2FA, KYC levels, roles. Envoy calls
  its `/api/v2/auth` as an external authz on **every** API request.
- **Ranger** — WebSocket gateway for orderbook/trades/balances to the UI.
- **Envoy gateway** — JWT auth, CORS, routing for `/api`, `/admin`, `/assets/`.
- **Tower** — admin console (users, KYC, funds).
- **Vault** — holds component secrets + transit keys; tokens are generated at
  setup and baked into env files.
- **RabbitMQ** — event bus between Peatio daemons (matching, deposits, mailer).
- **InfluxDB** — candles/history for charts.

## Required vs optional services

**Required for a working exchange:** proxy, backend (db/redis/rabbitmq/vault),
influxdb, peatio, barong, gateway, frontend, and the daemons `rango`,
`matching`, `order_processor`, `trade_executor`, `barong_sidekiq`.

**Optional (skip on the free tier):** tower, mailer, applogic, arke, superset,
monitoring, cryptonodes, finex.

## ARM64 constraint (free-tier critical path)

All OpenDAX app images (`peatio`, `barong`, `baseapp`, `tower`, `rango`) are
single-arch **amd64**; Openware never published ARM64 builds. The Oracle
Always Free compute is **ARM64**. See `docs/DEPLOYMENT.md` for the two
mitigation paths (QEMU emulation vs. rebuild from source).

## Extension surface (custom OpenTAX code)

- `apps/` — Web3 tools, trading utilities, AI agents layered on top of the
  exchange API (via Barong JWT + Envoy gateway).
- CI/CD — GitHub Actions builds/validates/deploys automatically.
