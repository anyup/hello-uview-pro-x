# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2.0.15（2026-11-28）

### ✨ Features | 新功能

- **ux-signature:** 新增 ux-signature 签名板组件，支持手写签名、多种格式底纹、撤销、清空、确定导出等功能，适配多端运行。
- **signature:** 新增签名板完整功能与演示页面，包含基础用法、自定义画笔、提示语、按钮配置等多种场景
- **signature-grid:** 新增书写网格组件的演示页面，包含类型米字格、田字格、九宫格等底纹、大小、颜色、描红内容、对齐方式、导出与撤销、导出笔迹
- **touch-emulator:** 新增鼠标模拟触摸事件的模拟器脚本，用于在不支持触摸事件的设备上模拟触摸功能

## 2.0.14（2026-11-27）

### ✨ Features | 新功能

- **ux-count-down:** 新增 format 属性支持 HH:mm:ss 等格式，新增 pause、reset 方法，新增默认插槽支持自定义渲染
- **count-down:** 新增倒计时 format 格式模板、slot 自定义插槽、格式化多语言、手动控制等多个使用示例，完善手动控制的状态管理和交互功能

## 2.0.13（2026-11-26）

### 🐛 Bug Fixes | Bug 修复

- 修复英文国际化中秒单位的大小写错误

### ✨ Features | 新功能

- 新增反馈组件 Popover 的版本登记，修改组件自动从路由匹配版本信息

## 2.0.12（2026-11-26）

### ✨ Features | 新功能

- **ux-input:** 新增前后置插槽支持，可在输入框前后添加自定义内容，点击事件阻止冒泡
- **input:** 新增输入框后置内容插槽演示示例，包含单位和验证码按钮两种场景

## 2.0.11（2026-11-25）

### ✨ Features | 新功能

- **useWindowInfo:** 新增可手动刷新窗口信息的方法，用于在视口尺寸变化时获取最新数据
- **ux-popover:** 新增气泡菜单组件 ux-popover，支持自定义方位、间距、箭头、样式等配置，可根据屏幕边界自动翻转方位，适配多端场景，满足触发展开自定义菜单的需求
- 新增popover组件的完整演示页面，包含基础用法、方位选择、外观配置、深色气泡、评论操作气泡、遮罩与关闭行为等6种场景

## 2.0.10（2026-11-25）

### 🐛 Bug Fixes | Bug 修复

- **ux-tabs:** 修复App端tab文字样式失效问题，优化activeItemStyle样式逻辑
- **demo-page:** 修复 H5 端 iOS 17+ 首屏 fixed 浮层锚点缺陷

### ✨ Features | 新功能

- **tabs:** 新增字号和激活项样式的使用示例

## 2.0.9（2026-11-23）

### 🐛 Bug Fixes | Bug 修复

- **ux-number-box:** 修复长按连续加减在桌面端失效及触屏点击重复触发问题，解决桌面端长按功能失效和触屏点击一次触发两次加减的问题

## 2.0.8（2026-11-23）

### 🐛 Bug Fixes | Bug 修复

- **ux-text:** 修复鸿蒙端文本行数显示异常问题，适配鸿蒙端 ArkUI 的强类型 number 要求，避免因空值导致文本不渲染的 bug

## 2.0.7（2026-11-23）

### 🐛 Bug Fixes | Bug 修复

- 修复栅格布局组件国际化文案错误问题

### ♻️ Code Refactoring | 代码重构

- 优化圆环进度示例页面的国际化文案展示
- 优化多语言文件中冗余的文本内容

## 2.0.6（2026-11-22）

### 🐛 Bug Fixes | Bug 修复

- **button:** 修复 button 类型定义使用未导入类型的问题
- **ux-sticky:** 修复自定义样式合并失效问题

### ♻️ Code Refactoring | 代码重构

- **customStyle:** 统一多个组件的customStyle类型，优化样式处理逻辑
- **ux-button:** 优化按钮组件的样式绑定方式，增强样式兼容性

