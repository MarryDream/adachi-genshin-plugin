const template = `<div v-if="data" class="statistic-box">
	<p class="time">@{{ data.nickname }} at {{ fullDate }}</p>
	<span class="main-title">祈愿统计</span>
	<span class="total">总计： {{ data.total }} 抽</span>
	<div
		v-show="data.character.length !== 0"
		class="gotten"
	>
		<p class="title">抽中角色: {{ data.charCount }}</p>
		<div class="box">
			<StatisticItem v-for="el in data.character" :data="el"/>
		</div>
	</div>
	<div
		v-show="data.weapon.length !== 0"
		class="gotten"
	>
		<p class="title">抽中武器: {{ data.weaponCount }}</p>
		<div class="box">
			<StatisticItem v-for="el in data.weapon" :data="el"/>
		</div>
	</div>
	<p class="author">Created by Adachi-BOT v{{ version }}</p>
</div>`;

import { defineComponent, onMounted, Ref, ref } from "vue";
import $https from "../../../front-utils/api.js";
import { urlParamsGet } from "../../../front-utils/url.js";
import { getFullDate } from "../../../front-utils/date.js";
import StatisticItem from "./item.js";

export default defineComponent( {
	name: "WishStatistic",
	template,
	components: {
		StatisticItem
	},
	setup() {
		const urlParams = urlParamsGet( location.href );
		const data = ref( null );
		const version = window.ADACHI_VERSION;
		
		const fullDate = getFullDate();
		
		const getData = async () => {
			const res = await $https( "/wish/statistic", { qq: urlParams.qq } );
			data.value = {
				...res,
				weaponCount: res.weapon.reduce( ( pre, cur ) => pre + cur.count, 0 ),
				charCount: res.character.reduce( ( pre, cur ) => pre + cur.count, 0 )
			}
		};
		
		onMounted( () => {
			getData();
		} );
		
		return {
			data,
			version,
			fullDate
		}
	}
} );
