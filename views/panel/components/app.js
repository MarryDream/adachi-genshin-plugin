const template = `<div v-if="data" class="chara-detail" :class="{ none: data.element === 'none' }">
	<div class="portrait-box">
		<img class="portrait" :src="portrait" alt="portrait">
	</div>
	<div class="detail-left">
		<div class="user">
			<img :src="userAvatar" alt="avatar">
			<div class="user-info">
				<p>UID {{ data.uid }}</p>
				<p>{{ data.username }}</p>
			</div>
		</div>
		<div class="base-info card">
			<div v-for="(a, aKey) of overview" :key="aKey" class="list-item">
				<p class="base-info-label">
					<svg class="iconpark-icon" :style="{ color: a.color }">
						<use :href="a.icon"></use>
					</svg>
					<span class="label">{{ a.attr }}</span>
				</p>
				<p class="base-info-value">
					<span>{{ a.resultValue }}</span>
					<span v-if="a.extraValue" class="extra">(+{{ a.extraValue }})</span>
				</p>
			</div>
		</div>
		<div class="talent">
			<p class="model-title">命座</p>
			<ul class="talent-content">
				<li v-for="t in 6" :class="{ block: t > data.talent }" :key="t">
					<img :src="getTalentIcon(t)" :alt="'talent' + t">
				</li>
			</ul>
		</div>
		<div class="skill">
			<p class="model-title">天赋</p>
			<ul class="skill-content">
				<li v-for="(s, sKey) of skills" :key="sKey">
					<img :src="getSkillIcon(s.name)" :alt="s.name">
					<div class="skill-level" :class="{ special: s.ext }">
						<span>{{ s.level }}</span>
					</div>
				</li>
			</ul>
		</div>
	</div>
	<div class="detail-right">
		<div class="avatar-info">
			<p>
				<span class="avatar-name">{{ data.name }}</span>
				<p class="level-info">Lv{{ data.level }}</p>
				<p class="talent-info">{{ data.talent }}命</p>
			</p>
			<p class="fetter-info">好感度等级：{{ data.fetter }}</p>
		</div>
		<div class="artifact-list">
			<artifact v-for="(a, aKey) of artifacts" :position="aKey" :key="aKey" :data="a" />
			<div class="extra-info">
				<div class="artifact-effect card">
					<i class="icon-flower bg-icon"></i>
					<template v-if="data.artifact.effects?.length">
						<p v-for="(e, eKey) of data.artifact.effects">
							<span>{{ e.count }}件套：</span>
							<span>{{ e.name }}</span>
						</p>
					</template>
					<p v-else class="artifact-effect-empty">暂无圣遗物套装数据</p>
				</div>
				<div class="weapon-card card">
					<i class="icon-weapon bg-icon"></i>
					<div class="weapon-icon">
						<img :src="weaponIcon" :alt="data.weapon.name">
						<p>{{ data.weapon.name }}</p>
					</div>
					<div class="weapon-info">
						<p class="level-rank">
							<span>Lv {{ data.weapon.level }}</span>
							<span>R{{ data.weapon.affix }}</span>
						</p>
						<p class="star-list">
							<img v-for="s in data.weapon.star" :key="s" src="/genshin/adachi-assets/resource/rarity/icon/Icon_1_Stars.webp" alt="STAR">
						</p>
						<p class="weapon-attr">
							<p v-for="(a, aKey) of data.weapon.attrs">
								<svg class="iconpark-icon" :style="{ color: a.color }">
									<use :href="a.icon"></use>
								</svg>
								<span>{{ a.value }}</span>
							</p>
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="author">Created by Adachi-BOT v{{ version }}</div>
</div>`;

import $https from "../../../front-utils/api.js";
import { urlParamsGet } from "../../../front-utils/url.js";
import Artifact from "./artifact.js";
import { defineComponent, computed, onMounted, ref } from "vue";

