const template = `<div class="statistic-item">
	<img class="background" :src="background" alt="ERROR"/>
	<img class="main" :src="mainImage" alt="ERROR"/>
	<div class="corner"/>
	<div class="count">{{ data.count }} 次</div>
</div>`;

import { defineComponent, computed } from "vue";

export default defineComponent( {
	name: "StatisticItem",
	template,
	props: {
		data: Object
	},
	setup( props ) {
		const background = computed( () => {
			return `/genshin/adachi-assets/resource/rarity/bg/Background_Item_${ props.data.rank }_Star.webp`;
		} );
		const mainImage = computed( () => {
			if ( props.data.type === "角色" ) return `/genshin/adachi-assets/character/${ props.data.name }/image/face.webp`;
			return `/genshin/adachi-assets/weapon/${ props.data.name }/image/thumb.webp`;
		} );
		
		return {
			background,
			mainImage
		}
	}
} );