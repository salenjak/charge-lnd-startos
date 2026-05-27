<p align="center">
  <img src="icon.png" alt="Charge LND Logo" width="21%">
</p>

# CHARGE-LND on StartOS

> **Upstream docs:** <https://github.com/accumulator/charge-lnd#readme>
>
> **Config examples:** <https://github.com/accumulator/charge-lnd/tree/master/examples>
>
> Everything not listed in this document should behave the same as upstream
> Charge-LND. If a feature, setting, or behavior is not mentioned
> here, the upstream documentation is accurate and fully applicable.

Charge-LND is a command-line tool that matches your open Lightning channels against customizable criteria and applies channel fees based on matching policies. **charge-lnd is a background daemon with a configuration file — there is no interactive web UI.**

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Dependencies](#dependencies)
- [Actions](#actions)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

## Image and Container Runtime

| Property | Value |
|---|---|
| Base image | `python:3.11-slim` (built from local `Dockerfile`) |
| Install method | `pip install charge-lnd` |
| Image source | `dockerBuild` (no official upstream StartOS image is published) |
| Architectures | x86_64, aarch64 |

The image installs `charge-lnd` globally via pip. We build from scratch to guarantee the container runs as `root`. 

## Volume and Data Layout

| Volume | Mount Point | Purpose |
|---|---|---|
| `main` | `/data` | Holds the user-editable `charge.config` INI file and `settings.json`. |
| (LND dependency) | `/mnt/lnd` | Read-only access to LND TLS cert and admin macaroon. |

charge-lnd runs as root inside the container. This is required so it can read LND's root-owned `0600` `admin.macaroon`, which is mounted read-only and cannot be re-permissioned from this side.

**Key paths on the `main` volume:**
- `charge.config` — The INI file defining your fee policies (managed by StartOS UI).
- `settings.json` — Stores the daemon execution timer interval and last run timestamp.

## Installation and First-Run Flow

| Step | Upstream | StartOS |
|---|---|---|
| Installation | `pip install charge-lnd` | Install from marketplace |
| LND connection | Manual CLI flags | Auto-injected via wrapper daemon loop |
| Configuration | Local text editor | StartOS UI Config editor |

**First-run steps:**
1. Install LND on StartOS and let it finish syncing.
2. Install charge-lnd from the marketplace. Read the install alert — this service is a background daemon.
3. Open the **Actions** menu and click **Edit Configuration** to set your fee policies and timer.
4. Start the service. It will automatically connect to LND and apply your policies on the defined interval.

## Configuration Management

| Setting | Default | Purpose |
|---|---|---|
| `charge.config` | 3-tier ratio policy | User-defined INI file containing fee policies and channel matching criteria. |
| `settings.json` | `3600` seconds | How often the daemon loop executes `charge-lnd`. |
| `--tlscert` | `/mnt/lnd/tls.cert` | LND TLS certificate path (Locked by wrapper). |
| `--macaroon` | `/mnt/lnd/.../admin.macaroon` | LND admin macaroon path (Locked by wrapper). |
| `--grpc` | `lnd.startos:10009` | LND gRPC socket (Locked by wrapper). |

The LND connection parameters are locked to the correct paths for the bundled LND dependency. They are enforced by the wrapper's daemon loop, so the user only needs to manage the fee policies and timer via the StartOS Actions menu.

## Network Access and Interfaces

charge-lnd does **not** expose any network interface. It is a command-line tool that speaks to LND over the private `lnd.startos` gRPC socket. No ports are opened on the host, Tor, or LAN.
Access is via StartOS UI Actions only.

## Dependencies

| Dependency | Required | Purpose |
|---|---|---|
| LND | Required | Lightning node to manage. |

The LND `main` volume is mounted read-only into the charge-lnd container at `/mnt/lnd`. charge-lnd uses the admin macaroon, so all fee-management LND operations are available.

## Actions

The StartOS UI surfaces convenience actions. They exist so users can configure the daemon and trigger it without SSH'ing in.

| Action | Group | Purpose |
|---|---|---|
| Edit Configuration | Configuration | Opens a native UI form to edit the `charge.config` INI and the execution timer. Upon saving, it immediately runs `charge-lnd` and displays the evaluation log. |

All other charge-lnd functionality is available from inside the container shell via SSH.

## Backups and Restore

**Included in backup:**
- `main` volume — `charge.config` fee policies and `settings.json` timer.

**Restore behavior:**
- Configuration restored; the daemon loop will automatically pick up the restored files on the next cycle or service restart.

**Note:** charge-lnd stores no funds. All funds reside in LND. Back up LND — not charge-lnd — to preserve your on-chain and channel state.

## Health Checks

| Check | Display Name | Method | Messages |
|---|---|---|---|
| Primary daemon | Daemon status | Runs `charge-lnd --dry-run` and reads `settings.json` | Charge LND is running. Next evaluation in Xm / Charge LND is not responding |

A successful `--dry-run` invocation means charge-lnd can reach LND using the mounted credentials and parse the user's config file. The health check also calculates a live countdown to the next scheduled run.

## Limitations and Differences

- **No web UI.** charge-lnd is configured via StartOS Actions and runs as a background daemon.
- **No external interfaces.** No Tor or LAN interface is declared; it speaks only to LND over the private `lnd.startos` gRPC socket.
- **Dynamic Timer.** The wrapper executes the upstream script based on a user-defined interval stored in `settings.json`.
- **No user LND config.** All connection settings are derived from the bundled LND dependency.

## What Is Unchanged from Upstream

- Every upstream policy matching logic and fee application feature.
- gRPC communication with LND via the admin macaroon.
- The INI configuration schema.

## Quick Reference for AI Consumers

```yaml
package_id: charge-lnd
image: local-dockerBuild (python:3.11-slim + pip charge-lnd)
architectures: [x86_64, aarch64]
volumes:
  main: /data
ports: []
dependencies:
  lnd (required; see manifest for version range)
actions:
  - edit-config
health_checks:
  - primary: charge-lnd --dry-run exit == 0
backup_volumes:
  - main
fixed_config:
  cli_flags:
    tlscert: /mnt/lnd/tls.cert
    macaroon: /mnt/lnd/data/chain/bitcoin/mainnet/admin.macaroon
    grpc: lnd.startos:10009
access: SSH into server, then run `start-cli package attach charge-lnd`