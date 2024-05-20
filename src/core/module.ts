import os from 'node:os'
import defu from 'defu'
import type { Nue } from './nue'
import { logger } from './logger'

export interface ModuleMeta {
  name: string
  enabled?: boolean
  onlyDev?: boolean
  platforms?: NodeJS.Platform[]
}

type ModuleSetupReturn = void | Promise<void | false>

export interface ModuleDefinition {
  meta: ModuleMeta
  setup: (nue: Nue) => ModuleSetupReturn
}

export interface Module {
  (this: void, nue: Nue): ModuleSetupReturn
  getMeta: () => Promise<ModuleMeta>
}

export function defineModule(definition: ModuleDefinition): Module {
  const meta = defu(definition.meta, {
    enabled: true,
    onlyDev: false,
    platforms: ['darwin', 'win32', 'linux'],
  }) as Required<ModuleMeta>

  async function normalizedModule(this: any, nue: Nue) {
    const key = `module:${meta.name}`

    if (!meta.enabled) {
      logger.info(`Module ${key} skip initiation, because it's disabled`)
      return false
    }

    if (meta.onlyDev && nue.config.isProduction) {
      logger.info(`Module ${key} skip initiation, because onlyDev mode`)
      return false
    }

    if (!meta.platforms.includes(os.platform())) {
      logger.info(`Module ${key} skip initiation, because the OS doesn't match ${meta.platforms}`)
      return false
    }

    const mark = performance.mark(key)
    const result = await definition.setup.call(null, nue)
    const perf = performance.measure(key, mark)
    const setupTime = perf ? Math.round((perf.duration * 100)) / 100 : 0

    if (setupTime > 3000) {
      logger.warn(`Module ${key} setup took ${setupTime}ms`)
    } else {
      logger.info(`Module ${key} setup took ${setupTime}ms`)
    }

    return result
  }

  normalizedModule.getMeta = () => Promise.resolve(meta)

  return normalizedModule
}
