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
 *   - uni_modules/uview-pro-x/package.json  组件库版本号（私有库工作副本，需在私有库自行提交）
 *   - uni_modules/uview-pro-x/changelog.md  组件库更新日志（同上）
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 私有组件库（独立 git 仓库，不被本仓库跟踪）
const LIB_DIR = path.join('uni_modules', 'uview-pro-x');
const LIB_PACKAGE_PATH = path.join(LIB_DIR, 'package.json');
const LIB_CHANGELOG_PATH = path.join(LIB_DIR, 'changelog.md');
// 发布提交仅包含的产物文件（不包含工作区其他改动与嵌套仓库）
const RELEASE_FILES = ['package.json', 'CHANGELOG.md'];
// 发布前文件备份目录（放在 git 元数据内，不进入工作区；供 undo 精确回退未被版本库跟踪的文件）
const BACKUP_DIR = path.join('.git', 'uview-release-backup');
const COMMIT_PREFIX = 'chore(release): bump version to';

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
        if (fs.existsSync(LIB_PACKAGE_PATH)) {
            console.log('');
            console.log('⚠️  组件库（uni_modules/uview-pro-x）是独立仓库，版本号与更新日志需在其目录内自行提交推送');
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
        console.log('   2. 撤销最后一次提交（保留修改到暂存区）');
        console.log('   3. 恢复 package.json 与 CHANGELOG.md');
        console.log('');

        if (tagExists) {
            console.log(`🗑️  删除本地标签 ${tagName}...`);
            execSync(`git tag -d ${tagName}`, { stdio: 'inherit' });
        }

        console.log('↩️  撤销最后一次提交...');
        execSync('git reset --soft HEAD~1', { stdio: 'inherit' });

        RELEASE_FILES.forEach(file => {
            console.log(`📄 恢复 ${file}...`);
            try {
                const backupFile = path.join(BACKUP_DIR, file);
                if (fs.existsSync(backupFile)) {
                    // 发布前已备份：按备份写回（覆盖发布提交带入的版本号与 changelog 改动）
                    fs.copyFileSync(backupFile, file);
                    execSync(`git reset -q HEAD -- ${file}`, { stdio: 'pipe' });
                    console.log(`↩️  已按发布前备份恢复 ${file}`);
                    return;
                }
                execSync(`git cat-file -e HEAD:${file}`, { stdio: 'pipe' });
                execSync(`git checkout HEAD -- ${file}`, { stdio: 'inherit' });
            } catch (e) {
                // 发布提交首次纳入、且没有发布前备份：只能取消暂存，内容无法自动回退
                try {
                    execSync(`git reset -q HEAD -- ${file}`, { stdio: 'pipe' });
                } catch (_) {}
                console.log(`⚠️  未找到发布前备份，已取消暂存 ${file}（内容保持当前状态）`);
            }
        });

        // 撤销完成后清理备份，避免影响下一次发布
        fs.rmSync(BACKUP_DIR, { recursive: true, force: true });

        console.log('');
        console.log('✅ 本地发布撤销成功！');
        console.log('');
        console.log('📋 当前状态：');
        console.log(`   • 标签 ${tagName} 已删除`);
        console.log('   • 提交已撤销，package.json 与 CHANGELOG.md 已恢复');
        if (fs.existsSync(LIB_PACKAGE_PATH)) {
            console.log('');
            console.log('⚠️  组件库（uni_modules/uview-pro-x）未自动恢复：其 package.json 版本与 changelog.md 需在私有库内手动回退');
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
        // 备份发布前的产物文件，供 undo 精确回退（未被版本库跟踪的新增文件也能还原）
        fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        RELEASE_FILES.forEach(file => {
            if (fs.existsSync(file)) fs.copyFileSync(file, path.join(BACKUP_DIR, file));
        });

        const currentVersion = readJson('package.json').version;
        const newVersion = targetVersion || bumpVersion(currentVersion, versionType, prereleaseId);

        // 更新本仓库版本号
        console.log(`📦 更新版本号为 ${newVersion}...`);
        const packageJson = readJson('package.json');
        packageJson.version = newVersion;
        writeJson('package.json', packageJson);
        console.log(`✨ 新版本: ${newVersion}`);

        // 同步组件库版本号（私有库工作副本，随私有库提交）
        if (fs.existsSync(LIB_PACKAGE_PATH)) {
            console.log('📦 同步组件库版本号...');
            const libPackage = readJson(LIB_PACKAGE_PATH);
            libPackage.version = newVersion;
            if (libPackage.uni_app) libPackage.uni_app.version = newVersion;
            writeJson(LIB_PACKAGE_PATH, libPackage);
            console.log(`✅ 组件库版本已同步为: ${newVersion}（需在私有库目录自行提交）`);
        } else {
            console.warn('⚠️  未找到组件库 package.json，跳过版本同步');
        }

        // 生成 changelog（同时写入组件库 changelog.md）
        if (skipChangelog) {
            console.log('📝 跳过 changelog 生成');
        } else {
            console.log('📝 生成 changelog...');
            execCommand('npm run changelog:release');
        }

        // 提交发布产物（仅版本号与 changelog，避免误提交工作区其他改动）
        console.log('💾 提交更改...');
        const filesToCommit = RELEASE_FILES.filter(file => fs.existsSync(file));
        execCommand(`git add ${filesToCommit.join(' ')}`);
        execCommand(`git commit -m "${COMMIT_PREFIX} ${newVersion}" -m "- Update package.json version
- Sync uview-pro-x module version
- Generate changelog for ${newVersion}"`);

        // 创建标签
        console.log(`🏷️  创建标签 v${newVersion}...`);
        execCommand(`git tag -a "v${newVersion}" -m "Release version ${newVersion}"`);

        if (shouldPush) {
            console.log('🚀 推送更改和标签...');
            execCommand('git push origin HEAD');
            execCommand(`git push origin "v${newVersion}"`);
        }

        console.log(`${isPrerelease ? '🎉 预览版本' : '✅ 版本'} ${newVersion} 发布成功!`);
        console.log(`🏷️  标签 v${newVersion} ${shouldPush ? '已创建并推送' : '已创建（未推送）'}`);
        if (fs.existsSync(LIB_PACKAGE_PATH)) {
            console.log('');
            console.log('⚠️  组件库（uni_modules/uview-pro-x）是独立仓库：其版本号与 changelog.md 需在私有库内自行提交推送');
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
