const template = `<div class="materials-list">
	<div v-if="data.label" class="list-label">{{ data.label }}</div>
	<div class="list-data">
		<materials-item
			v-for="(d, dKey) of data.value"
			:key="dKey"
			:data="d"
			:showTitle="data.showTitle">
		</materials-item>
	</div>
</div>`;

import { defineComponent } from "vue";
import MaterialsItem from "./materials-item.js"

export default defineComponent( {
	name: "MaterialsList",
	template,
	components: {
		MaterialsItem,
	},
	props: {
		data: {
			type: Array,
			default: () => []
		}
	}
} );