export default defineComponent( {
	name: "CharaDetailApp",
	template,
	components: {
		Artifact
	},
	setup() {
		const urlParams = urlParamsGet( location.href );
		const data = ref( null );
		const version = window.ADACHI_VERSION;

		const styleMap = {
			anemo: [ "#41c88f", "110deg", "120deg" ],
			cryo: [ "#41aac8", "150deg", "165deg" ],
			dendro: [ "#51c841", "60deg", "70deg" ],
			electro: [ "#6e41c8", "210deg", "225deg" ],
			geo: [ "#c88b41", "-5deg", "0deg" ],
			hydro: [ "#4176c8", "170deg", "176deg" ],
			pyro: [ "#c84141", "310deg", "315deg" ],
			none: [ "#999999", "0deg", "0deg" ]
		}

		// 圣遗物默认图标
		const artifactsFontIcon = [ "icon-flower", "icon-plume", "icon-sands", "icon-goblet", "icon-circle" ]

		/* 给圣遗物添加种类图标 */
		const artifacts = computed( () => {
			if ( !data.value ) return [];
			return data.value.artifact.list.map( ( a, aKey ) => {
				return {
					...a,
					typeIcon: artifactsFontIcon[aKey]
				}
			} )
		} )

		/* 获取头像 */
		const userAvatar = computed( () => {
			if ( !data.value ) return "";
			return urlParams.stranger === "true"
				? `/genshin/adachi-assets/character/${ data.value.name }/image/face.webp`
				: `https://q1.qlogo.cn/g?b=qq&s=640&nk=${ urlParams.qq }`;
		} );

		const weaponIcon = computed( () => {
			if ( !data.value ) return "";
			return `/genshin/adachi-assets/weapon/${ data.value.weapon.name }/image/thumb.webp`;
		} );

		const portrait = computed( () => {
			if ( !data.value ) return "";
			return `/genshin/adachi-assets/character/${ data.value.name }/image/gacha_splash.webp`;
		} );

		const overview = computed( () => {
			if ( !data.value ) return [];
			const name = "元素伤害加成";
			const bonusAttr = {};
			data.value.overview
				.filter( el => el.attr.includes( name ) )
				.forEach( el => {
					if ( !Reflect.get( bonusAttr, el.baseValue ) ) {
						Reflect.set( bonusAttr, el.baseValue, [ el.attr ] )
					} else {
						Reflect.get( bonusAttr, el.baseValue ).push( el.attr )
					}
				} );
			/* 查找 baseValue 相同数量大于2的伤害加成属性 */
			const filterBonus = Object.values( bonusAttr ).find( el => el.length > 2 ) || [];
			const list = data.value.overview.sort( ( prev, next ) => {
				if ( prev.attr.includes( name ) && next.attr.includes( name ) ) {
					const getValue = el => Number.parseInt( el.baseValue.replace( "%", "" ) )
					return getValue( next ) - getValue( prev );
				}
			} ).filter( el => {
				/* 剔除重复的伤害加成属性 */
				return !filterBonus.includes( el.attr );
			} )
			/* 最多展示9个 */
			list.splice( 9 );
			return list;
		} )

		function getTalentIcon( talentKey ) {
			if ( !data.value ) return "";
			return `/genshin/adachi-assets/character/${ data.value.name }/icon/cons_${ talentKey }.webp`;
		}

		function getSkillIcon( skillKey ) {
			if ( !data.value ) return "";
			return `/genshin/adachi-assets/character/${ data.value.name }/icon/skill_${ skillKey }.webp`;
		}
		
		/* 格式化技能 */
		const skills = ref( [] );
		
		const getData = async () => {
			data.value = await $https( "/panel", { qq: urlParams.qq } );
			
			for ( const skillKey in data.value.skill ) {
				if ( skillKey === "undefined" ) continue;
				skills.value.push( {
					...data.value.skill[skillKey],
					name: skillKey
				} )
			}
			
			const elemStyle = styleMap[data.value.element.toLowerCase()];
			document.documentElement.style.setProperty( "--base-color", elemStyle[0] );
			document.documentElement.style.setProperty( "--bg-hue-rotate", elemStyle[1] );
			document.documentElement.style.setProperty( "--talent-hue-rotate", elemStyle[2] );
		};
		
		onMounted( () => {
			getData();
		} );

		return {
			data,
			version,
			artifacts,
			urlParams,
			userAvatar,
			overview,
			portrait,
			skills,
			weaponIcon,
			getTalentIcon,
			getSkillIcon
		}
	}
} );


