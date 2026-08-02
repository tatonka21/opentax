# Roadmap

## Phase 0 — Foundation (done)
- [x] Private GitHub repo `tatonka21/opentax` created
- [x] OpenDAX vendored as git submodule (`vendor/opendax`, `2-6-stable`)
- [x] Architecture, roadmap, and deployment docs
- [x] GitHub Actions CI (shell + Terraform validation)
- [x] Oracle Cloud Terraform + VM bootstrap script + compose overrides

## Phase 1 — Exchange bring-up (staging, free)
- [ ] Pick ARM64 path: QEMU emulation (fast to start) or arm64 image rebuild
- [ ] Sign up Oracle Cloud Always Free; request Ampere A1 capacity
- [ ] Provision VM via `infra/oracle` Terraform or manual console
- [ ] Run `scripts/bootstrap-vm.sh`, render configs (`rake render:config`)
- [ ] Bring up `backend` -> `setup` (Vault init, DB migrate/seed) -> `app` -> `frontend` -> minimal daemons
- [ ] Verify plain-HTTP access via hostname; test seeded users + a market order
- [ ] Add real domain, then enable Let's Encrypt TLS (`ssl.enabled: true`)

## Phase 2 — Custom Web3 & trading tool suite
- [ ] Define `apps/` monorepo layout and shared API client (Barong JWT + Envoy)
- [ ] Web3 tools: wallet explorer, token price alerts, portfolio tracker
- [ ] Trading utilities: order-bot sandbox, backtester, charts
- [ ] Deploy static/custom tooling to free tiers (Cloudflare Pages) where possible

## Phase 3 — AI employee platform & agents
- [ ] AI agents wired to exchange APIs (paper trading, reporting, compliance)
- [ ] Agent orchestration + multi-agent workflows for ops
- [ ] "AI employees" for support, analysis, and risk monitoring

## Phase 4 — Production hardening
- [ ] Kubernetes (K3s) migration, autoscaling
- [ ] Multi-node, HA MySQL/RabbitMQ, backups
- [ ] Security audit, insurance-grade custody wallet separation
