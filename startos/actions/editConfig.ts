import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { chargeConfig } from '../fileModels/charge.config'
import { settingsJson } from '../fileModels/settings.json'
import { configPath, dataDir, lndCertPath, lndMacaroonPath, lndMount, lndSocket } from '../utils'

const { InputSpec, Value } = sdk

const escapeHtml = (str: string) => str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

export const configInputSpec = InputSpec.of({
  interval: Value.number({
    name: i18n('Run Interval (Seconds)'),
    description: i18n('How often Charge LND runs. Default is 3600 (1 hour). Minimum 60 seconds.'),
    required: true,
    default: 3600,
    min: 60,
    integer: true,
  }),
  configText: Value.textarea({
    name: i18n('Fee Policies (charge.config)'),
    description: i18n('Define your routing policies in INI format.'),
    required: true,
    default: '',
  }),
})

export const editConfig = sdk.Action.withInput(
  'edit-config',
  async () => ({
    name: i18n('Edit Configuration'),
    description: i18n('Update your fee policies and execution timer. Changes are applied immediately.'),
    warning: null,
    allowedStatuses: 'any',
    group: 'Configuration',
    visibility: 'enabled',
  }),
  configInputSpec,
  async ({ effects }) => {
    const currentConfig = await chargeConfig.read().once()
    const settings = await settingsJson.read().once()
    return { 
      interval: settings?.intervalSeconds || 3600,
      configText: currentConfig || '',
    }
  },
  async ({ effects, input }) => {
    await chargeConfig.write(effects, input.configText)
    await settingsJson.merge(effects, { intervalSeconds: input.interval })
    await sdk.restart(effects)
    
    const res = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'charge-lnd' },
      sdk.Mounts.of()
        .mountVolume({ volumeId: 'main', subpath: null, mountpoint: dataDir, readonly: false })
        .mountDependency({ dependencyId: 'lnd', volumeId: 'main', subpath: null, mountpoint: lndMount, readonly: true }),
      'charge-lnd-apply',
      async (sub) => sub.exec([
        'charge-lnd', '-v',
        '--grpc', lndSocket,
        '--tlscert', lndCertPath,
        '--macaroon', lndMacaroonPath,
        '-c', configPath,
      ]),
    )

    const stdout = res.stdout.toString().trim()
    const stderr = res.stderr.toString().trim()
    const combinedOutput = [stdout, stderr].filter(Boolean).join('\n') || i18n('No output (fees already correct or no channels matched).')

    if (res.exitCode !== 0) {
      throw new Error(escapeHtml(combinedOutput))
    }

    const lines = combinedOutput.split('\n')
    const channels: { header: string; details: string[] }[] = []
    let currentChannel: { header: string; details: string[] } | null = null
    let preChannelText: string[] = []
    let postChannelText: string[] = []
    let foundFirstChannel = false

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      const isHeader = /^\d+x\d+x\d+/.test(trimmed)

      if (isHeader) {
        foundFirstChannel = true
        if (currentChannel) channels.push(currentChannel)
        currentChannel = { header: trimmed, details: [] }
      } else {
        if (currentChannel) {
          currentChannel.details.push(line)
        } else if (!foundFirstChannel) {
          preChannelText.push(line)
        } else {
          postChannelText.push(line)
        }
      }
    }
    if (currentChannel) channels.push(currentChannel)

    let bodyHtml = ''

    if (preChannelText.length > 0) {
      bodyHtml += `<pre>${escapeHtml(preChannelText.join('\n'))}</pre>`
    }

    if (channels.length > 0) {
      channels.forEach((ch, index) => {
        const openAttr = index === 0 ? 'open' : ''
        
        const headerMatch = ch.header.match(/^(\d+x\d+x\d+)\s+\[(.*)\|([^\]]+)\]$/)
        let formattedHeader = escapeHtml(ch.header)
        if (headerMatch) {
          const [_, chanId, alias, pubkey] = headerMatch
          formattedHeader = `<span class="g-warning">${escapeHtml(chanId)}</span> &nbsp;|&nbsp; <span class="g-primary">${escapeHtml(alias)}</span> <span class="g-secondary">${escapeHtml(pubkey)}</span>`
        }

        let detailsHtml = escapeHtml(ch.details.join('\n'))
        
        detailsHtml = detailsHtml.replace(/(\d+)\s*➜\s*(\d+)/g, '<span class="g-info">$1 ➜ $2</span>')

        bodyHtml += `
          <details ${openAttr}>
            <summary>${formattedHeader}</summary>
            <pre>${detailsHtml}</pre>
          </details>
        `
      })
    } else if (preChannelText.length === 0 && postChannelText.length === 0) {
      bodyHtml = `<pre>${escapeHtml(combinedOutput)}</pre>`
    }

    if (postChannelText.length > 0) {
      bodyHtml += `<pre>${escapeHtml(postChannelText.join('\n'))}</pre>`
    }

    const htmlMessage = `
      <table class="g-table">
        <thead>
          <tr>
            <th>
              <span class="g-primary"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiMwMGZmYjAiPjx0aXRsZSB4bWxucz0iIiBmaWxsPSIjMDBmZmIwIj5jaGFubmVsPC90aXRsZT48cGF0aCBmaWxsPSIjMDBmZmIwIiBkPSJNMjAgMTZhMyAzIDAgMCAwLTEuNzMuNTZsLTIuNDUtMS40NUEzLjcgMy43IDAgMCAwIDE2IDE0YTQgNCAwIDAgMC0zLTMuODZWNy44MmEzIDMgMCAxIDAtMiAwdjIuMzJBNCA0IDAgMCAwIDggMTRhMy43IDMuNyAwIDAgMCAuMTggMS4xMWwtMi40NSAxLjQ1QTMgMyAwIDAgMCA0IDE2YTMgMyAwIDEgMCAzIDNhMyAzIDAgMCAwLS4xMi0uOGwyLjMtMS4zN2E0IDQgMCAwIDAgNS42NCAwbDIuMyAxLjM3QTMgMyAwIDEgMCAyMCAxNk00IDIwYTEgMSAwIDEgMSAxLTFhMSAxIDAgMCAxLTEgMW04LTE2YTEgMSAwIDEgMS0xIDFhMSAxIDAgMCAxIDEtMW0wIDEyYTIgMiAwIDEgMSAyLTJhMiAyIDAgMCAxLTIgMm04IDRhMSAxIDAgMSAxIDEtMWExIDEgMCAwIDEtMSAxIi8+PC9zdmc+" alt="channel" width="18" height="18"> CHANNELS EVALUATED</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              ${bodyHtml}
            </td>
          </tr>
        </tbody>
      </table>
    `

    return {
      version: '1',
      title: i18n('Configuration Saved & Applied'),
      message: htmlMessage,
      result: null,
    }
  }
)