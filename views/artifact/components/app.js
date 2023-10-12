const template = `<div class="artifact">
	<img class="background" src="/genshin/adachi-assets/resource/artifact/background.webp" alt="ERROR"/>
	<div class="up">
		<p class="name">{{ data?.name }}</p>
		<p class="slot">{{ data?.slot }}</p>
		<div class="main-stat">
			<p class="property">{{ data?.mainStat.name }}</p>
			<p class="value">{{ data?.mainStat.value }}</p>
		</div>
		<img class="rarity" src="/genshin/adachi-assets/resource/rarity/icon/Icon_5_Stars.webp" alt="ERROR"/>
		<img class="image" :src="icon" alt="ERROR"/>
	</div>
	<div class="down">
		<p class="level">+{{ data?.level }}</p>
		<ul class="sub-stats" v-for="s in data?.subStats">
			<li class="pair">{{ s.name }}+{{ s.value }}</li>
		</ul>
	</div>
</div>`;

import { computed, defineComponent, onMounted, ref } from "vue";
import { urlParamsGet } from "../../../front-utils/url.js";
import $https from "../../../front-utils/api.js";

export default defineComponent( {
	name: "ArtifactApp",
	template,
	setup() {
		const urlParams = urlParamsGet( location.href );
		const data = ref( null );
		
		const icon = computed( () => {
			const value = data.value;
			if ( !value ) return "";
			return `/genshin/adachi-assets/artifact/${ value.shirt }/image/${ value.icon }.webp`;
		} );
		
		async function getData() {
			data.value = await $https( "/artifact", {
				qq: urlParams.qq,
				type: urlParams.type
			} );
		}
		
		onMounted( () => {
			getData();
		} )
		
		return {
			data,
			icon
		}
	}
} );