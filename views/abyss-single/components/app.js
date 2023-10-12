const template = `<div class="abyss-single">
	<header>
		<div class="user-info-box">
			<div class="user-info-container">
				<img :src="avatar" alt="ERROR">
				<div class="user-info">
					<p>{{ data && data.userName }}</p>
					<p>UID {{ data && data.uid }}</p>
				</div>
			</div>
			<ul class="tag-list">
				<li>
					<img src="/genshin/adachi-assets/resource/abyss/star.webp" alt="ERROR">
					<span>{{ data && data.totalStar }}</span>
				</li>
				<li>
					<span>最深抵达</span>
					<span>{{ data && data.maxFloor }}</span>
				</li>
				<li>
					<span>挑战次数</span>
					<span>{{ data && data.totalBattleTimes }}</span>
				</li>
			</ul>
		</div>
		<Reveal v-if="parser" :data="parser.reveals"></Reveal>
	</header>
	<main>
		<Overview v-if="parser && parser.showData" :data="parser.dataList"></Overview>
		<div class="floors-data">
			<template v-if="data">
				<Floor v-for="(f, fKey) of data.floors" :key="fKey" :data="f"></Floor>
			</template>
		</div>
	</main>
	<footer>
		<p class="author">Created by Adachi-BOT v{{ version }}</p>
	</footer>
</div>`;

import $https from "../../../front-utils/api.js";
import { urlParamsGet } from "../../../front-utils/url.js";
import { abyssDataParser } from "../../../front-utils/data-parser.js";
import Reveal from "./reveal.js";
import Overview from "./overview.js";
import Floor from "./floor.js";
import { defineComponent, onMounted, computed, ref } from "vue";

export default defineComponent( {
	name: "AbyssSingle",
	template,
	components: {
		Reveal,
		Overview,
		Floor
	},
	setup() {
		const urlParams = urlParamsGet( location.href );
		
		/* 获取9-12层数据，无数据使用默认数据填充 */
		function getFloors( data ) {
			return Array.from( { length: 4 } ).map( ( fake, fKey ) => {
				const index = fKey + 9;
				const floor = data?.floors?.find( f => f.index === index );
				return floor || {
					index,
					levels: []
				}
			} );
		}
		
		const version = window.ADACHI_VERSION;

		/* 获取头像 */
		const avatar = computed( () => `https://q1.qlogo.cn/g?b=qq&s=640&nk=${ urlParams.qq }` );

		const data = ref( null );
		const parser = ref( null );

		onMounted( async () => {
			const res = await $https( "/abyss/single", { qq: urlParams.qq } );
			parser.value = abyssDataParser( res );

			data.value = {
				...res,
				...getFloors( res )
			}
		} );
		
		return {
			parser,
			version,
			data,
			avatar
		};
	}
} )