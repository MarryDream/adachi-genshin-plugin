const template = `<div class="character-item">
	<div class="avatar-box" :style="{'background-image': getRarityBg}">
		<img class="profile" :src="char && char.icon" alt="ERROR"/>
	</div>
	<p class="detail">
		<span class="level">{{ getStr }}</span>
	</p>
</div>`;

import { defineComponent, computed } from "vue";

export default defineComponent( {
	name: "CharacterBox",
	template,
	props: {
		char: Object,
		type: String
	},
	setup( props ) {
		/* 针对埃洛伊处理 */
		const getRarityBg = computed( () => {
			if ( !props.char ) return "";
			const rarity = props.char.rarity === 105 ? "5a" : props.char.rarity;
			return `url(/genshin/adachi-assets/resource/rarity/bg/Background_Item_${ rarity }_Star.webp)`;
		} );
		
		const getStr = computed( () => {
			if ( !props.char ) return "";
			return props.type === "level" ? "Lv." + props.char.level : props.char.value + "次";
		} );
		
		return {
			getStr,
			getRarityBg
		}
	}
} );
