# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.3（2026-10-28）

### ✨ Features | 新功能

- add page structure of the uni-app x project (587c524)
- add js scripts (d1b160e)

### 👥 Contributors

<a href="https://github.com/anyup"><img src="https://github.com/anyup.png?size=40" width="40" height="40" alt="anyup" title="anyup"/></a> 

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
