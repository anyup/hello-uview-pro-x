#!/usr/bin/env node
// 校验 ux-* 组件主 .uvue 的 <script setup> 是否符合 component-writer 规范的 10 段编排（权威：.agents/skills/component-writer/references/spec/）。
// 用法：
//   node scripts/verify-script-order.mjs                    # 扫描全部组件主 .uvue
//   node scripts/verify-script-order.mjs <file>...           # 指定文件
//   node scripts/verify-script-order.mjs --uni <module>...   # 指定 uni_modules 下的组件目录名
//   node scripts/verify-script-order.mjs --fix <file>...     # 自动修复机械可逆违规（props 前缀/px-addUnit/docstring/bem-bare/脚本段序/ref-decl/slots-use/style-camel/hover-imp/attr-order/值数组拆行），再校验
//   node scripts/verify-script-order.mjs --fix --ask <file> # 先自动修复机械项，再对非确定性项（模板 ref 缺失）弹窗询问裁定；
//                                                            非 TTY/CI 自动降级为纯 report，绝不静默补值
import { readFileSync, writeFileSync, readdirSync, accessSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = join(fileURLToPath(import.meta.url), '..');
const componentsBase = join(__dirname, '../uni_modules/uview-pro-x/components');

/**
 * 提取最外层主模板完整块。SFC 主 <template> 内部常含 <template v-if>/<template v-else>/
 * <template #slot> 等嵌套标签，若用 `[\s\S]*?</template>` 惰性匹配会在第一个嵌套 </template>
 * 处截断，导致其后内容（如 v-else 分支、cancel 区）被 check/fix 整体漏检。
 * 本函数按 <template>/</template> 标签配对深度扫描，返回最外层模板块的 { open, body, close, index, endIndex }。
 */
function extractTemplate(source) {
    const sm = source.match(/<template(\s[^>]*)?>/);
    if (!sm) return null;
    const open = sm[0];
    const openIdx = sm.index;
    const contentStart = openIdx + open.length;
    const tagRe = /<\/?template\b[^>]*>/g;
    tagRe.lastIndex = contentStart;
    let depth = 1;
    let t;
    while ((t = tagRe.exec(source))) {
        if (t[0][1] === '/') depth--;
        else depth++;
        if (depth === 0) {
            const close = t[0];
            return { open, body: source.slice(contentStart, t.index), close, index: openIdx, endIndex: t.index + close.length };
        }
    }
    return null; // 未闭合：让上层安全回退空
}

/* ------------------------------------------------------------------ *
 * 模板属性顺序规范化（attrib-order）
 * 规则：属性按 4 组排序 —— 组1 v-指令/插槽(#) → 组2 静态(无前缀) → 组3 动态(:) → 组4 事件(@)，
 *       组内按属性名（去前缀）码点字典序；属性数 ≥2 强制每属性一行，1 个属性强制单行。
 * 权威：.agents/skills/component-writer/references/spec/ 的模板属性规范章节。
 * ------------------------------------------------------------------ */

/** 引号感知地找标签闭合 >（属性值内的 > 不闭合标签，如 v-if="a > b"） */
function findTagEnd(body, from) {
    let quote = null;
    for (let k = from; k < body.length; k++) {
        const ch = body[k];
        if (quote) {
            if (ch === quote) quote = null;
            continue;
        }
        if (ch === '"' || ch === "'") {
            quote = ch;
            continue;
        }
        if (ch === '>') return k;
    }
    return -1;
}

/** 扫描模板 body 中所有开标签（跳过注释与闭合标签），返回 { start, end, raw } */
function scanTags(body) {
    const tags = [];
    let i = 0;
    while (i < body.length) {
        const lt = body.indexOf('<', i);
        if (lt === -1) break;
        if (body.startsWith('<!--', lt)) {
            const ce = body.indexOf('-->', lt);
            i = ce === -1 ? body.length : ce + 3;
            continue;
        }
        if (body[lt + 1] === '/') {
            const gt = findTagEnd(body, lt + 2);
            i = gt === -1 ? body.length : gt + 1;
            continue;
        }
        const gt = findTagEnd(body, lt + 1);
        if (gt === -1) {
            i = lt + 1;
            continue;
        }
        tags.push({ start: lt, end: gt + 1, raw: body.slice(lt, gt + 1) });
        i = gt + 1;
    }
    return tags;
}

/** 切分开标签的属性列表（含布尔属性；值按引号配对读取），返回 { name, raw, selfClosing } */
function parseOpenTag(tagRaw) {
    let inner = tagRaw.slice(1, -1); // 去掉 < 与 >
    let selfClosing = false;
    if (inner.endsWith('/')) {
        selfClosing = true;
        inner = inner.slice(0, -1);
    }
    const m = inner.match(/^([\w-]+)/);
    const name = m ? m[1] : '';
    const attrs = [];
    let i = m ? m[0].length : 0;
    while (i < inner.length) {
        while (i < inner.length && /\s/.test(inner[i])) i++;
        if (i >= inner.length) break;
        const nameStart = i;
        while (i < inner.length && !/[\s=]/.test(inner[i])) i++;
        const attrName = inner.slice(nameStart, i);
        while (i < inner.length && /\s/.test(inner[i])) i++;
        let raw = attrName;
        if (inner[i] === '=') {
            i++;
            while (i < inner.length && /\s/.test(inner[i])) i++;
            const q = inner[i];
            if (q === '"' || q === "'") {
                const qEnd = inner.indexOf(q, i + 1);
                raw = inner.slice(nameStart, qEnd === -1 ? inner.length : qEnd + 1);
                i = qEnd === -1 ? inner.length : qEnd + 1;
            } else {
                const vStart = i;
                while (i < inner.length && !/\s/.test(inner[i])) i++;
                raw = inner.slice(nameStart, i);
            }
        }
        attrs.push({ name: attrName, raw });
    }
    return { name, selfClosing, attrs };
}

/** 属性分组：0=v-指令/插槽 1=静态 2=动态(:) 3=事件(@) */
function attrGroup(name) {
    if (name[0] === '#' || name.startsWith('v-')) return 0;
    if (name[0] === ':') return 2;
    if (name[0] === '@') return 3;
    return 1;
}

/** 组内排序键：去掉 :/@ 前缀后按码点字典序；v-指令与 #插槽用完整名（'#' 码点 35 天然靠前） */
function attrSortKey(name) {
    if (name[0] === ':' || name[0] === '@') return name.slice(1);
    return name;
}

/**
 * 主导行尾检测：统计 CRLF 与孤立 LF 的数量取多数派。
 * 不能用 includes('\r\n') 判 CRLF——整改期文件常见混合行尾（部分区段被 LF 重写），
 * 一旦误判会让修复器反复横跳、检查永不收敛。
 */
function detectEol(text) {
    const crlf = (text.match(/\r\n/g) || []).length;
    const lf = (text.match(/(?<!\r)\n/g) || []).length;
    return crlf > lf ? '\r\n' : '\n';
}

/**
 * 规范化开标签（eol 取源文件换行风格，避免 CRLF 文件插入 LF 造成混合换行）：
 * 0 个属性 → 原样；1 个属性 → 单行；≥2 个属性 → 每属性一行（缩进 indent+4），闭合 > 或 /> 单独一行
 */
function formatOpenTag(tagRaw, indent, eol) {
    const nl = eol || '\n';
    const { name, selfClosing, attrs } = parseOpenTag(tagRaw);
    if (attrs.length === 0) return tagRaw;
    if (attrs.length === 1) {
        return '<' + name + ' ' + attrs[0].raw + (selfClosing ? ' />' : '>');
    }
    const sorted = attrs.slice().sort((a, b) => {
        const g = attrGroup(a.name) - attrGroup(b.name);
        if (g !== 0) return g;
        const ka = attrSortKey(a.name);
        const kb = attrSortKey(b.name);
        if (ka < kb) return -1;
        if (ka > kb) return 1;
        return 0; // 稳定排序：同名属性保持原相对顺序
    });
    const pad = indent + '    ';
    return '<' + name + nl + sorted.map((a) => pad + a.raw).join(nl) + nl + indent + (selfClosing ? '/>' : '>');
}

/** 模板属性顺序检查：对每个 ≥1 属性的开标签，校验其与规范化输出一致 */
function checkTemplateAttrOrder(source) {
    const tmpl = extractTemplate(source)?.body ?? '';
    if (!tmpl) return [];
    const eol = detectEol(source);
    const issues = [];
    for (const tag of scanTags(tmpl)) {
        const { attrs } = parseOpenTag(tag.raw);
        if (attrs.length === 0) continue;
        const lineStart = tmpl.lastIndexOf('\n', tag.start) + 1;
        const indent = tmpl.slice(lineStart, tag.start);
        const expected = formatOpenTag(tag.raw, indent, eol);
        if (expected !== tag.raw) {
            const line = tmpl.slice(0, tag.start).split('\n').length;
            issues.push(`L${line} 模板属性未按规范排序/排版（组序 v-指令→静态→:绑定→@事件，组内首字母，≥2属性每行一个，1属性单行）：'${tag.raw.replace(/\s+/g, ' ').slice(0, 70)}...'`);
        }
    }
    return issues;
}

/* ------------------------------------------------------------------ *
 * 绑定值数组拆行检查（valarr）
 * 规则：绑定值（:class/:style/v-bind:class/v-bind:style）为数组字面量且顶层元素 ≥3 个时，
 *       必须整行拆开——`[` 居属性行末、每个元素独占起始行、`]` 独占一行；
 *       ≤2 个元素允许单行（元素自身可再折行）。
 * 权威：.agents/skills/component-writer/references/spec/05-template.md「换行与缩进」。
 * ------------------------------------------------------------------ */

/** 模板 body 中所有 HTML 注释区间（区间内不参与值检查/修复，防注释内代码误伤） */
function commentRanges(body) {
    const ranges = [];
    const re = /<!--[\s\S]*?-->/g;
    let m;
    while ((m = re.exec(body))) ranges.push([m.index, m.index + m[0].length]);
    return ranges;
}

/** idx 是否落在任一注释区间内 */
function inCommentRanges(idx, ranges) {
    return ranges.some(([s, e]) => idx >= s && idx < e);
}

/**
 * 引号感知地按顶层逗号切分数组内容，返回段列表（text 含逗号前的原文）；
 * 末尾仅剩空白（`[a, b,]` 尾逗号）时丢弃该空段。
 */
function splitTopLevel(inner) {
    const segs = [];
    let depth = 0;
    let q = null;
    let start = 0;
    for (let i = 0; i <= inner.length; i++) {
        const ch = inner[i];
        if (q) {
            if (ch === '\\') { i++; continue; }
            if (ch === q) q = null;
            continue;
        }
        if (ch === "'" || ch === '"' || ch === '`') { q = ch; continue; }
        if (ch === '(' || ch === '[' || ch === '{') { depth++; continue; }
        if (ch === ')' || ch === ']' || ch === '}') { depth--; continue; }
        if ((ch === ',' && depth === 0) || i === inner.length) {
            segs.push({ text: inner.slice(start, i), start });
            start = i + 1;
        }
    }
    return segs.filter((s, i, arr) => !(i === arr.length - 1 && s.text.trim() === ''));
}

/** 检查绑定值数组（≥3 元素）是否按「每元素独占起始行」拆开 */
function checkValueArrayFormat(source) {
    const tm = extractTemplate(source);
    if (!tm) return [];
    const ranges = commentRanges(tm.body);
    const issues = [];
    const re = /(:class|:style|v-bind:class|v-bind:style)\s*=\s*"([^"]*)"/g;
    let m;
    while ((m = re.exec(tm.body))) {
        if (inCommentRanges(m.index, ranges)) continue;
        const t = m[2].trim();
        if (!t.startsWith('[') || !t.endsWith(']')) continue; // 仅数组字面量值
        const segs = splitTopLevel(t.slice(1, -1));
        if (segs.length < 3) continue; // ≤2 元素允许单行
        const reasons = [];
        segs.forEach((seg, i) => {
            if (!/^[\s]*/.exec(seg.text)[0].includes('\n')) {
                reasons.push(i === 0 ? '`[` 后未换行（首元素与 `[` 同行）' : `第 ${i + 1} 个元素与前元素同行`);
            }
        });
        if (!/[\s]*$/.exec(segs[segs.length - 1].text)[0].includes('\n')) {
            reasons.push('`]` 与末元素同行');
        }
        if (!reasons.length) continue;
        const abs = tm.index + tm.open.length + m.index;
        const line = source.slice(0, abs).split('\n').length;
        issues.push(`L${line} ${m[1]} 数组 ${segs.length} 个元素未拆行（>2 元素须 \`[\` 居行末、每元素独占起始行、\`]\` 独占一行）：${reasons.join('；')}｜${t.replace(/\s+/g, ' ').slice(0, 60)}`);
    }
    return issues;
}

