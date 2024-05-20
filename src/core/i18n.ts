import { ipcMain } from 'electron'
import { getProperty } from 'dot-prop'
import type { Store } from './store'
import { IPC_I18N_CHANGE, IPC_I18N_MESSAGES } from './ipc'
import type { Nue } from './nue'
import { logger } from './logger'

export type LocaleDictionary = Record<Locale, LocaleMessages>

export type Locale = string

export interface LocaleMessages {
  [key: string]: LocaleMessages
}

export interface I18n {
  t: (key: string, ...args: unknown[]) => string
  setLocale: (value: Locale, modifyStore?: boolean) => Promise<void>
  getLocale: () => Locale
  getMessages: () => LocaleMessages
}

export function createI18n(messages: LocaleDictionary, store: Store, hooks: Nue['hooks']): I18n {
  const defaultLocale = 'en'

  return {
    t(key: string, ..._args: unknown[]): string {
      const locale = store.get('app.i18n.locale', defaultLocale)

      return getProperty(messages, `${locale}.${key}`, '')
    },
    getLocale(): Locale {
      return store.get('app.i18n.locale', defaultLocale)
    },
    async setLocale(value: Locale, modifyStore: boolean = true): Promise<void> {
      if (modifyStore) {
        store.set('app.i18n.locale', value)
      }

      await hooks.callHook('i18n:change', value)
    },
    getMessages(): LocaleMessages {
      return messages
    },
  }
}

export function subscribeIpcI18n(i18n: I18n) {
  ipcMain.on(IPC_I18N_CHANGE, (_, value: Locale, modifyStore: boolean = true) => {
    logger.debug(`I18n ipc: changing locale to ${value}`)
    i18n.setLocale(value, modifyStore)
  })

  ipcMain.handle(IPC_I18N_MESSAGES, () => {
    logger.debug('I18n ipc: getting messages')
    return i18n.getMessages()
  })
}
