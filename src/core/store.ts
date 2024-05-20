import { app, ipcMain } from 'electron'
import Conf from 'conf'
import { IPC_STORE_ALL, IPC_STORE_GET, IPC_STORE_SET } from './ipc'
import { logger } from './logger'
import type { LocaleMessages } from './i18n'

export interface StoreScheme {
  [key: string]: any

  app: {
    mainWindowPosition: Electron.Rectangle
    i18n: {
      locale: string
      messages: LocaleMessages
    }
  }
}

export interface Store {
  all: () => StoreScheme
  get: <Key extends keyof StoreScheme>(key: Key | string, defaultValue?: unknown) => any
  set: <Key extends keyof StoreScheme>(key: Key | string, value: unknown) => void
}

export function createStore(): Store {
  const store = new Conf<StoreScheme>({
    cwd: app.getPath('userData'),
    projectVersion: app.getVersion(),
    watch: true,
  })

  return {
    all() {
      return store.store
    },
    get(key, defaultValue): unknown {
      return store.get(key) || defaultValue
    },
    set(key, value): void {
      store.set(key, value)
    },
  }
}

export function subscribeIpcStore(store: Store) {
  ipcMain.handle(IPC_STORE_ALL, () => {
    logger.debug('Store ipc getting all store values')
    return store.all()
  })

  ipcMain.handle(IPC_STORE_GET, (_, key) => {
    logger.debug(`Store ipc getting store value for key: ${key}`)
    return store.get(key)
  })

  ipcMain.handle(IPC_STORE_SET, (_, key, value) => {
    logger.debug(`Store ipc setting store value for key: ${key}, value: ${value}`)
    return store.set(key, value)
  })
}