/**
 * 10 段规范的段次。段次严格单调递增，任何"倒退"即违规。
 * 0: import        import 语句
 * 1: docstring     组件级块注释（紧跟 import）——注意 props 内行注释不算
 * 2: define        以 define* 开头（defineOptions/defineProps/defineModel/defineEmits/defineSlots）
 * 3: hooks         useBEM(name) / useRect / useThrottle / useSlots 等解构 hook 声明（属第4段）
 *                  模板 ref 声明（const xRef = shallowRef<UniElement | null>(null)）**不参与段序**：
 *                  它是无依赖的容器，只能紧贴在消费它的 hook 调用之前（靠 UTS「使用先于声明」
 *                  由编译器兜住）。曾试过归入 hooks 段，实测会 retroactive 判红 5 个存量组件
 *                  （它们的 ref 本就排在普通 const 之后，属合法位置），故弃。
 * 4: constvar      const/let 变量（ref / 普通 const）
 * 5: computed      仅 const X = computed(...)
 * 6: watch         以 watch( / watchEffect( 开头
 * 7: cycle         onMounted/onUnmounted/onBeforeUnmount/onActivated 等生命周期
 * 8: function      以 function / async function 开头
 * 9: expose        defineExpose
 * -1: other/misc   模板、注释、宏不参与排序但须容忍
 */
const SEG_NO = {
    import: 0,
    docstring: 1,
    define: 2,
    hooks: 3,
    constvar: 4,
    computed: 5,
    watch: 6,
    cycle: 7,
    function: 8,
    expose: 9,
    other: -1
};

