/**
 * signature 演示代码片段
 * 每个片段为可直接运行的完整示例（含 template / script / style）
 */

/** 基础用法 */
const basic = `
<template>
    <ux-signature @submit="onSubmit" />
    <ux-modal
        v-model="showPreview"
        title="签名图片"
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
    if (image == '') return;
    preview.value = image;
    showPreview.value = true;
}
</script>

<!-- 保存图片：先 uni.base64ToArrayBuffer + getFileSystemManager().writeFile 落临时文件，
     再调用 uni.saveImageToPhotosAlbum({ filePath })；H5 端不支持保存到相册。 -->
`;

/** 自定义画笔 */
const line = `
<template>
    <ux-signature line-color="#fa3534" :line-width="6" @submit="onSubmit" />
</template>

<script setup lang="ts">
function onSubmit(image: string): void {
    console.log('base64 长度', image.length);
}
</script>
`;

/** 提示语 */
const tips = `
<template>
    <ux-signature tips="请在此签名确认" :tips-size="20" tips-color="rgba(144, 147, 153, 0.45)" @submit="onSubmit" />
    <ux-gap :height="8" />
    <ux-signature :show-tips="false" @submit="onSubmit" />
</template>
`;

/** 按钮配置 */
const button = `
<template>
    <ux-signature :show-revoke="true" clear-text="重写" revoke-text="撤销" confirm-text="保存" @submit="onSubmit" />
</template>
`;

/** 实例方法 */
const method = `
<template>
    <ux-signature
        ref="signatureRef"
        :height="160"
        :show-clear="false"
        :show-confirm="false"
        :show-revoke="false"
    />
    <view class="signature-actions">
        <view class="signature-action">
            <ux-button size="small" @click="onClear">清空</ux-button>
        </view>
        <view class="signature-action">
            <ux-button size="small" type="warning" @click="onRevoke">撤销</ux-button>
        </view>
        <view class="signature-action">
            <ux-button size="small" type="primary" @click="onDone">导出</ux-button>
        </view>
    </view>
</template>

<script setup lang="ts">
type SignatureExpose = {
    clear: () => void;
    revoke: () => void;
    done: () => string;
};

const signatureRef = ref<SignatureExpose | null>(null);

function onClear(): void {
    signatureRef.value?.clear();
}

function onRevoke(): void {
    signatureRef.value?.revoke();
}

function onDone(): void {
    // 此处接预览弹窗
    console.log('base64', signatureRef.value?.done() ?? '');
}
</script>

<style lang="scss">
.signature-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    margin-top: 12px;
}

.signature-action {
    margin-left: 10px;
}
</style>
`;

/** 背景与导出格式 */
const background = `
<template>
    <ux-signature export-bg-color="#ffffff" line-color="#303133" tips="背景色 #ffffff · jpeg" export-format="jpeg" :quality="0.6" @submit="onSubmit" />
    <ux-gap :height="8" />
    <ux-signature export-bg-color="#f8f8f8" line-color="#303133" tips="背景色 #f8f8f8" @submit="onSubmit" />
</template>
`;

/** 自定义尺寸 */
const size = `
<template>
    <ux-signature width="80%" :height="140" @submit="onSubmit" />
</template>
`;

/** 禁用书写 */
const disabled = `
<template>
    <ux-signature :disabled="true" @submit="onSubmit" />
</template>
`;

export const codes = {
    basic,
    line,
    tips,
    button,
    method,
    background,
    size,
    disabled
};