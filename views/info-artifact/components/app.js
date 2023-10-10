const template = `<div class="info-artifact">
	<template v-if="data">
		<header>
			<p class="title-and-name">
				「{{ data.name }}」
			</p>
			<img v-if="parse" :src="parse.rarityIcon" alt="ERROR" class="rarity-icon">
		</header>
		<main>
			<div class="avatar-box">
				<img v-if="parse" :src="parse.mainImage" alt="ERROR"/>
			</div>
			<div class="main-content">
				<div class="shirt-title">{{ data.name }}</div>
				<template v-for="(e, eKey) in data.effects">
					<p class="effect-title">{{ eKey }}件套</p>
					<div class="effect-content" v-html="e"></div>
				</template>
			</div>
			<div class="main-content">
				<p class="access">获取途径: {{ data.access.join("、") }}</p>
			</div>
		</main>
		<footer class="author">Created by Adachi-BOT v{{ version }}</footer>
	</template>
</div>`;

import { computed, defineComponent, onMounted, ref } from "vue";
import $https from "../../../front-utils/api.js";
import { urlParamsGet } from "../../../front-utils/url.js";
import { initBaseColor, infoDataParser } from "../../../front-utils/data-parser.js";

export default defineComponent( {
	name: "InfoApp",
	template,
	setup() {
		const urlParams = urlParamsGet( location.href );
		
		const data = ref( null );
		const version = window.ADACHI_VERSION;
		
		const parse = computed( () => {
			const value = data.value;
			if ( !value ) return null;
			return infoDataParser( value );
		} )
		
		const getData = async () => {
			data.value = await $https( "/info", { name: urlParams.name } );
			initBaseColor( data.value );
		};
		
		onMounted( () => {
			getData();
		} );
		
		return {
			data,
			version,
			parse
		}
	}
} );
