/**
 * popover 演示代码片段
 *
 * 每个片段都是可直接运行的完整示例（template + script + style），与 index.uvue 的演示块一一对应。
 * 片段格式约定（新增片段请照此补齐，别各写一套）：
 * 1. 三段顺序固定：template → script → style，段间空一行；
 * 2. 模板缩进 4 空格，属性 3 个以内写一行、4 个以上每行一个；
 * 3. 类名统一 popover- 前缀，样式按「容器 → 触发区 → 内容」排列；
 * 4. 深色底上的文字颜色必须写在 text 自身（App 端 text 不继承父级 color）；
 * 5. 模板里不读源数组长度或下标，最后一项的分隔线由数据层给。
 */

/** B1 基础用法：v-model:show + #menu 插槽 */
const basic = `
<template>
    <view class="popover-row">
        <ux-popover v-model:show="show" placement="bottom-end">
            <ux-button shape="round" size="small" type="primary" text="点我展开" @click="show = true"></ux-button>
            <template #menu>
                <view class="popover-menu">
                    <ux-cell-item title="编辑资料" :arrow="false" @click="onPick()"></ux-cell-item>
                    <ux-cell-item title="复制链接" :arrow="false" @click="onPick()"></ux-cell-item>
                    <ux-cell-item title="删除" :arrow="false" :border-bottom="false" @click="onPick()"></ux-cell-item>
                </view>
            </template>
        </ux-popover>
    </view>
</template>

<script setup lang="ts">
const show = ref<boolean>(false);

// 点菜单项后由调用方自己关：组件不猜插槽里的点击语义
function onPick(): void {
    show.value = false;
}
</script>

<style lang="scss">
/* 触发区必须是 flex 容器：组件只给触发区 align-self: flex-start，非 flex 父级会让它占满一行 */
.popover-row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
}
/* 面板宽度由内容撑开，给菜单一个最小宽度 */
.popover-menu {
    min-width: 180px;
}
</style>
`;

/** B2 六个方位：placement 取 bottom-end | bottom | bottom-start | top-end | top | top-start */
const placement = `
<template>
    <view class="popover-grid">
        <view class="popover-grid-cell">
            <ux-popover v-model:show="bottomEndShow" placement="bottom-end">
                <ux-button shape="round" size="small" text="下方-末" @click="bottomEndShow = true"></ux-button>
                <template #menu>
                    <view class="popover-menu--compact">
                        <text class="popover-menu-text">placement = bottom-end</text>
                    </view>
                </template>
            </ux-popover>
        </view>
        <view class="popover-grid-cell">
            <ux-popover v-model:show="topShow" placement="top">
                <ux-button shape="round" size="small" text="上方-中" @click="topShow = true"></ux-button>
                <template #menu>
                    <view class="popover-menu--compact">
                        <text class="popover-menu-text">placement = top</text>
                    </view>
                </template>
            </ux-popover>
        </view>
        <!-- bottom / bottom-start / top-end / top-start 同理，一个方位一个实例 -->
    </view>
</template>

<script setup lang="ts">
// 触发元素必须落在自己实例的默认插槽里，所以一个方位一个实例
const bottomEndShow = ref<boolean>(false);
const topShow = ref<boolean>(false);
</script>

<style lang="scss">
/* 三等分格子：按钮宽度跟内容，格子里居中 */
.popover-grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 0 -4px;
}
.popover-grid-cell {
    box-sizing: border-box;
    width: 33.3333%;
    padding: 4px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.popover-menu--compact {
    min-width: 140px;
    padding: 10px 14px;
}
.popover-menu-text {
    /* #ifndef APP */
    display: block;
    /* #endif */
    font-size: 12px;
}
</style>
`;

