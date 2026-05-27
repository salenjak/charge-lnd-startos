import { sdk } from '../sdk'
import { editConfig } from './editConfig'

export const actions = sdk.Actions.of()
  .addAction(editConfig)