## 2.0.5（2026-11-21）

### 🐛 Bug Fixes | Bug 修复

- **components:** 修正多个组件的链接路径错误问题

## 2.0.4（2026-11-20）

### 🐛 Bug Fixes | Bug 修复

- **demo-page:** 修复微信小程序页面不满一屏时，露出原生背景问题

## 2.0.3（2026-11-20）

### 🐛 Bug Fixes | Bug 修复

- **ux-car-keyboard:** 修复车牌号键盘在明暗主题切换时，底板、按键背景和文字颜色异常问题

## 2.0.2（2026-11-19）

### 🐛 Bug Fixes | Bug 修复

- **ux-picker:** 修复选择器主题适配问题，统一三端样式，针对不同端（小程序、H5、App）做样式兼容处理
- **ux-select:** 修复 select 选择器指示器边框颜色不跟随应用主题、蒙层颜色在暗色主题下显示异常的问题

## 2.0.1（2026-11-19）

### 🐛 Bug Fixes | Bug 修复

- **ux-tabs:** 修复 App 端横向标签无法滚动，自动跟随失效问题

## 2.0.0（2026-11-18）

### 💥 Breaking Changes | 破坏性变更

- **语言策略**：组件库与演示工程由 UTS 全量迁移为 TypeScript（TS + UVUE），源码扩展名 `.uts` → `.ts`；页面脚本 `<script setup lang="uts">` → `lang="ts"`
- **工程入口**：`main.uts` → `main.ts`、`index.uts` → `index.ts`，示例页代码片段 `code.uts` → `code.ts`
- **对象类型**：全局对象类型 `UTSJSONObject` 统一替换为 `JsonObject`，`types/global.uts` → `types/global.ts`
- **编译基线**：要求 HBuilderX 5.31+（TypeScript 语言策略）；1.x（UTS）工程请在插件市场继续使用 1.x 历史版本
- **兼容性**：组件对外 API（props / events / slots / 命令式方法）与 1.x 保持一致，业务代码无需改写；加密版插件仍用命名导入 `import { uViewProX } from '@/uni_modules/uview-pro-x'`（入口固定 `export * from './index'`，不转发 default）

### ✨ Features | 新功能

- **全量 TypeScript**：组件、工具库（`config` / `utils` / `styles` / `request`）、19 个 hooks、语言包与类型契约全部 TS 化，共 141 个源码文件
- **类型契约**：`types/global.ts` 统一公共类型，`types/component-contracts.ts` 约束组件 Props 与事件载荷，错误在编译期暴露
- **加密版兼容**：纯类型补同名 `const` 占位，`verify-type-shims` 逐一对账 146 个类型 0 违规
- **内置请求层**：`http` axios 实例模型（`http.create` 派生、双向拦截器、上传下载进度）与 `useRequest` 页面三态（`loading` / `data` / `error`、`ctx.signal` 取消、卸载自动取消），失败统一 reject `HttpError`，`isCancel` 区分取消
- **演示工程**：87 个示例页同步 TS 化，`main.ts` 装配 pinia（内置 3.0.4）、中 / 英 / 法语言包与多主题，页面代码片段统一为 `code.ts`
- **技能与 API 快照**：消费侧拆分为 `uview-pro-x`（2.0 TS）与 `uview-pro-x-uts`（1.x UTS）双技能，编写规范新增 `component-writer-ts`；API 卡片 70 张随版本重生成，`model.json` 与全库指纹同步

### ♻️ Refactors | 重构

- **脚本编排**：`<script setup>` 统一 10 段顺序，`verify-script-order` 全库 0 违规
- **样式与跨端**：主题仍走 SCSS `$u-*` 变量与运行时 `$u.color.*`，样式隔离 2.0 策略不变；`verify-uvue-css` 扫描 175 个 uvue，App 端样式限制 0 违规
- **平台口径**：对外支持表述扩展为六大平台（App Android / iOS / 鸿蒙、H5、微信小程序、支付宝小程序），实测矩阵仍只记录已实测平台

