const template = `<div class="almanac-footer">
	<img class="dire-title" src="/genshin/adachi-assets/resource/almanac/direction.svg" alt="ERROR"/>
	<div class="dire-content">
		<p>面朝{{ data }}玩原神<br/>稀有掉落概率up</p>
	</div>
	<p class="design">Designed by genshin.pub</p>
	<p class="author">Created by Adachi-BOT v{{ version }}</p>
</div>`;

import { defineComponent } from "vue";

export default defineComponent( {
	name: "AlmanacFooter",
	template,
	props: {
		data: String
	},
	setup() {
		const version = window.ADACHI_VERSION;
		return { version };
	}
} );