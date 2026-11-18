/**
 * Pinia 计数器 Store（setup store 写法）
 * 参考：https://doc.dcloud.net.cn/uni-app-x/tutorial/store.html#pinia
 * - state：ref
 * - getter：computed
 * - action：普通函数
 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
	// state
	const name = ref<string>('Pinia')
	const count = ref<number>(0)

	// getters
	const doubleCount = computed((): number => count.value * 2)
	const countText = computed((): string => name.value + ': ' + count.value)

	// actions
	function increment(): void {
		count.value++
	}

	function decrement(): void {
		count.value--
	}

	function rename(): void {
		name.value = name.value === 'Pinia' ? 'Pinia Store' : 'Pinia'
	}

	function reset(): void {
		name.value = 'Pinia'
		count.value = 0
	}

	return {
		name,
		count,
		doubleCount,
		countText,
		increment,
		decrement,
		rename,
		reset
	}
})
