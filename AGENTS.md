# uView-Pro-x（演示工程 + 组件库维护）

> uView Pro 组件库的 uni-app x 版本（Vue3 + UTS 强类型）**演示工程**：本仓库只承载示例页与宿主工程，组件库源码在私有仓库，编译时装配进来。支持 App（Android/iOS/鸿蒙）、H5、微信小程序三端。
> 组件用 `ux-` 前缀；组件专属类名用 `useBEM` BEM（`ux-` 前缀），全局工具类（`u-line-1`、`u-iconfont` 等）保留 `u-` 前缀。

## 双仓库结构

| 仓库 | 可见性 | 内容 | 本地位置 |
|------|--------|------|----------|
| `anyup/hello-uview-pro-x` | 公开 | 本仓库：示例页（`pages/`）、demo 容器组件（`components/`）、`pages.json` / `manifest.json` / `App.uvue` 等宿主工程 | 仓库根 |
| `anyup/uview-pro-x` | 私有 | 组件库源码：`package.json` + `components/ux-*` + `libs/` + `locale/` + `types/` + `static/` + `theme.scss`/`index.scss`/`index.uts` | `uni_modules/uview-pro-x/` |

- **`uni_modules/uview-pro-x/` 是一个独立的 git 仓库**（私有库的工作副本），不被本仓库跟踪：改组件库源码后要**在私有库提交推送**，别 `git add` 到本仓库。
- **打包发布**：两个仓库各自带一份 `.github/workflows/deploy-h5-edgeone.yml`，互相拉取对方仓库→装配编译→发布到同一个 EdgeOne Pages 项目 `h5-uview-pro-x`。任一仓库 push `master` 都会重新发布（互为补充）。
  - 本仓库产物流程需要 secrets：`UVIEW_PRO_X_TOKEN`（读私有库，可换成只读 Deploy Key）、`DCLOUD_USERNAME` / `DCLOUD_PASSWORD`、`EDGEONE_API_TOKEN`。
- **无 `src/` 前缀**：源码路径直接是 `pages/...`、`uni_modules/...`，不要臆造 `src/` 前缀。

## 架构分层

| 层 | 包 | 用途 |
|-------|----------|---------|
| L0 | `types/` | 类型定义 —— 无内部导入 |
| L1 | `libs/config/`, `libs/utils/` | 配置与工具 —— 仅依赖 L0（config/utils 存在循环依赖，同属 L1 基础层） |
| L2 | `libs/hooks/`, `libs/styles/`, `locale/` | Hooks 和样式（全局样式三分类：根 `theme.scss` 主题变量 + `libs/styles/global.scss` 共用 + `libs/styles/mixins/` 按功能拆分的 mixin 叶子文件如 `hairline.scss`，统一经 `index.scss` 导出，按需 import 不自动注入）—— 依赖 L0-L1 |
| L3 | `components/` | 组件库（ux-* 前缀）—— 依赖 L0-L2；**同级组件互不导入** |
| L4 | `pages/` | 示例页面 —— 依赖 L0-L3 |
| L5 | `App.uvue`, `main.uts`, `index.uts` | 入口点 —— 依赖 L0-L4 |

依赖方向不可逆；上表的 L0-L5 对应 `uni_modules/uview-pro-x/` 内部结构。

## 组件库约定（ux-*）

