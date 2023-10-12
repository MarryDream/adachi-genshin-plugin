const template = `<div class="abyss-room" v-if="roomData">
	<SectionTitle showSubTitle>
		<template #default>第{{ [ "一", "二", "三" ][roomData.index - 1] }}间</template>
		<template #sub>
			<img
				v-for="item of roomData.maxStar"
				:key="item"
				:class="{'star-crush': item > roomData.star}"
				src="/genshin/adachi-assets/resource/abyss/star.webp" alt="ERROR"
			>
		</template>
	</SectionTitle>
	<span class="time">{{ stamp2date }}</span>
	<div class="room-info">
		<div v-for="(harf, harfIndex) of roomData.battles" :key="harfIndex" class="room-info-half">
			<h3>{{ [ "上半", "下半" ][harfIndex] }}</h3>
			<div class="character-list">
				<template v-for="(char, index) in harf.avatars" :key="index">
					<CharacterItem class="character-item" :char="char" type="level"/>
					<img
						src="/genshin/adachi-assets/resource/abyss/diamond.webp"
						alt="ERROR"
					/>
				</template>
			</div>
		</div>
	</div>
</div>`;

import SectionTitle from "../../../components/section-title/index.js";
import CharacterItem from "./character-item.js";
import { defineComponent, computed } from "vue";

export default defineComponent( {
	name: "AbyssRoom",
	template,
	components: {
		SectionTitle,
		CharacterItem
	},
	props: {
		roomData: Object
	},
	setup( props ) {
		const stamp2date = computed( () => {
			if ( !props.roomData ) return "";
			const date = new Date( parseInt( props.roomData.battles[0].timestamp ) * 1000 );
			return date.toLocaleDateString().replace( /\//g, "-" ) + " " + date.toTimeString().split( " " )[0];
		} );
		
		return {
			stamp2date
		}
	}
} );
