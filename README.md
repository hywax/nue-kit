# Nue Kit

A simple and flexible Electron app kit

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

## 🎯 Features

* 🪄️ **Ease of Use**: Simple and easy to understand API
* 🪝 **Hooks**: A flexible system for working with hooks
* 📦 **Modules**: A modular system for working with the application
* 🌐 **Locales**: A system for working with translations
* 💾 **Store**: A simple store for working with data
* 🏭 **Production Ready**: Ready for production use
* 🪄️ **TypeScript Support**: Full TypeScript support

## ✨ Installation

```shell
# Using pnpm
pnpm add @hywax/nue-kit -D

# Using yarn
yarn add @hywax/nue-kit -D

# Using npm
npm install @hywax/nue-kit -D
```

## ⚡ Usage

To fully explore all the features of Nue Kit, check out the repository for a ready-made [starter template](https://github.com/hywax/electron-nuxt-template)

```typescript
import { BrowserWindow, app } from 'electron'
import { createNue, createStore } from '@hywax/nue-kit'

function createMainWindowApp() {
  const store = createStore()

  const mainWindow = new BrowserWindow({
    ...store.get('app.mainWindowPosition'),
    width: 800,
    height: 480,
  })

  return createNue(mainWindow, store, {
    isProduction: false,
    singleInstance: true,
    locales: { /* ... */ },
    modules: [ /* ... */ ],
  })
}

app.whenReady().then(async () => {
  const awesomeApp = createMainWindowApp()
  await awesomeApp.hooks.callHook('electron:created', nue)
})
```

## 🏆 Contributors

A huge thank you to everyone who is helping to improve. Thanks to you, the project can evolve!

<img src="https://raw.githubusercontent.com/hywax/nue-kit/main/.github/static/contributors.svg" alt="VitePress Yandex Metrika Contributors" width="100%"/>


## 📄 License

The Nue Kit is based on open source code, according to [MIT License](LICENSE).


<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@hywax/nue-kit/latest.svg?logo=hackthebox&color=ff6e6e&logoColor=fff
[npm-version-href]: https://npmjs.com/package/nue-kit
[npm-downloads-src]: https://img.shields.io/npm/dm/@hywax/nue-kit.svg?colorB=ff6e6e
[npm-downloads-href]: https://npmjs.com/package/@hywax/nue-kit
[license-src]: https://img.shields.io/badge/License-MIT-ff6e6e?logo=opensourceinitiative&logoColor=fff
[license-href]: https://npmjs.com/package/@hywax/nue-kit
