/**
 * countDown 演示代码片段
 * 每个片段为可直接运行的完整示例（含 template / script / style）
 */

/** 基础用法 */
const basic = `
<template>
    <ux-count-down :timestamp="86399"></ux-count-down>
</template>
`;

/** 中文分隔符 */
const zhSep = `
<template>
    <ux-count-down :timestamp="86399" separator="zh"></ux-count-down>
    <view class="gap"></view>
    <ux-count-down :timestamp="86399" separator="zh" separator-color="#fa3534"></ux-count-down>
</template>

<style scoped>
.gap {
    height: 20px;
}
</style>
`;

/** 隐藏天 */
const hideDays = `
<template>
    <ux-count-down :timestamp="86400" :show-days="false"></ux-count-down>
</template>
`;

/** 自定义样式 */
const customStyle = `
<template>
    <ux-count-down :timestamp="3600" :font-size="20" color="#2979ff" :separator-size="15"></ux-count-down>
</template>
`;

/** 数字边框 */
const border = `
<template>
    <ux-count-down :timestamp="7200" :show-border="true" :height="32" bg-color="#ecf5ff" color="#fb7299"></ux-count-down>
    <view class="gap"></view>
    <ux-count-down :timestamp="7200" :show-border="true" :height="32" border-color="#19be6b" bg-color="#f0f9eb" color="#67c23a"></ux-count-down>
</template>

<style scoped>
.gap {
    height: 20px;
}
</style>
`;

/** 显示单元控制 */
const units = `
<template>
    <ux-count-down :timestamp="59" :show-days="false" :show-hours="false" :show-minutes="false"></ux-count-down>
    <view class="gap"></view>
    <ux-count-down :timestamp="7200" :show-seconds="false"></ux-count-down>
</template>

<style scoped>
.gap {
    height: 20px;
}
</style>
`;

/** 隐藏零天 */
const zeroDay = `
<template>
    <ux-count-down :timestamp="3599" :hide-zero-day="false"></ux-count-down>
    <view class="gap"></view>
    <ux-count-down :timestamp="3599" :hide-zero-day="true"></ux-count-down>
</template>

<style scoped>
.gap {
    height: 20px;
}
</style>
`;

/** 毫秒刷新 */
const ms = `
<template>
    <ux-count-down :timestamp="3660" :millisecond="true"></ux-count-down>
</template>
`;

/** 格式模板 */
const format = `
<template>
    <ux-count-down :timestamp="90061" format="DD HH:mm:ss"></ux-count-down>
    <view class="gap"></view>
    <ux-count-down :timestamp="90061" format="HH:mm:ss"></ux-count-down>
    <view class="gap"></view>
    <ux-count-down :timestamp="7200" format="mm:ss"></ux-count-down>
    <view class="gap"></view>
    <ux-count-down :timestamp="125" format="mm:ss.SSS" :millisecond="true"></ux-count-down>
</template>

<style scoped>
.gap {
    height: 20px;
}
</style>
`;

/** 自定义插槽 */
const slot = `
<template>
    <ux-count-down :timestamp="3661" format="HH:mm:ss">
        <template #default="{ current }">
            <view class="slot-row">
                <view class="slot-block"><text class="slot-block-text">{{ pad(current.hours) }}</text></view>
                <text class="slot-colon">:</text>
                <view class="slot-block"><text class="slot-block-text">{{ pad(current.minutes) }}</text></view>
                <text class="slot-colon">:</text>
                <view class="slot-block"><text class="slot-block-text">{{ pad(current.seconds) }}</text></view>
                <text class="slot-suffix">后结束</text>
            </view>
        </template>
    </ux-count-down>
</template>

<script setup lang="ts">
import { $u } from '@/uni_modules/uview-pro-x';

/** 两位补零 */
const pad = (value: number): string => $u.padZero(value);
</script>

<style scoped>
.slot-row {
    display: flex;
    flex-direction: row;
    align-items: center;
}
.slot-block {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background-color: #2979ff;
}
.slot-block-text {
    font-size: 13px;
    color: #ffffff;
}
.slot-colon {
    margin-left: 5px;
    margin-right: 5px;
    font-size: 14px;
    color: #2979ff;
}
.slot-suffix {
    margin-left: 8px;
    font-size: 13px;
    color: #909399;
}
</style>
`;

/** 手动控制 */
const control = `
<template>
    <ux-count-down ref="countDownRef" :timestamp="60" :autoplay="false" @end="onControlEnd"></ux-count-down>
    <view class="gap"></view>
    <view class="btn-row">
        <view class="btn" @click="startCountDown"><text class="btn-text">开始</text></view>
        <view class="btn" @click="pauseCountDown"><text class="btn-text">暂停</text></view>
        <view class="btn" @click="resetCountDown"><text class="btn-text">重置</text></view>
    </view>
    <text class="status">{{ controlStatusText }}</text>
</template>

<script setup lang="ts">
const countDownRef = ref<any>();

/** 状态：idle 未开始 / running 倒计时中 / paused 已暂停 / ended 已结束 */
const controlStatus = ref<string>('idle');

const controlStatusText = computed((): string => {
    if (controlStatus.value == 'running') return '当前状态：倒计时中';
    if (controlStatus.value == 'paused') return '当前状态：已暂停';
    if (controlStatus.value == 'ended') return '当前状态：已结束';
    return '当前状态：未开始';
});

function startCountDown(): void {
    countDownRef.value?.start();
    controlStatus.value = 'running';
}

function pauseCountDown(): void {
    countDownRef.value?.pause();
    controlStatus.value = 'paused';
}

function resetCountDown(): void {
    countDownRef.value?.reset();
    controlStatus.value = 'idle';
}

function onControlEnd(): void {
    controlStatus.value = 'ended';
}
</script>

<style scoped>
.gap {
    height: 20px;
}
.btn-row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 8px;
}
.btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    margin-right: 8px;
    margin-bottom: 8px;
    border-radius: 4px;
    background-color: #ecf5ff;
}
.btn-text {
    font-size: 13px;
    color: #2979ff;
}
.status {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
}
</style>
`;

/** 格式化 + 自定义单位文案 */
const formatI18n = `
<template>
    <ux-count-down :timestamp="90061" :format="formatText"></ux-count-down>
</template>

<script setup lang="ts">
import { useLocale } from '@/uni_modules/uview-pro-x';

const { t } = useLocale('demo');

/** format 是普通字符串 prop，可直接绑定 computed */
const formatText = computed((): string => \`HH \${t('countDown.unitHour')} mm \${t('countDown.unitMinute')} ss \${t('countDown.unitSecond')}\`);
</script>
`;

export const codes = {
    basic,
    zhSep,
    hideDays,
    customStyle,
    border,
    units,
    zeroDay,
    ms,
    format,
    formatI18n,
    slot,
    control
};