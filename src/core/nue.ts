import process from 'node:process'
import type { BrowserWindow } from 'electron'
import { app } from 'electron'
import { type Hookable, createHooks } from 'hookable'
import type { I18n, Locale, LocaleDictionary } from './i18n'
import { createI18n, subscribeIpcI18n } from './i18n'
import type { Store } from './store'
import { subscribeIpcStore } from './store'
import type { Module } from './module'

type HookResult = Promise<void> | void

export interface Hooks {
  'electron:created': (nue: Nue) => HookResult
  'electron:error': (err: unknown) => HookResult
  'electron:module:beforeEach': () => HookResult
  'electron:module:afterEach': () => HookResult
  'i18n:change': (locale: Locale) => HookResult
}

export interface NueConfig {
  window: BrowserWindow
  store: Store
  isProduction: boolean
  singleInstance: boolean
  modules?: Module[]
  locales?: LocaleDictionary
}

export interface Nue {
  store: Store
  config: NueConfig
  window: BrowserWindow
  hooks: Hookable<Hooks>
  hook: Hookable<Hooks>['hook']
  i18n: I18n
  platform: {
    isMac: boolean
    isWindows: boolean
    isLinux: boolean
  }
}

export async function createNue(config: NueConfig): Promise<Nue> {
  const { store, window } = config
  const hooks = createHooks<Hooks>()
  const i18n = createI18n(config.locales || { en: {} }, store, hooks)

  const nue: Nue = {
    store,
    window,
    hooks,
    config,
    hook: hooks.hook,
    i18n,
    platform: {
      isMac: process.platform === 'darwin',
      isWindows: process.platform === 'win32',
      isLinux: process.platform === 'linux',
    },
  }

  window.on('close', () => {
    store.set('app.mainWindowPosition', window.getBounds())
  })

  if (config.singleInstance) {
    makeSingleInstanceLock(nue)
  }

  errorCapture(nue)

  subscribeIpcI18n(i18n)
  subscribeIpcStore(store)

  await hooks.callHook('electron:module:beforeEach')

  for (const module of config.modules || []) {
    await module(nue)
  }

  await hooks.callHook('electron:module:afterEach')

  return nue
}

export function errorCapture(nue: Nue) {
  process.on('unhandledRejection', (error: unknown) => {
    nue.hooks.callHook('electron:error', error)
  })

  process.on('uncaughtException', (error: unknown) => {
    nue.hooks.callHook('electron:error', error)
  })
}

export function makeSingleInstanceLock(nue: Nue) {
  if (!app.requestSingleInstanceLock()) {
    app.quit()
  }

  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('second-instance', () => {
    if (nue.window.isMaximizable()) {
      nue.window.restore()
    }

    nue.window.focus()
  })

  app.on('before-quit', () => {
    if (!nue.config.isProduction) {
      app.exit()
    }
  })
}
