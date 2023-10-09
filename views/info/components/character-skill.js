const template = `<div class="character-skill">
	<info-card class="skill-card">
		<h3 class="skill-card-title">{{ skill.name }}</h3>
		<div class="skill-card-content" v-html="skill.desc"></div>
	</info-card>
	<info-card class="burst-card">
		<h3 class="skill-card-title">{{ burst.name }}</h3>
		<div class="skill-card-content" v-html="burst.desc"></div>
	</info-card>
</div>`;

import { defineComponent, computed } from "vue";
import InfoLine from "./info-line.js";
import InfoCard from "./info-card.js";
import MaterialsList from "./materials-list.js"

export default defineComponent( {
	name: "CharacterSkill",
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
				birthday: "",
				element: "",
				cv: "",
				constellationName: "",
				rarity: null,
				mainStat: "",
				mainValue: "",
				baseHP: null,
				baseATK: null,
				baseDEF: null,
				ascensionMaterials: [],
				levelUpMaterials: [],
				talentMaterials: [],
				constellations: [],
				time: ""
			} )
		}
	},
	setup( props ) {
		const skill = computed(() => {
			return props.data.skills.find( sk => sk.icon === "skill_2" );
		});

		const burst = computed(() => {
			return props.data.skills.find( sk => sk.icon === "skill_4" );
		});
		
		return {
			skill,
			burst
		}
	}
} );
