const template = `<div>
	<info-base v-if="data" :data="data">
		<info-character v-if="data.type === '角色'" :data="data" :skill="skill"></info-character>
		<info-weapon v-else :data="data"></info-weapon>
	</info-base>
</div>`;

import { defineComponent, onMounted, ref } from "vue";
import $https from "../../../front-utils/api.js";
import { urlParamsGet } from "../../../front-utils/url.js";
import InfoBase from "./base.js";
import InfoWeapon from "./weapon.js";
import InfoCharacter from "./character.js";
import { initBaseColor } from "../../../front-utils/data-parser.js";

export default defineComponent( {
	name: "InfoApp",
	template,
	components: {
		InfoBase,
		InfoWeapon,
		InfoCharacter
	},
	setup() {
		const urlParams = urlParamsGet( location.href );
		const skill = urlParams.skill === "true";
		
		const data = ref( null );
		
		const getData = async () => {
			const res = await $https( "/info", { name: urlParams.name } );
			initBaseColor( res );
			data.value = res;
		}
		
		onMounted( () => {
			getData();
		} );
		
		return {
			skill,
			data
		}
	}
} );
