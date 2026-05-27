import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_0_3_1 = VersionInfo.of({
  version: '0.3.1:1',
  releaseNotes: {
    en_US: 'Initial release of Charge LND for StartOS 0.4.0. Policy based fee manager for LND.',
    es_ES: 'Lanzamiento inicial de Charge LND para StartOS 0.4.0. Administrador de tarifas basado en políticas para LND.',
    de_DE: 'Erstveröffentlichung von Charge LND für StartOS 0.4.0. Richtlinienbasierter Gebührenmanager für LND.',
    pl_PL: 'Pierwsze wydanie Charge LND dla StartOS 0.4.0. Menadżer opłat oparty na politykach dla LND.',
    fr_FR: 'Version initiale de Charge LND pour StartOS 0.4.0. Gestionnaire de frais basé sur des politiques pour LND.',
  },
  migrations: {
    up: async ({ effects }) => {
      // This is the initial release (0.2.13:1), so there are no legacy 
      // wrapper files or directories to migrate or clean up.
    },
    down: IMPOSSIBLE,
  },
})