/** B3 外观参数：参数表（一行一参）+ 操作区，档位可选值放单元格右侧分段 */
const appearance = `
<template>
    <ux-cell-group>
        <ux-cell-item title="显示箭头" :arrow="false">
            <ux-switch v-model="arrowOn"></ux-switch>
        </ux-cell-item>
        <ux-cell-item title="显示描边" :arrow="false">
            <ux-switch v-model="borderOn"></ux-switch>
        </ux-cell-item>
        <ux-cell-item title="箭头边长" :arrow="false">
            <view class="popover-segments">
                <ux-button
                    v-for="(item, index) in sizeList"
                    :key="index"
                    :type="arrowSize == item.value ? 'primary' : 'default'"
                    custom-class="popover-segment"
                    size="small"
                    shape="round"
                    :text="item.label"
                    @click="arrowSize = item.value"
                ></ux-button>
            </view>
        </ux-cell-item>
        <ux-cell-item title="面板圆角" :arrow="false" :border-bottom="false">
            <view class="popover-segments">
                <ux-button
                    v-for="(item, index) in radiusList"
                    :key="index"
                    :type="radius == item.value ? 'primary' : 'default'"
                    custom-class="popover-segment"
                    size="small"
                    shape="round"
                    :text="item.label"
                    @click="radius = item.value"
                ></ux-button>
            </view>
        </ux-cell-item>
    </ux-cell-group>
    <!-- 动作单独成行：和档位胶囊排在一起就看不出哪个是参数、哪个是动作 -->
    <ux-gap :height="12" />
    <view class="popover-row">
        <ux-popover
            v-model:show="show"
            :arrow-size="arrowSize"
            :border-radius="radius"
            :show-arrow="arrowOn"
            :show-border="borderOn"
            placement="bottom-start"
        >
            <ux-button shape="round" size="small" type="primary" text="按当前外观打开" @click="show = true"></ux-button>
            <template #menu>
                <view class="popover-menu">
                    <view class="popover-menu-body">
                        <text class="popover-menu-text">arrow-size = {{ arrowSize }}</text>
                        <text class="popover-menu-text">border-radius = {{ radius }}</text>
                    </view>
                    <!-- 按钮包进带内边距的容器：block 的 100% 只算容器内容宽，直接叠 margin 会顶破面板右边缘 -->
                    <view class="popover-menu-footer">
                        <ux-button block size="small" shape="round" text="关闭" @click="show = false"></ux-button>
                    </view>
                </view>
            </template>
        </ux-popover>
    </view>
</template>

<script setup lang="ts">
const show = ref<boolean>(false);
const arrowOn = ref<boolean>(true);
const borderOn = ref<boolean>(true);
const arrowSize = ref<number>(8);
const radius = ref<number>(8);

const sizeList: { label: string; value: number }[] = [
    { label: '6', value: 6 },
    { label: '8', value: 8 },
    { label: '12', value: 12 }
];

const radiusList: { label: string; value: number }[] = [
    { label: '0', value: 0 },
    { label: '8', value: 8 },
    { label: '16', value: 16 }
];
</script>

<style lang="scss">
/* 触发按钮必须在 flex 容器里：组件只给触发区 align-self: flex-start */
.popover-row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
}
/* 档位分段贴单元格右侧，项间 6px */
.popover-segments {
    display: flex;
    flex-direction: row;
    align-items: center;
}
.popover-segment {
    margin-left: 6px;
}
.popover-menu {
    min-width: 180px;
}
.popover-menu-body {
    padding: 10px 14px;
}
/* 菜单底部动作区：内边距留给容器，里面的 block 按钮才是安全的 100% 宽 */
.popover-menu-footer {
    padding: 6px 14px 12px 14px;
}
.popover-menu-text {
    /* #ifndef APP */
    display: block;
    /* #endif */
    font-size: 12px;
    line-height: 1.8;
}
</style>
`;