### 📝 Documentation | 文档

- **readme**：重写为 TS + UVUE 定位，新增六大平台支持表、产品矩阵（uView Pro / Starter / X UTS / X TS 版）、HBuilderX 5.31+ 前置条件与 HTTP 请求示例
- **文档站**：快速开始与指南统一为 `main.ts` / `lang="ts"` 口径；配置、主题、暗黑模式、国际化、pinia、自定义图标字体与请求层（`http` / `useRequest` / 最佳实践）同步更新
- **示例与门禁**：`code.ts` 片段与示例页一一对应，技能 API 卡片与组件源码一致性由 `--check` 保证 0 漂移

### 🤖 AI 升级提示词 | AI Upgrade Prompt

迁移到 2.0 主要是语言口径变化。把下面整段提示词交给 AI 编码助手，让它对存量 1.x 项目逐项改造；改完要求它执行第 8 条自检并汇报改动文件清单：

```text
请把一个 uni-app x 项目（uview-pro-x 1.x，UTS 语言）升级到 uview-pro-x 2.0（TypeScript 语言）。严格按下列规则逐项改造，不做与语言无关的重构，完成后逐条自检并汇报改动文件清单：

1. 脚本后缀：项目内所有 .uts 脚本文件改为 .ts，包括 pages/ 与 components/ 下的页面与组件脚本、根入口 main.uts → main.ts、入口导出 index.uts → index.ts、类型文件 types/global.uts → types/global.ts，以及 store/、utils/、hooks/ 等工具脚本；H5 工程的 index.html 中入口 script 的 src 同步改为 /main.ts。
2. 页面语言标记：所有 .uvue 中的 <script setup lang="uts"> 改为 lang="ts"；只写了 <script setup>、未指定 lang 的显式补成 <script setup lang="ts">；非 setup 的 <script lang="uts"> 同样改为 lang="ts"。
3. 对象类型：所有 UTSJSONObject 换成标准 TS 对象类型——结构固定的用 interface / type 声明字段，键任意的用 Record<string, any>（也可直接用 uview-pro-x 导出的 JsonObject，它等价于 Record<string, any>）；取值、赋值、增删、遍历一律用标准写法（obj.key、obj['key']、Object.keys、对象展开），禁止 getString / getNumber / getBoolean / getJSON / getArray / toMap 一类 UTS 专有方法。
4. JSON 处理：删除 JSON.parseObject、JSON.parseArray 及其类型参数，统一改为标准 JSON.parse，结果用 as T / as T[] 收窄（如 JSON.parse(text) as User），需要容错时自己 try/catch；不要再保留任何 parseObject / parseArray 的封装。
5. 原生侧不改：uni_modules 下的原生插件、原生标准组件与其 UI 一律保持 UTS 语言与原语法，不改文件后缀、不改 <script lang="uts">、不把内部实现改写成 TS。
6. 跨语言传参对等：原生插件或原生标准 UI 组件的参数类型是 UTSJSONObject 时，TS 页面与 TS 组件直接传对应的普通对象即可（对象字面量或 Record<string, any>），两边是对等的，不需要 toMap，也不需要任何包装或转换。
7. 保持不变：import 路径与 easycom 规则、组件 API（props / events / slots）、条件编译（#ifdef / #ifndef）、页面路由与主题配置都不动；仅当 import 里显式写了 .uts 后缀时，随文件改名同步为 .ts。
8. 自检：全局搜索 .uts、lang="uts"、UTSJSONObject、parseObject、parseArray、toMap，确认 TS 侧 0 残留（原生插件内部命中属正常，不改）；再用 HBuilderX 5.31+ 编译，按「类型不匹配 / 属性不存在」逐个修正直到通过。
```

## 1.0.31（2026-11-17）

### 🐛 Bug Fixes | Bug 修复

