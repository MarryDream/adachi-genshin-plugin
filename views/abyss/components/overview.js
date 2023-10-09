const template = `<div v-if="parsed && parsed.showData" class="overview">
	<ul class="info">
		<li>最深抵达： {{ data.maxFloor }}</li>
		<li>挑战次数： {{ data.totalBattleTimes }}</li>
		<li>
			<img class="star-img" src="/genshin/adachi-assets/resource/abyss/star.png"
			     alt="ERROR"/>
			<span class="star-num">{{ data.totalStar }}</span>
		</li>
	</ul>
	<div class="reveal">
		<SectionTitle>出战次数</SectionTitle>
		<div class="character-list">
			<character-item v-for="(char, index) in reveals" :key="index" :char="char" type="reveal"/>
		</div>
	</div>
	<div class="battle-data">
		<SectionTitle>战斗数据</SectionTitle>
		<ul class="data-list">
			<li v-for="key of Object.keys(parsed.dataList)" :key="key">
				<span>{{ key }}: {{ parsed.dataList[key].value }}</span>
				<img :src="parsed.dataList[key].avatarIcon" alt="ERROR"/>
			</li>
		</ul>
	</div>
</div>
<div v-else class="no-data">
	<p>暂无挑战数据</p>
</div>`;

import { abyssDataParser } from "../../../front-utils/data-parser.js"
import SectionTitle from "../../../components/section-title/index.js";
import CharacterItem from "./character-item.js";
import { defineComponent, computed } from "vue";

export default defineComponent( {
	name: "AbyssOverview",
	template,
	components: {
		SectionTitle,
		CharacterItem
	},
	props: {
		data: Object
	},
	setup( props ) {
		const parsed = computed( () => {
			if ( !props.data ) return null;
			return abyssDataParser( props.data );
		} );
		
		const reveals = computed( () => {
			const reveals = parsed.value?.reveals;
			if ( !reveals ) return [];
			return reveals.map( el => {
				return {
					...el,
					icon: el.avatarIcon
				};
			} );
		} );
		
		return {
			...parsed,
			reveals
		}
	}
} );
