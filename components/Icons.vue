<template>
	<component v-if="IconComponent" :is="IconComponent" :size="size" :stroke-width="strokeWidth" :class="iconClass" />
</template>
<script>
import * as LucideIcons from 'lucide-vue-next'

export default {
	name: 'Icons',
	props: {
		name: { type: String, required: true },
		size: { type: [Number, String], default: 20 },
		strokeWidth: { type: [Number, String], default: 2 },
		class: { type: String, default: '' }
	},
	computed: {
		IconComponent() {
			const key = this.normalizeName(this.name)
			return LucideIcons[key] || null
		},
		iconClass(){
			return this.class
		}
	},
	methods: {
		normalizeName(raw){
			if (!raw) return ''
			// Convert kebab/space/underscore to PascalCase expected by lucide components
			const pascal = raw
				.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
				.replace(/^(.)/, (c) => c.toUpperCase())
			return pascal
		}
	}
}
</script>
