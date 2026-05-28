import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_0_3_1 = VersionInfo.of({
  version: '0.3.1:2',
  releaseNotes: {
    en_US: 'Fixed critical bug where custom daemon timers were reset to default on server reboot. Refined health check status typography.',
    es_ES: 'Corregido error critico donde los temporizadores se restablecian al reiniciar. Mejorada la tipografia del estado.',
    de_DE: 'Kritischer Fehler behoben, bei dem Timer beim Neustart zurueckgesetzt wurden. Typografie des Status verfeinert.',
    pl_PL: 'Naprawiono blad resetowania timera po restarcie. Ulepszono typografie statusu.',
    fr_FR: 'Correction d\'un bug critique reinitialisant les minuteries au redemarrage. Typographie du statut affinee.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})