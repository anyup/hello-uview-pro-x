/**
 * gap 演示代码片段
 * 每个片段为可直接运行的完整示例（含 template / script / style）
 */

/** 基础用法 */
const basic = `
<template>
    <view class="box">
        <text class="box-text">区块一</text>
    </view>
    <ux-gap></ux-gap>
    <view class="box">
        <text class="box-text">区块二</text>
    </view>
</template>

<style scoped>
.box {
    width: 100%;
    height: 50px;
    background-color: #f2f3f5;
    border-radius: 8px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.box-text {
    font-size: 14px;
    color: #606266;
}
</style>
`;

/** 高度 */
const height = `
<template>
    <view class="box">
        <text class="box-text">区块一</text>
    </view>
    <ux-gap height="40"></ux-gap>
    <view class="box">
        <text class="box-text">区块二</text>
    </view>
</template>

<style scoped>
.box {
    width: 100%;
    height: 50px;
    background-color: #f2f3f5;
    border-radius: 8px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.box-text {
    font-size: 14px;
    color: #606266;
}
</style>
`;

/** 背景颜色 */
const bgColor = `
<template>
    <view class="box">
        <text class="box-text">区块一</text>
    </view>
    <ux-gap height="20" bg-color="#f56c6c"></ux-gap>
    <view class="box">
        <text class="box-text">区块二</text>
    </view>
</template>

<style scoped>
.box {
    width: 100%;
    height: 50px;
    background-color: #f2f3f5;
    border-radius: 8px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.box-text {
    font-size: 14px;
    color: #606266;
}
</style>
`;

/** 上下间距 */
const margin = `
<template>
    <view class="box">
        <text class="box-text">区块一</text>
    </view>
    <ux-gap height="15" margin-top="20" margin-bottom="20"></ux-gap>
    <view class="box">
        <text class="box-text">区块二</text>
    </view>
</template>

<style scoped>
.box {
    width: 100%;
    height: 50px;
    background-color: #f2f3f5;
    border-radius: 8px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.box-text {
    font-size: 14px;
    color: #606266;
}
</style>
`;

/** 透明背景 */
const transparent = `
<template>
    <view class="box">
        <text class="box-text">区块一</text>
    </view>
    <ux-gap height="15" bg-color="transparent"></ux-gap>
    <view class="box">
        <text class="box-text">区块二</text>
    </view>
</template>

<style scoped>
.box {
    width: 100%;
    height: 50px;
    background-color: #f2f3f5;
    border-radius: 8px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.box-text {
    font-size: 14px;
    color: #606266;
}
</style>
`;

export const codes = {
    basic,
    height,
    bgColor,
    margin,
    transparent
};
