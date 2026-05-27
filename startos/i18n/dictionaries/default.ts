export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Charge LND...': 0,
  'Daemon status': 1,
  'Charge LND is running': 2,
  'Charge LND is not responding': 3,

  // runNow.ts
  'Apply Configuration': 4,
  'Runs Charge LND immediately to apply new configuration.': 5,
  'New Configuration Applied': 6,
  'No output (fees already correct or no channels matched).': 7,

  // manifest
  'Policy based fee manager for LND': 8,
  'Charge LND matches your open Lightning channels against customizable criteria and applies channel fees based on matching policies.': 9,
  'Required to connect to your Lightning node and apply fee policies.': 10,
  'Charge LND will run every hour to apply your fee policies based on the charge.config file.': 11,

  // editConfig.ts
  'Run Interval (Seconds)': 12,
  'How often Charge LND runs. Default is 3600 (1 hour). Minimum 60 seconds.': 13,
  'Fee Policies (charge.config)': 14,
  'Define your routing policies in INI format.': 15,
  'Edit Configuration': 16,
  'Update your fee policies and execution timer. Changes are applied immediately.': 17,
  'Configuration Saved & Applied': 18,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict