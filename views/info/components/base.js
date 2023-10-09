import {infoDataParser} from "#/genshin/front-utils/data-parser";

const template = `<div class="info-base">
	<header class="info-title">
		<div v-if="elementIcon" class="element-box">
			<img :src="elementIcon" alt="ERROR">
		</div>
		<p class="title-and-name">
			「<span v-if="isCharacterInfo(data)">{{ data.fetter.title }}·</span>{{ data.name }}」
		</p>
		<img :src="parsed.rarityIcon" alt="ERROR" class="rarity-icon">
	</header>
	<main>
		<div class="avatar-box" :class="{ weapon: data.type !== '角色' }">
			<img :src="parsed.mainImage" alt="ERROR"/>
			<p class="introduce">{{ data.fetter.introduce || '暂无介绍' }}</p>
		</div>
		<div class="main-content">
			<slot></slot>
		</div>
	</main>
	<footer class="author">Created by Adachi-BOT v{{ version }}</footer>
</div>`;

import { defineComponent, computed } from "vue";

export default defineComponent( {
	name: "InfoApp",
	template,
	props: {
		data: {
			type: Object,
			default: () => ( {
				rarity: null,
				name: "",
				id: null,
				type: "",
				title: "",
				introduce: ""
			} )
		}
	},
	setup( props ) {
		const version = window.ADACHI_VERSION;
		const parsed = computed( () => infoDataParser( props.data ) );

		/* 元素 icon */
		const elementIcon = computed( () => {
			return props.data.type === "角色" ? `/genshin/adachi-assets/resource/element/${ props.data.element.id.toLowerCase() }.png` : "";
		} )
		
		return {
			parsed,
			version,
			elementIcon,
		}
	}
} );