- **ux-navbar:** 修正导航栏高度单位的描述错误问题

### ✨ Features | 新功能

- **ux-button:** 新增fontSize、bold、color、height四个可配置属性，支持自定义按钮文字样式和尺寸
- **button:** 新增按钮字号、文字色和自定义高度演示示例

## 1.0.30（2026-11-16）

### 🐛 Bug Fixes | Bug 修复

- **ux-car-keyboard:** 修复数字键盘按压反馈失效及样式继承问题

## 1.0.29（2026-11-15）

### 🐛 Bug Fixes | Bug 修复

- **layout-line:** 修复多个间距组件 ux-line 示例展示问题

### 💄 Styles | 风格

- 修改默认导航栏文字颜色为黑色，适配浅色主题显示

## 1.0.28（2026-11-13）

### ♻️ Code Refactoring | 代码重构

- **config:** 新增 BASE_THEME_NAME 常量统一管理主题名称，明确内置基线主题变量
- **useTheme:** 重构主题合并与初始化逻辑，优化主题配置处理，新增归一化主题配置函数，确保用户自定义主题能正确继承基线配置并正常生效
- **useTheme:** 重构主题演示页面，新增完整设置与主题管理功能，包括：设置面板、暗黑模式三态、主题列表、调色板、状态持久化、CSS变量、恢复默认
- **scripts:** 新增对 App 端 uvue 不支持组合选择器的校验规则

## 1.0.27（2026-11-13）

### 🐛 Bug Fixes | Bug 修复

- **search-page:** 修复搜索页未注入时暗黑模式样式不生效的问题

## 1.0.26（2026-11-12）

### ✨ Features | 新功能

- **ux-link:** 新增 text 属性作为插槽 fallback 内容
- **platform:** 新增支付宝小程序平台支持，和支付宝小程序体验码，可扫码体验，但仍有一些问题

### 🐛 Bug Fixes | Bug 修复

- **ux-text:** 修复 link 模式下微信小程序文字重复渲染问题

## 1.0.25（2026-11-12）

### ♻️ Code Refactoring | 代码重构

- **demo-result:** 重构组件演示样式适配多端主题联动

### 🐛 Bug Fixes | Bug 修复

- **ux-form-item:** 修复 App 端错误提示文字被截断的问题
- **ux-tag:** 修复 App 端 Tag 文字顶部被裁剪问题

## 1.0.24（2026-11-11）

### ✨ Features | 新功能

- **request:** 新增 Request 请求库核心模块，支持请求、响应拦截器配置，支持多实例多域名请求配置，支持取消请求
- **request:** 新增 Request 上传和下载的基础传输实现，封装平台原生 API，提供进度回调、中止能力，适配加密环境类型擦除问题，剥离默认配置与拦截器逻辑
- **useRequest:** 新增 useRequest 请求钩子，提供带竞态处理和取消能力的请求封装，支持请求的 loading 状态、数据存储、错误处理，支持自动取消上一次未完成请求以避免竞态，在组件卸载时自动取消请求。
- **demo:** 新增 Request 请求模块的核心功能演示，以及 useRequest 组合式请求工具的使用示例，包含单例实例、拦截器配置、多域名派生实例及拦截器安装逻辑，展示基础三态、连续调用、取消请求等场景
- **demo:** 新增 version 统一管理版本号和新增能力登记，版本号自动获取

## 1.0.23（2026-11-11）

### 🐛 Bug Fixes | Bug 修复

- **ux-checkbox:** 修复 App 端 checkbox 禁用态跨端显示不一致问题
- **ux-radio:** 修复App 端禁用态文字颜色错误的问题，解决跨端样式不一致的bug

### 💄 Styles | 风格

- **demo:** 简化 steps 步骤计数样式，移除冗余属性，修复 App 演示兼容

## 1.0.22（2026-11-10）

### ✨ Features | 新功能

