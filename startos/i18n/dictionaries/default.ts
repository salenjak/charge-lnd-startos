export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Charge LND...': 0,
  'Daemon status': 1,
  'Charge LND is running': 2,
  'Charge LND is not responding': 3,
  '— next evaluation in {mins}m.': 4,
  '— evaluating channels now...': 5,

  // editConfig.ts
  'Run Interval (Seconds)': 6,
  'How often Charge LND runs. Default is 3600 (1 hour). Minimum 60 seconds.': 7,
  'Fee Policies (charge.config)': 8,
  'Define your routing policies in INI format.': 9,
  'Edit Configuration': 10,
  'Update your fee policies and execution timer. Changes are applied immediately.': 11,
  'Configuration Saved & Applied': 12,
  'No output (fees already correct or no channels matched).': 13,

  // manifest
  'Policy based fee manager for LND': 14,
  'Charge LND matches your open Lightning channels against customizable criteria and applies channel fees based on matching policies.': 15,
  'Required to connect to your Lightning node and apply fee policies.': 16,
  'Charge LND will run every hour to apply your fee policies based on the charge.config file.': 17,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict