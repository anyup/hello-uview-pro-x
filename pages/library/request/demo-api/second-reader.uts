import { request } from './request';

/**
 * 模拟「另一个页面」：只 import 单例模块，不重新 create
 * @description 读到的 baseURL / timeout / headers 与 request 模块页完全一致
 */
export function describeSharedInstance(): string {
    const headers = request.defaults.headers;
    const client = headers['x-client'] as string;
    const contentType = headers['content-type'] as string;
    return 'baseURL=' + request.defaults.baseURL
        + ' · timeout=' + request.defaults.timeout.toString()
        + ' · x-client=' + client
        + ' · content-type=' + contentType;
}
