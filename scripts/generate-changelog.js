#!/usr/bin/env node

/**
 * Changelog 生成脚本（基于 Conventional Commits + git 标签）
 *
 * 用法:
 *   node scripts/generate-changelog.js [选项]
 *
 * 选项:
 *   --emoji            带 emoji 图标（默认）
 *   --plain            不带 emoji
 *   --current          以 package.json 版本为当前版本，生成该版本区块
 *   --last             以最近一个标签为准，生成 最近标签..HEAD 的变更
 *   --all              按所有 git 标签重建版本区块
 *   --no-unreleased    不保留 Unreleased 区块（发布时使用）
 *   --no-links         提交 hash 不生成超链接（只保留短 hash）
 *   --exclude-types=a,b  排除指定提交类型
 *
 * 产物（每次生成都写两份，内容完全一致）:
 *   - CHANGELOG.md（演示工程仓库根）
 *   - uni_modules/uview-pro-x/changelog.md（组件库工作副本；目录不存在时跳过）
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 提交链接指向的仓库（演示仓库）
const REPO_URL = 'https://github.com/anyup/hello-uview-pro-x';
// 组件库（私有库工作副本）的更新日志路径
const COMPONENT_CHANGELOG_PATH = path.join('uni_modules', 'uview-pro-x', 'changelog.md');

// 解析命令行参数
const args = process.argv.slice(2);
const useEmoji = args.includes('--emoji');
const usePlain = args.includes('--plain');
const onlyCurrent = args.includes('--current');
const sinceLastTag = args.includes('--last') || args.includes('--since-last-tag');
const generateAll = args.includes('--all') || args.includes('--by-tags');
const noUnreleased = args.includes('--no-unreleased');
// 关闭提交链接：只输出短 hash，不生成 markdown 超链接
const noLinks = args.includes('--no-links');

// 需要排除的提交类型（例如：--exclude-types=chore,ci,docs）
let excludeTypes = [];
const excludeTypesArg = args.find(a => a.startsWith('--exclude-types='));
if (excludeTypesArg) {
    excludeTypes = excludeTypesArg
        .split('=')[1]
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
}

// 如果没有指定参数，默认使用 emoji
const shouldUseEmoji = useEmoji || (!usePlain && !useEmoji);

// Emoji 映射
const emojiMap = {
    feat: '✨',
    fix: '🐛',
    docs: '📝',
    style: '💄',
    refactor: '♻️',
    perf: '⚡',
    test: '✅',
    build: '📦‍',
    ci: '👷',
    chore: '🚀',
    revert: '⏪'
};

// 类型名称映射（带 emoji）
const typeNamesWithEmoji = {
    feat: '✨ Features | 新功能',
    fix: '🐛 Bug Fixes | Bug 修复',
    docs: '📝 Documentation | 文档',
    style: '💄 Styles | 风格',
    refactor: '♻️ Code Refactoring | 代码重构',
    perf: '⚡ Performance Improvements | 性能优化',
    test: '✅ Tests | 测试',
    build: '📦‍ Build System | 打包构建',
    ci: '👷 Continuous Integration | CI 配置',
    chore: '🚀 Chore | 构建/工程依赖/工具',
    revert: '⏪ Revert | 回退'
};

// 类型名称映射（不带 emoji）
const typeNamesPlain = {
    feat: 'Features | 新功能',
    fix: 'Bug Fixes | Bug 修复',
    docs: 'Documentation | 文档',
    style: 'Styles | 风格',
    refactor: 'Code Refactoring | 代码重构',
    perf: 'Performance Improvements | 性能优化',
    test: 'Tests | 测试',
    build: 'Build System | 打包构建',
    ci: 'Continuous Integration | CI 配置',
    chore: 'Chore | 构建/工程依赖/工具',
    revert: 'Revert | 回退'
};

const typeNames = shouldUseEmoji ? typeNamesWithEmoji : typeNamesPlain;

function safeExec(cmd) {
    try {
        // 忽略 stderr：标签不存在等探测失败属正常分支，不向控制台喷错
        return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch (e) {
        return '';
    }
}

function resolveRange() {
    // --current: 以 package.json 的 version 为标签 vX.Y.Z，取「上一个标签..当前标签」
    if (onlyCurrent) {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const currentTag = `v${pkg.version}`;
        // 发布流程中标签尚未创建，此处会回退到「最近标签..HEAD」
        const prevTag = safeExec(`git describe --tags --abbrev=0 ${currentTag}^`);
        if (prevTag) return `${prevTag}..${currentTag}`;
        const lastTag = safeExec('git describe --tags --abbrev=0');
        if (lastTag) return `${lastTag}..HEAD`;
        return '';
    }
    // --last: 最近一个标签..HEAD
    if (sinceLastTag) {
        const lastTag = safeExec('git describe --tags --abbrev=0');
        if (lastTag) return `${lastTag}..HEAD`;
        return '';
    }
    // 默认：全量
    return '';
}

// 版本区块标题：日期用中文全角括号包裹，形如 `## 1.0.0（2026-10-26）`
function buildSectionHeader({ version, date }) {
    return `## ${version}（${date}）`;
}

function todayStr() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function collectCommits(range) {
    const rangeArg = range ? ` ${range}` : '';
    const lines = execSync(`git log${rangeArg} --pretty=format:"%H|%s|%an|%ae" --reverse`, { encoding: 'utf8' })
        .split('\n')
        .filter(line => line.trim());
    return lines.map(line => {
        const [hash, subject, authorName, authorEmail] = line.split('|');
        return { hash, subject, authorName, authorEmail };
    });
}

function groupCommitsByType(commits, exclude) {
    const commitsByType = {};
    commits.forEach(commit => {
        if (!commit.subject) return;
        const match = commit.subject.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)/);
        if (match) {
            const [, type, scope, description] = match;
            if (!emojiMap[type]) return;
            if (exclude.includes(type)) return;
            if (!commitsByType[type]) commitsByType[type] = [];
            commitsByType[type].push({
                ...commit,
                scope: scope || '',
                description: description.trim()
            });
        }
    });
    return commitsByType;
}

function collectContributors(commits) {
    const contributorsMap = new Map();
    const seenUsernames = new Set();

    // 读取贡献者映射配置（可选，用于修正头像链接）
    let nameToGithub = {};
    let ignoreList = [];
    try {
        const configPath = path.join(__dirname, 'contributors-map.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            nameToGithub = config.nameToGithub || {};
            ignoreList = config.ignore || [];
        }
    } catch (e) {
        // 忽略配置文件读取错误
    }

    commits.forEach(commit => {
        if (!commit.authorName || !commit.authorEmail) return;
        if (ignoreList.includes(commit.authorName)) return;

        const key = `${commit.authorName}|${commit.authorEmail}`;
        if (contributorsMap.has(key)) return;

        let githubUsername = nameToGithub[commit.authorName] || commit.authorName.toLowerCase().replace(/\s+/g, '');
        if (seenUsernames.has(githubUsername)) return;

        seenUsernames.add(githubUsername);
        contributorsMap.set(key, {
            name: commit.authorName,
            email: commit.authorEmail,
            githubUsername
        });
    });

    return Array.from(contributorsMap.values());
}

function renderContributors(contributors) {
    if (!contributors || contributors.length === 0) return '';

    let section = '### 👥 Contributors\n\n';
    contributors.forEach(contributor => {
        if (contributor.githubUsername) {
            section += `<a href="https://github.com/${contributor.githubUsername}"><img src="https://github.com/${contributor.githubUsername}.png?size=40" width="40" height="40" alt="${contributor.name}" title="${contributor.name}"/></a> `;
        } else {
            section += `**${contributor.name}** `;
        }
    });
    section += '\n\n';
    return section;
}

function renderBodyFromGroups(commitsByType, contributors = null) {
    let body = '';
    Object.keys(commitsByType).forEach(type => {
        if (commitsByType[type].length === 0) return;
        body += `### ${typeNames[type]}\n\n`;
        commitsByType[type].forEach(commit => {
            const scope = commit.scope ? `**${commit.scope}:** ` : '';
            const shortHash = commit.hash.substring(0, 7);
            const hashRef = noLinks ? `${shortHash}` : `[${shortHash}](${REPO_URL}/commit/${commit.hash})`;
            body += `- ${scope}${commit.description} (${hashRef})\n`;
        });
        body += '\n';
    });

    if (contributors && contributors.length > 0) {
        body += renderContributors(contributors);
    }
    return body;
}

function renderFallbackBody() {
    // 无符合规范的提交时，按 uView-Pro 的类型顺序输出全部空分节
    return Object.keys(typeNames).map(type => `### ${typeNames[type]}\n\n`).join('');
}

function generateChangelog() {
    try {
        const range = resolveRange();
        console.log(
            `🔄 生成 changelog... ${shouldUseEmoji ? '带 emoji' : '不带 emoji'}${range ? `（范围: ${range}）` : ''}`
        );

        const commits = collectCommits(range);
        const commitsByType = groupCommitsByType(commits, excludeTypes);
        const contributors = collectContributors(commits);

        const hasExisting = fs.existsSync('CHANGELOG.md');
        const existingContent = hasExisting ? fs.readFileSync('CHANGELOG.md', 'utf8') : '';

        const baseHeader = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n`;
        const standardHeader = noUnreleased ? baseHeader : baseHeader + '## [Unreleased]\n\n';

        let changelogBody = renderBodyFromGroups(commitsByType, contributors);
        if (Object.keys(commitsByType).length === 0) {
            changelogBody += renderFallbackBody();
        }

        let finalContent = '';
        if (generateAll) {
            // 基于标签重建所有版本区块
            const tagsOutput = safeExec('git tag --list --sort=-v:refname');
            const tags = tagsOutput ? tagsOutput.split('\n').filter(Boolean) : [];

            let sections = '';
            if (tags.length === 0) {
                // 仓库还没有任何标签：按当前版本 + 全量提交生成单个区块，避免输出空日志
                const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                const body = changelogBody || renderFallbackBody();
                sections = `${buildSectionHeader({ version: pkg.version, date: todayStr() })}\n\n${body}`;
            }
            for (let i = 0; i < tags.length; i++) {
                const tag = tags[i];
                const prev = tags[i + 1];
                // 用 git log 取标签指向提交的日期，避免注解标签输出 tag 对象信息
                const tagDate = safeExec(`git log -1 --format=%ad --date=format:%Y-%m-%d ${tag}`) || '';
                const rangeExp = prev ? `${prev}..${tag}` : `${tag}`;
                const tagCommits = collectCommits(rangeExp);
                const groups = groupCommitsByType(tagCommits, excludeTypes);
                const tagContributors = collectContributors(tagCommits);
                let body = renderBodyFromGroups(groups, tagContributors);
                if (!body) body = renderFallbackBody();
                sections += `${buildSectionHeader({ version: tag.replace(/^v/, ''), date: tagDate })}\n\n${body}`;
            }

            const headerIdx = existingContent.indexOf('## [Unreleased]');
            const base =
                headerIdx !== -1
                    ? existingContent.slice(0, existingContent.indexOf('\n', headerIdx) + 1)
                    : standardHeader;
            finalContent = base + '\n' + sections.trim() + '\n';
        } else if (onlyCurrent) {
            // 生成当前版本区块，插入到版本列表最前（Unreleased 之后）
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const version = pkg.version;
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;

            const newSection = `${buildSectionHeader({ version, date: dateStr })}\n\n${changelogBody}`;

            if (hasExisting) {
                if (noUnreleased) {
                    // 不保留 Unreleased：找到第一个版本区块，在其前插入新版本
                    let firstVersionIndex = existingContent.indexOf('\n## ');
                    if (firstVersionIndex !== -1) {
                        const lineEnd = existingContent.indexOf('\n', firstVersionIndex + 1);
                        const headerLine = existingContent.slice(firstVersionIndex, lineEnd);
                        if (headerLine.includes('[Unreleased]')) {
                            firstVersionIndex = existingContent.indexOf('\n## ', lineEnd);
                        }
                    }
                    if (firstVersionIndex !== -1) {
                        finalContent =
                            existingContent.slice(0, firstVersionIndex) +
                            '\n' +
                            newSection +
                            '\n' +
                            existingContent.slice(firstVersionIndex);
                    } else {
                        finalContent = existingContent + '\n' + newSection + '\n';
                    }
                } else {
                    // 保留 Unreleased：在其后插入新版本
                    const unreleasedIndex = existingContent.indexOf('## [Unreleased]');
                    if (unreleasedIndex !== -1) {
                        const afterUnreleased = existingContent.indexOf(
                            '\n## ',
                            unreleasedIndex + '## [Unreleased]'.length
                        );
                        if (afterUnreleased !== -1) {
                            finalContent =
                                existingContent.slice(0, afterUnreleased) +
                                '\n' +
                                newSection +
                                '\n' +
                                existingContent.slice(afterUnreleased);
                        } else {
                            finalContent = existingContent + '\n' + newSection + '\n';
                        }
                    } else {
                        finalContent = standardHeader + newSection + '\n' + existingContent;
                    }
                }
            } else {
                finalContent = standardHeader + newSection + '\n';
            }
        } else {
            // 默认：写入标准头，本次统计结果放在 Unreleased 下
            finalContent = standardHeader + changelogBody;
        }

        // 清理重复内容（仅在基于既有内容拼接的 --current / --all 模式下需要，防止多次运行产生重复）
        if ((onlyCurrent || generateAll) && finalContent.includes('# Changelog')) {
            const headerEndIndex = finalContent.indexOf('\n\n## ');
            if (headerEndIndex !== -1) {
                const header = finalContent.slice(0, headerEndIndex);
                let cleanBody = finalContent.slice(headerEndIndex);

                cleanBody = cleanBody.replace(
                    /# Changelog\n\nAll notable changes to this project will be documented in this file\.\n\nThe format is based on \[Keep a Changelog\].*?and this project adheres to \[Semantic Versioning\].*?\n\n/g,
                    ''
                );

                // 移除重复的版本区块（保留第一个）
                const versionBlocks = cleanBody.split('\n## ');
                if (versionBlocks.length > 1) {
                    const firstBlock = versionBlocks[0];
                    const uniqueBlocks = [];
                    const seenVersions = new Set();

                    versionBlocks.slice(1).forEach(block => {
                        if (block.startsWith('[Unreleased]')) return;
                        const versionMatch = block.match(/^(\[?\d+\.\d+\.\d+)/);
                        if (versionMatch && !seenVersions.has(versionMatch[1])) {
                            seenVersions.add(versionMatch[1]);
                            uniqueBlocks.push('## ' + block);
                        }
                    });

                    cleanBody = firstBlock + (uniqueBlocks.length > 0 ? '\n' + uniqueBlocks.join('\n') : '');
                }

                finalContent = header + cleanBody;
            }
        }

        // 统一版本区块间隔为 1 行
        if (finalContent.includes('## ')) {
            finalContent = finalContent.replace(/(# Changelog[\s\S]*?)\n\n\n+## /, '$1\n\n## ');
            finalContent = finalContent.replace(/\n\n\n+## /g, '\n\n## ');
            finalContent = finalContent.replace(/\n+$/, '\n');
        }

        fs.writeFileSync('CHANGELOG.md', finalContent);
        console.log(`✅ CHANGELOG.md 生成成功（${shouldUseEmoji ? '带 emoji' : '不带 emoji'}）`);

        // 同步组件库更新日志：内容与根 CHANGELOG.md 完全一致（组件库目录不存在时跳过）
        try {
            if (!fs.existsSync(path.dirname(COMPONENT_CHANGELOG_PATH))) {
                console.log(`ℹ️  未找到组件库目录，跳过 ${COMPONENT_CHANGELOG_PATH}`);
            } else {
                fs.writeFileSync(COMPONENT_CHANGELOG_PATH, finalContent);
                console.log(`✅ 组件库更新日志已同步: ${COMPONENT_CHANGELOG_PATH}`);
            }
        } catch (error) {
            console.log(`⚠️  组件库更新日志同步失败: ${error.message}`);
        }

        // 统计信息
        Object.keys(commitsByType).forEach(type => {
            const emoji = shouldUseEmoji ? emojiMap[type] + ' ' : '';
            console.log(`${emoji}${typeNamesPlain[type]}: ${commitsByType[type].length} commits`);
        });

        console.log('\n📖 用法:');
        console.log('  npm run changelog:emoji                 - 全量生成（带 emoji）');
        console.log('  npm run changelog:plain                 - 全量生成（不带 emoji）');
        console.log('  npm run changelog:current               - 生成当前版本区块（带 emoji）');
        console.log('  npm run changelog:current:plain         - 生成当前版本区块（不带 emoji）');
        console.log('  npm run changelog:last                  - 生成最近标签..HEAD 的变更');
        console.log('  npm run changelog:last:plain            - 同上（不带 emoji）');
        console.log('  npm run changelog:all                   - 按 git 标签重建所有版本区块');
        console.log('  npm run changelog:all:plain             - 同上（不带 emoji）');
    } catch (error) {
        console.error('❌ 生成 changelog 失败:', error.message);
        process.exit(1);
    }
}

generateChangelog();
