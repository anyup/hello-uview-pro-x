#!/usr/bin/env node
// 校验 uView-Pro-x 示例页（pages/<语义分类>/<演示>/index.uvue + code.uts 代码归档）符合示例编写规范。
// 权威：.agents/skills/component-writer/references/spec/08-demo-example.md（index.uvue ↔ code.uts 一一对应 / custom-class 约定 / prop 完整性）。
// 三层结构与 verify-script-order.mjs 一致：check（读）→ fix（写，仅 FIXERS 注册）→ baseline/registry（豁免/省略注册表）。
// 用法：
//   node scripts/verify-demo-examples.mjs                             # 扫描全部示例页
//   node scripts/verify-demo-examples.mjs --demo <dir>...             # 指定示例目录（按目录名匹配）
//   node scripts/verify-demo-examples.mjs --fix                       # 自动修复机械项（custom-class 绑定），再校验
//   node scripts/verify-demo-examples.mjs --fix --ask                 # 机械自动修 + 对非确定性项（prop 未演示）弹窗询问并写省略注册表
//   node scripts/verify-demo-examples.mjs --baseline <json>           # 指定存量豁免基线（默认 scripts/demo-baseline.json）
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = join(fileURLToPath(import.meta.url), '..');
const root = join(__dirname, '..');
const componentsBase = join(root, 'uni_modules/uview-pro-x/components');
const pagesBase = join(root, 'pages');
const registryPath = join(__dirname, 'demo-omissions.json');

/* ------------------------- 通用小工具 ------------------------- */

function read(p) {
    try { return readFileSync(p, 'utf8'); } catch { return ''; }
}

// 顶层 <template> 完整块（配对扫描，避开嵌套 <template v-if> 截断）
function extractTemplate(source) {
    const sm = source.match(/<template(\s[^>]*)?>/);
    if (!sm) return null;
    const open = sm[0];
    const contentStart = sm.index + open.length;
    const tagRe = /<\/?template\b[^>]*>/g;
    tagRe.lastIndex = contentStart;
    let depth = 1;
    let t;
    while ((t = tagRe.exec(source))) {
        if (t[0][1] === '/') depth--;
        else depth++;
        if (depth === 0)
            return { body: source.slice(contentStart, t.index) };
    }
    return null;
}

