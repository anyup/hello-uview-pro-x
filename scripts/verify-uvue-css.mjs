#!/usr/bin/env node
/**
 * uvue 样式平台兼容门禁
 *
 * 背景：uni-app x 的 App 端（uvue）CSS 只支持有限取值，例如 display 仅 flex 与 none。
 * 这类写法在 H5/小程序上正常工作，只在 App 编译期报警告（plugin:uni:app-uvue-css），
 * 很容易被忽略；本脚本把这类平台限制前移到静态检查。
 *
 * 判定范围：style 块内的声明，且该声明在 App 端会被编译（CSS 条件编译注释感知）：
 *   - ifdef APP / ifdef H5 || APP  → 校验
 *   - ifndef APP / ifdef H5        → 跳过（App 端不生效）
 *
 * 用法：
 *   node scripts/verify-uvue-css.mjs                  全量扫描，违规时退出码 1
 *   node scripts/verify-uvue-css.mjs --json           机器可读输出
 *   node scripts/verify-uvue-css.mjs --file xx.uvue   只扫单个文件（自测用）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCAN_DIRS = ['pages', 'components', 'uni_modules/uview-pro-x/components']
const SCAN_FILES = ['App.uvue']

// 条件编译中代表「App 端」的平台标识
const APP_FLAGS = ['APP', 'APP-PLUS', 'APP-ANDROID', 'APP-IOS', 'UNI-APP-X']

// 规则表：新增平台限制在这里追加即可（prop + App 端允许取值）
const RULES = [
	{
		prop: 'display',
		allowed: ['flex', 'none'],
		reason: 'App（uvue）display 仅支持 flex | none'
	}
]

/**
 * 条件编译表达式是否会让代码在 App 端生效
 * @param {string} expr 如 "APP"、"H5 || APP"、"MP-WEIXIN"
 * @param {'ifdef'|'ifndef'} kind
 */
function exprAppliesToApp(expr, kind) {
	const parts = expr
		.split('||')
		.map((s) => s.trim())
		.filter(Boolean)
	if (parts.length === 0) return true
	if (kind === 'ifdef') return parts.some((p) => APP_FLAGS.includes(p))
	// ifndef：只有否定全集 App 标识（APP / APP-PLUS）时才确定对 App 端不生效；
	// 形如 ifndef APP-ANDROID 仍会在 iOS 生效，保守继续校验
	return !(parts.length === 1 && (parts[0] === 'APP' || parts[0] === 'APP-PLUS'))
}

/** 递归收集 uvue 文件 */
function collectFiles() {
	const out = []
	for (const dir of SCAN_DIRS) {
		const abs = path.join(ROOT, dir)
		if (!fs.existsSync(abs)) continue
		const stack = [abs]
		while (stack.length > 0) {
			const cur = stack.pop()
			for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
				const full = path.join(cur, entry.name)
				if (entry.isDirectory()) stack.push(full)
				else if (entry.name.endsWith('.uvue')) out.push(full)
			}
		}
	}
	for (const file of SCAN_FILES) {
		const abs = path.join(ROOT, file)
		if (fs.existsSync(abs)) out.push(abs)
	}
	return out.sort()
}

/**
 * 扫描单个文件，返回违规列表
 * @returns {{line: number, prop: string, value: string, rule: object}[]}
 */
function scanFile(file) {
	const text = fs.readFileSync(file, 'utf8')
	const lines = text.split(/\r?\n/)
	const findings = []
	let inStyle = false
	// 条件编译栈：每帧记录「当前分支对 App 是否生效」
	const condStack = []
	// 声明块采集：按行记录（行号 + 该行对 App 是否生效），支持单行与多行写法，
	// 条件编译可出现在声明块内部，所以生效性必须逐行判定而非在块开头快照
	let depth = 0
	let bufLines = []

	// 结算一个属性块：逐行按分号拆声明（行号直接取该行，跨行值不在规则表覆盖范围内）
	const flush = () => {
		for (const l of bufLines) {
			if (!l.active) continue
			for (const seg of l.text.split(';')) {
				const decl = /^\s*([a-zA-Z-]+)\s*:\s*([\s\S]+?)\s*$/.exec(seg)
				if (decl == null) continue
				const prop = decl[1].toLowerCase()
				const rule = RULES.find((r) => r.prop === prop)
				if (rule == null) continue
				const value = decl[2].replace(/!important/gi, '').trim().toLowerCase()
				if (rule.allowed.includes(value)) continue
				findings.push({ line: l.line, prop, value, rule })
			}
		}
		bufLines = []
		depth = 0
	}

	for (let i = 0; i < lines.length; i++) {
		const raw = lines[i]

		if (!inStyle) {
			if (/<style[\s>]/.test(raw)) inStyle = true
			continue
		}
		if (/<\/style>/.test(raw)) break

		// CSS 条件编译注释
		const cond = /\/\*\s*#(ifdef|ifndef|else|endif)\b([^*]*)\*\//.exec(raw)
		if (cond != null) {
			const kind = cond[1]
			if (kind === 'ifdef' || kind === 'ifndef') {
				condStack.push(exprAppliesToApp(cond[2].trim(), kind))
			} else if (kind === 'else') {
				if (condStack.length > 0) condStack[condStack.length - 1] = !condStack[condStack.length - 1]
			} else if (kind === 'endif') {
				condStack.pop()
			}
			continue
		}

		const active = !condStack.some((on) => !on)
		const line = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/, '')
		let rowBuf = ''
		for (let c = 0; c < line.length; c++) {
			const ch = line[c]
			if (ch === '{') {
				if (depth === 0) bufLines = []
				depth++
			} else if (ch === '}') {
				if (depth > 0) {
					depth--
					if (depth === 0) {
						bufLines.push({ line: i + 1, text: rowBuf, active })
						rowBuf = ''
						flush()
					}
				}
			} else if (depth > 0) {
				rowBuf += ch
			}
		}
		if (depth > 0) bufLines.push({ line: i + 1, text: rowBuf, active })
	}
	return findings
}

function main() {
	const args = process.argv.slice(2)
	const json = args.includes('--json')
	const fileIdx = args.indexOf('--file')
	let files
	if (fileIdx >= 0 && args[fileIdx + 1] != null) {
		files = [path.resolve(ROOT, args[fileIdx + 1])]
	} else {
		files = collectFiles()
	}

	const findings = []
	for (const file of files) {
		for (const item of scanFile(file)) {
			findings.push({ file: path.relative(ROOT, file).replace(/\\/g, '/'), ...item })
		}
	}

	if (json) {
		console.log(JSON.stringify({ files: files.length, findings }, null, 2))
		process.exitCode = findings.length > 0 ? 1 : 0
		return
	}

	if (findings.length === 0) {
		console.log(`[verify-uvue-css] 扫描 ${files.length} 个 uvue，0 处不合规`)
		return
	}

	console.log(`[verify-uvue-css] 扫描 ${files.length} 个 uvue，${findings.length} 处不合规：`)
	for (const f of findings) {
		console.log(`  ${f.file}:${f.line}  ${f.prop}: ${f.value}  ← ${f.rule.reason}`)
	}
	console.log('  修复：改用 App 端支持的取值，或用 ifndef APP 条件编译包裹仅 H5/小程序需要的声明')
	process.exitCode = 1
}

main()
