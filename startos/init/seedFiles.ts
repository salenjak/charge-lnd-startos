import { chargeConfig } from '../fileModels/charge.config'
import { settingsJson } from '../fileModels/settings.json'
import { sdk } from '../sdk'
import { defaultConfig } from '../utils'

export const seedFiles = sdk.setupOnInit(async (effects) => {
  const currentConfig = await chargeConfig.read().once()
  if (!currentConfig) {
    await chargeConfig.write(effects, defaultConfig)
  }
    await settingsJson.merge(effects, { intervalSeconds: 3600 })
})