- **ux-sticky:** 新增吸顶组件，适配多端导航栏与外部滚动通道，统一多端导航栏高度计算，优化吸顶定位逻辑避免内容上跳
- **sticky:** 新增吸顶组件的全场景演示页面，包含基础用法、原生导航栏和无导航栏三种场景

### ♻️ Code Refactoring | 代码重构

- **demo:** 优化容器返回顶部逻辑，统一处理页面和容器滚动
- **demo:** 完善吸顶组件的使用说明文案，补充 bgColor 属性的注释

## 1.0.21（2026-11-10）

### 🐛 Bug Fixes | Bug 修复

- **useChildren:** 修复使用 Pinia 时类型与 useChildren 不兼容导致的运行时异常警告，优化依赖更新问题

### ✨ Features | 新功能

- 新增 pinia 状态管理演示示例，包括定义 store、挂载和页面使用的完整示例
- **steps:** 新增动态步骤条示例，支持添加和删除步骤，自动同步步骤数、序号与连接线

## 1.0.20（2026-11-10）

### 🐛 Bug Fixes | Bug 修复

- **i18n:** 修正多语言文件中部分组件的命名问题，包括简体中文、英文、法语
- **types:** 解决加密版插件编译时类型导入丢失导致的运行期导出错误问题
- **empty:** 修复空状态示例中的购物车图标模式声明错误问题

## 1.0.19（2026-11-09）

### 🐛 Bug Fixes | Bug 修复

- **type:** 修复 DarkMode 运行时导入问题，解决加密版插件运行时导入类型报错的问题
- **module:** 修复加密版插件导入路径错误导致的模块找不到问题

### ✨ Features | 新功能

- **ux-button:** 新增 ux-button 组件的 easycom 配置文件

## 1.0.18（2026-11-09）

### ✨ Features | 新功能

- 新增 usePageScroll 钩子，提供统一的页面滚动距离管理通道，支持页面本身滚动和 scroll-view 容器内滚动两种场景
- 新增获取导航栏高度的工具方法 getNavbarHeight，用于获取不同平台下的导航栏缺省高度

### ♻️ Code Refactoring | 代码重构

- **ux-navbar:** 统一处理 H5、App、小程序各端的缺省高度值，简化组件内的重复代码
- **backTop:** 统一使用 usePageScroll 管理滚动状态，简化多端适配逻辑

### 🐛 Bug Fixes | Bug 修复

- **ux-back-top:** 修复滚动距离计算逻辑的描述注释，明确外部 scroll-top 优先的规则，解决小程序端滚动跟踪的理解歧义

## 1.0.17（2026-11-06）

### 🐛 Bug Fixes | Bug 修复

- 修复非 APP 环境下图标提示文字显示异常的问题

### ♻️ Code Refactoring | 代码重构

- 删除无用验证页面及相关配置
- 删除已废弃的遮罩组件文件

## 1.0.16（2026-11-05）

### ♻️ Code Refactoring | 代码重构

- **ux-collapse-item:** 优化折叠项 hover 样式的类名生成方式，使用 bem 工具类
- **ux-column-notice:** 提取通告栏文字类型类名的计算属性，优化代码结构
- **ux-grid-item:** 优化部分硬编码样式，统一样式命名生成工具
- 优化脚本顺序校验的行内注释处理逻辑

### 🐛 Bug Fixes | Bug 修复

- **ux-image:** 修复微信小程序下图片长按菜单失效问题

## 1.0.15（2026-11-04）

### ✨ Features | 新功能

- **useLocale:** 重构 useLocale 国际化功能支持，优化页面结构，删除冗余按钮样式
- **useTheme:** 新增 useTheme 主题管理 hook，包含快速查看主题状态、主题切换、暗黑模式设置、CSS 变量查看、恢复默认等

## 1.0.14（2026-11-04）

### ✨ Features | 新功能

- 新增 useRect 钩子函数，用于获取元素布局信息，演示元素尺寸测量、重新测量功能

## 1.0.13（2026-11-03）

### ✨ Features | 新功能

