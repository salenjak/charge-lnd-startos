import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const chargeConfig = FileHelper.string({
  base: sdk.volumes.main,
  subpath: '/charge.config',
})