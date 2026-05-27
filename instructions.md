# Charge LND

## Documentation

- [Charge LND README](https://github.com/accumulator/charge-lnd#readme) — upstream overview, policy matching logic, and strategy explanations.
- [Charge LND Config Examples](https://github.com/accumulator/charge-lnd/tree/master/examples) — real-world INI configuration examples for various routing strategies.

## What you get on StartOS

- A background daemon that continuously evaluates and applies your Lightning routing fees based on customizable policies.
- Pre-wired to securely communicate with your LND node over its private gRPC socket — no manual macaroon or TLS certificate path editing required.
- A native StartOS UI form to easily edit your `charge.config` INI policies and adjust the background execution timer without touching the terminal.

## Getting set up

1. Ensure LND is installed, running, and fully synced on your StartOS server.
2. Start the charge-lnd service from its dashboard page.
3. Navigate to **Actions** and click **Edit Configuration**.
4. Set your desired execution timer (e.g., `3600` for every hour) and paste your routing policies into the text area.
5. Click **Submit** to save, then click **Apply Configuration** to run the script immediately and verify your policies.

## Using Charge LND

charge-lnd operates entirely in the background. Once configured, it will automatically wake up on your defined interval, evaluate your open channels against your policies, and update your LND routing fees.

### Actions

The service page exposes convenience actions so you can manage your node directly from the dashboard:

- **Edit Configuration** — Opens a native UI form to edit your `charge.config` INI file and the background execution timer.
- **Apply Configuration** — Runs `charge-lnd` immediately in verbose mode. It displays a formatted evaluation log showing exactly which channels matched which policies and what fees were applied.