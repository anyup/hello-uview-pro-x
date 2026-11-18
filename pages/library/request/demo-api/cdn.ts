import { request } from './request';
import { setupInterceptors } from './interceptors';

/** 第二域名：演示多域名派生，真实项目换成 cdn.xxx.com；此处选支持 CORS 的 httpbin 兼容服务 */
const CDN_BASE = 'https://httpbingo.org';

/**
 * 派生实例：继承 request 的 defaults（headers / meta / validateStatus），只覆盖 baseURL 与超时
 * @description create 不继承拦截器，因此响应解包与凭证注入在这里默认不生效
 */
const cdnRequest = request.create({
    baseURL: CDN_BASE,
    timeout: 30000
});

/** 是否已安装：实例没有 eject，重复安装会叠加拦截器 */
let installed = false;

/** 给第二实例安装同一套拦截器，返回本次是否真的安装了 */
export function installCdnInterceptors(): boolean {
    if (installed) return false;
    setupInterceptors(cdnRequest);
    installed = true;
    return true;
}

/** 拦截器是否已安装：页面据此区分「未解包 / 已解包」两种结果形态 */
export function isCdnInterceptorsInstalled(): boolean {
    return installed;
}

export { cdnRequest, CDN_BASE };