- 新增 useCountDown 倒计时钩子工具，包含基础倒计时、控制操作、结束回调等，并新增演示示例。

## 1.0.12（2026-11-03）

### ✨ Features | 新功能

- 新增 useDeviceInfo 钩子使用示例，包含设备身份、系统平台、屏幕方向等场景示例，方便快速接入使用。
- 新增 useWindowInfo 组件示例，用于快速获取 windowWidth、windowHeight、screenWidth、screenHeight、pixelRatio
- 新增 useSafeArea 示例，主要用于快速获取屏幕顶部、底部安全区域距离

## 1.0.11（2026-11-02）

### ✨ Features | 新功能

- 新增 useDebounce 示例代码片段并重构演示页面，支持默认延迟、自定义延迟、临时指定延迟多个配置
- 新增 useThrottle Hook 演示代码及页面，包含默认间隔、自定义间隔、临时指定间隔三种使用场景

## 1.0.10（2026-11-01）

### ✨ Features | 新功能

- **image:** 优化ux-image图片演示效果
- **swiper:** 更新轮播图示例图片资源地址

## 1.0.9（2026-10-30）

### ✨ Features | 新功能

- **ux-icon:** 重构图标库前缀机制，支持自定义图标库与内置库统一逻辑，调整多个组件的图标前缀默认值
- **custom-icon:** 新增自定义图标功能的演示页面，包括接入说明、三种取字方式、样式能力、与内置图标共存的示例

## 1.0.8（2026-10-30）

### 💄 Styles | 风格

- 移除多个文件中重复的主题样式导入

### ✨ Features | 新功能

- 替换部分本地为线上地址并新增图片图标示例
- 新增格式化、数值、字符串等工具演示页面，format、number、string、toStyle、color、test
- 完善 trim、throttle、debounce、addUnit、deepClone、deepMerge 工具函数的演示页面

## 1.0.7（2026-10-29）

### ✨ Features | 新功能

- 新增自定义字体图标库演示示例
- **icon:** 新增自定义字体图标支持能力，新增 registerIconFont 方法用于注册自定义图标字体库

## 1.0.6（2026-10-29）

### ✨ Features | 新功能

- **ux-alert-tips:** 新增图标大小可配置属性 iconSize
- **ux-cell-item:** 优化单元格布局与插槽图标适配

### 🐛 Bug Fixes | Bug 修复

- **ux-tag:** 修复标签在高行高容器中高度虚高的问题

## 1.0.5（2026-10-29）

### ♻️ Code Refactoring | 代码重构

- **components:** 重构 ux-keyboard 组件并移除 HarmonyOS 平台按钮边框样式

### 🐛 Bug Fixes | Bug 修复

- **ux-tabbar:** 修复路由读取导致的高亮错判问题

## 1.0.4（2026-10-28）

### ♻️ Code Refactoring | 代码重构

- **plugin:** 修改插件导出方式适配加密编译场景
- 调整uViewProX的导入方式

## 1.0.3（2026-10-28）

### ✨ Features | 新功能

- add page structure of the uni-app x project (587c524)
- add js scripts (d1b160e)

## 1.0.2 - 2026-10-27

### 文档

