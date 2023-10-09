const template = `<div class="section-title" :class="{hasSub: showSubTitle}">
	<span class="main-title">
		<slot>标题</slot>
	</span>
	<span v-if="showSubTitle" class="sub-title">
		<slot name="sub">副标题</slot>
	</span>
</div>`;

import { defineComponent } from "vue";

export default defineComponent( {
	name: "SectionTitle",
	template,
	props: {
		showSubTitle: Boolean
	}
} );
