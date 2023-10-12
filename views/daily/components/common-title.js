const template = `<div class="common-title">
	<div v-if="data.icon" class="icon" :style="{ backgroundImage: backgroundImage }">
		<img :src="data.icon.url" alt="ERROR">
	</div>
	<div class="title">{{ data.title }}</div>
</div>`

import { defineComponent, computed } from "vue";

export default defineComponent( {
	name: "CommonTile",
	template,
	props: {
		data: {
			type: Object,
			default: {
				icon: "",
				title: ""
			}
		}
	},
	setup( props ) {
		const backgroundImage = computed( () => `url(/genshin/adachi-assets/resource/rarity/bg/Background_Item_${ props.data.icon.rank }_Star.webp)` );

		return {
			backgroundImage
		}
	}
} )