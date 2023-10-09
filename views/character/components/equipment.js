const template = `<div class="equipment-box" :class="{ empty: !src }">
	<template v-if="src">
		<img class="content image" :src="src" alt="ERROR">
		<span v-if="level || level === 0" class="level">+{{ level }}</span>
		<img v-if="rarity" class="star" :src="starImgSrc" alt="ERROR">
	</template>
	<i v-else :class="emptyIcon" class="content icon"></i>
</div>`

import { defineComponent, computed } from "vue";

export default defineComponent( {
	template,
	name: 'Equipment',
	props: {
		src: String,
		rarity: Number,
		level: Number,
		emptyIcon: {
			type: String,
			default: 'icon-lock'
		}
	},
	setup( props ) {
		const starImgSrc = computed( () => `/genshin/adachi-assets/resource/rarity/icon/Icon_${ props.rarity }_Stars.png` );
		return {
			starImgSrc
		}
	}
} )