const template = `<div v-if="data" class="wish">
	<img class="background" src="/genshin/adachi-assets/resource/wish/background.png" alt="ERROR"/>
	<p class="time">@{{ data.nickname }} at {{ fullDate }}</p>
	<div class="wish-list">
		<WishBox v-for="d in data.result" :d="d"></WishBox>
	</div>
</div>`;

import { defineComponent, onMounted, ref } from "vue";
import $https from "../../../front-utils/api.js";
import { urlParamsGet } from "../../../front-utils/url.js";
import { getFullDate } from "../../../front-utils/date.js";
import WishBox from "./box.js";

export default defineComponent( {
	name: "WishApp",
	template,
	components: {
		WishBox
	},
	setup() {
		const urlParams = urlParamsGet( location.href );
		
		const data = ref( null );
		
		const fullDate = getFullDate();
		
		const getData = async () => {
			const dataRes = await $https( "/wish/result", { qq: urlParams.qq } );
			const weapon = await $https( "/wish/config", { type: "weapon" } );
			const character = await $https( "/wish/config", { type: "character" } );
			
			const type = dataRes.type;
			const nickname = dataRes.name;
			const result = dataRes.data;
			
			for ( let key in result ) {
				if ( result.hasOwnProperty( key ) ) {
					const elType = result[key].type;
					const typeConfig = elType === "武器" ? weapon : character;
					result[key].el = typeConfig[result[key].name];
				}
			}
			
			result.sort( ( x, y ) => {
				const xType = x.type === "武器" ? 0 : 1;
				const yType = y.type === "武器" ? 0 : 1;
				if ( xType === yType ) {
					return y.rank - x.rank;
				} else {
					return yType - xType;
				}
			} );
			
			data.value = {
				type,
				nickname,
				result
			};
		}
		
		onMounted( () => {
			getData();
		} );
		
		return {
			data,
			fullDate
		}
	}
} );