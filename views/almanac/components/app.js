const template = `<div class="almanac">
	<almanac-header/>
	<div class="today-fortune">
		<div class="container">
			<almanac-fortune v-if="data" :data="data.auspicious" :isTop="true"/>
			<almanac-fortune v-if="data" :data="data.inauspicious"/>
		</div>
	</div>
	<almanac-footer v-if="data" :data="data.direction"/>
</div>`;

import { defineComponent, onMounted, ref } from "vue";
import $https from "../../../front-utils/api.js";
import AlmanacHeader from "./header.js";
import AlmanacFortune from "./fortune.js";
import AlmanacFooter from "./footer.js";

export default defineComponent( {
	name: "AlmanacApp",
	template,
	components: {
		AlmanacHeader,
		AlmanacFortune,
		AlmanacFooter
	},
	setup() {
		const data = ref( null );
		
		const getData = async () => {
			data.value = await $https( "/almanac" );
		}
		
		onMounted( () => {
			getData();
		} );
		
		return { data };
	}
} );