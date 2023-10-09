const template = `<div v-if="data" class="card-base">
	<card-header
		:data="data"
		:url-params="urlParams"
		:info-list="data.statsList.base"
	/>
	<main>
		<section class="card-user">
			<article class="card-user-info">
				<h3 class="card-title">数据总览</h3>
				<div class="card-status-box">
					<status-box
						v-for="(status, index) in data.statsList.chest.concat(data.statsList.culus)"
						:key="index"
						:data="status"
					/>
				</div>
			</article>
			<article class="card-exploration">
				<h3 class="card-title">世界探索</h3>
				<div class="card-exploration-box">
					<exploration-box
						v-for="(exploration, index) in data.explorationsList"
						:key="index"
						:class="getSizeClass(data.explorationsList, index)"
						class="card-exploration-item"
						:data="exploration"
					/>
				</div>
			</article>
		</section>
		<section class="card-home">
			<h3 class="card-title">尘歌壶</h3>
			<div class="card-home-box">
				<p class="card-home-info">等级: Lv.{{ data.homesLevel }} 仙力: {{ data.maxComfort }}</p>
				<div class="card-home-list">
					<home-box
						class="card-home-item"
						:class="getSizeClass(data.formatHomes, index)"
						v-for="(home, index) of data.formatHomes"
						:key="index"
						:data="home"
					/>
				</div>
			</div>
		</section>
		<section class="card-character">
			<h1 class="card-character-title">角色背包</h1>
			<div class="character-line">
				<character-box
					class="character-item"
					v-for="(char, charIndex) in data.avatars"
					:key="charIndex"
					:char="char"
					:type="urlParams.style"
				/>
			</div>
			<p class="sign">Created by Adachi-BOT v{{ version }}</p>
		</section>
	</main>
</div>`;

import { defineComponent, onMounted, ref } from "vue";
import CardHeader from "./card-header.js";
import HomeBox from "../../../components/home-box/index.js";
import CharacterBox from "../../../components/character-box/index.js";
import ExplorationBox from "../../../components/exploration-box/index.js";
import StatusBox from "../../../components/status-box/index.js";
import $https from "../../../front-utils/api.js";
import { urlParamsGet } from "../../../front-utils/url.js";
import { sizeClass, cardDataParser } from "../../../front-utils/data-parser.js";

export default defineComponent( {
	name: "CardApp",
	template,
	components: {
		CardHeader,
		HomeBox,
		CharacterBox,
		ExplorationBox,
		StatusBox,
	},
	setup() {
		const urlParams = urlParamsGet( location.href );
		
		const data = ref( null );
		
		const version = window.ADACHI_VERSION;
		
		onMounted( async () => {
			const res = await $https( "/card", { qq: urlParams.qq } );
			data.value = {
				...res,
				...cardDataParser( res )
			}
		} );
		
		const getSizeClass = sizeClass( 3 );
		return {
			urlParams,
			version,
			getSizeClass,
		};
	},
} );
