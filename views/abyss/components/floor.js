const template = `<div class="floor">
	<p class="floor-number">{{ floor }}</p>
	<main v-if="data && data.data && data.data.levels">
		<template v-for="r in 3" :key="r">
			<abyss-room v-if="data.data.levels[r - 1]" :roomData="data.data.levels[r - 1]" :floor="floor"/>
		</template>
	</main>
</div>`;

import AbyssRoom from "./room.js";
import { defineComponent, computed } from "vue";

export default defineComponent( {
	name: "AbyssFloor",
	template,
	components: {
		AbyssRoom
	},
	props: {
		data: Object
	},
	setup( props ) {
		const floor = computed( () => {
			if ( !props.data ) return "";
			return props.data.floor;
		} );
		
		return {
			floor
		}
	}
} );
