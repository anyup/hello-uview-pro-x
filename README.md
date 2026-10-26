# uView Pro X

> **uView Pro 的 uni-app x 版本** —— 基于 uni-app x 构建的跨端 UI 组件库。80+ 高质量组件、完整的主题 / 国际化 / 工具 / Hooks 体系，配套多主题、暗黑模式、国际化，一套代码支持 App（Android / iOS / 鸿蒙）、H5、微信小程序。

| App-Android | App-iOS | App-鸿蒙 | H5 | 微信小程序 |
| :---------: | :-----: | :------: | :-: | :--------: |
|      ✅      |    ✅    |    ✅     | ✅  |     ✅      |

## 官方文档

| 文档 | 说明 |
| ---- | ---- |
| [uView Pro X 官方文档](https://x.uviewpro.cn) | 本库的组件 API、主题、国际化等完整文档 |
| [DCloud 插件市场安装](https://ext.dcloud.net.cn/plugin?name=uview-pro-x) | 下载、在线试用与版本说明 |
| [uView Pro 官方文档](https://uviewpro.cn) | 原版文档（本库 API 与其基本一致，可作对照参考） |
| [uni-app x 官方文档](https://doc.dcloud.net.cn/uni-app-x/) | 平台能力、蒸汽模式与 UTS 语言参考 |

## 演示与体验

<table class="table">
    <tr>
        <td><img src="https://ik.imagekit.io/anyup/uview-pro/download/h5x.png" width="200" ></td>
        <td><img src="https://ik.imagekit.io/anyup/uview-pro/download/wechatx.jpg" width="200" ></td>
        <td><img src="https://ik.imagekit.io/anyup/uview-pro/download/androidx.png" width="200" ></td>
    </tr>
    <tr>
        <td align="center"><strong>H5</strong><br>（浏览器扫码）</td>
        <td align="center"><strong>小程序</strong><br>（微信扫码）</td>
        <td align="center"><strong>APP（安卓）</strong><br>（浏览器扫码）</td>
    </tr>
</table>

<img src="https://ik.imagekit.io/anyup/uview-pro/x/preview5.png"/>

## AI 辅助开发

uView Pro X 提供配套的 Agent Skills 技能包，安装后 AI 编程助手（Qoder、Claude Code、Cursor 等支持 skills 的客户端）即可掌握本库的页面编写规范、UTS / UCSS 约束、多语言与多主题接入配方、三端兼容避错清单：

```bash
pnpx skills add uview-pro/skills
```

安装后在 AI 助手中直接描述需求（例如「用 uview-pro-x 写一个带主题切换的登录页」），助手会按技能内的规范生成可编译的页面代码，并校验 `ux-*` 组件的属性用法。

## 交流反馈

<table class="table">
    <tr>
        <td><img src="https://ik.imagekit.io/anyup/uview-pro/group/qqx.png" width="200" ></td>
        <td><img src="https://ik.imagekit.io/anyup/uview-pro/group/caoliaox.png" width="200" ></td>
        <td><img src="https://ik.imagekit.io/anyup/images/social/weixin-person.png" width="200" ></td>
    </tr>
    <tr>
        <td align="center"><strong>微信</strong><br>（微信扫码）</td>
        <td align="center"><strong>Q-Q</strong><br>（Q-Q扫码）</td>
        <td align="center"><strong>源码咨询</strong><br>（微信扫码）</td>
    </tr>
</table>

## 核心特性

| 特性 | 说明 |
| ---- | ---- |
| **80+ 高质量组件** | 覆盖基础 / 表单 / 数据 / 反馈 / 布局 / 导航 / 其他七大分类，移动端常见场景开箱即用 |
| **蒸汽模式（vapor）优先** | 面向 uni-app x 蒸汽模式开发：App 端字节码渲染，仅使用组合式 API 与简单类名选择器，性能与多端一致性优先 |
| **样式隔离 2.0** | 采用 `styleIsolation` 策略 2.0，组件样式与业务样式互不污染，无需担心全局选择器串色 |
| **多语言开发（UTS / TS / JS）** | 组件与页面以 UTS 强类型编写，接口均带完整类型定义，同时兼容 TypeScript / JavaScript 写法；类型错误在编译期暴露而非运行时 |
| **多主题与暗黑模式** | 内置官方蓝主题，支持自定义多主题、亮色 / 暗黑 / 跟随系统切换，选择自动持久化，App 端原生背景联动 |
| **国际化 i18n** | 内置中文 / 英文 / 法文语言包，支持合并扩展自定义语言包，运行时切换并持久化 |
| **$u 全局工具对象** | 20+ 工具方法：正则校验 `test`、单位转换 `addUnit`、防抖节流、深克隆 / 深合并、颜色处理、时间格式化等 |
| **16 个内置 Hooks** | 主题 `useTheme`、国际化 `useLocale`、倒计时 `useCountDown`、防抖节流、弹层状态 `usePopup` 等 |
| **easycom 开箱即用** | `ux-` 前缀组件自动注册，无需手动 import 与局部注册 |

## 组件总览

> 标签名 = `ux-` + 组件名，例如 `ux-icon`、`ux-button`。

| 分类 | 数量 | 组件 |
| ---- | :--: | ---- |
| 基础 |  11  | `icon`、`image`、`button`、`cell-item`、`cell-group`、`badge`、`tag`、`text`、`avatar`、`row`、`col` |
| 表单 |  18  | `form`、`form-item`、`input`、`textarea`、`select`、`picker`、`rate`、`search`、`number-box`、`checkbox`、`checkbox-group`、`radio`、`radio-group`、`switch`、`slider`、`keyboard`、`number-keyboard`、`car-keyboard` |
| 数据 |  4   | `line-progress`、`circle-progress`、`count-to`、`count-down` |
| 反馈 |  17  | `action-sheet`、`toast`、`notice-bar`、`column-notice`、`row-notice`、`collapse`、`collapse-item`、`popup`、`swipe-action`、`modal`、`overlay`、`loading`、`loadmore`、`empty`、`alert-tips`、`full-screen`、`top-tips` |
| 布局 |  13  | `line`、`card`、`grid`、`grid-item`、`divider`、`section`、`gap`、`mask`、`no-network`、`skeleton`、`swiper`、`sticky`、`waterfall` |
| 导航 |  9   | `tabbar`、`back-top`、`navbar`、`tabs`、`subsection`、`steps`、`step`、`link`、`pagination` |
| 其他 |  4   | `safe-bottom`、`status-bar`、`transition`、`config-provider` |

<img src="https://ik.imagekit.io/anyup/uview-pro/x/preview4.png"/>

## 安装

前置条件：支持 uni-app x 的 HBuilderX（或其他可编译 uni-app x 项目的环境）。

在 [DCloud 插件市场](https://ext.dcloud.net.cn/plugin?name=uview-pro-x) 打开本插件，点击「下载插件并导入 HBuilderX」；也可在 HBuilderX 的插件市场面板搜索 `uview-pro-x` 安装。

导入后组件库位于项目的 `uni_modules/uview-pro-x/` 目录，easycom 规则随包生效。

## 快速上手

### 1. 配置 easycom（pages.json）

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

配置完成后，`ux-` 开头的组件无需手动 import，直接写标签即可使用。

### 2. 注册插件（main.uts）

注册插件后即可使用国际化、多主题等能力；全部参数可选，不传则使用默认值。

```ts
import App from './App.uvue'
import uViewProX, { zhCN, enUS } from './uni_modules/uview-pro-x'
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)
  app.use(uViewProX, {
    // 国际化：注册语言包并指定默认语言
    locale: {
      locales: [zhCN, enUS],
      defaultLocale: 'zh-CN'
    }
  })
  return { app }
}
```

### 3. 开始使用

```vue
<template>
  <view class="page">
    <ux-input v-model="keyword" placeholder="请输入关键词" border />
    <ux-button type="primary" text="提交" @click="onSubmit" />
    <ux-tag text="新" type="error" />
  </view>
</template>

<script setup lang="uts">
  import { $u } from '@/uni_modules/uview-pro-x'

  const keyword = ref('')

  const onSubmit = () => {
    if (!$u.test.mobile('13800138000')) {
      uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    console.log('提交内容：' + keyword.value)
  }
</script>
```

## 进阶用法

### $u 全局工具对象

```ts
import { $u } from '@/uni_modules/uview-pro-x'
```

| 常用能力 | 说明 |
| ---- | ---- |
| `$u.test.mobile('138…')` | 手机号、邮箱、身份证、URL 等 20+ 种正则校验 |
| `$u.addUnit(20)` | 数值转带单位字符串（不传单位默认补 px） |
| `$u.toStyle(obj)` | 样式对象转样式字符串 |
| `$u.debounce` / `$u.throttle` | 防抖 / 节流函数包装 |
| `$u.deepClone(obj)` / `$u.deepMerge(a, b)` | 深克隆 / 深合并 |
| `$u.hexToRgba('#2979ff', 0.3)` | 十六进制颜色转 rgba |
| `$u.color.primary` | 读取当前主题色（响应式，随主题 / 暗黑切换自动更新） |

### 内置 Hooks

```ts
import { useTheme, useLocale, useCountDown } from '@/uni_modules/uview-pro-x'
```

| Hook | 用途 |
| ---- | ---- |
| `useTheme` | 主题切换、暗黑模式、CSS 变量生成 |
| `useLocale` | 国际化翻译、语言切换与持久化 |
| `useCountDown` | 倒计时 |
| `useDebounce` / `useThrottle` | 防抖 / 节流 |
| `usePopup` | 弹窗开关状态 |
| `useNotice` | 滚动通告栏状态 |
| `useRect` | 元素几何信息查询 |
| `useTouch` | 触摸手势（滑动距离 / 方向） |
| `useSafeArea` | 底部安全区高度 |
| `useWindowInfo` | 屏幕 / 窗口信息 |

> 另有 `useBEM`、`useStyle`、`useParent`、`useChildren`、`useConfig` 等为组件内部工具，二次开发组件时可参考。

### 主题与暗黑模式

```ts
import { useTheme } from '@/uni_modules/uview-pro-x'

const { setTheme, setDarkMode, toggleDarkMode, isInDarkMode } = useTheme()

setTheme('purple')       // 切换主题（名称需已注册：内置 'uviewpro' 或自定义主题）
setDarkMode('dark')      // 'light' | 'dark' | 'auto'（跟随系统）
toggleDarkMode()         // 亮暗一键切换
```

自定义多主题：在 `app.use(uViewProX, { theme: [...] })` 中传入主题数组（与内置官方蓝合并，同名覆盖）：

```ts
app.use(uViewProX, {
  theme: [
    {
      name: 'purple',
      label: '霞光紫',
      color: { primary: '#7c3aed' }
    }
  ]
})
```

<img src="https://ik.imagekit.io/anyup/uview-pro/x/preview1.png"/>

<img src="https://ik.imagekit.io/anyup/uview-pro/x/preview2.png"/>

### 国际化

```ts
import { useLocale } from '@/uni_modules/uview-pro-x'

const { t, setLocale, currentLocale } = useLocale()

t('uModal.title')        // 翻译
setLocale('en-US')       // 运行时切换语言（自动持久化）
```

自定义语言包在注册插件时传入 `locale.locales` 合并（同名覆盖）：

```ts
app.use(uViewProX, {
  locale: {
    locales: [zhCN, enUS, zhTW],   // zhTW 为自定义语言包
    defaultLocale: 'zh-CN'
  }
})
```

<img src="https://ik.imagekit.io/anyup/uview-pro/x/preview3.png"/>
