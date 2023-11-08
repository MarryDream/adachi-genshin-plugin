const template = `<div class="card-base" v-if="data">
	<card-header
		:data="data"
		:url-params="urlParams"
		:info-list="data.statsList.base"
	/>
	<main>
		<section class="card-user">
			<article class="card-user-info">
				<section-title>数据总览</section-title>
				<div class="card-status-box">
					<StatusBox
						class="card-status-item"
						v-for="(status, index) in data.statsList.chest.concat(data.statsList.culus)"
						:key="index"
						:data="status"
					/>
				</div>
			</article>
			<article class="card-exploration">
				<section-title>世界探索</section-title>
				<div class="card-exploration-box">
					<ExplorationBox
						class="card-exploration-item"
						v-for="(exploration, index) in data.explorationsList"
						:key="index"
						:data="exploration"
					/>
				</div>
			</article>
		</section>
		<section v-if="showAvatars" class="card-character">
			<section-title showSubTitle>
				<template #default>角色展示</template>
				<template #sub>角色数量: {{ data.stats.avatarNumber }}</template>
			</section-title>
			<div class="character-line">
				<CharacterBox
					class="character-item"
					v-for="(char, charIndex) in data.avatars"
					:key="charIndex"
					:char="char"
					type="weaponA"
				/>
			</div>
		</section>
		<section class="card-home">
			<section-title showSubTitle>
				<template #default>尘歌壶</template>
				<template #sub>等级: Lv.{{ data.homesLevel }} 仙力: {{ data.maxComfort }}</template>
			</section-title>
			<div class="card-home-box">
				<home-box
					class="card-home-item"
					:class="sizeClassFun(data.formatHomes, index)"
					v-for="(home, index) of data.formatHomes"
					:key="index"
					:data="home"
				/>
			</div>
		</section>
		<p v-if="!showAvatars" class="empty-avatar-tip">tips：请前往米游社公开展示「角色详情数据」来展示所持有角色</p>
	</main>
	<footer>
		<p class="sign">Created by Adachi-BOT v{{ version }}</p>
	</footer>
</div>`;

import { computed, defineComponent, onMounted, ref } from "vue";
import $https from "../../../front-utils/api.js";
import { urlParamsGet } from "../../../front-utils/url.js";
import { sizeClass, cardDataParser } from "../../../front-utils/data-parser.js";
import CardHeader from "./card-header.js";
import SectionTitle from "./section-title.js";
import HomeBox from "../../../components/home-box/index.js";
import CharacterBox from "../../../components/character-box/index.js";
import ExplorationBox from "../../../components/exploration-box/index.js";
import StatusBox from "../../../components/status-box/index.js";

export default defineComponent( {
	name: "CardApp",
	template,
	components: {
		CardHeader,
		SectionTitle,
		HomeBox,
		CharacterBox,
		ExplorationBox,
		StatusBox,
	},
	setup() {
		const urlParams = urlParamsGet( location.href );
		
		const data = ref( null );
		const version = window.ADACHI_VERSION;
		
		const getData = async () => {
			const res = await $https( "/card", { qq: urlParams.qq } );
			res.avatars.splice( 8 );
			const parsed = cardDataParser( res );
			parsed.statsList.base = parsed.statsList.base.filter( ( { label } ) => label !== "获得角色" );
			data.value = {
				...res,
				...parsed
			}
		};
		
		onMounted( () => {
			getData();
		} );
		
		/* 是否显示角色列表 */
		const showAvatars = computed( () => {
			return !!data.value?.avatars?.length;
		} );
		
		const sizeClassFun = sizeClass( 3 );
		
		return {
			data,
			version,
			showAvatars,
			urlParams,
			sizeClassFun,
		};
	},
} );
