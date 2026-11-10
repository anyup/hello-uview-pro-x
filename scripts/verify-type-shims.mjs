#!/usr/bin/env node
// 校验 types/global.uts 的「运行期占位」与纯类型是否一一对应（加密版插件必需）。
// 背景：加密版插件无法被本地编译器解析，消费方的类型导入会被原样保留成运行期导入；
//   - 对象型类型（右值为 { ... }）编译后是 UTSType 类，天然有运行期导出；
//   - 字面量联合 / 函数类型 / 纯别名编译后被完全擦除，没有运行期导出 → 必须补同名 const 占位，
//     否则 H5 运行期会报 `does not provide an export named 'xxx'`。
// 用法：
//   node scripts/verify-type-shims.mjs                  # 默认扫描 types/global.uts + libs 下全部 .uts
//   node scripts/verify-type-shims.mjs --file <path>    # 只查指定文件（自测用）
//   node scripts/verify-type-shims.mjs --json           # 机器可读输出
// 规则：
//   R1 纯类型缺少同名 const 占位（致命：加密版会运行期报错）
//   R2 对象型类型被加了同名 const（致命：会把自动生成的 UTSType 类导出顶掉）
//   R3 占位值没取该类型的字面量首成员（提示：不影响运行期，但降低可读性）
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = join(fileURLToPath(import.meta.url), '..');
const libRoot = join(__dirname, '../uni_modules/uview-pro-x');

const argv = process.argv.slice(2);
const json = argv.includes('--json');
const fileIdx = argv.indexOf('--file');

/** 默认扫描范围：全局类型文件 + libs 下全部 .uts（都经入口 export * 对外暴露） */
function collectTargets() {
    if (fileIdx !== -1) return [argv[fileIdx + 1]];
    const targets = [join(libRoot, 'types/global.uts')];
    const walk = (dir) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            const full = join(dir, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.name.endsWith('.uts')) targets.push(full);
        }
    };
    walk(join(libRoot, 'libs'));
    return targets;
}

function parseTypes(lines) {
    const types = [];
    for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(/^export type (\w+)\s*=\s*(.*)$/);
        if (!m) continue;
        const name = m[1];
        const line = i + 1;
        let body = m[2];
        while (!body.trim().endsWith(';') && i + 1 < lines.length) {
            i++;
            body += '\n' + lines[i];
        }
        const rhs = body.trim().replace(/;\s*$/, '').trim();
        types.push({ name, rhs, line, isObject: rhs.startsWith('{') });
    }
    return types;
}

/** 收集 export const 名字与所在行 */
function parseConsts(lines) {
    const consts = new Map();
    lines.forEach((text, i) => {
        const m = text.match(/^export const (\w+)\s*[:=]/);
        if (m) consts.set(m[1], { line: i + 1, text: text.trim() });
    });
    return consts;
}

function checkFile(target) {
    const src = readFileSync(target, 'utf8');
    const rel = relative(join(__dirname, '..'), target).replace(/\\/g, '/');
    const lines = src.split(/\r?\n/);
    const types = parseTypes(lines);
    const consts = parseConsts(lines);
    const pure = types.filter((t) => !t.isObject);

    const fatal = [];
    const warn = [];

    for (const t of pure) {
        if (!consts.has(t.name)) {
            fatal.push({
                rule: 'R1',
                line: t.line,
                message: `${t.name} 是纯类型（${t.rhs.split('\n')[0].trim().slice(0, 40)}…）但缺少同名 const 占位，加密版运行期会报 does not provide an export named`
            });
        }
    }
    for (const t of types.filter((x) => x.isObject)) {
        if (consts.has(t.name)) {
            fatal.push({
                rule: 'R2',
                line: consts.get(t.name).line,
                message: `${t.name} 是对象型类型（编译后为 UTSType 类），不得再加同名 const，否则会顶掉类导出`
            });
        }
    }
    for (const t of pure) {
        const c = consts.get(t.name);
        if (!c || !/=\s*null\s*;?\s*$/.test(c.text)) continue;
        const lit = t.rhs.match(/'([^']*)'/);
        if (lit) {
            warn.push({
                rule: 'R3',
                line: c.line,
                message: `${t.name} 的占位值为 null，建议取字面量首成员 '${lit[1]}'`
            });
        }
    }

    return { file: rel, types: types.length, pure: pure.length, fatal, warn };
}

function main() {
    const results = [];
    for (const target of collectTargets()) {
        try {
            results.push(checkFile(target));
        } catch (e) {
            console.error(`[verify-type-shims] 读取失败：${target}\n${e.message}`);
            process.exitCode = 1;
            return;
        }
    }

    const fatalCount = results.reduce((n, r) => n + r.fatal.length, 0);
    const warnCount = results.reduce((n, r) => n + r.warn.length, 0);
    const typeCount = results.reduce((n, r) => n + r.types, 0);
    const pureCount = results.reduce((n, r) => n + r.pure, 0);

    if (json) {
        console.log(JSON.stringify({ files: results }, null, 4));
    } else {
        for (const r of results) {
            for (const i of [...r.fatal, ...r.warn]) {
                console.log(`  ${i.rule === 'R3' ? '·' : '✗'} [${i.rule}] ${r.file}:${i.line} ${i.message}`);
            }
        }
        console.log(
            `\n[verify-type-shims] 扫描 ${results.length} 个文件 / ${typeCount} 个类型（纯类型 ${pureCount}，对象型 ${typeCount - pureCount}），` +
                `${fatalCount} 项不合规${warnCount ? `，${warnCount} 项提示` : ''}`
        );
    }
    process.exitCode = fatalCount ? 1 : 0;
}

main();