/** B4 微信风格深色气泡：关描边与阴影，纵向「图标 + 文字」 */
const wechat = `
<template>
    <view class="popover-row">
        <ux-popover
            v-model:show="show"
            bg-color="#4c4c4c"
            placement="bottom-end"
            :arrow-size="12"
            :border-radius="8"
            :offset="10"
            :show-border="false"
            :show-shadow="false"
        >
            <ux-button shape="round" size="small" type="primary" text="点我展开" @click="show = true"></ux-button>
            <template #menu>
                <view class="popover-wechat-menu">
                    <view v-for="(item, index) in items" :key="index" class="popover-wechat-item" @click="onPick()">
                        <view class="popover-wechat-icon">
                            <ux-icon :name="item.icon" size="22" color="#ffffff"></ux-icon>
                        </view>
                        <text class="popover-wechat-text">{{ item.label }}</text>
                    </view>
                </view>
            </template>
        </ux-popover>
    </view>
</template>

<script setup lang="ts">
const show = ref<boolean>(false);

const items: { icon: string; label: string }[] = [
    { icon: 'chat-fill', label: '发起群聊' },
    { icon: 'account-fill', label: '添加朋友' },
    { icon: 'scan', label: '扫一扫' },
    { icon: 'rmb', label: '收付款' }
];

// 气泡式菜单选完即关
function onPick(): void {
    show.value = false;
}
</script>

<style lang="scss">
.popover-row {
    display: flex;
    flex-direction: row;
    align-items: center;
}
.popover-wechat-menu {
    min-width: 180px;
    padding: 6px 0;
}
.popover-wechat-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 12px 18px;
}
/* 图标固定占位：同一个横向基线，文字不会因为图标宽窄而错位 */
.popover-wechat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
}
/* 深底白字：颜色必须落在 text 自身，App 端 text 不继承父级颜色 */
.popover-wechat-text {
    /* #ifndef APP */
    display: block;
    /* #endif */
    font-size: 14px;
    color: #ffffff;
    margin-left: 12px;
}
</style>
`;

/** B5 评论操作气泡：深色横排「图标 + 文字」，面板在触发元素上方 */
const actionBar = `
<template>
    <view class="popover-comment">
        <view class="popover-comment-main">
            <text class="popover-comment-name">前端梦工厂</text>
            <text class="popover-comment-text">TypeScript 2.0 版已发布，欢迎体验。</text>
        </view>
        <ux-popover
            v-model:show="show"
            bg-color="#3d3d3d"
            placement="top-end"
            :arrow-size="14"
            :border-radius="10"
            :offset="10"
            :show-border="false"
            :show-shadow="false"
        >
            <view class="popover-more" @click="show = true">
                <ux-icon name="more-dot-fill" size="20" color="#909399"></ux-icon>
            </view>
            <template #menu>
                <view class="popover-action-bar">
                    <view v-for="(item, index) in actions" :key="index" class="popover-action-item" @click="onPick()">
                        <ux-icon :name="item.icon" size="22" color="#ffffff"></ux-icon>
                        <text class="popover-action-text">{{ item.label }}</text>
                    </view>
                </view>
            </template>
        </ux-popover>
    </view>
</template>

<script setup lang="ts">
const show = ref<boolean>(false);

const actions: { icon: string; label: string }[] = [
    { icon: 'file-text', label: '复制' },
    { icon: 'share', label: '转发' },
    { icon: 'chat', label: '翻译' },
    { icon: 'heart', label: '不喜欢' },
    { icon: 'warning', label: '投诉' }
];

// 操作类气泡点完一项即关闭
function onPick(): void {
    show.value = false;
}
</script>

<style lang="scss">
.popover-comment {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    background-color: #f5f6f7;
    border-radius: 10px;
}
.popover-comment-main {
    flex: 1;
    margin-right: 12px;
}
.popover-comment-name {
    /* #ifndef APP */
    display: block;
    /* #endif */
    font-size: 14px;
    font-weight: bold;
    color: #303133;
}
.popover-comment-text {
    /* #ifndef APP */
    display: block;
    /* #endif */
    font-size: 13px;
    color: #606266;
    margin-top: 4px;
}
.popover-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
}
/* 面板宽度由内容撑开：min-width 撑出五等分段，各操作项 flex: 1 均分 */
.popover-action-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    min-width: 300px;
    padding: 16px 6px 14px 6px;
}
.popover-action-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}
/* 深底白字：颜色必须落在 text 自身，App 端 text 不继承父级颜色 */
.popover-action-text {
    /* #ifndef APP */
    display: block;
    /* #endif */
    font-size: 13px;
    color: #ffffff;
    margin-top: 8px;
}
</style>
`;

