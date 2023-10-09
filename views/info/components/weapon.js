const template = `<div class="weapon">
	<div class="info-top-base">
		<info-line title="基本属性" :data="dataBlockInfo"></info-line>
		<info-card class="skill-card">
			<h3 class="skill-title">{{ data.skill.name }}</h3>
			<div class="skill-content" v-html="data.skill?.content"></div>
		</info-card>
	</div>
	<info-card class="materials-card" :title="materialsTitle">
		<materials-list :data="materialsInfo"></materials-list>
	</info-card>
</div>`;

import { computed, defineComponent } from "vue";
import InfoLine from "./info-line.js";
import InfoCard from "./info-card.js";
import MaterialsList from "./materials-list.js"

export default defineComponent( {
	name: "InfoWeapon",
	template,
	components: {
		InfoLine,
		InfoCard,
		MaterialsList,
	},
	props: {
		data: {
			type: Object,
			default: () => ( {
				access: "",
				rarity: null,
				mainStat: "",
				mainValue: "",
				baseATK: null,
				ascensionMaterials: [],
				time: "",
				skillName: "",
				skillContent: ""
			} )
		}
	},
	setup( props ) {
		const weekMap = [ "一", "二", "三", "四", "五", "六", "日" ];
		
		const materialsTitle = computed( () => `材料消耗【周${ props.data.time.map( t => weekMap[t - 1] ).join( "/" ) }】` );
		
		const materialsInfo = computed( () => ( {
			label: "",
			value: [
				...props.data.updateCost.ascensionMaterials, {
					name: "摩拉",
					rank: 1,
					count: props.data.updateCost.coins
				}
			],
			showTitle: false,
		} ) );
		
		const dataBlockInfo = computed( () => {
			const maxProp = Object.values( props.data.props ).slice( -1 )[0];
			return [
				{
					基础攻击力: maxProp.baseATK,
					[maxProp.extraProp?.name]: maxProp.extraProp?.value
				},
				{
					来源: props.data.fetter.access
				}
			]
		} );
		
		return {
			materialsTitle,
			materialsInfo,
			dataBlockInfo
		}
	}
} );
