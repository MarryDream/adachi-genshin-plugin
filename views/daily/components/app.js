const template = `<div class="daily-app">
	<daily-header :week="week" :show-event="showEvent" :sub-state="subState" :user="user"/>
	<Material v-if="data && showMaterial" :data="data"/>
	<Event v-if="data && data.event" :show-event="showEvent" :show-material="showMaterial" :events="data.event"/>
</div>`;

import { defineComponent, computed, ref, onMounted } from "vue";
import $https from "../../../front-utils/api.js";
import { urlParamsGet } from "../../../front-utils/url.js";
import DailyHeader from "./daily-header.js";
import Material from "./material.js";
import Event from "./event.js";

export default defineComponent( {
	name: "DailyApp",
	template,
	components: {
		DailyHeader,
		Material,
		Event
	},
	setup() {
		const urlParams = urlParamsGet( location.href );
		const user = urlParams.id;

		const data = ref( null );

		const week = urlParams.week;
		const subState = computed( () => urlParams.type === "sub" );

		const objHasValue = ( params ) => {
			const d = data.value;
			if ( !d || !d[params] || typeof d[params] !== "object" ) return false;
			return Object.keys( d[params] ).length !== 0;
		}

		/* 是否显示素材（素材空） */
		const showMaterial = computed( () => objHasValue( "character" ) || objHasValue( "weapon" ) );

		/* 是否显示活动日历 */
		const showEvent = computed( () => week === "today" && data.value?.event.length !== 0 );

		const getData = async () => {
			data.value = await $https( "/daily", { id: user } );
		};

		onMounted( () => {
			getData();
		} );
		
		return {
			data,
			week,
			user,
			subState,
			showMaterial,
			showEvent
		};
	}
} );
