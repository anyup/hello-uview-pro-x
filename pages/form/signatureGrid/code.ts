/**
 * signatureGrid 演示代码片段
 * 每个片段为可直接运行的完整示例（含 template / script / style）
 * 说明：grid-type / grid-size / guide-text / grid-color / guide-color 的完整说明见 ux-signature API 卡片
 */

/** 格子类型 */
const type = `
<template>
    <ux-signature grid-type="mi" guide-text="米字格" :height="160" export-bg-color="#ffffff" line-color="#303133" :show-tips="false" @submit="onSubmit" />
    <ux-gap :height="8" />
    <ux-signature grid-type="tian" guide-text="田字格" :height="160" export-bg-color="#ffffff" line-color="#303133" :show-tips="false" @submit="onSubmit" />
    <ux-gap :height="8" />
    <ux-signature grid-type="nine" guide-text="九宫格" :height="160" export-bg-color="#ffffff" line-color="#303133" :show-tips="false" @submit="onSubmit" />
</template>

<script setup lang="ts">
// grid-type：mi 米字格 | tian 田字格 | nine 九宫格，空串关闭格线
// 格线绘制在画布内，导出图保留网格；描红只作屏幕提示，不写入导出图，笔迹压在描红之上
function onSubmit(image: string): void {
    console.log('base64 长度', image.length);
}
</script>
`;

/** 格子大小 */
const size = `
<template>
    <ux-signature grid-type="mi" :grid-size="32" :height="140" :show-tips="false" @submit="onSubmit" />
    <ux-gap :height="8" />
    <ux-signature grid-type="mi" :grid-size="64" :height="140" :show-tips="false" @submit="onSubmit" />
    <ux-gap :height="8" />
    <ux-signature grid-type="mi" :grid-size="96" :height="140" :show-tips="false" @submit="onSubmit" />
</template>

<script setup lang="ts">
// grid-size 单位 px，内部钳制在 24-120；列数行数按画布尺寸自动计算
// 格子越大每行格数越少，无描红时铺满可视区域
function onSubmit(image: string): void {
    console.log('base64 长度', image.length);
}
</script>
`;

/** 网格与描红颜色 */
const color = `
<template>
    <ux-signature
        grid-type="tian"
        guide-text="水墨"
        grid-color="rgba(64, 158, 255, 0.75)"
        guide-color="rgba(64, 158, 255, 0.35)"
        :height="140"
        export-bg-color="#ffffff"
        line-color="#1f2d3d"
        :show-tips="false"
        @submit="onSubmit"
    />
    <ux-gap :height="8" />
    <ux-signature
        grid-type="mi"
        guide-text="听雨"
        grid-color="#c0c4cc"
        guide-color="rgba(96, 98, 102, 0.35)"
        :height="140"
        export-bg-color="#f7f8fa"
        line-color="#303133"
        :show-tips="false"
        @submit="onSubmit"
    />
</template>

<script setup lang="ts">
// grid-color 控制网格线颜色，guide-color 控制描红文字颜色
// 两者默认都是参考线红，换成蓝/灰可得到钢笔、铅笔字帖的观感
function onSubmit(image: string): void {
    console.log('base64 长度', image.length);
}
</script>
`;

/** 描红内容 */
const guide = `
<template>
    <ux-signature grid-type="mi" guide-text="永" :height="140" export-bg-color="#ffffff" line-color="#303133" :show-tips="false" @submit="onSubmit" />
    <ux-gap :height="8" />
    <ux-signature
        grid-type="mi"
        guide-text="书山有路勤为径学海无涯苦作舟"
        :height="140"
        export-bg-color="#ffffff"
        line-color="#303133"
        :show-tips="false"
        @submit="onSubmit"
    />
</template>

<script setup lang="ts">
// guide-text 逐字写入格子，行数随文字长度增加，默认整块垂直居中
// 超出当前行数能容纳的字会截断，画布高度不够时调大 height 或多写几行
function onSubmit(image: string): void {
    console.log('base64 长度', image.length);
}
</script>
`;