function kebabToCamel(s) {
    return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// 从模板/代码文本里采集所有 ux-* 开标签（含属性段）。返回 [{ tag, attrs, start, end }]
const UX_TAG_RE = /<(ux-[a-z0-9-]+)\b([^>]*?)\/?>/g;
function collectUx(templateText) {
    const out = [];
    let m;
    UX_TAG_RE.lastIndex = 0;
    while ((m = UX_TAG_RE.exec(templateText))) {
        out.push({ tag: m[1], attrs: m[2], start: m.index, end: m.index + m[0].length });
    }
    return out;
}

// 从属性段提取属性键（含 : 前缀、裸布尔；跨行安全，按 token 切分避免 `custom-class` 的子串误伤）
function attrKeysOf(attrs) {
    const keys = [];
    const kRe = /(?:^|\s)([:\w-]+?)(?=\s*=\s*["'{]|\s|\/?>|$)/g;
    let m;
    while ((m = kRe.exec(attrs))) keys.push(m[1]);
    return keys;
}

// 从属性段提取"已使用的 prop 名（camelCase 集合）"：含 `key=` 与 `:key=` 动态绑定与裸布尔；排除事件/样式类
function usedPropsFromAttrs(attrs) {
    const used = new Set();
    for (const raw of attrKeysOf(attrs)) {
        const name = raw.startsWith(':') ? raw.slice(1) : raw;
        if (name.startsWith('@') || name === 'class' || name === 'style') continue;
        // v-model 双向绑定等价于 modelValue prop
        used.add(name === 'v-model' ? 'modelValue' : kebabToCamel(name));
    }
    return used;
}

// 括号平衡增量（正=开，负=闭，忽略字符串内）
function braceDelta(line) {
    let n = 0, sq = false, dq = false, bt = false, esc = false;
    for (const ch of line) {
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (sq) { if (ch === "'") sq = false; continue; }
        if (dq) { if (ch === '"') dq = false; continue; }
        if (bt) { if (ch === '`') bt = false; continue; }
        if (ch === "'") { sq = true; continue; }
        if (ch === '"') { dq = true; continue; }
        if (ch === '`') { bt = true; continue; }
        if (ch === '{' || ch === '(' || ch === '[') n++;
        else if (ch === '}' || ch === ')' || ch === ']') n--;
    }
    return n;
}

/* ------------------------- Check A：custom-class 绑定 ------------------------- */

// 构建"组件是否声明 customClass"能力表（component -> true/false）
function buildCustomClassCapability() {
    const cap = new Map();
    for (const d of readdirSync(componentsBase)) {
        if (!/^ux-[\w-]+$/.test(d)) continue;
        const f = join(componentsBase, d, `${d}.uvue`);
        if (!existsSync(f)) continue;
        cap.set(d.slice(3), /customClass|custom-class/.test(read(f)));
    }
    return cap;
}

// 检测：demo 模板/code.uts 片段里，绑定在"支持 custom-class 的 ux- 组件"上的 class/:class 应改为 custom-class/:custom-class
function checkCustomClass(src) {
    const issues = [];
    const tmpl = extractTemplate(src) || { body: src };
    for (const el of collectUx(tmpl.body)) {
        const comp = el.tag.slice(3);
        const cap = customClassCap.get(comp);
        if (cap === undefined) continue; // 非迁移组件，跳过
        for (const k of attrKeysOf(el.attrs)) {
            if (k !== 'class' && k !== ':class') continue;
            if (cap) issues.push(`组件 ${el.tag} 的样式绑定应为 custom-class 而非 ${k}（组件已注册 external-class 自定义根节点）`);
            else issues.push(`组件 ${el.tag} 使用了 ${k} 绑定，但该组件未声明 customClass（改 custom-class 无效，需核对组件能力）`);
        }
    }
    return issues;
}

// 修复：把"支持 custom-class 的 ux- 组件"上的 class=/:class= 改名为 custom-class=/:custom-class=
function fixCustomClassSafe(src) {
    const tmpl = extractTemplate(src);
    if (!tmpl) return src;
    const body = tmpl.body;
    const els = collectUx(body);
    if (!els.length) return src;
    let replaced = body;
    for (const el of els) {
        const comp = el.tag.slice(3);
        if (customClassCap.get(comp) !== true) continue; // 无能力不猜改
        const pat = /(^|[\s])(:?)(class)(?=\s*=\s*["'{])/g;
        const seg = replaced.slice(el.start, el.end);
        const fixedSeg = seg.replace(pat, '$1$2custom-class');
        if (fixedSeg !== seg) {
            replaced = replaced.slice(0, el.start) + fixedSeg + replaced.slice(el.end);
        }
    }
    if (replaced === body) return src;
    const open = src.match(/<template(\s[^>]*)?>/)[0];
    const idx = src.indexOf(open);
    const contentStart = idx + open.length;
    const tagRe = /<\/?template\b[^>]*>/g;
    tagRe.lastIndex = contentStart;
    let depth = 1, t, end;
    while ((t = tagRe.exec(src))) { if (t[0][1] === '/') depth--; else depth++; if (!depth) { end = t.index + t[0].length; break; } }
    return src.slice(0, contentStart) + replaced + src.slice(end || contentStart);
}

/* ------------------------- Check B：code 归档一致 ------------------------- */

function parseCodesKeys(codeUts) {
    const m = codeUts.match(/export\s+const\s+codes\s*=\s*\{([\s\S]*?)\n\s*\};/);
    if (!m) return new Set();
    // 去模板字面量值，避免值内逗号干扰；再取每项开头标识符（兼容简写 basic 与 key: `...` 两种）
    const body = m[1].replace(/`[^`]*`/g, '`');
    return new Set(body.split(',').map((s) => s.trim().match(/^[\w$]+/)?.[0]).filter(Boolean));
}

function checkCodeArchive(indexSrc, codeSrc, hasCodeUts) {
    const issues = [];
    // 引用 key
    const refs = new Set();
    const codeRe = /:code="codes\.([\w$]+)"/g;
    let m;
    while ((m = codeRe.exec(indexSrc))) refs.add(m[1]);
    const usedDemoBlock = refs.size > 0;
    if (usedDemoBlock && !hasCodeUts) {
        issues.push(`示例使用了 <demo-block :code="..."> 但缺少 code.uts 归档`);
        return issues;
    }
    if (!hasCodeUts) return issues;
    const exported = parseCodesKeys(codeSrc);
    for (const r of refs) {
        if (!exported.has(r)) issues.push(`代码归档缺失：:code="codes.${r}" 在 code.uts 的 codes 导出中未定义`);
    }
    // 孤儿导出（文档专用片段允许，仅提示）
    for (const e of exported) {
        if (!refs.has(e)) issues.push(`孤儿片段：code.uts 导出了 codes.${e} 但 index.uvue 未通过 :code 引用（如为文档专用片段可忽略）`);
    }
    return issues;
}

/* ------------------------- Check C：prop 完整性 ------------------------- */

// 全局通用 prop：所有组件统一声明、通过 external-class 属性（custom-class/自定义样式）使用，不要求每次演示显式传入
const UNIVERSAL_PROPS = new Set(['customClass', 'customStyle']);

// 提取组件声明的 props（camelCase 集合）。componentUvuePath 为组件 .uvue 绝对路径（须为路径，函数内部读文件定位 types.uts）。
function getDeclaredProps(componentUvuePath) {
    const file = read(componentUvuePath);
    const script = file.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1] || '';
    const inline = script.match(/defineProps\s*<\{([\s\S]*?)\n\s*\}>/);
    if (inline) return extractPropsFromTypeBlock(inline[1]);
    const named = script.match(/defineProps\s*<([\w$]+)>/);
    if (named) {
        const name = named[1];
        // 先在本文件找类型定义
        let def = findTypeBlock(file, name);
        if (def !== null) return def;
        // 再到同目录 types.uts 找
        const dir = join(componentUvuePath, '..');
        for (const cand of [join(dir, 'types.uts'), join(dir, `${basename(componentUvuePath, '.uvue')}.types.uts`)]) {
            if (!existsSync(cand)) continue;
            const r = findTypeBlock(read(cand), name);
            if (r !== null) return r;
        }
        return null;
    }
    return null;
}

function findTypeBlock(source, name) {
    // 正则与括号扫描必须作用在同一个"剥离注释"文本上，否则 index 错位导致块切片出错
    const stripped = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    const defRe = new RegExp(`\\b(type|interface)\\s+${name}\\s*(?:=\\s*)?\\{`);
    const m = defRe.exec(stripped);
    if (!m) return null;
    const start = m.index + m[0].length;
    let depth = 1, i = start;
    while (i < stripped.length) {
        if (stripped[i] === '{') depth++;
        else if (stripped[i] === '}') { depth--; if (!depth) break; }
        i++;
    }
    return extractPropsFromTypeBlock(stripped.slice(start, i));
}

function extractPropsFromTypeBlock(block) {
    // 取首条属性的缩进，仅收集同缩进的 prop 键，避开嵌套对象/函数类型
    const lines = block.split('\n').map((l) => l.replace(/\r/g, ''));
    let indent = null;
    const first = lines.findIndex((l) => /^\s*[\w$]+[?]?\s*:/.test(l.trim()));
    if (first === -1) return null;
    indent = (lines[first].match(/^(\s*)/) || ['', ''])[1].length;
    const props = new Set();
    for (const l of lines) {
        const im = l.match(/^(\s*)([\w$]+)[?]?\s*:/);
        if (!im) continue;
        if (im[1].length !== indent) continue; // 嵌套不走
        props.add(im[2]);
    }
    return props;
}

// 示例页主体组件：目录名 kebab-case 映射为 ux- 组件名（cell/layout 各含两个组件）
function subjectComponents(demoName) {
    const kebab = demoName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    if (kebab === 'cell') return ['ux-cell-group', 'ux-cell-item'];
    if (kebab === 'layout') return ['ux-row', 'ux-col'];
    return ['ux-' + kebab];
}

// 检测：演示（index.uvue 模板 + code.uts 片段）未演示的声明 props → 差值。
// 仅检查本示例页主体组件（demoName 映射）；页面引用的其它组件（如 subsection/button 作交互控件）豁免。
function checkPropsCompleteness(indexSrc, codeUts, registry, demoName) {
    const issues = [];
    const subjectTags = new Set(subjectComponents(demoName));
    const srcAll = (extractTemplate(indexSrc)?.body || '') + '\n' + codeUts;
    const byComp = new Map();
    for (const el of collectUx(srcAll)) {
        if (!byComp.has(el.tag)) byComp.set(el.tag, new Set());
        for (const p of usedPropsFromAttrs(el.attrs)) byComp.get(el.tag).add(p);
    }
    for (const [tag, used] of byComp) {
        if (!subjectTags.has(tag)) continue; // 引用组件豁免，非本页主体
        const comp = tag.slice(3);
        const f = join(componentsBase, tag, `${tag}.uvue`);
        if (!existsSync(f)) { issues.push(`${tag}：未找到组件源码，跳过 prop 完整性`); continue; }
        const declared = getDeclaredProps(f);
        if (!declared) { issues.push(`${tag}：无法解析声明 props（可能用命名类型但未找到定义），需人工核对`); continue; }
        const omitted = registry[comp] || {};
        for (const prop of declared) {
            if (UNIVERSAL_PROPS.has(prop)) continue; // 通用 prop 自动豁免
            if (used.has(prop) || omitted[prop]) continue;
            issues.push(`${tag} prop「${prop}」未在演示中使用（声明之一）`);
        }
    }
    return issues;
}

/* ------------------------- Check D：UniEvent detail 访问 ------------------------- */

/**
 * 提取顶层 function 声明的 { name, params, body }。嵌套函数跳过（外层匹配后 lastIndex 移至体末）。
 * 用于把 detail 检查限定到"参数类型为 UniEvent 的函数体"内，避免按名字粗匹配误伤
 * 同名的 UniInputEvent/UniChangeEvent 等具名事件参数（其 .detail 合法，ux-input 教训）。
 */
function extractTopFunctions(script) {
    const fns = [];
    const fnRe = /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g;
    let m;
    while ((m = fnRe.exec(script))) {
        let j = fnRe.lastIndex; // 指向 '(' 之后的首个参数
        let depth = 1; // 已进入外层括号：首个 ')' 使 depth 归 0 即参数区结束
        let paramEnd = -1;
        while (j < script.length) {
            const ch = script[j];
            if (ch === '(') depth++;
            else if (ch === ')') { depth--; if (depth === 0) { paramEnd = j; j++; break; } }
            j++;
        }
        if (paramEnd === -1) continue;
        const params = script.slice(fnRe.lastIndex, paramEnd);
        let k = j;
        while (k < script.length && /\s/.test(script[k])) k++;
        if (script[k] !== '{') continue; // 无函数体（抽象/签名）
        let brace = 0;
        let bodyEnd = -1;
        for (let b = k; b < script.length; b++) {
            const ch = script[b];
            if (ch === '{') brace++;
            else if (ch === '}') { brace--; if (brace === 0) { bodyEnd = b; break; } }
        }
        if (bodyEnd === -1) continue;
        fns.push({ name: m[1], params, body: script.slice(k + 1, bodyEnd) });
        fnRe.lastIndex = bodyEnd + 1; // 跳过嵌套函数，避免内层重复匹配/漏界
    }
    return fns;
}

/**
 * UniEvent detail 访问校验（text 教训）：
 * UniEvent 类型无 detail 属性，web/小程序 uts 插件会报 Property 'detail' does not exist。
 * 具名事件类型（UniInputEvent/UniChangeEvent/UniSwiperChangeEvent 等）的 detail 合法，不查。
 * 只查「函数参数声明为 : UniEvent（含 e?: UniEvent）」的函数体内裸 `param.detail` 访问，
 * 须改 `(param as unknown as UTSJSONObject)['detail']` 断言（先转 unknown 消除类型转换警告）。
 */
function checkDetailAccess(source) {
    const script = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1];
    if (!script) return [];
    const issues = [];
    for (const fn of extractTopFunctions(script)) {
        const params = new Set();
        const paramRe = /([A-Za-z_$][\w$]*)\s*\??\s*:\s*UniEvent\b/g;
        let m;
        while ((m = paramRe.exec(fn.params))) params.add(m[1]);
        if (!params.size) continue;
        for (let i = 0; i < fn.body.split('\n').length; i++) {
            const stripped = fn.body.split('\n')[i].replace(/\/\/.*$/, '');
            for (const p of params) {
                if (new RegExp(`\\b${p}\\??\\.detail\\b`).test(stripped)) {
                    issues.push(`函数 ${fn.name} 内裸 '${p}.detail' 访问：UniEvent 类型无 detail 属性（text 教训），须用 (${p} as unknown as UTSJSONObject)['detail'] 断言访问`);
                }
            }
        }
    }
    return issues;
}

/* ------------------------- 交互询问 + 省略注册表 ------------------------- */

function loadRegistry() {
    try { return JSON.parse(read(registryPath)); } catch { return {}; }
}

function saveRegistry(r) {
    writeFileSync(registryPath, JSON.stringify(r, null, 2) + '\n', 'utf8');
}

async function askProp(comp, prop) {
    if (!process.stdin.isTTY) return '';
    return new Promise((resolve) => {
        const rl = createInterface({ input: process.stdin, output: process.stdout });
        rl.question(
            `\n[示例/交互] ${comp} 的 prop「${prop}」未在演示中使用。如何处理？\n` +
            `  1) 有意省略   记录到省略注册表，不再提示\n` +
            `  2) 合并进组合  后续在组合示例中补演示（本次不记录）\n` +
            `  0) 暂不裁定   保留报告项，不打 TODO\n` +
            `  输入 [0/1/2] 默认 0：`,
            (ans) => {
                rl.close();
                const v = (ans || '0').trim();
                if (v === '1') resolve('omit');
                else if (v === '2') resolve('combo');
                else resolve('');
            }
        );
    });
}

async function askResolveProps(fixedSrc, codeUts, registry) {
    const reg = structuredClone?.(registry) || JSON.parse(JSON.stringify(registry));
    const srcAll = (extractTemplate(fixedSrc)?.body || '') + '\n' + codeUts;
    const byComp = new Map();
    for (const el of collectUx(srcAll)) {
        if (!byComp.has(el.tag)) byComp.set(el.tag, new Set());
        for (const p of usedPropsFromAttrs(el.attrs)) byComp.get(el.tag).add(p);
    }
    for (const [tag, used] of byComp) {
        const comp = tag.slice(3);
        const f = join(componentsBase, tag, `${tag}.uvue`);
        if (!existsSync(f)) continue;
        const declared = getDeclaredProps(f);
        if (!declared) continue;
        const omitted = reg[comp] || {};
        const plan = [];
        for (const prop of declared) if (!used.has(prop) && !omitted[prop] && !UNIVERSAL_PROPS.has(prop)) plan.push(prop);
        if (!plan.length) continue;
        process.stdout.write(`\n── ${tag} 未演示声明 prop：${plan.join(', ')}`);
        for (const prop of plan) {
            const ans = await askProp(comp, prop);
            if (ans === 'omit') omitted[prop] = '示例手工判定省略';
        }
        if (Object.keys(omitted).length) reg[comp] = omitted;
    }
    return { registry: reg };
}

/* ------------------------- main ------------------------- */

const customClassCap = buildCustomClassCapability();

/**
 * 组件演示分包目录白名单（与 pages.json 的 subPackages 及 pages/tabbar/config.uts 的分类一一对应）。
 * 旧无语义分包 componentsA|B|C 已废弃；新增分类必须同步更新此表，否则新页会默默不入门禁。
 */
const DEMO_GROUP_RE = /^(basic|form|data|feedback|layout|navigation|others)$/;

function collectDemoDirs(specs) {
    const dirs = [];
    if (specs.length) {
        for (const p of readdirSync(pagesBase)) {
            if (!DEMO_GROUP_RE.test(p)) continue;
            const base = join(pagesBase, p);
            for (const d of readdirSync(base)) {
                if (specs.includes(d) && existsSync(join(base, d, 'index.uvue'))) dirs.push(join(base, d));
            }
        }
    } else {
        for (const p of readdirSync(pagesBase)) {
            if (!DEMO_GROUP_RE.test(p)) continue;
            const base = join(pagesBase, p);
            for (const d of readdirSync(base)) {
                const dir = join(base, d);
                if (existsSync(join(dir, 'index.uvue'))) dirs.push(dir);
            }
        }
    }
    return dirs.sort();
}

async function main() {
    const args = process.argv.slice(2);
    let demoSpecs = [];
    let scanAll = args.length === 0;
    let baselinePath = join(__dirname, 'demo-baseline.json');
    let fix = false, ask = false;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--demo') demoSpecs.push(args[++i]);
        else if (args[i] === '--baseline') baselinePath = args[++i];
        else if (args[i] === '--fix') fix = true;
        else if (args[i] === '--ask') ask = true;
    }
    if (!scanAll && !demoSpecs.length) { console.log('[verify-demo-examples] 无目标示例'); process.exitCode = 0; return; }
    const baseline = loadJsonSafe(baselinePath);
    let registry = loadRegistry();
    const dirs = collectDemoDirs(demoSpecs);

    let totalFail = 0, totalFixed = 0;
    for (const dir of dirs) {
        const name = basename(dir);
        let indexSrc = read(join(dir, 'index.uvue'));
        let codeUts = read(join(dir, 'code.uts'));
        const hasCodeUts = existsSync(join(dir, 'code.uts'));

        if (fix) {
            const fixed = fixCustomClassSafe(indexSrc);
            if (fixed !== indexSrc) {
                writeFileSync(join(dir, 'index.uvue'), fixed, 'utf8');
                indexSrc = fixed; totalFixed++;
            }
            const fixedCode = fixCustomClassSafe(codeUts);
            if (fixedCode !== codeUts && hasCodeUts) {
                writeFileSync(join(dir, 'code.uts'), fixedCode, 'utf8');
                codeUts = fixedCode; totalFixed++;
            }
        }
        if (ask) {
            const r = await askResolveProps(indexSrc, hasCodeUts ? codeUts : '', registry);
            if (r.registry !== registry) { registry = r.registry; saveRegistry(registry); }
        }

        const exempt = (baseline[name] || []).slice();
        const checks = [
            { label: 'custom-class', issues: checkCustomClass(indexSrc).concat(hasCodeUts ? checkCustomClass(codeUts) : []) },
            { label: 'code-archive', issues: checkCodeArchive(indexSrc, codeUts, hasCodeUts) },
            { label: 'props',        issues: checkPropsCompleteness(indexSrc, hasCodeUts ? codeUts : '', registry, name) },
            { label: 'detail',       issues: checkDetailAccess(indexSrc).concat(hasCodeUts ? checkDetailAccess(codeUts) : []) }
        ];
        let failed = false;
        const printed = [];
        for (const c of checks) for (const i of c.issues) {
            const xi = exempt.indexOf(i);
            // 孤儿片段仅提示（文档专用片段合法），不判为不合规
            const isOrphan = c.label === 'code-archive' && i.startsWith('孤儿片段');
            if (xi !== -1) { exempt.splice(xi, 1); printed.push(`  ≡ 基线豁免（${c.label}）${i}`); }
            else if (isOrphan) { printed.push(`  ℹ ${i}`); }
            else { failed = true; printed.push(`  ✗ ${i}`); }
        }
        for (const left of exempt) printed.push(`  ? 基线含未再出现的违规条目（可移出基线）：${left}`);
        if (printed.length) {
            console.log(`\n${name}/`);
            for (const p of printed) console.log(p);
            if (failed) totalFail++;
        }
    }
    const fixNote = fix ? `，${totalFixed} 个文件已自动修复(--fix)` : '';
    const regCount = Object.keys(registry).length;
    console.log(`\n[verify-demo-examples] 扫描 ${dirs.length} 个示例页，${totalFail} 个不合规（省略注册表含 ${regCount} 个组件条目）${fixNote}`);
    process.exitCode = totalFail ? 1 : 0;
}

function loadJsonSafe(p) {
    if (!existsSync(p)) return {};
    try { return JSON.parse(read(p)); } catch { return {}; }
}

main();
