const template = `<div class="materials-item" :style="itemStyle">
	<img class="material-icon" :src="icon" alt="ERROR"/>
	<p v-if="title" class="materials-title">{{ title }}</p>
	<p class="materials-count" :data-count="data.count"></p>
</div>`;

import { defineComponent, computed } from "vue";

export default defineComponent( {
	name: "MaterialsItem",
	template,
	props: {
		data: {
			type: Object,
			required: true
		},
		showTitle: {
			type: Boolean,
			default: false
		}
	},
	setup( props ) {
		const icon = computed( () => {
			return `/genshin/adachi-assets/resource/material/${ props.data.name }.png`;
		} );
		
		const title = computed( () => {
			if ( !props.showTitle ) return "";
			const result = props.data.name.match( /「(.+)」.+/ );
			return result ? result[1] : "";
		} );
		
		const itemStyle = computed( () => ( {
			backgroundImage: `url(/genshin/adachi-assets/resource/rarity/bg/Background_Item_${ props.data.rank === 105 ? '5a' : props.data.rank }_Star.png)`
		} ) );
		
		return {
			icon,
			title,
			itemStyle
		}
	}
} );