- 文档站新增[「AI 技能」指南](https://x.uviewpro.cn/zh/guide/skills.html)，中英文同步上线，说明技能安装、使用流程、目录结构与手动校验方式
- 技能包同步开源在 [uview-pro/skills](https://github.com/uview-pro/skills)，命令行安装失败时可直接下载使用

### 生态

- 发布配套 Agent Skills 技能包 `uview-pro-x`：AI 编程助手可据此按本库规范编写页面，写组件前查 API 卡片，写完运行 `verify-ux-usage.mjs` 校验 `ux-*` 用法

## 1.0.1 - 2026-10-26

- 优化 README.md，添加组件说明
- 添加官方文档链接
- 添加示例演示入口

## 1.0.0 - 2026-10-26

首个正式版本，作为后续迭代的功能基线。

### ✨ 组件

首批 76 个 `ux-*` 组件（含子组件）完成从 uView Pro 到 uni-app x 的迁移，按 7 个分类提供 61 个组件示例页：

- **基础（8 个示例页）**：`ux-icon`、`ux-image`、`ux-button`、`ux-cell-group` / `ux-cell-item`、`ux-badge`、`ux-tag`、`ux-text`、`ux-avatar`
- **表单（13 个示例页）**：`ux-form` / `ux-form-item`、`ux-input`、`ux-textarea`、`ux-select`、`ux-picker`、`ux-rate`、`ux-search`、`ux-number-box`、`ux-keyboard` / `ux-number-keyboard` / `ux-car-keyboard`、`ux-checkbox` / `ux-checkbox-group`、`ux-radio` / `ux-radio-group`、`ux-switch`、`ux-slider`
- **数据展示（5 个示例页）**：`ux-line-progress`、`ux-circle-progress`、`ux-count-to`、`ux-count-down`、`ux-swiper`
- **反馈（14 个示例页）**：`ux-action-sheet`、`ux-toast`、`ux-notice-bar`（含 `ux-row-notice`、`ux-column-notice`）、`ux-alert-tips`、`ux-top-tips`、`ux-collapse` / `ux-collapse-item`、`ux-popup`、`ux-swipe-action`、`ux-modal`、`ux-mask`、`ux-loading`、`ux-loadmore`、`ux-empty`、`ux-no-network`
- **布局（6 个示例页）**：`ux-line`、`ux-card`、`ux-grid` / `ux-grid-item`、`ux-divider`、`ux-row` / `ux-col`、`ux-section`
- **导航（8 个示例页）**：`ux-tabbar`、`ux-back-top`、`ux-navbar`、`ux-tabs`、`ux-subsection`、`ux-steps` / `ux-step`、`ux-link`、`ux-pagination`
- **其他（7 个示例页）**：`ux-gap`、`ux-safe-bottom`、`ux-status-bar`、`ux-transition`、`ux-skeleton`、`ux-full-screen`、`ux-config-provider`；另有 `ux-overlay`、`ux-sticky`、`ux-waterfall` 等基础能力组件

### 🧩 工具与 Hooks

- 9 个工具函数示例页：`addUnit`、`test`、`toStyle`、`color`、`trim`、`debounce`、`throttle`、`deepClone`、`deepMerge`
- 3 个组合式 Hooks：`useDebounce`、`useThrottle`、`useLocale`
- 全局 `$u` 工具集与 `useTheme` / `useLocale` 等能力开箱可用

### 🎨 样式与主题

- 组件样式基于 UCSS 重写，仅使用 flex 布局，适配 App / H5 / 微信小程序
- 组件专属类名统一由 `useBEM` 生成（`ux-` 前缀），样式隔离，避免与业务类名冲突
- 主题变量集中在 `theme.scss`（`$u-*`），支持多主题与暗黑模式

### 🌍 国际化

- 内置中文 / 英文语言包，通过 `ux-config-provider` 与 `useLocale` 全局切换

### 📚 文档

- 中英文双语文档站上线，包含组件说明、示例源码与 API 表
- 组件页内嵌 H5 在线预览，可直接在文档中交互体验

### 🚀 工程与发布

- 演示工程覆盖每个组件的独立示例页，可直接在真机或浏览器中运行验证
- H5 产物通过 CI 自动构建并发布到 EdgeOne Pages
- 提供组件 script 编排、示例页一致性等校验脚本，保障代码规范

### ⚠️ 已知限制

- App 端 UCSS 不支持 CSS 过渡与伪元素，部分视觉效果（如水波纹、细边框）在 App 端降级为静态样式
- 当前以 App / H5 / 微信小程序为主要验证目标，其他小程序平台尚未逐一验证
- 组件库为独立私有仓库，运行示例工程前需先装配组件库源码
