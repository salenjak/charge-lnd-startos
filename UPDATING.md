# Updating charge-lnd

charge-lnd is installed into the image at build time via `pip install charge-lnd==<version>` in `Dockerfile`. There is no `dockerTag` in the manifest — the image is built fresh from `Dockerfile`.

## Finding the latest version

- **PyPI** (charge-lnd) — what the Dockerfile's `pip install` actually resolves against:
  - `pip index versions charge-lnd`
  - Or check https://pypi.org/project/charge-lnd/#history
- **GitHub tags** (accumulator/charge-lnd) — upstream tags the PyPI publish corresponds to:
  - `gh api repos/accumulator/charge-lnd/tags --jq '.[0].name'`

## Where the pin lives

The pin lives in `Dockerfile` on the `RUN pip install --no-cache-dir charge-lnd==<version>` line.

## Steps to bump the version

1. **`Dockerfile`** — bump `<version>` in `RUN pip install --no-cache-dir charge-lnd==<version>` to the new version.
2. **`startos/versions/`** — create a new TypeScript file for the version (e.g., `v0.2.14.ts`) exporting `Version.of('0.2.14:1')`.
3. **`startos/versions/index.ts`** — update the `VersionGraph` to point `current` to your new version file.
4. **`README.md`** — update the AI consumer block if any structural changes were made (usually not required for simple version bumps).
5. Commit, build (`make`), and test the new `.s9pk`.