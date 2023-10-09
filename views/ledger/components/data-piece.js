const template = `<div class="data-piece">
	<div class="icon-box">
		<img :src="pieceIcon" alt="ERROR">
	</div>
	<ul class="piece-content">
		<li class="prev-data">
			<p>{{ prevLabel }}</p>
			<p>{{ data.prev }}</p>
		</li>
		<li class="next-data">
			<p>{{ nextLabel }}</p>
			<p>{{ data.next }}</p>
		</li>
	</ul>
	<div class="piece-footer">
		<p>
			<span>较{{ prevLabel }}{{ increaseData.label }}: </span>
			<span :style="{ color: increaseData.color }">{{ increaseData.num }}</span>
		</p>
	</div>
</div>`;

import { defineComponent, computed } from "vue";

export default defineComponent( {
	name: "DataPiece",
	template,
	props: {
		/* 数据 */
		data: {
			type: Object,
			default: () => ( {
				prev: 0,
				next: 0
			} )
		},
		/* 数据日期类型 */
		dateType: {
			type: String,
			default: "day"
		},
		/* 数据类型 */
		type: {
			type: String,
			default: "primogem"
		}
	},
	setup( props ) {
		/* 获取图标 */
		const pieceIcon = computed( () => {
			return `/genshin/adachi-assets/resource/ledger/image/item_${ props.type }.png`
		} );
		
		const prevLabel = computed( () => {
			return props.dateType === "month" ? "上月" : "昨日";
		} );
		
		const nextLabel = computed( () => {
			return props.dateType === "month" ? "本月" : "今日";
		} );
		
		/* 较昨日增长相关数据 */
		const increaseData = computed( () => {
			const increaseNum = props.data.next - props.data.prev
			return {
				num: Math.abs( increaseNum ),
				color: increaseNum < 0 ? "#91CC75" : "#ffaa0d",
				label: increaseNum < 0 ? "减少" : "增加"
			}
		} )
		
		return {
			pieceIcon,
			prevLabel,
			nextLabel,
			increaseData
		}
	}
} )