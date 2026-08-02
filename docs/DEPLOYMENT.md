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
- Use **GitHub Actions free ARM64 runners** to build `linux/arm64` images of
  peatio, barong, ranger, baseapp, tower from their openware source repos.
- Publish to GitHub Container Registry (free) and point the compose templates
  at those images.
- Larger initial effort; fully automated afterwards, and production-viable.

> Recommendation: start with **Path A** to get a working exchange this week,
> then invest in **Path B** once the stack is proven.

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
./bootstrap-vm.sh
```

The script installs Docker + Compose, clones this repo, and inits the OpenDAX
submodule. It does **not** render configs — that happens via the rake renderer
(needs Ruby), which for convenience is documented in the script output.

## Bring-up sequence (inside `vendor/opendax`)

```bash
cp ../../infra/docker-compose.overrides.yml docker-compose.override.yml
# 1. Edit config/app.yml: app.domain, subdomain, database.password, ssl.enabled=false
# 2. Render configs (a ruby environment is required; e.g. docker run --rm -v $PWD:/app ruby:2.6.1 sh -c "cd /app && bundle install && bundle exec rake render:config")
rake service:proxy[start]
rake service:backend[start]
rake service:influxdb[start]
rake service:setup[start]     # Vault init + policies + DB create/migrate/seed
rake service:app[start]
rake service:frontend[start]
# minimal daemons for real matching + websockets:
docker-compose up -d rango matching order_processor trade_executor barong_sidekiq
```

For plain HTTP: leave `ssl.enabled: false`, set a real hostname
(`app.subdomain=www`, `app.domain=example.com`) and add a DNS A record
`www.example.com -> <vm-ip>`. Traefik routes on the Host header, so accessing
the VM by raw IP returns 404.

Seeded logins after `setup`: `admin@barong.io / 0lDHd9ufs9t@` (admin) and
`john@barong.io / Am8icnzEI3d!` (user).

## CI/CD

- `ci.yml` — runs on push/PR: shellcheck on scripts, Terraform fmt+validate.
- `deploy.yml` — workflow_dispatch; deploys to the Oracle VM over SSH once the
  secrets `DEPLOY_SSH_HOST`, `DEPLOY_SSH_USER`, `DEPLOY_SSH_KEY` are set.

## Cost guardrails

- Oracle reclaims Always Free VMs that are idle 7+ days. Running the exchange
  keeps it busy; otherwise add a lightweight keep-alive load.
- Stay within free limits: 10 TB/mo egress, 200 GB block storage.
- Never enable non-free shapes/volumes (recurring cost).
