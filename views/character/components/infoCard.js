const template = `<div class="info-card">
	<h3 v-if="title">
		<span>{{ title }}</span>
	</h3>
	<div class="info-card-content" v-bind="$attrs">
		<slot></slot>
	</div>
</div>`

import { defineComponent } from "vue";

export default defineComponent( {
	template,
	inheritAttrs: false,
	name: "InfoCard",
	props: {
		title: String,
	}
} )