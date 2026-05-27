import { i18n } from './i18n'
import { sdk } from './sdk'
import { settingsJson } from './fileModels/settings.json'
import { configPath, dataDir, lndCertPath, lndMacaroonPath, lndMount, lndSocket } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Charge LND...'))

  // Read the interval dynamically with a safe fallback
  const settings = await settingsJson.read().const(effects)
  const interval = settings?.intervalSeconds || 3600 // <--- FIXED: Handles null safely

  const mounts = sdk.Mounts.of()
    .mountVolume({ volumeId: 'main', subpath: null, mountpoint: dataDir, readonly: false })
    .mountDependency({ dependencyId: 'lnd', volumeId: 'main', subpath: null, mountpoint: lndMount, readonly: true })

  const chargeSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'charge-lnd' },
    mounts,
    'charge-lnd-sub',
  )

  return sdk.Daemons.of(effects)
    .addDaemon('primary', {
      subcontainer: chargeSub,
      exec: {
        command: [
          'sh', '-c',
          `while true; do charge-lnd --grpc ${lndSocket} --tlscert ${lndCertPath} --macaroon ${lndMacaroonPath} -c ${configPath}; sleep ${interval}; done`
        ],
      },
      ready: {
        display: i18n('Daemon status'),
        fn: async () => {
          const res = await chargeSub.exec([
            'charge-lnd', '--grpc', lndSocket, '--tlscert', lndCertPath, 
            '--macaroon', lndMacaroonPath, '-c', configPath, '--dry-run'
          ])
          return res.exitCode === 0 
            ? { result: 'success', message: i18n('Charge LND is running') }
            : { result: 'loading', message: i18n('Charge LND is not responding') }
        },
        gracePeriod: 15_000,
      },
      requires: [],
    })
})