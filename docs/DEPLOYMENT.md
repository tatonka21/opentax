# Deployment

Free-tier hosting playbook for the OpenTAX exchange stack.

## Free-tier analysis (2026)

| Option | Verdict |
| --- | --- |
| **Oracle Cloud Always Free** | **Pick this.** Ampere A1 ARM VM (2 OCPU / 12 GB RAM, 200 GB disk, 10 TB/mo egress) — free forever, the only free option with enough RAM for OpenDAX. Requires a credit card (identity check) and free-tier capacity can be scarce in popular regions. |
| GCP e2-micro | 1 GB RAM — OOM-kills under the stack. No. |
| AWS / Azure free VMs | 1 GB RAM, expire after 12 months. No. |
| Render / Koyeb / Cloud Run | Single-container PaaS; no free multi-container compose. No. |
| GitHub Actions | Free CI/CD minutes (2,000/mo private repos). **Use for CI.** |

## The ARM64 blocker

Oracle's big free VM is **ARM64**, but every OpenDAX app image is **amd64-only**.
Two paths:

### Path A — QEMU emulation (fast to start, for staging/demo)
Run the amd64 containers on the ARM VM via `binfmt_misc` QEMU. Everything
"just works" but Rails + MySQL run ~10x slower. Fine for dev/staging, demos, and
CI-like smoke tests. Not for real users.

Setup on the VM:
```bash
sudo apt-get install -y qemu-user-static binfmt-support
sudo update-binfmts --enable qemu-aarch64
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
```
Images that still need an ARM64-native override are handled by
`infra/docker-compose.overrides.yml` (see below).

### Path B — Rebuild images for arm64 (the proper path)
Implemented as **`.github/workflows/images.yml`**. It builds multi-arch
(`linux/amd64` + `linux/arm64`) images of peatio, barong, ranger, baseapp,
tower from the openware source repos using GitHub Actions + Buildx + QEMU and
pushes them to GHCR (`ghcr.io/<owner>/opentax-<name>`).

Run it: **Actions → "Build OpenDAX images" → Run workflow** (optionally select
a subset of images). `config/opentax-app.yml` already points at the GHCR image
names. GHCR private storage is capped at 500 MB free; multi-arch images exceed
this, so either keep the packages public or accept small storage billing.

> Recommendation: run **Path B** once (it's a one-time ~1–2 h build on the free
> runner), then the exchange runs natively on the ARM VM with no emulation
> penalty. Path A is the fallback for a quick look.

## Oracle Cloud setup

1. Sign up at <https://signup.oraclecloud.com> (card required for identity check).
2. Create a **Compartment**; note the **OCID**s (tenancy, compartment, user) and
   upload/configure an **API key** for Terraform, or just use the console.
3. Launch an instance:
   - Image: **Canonical Ubuntu 22.04 (arm64)** (or any arm64 image)
   - Shape: `VM.Standard.A1.Flex`, **OCPUs=2, memory=12 GB**
   - Add an SSH public key
   - If `Out of host capacity`, switch home region or retry later (capacity is
     contested; keep retrying).
4. Open **ingress rules** on the VCN security list for TCP `22`, `80`, `443`.

Manual (no Terraform) works — `infra/oracle` is optional. If you use it:

```bash
cd infra/oracle
cp terraform.tfvars.example terraform.tfvars   # fill OCIDs + keys + image
terraform init && terraform plan && terraform apply
```

## VM bootstrap

```bash
scp -i <key> scripts/bootstrap-vm.sh ubuntu@<vm-ip>:~
ssh -i <key> ubuntu@<vm-ip>
sudo ./bootstrap-vm.sh
```

Installs Docker + Compose + QEMU, a `docker-compose` shim (`docker compose`),
clones this repo, inits the OpenDAX submodule, and compiles Ruby 2.6 via rbenv
(needed by the rake renderer).

## One-command bring-up

Edit `config/opentax-app.yml` first (domain, `database.password`, wallet
addresses), then run the automated sequence:

```bash
cd /root/opentax
./scripts/bringup.sh
```

`bringup.sh` does everything: applies the config overlay + ARM compose
overrides, renders configs (`rake render:config`), then starts
`proxy → backend → influxdb → setup → app → frontend`, and launches the minimal
daemons (`rango`, `matching`, `order_processor`, `trade_executor`,
`barong_sidekiq`).

> Plain HTTP: leave `ssl.enabled: false`, set `app.subdomain=www` and a real
> `app.domain`, and add a DNS A record `www.<domain> -> <vm-ip>`. Traefik routes
> on the Host header, so accessing the VM by raw IP returns 404.
> Seeded logins after `setup`: `admin@barong.io / 0lDHd9ufs9t@` and
> `john@barong.io / Am8icnzEI3d!`.

## CI/CD

- `ci.yml` — runs on push/PR: shellcheck on scripts, Terraform fmt+validate.
- `deploy.yml` — workflow_dispatch; deploys to the Oracle VM over SSH once the
  secrets `DEPLOY_SSH_HOST`, `DEPLOY_SSH_USER`, `DEPLOY_SSH_KEY` are set.

## Cost guardrails

- Oracle reclaims Always Free VMs that are idle 7+ days. Running the exchange
  keeps it busy; otherwise add a lightweight keep-alive load.
- Stay within free limits: 10 TB/mo egress, 200 GB block storage.
- Never enable non-free shapes/volumes (recurring cost).
