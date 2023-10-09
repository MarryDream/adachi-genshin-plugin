const template = `<div class="info-card" :class="direction">
	<h3 v-if="title" class="card-title">{{ title }}</h3>
	<div class="card-content" :class="{ 'no-header': !title }">
		<slot></slot>
	</div>
</div>`;

import { defineComponent } from "vue";

export default defineComponent( {
	name: "InfoCard",
	template,
	props: {
		title: {
			type: String
		},
		direction: {
			default: "col",
			validator( value ) {
				return [ "row", "col" ].includes( value )
			}
		}
	}
} );
