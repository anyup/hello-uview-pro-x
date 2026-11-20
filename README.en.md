# uView Pro X · TS Edition — uni-app x Vapor-mode UI Component Library

[English](README.en.md) · [简体中文](README.md)

> A cross-platform UI component library built on TS + UVUE for uni-app x: 80+ high-quality components with a complete theme / i18n / utility / Hooks system; one codebase running on App (Android / iOS / HarmonyOS), H5, WeChat and Alipay Mini Programs.

| App-Android | App-iOS | App-HarmonyOS | H5 | WeChat Mini Program | Alipay Mini Program |
| :---------: | :-----: | :-----------: | :-: | :------------: | :------------: |
|      ✅      |    ✅    |      ✅        | ✅  |       ✅        |       ✅        |

## Product Matrix

The uView Pro family spans the uni-app and uni-app x ecosystems — pick by your project's stack (this repository is uView Pro X · TS edition):

| Product | Positioning | Stack | License | Links |
| ---- | ---- | ---- | ---- | ---- |
| **uView Pro** | Cross-platform UI framework: 80+ high-quality components, rich utilities, ready-made templates; multi-theme / dark mode / i18n built in, one-click adaptation to H5 / App / HarmonyOS / mini programs | uni-app · Vue3 + TS | Open source | [Site](https://uviewpro.cn/) · [Plugin Market](https://ext.dcloud.net.cn/plugin?name=uview-pro) |
| **uView Pro Starter** | Quick-start template built on uView Pro; one codebase fully compatible with H5 / mini programs / Android / iOS / HarmonyOS | uni-app · Vue3 + TS | Open source | [Site](https://starter.uviewpro.cn/) · [GitHub](https://github.com/anyup/uView-Pro-Starter) |
| **uView Pro X · UTS edition** | uni-app x component library 1.x: strongly-typed UTS, compiles to native Kotlin / Swift on App, multi-theme / dark mode / i18n / request layer built in, requires HBuilderX 5.03+ | uni-app x · UTS + UVUE | Paid | [Site](https://uts.uviewpro.cn/) · [Plugin Market](https://ext.dcloud.net.cn/plugin?name=uview-pro-x-uts) |
| **uView Pro X · TS edition** | uni-app x component library 2.0: API identical to the UTS edition, fully strongly-typed TS, requires HBuilderX 5.31+ | uni-app x · TS + UVUE | Paid | [Site](https://x.uviewpro.cn/) · [Plugin Market](https://ext.dcloud.net.cn/plugin?name=uview-pro-x) |

## Related Documentation

| Document | Description |
| ---- | ---- |
| [uView Pro X · Official docs](https://x.uviewpro.cn) | Full documentation of this library: component API, theming, i18n and more |
| [uView Pro X · Plugin Market](https://ext.dcloud.net.cn/plugin?name=uview-pro-x) | Download, online trial and release notes |
| [uView Pro · Official docs](https://uviewpro.cn) | Original uView Pro documentation, useful as a cross reference |
| [uni-app x · Official docs](https://doc.dcloud.net.cn/uni-app-x/) | Platform capabilities, vapor mode and TypeScript language reference |

## Demos & Playground

<table class="table">
    <tr>
        <td><img src="https://ik.imagekit.io/anyup/uview-pro/download/h5x.png" width="200" ></td>
        <td><img src="https://ik.imagekit.io/anyup/uview-pro/download/wechatx.jpg" width="200" ></td>
        <td><img src="https://ik.imagekit.io/anyup/uview-pro/download/alipayx.png" width="200" ></td>
        <td><img src="https://ik.imagekit.io/anyup/uview-pro/download/androidx.png" width="200" ></td>
    </tr>
    <tr>
        <td align="center"><strong>H5</strong><br>(scan in a browser)</td>
        <td align="center"><strong>WeChat Mini Program</strong><br>(scan in WeChat)</td>
        <td align="center"><strong>Alipay Mini Program</strong><br>(scan in Alipay)</td>
        <td align="center"><strong>App (Android)</strong><br>(scan in a browser)</td>
    </tr>
</table>

<img src="https://ik.imagekit.io/anyup/uview-pro/x/preview5.png"/>

## AI-Assisted Development

uView Pro X ships a companion Agent Skills package. Once installed, AI coding clients that support skills (Qoder, Claude Code, Cursor, etc.) know this library's page authoring conventions, TS / UVUE constraints, i18n & theming recipes and cross-platform pitfalls:

```bash
pnpx skills add uview-pro/skills
```

Run the command and pick the `uview-pro-x` skill (for 1.x UTS projects pick `uview-pro-x-uts`). If the installation fails, download it from the open-source repository: [https://github.com/uview-pro/skills](https://github.com/uview-pro/skills).

After installation, just describe what you need to the AI assistant (for example "build a login page with theme switching using uview-pro-x") — it generates compilable pages following the skill's conventions and validates `ux-*` component prop usage.

## Feedback

<table class="table">
    <tr>
        <td><img src="https://ik.imagekit.io/anyup/uview-pro/group/qqx.png" width="200" ></td>
        <td><img src="https://ik.imagekit.io/anyup/uview-pro/group/caoliaox.png" width="200" ></td>
    </tr>
</table>

If you purchased the source version, please mention your purchasing account name when adding me — I will verify the receipt and invite you into the source code group.

<table class="table">
    <tr>
        <td><img src="https://ik.imagekit.io/anyup/images/social/weixin-personal.png" width="200" ></td>
    </tr>
</table>

## Highlights

| Feature | Description |
| ---- | ---- |
| **80+ components** | Covering basic / form / data / feedback / layout / navigation / other categories — common mobile scenarios work out of the box |
| **Vapor mode first** | Developed for uni-app x vapor mode: bytecode rendering on App, composition API and plain class selectors only, prioritizing performance and cross-platform consistency |
| **Style isolation 2.0** | Built on the `styleIsolation` strategy 2.0 — component styles and business styles never pollute each other |
| **Strongly typed TypeScript** | Components and pages are written in TS with complete type definitions on props / events / slots; type errors surface at compile time instead of runtime |
| **Themes and dark mode** | Official blue theme built in, custom themes supported, light / dark / system-following switching with persistence, native App background stays in sync |
| **Internationalization** | Chinese / English / French language packs built in, custom packs can be merged and extended, switched at runtime with persistence |
| **$u global utility object** | 20+ helpers: regex validation `test`, unit conversion `addUnit`, debounce / throttle, deep clone / merge, color processing, date formatting, etc. |
| **19 built-in Hooks** | `useTheme`, `useLocale`, `useCountDown`, `useDebounce` / `useThrottle`, `usePopup`, and more |
| **Built-in request layer** | `http` axios-style instance model (chained interceptors / derived instances / upload & download progress) + `useRequest` page-level tri-state, zero third-party dependencies |
| **easycom out of the box** | `ux-` prefixed components are auto-registered — no manual import or local registration |

## Component Overview

> Tag name = `ux-` + component name, e.g. `ux-icon`, `ux-button`.

| Category | Count | Components |
| ---- | :--: | ---- |
| Basic |  11  | `icon`, `image`, `button`, `cell-item`, `cell-group`, `badge`, `tag`, `text`, `avatar`, `row`, `col` |
| Form |  18  | `form`, `form-item`, `input`, `textarea`, `select`, `picker`, `rate`, `search`, `number-box`, `checkbox`, `checkbox-group`, `radio`, `radio-group`, `switch`, `slider`, `keyboard`, `number-keyboard`, `car-keyboard` |
| Data |  4   | `line-progress`, `circle-progress`, `count-to`, `count-down` |
| Feedback |  17  | `action-sheet`, `toast`, `notice-bar`, `column-notice`, `row-notice`, `collapse`, `collapse-item`, `popup`, `swipe-action`, `modal`, `overlay`, `loading`, `loadmore`, `empty`, `alert-tips`, `full-screen`, `top-tips` |
| Layout |  13  | `line`, `card`, `grid`, `grid-item`, `divider`, `section`, `gap`, `mask`, `no-network`, `skeleton`, `swiper`, `sticky`, `waterfall` |
| Navigation |  9   | `tabbar`, `back-top`, `navbar`, `tabs`, `subsection`, `steps`, `step`, `link`, `pagination` |
| Other |  4   | `safe-bottom`, `status-bar`, `transition`, `config-provider` |

<img src="https://ik.imagekit.io/anyup/uview-pro/x/preview4.png"/>

## Installation

Requirement: **HBuilderX 5.31+** (2.0 adopts the TypeScript language strategy). This plugin only serves TypeScript projects; for UTS projects install the other plugin [uView Pro X · UTS edition](https://ext.dcloud.net.cn/plugin?name=uview-pro-x-uts) — it is not a historical version of the same plugin but a separately published package.

Open this plugin in the [DCloud Plugin Market](https://ext.dcloud.net.cn/plugin?name=uview-pro-x) and click "Download plugin and import into HBuilderX"; you can also search for `uview-pro-x` in the HBuilderX plugin market panel.

After import, the library lands in your project's `uni_modules/uview-pro-x/` directory and the easycom rules ship with the package.

## Quick Start

### 1. Configure easycom (pages.json)

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^ux-(.*)": "@/uni_modules/uview-pro-x/components/ux-$1/ux-$1.uvue"
    }
  }
}
```

Once configured, `ux-` components need no import — just write the tag.

### 2. Register the plugin (main.ts)

Registering the plugin unlocks i18n, theming and more; every option is optional and falls back to defaults.

```ts
import App from './App.uvue'
// Named import is required: the encrypted build's entry does not forward the default export
import { uViewProX, zhCN, enUS } from '@/uni_modules/uview-pro-x'
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)
  app.use(uViewProX, {
    // i18n: register language packs and set the default locale
    locale: {
      locales: [zhCN, enUS],
      defaultLocale: 'zh-CN'
    }
  })
  return { app }
}
```

### 3. Import theme styles (uni.scss)

The encrypted build cannot `@import` the library's `theme.scss`; copy the `$u-*` variable block from `theme.scss` into your `uni.scss`. With the source version you can use `@import '@/uni_modules/uview-pro-x/theme.scss';` directly. See [Quick Start](https://x.uviewpro.cn/en/guide/quickstart) for the full block.

### 4. Start building

```vue
<template>
  <view class="page">
    <ux-input v-model="siteUrl" placeholder="Please enter a URL" border />
    <ux-button type="primary" text="Submit" @click="onSubmit" />
    <ux-tag text="New" type="error" />
  </view>
</template>

<script setup lang="ts">
  import { $u } from '@/uni_modules/uview-pro-x'

  const siteUrl = ref('')

  const onSubmit = () => {
    // Validate that the input is a legal http(s) URL
    if (!$u.test.url(siteUrl.value)) {
      uni.showToast({ title: 'Please enter a valid URL', icon: 'none' })
      return
    }
    console.log('Submitted: ' + siteUrl.value)
  }
</script>
```

## Advanced Usage

### $u global utility object

```ts
import { $u } from '@/uni_modules/uview-pro-x'
```

| Capability | Description |
| ---- | ---- |
| `$u.test.url('https://uviewpro.cn')` | 20+ regex and type validations: URL, email, number, ranges, etc. |
| `$u.addUnit(20)` | Convert a number into a unit-suffixed string (px by default) |
| `$u.toStyle(obj)` | Convert a style object into a style string |
| `$u.debounce` / `$u.throttle` | Debounce / throttle wrappers |
| `$u.deepClone(obj)` / `$u.deepMerge(a, b)` | Deep clone / deep merge |
| `$u.hexToRgba('#2979ff', 0.3)` | Hex color to rgba |
| `$u.color.primary` | Read the current theme color (reactive, updates with theme / dark mode) |

### Built-in Hooks

```ts
import { useTheme, useLocale, useCountDown } from '@/uni_modules/uview-pro-x'
```

| Hook | Purpose |
| ---- | ---- |
| `useTheme` | Theme switching, dark mode, CSS variable generation |
| `useLocale` | Translation, language switching with persistence |
| `useCountDown` | Countdown |
| `useDebounce` / `useThrottle` | Debounce / throttle |
| `usePopup` | Popup open/close state |
| `useNotice` | Scrolling notice bar state |
| `useRect` | Element geometry queries |
| `useTouch` | Touch gestures (distance / direction) |
| `useSafeArea` | Bottom safe-area height |
| `useWindowInfo` | Screen / window information |
| `useDeviceInfo` | Device information (platform / model / OS, etc.) |
| `usePageScroll` | Page scroll offset; the page's onPageScroll and scroll-view share a single channel |
| `useRequest` | Request tri-state (loading / data / error), rerun cancels the previous, auto-cancel on unmount |

> `useBEM`, `useStyle`, `useParent`, `useChildren` and `useConfig` are internal component utilities, useful when extending the library itself.

### HTTP requests

```ts
import { http, useRequest } from '@/uni_modules/uview-pro-x'

// axios-style instance model: http.create derives independent instances, chained interceptors, upload / download with progress
const api = http.create({ baseURL: 'https://example.com' })
api.get('/api/user').then((res) => {
  console.log(res.data)
})

// Page-level tri-state: a repeated run() cancels the previous request, auto-cancel on unmount
const user = useRequest((ctx) => api.get('/api/user', null, { signal: ctx.signal }))
// user.loading / user.data / user.error / user.run() / user.cancel()
```

Failures always reject with `HttpError`; `isCancel(e)` distinguishes cancellation from real errors. Full capabilities: [http](https://x.uviewpro.cn/en/request/http) and [useRequest](https://x.uviewpro.cn/en/request/use-request).

### Themes and dark mode

```ts
import { useTheme } from '@/uni_modules/uview-pro-x'

const { setTheme, setDarkMode, toggleDarkMode, isInDarkMode } = useTheme()

setTheme('purple')       // switch theme (name must be registered: built-in 'uviewpro' or a custom one)
setDarkMode('dark')      // 'light' | 'dark' | 'auto' (follow the system)
toggleDarkMode()         // toggle light / dark
```

Custom themes: pass a theme array in `app.use(uViewProX, { theme: [...] })` (merged with the built-in official blue, same name overrides):

```ts
app.use(uViewProX, {
  theme: [
    {
      name: 'purple',
      label: 'Glow Purple',
      color: { primary: '#7c3aed' }
    }
  ]
})
```

<img src="https://ik.imagekit.io/anyup/uview-pro/x/preview1.png"/>

<img src="https://ik.imagekit.io/anyup/uview-pro/x/preview2.png"/>

### Internationalization

```ts
import { useLocale } from '@/uni_modules/uview-pro-x'

const { t, setLocale, currentLocale } = useLocale()

t('uModal.title')        // translate
setLocale('en-US')       // switch language at runtime (persisted)
```

Custom language packs are merged through `locale.locales` when registering the plugin (same name overrides):

```ts
app.use(uViewProX, {
  locale: {
    locales: [zhCN, enUS, zhTW],   // zhTW is a custom pack
    defaultLocale: 'zh-CN'
  }
})
```

<img src="https://ik.imagekit.io/anyup/uview-pro/x/preview3.png"/>