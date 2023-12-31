const template = `<div class="status-base">
	<img :src="data.icon" alt="ERROR"/>
	<div class="status-base-detail">
		<span>{{ data.label }}</span>
		<span>{{ data.value }}</span>
	</div>
</div>`;

import { defineComponent } from "vue";

export default defineComponent( {
	name: "status-box",
	template,
	props: {
		data: {
			type: Object,
			default: () => ( {
				icon: "",
				label: "",
				value: ""
			} )
		}
	}
} );
