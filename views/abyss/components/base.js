const template = `<div class="abyss-base">
	<span class="uid">{{ uid }}</span>
	<slot/>
	<p class="footer">Created by Adachi-BOT</p>
</div>`;

import { defineComponent, computed } from "vue";

export default defineComponent( {
	name: "Base",
	template,
	props: {
		data: Object
	},
	setup( props ) {
		const info = props.data.info;
		const uid = computed( () => info.split( "-" ).join( " " ) );
		
		return {
			uid
		}
	}
} );
