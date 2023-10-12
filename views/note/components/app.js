const template = `<div v-if="data" class="note">
	<p class="uid">实时便笺 UID{{ data.uid }}</p>
	<div class="list-info">
		<NoteInfo v-for="d in data.dataList" :data="d"/>
	</div>
	<div class="expedition-box box">
		<p class="title expedition-title">
			探索派遣限制 （{{ data.currentExpeditionNum }}/{{ data.maxExpeditionNum }}）
		</p>
		<NoteExpedition v-for="e in data.expeditions" :data="e"/>
	</div>
	<p class="author">Created by Adachi-BOT v{{ version }}</p>
</div>`;

import { defineComponent, onMounted, ref } from "vue";
import $https from "../../../front-utils/api.js";
import { urlParamsGet } from "../../../front-utils/url.js";
import NoteInfo from "./info.js";
import NoteExpedition from "./expedition.js";

export default defineComponent( {
	name: "NoteApp",
	template,
	components: {
		NoteInfo,
		NoteExpedition
	},
	setup() {
		const urlParams = urlParamsGet( location.href );
		const data = ref( null );
		const version = window.ADACHI_VERSION;
		
		/* 获取洞天宝钱时间 */
		function getHomeCoinSubtitle( data ) {
			if ( data.maxHomeCoin === 0 ) return "先去璃月完成「翠石砌玉壶」任务吧";
			if ( data.homeCoinRecoveryTime === "0" ) return "洞天宝钱已满";
			return `预计将在 ${ getTimePoint( data.homeCoinRecoveryTime ) } 达到上限`;
		}
		
		/* 获取洞天宝钱显示值 */
		function getHomeCoinValue( data ) {
			if ( data.maxHomeCoin === 0 ) return "尚未开启";
			return `${ data.currentHomeCoin }/${ data.maxHomeCoin }`;
		}
		
		/* 获取参量质变仪显示值 */
		function getTransformerValue( data ) {
			const { recoveryTime, obtained } = data.transformer;
			if ( !obtained ) return "尚未获得";
			return recoveryTime.reached ? "可使用" : "冷却中"
		}
		
		/* 获取质量参编仪时间 */
		function getTransformerSubtitle( data ) {
			const { recoveryTime, obtained } = data.transformer;
			if ( !obtained ) return "先去璃月完成「天遒宝迹」任务吧";
			let { day, hour, minute, second, reached } = recoveryTime;
			if ( reached ) return "已准备完成";
			const dayStr = day ? day + "天" : "";
			const hourStr = hour ? hour + "小时" : "";
			const minuteStr = minute ? minute + "分" : "";
			const secondStr = second ? second + "秒" : "";
			return `${ dayStr + hourStr + minuteStr + secondStr }后可再次使用`;
		}
		
		function getDataList( data ) {
			const resin = {
				icon: "/genshin/adachi-assets/resource/material/原粹树脂.webp",
				title: "原粹树脂",
				subtitle: data.resinRecoveryTime !== "0" ? `预计将在 ${ getTimePoint( data.resinRecoveryTime ) } 全部恢复` : "原粹树脂已满",
				value: `${ data.currentResin }/${ data.maxResin }`
			};
			const commission = {
				icon: "/genshin/adachi-assets/resource/common/icon/Icon_Commission.webp",
				title: "每日委托任务",
				subtitle: `「每日委托」奖励${ data.isExtraTaskRewardReceived ? "已" : "未" }领取`,
				value: `${ data.finishedTaskNum }/${ data.totalTaskNum }`
			};
			const weekly = {
				icon: "/genshin/adachi-assets/resource/common/icon/Emblem_Domains.webp",
				title: "值得铭记的强敌",
				subtitle: "本周已使用消耗减半次数",
				value: `${ data.resinDiscountNumLimit - data.remainResinDiscountNum }/${ data.resinDiscountNumLimit }`
			};
			const homes = {
				icon: "/genshin/adachi-assets/resource/material/尘歌壶.webp",
				title: "洞天财瓮 - 洞天宝钱",
				subtitle: getHomeCoinSubtitle( data ),
				value: getHomeCoinValue( data ),
				miniFontSize: data.maxHomeCoin !== 0
			};
			const transformer = {
				icon: "/genshin/adachi-assets/resource/material/参量质变仪.webp",
				title: "参量质变仪",
				subtitle: getTransformerSubtitle( data ),
				value: getTransformerValue( data )
			};
			
			return [ resin, homes, commission, weekly, transformer ]
		}
		
		function getTrueDay( day ) {
			return day === 0 ? 7 : day;
		}
		
		function getTimePoint( time ) {
			const date = new Date();
			const sec = date.getSeconds();
			date.setSeconds( sec + parseInt( time ) );
			return moment().add( parseInt( time ), "s" ).calendar( null, {
				nextWeek: function ( now ) {
					return getTrueDay( ( this._d ).getDay() ) > getTrueDay( ( now )._d.getDay() ) ? 'ddddhh:mm' : '[下]ddddhh:mm';
				},
				lastWeek: function ( now ) {
					return getTrueDay( ( this._d ).getDay() ) < getTrueDay( ( now )._d.getDay() ) ? 'ddddhh:mm' : '[上个]ddddhh:mm';
				}
			} )
		}
		
		const getData = async () => {
			const res = await $https( "/note", { uid: urlParams.uid } );
			res.expeditions.forEach( ( el ) => {
				el.remainedTime = getTimePoint( el.remainedTime );
			} );
			data.value = {
				...res,
				dataList: getDataList( res )
			}
		};
		
		onMounted( () => {
			getData();
		} );
		
		return { data, list }
	}
} );