| 项 | 约定 |
|---|---|
| 目录 / 文件 | `components/ux-{name}/`，内含 `ux-{name}.uvue`（同级 `types.uts`） |
| 注册 | easycom 自动解析（[pages.json](pages.json)）：`"^ux-(.*)": "@/uni_modules/uview-pro-x/components/ux-$1/ux-$1.uvue"`；组件内嵌兄弟组件须**显式 import**，不走 easycom（同级组件目录互不导入，组件组合 import 属合法耦合） |
| defineOptions | `name: 'ux-{name}'`；`styleIsolation: 'isolated'` + `virtualHost: true`（`virtualHost` 需 `#ifndef MP-TOUTIAO` 包裹） |
| 取色 | SCSS：`@import '@/uni_modules/uview-pro-x/theme.scss'` 后用 `$u-*` 变量（`$u-` 令牌前缀是库的公共主题 API，不随组件改名）；脚本：`$u.color.*`（`libs/config/color.uts` 的 reactive）。**禁硬编码色值、禁用 CSS 变量** |
| 全局工具类自包含 | `isolated` 下组件不能引用全局 class：用到的全局工具类需在组件自身 `<style>` 内 `@import '../../libs/styles/global.scss'`；mixin 按需引叶子文件（如 `mixins/hairline.scss`），勿同时 import 统一入口（重复定义）；类型工具类在组件本地定义 |
| 写法权威 | `.agents/skills/component-writer/references/`（spec / recipes / samples）为唯一权威；改后跑 `scripts/verify-script-order.mjs` 门禁（段序 / 命名 / 模板 ref），须 0 不合规 |

## 示例页规范

- 页面用 `demo-page` 组件包裹（内部已处理 `scroll-view` 滚动）：根节点 `scroll-view` + `flex: 1`，**禁 `min-height` / `height: 100%`**。
- 分类分包：`basic` / `form` / `data` / `feedback` / `layout` / `navigation` / `others`，另有 `library`（工具）与 `hooks` 两个子包。
- 新增示例页四件事：建页 → `pages.json` 注册子包路由 → `pages/tabbar/config.uts` 追加菜单项 → 新增整个分类时同步 `scripts/verify-demo-examples.mjs` 的 `DEMO_GROUP_RE` 目录白名单（漏改会让新目录页面默默不入门禁）。
- 公共样式 `style/demo.scss`（`App.uvue` 中全局引入）。预定义类名：`.demo-page` / `.demo-header` / `.demo-title` / `.demo-card` / `.demo-card-title` / `.demo-item` / `.demo-desc` / `.demo-result` / `.demo-result-success|error|warning` / `.demo-btn`。
- 页面写法（消费侧规范）：`.agents/skills/uview-pro-x/references/`。

## 验证（默认不跑自动验证）

> **默认不做自动验证**（追求快速完成），按需手动。

| 改动范围 | 验证方式 |
|---|---|
| 简单修复（文案/样式/单点 bug） | 无需自动验证 |
| 组件修复 / 发布 / 大改 / 跨层 | 复用常驻 H5 dev server（localhost:9000），浏览器打开示例页确认无报错 |

- **复用常驻 dev server**：默认 `http://localhost:9000/#/`，不自行起停；改代码后热更新生效直接浏览器确认。
- **若 9000 未启动**（HBuilderX 未运行）：用 HBuilderX CLI 后台拉起，无需查找安装位置：
  ```powershell
  & "D:\Program Files\HBuilderX\cli.exe" launch web --project "<本仓库绝对路径>"
  ```
  约 5 秒编译完成（输出 `Local: http://localhost:9000/`）；本仓库 `package.json` 仅承载发布与 changelog 脚本（无 `dev` 脚本），开发服务器仍由 HBuilderX 启动。
- **一键验证**：项目根执行 `node scripts/verify-h5.mjs <route> --timeout 120000 [--json]`（route 形如 `feedback/mask`，脚本自动补 `pages/` 与 `/index`；只收集 console/page 错误，不截图）。**勿写临时 playwright 脚本**。
- **门禁脚本**：`scripts/verify-script-order.mjs`（组件 script 编排）、`scripts/verify-demo-examples.mjs --demo <dir>`（示例页 index.uvue ↔ code.uts 一一对应、prop 完整性）。
- **验证职责划分**：AI 只验证 H5（复用常驻 dev server）；**App 端编译验证（UTS 语法最终校验）由用户在 HBuilderX 执行**，AI 不跑 App 构建。
- **编译报错先查** `.agents/skills/migrate-component/references/error-patterns/README.md` 命中表，命中即按表修，不盲试。
- **一次性探针脚本用完即清**：只跑一次的临时脚本（`_probe_*.mjs`、临时导出改本）用完立即删除，不留工作区。

