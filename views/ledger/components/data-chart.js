const template = `<div class="data-chart">
	<VChart class="chart" :option="chartOption" :key="chartKey"></VChart>
</div>`;

import { defineComponent, ref, onMounted, computed } from "vue";
import "echarts";
import VChart from "vue-echarts";

export default defineComponent( {
	name: "DataChart",
	template,
	components: {
		VChart
	},
	props: {
		data: {
			type: Array,
			default: () => []
		}
	},
	setup( props ) {
		const chartKey = ref( 0 );
		
		const chartOption = computed(() => ({
			animation: false,
			legend: {
				orient: "vertical",
				left: 380,
				top: "center",
				align: "left",
				data: props.data.map( d => `${ d.action } ${ d.percent }%` ),
				icon: "rect",
				itemWidth: 15,
				itemHeight: 15,
				textStyle: {
					color: "#fff",
				}
			},
			textStyle: {
				color: "#fff",
				fontFamily: "GenshinUsedFont, monospace"
			},
			series: [
				{
					type: "pie",
					right: 200,
					data: props.data.map( d => {
						return {
							name: `${ d.action } ${ d.percent }%`,
							value: d.num
						}
					} ),
					radius: [ "60%", "75%" ],
					label: {
						show: false
					}
				}
			]
		}) )
		
		/* 字体加载完毕后刷新e-chart */
		const timer = ref( null );
		
		onMounted( () => {
			timer.value = setInterval( () => {
				if ( document.readyState === "complete" ) {
					chartKey.value++;
					window.clearInterval( timer.value );
					timer.value = null;
				}
			}, 20 )
		} );
		
		return {
			chartKey,
			chartOption
		}
	}
} )