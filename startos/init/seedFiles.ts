import { chargeConfig } from '../fileModels/charge.config'
import { settingsJson } from '../fileModels/settings.json'
import { sdk } from '../sdk'
import { defaultConfig } from '../utils'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  const currentConfig = await chargeConfig.read().once()
  if (!currentConfig) {
    await chargeConfig.write(effects, defaultConfig)
  }
  const currentSettings = await settingsJson.read().once()
  if (!currentSettings) {
    await settingsJson.merge(effects, { intervalSeconds: 3600 })
  }
})