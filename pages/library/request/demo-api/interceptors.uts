import type { HttpError, HttpInstance, HttpResponse, ResolvedHttpConfig } from '@/uni_modules/uview-pro-x';

/** 演示用 token 存储键：真实项目换成登录态写入的键 */
const TOKEN_KEY = 'request-demo-token';

/** 自有域名白名单：外链请求同样会经过拦截器，只给这些域名注入凭证 */
const TRUSTED_HOSTS: Array<string> = ['https://httpbin.org', 'https://httpbingo.org'];

/** 读取 token：每次请求都现读，登录 / 登出后立即生效 */
const readToken = (): string => {
    const raw = uni.getStorageSync(TOKEN_KEY);
    if (raw != null && typeof raw == 'string') {
        const text = raw as string;
        if (text.length > 0) return text;
    }
    // 演示环境没有登录流程，用固定占位值，方便在回显里看到注入结果
    return 'demo-guest';
};

/** 域名白名单判定 */
const isTrusted = (url: string): boolean => {
    for (let i = 0; i < TRUSTED_HOSTS.length; i++) {
        if (url.startsWith(TRUSTED_HOSTS[i])) return true;
    }
    return false;
};

/** 请求拦截器：统一注入凭证 */
const injectToken = (config: ResolvedHttpConfig): ResolvedHttpConfig => {
    // config.url 是拼好 baseURL 的完整地址，可据此判断域名
    if (!isTrusted(config.url)) return config;
    config.headers['authorization'] = 'Bearer ' + readToken();
    return config;
};

/** 响应拦截器：统一解包，页面直接拿业务数据 */
const unwrap = (response: HttpResponse): any => {
    return response.data;
};

/** 响应错误拦截器：统一提示，取消属于正常流程不提示 */
const reportError = (error: HttpError): HttpError => {
    if (error.code != 'ERR_CANCELED') {
        uni.showToast({ title: error.message, icon: 'none' });
    }
    return error;
};

/**
 * 给任意实例安装同一套拦截器
 * @description 拦截器不随 create 继承；实例没有 eject，同一实例只调用一次
 */
export function setupInterceptors(instance: HttpInstance): void {
    instance.interceptors.request.use(injectToken);
    instance.interceptors.response.use(unwrap, reportError);
}
