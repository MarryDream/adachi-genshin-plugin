const template = `<div class="data-chart">
	<div class="chart" ref="echartsRef"></div>
</div>`;

import { defineComponent, ref, onMounted, watch } from "vue";
import * as echarts from "echarts";

export default defineComponent( {
	name: "DataChart",
	template,
	props: {
		data: {
			type: Array,
			default: () => []
		}
	},
	setup( props ) {
		const myCharts = ref( null );
		const echartsRef = ref( null );

		function initEcharts() {
			if ( !myCharts.value ) {
				return;
			}
			myCharts.value.setOption( {
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
			echartsRef
		}
	}
} )