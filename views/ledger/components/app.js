const template = `<div v-if="data" class="ledger-base">
	<header>
		<article class="user-info">
			<p>UID {{ data.uid }}</p>
			<p>{{ data.nickname }}</p>
		</article>
		<article class="ledger-header">
			<p>旅行者{{ data.dataMonth }}月札记</p>
			<p>*仅统计充值途径以外获取的资源</p>
		</article>
	</header>
	<main>
		<article>
			<section-title>
				<template #default>每日数据</template>
			</section-title>
			<div class="ledger-data-content">
				<data-piece :data="data.pieceData.dayPrimogems" type="primogem" dateType="day"></data-piece>
				<data-piece :data="data.pieceData.dayMora" type="mora" dateType="day"></data-piece>
			</div>
		</article>
		<article>
			<section-title>
				<template #default>每月数据</template>
			</section-title>
			<div class="ledger-data-content">
				<data-piece :data="data.pieceData.monthPrimogems" type="primogem" dateType="month"></data-piece>
				<data-piece :data="data.pieceData.monthMora" type="mora" dateType="month"></data-piece>
			</div>
		</article>
		<article>
			<section-title>
				<template #default>原石来源统计</template>
			</section-title>
			<div class="ledger-data-content">
				<data-chart :data="data.monthData.groupBy"></data-chart>
			</div>
		</article>
		<p class="time">记录日期 {{ data.date }}</p>
	</main>
	<footer>
		<p>Created by Adachi-BOT v{{ version }}</p>
	</footer>
</div>`;

import { defineComponent, onMounted, ref } from "vue";
import $https from "../../../front-utils/api.js";
import { urlParamsGet } from "../../../front-utils/url.js";
import SectionTitle from "../../../components/section-title/index.js"
import DataPiece from "./data-piece.js"
import DataChart from "./data-chart.js"

export default defineComponent( {
	name: "LedgerApp",
	template,
	components: {
		SectionTitle,
		DataPiece,
		DataChart
	},
	setup() {
		const urlParams = urlParamsGet( location.href );
		const data = ref( null );
		const version = window.ADACHI_VERSION;
		
		function getPieceData( data ) {
			return {
				dayMora: {
					prev: data.dayData.lastMora,
					next: data.dayData.currentMora
				},
				dayPrimogems: {
					prev: data.dayData.lastPrimogems,
					next: data.dayData.currentPrimogems
				},
				monthMora: {
					prev: data.monthData.lastMora,
					next: data.monthData.currentMora
				},
				monthPrimogems: {
					prev: data.monthData.lastPrimogems,
					next: data.monthData.currentPrimogems
				}
			}
		}
		
		const getData = async () => {
			const res = await $https( "/ledger", { uid: urlParams.uid } );
			data.value = {
				...res,
				pieceData: getPieceData( res )
			};
		}
		
		onMounted( () => {
			getData();
		} );
		
		return {
			data,
			version
		}
	}
} )