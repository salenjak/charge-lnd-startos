import { i18n } from './i18n'
import { sdk } from './sdk'
import { settingsJson } from './fileModels/settings.json'
import { configPath, dataDir, lndCertPath, lndMacaroonPath, lndMount, lndSocket } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Charge LND...'))

  const settings = await settingsJson.read().once()
  const interval = settings?.intervalSeconds || 3600 

  const mounts = sdk.Mounts.of()
    .mountVolume({ volumeId: 'main', subpath: null, mountpoint: dataDir, readonly: false })
    .mountDependency({ dependencyId: 'lnd', volumeId: 'main', subpath: null, mountpoint: lndMount, readonly: true })

  const chargeSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'charge-lnd' },
    mounts,
    'charge-lnd-sub',
  )

  const updateStateCmd = `python3 -c "import json, time, os; p='/data/settings.json'; d=json.load(open(p)) if os.path.exists(p) else {}; d['lastRun']=int(time.time()); json.dump(d, open(p,'w'))"`

  return sdk.Daemons.of(effects)
    .addDaemon('primary', {
      subcontainer: chargeSub,
      exec: {
        command: [
          'sh', '-c',
          `while true; do charge-lnd --grpc ${lndSocket} --tlscert ${lndCertPath} --macaroon ${lndMacaroonPath} -c ${configPath}; ${updateStateCmd}; sleep ${interval}; done`
        ],
      },
            ready: {
        display: i18n('Daemon status'),
        fn: async () => {
          try {
            const res = await chargeSub.exec([
              'charge-lnd', '--grpc', lndSocket, '--tlscert', lndCertPath, 
              '--macaroon', lndMacaroonPath, '-c', configPath, '--dry-run'
            ])
            
            if (res.exitCode !== 0) {
              return { result: 'loading', message: i18n('Charge LND is not responding') }
            }

            const currentSettings = await settingsJson.read().once()
            if (currentSettings?.lastRun) {
              const now = Math.floor(Date.now() / 1000)
              const nextRun = currentSettings.lastRun + (currentSettings.intervalSeconds || 3600)
              const remaining = nextRun - now
              
              if (remaining > 0) {
                const mins = Math.ceil(remaining / 60)
                return { 
                  result: 'success', 
                  message: `${i18n('Charge LND is running')} ${i18n('— next evaluation in {mins}m.').replace('{mins}', mins.toString())}` 
                }
              } else {
                return { 
                  result: 'success', 
                  message: `${i18n('Charge LND is running')} ${i18n('— evaluating channels now...')}` 
                }
              }
            }
            
            return { result: 'success', message: i18n('Charge LND is running') }
          } catch (e) {
            return { result: 'loading', message: i18n('Charge LND is not responding') }
          }
        },
        gracePeriod: 15_000,
      },
      requires: [],
    })
})