/** 格线对齐 */
const align = `
<template>
    <ux-signature grid-type="mi" guide-text="居中" :height="160" export-bg-color="#ffffff" line-color="#303133" :show-tips="false" @submit="onSubmit" />
    <ux-gap :height="8" />
    <ux-signature grid-type="mi" guide-text="顶齐" grid-align="top" :height="160" export-bg-color="#ffffff" line-color="#303133" :show-tips="false" @submit="onSubmit" />
</template>

<script setup lang="ts">
// grid-align：center 居中（默认）| top 顶对齐
// 单行或少量描红居中观感更平衡；多行字帖式书写可设为 top，让第一行贴齐顶部
function onSubmit(image: string): void {
    console.log('base64 长度', image.length);
}
</script>
`;

/** 导出与撤销 */
const exportImage = `
<template>
    <ux-signature
        grid-type="mi"
        guide-text="签名练习"
        :show-revoke="true"
        export-bg-color="#ffffff"
        line-color="#303133"
        :show-tips="false"
        @submit="onSubmit"
    />
    <ux-gap :height="8" />
    <ux-signature grid-type="mi" guide-text="签到" :height="140" :show-tips="false" @submit="onSubmit" />
    <ux-modal
        v-model="showPreview"
        title="导出图片（含格）"
        cancel-text="保存图片"
        confirm-text="确认"
        :show-cancel-button="true"
    >
        <image :src="preview" mode="widthFix" />
    </ux-modal>
</template>

<script setup lang="ts">
const showPreview = ref(false);
const preview = ref<string>('');

function onSubmit(image: string): void {
    if (image == '') {
        uni.showToast({ title: '请先手写', icon: 'none' });
        return;
    }
    preview.value = image;
    showPreview.value = true;
}
</script>

<!-- 格线在画布内：撤销、清空后自动重铺，导出图保留网格；描红只作屏幕提示，不写入导出图；
     不设 bg-color 时导出透明背景（只保留网格与笔迹），白纸效果需设置 bg-color 并搭配深色 line-color。
     保存图片：uni.base64ToArrayBuffer + getFileSystemManager().writeFile 落临时文件，
     再调用 uni.saveImageToPhotosAlbum({ filePath })；H5 端不支持保存到相册。 -->
`;

/** 导出笔迹（不含格） */
const inkExport = `
<template>
    <ux-signature
        grid-type="mi"
        guide-text="签名练习"
        :export-grid="false"
        export-bg-color="#ffffff"
        line-color="#303133"
        :show-tips="false"
        @submit="onSubmit"
    />
    <ux-gap :height="8" />
    <ux-signature
        grid-type="mi"
        guide-text="签名练习"
        :export-grid="true"
        export-bg-color="#ffffff"
        line-color="#303133"
        :show-tips="false"
        @submit="onSubmit"
    />
    <ux-modal
        v-model="showPreview"
        title="导出图片"
        cancel-text="保存图片"
        confirm-text="确认"
        :show-cancel-button="true"
    >
        <image :src="preview" mode="widthFix" />
    </ux-modal>
</template>

<script setup lang="ts">
const showPreview = ref(false);
const preview = ref<string>('');

function onSubmit(image: string): void {
    if (image == '') {
        uni.showToast({ title: '请先手写', icon: 'none' });
        return;
    }
    preview.value = image;
    showPreview.value = true;
}
</script>

<!-- export-grid 默认 true：导出保留网格与笔迹；描红只作屏幕提示，任何导出图都不包含；
     设为 false 时先清屏、只铺 bg-color 与笔画再取图，导出图不含网格，屏幕显示不变；
     点「确定」在弹窗里对照上方（纯净）与下方（含格）两张图。
     降级：无笔画或尺寸变化后自动回退为屏幕快照，不会返回空图。 -->
`;

export const codes = {
    type,
    size,
    color,
    guide,
    align,
    exportImage,
    inkExport
};