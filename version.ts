/**
 * 版本与新增能力登记（演示站版本号的唯一来源）
 *
 * 版本号不在这里写死：直接取根 package.json 的 version（HBuilderX 4.25+ 支持 uts 直接 import json），
 * 发版时用 `npm run release:patch` 等脚本改 package.json 即可，本文件自动跟随。
 *
 * 新增组件 / 新功能时只需一步：在 SINCE_ENTRIES 追加一行 { path, since }，
 * path 与 pages.json 路由一致（不含 /pages/ 前缀）。
 *
 * 印章取数规则：
 * - 入口印章（组件页 / 工具页列表）：仅当 since == LIB_VERSION（本轮新版本）时显示，下个版本自动收起
 * - 页面印章（demo-page 头部）：显示该页首次支持的版本，长期保留
 * 新增演示页时，页面头部传 `:since="sinceOf('xxx/index')"` 即可显示页面印章。
 */

import { version } from '@/package.json';

/** 组件库当前版本（取 package.json 的 version，勿在此硬编码） */
export const LIB_VERSION: string = version;

/** 展示用版本号（带 v 前缀） */
export const LIB_VERSION_TEXT = 'v' + LIB_VERSION;

/** 新增能力登记项 */
export type SinceEntry = {
    /** 页面路由（不含 /pages/ 前缀，与 MenuItem.path 一致） */
    path: string;
    /** 首次支持该能力的版本 */
    since: string;
};

/** 新增能力登记表：新增页面时在此追加一行 */
export const SINCE_ENTRIES: SinceEntry[] = [
    { path: 'library/request/index', since: '1.0.24' },
    { path: 'library/request/best-practice/index', since: '1.0.24' },
    { path: 'library/useRequest/index', since: '1.0.24' }
];

/** 取页面首次支持版本；未登记返回空串 */
export const sinceOf = (path: string): string => {
    for (let i = 0; i < SINCE_ENTRIES.length; i++) {
        if (SINCE_ENTRIES[i].path == path) {
            return SINCE_ENTRIES[i].since;
        }
    }
    return '';
};

/** 是否本轮版本新增：入口印章只在最新版本显示 */
export const isCurrentNew = (since: string): boolean => {
    return since != '' && since == LIB_VERSION;
};

/**
 * 入口印章用版本号：本轮新增返回 since，否则返回空串
 * @description 模板里直接 `:version="currentNewVersion(item.path)"`，空串时印章不渲染
 */
export const currentNewVersion = (path: string): string => {
    const since = sinceOf(path);
    return isCurrentNew(since) ? since : '';
};
