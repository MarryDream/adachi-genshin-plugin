const template = `<div class="character-base">
	<main>
		<div class="portrait-box">
			<img class="portrait" :src="portrait" alt="ERROR">
		</div>
		<span class="uid-box">UID {{ data?.uid }}</span>
		<div class="chara-name">
			<img :src="elementIconSrc" alt="ERROR">
			<h3>{{ data?.name }}</h3>
			<span>lv{{ data?.level }}</span>
			<span>好感度： {{ data?.fetter }}</span>
		</div>
		<score-chart
			v-if="showScore && chartColor && data?.score"
			:data="data.score"
			:color="chartColor"></score-chart>
		<div class="artifact-list">
			<character-equipment
				v-for="(a, aKey) of artifacts"
				:key="aKey"
				:src="a.icon"
				:rarity="a.rarity"
				:level="a.level"
				:emptyIcon="artifactsFontIcon[aKey]"
			/>
		</div>
		<info-card title="套装效果" class="suit-list">
			<template v-if="data?.effects.length">
				<div v-for="(e, eKey) of data.effects" :key="eKey" class="suit-item">
					<character-equipment :src="getEquipmentIcon( e )" />
					<p class="suit-info">
						<span class="title">{{ e.name }}</span>
						<span class="suit-type">{{ e.num }}件套</span>
					</p>
				</div>
			</template>
			<p v-else>当前没有圣遗物套装效果</p>
		</info-card>
		<info-card v-if="data?.skills" title="天赋" class="suit-list">
			<div v-for="(s, sKey) of data.skills" :key="sKey" class="suit-item">
				<div class="circle-image-icon">
					<img class="center" :src="s.icon" alt="ERROR">
				</div>
				<p class="suit-info">
					<span class="title">{{ s.name }}</span>
					<span class="suit-type">Lv.{{ s.levelCurrent }}</span>
				</p>
			</div>
		</info-card>
		<info-card
			v-if="data?.constellations.detail"
			:title="'命之座('+ data.activedConstellationNum +'/6)'"
			class="constellations-list">
			<div v-for="(c, cKey) of data.constellations.detail" :key="cKey" class="circle-image-icon"
			     :class="{ locked: cKey >= data.activedConstellationNum }">
				<img class="center" :src="c.icon" alt="ERROR">
				<i class="icon-lock center"></i>
			</div>
		</info-card>
		<info-card v-if="data?.weapon" class="weapon-card">
			<div class="weapon-info-box">
				<character-equipment :src="data.weapon.image" emptyIcon="icon-weapon"/>
				<div class="weapon-info-content">
					<div class="weapon-info">
						<h3>{{ data.weapon.name }}</h3>
						<span class="weapon-level">Lv{{ data.weapon.level }}</span>
						<span class="weapon-affixLevel">精炼{{ data.weapon.affixLevel }}阶</span>
					</div>
					<div class="star-box">
						<img v-for="s of data.weapon.rarity" :key="s"
						     src="/genshin/adachi-assets/resource/rarity/icon/Icon_1_Stars.webp"
						     alt="ERROR">
					</div>
				</div>
			</div>
			<p class="weapon-desc">{{ weaponDesc }}</p>
		</info-card>
	</main>
	<footer>
		<p class="sign">Created by Adachi-BOT v{{ version }}</p>
	</footer>
</div>`

import { defineComponent, computed, ref, onMounted } from "vue";
import $https from "../../../front-utils/api.js";
import { urlParamsGet } from "../../../front-utils/url.js";
import CharacterEquipment from "./equipment.js";
import InfoCard from "./infoCard.js";
import ScoreChart from "./score-chart.js";

export default defineComponent( {
	name: "CharacterApp",
	template,
	components: {
		CharacterEquipment,
		InfoCard,
		ScoreChart
	},
	setup() {
		const urlParams = urlParamsGet( location.href );
		const data = ref( null );
		const version = window.ADACHI_VERSION;

		const getData = async () => {
			const res = await $https( "/char", { qq: urlParams.qq } )
			setCommonStyle( res.element );
			data.value = res;
		}

		onMounted( () => {
			getData();
		} );

		/* 是否显示评分 */
		const showScore = computed( () => {
			return urlParams.showScore === "true";
		} )

		/* echart图表颜色 */
		const chartColor = ref( null );

		function setStyle( colorList ) {
			document.documentElement.style.setProperty( "--baseInfoColor", colorList[0] );
			chartColor.value = {
				graphic: colorList[0],
				text: colorList[1]
			};
			document.documentElement.style.setProperty( "--hue-rotate", colorList[2] )
		}
		
		const getEquipmentIcon = item => {
			return `/genshin/adachi-assets/artifact/${ item.name }/image/${ item.icon }.webp`;
		};

		const elementIconSrc = computed( () => {
			if ( !data.value ) return "";
			return `/genshin/adachi-assets/resource/element/${ data.value.element.toLowerCase() }.webp`;
		} );
		const portrait = computed( () => {
			if ( !data.value ) return "";
			return `/genshin/adachi-assets/character/${ data.value.name }/image/gacha_splash.webp`;
		} );

		/* 武器描述处理 */
		const weaponDesc = computed( () => {
			const desc = data.value?.weapon?.desc;
			if ( !desc ) return "";
			return desc.replace( /[\\r\\n]/g, "" );
		} )

		// 圣遗物默认图标
		const artifactsFontIcon = [ "icon-flower", "icon-plume", "icon-sands", "icon-goblet", "icon-circle" ]

		/* 整理圣遗物数组 */
		const artifacts = computed( () => {
			const d = data.value;
			if ( !d ) return [];
			if ( d.artifacts.length >= 5 ) return d.artifacts
			const list = Array.from( { length: 5 }, () => ( {} ) );
			for ( const a of d.artifacts ) {
				list.splice( a.pos - 1, 1, a )
			}
			return list;
		} )

		function setCommonStyle( element ) {
			switch ( element ) {
				case "Anemo":
					setStyle( [ "#1ddea7", "#006746", "120deg" ] );
					break;
				case "Cryo":
					setStyle( [ "#1daade", "#004b66", "165deg" ] );
					break;
				case "Dendro":
					setStyle( [ "#5dde1d", "#226600", "85deg" ] );
					break;
				case "Electro":
					setStyle( [ "#871dde", "#380066", "240deg" ] );
					break;
				case "Geo":
					setStyle( [ "#de8d1d", "#663c00", "0deg" ] );
					break;
				case "Hydro":
					setStyle( [ "#1d8dde", "#003c66", "180deg" ] );
					break;
				case "Pyro":
					setStyle( [ "#de3a1d", "#660f00", "315deg" ] );
					break;
				case "None":
					setStyle( [ "#757575", "#666666", "0deg" ] );
					break;
			}
		}
		
		return {
			data,
			version,
			portrait,
			showScore,
			chartColor,
			elementIconSrc,
			getEquipmentIcon,
			artifactsFontIcon,
			artifacts,
			weaponDesc
		}
	}
} );