## 发布与更新日志

| 命令 | 说明 |
|---|---|
| `npm run release:patch` / `release:minor` / `release:major` | 升版本 → 生成 changelog → 提交 → 打 `vX.Y.Z` 标签（默认不推送） |
| `npm run release:beta` / `release:alpha` / `release:rc` | 预览版本（`x.y.z-beta.0` 递增） |
| `npm run release:push` | 推送上次未推送的发布（提交 + 标签） |
| `npm run release:undo` | 撤销未推送的本地发布（删标签、回退提交） |
| `npm run changelog*` | 单独生成 `CHANGELOG.md`（`current` / `last` / `all`，带或不带 emoji） |

- 版本号写入本仓库 `package.json`，并同步 `uni_modules/uview-pro-x/package.json`；**每次生成 changelog 都会同时写根 `CHANGELOG.md` 与 `uni_modules/uview-pro-x/changelog.md`，两份内容完全一致**。该目录是独立仓库，**需在私有库内自行提交**。
- 发布提交只包含 `package.json` 与 `CHANGELOG.md`，不会带上工作区其他改动（嵌套仓库、历史未提交改动均不进提交）。
- 提交信息遵循 Conventional Commits（`feat` / `fix` / `perf` / `refactor` 等），changelog 按类型分组并链接到 `anyup/hello-uview-pro-x` 对应 commit。

## 技能与文档

| 技能 / 文档 | 用途 |
|---|---|
| `.agents/skills/component-writer/` | **ux-* 组件编写**（新增 / 整改 / 优化）唯一权威：`references/spec` + `recipes` + `samples`（样板 ux-button / ux-navbar）；`scripts/verify-script-order.mjs` 校验 |
| `.agents/skills/migrate-component/` | 存量组件从 uView Pro 版本搬过来时的流程与配方（已很少用，按需）：`references/` 含 `error-patterns` 命中表、`recipes` 配方索引 |
| `.agents/skills/uview-pro-x/`（技能名 `uview-pro-x`） | 消费侧：在外部 uni-app x 项目用 uview-pro-x 写页面的自包含规范（随技能发货 API 卡片，本仓库示例页同样遵循） |
| `.agents/skills/uview-pro/`（技能名 `uview-pro`） | 消费侧：普通 uni-app（非 x，`u-*` + TS）项目用 uview-pro 写页面的同类规范，服务兄弟项目 |
| `.agents/skills/uniappx-crash-triage/` | App 端（安卓真机）原生崩溃排查流程：日志取证 → dump 指纹比对 → 隔离实验 |
| `.agents/plan.md` | 一期计划唯一权威：覆盖度（源库→x 库迁移进度）、演示入口批次、阶段与执行机制 |
| `README.md` / `README.en.md` | 对外介绍（安装 / 使用 / 快速开始） |
| **本文件** | **唯一项目规范**：仓库结构、分层、组件/示例页约定、验证、技能索引都在这里 |
| `CLAUDE.md` | 指针文件，不承载正文 |

- **权威源约定**：`.agents/skills/` 是唯一权威源；工作区根 `.qoder/skills/`、`.trae/skills/` 只是注册薄壳，改动一律写 `.agents/skills/`。
- **新增参考的惯例**：在对应 skill 的 `references/` 下自增长、一个主题一个文件；同一主题只在单一权威处维护，不新建 Skill、不向薄壳写正文。

## 规则

- **参考库字眼隔离**：`uni_modules/uview-pro-x` 的代码与注释**不出现参考库名称**（含其组件名前缀、CSS 变量名，也不用改写的占位词），注释写成自洽的规则描述；`.agents/` 技能文档可且应保留真实名称。
- 命名规范仅约束 `uni_modules/uview-pro-x/components` 下的**库组件**；`components/demo-*` 等演示容器组件不适用。
- 平台约束（UCSS 选择器/单位/动画等）与 UTS 语法细则**不在此重复**，见对应 skill 的 `references/`。
