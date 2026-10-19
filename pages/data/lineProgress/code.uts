/**
 * lineProgress 演示代码片段
 * 每个片段为可直接运行的完整示例（含 template / script / style）
 */

/** 基础用法 */
const basic = `
<template>
    <ux-line-progress :percent="70"></ux-line-progress>
</template>
`;

/** 配置主题 */
const theme = `
<template>
    <ux-line-progress :percent="30" type="primary"></ux-line-progress>
    <view class="gap"></view>
    <ux-line-progress :percent="60" type="error"></ux-line-progress>
    <view class="gap"></view>
    <ux-line-progress :percent="80" type="warning"></ux-line-progress>
    <view class="gap"></view>
    <ux-line-progress :percent="50" type="info"></ux-line-progress>
</template>

<style scoped>
.gap {
    height: 12px;
}
</style>
`;

/** 自定义颜色 */
const customColor = `
<template>
    <ux-line-progress :percent="40" active-color="#2979ff" inactive-color="#ecf5ff"></ux-line-progress>
</template>
`;

/** 自定义高度 */
const customHeight = `
<template>
    <ux-line-progress :percent="50" :height="6"></ux-line-progress>
    <view class="gap"></view>
    <ux-line-progress :percent="50" :height="20"></ux-line-progress>
</template>

<style scoped>
.gap {
    height: 12px;
}
</style>
`;

/** 隐藏百分比 */
const hidePercent = `
<template>
    <ux-line-progress :percent="70" :show-percent="false"></ux-line-progress>
    <view class="gap"></view>
    <ux-line-progress :percent="70">
        <text class="slot-text">自定义内容</text>
    </ux-line-progress>
</template>

<style scoped>
.gap {
    height: 12px;
}
.slot-text {
    font-size: 10px;
    color: #ffffff;
}
</style>
`;

/** 条纹动画 */
const striped = `
<template>
    <ux-line-progress :percent="60" :striped="true"></ux-line-progress>
    <view class="gap"></view>
    <ux-line-progress :percent="60" :striped="true" :striped-active="true"></ux-line-progress>
</template>

<style scoped>
.gap {
    height: 12px;
}
</style>
`;

/** 形状两档 */
const round = `
<template>
    <!-- 两档形状全演示：round 胶囊（不传即此档），square 小圆角 3px（平头） -->
    <ux-line-progress :percent="80" shape="round"></ux-line-progress>
    <ux-line-progress :percent="80" shape="square"></ux-line-progress>
</template>
`;

export const codes = {
    basic,
    theme,
    customColor,
    customHeight,
    hidePercent,
    striped,
    round
};
