# OpenTAX

AI-powered digital asset & cryptocurrency exchange platform, built on top of
[OpenDAX](https://github.com/openware/opendax) (Apache-2.0) and extended with a
suite of Web3 tools, trading utilities, and AI-agent capabilities.

> Status: **foundation scaffolding**. Exchange bring-up playbook and CI/CD are
> in place; full stack deployment is next.

## Why OpenDAX

OpenDAX is a battle-tested, open-source, cloud-native exchange distribution. It
ships a complete stack out of the box:

| Component | Role |
| --- | --- |
| **Peatio** | Core engine — accounting, order matching, blockchain integration (BTC, LTC, ETH/ERC20, XRP, Dash) |
| **Barong** | Authentication, JWT, 2FA, KYC, roles & permissions |
| **Ranger** | High-performance WebSocket server (real-time market data) |
| **Tower** | Admin panel — users, KYC levels, deposits/withdrawals |
| **BaseApp** | React trading frontend |
| **Gateway / Proxy** | Envoy API gateway + Traefik edge router |
| **Infra** | MySQL, Redis, RabbitMQ, Vault, InfluxDB |

We vendor OpenDAX at `vendor/opendax` as a git submodule (tracking the
`2-6-stable` branch) so upstream upgrades stay easy.

## Repo layout

```
.
├── vendor/opendax        # OpenDAX upstream (git submodule)
├── infra/
│   ├── oracle/           # Terraform for Oracle Cloud Always Free VM
│   └── docker-compose.overrides.yml  # ARM64-safe image overrides
├── scripts/
│   └── bootstrap-vm.sh   # VM provisioning (Docker, Compose, deps)
├── apps/                 # Future: Web3 tools, AI agents, extensions
├── docs/                 # Architecture, roadmap, deployment playbook
└── .github/workflows/    # CI/CD
```

## Hosting strategy (free tier)

Full analysis in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Short version:

- **Target:** Oracle Cloud **Always Free** Ampere A1 VM (2 OCPU / 12 GB RAM),
  free forever, enough RAM for the stack.
- **Caveat:** OpenDAX app images are **amd64-only**; the A1 is ARM64. Two
  viable free paths: run amd64 images under QEMU emulation (staging/demo), or
  rebuild the images for arm64 using free GitHub Actions ARM runners.
- **CI/CD:** GitHub Actions (free) builds, validates, and deploys on push.

## Getting started

```bash
# Clone with submodule
git clone --recurse-submodules git@github.com:tatonka21/opentax.git
cd opentax

# Deploy playbook (Oracle ARM VM): see docs/DEPLOYMENT.md
```

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md).

## License

OpenDAX is Apache-2.0. Custom OpenTAX code and docs are Apache-2.0 unless noted.
