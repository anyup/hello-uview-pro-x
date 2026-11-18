# uView Pro X

> **The uni-app x TS edition of uView Pro** — a cross-platform UI component library built on TS + UVUE for uni-app x. 80+ high-quality components with a complete theme / i18n / utility / Hooks system; one codebase running on App (Android / iOS / HarmonyOS), H5, WeChat and Alipay Mini Programs.

| App-Android | App-iOS | App-HarmonyOS | H5 | WeChat Mini Program | Alipay Mini Program |
| :---------: | :-----: | :-----------: | :-: | :------------: | :------------: |
|      ✅      |    ✅    |      ✅        | ✅  |       ✅        |       ✅        |

## Product Matrix

The uView Pro family spans the uni-app and uni-app x ecosystems — pick by your project's stack (this repository is uView Pro X, TS edition):

| Product | Positioning | Stack | License | Links |
| ---- | ---- | ---- | ---- | ---- |
| **uView Pro** | Cross-platform UI framework: 80+ high-quality components, rich utilities, ready-made templates; multi-theme / dark mode / i18n built in, one-click adaptation to H5 / App / HarmonyOS / mini programs | uni-app · Vue3 + TS | Open source | [Site](https://uviewpro.cn/) · [GitHub](https://github.com/anyup/uView-Pro) |
| **uView Pro Starter** | Quick-start template built on uView Pro; one codebase fully compatible with H5 / mini programs / Android / iOS / HarmonyOS | uni-app · Vue3 + TS | Open source | [Site](https://starter.uviewpro.cn/) · [GitHub](https://github.com/anyup/uView-Pro-Starter) |
| **uView Pro X UTS** | uni-app x component library 1.x: compiles to native Kotlin / Swift on App, multi-theme / dark mode / i18n / request layer built in | uni-app x · UTS | Paid | [Site](https://uts.uviewpro.cn/) · [Plugin Market](https://ext.dcloud.net.cn/plugin?name=uview-pro-x-uts) |
| **uView Pro X · TS edition** | uni-app x component library 2.0: API-compatible with the UTS edition, fully strongly-typed TS, requires HBuilderX 5.31+ | uni-app x · TS + UVUE | Paid | [Site](https://x.uviewpro.cn/) · [Plugin Market](https://ext.dcloud.net.cn/plugin?name=uview-pro-x) |

---

## Highlights

| Feature | Description |
| ---- | ---- |
| **80+ components** | Covering basic / form / data / feedback / layout / navigation / other categories — common mobile scenarios work out of the box |
| **Vapor mode first** | Developed for uni-app x vapor mode: bytecode rendering on App, composition API and plain class selectors only, prioritizing performance and cross-platform consistency |
| **Style isolation 2.0** | Built on the `styleIsolation` strategy 2.0 — component styles and business styles never pollute each other |
| **Strongly typed TypeScript** | Components and pages are written in TS with complete type definitions on props / events / slots; type errors surface at compile time instead of runtime |
| **API largely consistent with uView Pro** | The vast majority of props / events / slots keep the original naming and behaviour, so existing experience transfers directly; a few items are adjusted for uni-app x platform capabilities — see the [official docs](https://x.uviewpro.cn) for the full list |
| **Themes and dark mode** | Official blue theme built in, custom themes supported, light / dark / system-following switching with persistence, native App background stays in sync |
| **Internationalization** | Chinese / English / French language packs built in, custom packs can be merged and extended, switched at runtime with persistence |
| **$u global utility object** | 20+ helpers: regex validation `test`, unit conversion `addUnit`, debounce / throttle, deep clone / merge, color processing, date formatting, etc. |
| **19 built-in Hooks** | `useTheme`, `useLocale`, `useCountDown`, `useDebounce` / `useThrottle`, `usePopup`, and more |
| **Built-in request layer** | `http` axios-style instance model (chained interceptors / derived instances / upload & download progress) + `useRequest` page-level tri-state, zero third-party dependencies |
| **easycom out of the box** | `ux-` prefixed components are auto-registered — no manual import or local registration |

## Why uView Pro X

1. **Native performance + type safety**: written in TypeScript on uni-app x, rendered natively on App (not a WebView shell), with compile-time type checking.
2. **Low migration cost**: the API is largely consistent with uView Pro — in most cases swapping `u-xxx` for `ux-xxx` in the tag is enough; check the [official docs](https://x.uviewpro.cn) for the details.
3. **Consistent across platforms**: the same code runs on App (Android / iOS / HarmonyOS), H5, WeChat and Alipay Mini Programs; platform differences are already handled inside components via conditional compilation.
4. **A complete system**: more than components — theming, dark mode, i18n, utilities and Hooks are all provided, so no third-party solutions need to be assembled.
5. **Trustworthy engineering**: every component carries complete comments and a matching demo page, so behaviour is documented and reproducible.

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

## Installation

Requirement: **HBuilderX 5.31+** (2.0 adopts the TypeScript language strategy); for 1.x (UTS) projects pick a 1.x historical version in the plugin market.

The library is distributed through the **DCloud Plugin Market**: open https://ext.dcloud.net.cn/plugin?name=uview-pro-x and click "Download plugin and import into HBuilderX"; you can also search for `uview-pro-x` in the HBuilderX plugin market panel.

After import, the library lands in your project's `uni_modules/uview-pro-x/` directory and the easycom rules ship with the package.

## Configuration & Usage

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
    <ux-input v-model="keyword" placeholder="Please enter a keyword" border />
    <ux-button type="primary" text="Submit" @click="onSubmit" />
    <ux-tag text="New" type="error" />
  </view>
</template>

<script setup lang="ts">
  import { $u } from '@/uni_modules/uview-pro-x'

  const keyword = ref('')

  const onSubmit = () => {
    if (!$u.test.mobile('13800138000')) {
      uni.showToast({ title: 'Please enter a valid phone number', icon: 'none' })
      return
    }
    console.log('Submitted: ' + keyword.value)
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
| `$u.test.mobile('138…')` | 20+ regex validations: phone, email, ID card, URL, etc. |
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

## Demos & Playground

- **Try online**: open the [plugin market page](https://ext.dcloud.net.cn/plugin?name=uview-pro-x) and click "Try" to browse every component demo online, no download needed.
- **Run locally**: clone the demo project [hello-uview-pro-x](https://github.com/anyup/hello-uview-pro-x), open it in HBuilderX, then:
  - Run → **Run in browser** (H5)
  - Run → **Run on phone or emulator** (App / HarmonyOS)
  - Run → **Run in mini program simulator** (WeChat / Alipay Mini Program)

## AI-Assisted Development

uView Pro X ships a companion Agent Skills package. Once installed, AI coding clients that support skills (Qoder, Claude Code, Cursor, etc.) know this library's page authoring conventions, TS / UCSS constraints, i18n & theming recipes and cross-platform pitfalls:

```bash
pnpx skills add uview-pro/skills
```

Run the command and pick the `uview-pro-x` skill (for 1.x UTS projects pick `uview-pro-x-uts`).

After installation, just describe what you need to the AI assistant (for example "build a login page with theme switching using uview-pro-x") — it generates compilable pages following the skill's conventions and validates `ux-*` component prop usage.

## Package Layout

```
uni_modules/uview-pro-x/
├── components/                 # ux-* components (easycom auto registration)
├── libs/
│   ├── config/                 # library config constants, theme tokens, zIndex
│   ├── hooks/                  # 19 composable hooks
│   ├── styles/                 # global styles and mixins (hairline borders, etc.)
│   └── utils/                  # utility functions (the $u implementation)
├── locale/                     # language packs (zh-CN / en-US / fr-FR)
├── types/                      # global type definitions
├── index.scss                  # style entry
├── theme.scss                  # SCSS theme variables (overridable)
└── index.ts                    # plugin entry ($u / hooks exports)
```

## Related Documentation

| Document | Description |
| ---- | ---- |
| [uView Pro X official docs](https://x.uviewpro.cn) | Full documentation of this library: component API, theming, i18n and more |
| [DCloud Plugin Market](https://ext.dcloud.net.cn/plugin?name=uview-pro-x) | Download, online trial and release notes |
| [uView Pro official docs](https://uviewpro.cn) | Original documentation (this library is largely consistent with it, useful as a cross reference) |
| [uni-app x official docs](https://doc.dcloud.net.cn/uni-app-x/) | Platform capabilities, vapor mode and TypeScript language reference |

---

[简体中文](README.md)
