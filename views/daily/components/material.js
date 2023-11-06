const template = `<section class="material">
	<div class="container">
		<div v-for="(m, mKey) of materialList" class="material-list" :key="mKey">
			<div v-for="type of ['character', 'weapon']" :key="type" class="material-item" :class="type">
				<template v-if="m[type]">
					<div class="title">
						<common-title :data="getTitleInfo(m[type].material)"/>
					</div>
					<div class="br"></div>
					<div class="thumb-list">
						<div v-for="(t, tKey) of getUnitList( m[type].units, type )" :key="tKey" class="thumb-box" :style="getThumbBg(t.rarity)">
							<div v-if="type === 'character'" class="thumb-element">
								<img v-for="( element, elementKey ) of t.element" :key="elementKey" :src="element" alt="ERROR">
							</div>
							<img class="thumb-avatar" :src="getThumb(type, t.icon || t.name)" alt="ERROR">
							<p>{{ t.name }}</p>
						</div>
					</div>
				</template>
			</div>
		</div>
	</div>
</section>`

import { defineComponent, computed } from "vue";
import CommonTitle from "./common-title.js";

export default defineComponent( {
	name: "DailyMaterial",
	template,
	components: {
		CommonTitle
	},
	props: {
		data: {
			type: Object,
			default: () => ( {} )
		}
	},
	setup( props ) {
		const weapon = parse( props.data.weapon );
		const character = parse( props.data.character );

		function parse( materialList ) {
			return Object.entries( materialList ).map( ( [ material, materialDetail ] ) => {
				const units = [ ...materialDetail.units ];
				return {
					material: {
						name: material,
						rank: materialDetail.rank
					},
					units: units.sort( ( prev, cur ) => cur.rarity - prev.rarity )
				}
			} );
		}

		/* 组合素材数据为方便渲染的格式 */
		const materialList = computed( () => {
			const length = Math.max( weapon.length, character.length );
			return Array.from( { length }, ( _, index ) => {
				const data = {};
				character[index] && ( data.character = character[index] );
				weapon[index] && ( data.weapon = weapon[index] );
				return data;
			} );
		} )

		/* 获取标题材料icon */
		const getIcon = name => `/genshin/adachi-assets/resource/material/${ name }.webp`;
		/* 获取头像 */
		const getThumb = ( type, name ) => {
			const baseUrl = "/genshin/adachi-assets";
			if ( type === "character" ) return `${ baseUrl }/character/${ name }/image/face.webp`;
			return `${ baseUrl }/weapon/${ name }/image/thumb.webp`;
		}

		/* 获取背景图 */
		const getThumbBg = rarity => {
			return {
				backgroundImage: `url('/genshin/adachi-assets/resource/rarity/bg/Background_Item_${ rarity }_Star.webp')`,
				backgroundSize: "cover"
			}
		}
		
		/* 获取元素图标 */
		const getElementIcon = id => {
			return `/genshin/adachi-assets/resource/element/${ id.toLowerCase() }.webp`;
		}

		const getTitleInfo = ( { name, rank } ) => {
			const de = name.split( "的" );
			const zhi = name.split( "之" );
			return {
				icon: {
					url: getIcon( name ),
					rank: rank,
				},
				title: de.length === 1 ? zhi[0] : de[0]
			};
		}
		
		const getUnitList = ( list, type ) => {
			if ( !list ) {
				return [];
			}
			if ( type !== "character" ) {
				return list;
			}
			const result = [];
			/* 处理重复的旅行者项 */
			let travelerIndex = -1; // 旅行者项的待插入位置
			const travelerList = [];
			list.forEach( ( avatar, sortIndex ) => {
				const id = avatar.id;
				if ( typeof id === "string" ) {
					if ( travelerIndex === -1 ) {
						travelerIndex = sortIndex;
					}
					/* 只保存妹妹（男主：？） */
					if ( id.startsWith( "10000007" ) ) {
						travelerList.push( avatar );
					}
				} else {
					result.push( {
						...avatar,
						element: [ getElementIcon( avatar.element.id ) ]
					} );
				}
			} );

			if ( travelerList.length ) {
				const traveler = travelerList[0];
				result.splice( travelerIndex, 0, {
					...traveler,
					id: 10000007,
					icon: "荧-风",
					name: "旅行者",
					element: travelerList.map( t => getElementIcon( t.element.id ) )
				} );
			}
			return result;
		}
		
		return {
			materialList,
			getIcon,
			getThumb,
			getThumbBg,
			getTitleInfo,
			getUnitList
		}
	}
} )