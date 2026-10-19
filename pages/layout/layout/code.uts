/**
 * layout 演示代码片段
 * 每个片段为可直接运行的完整示例（含 template / script / style）
 */

/** 基础用法 */
const basic = `
<template>
    <ux-row :gutter="5">
        <ux-col :span="6">
            <view class="block block-primary" />
        </ux-col>
        <ux-col :span="6">
            <view class="block block-success" />
        </ux-col>
    </ux-row>
</template>

<style scoped>
.block {
    height: 40px;
    border-radius: 4px;
}
.block-primary {
    background-color: #2979ff;
}
.block-success {
    background-color: #19be6b;
}
</style>
`;

/** 分栏占比 */
const span = `
<template>
    <ux-row :gutter="5">
        <ux-col :span="4">
            <view class="block block-primary" />
        </ux-col>
        <ux-col :span="4">
            <view class="block block-success" />
        </ux-col>
        <ux-col :span="4">
            <view class="block block-warning" />
        </ux-col>
    </ux-row>
    <view class="gap" />
    <ux-row :gutter="5">
        <ux-col :span="8">
            <view class="block block-primary" />
        </ux-col>
        <ux-col :span="4">
            <view class="block block-error" />
        </ux-col>
    </ux-row>
</template>

<style scoped>
.block {
    height: 40px;
    border-radius: 4px;
}
.gap {
    height: 12px;
}
.block-primary {
    background-color: #2979ff;
}
.block-success {
    background-color: #19be6b;
}
.block-warning {
    background-color: #ff9900;
}
.block-error {
    background-color: #fa3534;
}
</style>
`;

/** 偏移 */
const offset = `
<template>
    <ux-row :gutter="5">
        <ux-col :span="4">
            <view class="block block-primary" />
        </ux-col>
        <ux-col :span="4" :offset="4">
            <view class="block block-success" />
        </ux-col>
    </ux-row>
</template>

<style scoped>
.block {
    height: 40px;
    border-radius: 4px;
}
.block-primary {
    background-color: #2979ff;
}
.block-success {
    background-color: #19be6b;
}
</style>
`;

/** 栅格间隔 */
const gutter = `
<template>
    <ux-row :gutter="20">
        <ux-col :span="3">
            <view class="block block-primary" />
        </ux-col>
        <ux-col :span="3">
            <view class="block block-success" />
        </ux-col>
        <ux-col :span="3">
            <view class="block block-warning" />
        </ux-col>
        <ux-col :span="3">
            <view class="block block-error" />
        </ux-col>
    </ux-row>
</template>

<style scoped>
.block {
    height: 40px;
    border-radius: 4px;
}
.block-primary {
    background-color: #2979ff;
}
.block-success {
    background-color: #19be6b;
}
.block-warning {
    background-color: #ff9900;
}
.block-error {
    background-color: #fa3534;
}
</style>
`;

/** 对齐方式 */
const align = `
<template>
    <ux-row justify="space-between" align="bottom">
        <ux-col :span="6">
            <view class="block block-primary" :style="{ height: '50px' }" />
        </ux-col>
        <ux-col :span="6">
            <view class="block block-success" />
        </ux-col>
    </ux-row>
</template>

<style scoped>
.block {
    height: 40px;
    border-radius: 4px;
}
.block-primary {
    background-color: #2979ff;
}
.block-success {
    background-color: #19be6b;
}
</style>
`;

export const codes = {
    basic,
    span,
    offset,
    gutter,
    align
};
