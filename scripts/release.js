#!/usr/bin/env node

/**
 * 发布脚本
 * 使用方法:
 *   node scripts/release.js [patch|minor|major]              # 语义化版本（默认不推送）
 *   node scripts/release.js prerelease [alpha|beta|rc]       # 预览版本（默认不推送）
 *   node scripts/release.js 1.0.1                            # 直接指定版本号（默认不推送）
 *   node scripts/release.js patch --push                     # 提交并推送
 *   node scripts/release.js push                             # 推送上次未推送的发布
 *   node scripts/release.js undo                             # 撤销本地发布（仅未推送时）
 *
 * 涉及文件:
 *   - package.json                          版本号（本仓库）
 *   - CHANGELOG.md                          更新日志（本仓库，随发布提交）
 *   - uni_modules/uview-pro-x/package.json  组件库版本号（独立仓库，随发布在同仓库提交并打同名标签）
 *   - uni_modules/uview-pro-x/changelog.md  组件库更新日志（同上）
 *   - uview-pro-x-doc/package.json          文档库版本号（只更新文件，不提交、不打标签）
 *   - uview-pro-x-doc/docs/zh/components/changelog.md  文档库更新日志（同上）
 *
 * 组件库（uni_modules/uview-pro-x）是嵌套的独立 git 仓库：发布时与主仓库一样
 * 「提交 + 打 vX.Y.Z 标签」，默认不推送；传 --push 时两个仓库一起推送。
 * 文档库（uview-pro-x-doc）只同步版本号与更新日志，不提交、不打标签。
 *
 * 更新日志来源（主仓库 / 组件库 / 文档库统一）:
 *   组件库「最近标签..HEAD」+ 主仓库「最近标签..HEAD」合并后的提交
 *
 * undo 语义:
 *   删除两仓标签并把发布提交退回暂存区，不回退文件内容（文档库改动保持不变）
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 私有组件库（独立 git 仓库，不被本仓库跟踪）
const LIB_DIR = path.join('uni_modules', 'uview-pro-x');
const LIB_PACKAGE_PATH = path.join(LIB_DIR, 'package.json');
const LIB_CHANGELOG_PATH = path.join(LIB_DIR, 'changelog.md');
// 组件库中随发布提交的产物文件（在组件库仓库内单独提交）
const LIB_RELEASE_FILES = [LIB_PACKAGE_PATH, LIB_CHANGELOG_PATH];
// 文档库：只同步版本号与更新日志，不提交、不打标签
const DOCS_PACKAGE_PATH = path.join('uview-pro-x-doc', 'package.json');
const DOCS_CHANGELOG_PATH = path.join('uview-pro-x-doc', 'docs', 'zh', 'components', 'changelog.md');
// 发布提交仅包含的产物文件（不包含工作区其他改动与嵌套仓库）
const RELEASE_FILES = ['package.json', 'CHANGELOG.md'];
const COMMIT_PREFIX = 'chore(release): bump version to';

// 组件库目录是否为独立的 git 仓库
function libRepoExists() {
    return fs.existsSync(path.join(LIB_DIR, '.git'));
}

// 在组件库仓库内执行 git 命令
function libGit(command, options = {}) {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], cwd: LIB_DIR, ...options });
}

// 组件库仓库内是否存在指定标签
function libHasTag(tagName) {
    try {
        libGit(`git rev-parse --verify --quiet refs/tags/${tagName}`);
        return true;
    } catch (e) {
        return false;
    }
}

const args = process.argv.slice(2);

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data, indent = 4) {
    fs.writeFileSync(file, JSON.stringify(data, null, indent) + '\n');
}

// 特殊命令：push - 推送之前未推送的发布
if (args[0] === 'push') {
    console.log('🚀 开始推送发布标签和提交...');
    try {
        const version = readJson('package.json').version;
        console.log('📤 推送提交...');
        execSync('git push origin HEAD', { stdio: 'inherit' });
        console.log(`📤 推送标签 v${version}...`);
        execSync(`git push origin "v${version}"`, { stdio: 'inherit' });
        console.log(`✅ 版本 ${version} 推送成功！`);
        if (libRepoExists()) {
            console.log('');
            console.log('📤 推送组件库（uni_modules/uview-pro-x）提交...');
            try {
                libGit('git push origin HEAD', { stdio: 'inherit' });
                if (libHasTag(`v${version}`)) {
                    console.log(`📤 推送组件库标签 v${version}...`);
                    libGit(`git push origin "v${version}"`, { stdio: 'inherit' });
                } else {
                    console.log(`⚠️  组件库未找到标签 v${version}，跳过标签推送`);
                }
                console.log('✅ 组件库推送完成！');
            } catch (error) {
                console.warn(`⚠️  组件库推送失败: ${error.message}`);
                console.warn('💡 请在 uni_modules/uview-pro-x 目录内手动推送');
            }
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ 推送失败:', error.message);
        process.exit(1);
    }
}

// 特殊命令：undo - 撤销本地发布（仅未推送时）
if (args[0] === 'undo') {
    console.log('↩️  开始撤销本地发布...');
    try {
        const version = readJson('package.json').version;
        const tagName = `v${version}`;

        console.log('🔍 检查提交状态...');
        try {
            const unpushedCommits = execSync('git log origin/HEAD..HEAD --oneline', {
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore']
            }).trim();
            if (!unpushedCommits) {
                console.error('❌ 错误：没有未推送的提交，或者当前分支没有远程跟踪分支');
                console.error('💡 该命令仅用于撤销未推送的本地发布');
                process.exit(1);
            }
        } catch (e) {
            // 没有远程分支时 git log 会报错，同样属于可撤销的情况
        }

        console.log(`🔍 检查标签 ${tagName}...`);
        let tagExists = false;
        try {
            execSync(`git rev-parse ${tagName}`, { stdio: 'pipe' });
            tagExists = true;
        } catch (e) {
            console.log(`⚠️  标签 ${tagName} 不存在`);
        }

        const lastCommitMsg = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
        if (!lastCommitMsg.includes(COMMIT_PREFIX)) {
            console.error('❌ 错误：最后一次提交不是发布提交');
            console.error('💡 最后一次提交信息:', lastCommitMsg.substring(0, 50) + '...');
            console.error('💡 请手动检查并撤销');
            process.exit(1);
        }

        console.log('');
        console.log('⚠️  即将执行以下操作：');
        console.log(`   1. 删除本地标签: ${tagName}`);
        console.log('   2. 撤销最后一次提交（改动退回暂存区，不回退文件内容）');
        console.log('');

        if (tagExists) {
            console.log(`🗑️  删除本地标签 ${tagName}...`);
            execSync(`git tag -d ${tagName}`, { stdio: 'inherit' });
        }

        console.log('↩️  撤销最后一次提交（改动保留在暂存区）...');
        execSync('git reset --soft HEAD~1', { stdio: 'inherit' });

        // 组件库（独立仓库）：删除同名标签，发布提交退回暂存区
        let libUndone = false;
        if (libRepoExists()) {
            console.log('');
            console.log('📦 撤销组件库（uni_modules/uview-pro-x）发布...');
            let libLastCommitMsg = '';
            try {
                libLastCommitMsg = libGit('git log -1 --pretty=%B').trim();
            } catch (e) {}

            if (!libLastCommitMsg.includes(COMMIT_PREFIX)) {
                console.log('⚠️  组件库最后一次提交不是发布提交，跳过撤销（标签与提交均未改动）');
            } else {
                if (libHasTag(tagName)) {
                    console.log(`🗑️  删除组件库标签 ${tagName}...`);
                    libGit(`git tag -d ${tagName}`, { stdio: 'inherit' });
                } else {
                    console.log(`⚠️  组件库标签 ${tagName} 不存在，跳过`);
                }

                console.log('↩️  撤销组件库发布提交（改动保留在暂存区）...');
                libGit('git reset --soft HEAD~1', { stdio: 'inherit' });
                libUndone = true;
            }
        }

        console.log('');
        console.log('✅ 本地发布撤销成功！');
        console.log('');
        console.log('📋 当前状态：');
        console.log(`   • 标签 ${tagName} 已删除`);
        console.log('   • 提交已撤销，版本号与更新日志改动保留在暂存区（未回退内容）');
        if (libRepoExists()) {
            console.log('');
            console.log(
                libUndone
                    ? '   • 组件库（uni_modules/uview-pro-x）发布标签与提交已同步撤销，改动保留在暂存区'
                    : '   • 组件库（uni_modules/uview-pro-x）未改动'
            );
        }
        if (fs.existsSync(DOCS_PACKAGE_PATH)) {
            console.log('');
            console.log('   • 文档库（uview-pro-x-doc）不参与提交与标签，版本号与日志改动保持不变');
        }
        console.log('');
        console.log('💡 如需重新发布，运行: npm run release:patch（或其他版本类型）');
        process.exit(0);
    } catch (error) {
        console.error('❌ 撤销失败:', error.message);
        process.exit(1);
    }
}

const shouldPush = args.includes('--push');
// 默认生成 changelog，--no-changelog 跳过
const skipChangelog = args.includes('--no-changelog');
// 默认不检查工作区，--strict 时存在未提交改动即报错
const strictMode = args.includes('--strict');
const versionInput = args.find(arg => !arg.startsWith('--'));

// 匹配语义化版本号: x.y.z 或 x.y.z-prerelease
function isValidVersion(version) {
    if (!version || typeof version !== 'string') return false;
    return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(version);
}

// 计算下一个版本号（语义与 npm version 一致）
function bumpVersion(current, type, preid) {
    const match = current.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
    if (!match) {
        console.error(`❌ 当前版本号不合法: ${current}`);
        process.exit(1);
    }
    const major = Number(match[1]);
    const minor = Number(match[2]);
    const patch = Number(match[3]);
    const pre = match[4];

    if (type === 'prerelease') {
        const id = preid || 'beta';
        const parts = pre ? pre.split('.') : [];
        const preNum = parts[0] === id && parts.length > 1 ? Number(parts[1]) : NaN;
        if (Number.isFinite(preNum)) {
            return `${major}.${minor}.${patch}-${id}.${preNum + 1}`;
        }
        return pre ? `${major}.${minor}.${patch}-${id}.0` : `${major}.${minor}.${patch + 1}-${id}.0`;
    }
    if (type === 'major') {
        return pre ? `${major}.${minor}.${patch}` : `${major + 1}.0.0`;
    }
    if (type === 'minor') {
        return pre ? `${major}.${minor}.${patch}` : `${major}.${minor + 1}.0`;
    }
    // patch
    return pre ? `${major}.${minor}.${patch}` : `${major}.${minor}.${patch + 1}`;
}

const isSemverType = ['patch', 'minor', 'major', 'prerelease'].includes(versionInput);
const isDirectVersion = isValidVersion(versionInput);

if (!versionInput || (!isSemverType && !isDirectVersion)) {
    console.error('❌ 请指定版本类型或版本号');
    console.error('使用方法:');
    console.error('  node scripts/release.js [patch|minor|major]              # 语义化版本（默认不推送）');
    console.error('  node scripts/release.js prerelease [alpha|beta|rc]       # 预览版本（默认不推送）');
    console.error('  node scripts/release.js 1.0.1                            # 直接指定版本号（默认不推送）');
    console.error('');
    console.error('选项:');
    console.error('  --push                                                   # 提交并推送');
    console.error('  --strict                                                 # 严格模式：有未提交更改则报错（默认关闭）');
    console.error('  --no-changelog                                           # 跳过 changelog 生成');
    console.error('');
    console.error('其他命令:');
    console.error('  node scripts/release.js push                             # 推送上次未推送的发布');
    console.error('  node scripts/release.js undo                             # 撤销本地发布（仅未推送时）');
    process.exit(1);
}

// prerelease 标识（默认 beta）
const prereleaseId = versionInput === 'prerelease' ? args[1] || 'beta' : '';
const versionType = isSemverType ? versionInput : null;
const targetVersion = isDirectVersion ? versionInput : null;
const isPrerelease = versionType === 'prerelease' || Boolean(targetVersion && targetVersion.includes('-'));

const releaseTypeText = targetVersion
    ? targetVersion
    : versionType === 'prerelease'
      ? `${prereleaseId} 预览版`
      : versionType;

console.log(`${isPrerelease ? '🧪' : '🚀'} 开始发布 ${releaseTypeText} 版本...`);

// 执行命令的辅助函数
function execCommand(command, options = {}) {
    try {
        return execSync(command, { encoding: 'utf8', stdio: 'inherit', ...options });
    } catch (error) {
        console.error(`❌ 命令执行失败: ${command}`);
        console.error(error.message);
        process.exit(1);
    }
}

if (strictMode) {
    console.log('📋 检查 Git 状态...');
    const gitStatus = execCommand('git status --porcelain', { stdio: 'pipe' });
    if (gitStatus.trim()) {
        console.error('❌ 有未提交的更改，请先提交或暂存（或去掉 --strict）');
        console.log(gitStatus);
        process.exit(1);
    }
}

console.log('🌿 检查当前分支...');
const currentBranch = execCommand('git branch --show-current', { stdio: 'pipe' }).trim();
if (currentBranch !== 'main' && currentBranch !== 'master') {
    console.warn(`⚠️  警告: 当前分支是 ${currentBranch}，建议在 main 或 master 分支上发布`);

    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('是否继续? (y/N): ', answer => {
        rl.close();
        if (!/^[Yy]$/.test(answer)) {
            console.log('❌ 操作已取消');
            process.exit(1);
        }
        continueRelease();
    });
} else {
    continueRelease();
}

function continueRelease() {
    try {
        const currentVersion = readJson('package.json').version;
        const newVersion = targetVersion || bumpVersion(currentVersion, versionType, prereleaseId);

        // 更新本仓库版本号
        console.log(`📦 更新版本号为 ${newVersion}...`);
        const packageJson = readJson('package.json');
        packageJson.version = newVersion;
        writeJson('package.json', packageJson);
        console.log(`✨ 新版本: ${newVersion}`);

        // 同步组件库版本号（独立仓库，随发布在组件库内提交）
        if (fs.existsSync(LIB_PACKAGE_PATH)) {
            console.log('📦 同步组件库版本号...');
            const libPackage = readJson(LIB_PACKAGE_PATH);
            libPackage.version = newVersion;
            if (libPackage.uni_app) libPackage.uni_app.version = newVersion;
            writeJson(LIB_PACKAGE_PATH, libPackage);
            console.log(`✅ 组件库版本已同步为: ${newVersion}（随发布在组件库仓库提交）`);
        } else {
            console.warn('⚠️  未找到组件库 package.json，跳过版本同步');
        }

        // 同步文档库版本号（只更新文件，不提交、不打标签）
        if (fs.existsSync(DOCS_PACKAGE_PATH)) {
            console.log('📦 同步文档库版本号...');
            const docsPackage = readJson(DOCS_PACKAGE_PATH);
            docsPackage.version = newVersion;
            writeJson(DOCS_PACKAGE_PATH, docsPackage, 2);
            console.log(`✅ 文档库版本已同步为: ${newVersion}（不提交、不打标签）`);
        } else {
            console.log('ℹ️  未找到文档库 package.json，跳过版本同步');
        }

        // 生成 changelog：主仓库 / 组件库 / 文档库统一使用「组件库 lastTag..HEAD + 主仓库 lastTag..HEAD」
        if (skipChangelog) {
            console.log('📝 跳过 changelog 生成');
        } else {
            console.log('📝 生成主仓库 changelog（组件库 + 主仓库合并）...');
            execCommand('npm run changelog:release');
            if (libRepoExists()) {
                console.log('📝 生成组件库 changelog（组件库 + 主仓库合并）...');
                execCommand('npm run changelog:lib');
                if (fs.existsSync(DOCS_CHANGELOG_PATH)) {
                    console.log('📝 生成文档库更新日志（同源日志，不提交）...');
                    execCommand('npm run changelog:docs');
                } else {
                    console.log('ℹ️  未找到文档库更新日志，跳过文档库日志');
                }
            } else {
                console.log('ℹ️  未找到组件库独立仓库，跳过组件库与文档库日志');
            }
        }

        // 提交发布产物（仅版本号与 changelog，避免误提交工作区其他改动）
        console.log('💾 提交更改...');
        const filesToCommit = RELEASE_FILES.filter(file => fs.existsSync(file));
        execCommand(`git add ${filesToCommit.join(' ')}`);
        // 路径限定提交：只提交发布产物，不带上工作区其他已暂存改动
        execCommand(`git commit -m "${COMMIT_PREFIX} ${newVersion}" -m "- Update package.json version
- Sync uview-pro-x module version
- Generate changelog for ${newVersion}" -- ${filesToCommit.join(' ')}`);

        // 创建标签
        console.log(`🏷️  创建标签 v${newVersion}...`);
        execCommand(`git tag -a "v${newVersion}" -m "Release version ${newVersion}"`);

        // 组件库是嵌套的独立仓库：与主仓库一致，提交版本产物并打同名标签（默认不推送）
        if (libRepoExists()) {
            console.log('');
            console.log('📦 提交组件库（uni_modules/uview-pro-x 独立仓库）...');
            const libFiles = LIB_RELEASE_FILES.filter(file => fs.existsSync(file));
            if (libFiles.length === 0) {
                console.log('ℹ️  组件库无版本产物文件，跳过提交');
            } else {
                const libRelFiles = libFiles.map(file => path.relative(LIB_DIR, file));
                libGit(`git add -- ${libRelFiles.join(' ')}`, { stdio: 'inherit' });
                const staged = libGit(`git diff --cached --name-only -- ${libRelFiles.join(' ')}`).trim();
                if (staged) {
                    // 路径限定提交：只提交版本产物，不带上组件库工作区其他改动
                    libGit(
                        `git commit -m "${COMMIT_PREFIX} ${newVersion}" -m "- Update package.json version
- Sync changelog for ${newVersion}" -- ${libRelFiles.join(' ')}`,
                        { stdio: 'inherit' }
                    );
                    console.log('✅ 组件库发布提交完成');
                } else {
                    console.log('ℹ️  组件库无待提交变更，跳过提交');
                }
            }

            const libTagName = `v${newVersion}`;
            if (libHasTag(libTagName)) {
                console.log(`ℹ️  组件库标签 ${libTagName} 已存在，跳过创建`);
            } else {
                console.log(`🏷️  创建组件库标签 ${libTagName}...`);
                libGit(`git tag -a "${libTagName}" -m "Release version ${newVersion}"`, { stdio: 'inherit' });
            }
        }

        if (shouldPush) {
            console.log('🚀 推送更改和标签...');
            execCommand('git push origin HEAD');
            execCommand(`git push origin "v${newVersion}"`);
            if (libRepoExists()) {
                try {
                    console.log('🚀 推送组件库提交与标签...');
                    libGit('git push origin HEAD', { stdio: 'inherit' });
                    if (libHasTag(`v${newVersion}`)) {
                        libGit(`git push origin "v${newVersion}"`, { stdio: 'inherit' });
                    }
                } catch (error) {
                    console.warn(`⚠️  组件库推送失败: ${error.message}`);
                    console.warn('💡 请在 uni_modules/uview-pro-x 目录内手动推送');
                }
            }
        }

        console.log(`${isPrerelease ? '🎉 预览版本' : '✅ 版本'} ${newVersion} 发布成功!`);
        console.log(`🏷️  标签 v${newVersion} ${shouldPush ? '已创建并推送' : '已创建（未推送）'}`);
        if (libRepoExists()) {
            console.log('');
            console.log(
                `📦 组件库（uni_modules/uview-pro-x）已提交并打标签 v${newVersion}${shouldPush ? '，已推送' : '（未推送）'}`
            );
        }
        if (fs.existsSync(DOCS_PACKAGE_PATH)) {
            console.log('');
            console.log(`📚 文档库（uview-pro-x-doc）版本与更新日志已同步为 ${newVersion}（未提交、未打标签）`);
        }
        if (!shouldPush) {
            console.log('💡 如需推送，运行: npm run release:push');
            console.log('💡 如需撤销，运行: npm run release:undo');
        }
        if (isPrerelease) {
            console.log('');
            console.log('⚠️  这是一个预览版本，仅供测试使用');
        }
        console.log('');
        console.log('📋 下一步:');
        if (!shouldPush) {
            console.log('1. 检查无误后，运行 npm run release:push 推送发布');
            console.log('2. 如需创建 GitHub Release，请手动前往仓库创建');
        } else {
            console.log('如需创建 GitHub Release，请手动前往仓库创建');
        }
    } catch (error) {
        console.error('❌ 发布过程中出现错误:', error.message);
        process.exit(1);
    }
}
