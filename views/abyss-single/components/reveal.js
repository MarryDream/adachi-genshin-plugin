const template = `<ul class="reveal">
	<li v-for="(d , dKey) of data" :key="dKey">
		<img :src="getSideIcon(d.name)" alt="ERROR">
		<span>{{ d.value }} 次</span>
	</li>
</ul>`;

import { defineComponent } from "vue";

export default defineComponent( {
	name: "Reveal",
	props: {
		data: {
			type: Array,
			default: () => []
		}
	},
	template,
	setup() {
		const getSideIcon = name => `/genshin/adachi-assets/character/${ name }/image/side.png`;
		return {
			getSideIcon
		};
	}
} )