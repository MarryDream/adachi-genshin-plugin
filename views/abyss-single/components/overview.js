const template = `
	<section-title>战斗数据</section-title>
	<ul class="overview">
		<li v-for="(d ,dKey) of formatData" :key="dKey">
			<div class="battle-char-box" :class="d.className">
				<img :src="d.avatarIcon" alt="ERROR">
			</div>
			<p>{{ d.label }}</p>
			<p>{{ d.value }}</p>
		</li>
	</ul>`;

import SectionTitle from "../../../components/section-title/index.js";

import { defineComponent } from "vue";

export default defineComponent( {
	name: "Overview",
	components: {
		SectionTitle
	},
	props: {
		data: {
			type: Array,
			default: () => []
		}
	},
	template,
	setup( props ) {
		const formatData = [];
		
		for ( const dKey in props.data ) {
			const d = props.data[dKey];
			if ( !d ) continue;
			formatData.push( {
				...d,
				label: dKey,
				avatarIcon: `/genshin/adachi-assets/character/${ d.name }/image/face.webp`,
				className: `rarity-${ d.rarity }`
			} );
		}
		
		return {
			formatData
		};
	}
} )