/**
 * divider 演示代码片段
 * 每个片段为可直接运行的完整示例（含 template / script / style）
 */

/** 基础用法 */
const basic = `
<template>
    <ux-divider>分割线</ux-divider>
</template>
`;

/** 文字颜色 */
const color = `
<template>
    <ux-divider color="#f56c6c">分割线</ux-divider>
</template>
`;

/** 线条颜色 */
const borderColor = `
<template>
    <ux-divider border-color="#2979ff">分割线</ux-divider>
</template>
`;

/** 主题色 */
const type = `
<template>
    <view>
        <ux-divider type="success">分割线</ux-divider>
        <ux-divider type="error">分割线</ux-divider>
        <ux-divider type="warning">分割线</ux-divider>
        <ux-divider type="info">分割线</ux-divider>
    </view>
</template>
`;

/** 自定义高度 */
const height = `
<template>
    <ux-divider height="40">分割线</ux-divider>
</template>
`;

/** 不用 slot */
const useSlot = `
<template>
    <ux-divider :use-slot="false" />
</template>
`;

/** 自定义半宽 */
const halfWidth = `
<template>
    <view>
        <ux-divider half-width="100">分割线</ux-divider>
        <ux-divider half-width="50%">分割线</ux-divider>
    </view>
</template>
`;

export const codes = {
    basic,
    color,
    borderColor,
    type,
    height,
    useSlot,
    halfWidth
};