/** B6 遮罩、关闭行为、层级与动态内容重测：参数表 + 操作区 */
const mask = `
<template>
    <ux-cell-group>
        <ux-cell-item title="半透明遮罩" :arrow="false">
            <ux-switch v-model="dim"></ux-switch>
        </ux-cell-item>
        <ux-cell-item title="点遮罩关闭" :arrow="false">
            <ux-switch v-model="maskCloseAble"></ux-switch>
        </ux-cell-item>
        <ux-cell-item title="点内容关闭" :arrow="false">
            <ux-switch v-model="contentCloseAble"></ux-switch>
        </ux-cell-item>
        <ux-cell-item title="层级" :arrow="false" :border-bottom="false">
            <view class="popover-segments">
                <ux-button
                    v-for="(item, index) in zIndexList"
                    :key="index"
                    :type="zIndex == item.value ? 'primary' : 'default'"
                    custom-class="popover-segment"
                    size="small"
                    shape="round"
                    :text="item.label"
                    @click="zIndex = item.value"
                ></ux-button>
            </view>
        </ux-cell-item>
    </ux-cell-group>
    <!-- 主动作在前、次动作在后，两个动作统一小尺寸圆角按钮 -->
    <ux-gap :height="12" />
    <view class="popover-row">
        <ux-popover
            v-model:show="show"
            :content-close-able="contentCloseAble"
            :mask-bg-color="dim ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)'"
            :mask-close-able="maskCloseAble"
            :refresh-key="refreshKey"
            :z-index="zIndex"
            placement="bottom-end"
        >
            <ux-button shape="round" size="small" type="primary" text="打开遮罩演示" @click="show = true"></ux-button>
            <template #menu>
                <view class="popover-menu">
                    <ux-cell-item title="编辑资料" :arrow="false" @click="onPick()"></ux-cell-item>
                    <ux-cell-item v-for="(item, index) in extraLabels" :key="index" :title="item.title" :arrow="false" :border-bottom="!item.last"></ux-cell-item>
                </view>
            </template>
        </ux-popover>
        <ux-button shape="round" size="small" text="追加菜单项" @click="addItem()"></ux-button>
    </view>
</template>

<script setup lang="ts">
const show = ref<boolean>(false);
const dim = ref<boolean>(true);
const maskCloseAble = ref<boolean>(true);
const contentCloseAble = ref<boolean>(false);
// 留空取主题 dropdown 档，也能传具体数值
const zIndex = ref<string>('');
const refreshKey = ref<number>(0);
const extraItems = ref<number>(0);

const zIndexList: { label: string; value: string }[] = [
    { label: '默认', value: '' },
    { label: '2000', value: '2000' }
];

// 最后一项的分隔线由数据层给：模板里不读数组长度，否则原生端可能读到越界值
const extraLabels = computed<{ title: string; last: boolean }[]>((): { title: string; last: boolean }[] => {
    const list: { title: string; last: boolean }[] = [];
    for (let i = 0; i < extraItems.value; i++) {
        list.push({ title: '新增菜单项 ' + (i + 1).toString(), last: i == extraItems.value - 1 });
    }
    return list;
});

// 菜单内容尺寸变了要改 refreshKey：组件不会自己重新测位，面板会停在旧位置
function addItem(): void {
    extraItems.value = extraItems.value + 1;
    refreshKey.value = refreshKey.value + 1;
}

// content-close-able 为 false 时组件不关，由调用方自己决定
function onPick(): void {
    show.value = false;
}
</script>

<style lang="scss">
.popover-row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
}
.popover-segments {
    display: flex;
    flex-direction: row;
    align-items: center;
}
.popover-segment {
    margin-left: 6px;
}
.popover-menu {
    min-width: 180px;
}
</style>
`;

export const codes = {
    basic,
    placement,
    appearance,
    wechat,
    actionBar,
    mask
};