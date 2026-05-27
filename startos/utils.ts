export const lndMount = '/mnt/lnd' as const
export const dataDir = '/data' as const
export const configPath = `${dataDir}/charge.config` as const
export const lndCertPath = `${lndMount}/tls.cert` as const
export const lndMacaroonPath = `${lndMount}/data/chain/bitcoin/mainnet/admin.macaroon` as const
export const lndSocket = 'lnd.startos:10009' as const

export const defaultConfig = `
[default]
# Used if no other policy matches a channel
strategy = static
base_fee_msat = 1_000
fee_ppm = 10
`.trim()