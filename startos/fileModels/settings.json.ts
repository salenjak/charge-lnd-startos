import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  intervalSeconds: z
    .number()
    .int()
    .min(60)
    .default(3600)
    .describe('How often (in seconds) Charge LND runs. Default is 3600 (1 hour).'),
  lastRun: z
    .number()
    .nullable()
    .catch(null)
    .describe('Unix timestamp of the last successful run (managed by daemon).'),
})

export const settingsJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/settings.json' },
  shape,
)