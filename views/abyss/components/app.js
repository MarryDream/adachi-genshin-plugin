const template = `<Base v-if="data" :data="data">
	<abyss-overview v-if="checkOverview(data)" :data="data"/>
	<abyss-floor v-else :data="data"/>
</Base>`;

import Base from "./base.js";
import AbyssFloor from "./floor.js";
import AbyssOverview from "./overview.js";
import { urlParamsGet } from "../../../front-utils/url.js";
import $https from "../../../front-utils/api.js";
import { defineComponent, ref, onMounted } from "vue";

export default defineComponent( {
	name: "AbyssApp",
	template,
	components: {
		AbyssFloor,
		AbyssOverview,
		Base
	},
	setup() {
		const urlParams = urlParamsGet( location.href );
		const data = ref( null );
		
		async function getData() {
			data.value = await $https( "/abyss", {
				qq: urlParams.qq,
				floor: urlParams.floor
			} );
		}
		
		onMounted( () => {
			getData();
		} );
		
		return { data }
	}
} );
