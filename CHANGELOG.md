# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