// 分类一条顶层语句（跳过空行；块注释与续行靠 depth 状态跳过）。
// defineModel 属 define 组（与 defineProps 并存的受控 prop 双向绑定），组内位次见 DEFINE_SUB。
const DEFINE_RE = /^(?:const\s+[\w$]+\s*=\s*(?:withDefaults\(\s*)?)?define(Options|Props|Model|Emits|Slots)\b/;
// 模板 ref：shallowRef<UniElement | null>(null) 且命名以 Ref 结尾（spec/02），与 hook 同段
const TEMPLATE_REF_RE = /^const\s+[\w$]*Ref\s*=\s*shallowRef\s*<\s*UniElement\s*\|\s*null\s*>\s*\(/;
function classify(t) {
    if (t.startsWith('//')) return 'other';
    if (/^import\b/.test(t)) return 'import';
    if (DEFINE_RE.test(t)) return 'define';
    if (/^const\s+[\w$]+\s*=\s*useBEM\(/.test(t)) return 'hooks';
    if (/^const\s+(?:[\w$]+|\{[^}]*\})\s*=\s*use[A-Z][\w$]*(?:<[^>]*>)?\(/.test(t)) return 'hooks'; // useRect/useThrottle/useSlots 等（含泛型如 useParent<T>）
    if (TEMPLATE_REF_RE.test(t)) return 'other'; // 模板 ref 不参与段序（改判 hooks 会误伤存量，见 SEG_NO 注）
    if (/^const\s+\w+\s*=\s*computed</.test(t) || /^const\s+\w+\s*=\s*computed\(/.test(t)) return 'computed';
    if (/^const\b/.test(t) || /^let\b/.test(t)) return 'constvar';
    if (/^watch\s*\(/.test(t) || /^watchEffect\s*\(/.test(t)) return 'watch';
    if (/^on[A-Z]\w*\s*\(/.test(t)) return 'cycle';
    if (/^defineExpose\b/.test(t)) return 'expose';
    if (/^(async\s+)?function\b/.test(t)) return 'function';
    return 'other';
}

/**
 * 判断一条顶层 const 是否为"模块级纯常量"：初始化为数组/对象/字符串/数字/布尔/未赋初值，
 * 且名字不是 ref/computed/reactive/use* 等响应式或 hook 声明。
 * 纯常量必须归 const/let 段，落 function/watch/cycle 等后段即违规。
 */
function isPureConst(t) {
    const m = t.match(/^const\s+([\w$]+)(?::\s*[^=]+)?\s*=\s*/);
    if (!m) return false;
    if (/^(ref|shallowRef|computed|reactive|use[A-Z]|useBEM)\b/.test(m[1])) return false;
    const rest = t.slice(m[0].length);
    return /^(\d|[\[{'"]|true\b|false\b|null\b|undefined\b|\(\))/.test(rest);
}

/**
 * 模板 ref 完整性检查：模板里的静态 ref="xxx"（绑定元素/组件节点）必须在 <script> 中找到
 * 对应 const xxx = shallowRef/ref 声明。缺失时模板 ref 绑定失败，
 * 运行时访问 .value 会抛 ReferenceError: xxx is not defined（编译期不报，隐患隐蔽）。
 * 命名规范见 component-writer spec/02：{组件名}Ref + shallowRef<UniElement | null>(null)。
 */
function checkTemplateRefs(source) {
    const tmpl = extractTemplate(source)?.body ?? '';
    if (!tmpl) return [];
    const refSet = new Set();
    const refRe = /(?:^|[\s>])ref="([^"\s]+)"/g; // 只取静态 ref，`(?<!:)` 前界排除 :ref=""
    let m;
    while ((m = refRe.exec(tmpl))) refSet.add(m[1]);
    const script = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1] || '';
    const declared = new Set();
    const declRe = /const\s+([\w$]+)\s*=\s*(?:shallowRef|ref)\b/g;
    while ((m = declRe.exec(script))) declared.add(m[1]);
    const issues = [];
    for (const name of refSet) {
        if (!declared.has(name)) {
            issues.push(`模板 ref="${name}" 在 <script> 里无 \`const ${name} = shallowRef<UniElement | null>(null)\` 声明（模板 ref 须绑定同名 ref，否则运行时报 not defined）`);
        }
    }
    return issues;
}

/**
 * 模板 prop 引用显式化校验（component-writer spec/05 §prop 引用显式 props.）：
 * 模板中引用任何 prop 值必须写 props.xxx，禁止裸名。
 * 例外：script 存在同名顶层 const（派生值 computed/ref 或遮蔽变量）时，该裸名合法指向派生值（派生值保持裸名），不报。
 * 局限：prop 集合只能从 withDefaults(defineProps<...>(), {...}) 默认对象键提取（纯文本正则，无类型信息）；
 *       未用 withDefaults 或 props 显式对象形式的组件跳过本校验。
 */
function checkTemplateProps(source) {
    const tmpl = extractTemplate(source)?.body ?? '';
    const script = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1];
    if (!tmpl || !script) return [];

    // 1) prop 集合：withDefaults 默认对象体里的对象键（defineProps<..>() 成对括号须显式匹配）
    const wd = script.match(/withDefaults\(\s*defineProps<[^>]*>\(\s*\)\s*,\s*\{([\s\S]*?)\n\s*\}\)/);
    if (!wd) return [];
    const propSet = new Set();
    for (const m of wd[1].matchAll(/([\w$]+)\s*:/g)) propSet.add(m[1]);

    // 2) 遮蔽集合：script 顶层同名 const（派生值/局部变量）→ 裸名合法
    const constSet = new Set();
    for (const m of script.matchAll(/^\s*const\s+([\w$]+)\s*=/gm)) constSet.add(m[1]);

    // 3) 收集指令绑定值(:attr/@事件/v-指令)/插值表达式，在表达式内筛选裸 prop；
    //    跳过静态属性（name="icon" 等值为字面量、Vue 不解析，避免误报插槽名/图标名）与字符串字面量、
    //    props.xxx 访问与对象 key(CSS 属性名等)。
    const exprRe = /\{\{([\s\S]*?)\}\}|(?:[:\@][\w.:-]*|v-[\w.:-]+)\s*=\s*"([^"]*)"/g;
    const strRe = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g;
    const issues = [];
    const seen = new Set();
    let e;
    while ((e = exprRe.exec(tmpl))) {
        const expr = e[1] ?? e[2] ?? '';
        if (!expr.trim()) continue;
        // 剔字符串字面量 -> 剔 props.xxx 访问 -> 剔 X.y 属性访问(非裸 prop，如 item.text) -> 剩余标识符
        const cleaned = expr
            .replace(strRe, '')
            .replace(/\bprops\s*\.\s*[\w$]+(?:\.[\w$]+)*/g, '')
            .replace(/\b[\w$]+(?:\.[\w$]+)+/g, '');
        const idRe = /\b([A-Za-z_$][\w$]*)\b/g;
        let m;
        while ((m = idRe.exec(cleaned))) {
            const id = m[1];
            if (id.startsWith('$')) continue; // 全局工具 $u 等
            if (!propSet.has(id)) continue;   // 非 prop，忽略
            if (constSet.has(id)) continue;   // 有同名顶层 const（派生值）→ 裸名即该值，合法
            if (cleaned.slice(m.index + id.length).trimStart().startsWith(':')) continue; // 对象 key(CSS 属性/映射键)，非 prop 引用
            if (seen.has(id)) continue;
            seen.add(id);
            issues.push(`模板引用 prop '${id}' 未加 props. 前缀：除非定义了同名派生 const，否则须写 props.${id}`);
        }
    }
    return issues;
}

/**
 * BEM 硬编码裸类校验（component-writer spec/07 §类名一律 useBEM 生成）：
 * 一、模板 class 属性（静态 class= / :class=）中的字符串字面量不得含硬编码 `ux-*` 裸类——
 * 组件自身 BEM 类必须经 `bem.b/e/m/em/is`（或 `:class="[bem.e(...), cond ? bem.m(...) : '']"` 数组）生成。
 * 二、script 侧同样受检（封住「把类名存进变量/返回值」这条逃逸口）：仅拦含 `--` 或 `__`
 * 的 BEM 形态字面量，因为组件名（name: 'ux-button'）、useBEM 入参、useParent/inject token
 * 均不带分隔符，宽拦会误伤全库（实测宽口径一刷即命中 76 组件）；注释/docstring 先行剔除。
 * 豁免：`withDefaults(...)` 整段——props 默认值在 setup 求值前就要交付，作用域内拿不到
 * `bem.m()` 结果（如 `hoverClass: 'ux-cell--hover'`），属工具无法覆盖的规范盲区，不判违规。
 * 例外：全局工具类保留 `u-` 前缀（`u-line-1`、`u-iconfont` 等），不参与此校验；`customClass` 外部注入类无法静态判定，不报。
 */
function checkBemBare(source) {
    const tmpl = extractTemplate(source)?.body ?? '';
    const issues = [];
    const seen = new Set();
    const classAttrRe = /([\w:.-]*\bclass)\s*=\s*"([^"]*)"/g; // 静态 class= 与 :class= 的值统一采集
    let m;
    while (tmpl && (m = classAttrRe.exec(tmpl))) {
        const val = m[2];
        // 仅匹配引号包裹的字面量 ux-*（bem 运行时产出不落地于此；`<ux-button>` 属标签非类）
        const litRe = /['"](ux-[A-Za-z0-9_-]+)['"]/g;
        let l;
        while ((l = litRe.exec(val))) {
            if (seen.has(l[1])) continue;
            seen.add(l[1]);
            issues.push(`模板 class 硬编码 BEM 裸类 '${l[1]}'：组件自身类必须用 bem.b/e/m/em/is 生成（${val.trim().slice(0, 40)}）`);
        }
    }
    // script 侧：剔注释与 withDefaults 默认值区后扫 BEM 形态字面量（同名的只报一次）
    const script = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1] || '';
    if (script) {
        const scrRe = /['"](ux-[A-Za-z0-9_-]*(?:--|__)[A-Za-z0-9_-]*)['"]/g;
        const scan = blankWithDefaults(stripScriptComments(script));
        let s;
        while ((s = scrRe.exec(scan))) {
            if (seen.has(s[1])) continue;
            seen.add(s[1]);
            issues.push(`script 硬编码 BEM 裸类 '${s[1]}'：类名一律用 bem.b/e/m/em/is 生成后存入变量/返回值，不得手写字符串字面量`);
        }
    }
    return issues;
}

/**
 * 剔除 withDefaults( ... ) 整段（括号配对到闭合），改写成空行保留行号。
 * props 默认值作用域拿不到 bem 结果，那里的类名字面量不计违规。
 */
function blankWithDefaults(text) {
    let from = 0;
    for (;;) {
        const at = text.indexOf('withDefaults(', from);
        if (at === -1) break;
        let depth = 0;
        let i = at + 'withDefaults'.length; // 指向 '('
        for (; i < text.length; i++) {
            const ch = text[i];
            if (ch === '(' || ch === '[' || ch === '{') depth++;
            else if (ch === ')' || ch === ']' || ch === '}') { depth--; if (depth === 0) { i++; break; } }
        }
        const head = text.slice(0, at).split('\n').length - 1;
        const tail = text.slice(0, i).split('\n').length - 1;
        const lines = text.split('\n');
        for (let k = head; k < tail; k++) lines[k] = '';
        text = lines.join('\n');
        from = head;
    }
    return text;
}

/** 剔除 script 内的行注释与块注释（含 docstring），避免注释里引用的类名误报 */
function stripScriptComments(text) {
    const out = [];
    let inBlock = false;
    for (const line of text.split('\n')) {
        const t = line.trim();
        if (inBlock) {
            if (t.includes('*/')) inBlock = false;
            out.push('');
            continue;
        }
        if (t.startsWith('//')) { out.push(''); continue; }
        if ((t.startsWith('/*') || t.startsWith('/**')) && !t.includes('*/')) { inBlock = true; out.push(''); continue; }
        if (t.startsWith('*')) { out.push(''); continue; }
        out.push(line);
    }
    return out.join('\n');
}

/**
 * px 手拼校验（component-writer spec/07 §单位一律 addUnit）：
 * script 与模板样式绑定中的变长 + 'px' 拼接一律违规，应改 `$u.addUnit(value)`。
 * 仅纯字面量（`'3px'`、`'100%'`、`'auto'`）可直接写，不算。此处只拦"拼接"形态。
 */
function checkPxConcat(source) {
    const script = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1] || '';
    // 模板 :style 绑定里的表达式也可能手拼 px
    const styleRe = /:style\s*=\s*"([^"]*)"/g;
    const tmplBindings = [];
    const tmpl = extractTemplate(source)?.body ?? '';
    let m;
    while ((m = styleRe.exec(tmpl))) tmplBindings.push(m[1]);
    const bodies = [script, ...tmplBindings];
    const issues = [];
    // 拼接形态：X + 'px'（含 toString() + 'px'），或 'px' 前置 + X
    const concatRe = /([\w$)\].])\s*\+\s*(['"]px['"])|(['"]px['"])\s*\+\s*([\w$(])/;
    for (const body of bodies) {
        if (!body) continue;
        for (const line of body.split('\n')) {
            const stripped = line.replace(/\/\/.*$/, ''); // 去行注释，避免注释内 'px' 误报
            if (concatRe.test(stripped)) {
                issues.push(`px 手拼违规（应改 \`$u.addUnit(...)\`，仅纯字面量可直接写）：${line.trim().slice(0, 60)}`);
            }
        }
    }
    return issues;
}

/**
 * 内联样式对象键必须用连字符（App/H5/小程序三端一致），禁止 camelCase。
 * 凡 `style['borderRadius']` / `style["background-color"]` 误写 camelCase 且该 CSS 属性需连字符 → 违规。
 * 单字/简写合法属性（opacity / overflow / transition 等无连字符）不在此列。
 * 权威：.agents/skills/component-writer/references/spec/06-style-cross-platform.md「内联样式对象键：统一用连字符，三端一致」。
 */
const HYPHEN_CSS_KEYS = {
    backgroundColor: 'background-color', backgroundImage: 'background-image',
    backgroundSize: 'background-size', backgroundRepeat: 'background-repeat', backgroundPosition: 'background-position',
    borderRadius: 'border-radius', borderWidth: 'border-width', borderColor: 'border-color', borderStyle: 'border-style',
    borderTopWidth: 'border-top-width', borderTopStyle: 'border-top-style', borderTopColor: 'border-top-color',
    borderRightWidth: 'border-right-width', borderRightStyle: 'border-right-style', borderRightColor: 'border-right-color',
    borderBottomWidth: 'border-bottom-width', borderBottomStyle: 'border-bottom-style', borderBottomColor: 'border-bottom-color',
    borderLeftWidth: 'border-left-width', borderLeftStyle: 'border-left-style', borderLeftColor: 'border-left-color',
    borderTopLeftRadius: 'border-top-left-radius', borderTopRightRadius: 'border-top-right-radius',
    borderBottomLeftRadius: 'border-bottom-left-radius', borderBottomRightRadius: 'border-bottom-right-radius',
    marginTop: 'margin-top', marginRight: 'margin-right', marginBottom: 'margin-bottom', marginLeft: 'margin-left',
    paddingTop: 'padding-top', paddingRight: 'padding-right', paddingBottom: 'padding-bottom', paddingLeft: 'padding-left',
    fontSize: 'font-size', fontWeight: 'font-weight', lineHeight: 'line-height',
    letterSpacing: 'letter-spacing', wordSpacing: 'word-spacing',
    textAlign: 'text-align', textDecoration: 'text-decoration', textOverflow: 'text-overflow',
    textDecorationColor: 'text-decoration-color', textDecorationLine: 'text-decoration-line',
    whiteSpace: 'white-space', wordWrap: 'word-wrap',
    justifyContent: 'justify-content', alignItems: 'align-items', alignContent: 'align-content',
    alignSelf: 'align-self', flexDirection: 'flex-direction', flexWrap: 'flex-wrap', flexGrow: 'flex-grow',
    flexShrink: 'flex-shrink', flexBasis: 'flex-basis',
    boxShadow: 'box-shadow', boxSizing: 'box-sizing',
    maxWidth: 'max-width', maxHeight: 'max-height', minWidth: 'min-width', minHeight: 'min-height',
    zIndex: 'z-index',
    transitionDuration: 'transition-duration', transitionTimingFunction: 'transition-timing-function',
    transitionDelay: 'transition-delay', transitionProperty: 'transition-property',
    transformOrigin: 'transform-origin', transformStyle: 'transform-style',
    fontFamily: 'font-family', fontStyle: 'font-style',
    columnGap: 'column-gap', rowGap: 'row-gap'
};

function checkCamelStyleKeys(source) {
    const issues = [];
    const keyRe = /style\s*(?:\[(['"])([A-Za-z_$][\w]*)\1\]|\.([A-Za-z_$][\w]*))/g;
    const lines = source.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const stripped = lines[i].replace(/\/\/.*$/, ''); // 去行注释，避免注释内示例字样误报
        let m;
        while ((m = keyRe.exec(stripped))) {
            // 前界排除 styles. / obj.style（变量非独立 style 访问）
            if (m.index > 0 && /[\w.$]/.test(stripped[m.index - 1])) continue;
            const key = m[2] ?? m[3];
            const hyphen = HYPHEN_CSS_KEYS[key];
            if (hyphen) {
                const display = m[2] !== undefined ? `['${key}']` : `.${key}`;
                issues.push(`L${i + 1} 内联样式键 camelCase \`style${display}\` 应改连字符 \`style['${hyphen}']\`（三端统一连字符，权威 spec 06）`);
            }
        }
    }
    return issues;
}

/**
 * view 内裸文本校验（uvue App 端硬约束）：文字必须放在 <text> 组件内，
 * 禁止写在 view 区域/插槽里的裸文本——App 端 view 内裸文本颜色不继承父元素、渲染异常。
 * 权威：component-writer references/spec/06-style-cross-platform.md。
 */
function checkBareTextInView(source) {
    const tm = extractTemplate(source);
    if (!tm) return [];
    const issues = [];
    const stack = [];
    // 先剥除 HTML 注释：`<!-- ... -->` 里的 `<` 会让标签属性区无法闭合，
    // 叠加嵌套量词 tagRe 触发灾难性回溯（ReDoS，ux-image 条件编译注释实测卡死）。
    // 字符级匹配保证线性：每次迭代至少消费 1 字符，无空迭代分支。
    const body = tm.body.replace(/<!--[\s\S]*?-->/g, '');
    const tagRe = /<(\/?)\s*([A-Za-z][\w-]*)((?:[^<>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
    const pushText = (raw) => {
        if (!raw) return;
        const stripped = raw.replace(/\s+/g, ' ').trim();
        if (!stripped) return;
        if (stack[stack.length - 1] === 'view') {
            issues.push(`view 内裸文本「${stripped.slice(0, 24)}」：App 端文字必须放 <text> 组件内（spec 06），禁止 view/插槽内裸文本`);
        }
    };
    let last = 0;
    let m;
    while ((m = tagRe.exec(body))) {
        pushText(body.slice(last, m.index));
        const close = m[1], tag = m[2], selfClose = m[4];
        last = m.index + m[0].length;
        if (selfClose === '/') continue; // 自闭合标签不入栈
        if (close === '/') {
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i] === tag) { stack.length = i; break; }
            }
        } else {
            stack.push(tag);
        }
    }
    pushText(body.slice(last));
    return issues;
}

/**
 * 插槽检测规范校验（component-writer spec/01 §插槽检测）：
 * - 禁用 defineSlots 声明插槽：插槽存在性判定统一 useSlots()，define 组只保留 Options/Props/Emits；
 * - useSlots() 解构变量（默认 slots）后，插槽访问须用方括号 slots['x']，禁点号 slots.x；
 * - 每个 slots['x'] 访问必须配套规范命名的判定 computed：has + 插槽名 PascalCase + Slot
 *   （如 default → hasDefaultSlot），判定表达式 slots['x'] != null。
 */
function checkSlotDetection(source) {
    const script = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1];
    if (!script) return [];
    const issues = [];
    // 1) 禁用 defineSlots
    if (/defineSlots\b/.test(script)) {
        issues.push(`禁用 defineSlots 声明插槽：插槽存在性判定统一 useSlots() + computed hasXSlot（spec 01 插槽检测）`);
    }
    // 2) useSlots 解构变量名（缺省 slots，兼容别名）
    const slotsVar = script.match(/const\s+(\w+)\s*=\s*useSlots\(\)/)?.[1] ?? 'slots';
    if (!script.includes('useSlots()')) return issues; // 未用 useSlots 无插槽判定，不查
    // 3) 点号访问 slots.xxx → 违规
    const dotRe = new RegExp(`\\b${slotsVar}\\s*\\.\\s*([A-Za-z_$][\\w$]*)`, 'g');
    let m;
    while ((m = dotRe.exec(script))) {
        issues.push(`插槽访问禁用点号 \`${slotsVar}.${m[1]}\`：统一方括号 \`${slotsVar}['${m[1]}']\`（spec 01 插槽检测）`);
    }
    // 4) 每个 slots['x'] 访问必须配套 hasXSlot 命名 computed
    const accessRe = new RegExp(`${slotsVar}\\s*\\[\\s*['"]([\\w-]+)['"]\\s*\\]`, 'g');
    const accessed = new Set();
    while ((m = accessRe.exec(script))) accessed.add(m[1]);
    for (const name of accessed) {
        const pascal = name.split('-').map((s) => s ? s[0].toUpperCase() + s.slice(1) : s).join('');
        const expected = 'has' + pascal + 'Slot';
        if (!new RegExp(`const\\s+${expected}\\s*=\\s*computed`).test(script)) {
            issues.push(`插槽 '${name}' 缺少规范命名判定 computed \`const ${expected} = computed(... slots['${name}'] != null ...)\`（spec 01 插槽检测）`);
        }
    }
    return issues;
}

/**
 * emit 事件载荷一致性校验（仅查无参 emit）：
 * 只有 defineEmits 里**声明了载荷**的事件被无参调用才违规；
 * 声明为空载荷的纯通知型事件（open/close/clickOverlay/end/backspace…）本就无参可转，
 * 属正常设计，天然合规、不再走基线豁免。
 * 纠向依据（2026-09-24）：旧规则「裸 emit 一律违规 + 通知型登记豁免」方向反了，
 * 实测库内 26 组件为此累计吃掉 53 条基线豁免（ux-transition 一组件即 10 条），
 * 基线被常态填满后，真漏转发就再也不会报——基线只剩「存量待改」才有意义。
 * 未出现在 defineEmits 里的事件名无法静态判有无载荷（本库大量用 toRaw(props).onXxx
 * 回调 prop 转发，根本不调 emit），不报——保守不猜。
 */
function checkEmitForward(source) {
    const script = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1];
    if (!script) return [];
    const sigs = collectEmitSignatures(script);
    if (!sigs.size) return [];
    const issues = [];
    const re = /(?:[^.\w$]|^)emit\(\s*['"]([A-Za-z_$][\w:.-]*)['"]\s*\)/g;
    let m;
    while ((m = re.exec(script))) {
        if (sigs.get(m[1]) !== true) continue; // 通知型或未声明 → 不报
        issues.push(`emit 事件 '${m[1]}' 在 defineEmits 声明了载荷但调用未转发：要转发就补上参数，确属通知型则把签名改成空载荷 (e: '${m[1]}'): void`);
    }
    return issues;
}

/**
 * 解析 defineEmits<{...}>() 每个事件的载荷声明：返回 Map<事件名, 是否带载荷>。
 * 两种声明形态均支持：函数签名 (e: 'name', v: T): void / (e: 'name'): void；
 * 元组对象型 'name': [T] / name: []（Vue 3.3+ 写法，本库暂未用，备将来）。
 * 带载荷判定：签名内事件名后出现顶层逗号，或元组内非空——用括号深度扫描，
 * 避开参数默认值/嵌套函数类型里的逗号误判。
 */
function collectEmitSignatures(script) {
    const sigs = new Map();
    // defineEmits<{ ... }>() 体：外层花括号配对（内层 {} 为对象类型，不计入终止）
    const head = script.match(/defineEmits\s*<\s*\{/);
    if (!head) return sigs;
    const start = head.index + head[0].length;
    let depth = 1;
    let end = -1;
    for (let i = start; i < script.length; i++) {
        const ch = script[i];
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) { end = i; break; } }
    }
    if (end === -1) return sigs;
    const body = script.slice(start, end);
    // 1) 函数签名形态
    const sigRe = /\(\s*[\w$]+\s*:\s*['"]([A-Za-z_$][\w:.-]*)['"]\s*(,?)/g;
    let m;
    while ((m = sigRe.exec(body))) {
        if (m[2] === ',') { sigs.set(m[1], true); continue; }
        if (!sigs.has(m[1])) sigs.set(m[1], false);
    }
    // 2) 元组形态：name: [T] / 'name': []（仅在签名形态未收录时补）
    const tupRe = /(?:^|[;,{\s])['"]?([A-Za-z_$][\w:.-]*)['"]?\s*:\s*\[/g;
    while ((m = tupRe.exec(body))) {
        if (sigs.has(m[1])) continue;
        const open = body.indexOf('[', m.index + m[0].length - 1);
        let close = open + 1;
        let d2 = 1;
        while (close < body.length && d2 > 0) {
            const ch = body[close];
            if (ch === '[') d2++;
            else if (ch === ']') d2--;
            close++;
        }
        sigs.set(m[1], body.slice(open + 1, close - 1).trim() !== '');
    }
    return sigs;
}

/**
 * Vue API 显式导入校验（.uvue 自动导入教训）：
 * .uvue 文件自动导入 ref/computed/watch/useSlots 等 Vue API，组件 <script setup> 显式
 * import 它们会触发重复注册/未导出编译错（ux-input `import { useSlots } from '../..'` 报
 * "useSlots is not exported"）。凡显式导入自动导入族 API 一律违规，应移除该 import 项。
 * 保守清单：仅收录项目已验证自动导入的 Vue API；getCurrentInstance 等存疑项不在此列（交人工）。
 */
const AUTO_IMPORT_VUE_APIS = new Set([
    'ref', 'shallowRef', 'reactive', 'computed', 'watch', 'watchEffect',
    'onMounted', 'onUnmounted', 'onBeforeUnmount', 'onActivated', 'onDeactivated',
    'useSlots', 'useAttrs', 'useTemplateRef', 'nextTick', 'toRef', 'toRefs',
    'provide', 'inject', 'defineExpose'
]);

function checkVueImports(source) {
    const script = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1];
    if (!script) return [];
    const issues = [];
    const re = /import\s*\{([^}]*)\}\s*from\s*(['"])([^'"]+)\2/g;
    let m;
    while ((m = re.exec(script))) {
        const from = m[3];
        const names = m[1].split(',').map((s) => s.trim()).filter(Boolean)
            .map((s) => (s.match(/^([A-Za-z_$][\w$]*)/) || [])[1]).filter(Boolean);
        for (const name of names) {
            if (AUTO_IMPORT_VUE_APIS.has(name)) {
                issues.push(`显式导入 Vue API '${name}'（from '${from}'）：.uvue 自动导入 ref/computed/watch/useSlots 等，禁止显式 import（ux-input useSlots 教训）`);
            }
        }
    }
    return issues;
}

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

/**
 * hover-class 反馈类样式校验：
 * 根因（已验证）：组件根节点内联背景（如 bgColor 默认 transparent、customStyle）优先级高于类选择器，
 * 会盖掉按压反馈——反馈类须带 `!important`（App 端官方支持 class 选择器 !important 覆盖内联 style，
 * 见 uvue css 文档；原库 .u-cell-hover 亦如此）。反馈类放在 scoped 块内即可正常匹配生效
 * （data-v 为编译期元素属性，与运行时添加的类无关），不限制样式块作用域。
 * 检测：模板存在 hover-class 属性时，逐样式块检查 `ux-{name}--hover` 的声明是否带 !important。
 */
function checkHoverClassImportant(source) {
    const tm = extractTemplate(source);
    if (!tm) return [];
    if (!/:?hover-class\b/.test(tm.body)) return [];
    // 反馈类前缀以 useBEM 命名空间为准（如 ux-cell-item 用 useBEM('cell')，反馈类为 .ux-cell--hover），
    // 命名空间缺省时回退 defineOptions name
    const ns = source.match(/useBEM\(\s*['"]([\w-]+)['"]\s*\)/)?.[1];
    const comp = ns ?? source.match(/defineOptions\(\s*\{\s*name:\s*['"](?:ux-)?([\w-]+)['"]/)?.[1];
    if (!comp) return [];
    const issues = [];
    const styleBlocks = [...source.matchAll(/<style\b([^>]*)>([\s\S]*?)<\/style>/g)];
    const selRe = new RegExp(`\\.ux-${comp}--hover\\b[^{]*\\{([^}]*)\\}`, 'g');
    let found = false;
    for (const blk of styleBlocks) {
        const body = blk[2] || '';
        let m;
        while ((m = selRe.exec(body))) {
            found = true;
            const decl = m[1] || '';
            if (!/!important\b/.test(decl)) {
                issues.push(`hover-class 反馈类 '.ux-${comp}--hover' 缺少 !important：根节点内联背景（bgColor/customStyle）优先级更高，会盖掉按压反馈（App 端支持 class 选择器 !important 覆盖内联 style）`);
            }
        }
    }
    if (!found) {
        // 仅对静态字面量 hover-class 做未定义告警：绑定表达式（:hover-class="expr"，如
        // bem.em('btn','hover') 元素级反馈类、computed 派生名）无法静态解析，不误报
        const used = tm.body.match(/(?:^|\s)hover-class\s*=\s*["']([^"']+)["']/)?.[1] || '';
        if (used && !used.includes('none')) {
            issues.push(`hover-class 使用了 '${used}' 但未找到 '.ux-${comp}--hover' 根反馈类定义（若为元素级反馈类请忽略本项）`);
        }
    }
    return issues;
}

/**
 * 基线加载与校验：`scripts/verify-baseline.json` 记录存量组件"已知违规"清单，
 * 形如 { "ux-xxx": ["模板 class 硬编码 BEM 裸类 'ux-xxx__foo'", ...] }（数组元素必须与检测字面完全一致）。
 * - 基线内组件：命中基线条目 → 豁免（≡）；出现基线外新违规 → 仍报错（防止整改后退化/新增）。
 * - 基线外组件（含新写/整改/ux-button、ux-navbar 模板）：全部从严，0 违规。
 * 基线路径可用环境变量 UX_VERIFY_BASELINE 覆盖；无文件则视为空基线（全从严）。
 */
function loadBaseline(file) {
    try {
        return JSON.parse(readFileSync(file, 'utf8'));
    } catch {
        return {};
    }
}

/** 统计一行中不成对的 { } 净增量（忽略首参析构中的切入，用于跟踪块深度） */
function braceDelta(s) {
    // 去掉字符串字面量里的括号（简化：忽略引号内容）
    const cleaned = s.replace(/'(?:[^'\\\n]|\\.)*'/g, '""').replace(/"(?:[^"\\\n]|\\.)*"/g, '""');
    let d = 0;
    for (const ch of cleaned) {
        if (ch === '{') d++;
        else if (ch === '}') d--;
    }
    return d;
}

/**
 * 全括号深度扫描：对 <script> 各行求「行首括号深度」与最终深度。
 * 与 braceDelta 的区别：同时统计 ()[]{} 三种括号，且正确处理字符串、行注释、跨行块注释
 * （braceDelta 只数 {} 且不剥注释，多行表达式参数行（如 watch 的箭头函数参数）在括号深度下
 * 必 > 0，可被正确识别为语句续行；这是 fixScriptOrderSafe 切段的正确深度语义，见 ux-button 事故）。
 */
function computeDepths(lines) {
    const depths = new Array(lines.length);
    const netDeltas = new Array(lines.length);
    let depth = 0;
    let inBlock = false;
    for (let i = 0; i < lines.length; i++) {
        depths[i] = depth;
        const line = lines[i];
        const n = line.length;
        let j = 0;
        while (j < n) {
            const ch = line[j];
            if (inBlock) {
                if (ch === '*' && line[j + 1] === '/') { inBlock = false; j += 2; continue; }
                j++;
                continue;
            }
            if (ch === "'" || ch === '"' || ch === '`') {
                let k = j + 1;
                while (k < n) {
                    if (line[k] === '\\') { k += 2; continue; }
                    if (line[k] === ch) { k++; break; }
                    k++;
                }
                j = k;
                continue;
            }
            if (ch === '/' && line[j + 1] === '/') break; // 行注释：本行剩余不计
            if (ch === '/' && line[j + 1] === '*') { inBlock = true; j += 2; continue; }
            if (ch === '(' || ch === '[' || ch === '{') depth++;
            else if (ch === ')' || ch === ']' || ch === '}') depth--;
            j++;
        }
        netDeltas[i] = depth - depths[i];
    }
    return { depths, netDeltas, finalDepth: depth, inBlock };
}

/**
 * <script> 括号平衡硬门禁：最终深度非 0 或块注释未闭合即违规。
 * 防止自动修复器静默产出坏代码（ux-button watch 块事故的兜底网）——修复写盘前必须通过本检查。
 */
function checkBracketBalance(source) {
    const s = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/);
    if (!s) return [];
    const { finalDepth, inBlock } = computeDepths(s[1].split('\n'));
    if (finalDepth !== 0 || inBlock) {
        return [`<script> 括号不平衡（最终深度 ${finalDepth}${inBlock ? '，块注释未闭合' : ''}）：语法可能已损坏，禁止自动修复写盘（ux-button 教训）`];
    }
    return [];
}

function verifyScript(source) {
    const script = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1];
    if (!script) return [];
    const lines = script.split('\n');
    const state = { inDocstring: false, firstDefineIdx: -1, blockCommentStarts: [] };
    /** @type {{seg:string,line:number,text:string}[]} */
    const seq = [];
    const { depths } = computeDepths(lines); // 全括号深度：仅行首深度为 0 的行参与段序
    for (let i = 0; i < lines.length; i++) {
        const t = lines[i].trim();
        if (!t) { continue; }
        if (state.inDocstring) {
            if (t.startsWith('*/')) state.inDocstring = false;
            continue;
        }
        if (t.startsWith('/**') || t.startsWith('/*')) {
            if (!t.startsWith('/**') && !t.startsWith('/*')) { /* noop */ }
            state.inDocstring = !t.includes('*/');
            // 仅当当前处于顶层（depth 0 且尚未进入 define）记录为候选 docstring
            if (depths[i] === 0 && t.startsWith('/**')) state.blockCommentStarts.push(i);
            continue;
        }
        // 非注释行：先分类(顶层才计入)，再更新深度
        if (depths[i] === 0) {
            const seg = classify(t);
            if (seg) seq.push({ seg, line: i + 1, text: t });
        }
    }

    const issues = [];
    let lastNo = -1;
    let lastLabel = 'start';
    const defineItems = [];

    for (const it of seq) {
        const no = SEG_NO[it.seg];
        if (no === -1) continue;
        // define 组内顺序检查：先收集，循环后按子序列校验（允许缺项，如纯展示组件无 defineEmits）
        if (it.seg === 'define') {
            const got = it.text.match(DEFINE_RE)?.[1] || '';
            if (got) defineItems.push({ name: got, line: it.line });
            if (state.firstDefineIdx === -1) state.firstDefineIdx = it.line - 1;
        }
        // 段序单调检查（define 也参与：其段次 2 须在 hooks 3 之前）
        if (no < lastNo) {
            if (it.seg === 'constvar' && isPureConst(it.text)) {
                const name = it.text.match(/^const\s+([\w$]+)/)?.[1] || '';
                issues.push(`L${it.line} 模块级纯常量 '${name}' 应归 const/let 段，现误落 '${lastLabel}' 段（值为字面量，非 ref/computed/use*，命名规范要求归第 5 段）`);
            } else {
                issues.push(`L${it.line} 段序倒退：'${lastLabel}'(${lastNo}) -> '${it.seg}'(${no})（'${it.text.slice(0, 40)}'）`);
            }
        }
        lastNo = no;
        lastLabel = it.seg;
    }

    // define 组内相对顺序：存在项须为 Options→Props→Emits→Slots 的有序子序列（允许缺 defineEmits/defineSlots）
    let defineCursor = -1;
    for (const d of defineItems) {
        const idx = Object.keys(DEFINE_SUB).indexOf(d.name);
        if (idx === -1) continue;
        if (idx < defineCursor) {
            issues.push(`L${d.line} define 组内顺序违规：'define${d.name}' 位置错乱（权威顺序 Options→Props→Model→Emits→Slots）`);
        } else {
            defineCursor = idx;
        }
    }

    // docstring = 首个 define 之前记录的第一个顶层块注释
    if (state.firstDefineIdx !== -1 && state.blockCommentStarts.length) {
        const firstDoc = state.blockCommentStarts[0];
        if (firstDoc >= state.firstDefineIdx) {
            issues.push(`组件 docstring 应在 defineOptions 之前（当前块注释起始第 ${firstDoc+1} 行，首个 define 第 ${state.firstDefineIdx+1} 行）`);
        }
    }
    return issues;
}

/* ------------------------------------------------------------------ *
 * --fix 自动修复引擎（对应 check* 的机械可逆转换）
 *
 * 追加规则方法：新增一条 fix* 函数并在 FIXERS 数组注册即可。
 *   FIXERS = [ { label, apply(src) -> src } ]
 * 约定：行级别的转换须与本文件顶部的 check* 保持"检测即修复"语义——
 *       未配 fixer 的 check（import/detail/baretxt/emit）默认只 report（语义项进 ledger，绝不静默猜改）。
 * 不变量：fixer 不得改变原文件的行尾风格——新增行一律用 detectEol()；凡按行 split 后重组的，
 *       必须还原尾随换行（split('\n') 末元素为空串即原文以换行结尾），否则 CRLF 文件末行残留的
 *       "\r" 会与后随标签粘成孤立 CR（git 视作二进制 → 整文件 diff 噪声，批量 --fix 污染 38 文件事故）。
 * ------------------------------------------------------------------ */
const FIXERS = [
    { label: 'ref-decl',      apply: (src) => fixRefDeclSafe(src) },
    { label: 'slots-use',     apply: (src) => fixSlotsUseSafe(src) },
    { label: 'script-order',  apply: (src) => fixScriptOrderSafe(src) },
    { label: 'bem-bare',      apply: (src) => fixBemBareSafe(src) },
    { label: 'props-prefix',  apply: (src) => fixTemplatePropsSafe(src) },
    { label: 'px-addUnit',    apply: (src) => fixPxConcatSafe(src) },
    { label: 'style-camel',   apply: (src) => fixStyleCamelSafe(src) },
    { label: 'hover-imp',     apply: (src) => fixHoverImpSafe(src) },
    { label: 'attr-order',    apply: (src) => fixTemplateAttrOrderSafe(src) },
    { label: 'value-array',   apply: (src) => fixValueArraySafe(src) },
    // docstring 必须最后落位：script-order 会把 import 后的 docstring 当 hooks 段
    // （const bem）的 lead 又排回 defineOptions 之后（ux-checkbox 事故），故排末尾兜底
    { label: 'docstring',     apply: (src) => fixDocstringSafe(src) }
];

/**
 * 模板属性顺序修复：对主模板每个开标签做规范化（见 formatOpenTag）。
 * 机械可逆：只重排属性顺序与换行排版，不改属性名与值。
 */
function fixTemplateAttrOrderSafe(source) {
    const tmpl = extractTemplate(source);
    if (!tmpl) return source;
    const { body, open, close, index: openIdx, endIndex } = tmpl;
    // 修复目标行尾 = 全文件主导行尾；标签区与区间空白统一收敛，避免混行尾反复违规
    const eol = detectEol(source);
    const norm = (chunk) => chunk.replace(/\r\n|\r|\n/g, eol);
    const out = [];
    let last = 0;
    for (const tag of scanTags(body)) {
        const { attrs } = parseOpenTag(tag.raw);
        if (attrs.length === 0) continue;
        const lineStart = body.lastIndexOf('\n', tag.start) + 1;
        const indent = body.slice(lineStart, tag.start);
        const expected = formatOpenTag(tag.raw, indent, eol);
        if (expected === tag.raw) continue;
        out.push(norm(body.slice(last, tag.start)));
        out.push(expected);
        last = tag.end;
    }
    if (!out.length) return source;
    out.push(norm(body.slice(last)));
    // open 与 close 必须保留（body 只是 <template> 与 </template> 之间的内容）
    return source.slice(0, openIdx) + open + out.join('') + close + source.slice(endIndex);
}

/**
 * 绑定值数组拆行修复：整段单行的 ≥3 元素数组 → 拆行（`[` 居属性行末、每元素独占一行
 * 缩进 +4、`]` 与属性同缩进、末元素无尾逗号）。仅处理整段单行；已含换行（半拆/内嵌折行）
 * 不猜改，交 report。安全网：拆行前后"去空白字符序列"必须一致，否则整体跳过。
 */
function fixValueArraySafe(source) {
    const tm = extractTemplate(source);
    if (!tm) return source;
    const ranges = commentRanges(tm.body);
    const nl = detectEol(source);
    let changed = false;
    const nb = tm.body.replace(/(:class|:style|v-bind:class|v-bind:style)(\s*=\s*")([^"]*)(")/g, (whole, attr, pre, val, quote, offset) => {
        if (inCommentRanges(offset, ranges)) return whole;
        const t = val.trim();
        if (!t.startsWith('[') || !t.endsWith(']')) return whole;
        const inner = t.slice(1, -1);
        if (inner.includes('\n')) return whole; // 半拆/已拆：仅报告，不自动改
        const segs = splitTopLevel(inner);
        if (segs.length < 3) return whole;
        const lineStart = tm.body.lastIndexOf('\n', offset) + 1;
        const attrIndent = /^[\s]*/.exec(tm.body.slice(lineStart, offset))[0];
        const pad = attrIndent + '    ';
        const elems = segs.map((s) => s.text.trim());
        const out = '[' + nl + elems.map((e, i) => pad + e + (i < elems.length - 1 ? ',' : '')).join(nl) + nl + attrIndent + ']';
        if (out.replace(/\s+/g, '') !== t.replace(/\s+/g, '')) return whole; // 安全网：仅允许空白差异
        changed = true;
        return attr + pre + out + quote;
    });
    return changed ? source.slice(0, tm.index + tm.open.length) + nb + source.slice(tm.endIndex - tm.close.length) : source;
}

/** 提取 withDefaults 默认键集合 + 顶层 const 遮蔽集合（供 props 前缀修复判定） */
function getPropMeta(script) {
    const propSet = new Set();
    const constSet = new Set();
    const wd = script.match(/withDefaults\(\s*defineProps<[^>]*>\(\s*\)\s*,\s*\{([\s\S]*?)\n\s*\}\)/);
    if (wd) for (const m of wd[1].matchAll(/([\w$]+)\s*:/g)) propSet.add(m[1]);
    for (const m of script.matchAll(/^\s*const\s+([\w$]+)\s*=/gm)) constSet.add(m[1]);
    return { propSet, constSet };
}

/**
 * 重写"绑定表达式"，把未被遮蔽、非对象 key 的裸 prop 加 props. 前缀。
 * 字符串字面量原样保留（拆段处理），避免误改 'title' 这类文案。
 */
function rewriteExpr(expr, propSet, constSet) {
    const parts = [];
    let i = 0;
    const n = expr.length;
    while (i < n) {
        const ch = expr[i];
        if (ch === "'" || ch === '"' || ch === '`') {
            let j = i + 1;
            while (j < n) {
                if (expr[j] === '\\') { j += 2; continue; }
                if (expr[j] === ch) { j++; break; }
                j++;
            }
            parts.push({ code: false, text: expr.slice(i, j) });
            i = j;
        } else {
            let j = i;
            while (j < n && expr[j] !== "'" && expr[j] !== '"' && expr[j] !== '`') j++;
            parts.push({ code: true, text: expr.slice(i, j) });
            i = j;
        }
    }
    let out = '';
    for (const p of parts) {
        if (!p.code) { out += p.text; continue; }
        out += p.text.replace(/\b([A-Za-z_$][\w$]*)\b/g, (all, id, off) => {
            if (id.startsWith('$')) return all;
            if (!propSet.has(id) || constSet.has(id)) return all;
            const pre = p.text.slice(0, off);
            const after = p.text.slice(off + id.length);
            // 已是 props.x / obj.x（点号访问）→ 不动
            if (/\w\.\s*$/.test(pre)) return all;
            // 对象 key（key: value）→ 不动；值位（{ key: margin }）须改写（ux-search 教训，
            // 不能用"前有冒号"判定——值位与三元结果位同样前有冒号）
            if (/^\s*:/.test(after)) return all;
            return 'props.' + id;
        });
    }
    return out;
}

/** 模板 props 前缀修复：只改 {{ }} 与 :/@/v- 绑定属性的表达式 */
function fixTemplatePropsSafe(source) {
    const sm = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/);
    const tm = extractTemplate(source);
    if (!sm || !tm) return source;
    const { propSet, constSet } = getPropMeta(sm[1]);
    if (!propSet.size) return source;
    const map = (e) => rewriteExpr(e, propSet, constSet);
    let nb = tm.body.replace(/\{\{([\s\S]*?)\}\}/g, (m, e) => '{{' + map(e) + '}}');
    nb = nb.replace(/(@[a-zA-Z][\w.:-]*\s*=\s*")([^"]*)(")/g, (m, p, e, q) => p + map(e) + q);
    nb = nb.replace(/(:[a-zA-Z][\w.:-]*\s*=\s*")([^"]*)(")/g, (m, p, e, q) => p + map(e) + q);
    nb = nb.replace(/(\bv-[\w.:-]+\s*=\s*")([^"]*)(")/g, (m, p, e, q) => p + map(e) + q);
    return source.slice(0, tm.index) + tm.open + nb + tm.close + source.slice(tm.endIndex);
}

/** 提取成员链前缀起始索引：dotIdx 指向链中 '.'，向左并入 `a.b` / `x().y` / `(a).b` 整条链 */
function memberChainStart(code, dotIdx) {
    let i = dotIdx - 1;
    while (i >= 0 && /\s/.test(code[i])) i--;
    while (i >= 0) {
        if (/[\w$]/.test(code[i])) {
            while (i >= 0 && /[\w$]/.test(code[i])) i--;
            continue;
        }
        if (code[i] === '.') { i--; continue; }
        if (code[i] === ')') return extractPxOperand(code, i + 1); // 链中含调用：x().y
        break;
    }
    return i + 1;
}

/** 提取 `+ 'px'` 左侧完整表达式操作数的起始索引。
 * 支持链式调用 `(x).foo().bar()`、属性链 `a.b.toString()`、函数调用 `foo(x)`、纯括号 `(x)`；
 * 配对失败返回 -1（不修）。修复 `(expr).toString() + 'px'` 被截成 `()`、`x.y.toString()` 漏修的链式事故。 */
function extractPxOperand(code, end) {
    let pos = end - 1;
    while (pos >= 0 && /\s/.test(code[pos])) pos--;
    if (pos < 0) return -1;
    if (code[pos] !== ')') return -1; // 仅括号表达式走本函数
    let depth = 0;
    let k = pos;
    while (k >= 0) {
        const ch = code[k];
        if (ch === ')') depth++;
        else if (ch === '(') { depth--; if (depth === 0) break; }
        k--;
    }
    if (k < 0) return -1; // 括号未配对：不猜
    let j = k - 1;
    while (j >= 0 && /\s/.test(code[j])) j--;
    if (j >= 0 && /[\w$]/.test(code[j])) {
        while (j >= 0 && /[\w$]/.test(code[j])) j--; // 跳过调用名
        if (j >= 0 && code[j] === '.') return memberChainStart(code, j); // 链：并入链前缀
        return j + 1;
    }
    if (j >= 0 && code[j] === ')') return extractPxOperand(code, j + 1); // 调用者本身是调用：foo()(...)
    return k; // 纯括号表达式
}

/** 单行 px 拼接修复：X + 'px' → $u.addUnit(X)（X 指标识符/点号链/括号表达式/调用链） */
function fixPxLine(code) {
    const re = /\+\s*("px"|'px')/g;
    let out = '';
    let last = 0;
    let m;
    while ((m = re.exec(code))) {
        const plusIdx = m.index;
        let opEnd = plusIdx;
        while (opEnd > 0 && /\s/.test(code[opEnd - 1])) opEnd--;
        let start;
        if (opEnd > 0 && code[opEnd - 1] === ')') {
            start = extractPxOperand(code, opEnd);
        } else {
            let k = opEnd - 1;
            while (k >= 0 && /[\w$.\]]/.test(code[k])) k--;
            start = k + 1;
        }
        if (start < 0) { out += code.slice(last, plusIdx + m[0].length); last = plusIdx + m[0].length; continue; }
        const operand = code.slice(start, opEnd);
        out += code.slice(last, start) + '$u.addUnit(' + operand + ')';
        last = plusIdx + m[0].length;
    }
    out += code.slice(last);
    return out;
}

/** 全文件 px 修复：按行做，跳过 // 行注释，避免改注释文案 */
function fixPxConcatSafe(source) {
    return source.split('\n').map((line) => {
        const ci = line.search(/\/\//);
        const code = ci === -1 ? line : line.slice(0, ci);
        const cmt = ci === -1 ? '' : line.slice(ci);
        return fixPxLine(code) + cmt;
    }).join('\n');
}

/**
 * 段内注入：把声明行插入 script 中首个命中 segTargets 段次的顶层语句之前。
 * 段次取 classify() 的段标签（如 constvar/computed/watch/cycle/function/expose）。
 * 用于注入 ref 声明（constvar 段）与 hasXSlot computed（computed 段）而不破坏 10 段序。
 */
function injectAtSegment(script, decls, segTargets) {
    if (!decls.length) return script;
    const lines = script.split('\n');
    const { depths } = computeDepths(lines);
    let insertIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (depths[i] === 0) {
            const seg = classify(lines[i].trim());
            if (segTargets.includes(seg)) { insertIdx = i; break; }
        }
    }
    if (insertIdx === -1) insertIdx = lines.length;
    lines.splice(insertIdx, 0, ...decls.flatMap((d) => ['', d])); // 顶层声明顶格，不缩进
    return lines.join('\n');
}

/**
 * 模板 ref 声明补齐修复（spec 02）：checkTemplateRefs 报缺失的静态 ref="xxx"，
 * 按模板 ref 名补 `const {name} = shallowRef<UniElement | null>(null)`（模板 ref 名即声明名，机械确定）。
 * 类型假设 UniElement（元素 ref 为绝对多数）；若某组件 ref 实际绑定组件实例，由 H5 编译暴露 → 还原并进 ledger。
 */
function fixRefDeclSafe(source) {
    const missing = checkTemplateRefs(source);
    if (!missing.length) return source;
    const names = missing.map((issue) => (issue.match(/ref="([^"]+)"/) || [])[1]).filter(Boolean);
    if (!names.length) return source;
    const decls = names.map((n) => `const ${n} = shallowRef<UniElement | null>(null);`);
    const s = source.match(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/);
    if (!s) return source;
    const [full, open, body, close] = s;
    return source.slice(0, s.index) + open + injectAtSegment(body, decls, ['constvar', 'computed', 'watch', 'cycle', 'function', 'expose']) + close + source.slice(s.index + full.length);
}

/**
 * 移除 defineSlots 声明语句（含 <泛型> 与 () 与尾部 ;，跨行）。
 * 平衡扫描 `<...>`（跳过箭头 => 的 >）与 `(...)`；扫描失败（不平衡）返回 null 交上层不猜。
 */
function removeDefineSlots(script) {
    const start = script.indexOf('defineSlots');
    if (start === -1) return script;
    let lineStart = start;
    while (lineStart > 0 && script[lineStart - 1] !== '\n') lineStart--;
    let i = start + 'defineSlots'.length;
    const skipWs = () => { while (i < script.length && /\s/.test(script[i])) i++; };
    const matchDelimited = (open, close) => {
        if (script[i] !== open) return null;
        let depth = 0;
        while (i < script.length) {
            const ch = script[i];
            if (ch === close && script[i - 1] === '=') { i++; continue; } // 箭头函数类型 => 的 > 不计
            if (ch === open) depth++;
            else if (ch === close) { depth--; if (depth === 0) { i++; return true; } }
            i++;
        }
        return null;
    };
    skipWs();
    if (script[i] === '<') { if (matchDelimited('<', '>') === null) return null; skipWs(); }
    if (script[i] === '(') { if (matchDelimited('(', ')') === null) return null; skipWs(); }
    if (script[i] === ';') i++;
    while (i < script.length && script[i] !== '\n') i++;
    if (i < script.length) i++; // 吃掉行尾换行
    return script.slice(0, lineStart) + script.slice(i);
}

/**
 * 插槽检测修复（spec 01）：
 * - defineSlots 声明 → 整体移除（运行期无副作用，类型声明交由模板 <slot> 表达）；
 * - `slots.x` 点号访问 → `slots['x']` 方括号；
 * - 每个 slots['x'] 访问缺规范命名判定 computed（hasXSlot = slots['x'] != null）→ 在 computed 段补齐。
 */
function fixSlotsUseSafe(source) {
    const s = source.match(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/);
    if (!s) return source;
    const [full, open, body, close] = s;
    let script = body;
    if (/defineSlots\b/.test(script)) {
        const removed = removeDefineSlots(script);
        if (removed === null) return source; // 扫描失败，不猜
        script = removed;
    }
    const slotsVar = script.match(/const\s+(\w+)\s*=\s*useSlots\(\)/)?.[1];
    if (slotsVar) {
        const dotRe = new RegExp(`\\b${slotsVar}\\s*\\.\\s*([A-Za-z_$][\\w$]*)`, 'g');
        script = script.replace(dotRe, (m, name) => `${slotsVar}['${name}']`);
        const accessRe = new RegExp(`${slotsVar}\\s*\\[\\s*['"]([\\w-]+)['"]\\s*\\]`, 'g');
        const accessed = new Set();
        let m;
        while ((m = accessRe.exec(script))) accessed.add(m[1]);
        const addDecls = [];
        for (const name of accessed) {
            const pascal = name.split('-').map((x) => (x ? x[0].toUpperCase() + x.slice(1) : x)).join('');
            const expected = 'has' + pascal + 'Slot';
            if (!new RegExp(`const\\s+${expected}\\s*=\\s*computed`).test(script)) {
                addDecls.push(`const ${expected} = computed((): boolean => ${slotsVar}['${name}'] != null);`);
            }
        }
        if (addDecls.length) script = injectAtSegment(script, addDecls, ['watch', 'cycle', 'function', 'expose']);
    } else if (/\bslots\s*(?:\[['"]|\.\s*[A-Za-z_$])/.test(script)) {
        // 有插槽访问但缺 useSlots 声明 → 在 hooks 段补声明（与 check 的 slotsVar 缺省名 slots 一致）
        script = injectAtSegment(script, ['const slots = useSlots()'], ['constvar', 'computed', 'watch', 'cycle', 'function', 'expose']);
    }
    if (script === body) return source;
    return source.slice(0, s.index) + open + script + close + source.slice(s.index + full.length);
}

/**
 * 内联样式键 camelCase → 连字符修复（spec 06）：`style['borderRadius']` / `style.borderRadius`
 * → `style['border-radius']`。仅独立 style 变量（前界非 \w.$，customStyle.xxx 等外部对象不动），
 * 复用 HYPHEN_CSS_KEYS 映射，与 checkCamelStyleKeys 语义一致。
 */
function fixStyleCamelSafe(source) {
    let changed = false;
    const out = source.replace(/(\bstyle\s*)(?:\[(['"])([A-Za-z_$][\w]*)\2\]|\.([A-Za-z_$][\w]*))/g, (m, style, q, bk, dot, offset) => {
        if (offset > 0 && /[\w.$]/.test(source[offset - 1])) return m;
        const key = bk ?? dot;
        const hyphen = HYPHEN_CSS_KEYS[key];
        if (!hyphen) return m;
        changed = true;
        return `${style}['${hyphen}']`;
    });
    return changed ? out : source;
}

/**
 * hover 反馈类 !important 补齐修复（spec 06）：`.ux-{ns}--hover` 规则块缺 !important 时，
 * 为块内每条声明补 ` !important`（覆盖根节点内联背景优先级；与 checkHoverClassImportant 一一对应）。
 */
function fixHoverImpSafe(source) {
    const tm = extractTemplate(source);
    if (!tm || !/:?hover-class\b/.test(tm.body)) return source;
    const ns = source.match(/useBEM\(\s*['"]([\w-]+)['"]\s*\)/)?.[1];
    const comp = ns ?? source.match(/defineOptions\(\s*\{\s*name:\s*['"](?:ux-)?([\w-]+)['"]/)?.[1];
    if (!comp) return source;
    let changed = false;
    const out = source.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/g, (whole, attr, body) => {
        const selRe = new RegExp(`(\\.ux-${comp}--hover\\b[^{]*\\{)([^}]*)(\\})`, 'g');
        const nb = body.replace(selRe, (m, open, decl, close) => {
            if (!decl.trim() || /!important\b/.test(decl)) return m;
            changed = true;
            const fixed = decl.replace(/([A-Za-z-][\w-]*)\s*:\s*([^;}]+?)\s*(?=;|$)/g, (d, prop, val) => `${prop}: ${val} !important`);
            return open + fixed + close;
        });
        return nb === body ? whole : `<style${attr}>${nb}</style>`;
    });
    return changed ? out : source;
}

/**
 * 组件 docstring 落位修复：把"首个顶层块注释（组件 docstring）"移动到 import 段之后、
 * 首个 define 之前。若本就在 define 前则不动。安全网同 fixScriptOrderSafe（括号平衡 +
 * 非空白行多重集合一致才写盘）。此修复与 verifyScript 的 docstring 检查一一对应。
 */
function fixDocstringSafe(source) {
    const s = source.match(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/);
    if (!s) return source;
    const [full, open, body, close] = s;
    const lines = body.split('\n');
    const n = lines.length;
    let depth = 0;
    let docStart = -1, docEnd = -1, firstDefine = -1, importEnd = -1;
    let inDoc = false;
    for (let i = 0; i < n; i++) {
        const t = lines[i].trim();
        if (inDoc) {
            if (t.includes('*/')) {
                inDoc = false;
                // 只锁首个块注释（组件 docstring）的闭合；后续 computed/函数前的块注释
                // 不得覆盖 docEnd（否则会把 docstring 到文件尾整段误当 docstring 搬走，ux-checkbox 事故）
                if (docEnd === -1) docEnd = i;
            }
            continue;
        }
        if (t.startsWith('/**') || t.startsWith('/*')) {
            inDoc = !t.includes('*/');
            if (depth === 0 && t.startsWith('/**') && docStart === -1) docStart = i;
            if (!inDoc && depth === 0 && t.startsWith('/**') && docStart === i) docEnd = i; // /** */ 单行闭合
            continue;
        }
        if (depth === 0) {
            if (firstDefine === -1 && DEFINE_RE.test(t)) firstDefine = i;
            if (firstDefine === -1 && /^import\b/.test(t)) importEnd = i;
        }
        depth += braceDelta(lines[i]);
        if (depth < 0) depth = 0;
    }
    if (docStart === -1 || docEnd === -1 || firstDefine === -1) return source;
    if (docStart < firstDefine) return source; // 已合法
    const docLines = lines.slice(docStart, docEnd + 1);
    const rest = [...lines.slice(0, docStart), ...lines.slice(docEnd + 1)];
    const insertAt = importEnd + 1;
    const newLines = [...rest.slice(0, insertAt), ...docLines, ...rest.slice(insertAt)];
    const norm = (l) => l.trim();
    const oldSet = lines.filter((l) => norm(l)).map(norm).sort();
    const newSet = newLines.filter((l) => norm(l)).map(norm).sort();
    if (oldSet.join('\x01') !== newSet.join('\x01')) return source;
    return source.slice(0, s.index) + open + newLines.join('\n') + close + source.slice(s.index + full.length);
}

/**
 * BEM 裸类修复：把模板 class 属性值内硬编码的组件自身 BEM 类（`ux-块__元素--修饰` 等）
 * 替换为 `bem.b/e/m/em(...)` 调用。块名取自 defineOptions.name（去 `ux-` 前缀）。
 * 确定性映射、token 级替换（同 props/px 先例，不做多重集合安全网，因为修复本就要改 token 内容）：
 *   ux-块                      -> bem.b()
 *   ux-块--mod                 -> bem.m('mod')
 *   ux-块__elem                -> bem.e('elem')
 *   ux-块__elem--mod           -> bem.em('elem','mod')
 * 无法解析（如单字符串含多个类）或块名取不到 -> 原样保留，交由 report/交互兜底，绝不猜改。
 */
function fixBemBareSafe(source) {
    const sm = source.match(/defineOptions\(\s*\{\s*name:\s*['"](?:ux-)?([\w-]+)['"]/);
    if (!sm) return source;
    const comp = sm[1];
    const tm = extractTemplate(source);
    if (!tm) return source;
    const block = 'ux-' + comp;
    const esc = comp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const bemCall = (rest) => {
        let m;
        if (!rest) return `bem.b()`;
        if ((m = rest.match(/^--([\w-]+)$/))) return `bem.m('${m[1]}')`;
        if ((m = rest.match(/^__([\w-]+)$/))) return `bem.e('${m[1]}')`;
        if ((m = rest.match(/^__([\w-]+)--([\w-]+)$/))) return `bem.em('${m[1]}','${m[2]}')`;
        return null;
    };
    const pat = new RegExp(`(["'])(ux-${esc}(?:--[\\w-]+|__[\\w-]+(?:--[\\w-]+)?)?)(["'])`, 'g');
    const nb = tm.body.replace(/([\w:.-]*\bclass)\s*=\s*"([^"]*)"/g, (whole, kw, val) => {
        const replaced = val.replace(pat, (m, q1, cls, q2) => {
            const call = bemCall(cls.slice(block.length));
            return call || m; // null -> 保留原样（复杂形态，不猜）
        });
        return whole === val ? whole : kw + '="' + replaced + '"';
    });
    return nb === tm.body ? source : source.slice(0, tm.index) + tm.open + nb + tm.close + source.slice(tm.endIndex);
}

const SEG_RANK = { define: 1, hooks: 2, constvar: 3, computed: 4, watch: 5, cycle: 6, function: 7, expose: 8, other: 9 };
const DEFINE_SUB = { Options: 0, Props: 1, Model: 2, Emits: 3, Slots: 4 };
const REAL_SEG = new Set([...Object.keys(SEG_RANK), 'import']);

/**
 * 段序重排修复：把 <script setup> 顶层语句按 10 段规范重排（define 组内再按 Options/Props/Model/Emits/Slots）。
 * 安全网：仅当脚本括号平衡且重排后"非空白行多重集合"与原文完全一致才写盘，否则整体跳过（绝不误改）。
 * 词法注记：`const bem = useBEM(...)` 归 hooks；函数/类各以 depth 边界切整段，连带其上一级块注释。
 */
function fixScriptOrderSafe(source) {
    const s = source.match(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/);
    if (!s) return source;
    const [full, open, body, close] = s;
    const lines = body.split('\n');
    const n = lines.length;
    const { depths, netDeltas, finalDepth } = computeDepths(lines); // 全括号深度（含 ()[]{} 与注释/字符串剥离）
    const depthOf = depths;
    const segOf = new Array(n);
    for (let i = 0; i < n; i++) {
        const t = lines[i].trim();
        segOf[i] = depthOf[i] === 0 ? classify(t) : 'other';
    }
    if (finalDepth !== 0) return source; // 括号不平衡：跳过
    const imports = [];
    const stmts = [];
    let cur = null;
    let lead = [];
    for (let i = 0; i < n; i++) {
        const t = lines[i];
        if (depthOf[i] !== 0) { if (cur) cur.body.push(t); continue; }
        const tt = t.trim();
        if (!tt) continue;
        const seg = segOf[i];
        if (seg === 'other') {
            // 条件编译闭合行（// #endif、// #else）绑定到上一条语句尾随，随语句整体重排，
            // 避免作为下条语句 lead 漂移破坏 #ifdef/#endif 配对（ux-circle-progress H5 500 事故）
            if (cur && /^\/\/\s*(?:#endif|#else)\b/.test(tt)) {
                cur.body.push(t);
                continue;
            }
            // 跨行字符串续行：depth-0 且以引号开头的行（如 base64 常量 `const x =` + 下一行 `'data:...'`）
            // 是上一条语句的字符串字面量续行，并入其 body 防止被当成下条语句 lead 拆断（ux-avatar 事故）
            if (cur && /^['"`]/.test(tt)) {
                cur.body.push(t);
                continue;
            }
            lead.push(t);
            // depth-0 的 'other' 行若自身净开括号 > 0（如 `type X = {`、`linkChildren({`），
            // 其括号体续行（行首深度 > 0）必须整体并入 lead 保持原状——否则 cur 为 null 时
            // 续行会被上方 depth 分支直接丢弃，造成头体分离（ux-form 事故）
            if ((netDeltas[i] ?? 0) > 0) {
                let k = i + 1;
                while (k < n && depthOf[k] > 0) {
                    lead.push(lines[k]);
                    k++;
                }
                i = k - 1;
            }
            continue;
        }
        if (seg === 'import') { imports.push(t); cur = null; continue; }
        if (cur) stmts.push(cur);
        cur = { seg, body: [lines[i]], lead: lead.slice() }; // 语句首行须入 body
        lead = [];
        let len = 1;
        for (let k = i + 1; k < n; k++) {
            // 续行/参数行在行首括号深度必 > 0（ux-button watch 事故：'other' 会误断语句，
            // 必须用深度 0 判定语句结束；深度 0 的 'other' 行由外层循环归入下条语句 lead）
            if (depthOf[k] === 0) break;
            cur.body.push(lines[k]);
            len++;
        }
        i += len - 1; // 定位到下一条语句头（外层 for 还会 i++），避免跳过头部行
    }
    if (cur) stmts.push(cur);
    const tailLead = lead; // 文件尾残余 lead（如条件编译闭合行 // #endif）无承接语句，须保留防止丢行

    const keyOf = (st) => {
        if (st.seg === 'define') {
            const sub = (st.body[0] || '').match(DEFINE_RE)?.[1];
            return [SEG_RANK.define, DEFINE_SUB[sub] ?? 9];
        }
        return [SEG_RANK[st.seg] ?? 99, -1];
    };
    const ordered = stmts
        .map((st, idx) => ({ ...st, _i: idx }))
        .sort((a, b) => {
            const ka = keyOf(a), kb = keyOf(b);
            return ka[0] !== kb[0] ? ka[0] - kb[0] : (ka[1] !== kb[1] ? ka[1] - kb[1] : a._i - b._i);
        });

    const outLines = imports.slice();
    if (outLines.length) outLines.unshift(''); // 保留 <script> 开标签后的首个换行(不粘连 import)
    ordered.forEach((st, idx) => {
        if (outLines.length) outLines.push('');
        if (st.lead.length) outLines.push(...st.lead);
        outLines.push(...st.body);
    });
    if (tailLead.length) outLines.push(...tailLead); // 文件尾残余 lead 保持原位（紧跟末语句）
    // 安全网：非空白行多重集合须一致
    const norm = (l) => l.trim();
    const oldSet = lines.filter((l) => norm(l)).map(norm).sort();
    const newSet = outLines.filter((l) => norm(l)).map(norm).sort();
    if (oldSet.join('\x01') !== newSet.join('\x01')) return source;
    // 尾随换行必须还原：body.split('\n') 末元素为空串即原文以换行结尾，而重排只收集非空行，
    // 不补回末行 "\n" 会让末行残留的 "\r" 与 </script> 粘成孤立 CR（历史批量 --fix 的行尾污染根因）
    const newBody = outLines.join('\n') + (lines[n - 1] === '' ? '\n' : '');
    return source.slice(0, s.index) + open + newBody + close + source.slice(s.index + full.length);
}

/** 应用全部已注册 FIXERS，返回 newSrc 与是否发生变更 */
function applyFixes(source) {
    let out = source;
    for (const f of FIXERS) out = f.apply(out);
    return out;
}

/* ------------------------------------------------------------------ *
 * 非确定性违规（当前为模板 ref 缺失）交互询问框架（GATING 交互约定）：
 *   --fix --ask 且交互终端时，对每个缺失项弹窗询问；非 TTY / 多目标 降级为纯 report。
 *   "不猜"是硬原则：拿不定就弹出选项让用户裁定，绝不静默补值。
 * ------------------------------------------------------------------ */

/** 在 script 的 constvar 段首之前注入 ref 声明（委托 injectAtSegment，保持段序） */
function injectRefs(script, decls) {
    return injectAtSegment(script, decls, ['constvar', 'computed', 'watch', 'cycle', 'function', 'expose']);
}

/** 把 ref 声明注入到整个 source 的 <script> 块内 */
function insertRefDecls(source, decls) {
    if (!decls.length) return source;
    const s = source.match(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/);
    if (!s) return source;
    const [full, open, body, close] = s;
    return source.slice(0, s.index) + open + injectRefs(body, decls) + close + source.slice(s.index + full.length);
}

/** 交互询问单个缺失 ref 的修复类型；非 TTY 返回 ''（不交互，仅 report） */
async function askRef(name) {
    if (!process.stdin.isTTY) return '';
    return new Promise((resolve) => {
        const rl = createInterface({ input: process.stdin, output: process.stdout });
        rl.question(
            `\n[交互] 模板 ref="${name}" 在 <script> 中无声明（运行时不加则会 not defined）。如何修？\n` +
            `  1) 元素 ref   const ${name} = shallowRef<UniElement | null>(null)\n` +
            `  2) 组件/泛型 const ${name} = shallowRef<UTSJSONObject | null>(null)\n` +
            `  0) 跳过本次  保留为 report\n` +
            `  输入 [0/1/2] 默认 1：`,
            (ans) => {
                rl.close();
                const v = (ans || '1').trim();
                if (v === '2') resolve('UTSJSONObject');
                else if (v === '0') resolve('');
                else resolve('UniElement');
            }
        );
    });
}

/** --ask 交互：对 ref 缺失项逐项询问并汇成待注入声明 */
async function askResolveRefs(fixedSrc) {
    const decls = [];
    for (const issue of checkTemplateRefs(fixedSrc)) {
        const name = (issue.match(/ref="([^"]+)"/) || [])[1];
        if (!name) continue;
        const type = await askRef(name);
        if (type) decls.push(`const ${name} = shallowRef<${type} | null>(null)`);
    }
    return decls;
}

async function main() {
    const args = process.argv.slice(2);
    let files = [];
    let components = [];
    let baselinePath = process.env.UX_VERIFY_BASELINE || join(__dirname, 'verify-baseline.json');
    let fix = false;
    let ask = false;
    let totalFixed = 0;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--uni') components.push(args[++i]);
        else if (args[i] === '--baseline') baselinePath = args[++i];
        else if (args[i] === '--fix') fix = true;
        else if (args[i] === '--ask') ask = true;
        else files.push(args[i]);
    }
    // 无显式目标（--uni/文件）时默认全库扫描；单独 --fix 即全库批量修复
    const scanAll = files.length === 0 && components.length === 0;
    const baseline = loadBaseline(baselinePath);

    let targets = files.slice();
    if (scanAll || components.length) {
        const list = readdirSync(componentsBase);
        const dirs = components.length ? list.filter((d) => /^ux-[\w-]+$/.test(d) && components.includes(d)) : list.filter((d) => /^ux-[\w-]+$/.test(d));
        for (const d of dirs) {
            const f = join(componentsBase, d, `${d}.uvue`);
            try { accessSync(f); } catch { continue; }
            targets.push(f);
        }
    }

    let totalFail = 0;
    for (const f of targets) {
        let src = readFileSync(f, 'utf8');
        const name = basename(f, '.uvue');
        if (fix) {
            const fixed = applyFixes(src);
            if (fixed !== src) {
                // 括号平衡守卫：原文平衡而修复后失衡 → 修复器产出坏代码，拒绝写盘（ux-button 教训兜底网）
                const badBefore = checkBracketBalance(src).length;
                const badAfter = checkBracketBalance(fixed).length;
                if (!badBefore && badAfter) {
                    console.log(`\n${basename(f)}  ✗ 修复产物括号不平衡，已拒绝写盘（还原原文）`);
                    totalFail++;
                } else {
                    writeFileSync(f, fixed, 'utf8');
                    src = fixed;
                    totalFixed++;
                }
            }
        }
        if (fix && ask) {
            // 交互询问非确定性项（如模板 ref 缺失）后注入声明；非 TTY 时 askRef 返回 '' 自动降级为 report-only
            const decls = await askResolveRefs(src);
            if (decls.length) {
                const withRefs = insertRefDecls(src, decls);
                if (withRefs !== src) {
                    writeFileSync(f, withRefs, 'utf8');
                    src = withRefs;
                    totalFixed++;
                }
            }
        }
        const exempt = (baseline[name] || []).slice();
        // 组内检查：段序 + 模板 ref + props 显式 全从严；BEM 裸类 + px 拼接 受基线豁免
        const checks = [
            { label: 'script',  issues: verifyScript(src, f) },
            { label: 'balance', issues: checkBracketBalance(src) },
            { label: 'ref',     issues: checkTemplateRefs(src) },
            { label: 'props',   issues: checkTemplateProps(src) },
            { label: 'bem',     issues: checkBemBare(src) },
            { label: 'px',      issues: checkPxConcat(src) },
            { label: 'style',   issues: checkCamelStyleKeys(src) },
            { label: 'baretxt', issues: checkBareTextInView(src) },
            { label: 'slots',   issues: checkSlotDetection(src) },
            { label: 'emit',    issues: checkEmitForward(src) },
            { label: 'hover',   issues: checkHoverClassImportant(src) },
            { label: 'import',  issues: checkVueImports(src) },
            { label: 'detail',  issues: checkDetailAccess(src) },
            { label: 'attrord', issues: checkTemplateAttrOrder(src) },
            { label: 'valarr',  issues: checkValueArrayFormat(src) }
        ];
        let failed = false;
        const printed = [];
        for (const c of checks) {
            for (const i of c.issues) {
                const xi = exempt.indexOf(i);
                if (xi !== -1) {
                    exempt.splice(xi, 1);
                    printed.push(`  ≡ 基线豁免（${c.label}）${i}`);
                } else {
                    failed = true;
                    printed.push(`  ✗ ${i}`);
                }
            }
        }
        // 基线里声明了"已整改项"却未再现 → 属过期基线，提示清理
        for (const left of exempt) printed.push(`  ? 基线含未再出现的违规条目（可移出基线）：${left}`);

        if (printed.length) {
            console.log(`\n${basename(f)}`);
            for (const p of printed) console.log(p);
            if (failed) totalFail++;
        }
    }
    const fixNote = fix ? `，${totalFixed} 个文件已自动修复(--fix)` : '';
    console.log(`\n[verify-script-order] 扫描 ${targets.length} 个组件，${totalFail} 个不合规（基线源：${baselinePath}）${fixNote}`);
    process.exitCode = totalFail ? 1 : 0;
}

main();