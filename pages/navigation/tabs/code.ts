/**
 * tabs 演示代码片段
 * 每个片段为可直接运行的完整示例（含 template / script / style）
 */

/** 基础用法 */
const basic = `
<template>
    <ux-tabs :list="list" :current="current" @change="onChange" />
</template>

<script setup lang="ts">
import type { TabsItem } from '@/uni_modules/uview-pro-x';

const current = ref<number>(0);

const list: TabsItem[] = [
    { name: '标签一' },
    { name: '标签二' },
    { name: '标签三' },
    { name: '标签四' },
    { name: '标签五' }
];

const onChange = (index: number) => {
    current.value = index;
};
</script>
`;

/** 禁止滚动 */
const noScroll = `
<template>
    <ux-tabs :list="list" :is-scroll="false" :current="current" @change="onChange" />
</template>

<script setup lang="ts">
import type { TabsItem } from '@/uni_modules/uview-pro-x';

const current = ref<number>(0);

const list: TabsItem[] = [
    { name: '标签一' },
    { name: '标签二' },
    { name: '标签三' }
];

const onChange = (index: number) => {
    current.value = index;
};
</script>
`;

/** 自定义颜色 */
const color = `
<template>
    <ux-tabs :list="list" active-color="#ffa500" inactive-color="#909399" :current="current" @change="onChange" />
</template>

<script setup lang="ts">
import type { TabsItem } from '@/uni_modules/uview-pro-x';

const current = ref<number>(0);

const list: TabsItem[] = [
    { name: '标签一' },
    { name: '标签二' },
    { name: '标签三' }
];

const onChange = (index: number) => {
    current.value = index;
};
</script>
`;

/** 字号 */
const fontSize = `
<template>
    <ux-tabs :list="list" :font-size="20" :current="current" @change="onChange" />
</template>

<script setup lang="ts">
import type { TabsItem } from '@/uni_modules/uview-pro-x';

const current = ref<number>(0);

const list: TabsItem[] = [
    { name: '标签一' },
    { name: '标签二' },
    { name: '标签三' },
    { name: '标签四' },
    { name: '标签五' }
];

const onChange = (index: number) => {
    current.value = index;
};
</script>
`;

/** 激活项样式 */
const activeItem = `
<template>
    <ux-tabs :list="list" :active-item-style="activeItemStyle" :current="current" @change="onChange" />
</template>

<script setup lang="ts">
import { $u, type TabsItem } from '@/uni_modules/uview-pro-x';
import type { JsonObject } from '@/uni_modules/uview-pro-x';

const current = ref<number>(0);

const list: TabsItem[] = [
    { name: '标签一' },
    { name: '标签二' },
    { name: '标签三' },
    { name: '标签四' },
    { name: '标签五' }
];

/** 激活项样式：圆角 + 主题浅灰底 */
const activeItemStyle = computed((): JsonObject => {
    const style: JsonObject = {};
    style['border-radius'] = '6px';
    style['background-color'] = $u.color.bgGrayLight;
    return style;
});

const onChange = (index: number) => {
    current.value = index;
};
</script>
`;

/** 徽标 */
const badge = `
<template>
    <ux-tabs :list="list" :is-scroll="false" :current="current" @change="onChange" />
</template>

<script setup lang="ts">
import type { TabsItem } from '@/uni_modules/uview-pro-x';

const current = ref<number>(0);

const list: TabsItem[] = [
    { name: '标签一', count: 5 },
    { name: '标签二', count: 20 },
    { name: '标签三', count: 100 },
    { name: '标签四' }
];

const onChange = (index: number) => {
    current.value = index;
};
</script>
`;

export const codes = {
    basic,
    noScroll,
    color,
    fontSize,
    activeItem,
    badge
};
