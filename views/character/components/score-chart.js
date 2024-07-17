const template = `<div class="score-chart">
	<div class="chart" ref="echartsRef"></div>
	<p>评分：
		<span class="score" :style="{ color: color.text }">{{ score }}</span>
	</p>
	<p class="desc">*根据等级以及星级评分，仅供娱乐参考</p>
</div>`

import { defineComponent, ref, onMounted, computed, watch } from "vue";
import * as echarts from "echarts";

export default defineComponent( {
	name: "DataChart",
	template,
	props: {
		data: {
			type: Object,
			default: () => ( {} )
		},
		color: {
			type: String,
			default: () => ( {
				graphic: "#333",
				text: "#333"
			} )
		}
	},
	setup( props ) {
		const total = 100;
		
		const score = computed( () => props.data.total.toFixed( 2 ) )

		const myCharts = ref( null );
		const echartsRef = ref( null );
		
		function initEcharts() {
			if ( !myCharts.value ) {
				return;
			}
			myCharts.value.setOption( {
				animation: false,
				radar: {
					shape: "circle",
					center: [ "50%", "50%" ],
					radius: "65%",
					indicator: props.data.list.map( d => {
						return {
							name: d.label,
							max: total
						}
					} ),
					axisName: {
						color: props.color.text,
						fontSize: 14,
						fontFamily: "GenshinUsedFont, monospace",
						formatter: value => {
							const format = [ "武器等级", "天赋升级" ];
							if ( format.includes( value ) ) {
								const arr = value.split( "" );
								arr.splice( 2, 0, "\n" );
								return arr.join( "" );
							}
							return value;
						},
					},
					axisLine: {
						show: true
					}
				},
				series: [
					{
						type: "radar",
						areaStyle: {
							color: props.color.graphic,
							opacity: 0.4
						},
						itemStyle: {
							opacity: 0
						},
						lineStyle: {
							color: props.color.graphic,
							opacity: 0.6
						},
						data: [
							{
								value: props.data.list.map( d => d.percentage * total ),
							}
						]
					}
				]
			} );
		}

		watch( () => props.data, () => {
			initEcharts();
		} )

		onMounted( () => {
			if ( !echartsRef.value ) {
				return;
			}
			myCharts.value = echarts.init( echartsRef.value );
			initEcharts();

			if ( document.readyState !== "complete" ) {
				document.addEventListener( "readystatechange", () => {
					if ( document.readyState === "complete" ) {
						myCharts.value?.resize();
					}
				} );
			}

			window.addEventListener( "resize", () => {
				myCharts.value?.resize();
			} );
		} );

		return {
			score,
			echartsRef
		}
	}
} )