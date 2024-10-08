import bot from "ROOT"
import { getRealName, NameResult } from "../utils/name";
import { isCharacterInfo, isWeaponInfo, InfoResponse, CalendarData, InfoMaterial } from "../types";
import { RenderResult } from "@/modules/renderer";
import { metaManagement, renderer } from "#/genshin/init";
import { calendarPromise } from "#/genshin/utils/promise";
import { Order } from "@/modules/command";
import { Sendable } from "@/modules/lib";
import { DailyMaterial } from "#/genshin/types/ossMeta";
import { getRandomNumber } from "@/utils/random";
import { DailyInfo } from "#/genshin/types/daily";
import { getInfo } from "#/genshin/utils/local-assets";
import { scheduleHub } from "#/genshin/utils/schedule-hub";

export type DailyDataMaterial = {
	[K in keyof DailyMaterial]: InfoResponse[]
}

export class DailySet {
	private readonly weaponSet: DailyInfo<"weapon">;
	private readonly characterSet: DailyInfo<"character">;
	private readonly eventData: CalendarData[];

	constructor( data: InfoResponse[], events: CalendarData[] ) {
		this.weaponSet = {};
		this.characterSet = {};
		this.eventData = events;
		for ( let d of data ) {
			if ( isCharacterInfo( d ) ) {
				const dailyMaterials = d.updateCost.talentMaterials.filter( material => material.rank === 4 );
				dailyMaterials.forEach( material => {
					this.add( material, d, "character" );
				} );
			} else if ( isWeaponInfo( d ) ) {
				const dailyMaterial = d.updateCost.ascensionMaterials.find( material => material.rank === 5 );
				if ( dailyMaterial ) {
					this.add( dailyMaterial, d, "weapon" );
				}
			}
		}
	}

	private add( material: InfoMaterial, value: InfoResponse, type: string ): void {
		const name: string = `${ type }Set`;
		const setData = this[name][material.name];
		if ( setData ) {
			setData.units.push( value );
		} else {
			this[name][material.name] = {
				name: material.name,
				rank: material.rank,
				units: [ value ]
			}
		}
	}

	public async save( id: number ): Promise<void> {
		await bot.redis.setHash(
			`silvery-star.daily-temp-${ id }`, {
				weapon: JSON.stringify( this.weaponSet ),
				character: JSON.stringify( this.characterSet ),
				event: JSON.stringify( this.eventData )
			} );
	}
}

async function getRenderResult( id: number, subState: boolean, week?: number ): Promise<RenderResult> {
	return await renderer.asSegment( "/daily/index.html", {
		id,
		type: subState ? "sub" : "all",
		week: week ?? "today"
	} );
}

export class DailyClass {
	private allData: DailyDataMaterial = { "Mon&Thu": [], "Tue&Fri": [], "Wed&Sat": [] };
	private eventData: CalendarData[] = [];

	constructor() {
		calendarPromise().then( ( result: CalendarData[] ) => {
			this.eventData = result;
		} )

		metaManagement.on( "meta/daily", () => {
			this.allData = { "Mon&Thu": [], "Tue&Fri": [], "Wed&Sat": [] };
		} );

		scheduleHub.on( "0 2 12 * * *", async () => {
			this.eventData = await calendarPromise();
		} );

		scheduleHub.on( "0 2 16 * * *", async () => {
			this.eventData = await calendarPromise();
		} );

		scheduleHub.on( "0 0 6 * * *", async () => {
			const date: Date = new Date();

			/* 获取当日副本对应的角色和武器 */
			let week: number = date.getDay();
			week = date.getHours() < 4 ? week === 0 ? 6 : week - 1 : week;
			const todayInfoSet: string[] = this.getDetailSet( week );

			/* 获取所有角色和武器的信息 */
			await this.getAllData( week, todayInfoSet, true );

			/* 群发订阅信息 */
			const groupIDs: string[] = await bot.redis.getList( "silvery-star.daily-sub-group" );

			const groupData = new DailySet( this.getDataSet( week ), this.eventData );
			await groupData.save( 0 );
			const res: RenderResult = await getRenderResult( 0, false );
			if ( res.code === "ok" ) {
				const subMessage: Sendable = res.data;
				for ( let id of groupIDs ) {
					await bot.client.sendGroupMsg( Number.parseInt( id ), subMessage );
				}
			} else {
				bot.logger.error( "[genshin][daily]" + res.error );
				await bot.message.sendMaster( "每日素材订阅图片渲染异常，请查看日志进行检查" );
			}

			/* 私发订阅信息 */
			const users: string[] = await bot.redis.getKeysByPrefix( "silvery-star.daily-sub-" );

			for ( let key of users ) {
				const userID: number = parseInt( <string>key.split( "-" ).pop() );
				const data: DailySet | undefined = await this.getUserSubList( userID );
				if ( data === undefined ) {
					continue;
				}
				await data.save( userID );
				const res: RenderResult = await getRenderResult( userID, true );
				if ( res.code === "error" ) {
					await bot.message.sendMaster( "每日素材订阅图片渲染异常，请查看日志进行检查" );
					continue;
				}
				const randomMinute: number = getRandomNumber( 3, 59 );
				date.setMinutes( randomMinute );

				scheduleHub.on( date, async () => {
					await bot.client.sendPrivateMsg( userID, res.data );
				} );
			}
		} );
	}

	public get detail() {
		return metaManagement.getMeta( "meta/daily" );
	}

	private static getDateStr( week: number ): string | null {
		if ( week === 1 || week === 4 ) {
			return "Mon&Thu";
		} else if ( week === 2 || week === 5 ) {
			return "Tue&Fri";
		} else if ( week === 3 || week === 6 ) {
			return "Wed&Sat";
		} else {
			return null;
		}
	}

	private getDetailSet( week: number ): string[] {
		const param = DailyClass.getDateStr( week );
		return param ? this.detail[param] : [];
	}

	private getDataSet( week: number ): InfoResponse[] {
		const param = DailyClass.getDateStr( week );
		return param ? this.allData[param] : [];
	}

	private async getAllData( week: number, set: string[], clear: boolean ): Promise<void> {
		if ( clear ) {
			this.allData = { "Mon&Thu": [], "Tue&Fri": [], "Wed&Sat": [] };
		}
		if ( week === 0 ) {
			return;
		}
		for ( let targetName of set ) {
			try {
				const data = await getInfo( targetName );
				if ( data ) {
					this.getDataSet( week ).push( data );
				}
			} catch ( e ) {
				bot.logger.error( `[genshin][daily]「${ targetName }」信息获取失败: ${ e }` );
			}
		}
	}

	private static getWeek( initWeek?: number ): number {
		let week: number;
		if ( initWeek ) {
			week = initWeek === 7 ? 0 : initWeek;
		} else {
			const date = new Date();
			week = date.getDay();
			week = date.getHours() < 4 ? week === 0 ? 6 : week - 1 : week;
		}
		return week;
	}

	private async getUserSubList( userID: number, initWeek?: number ): Promise<DailySet | undefined> {
		const dbKey: string = `silvery-star.daily-sub-${ userID }`;
		const subList: string[] = await bot.redis.getList( dbKey );

		/* 排除活动日历订阅 */
		const itemSubList: string[] = subList.filter( s => s !== "活动" );

		/* 是否存在活动订阅 */
		const hasEventSub: Boolean = itemSubList.length !== subList.length;

		const week: number = DailyClass.getWeek( initWeek );
		if ( this.getDataSet( week ).length === 0 ) {
			const set: string[] = this.getDetailSet( week );
			await this.getAllData( week, set, false );
		}

		if ( initWeek ?? subList.length === 0 ) {
			return undefined;
		}

		const privateSub: InfoResponse[] = [];
		for ( let item of itemSubList ) {
			const find: InfoResponse | undefined = this.getDataSet( week ).find( el => el.name === item );
			if ( find === undefined ) {
				continue;
			}
			privateSub.push( find );
		}
		if ( privateSub.length === 0 && !hasEventSub ) {
			return undefined;
		}

		return new DailySet( privateSub, hasEventSub ? this.eventData : [] );
	}

	public async getUserSubscription( userID: number, initWeek?: number ): Promise<Sendable> {
		if ( initWeek === 7 ) {
			return "周日所有材料都可以刷取哦~";
		}

		const week: number = DailyClass.getWeek( initWeek );

		const data: DailySet | undefined = await this.getUserSubList( userID, initWeek === undefined ? undefined : week );
		/* 是否是订阅数据 */
		const subState = data !== undefined;
		const set = data === undefined ? new DailySet( this.getDataSet( week ), this.eventData ) : data;

		await set.save( userID );
		const res: RenderResult = await getRenderResult( userID, subState, initWeek === undefined ? undefined : week );
		if ( res.code === "ok" ) {
			return res.data;
		} else {
			bot.logger.error( "[genshin][daily]" + res.error );
			const CALL = <Order>bot.command.getSingle( "adachi.call", await bot.auth.get( userID ) );
			const appendMsg = CALL ? `私聊使用 ${ CALL.getHeaders()[0] } ` : "";
			return `图片渲染异常，请${ appendMsg }联系持有者进行反馈`;
		}
	}

	/* 添加/删除群聊订阅 */
	public async modifySubscriptGroup( groupId: string, operation: boolean ) {
		const dbKey: string = "silvery-star.daily-sub-group";
		const exist: boolean = await bot.redis.existListElement( dbKey, groupId );

		if ( exist === operation ) {
			return `群聊 ${ groupId } ${ operation ? "已订阅" : "未曾订阅" }`;
		} else if ( operation ) {
			await bot.redis.addListElement( dbKey, groupId );
		} else {
			await bot.redis.delListElement( dbKey, groupId );
		}

		return `群聊订阅${ operation ? "添加" : "取消" }成功`;
	}

	public async modifySubscriptUser( userID: number, operation: boolean, name: string ) {
		/* 是否为活动日历 */
		const isEvent: Boolean = name === "活动";

		/* 添加/删除私聊订阅 */
		const result: NameResult = getRealName( name );

		if ( result.definite || isEvent ) {
			const realName: string = isEvent ? name : <string>result.info;
			const dbKey: string = `silvery-star.daily-sub-${ userID }`;
			const exist: boolean = await bot.redis.existListElement( dbKey, realName );

			if ( exist === operation ) {
				return `「${ realName }」${ operation ? "已订阅" : "未曾订阅" }`;
			} else if ( operation ) {
				await bot.redis.addListElement( dbKey, realName );
			} else {
				await bot.redis.delListElement( dbKey, realName );
			}

			return `订阅${ operation ? "添加" : "取消" }成功`;
		} else if ( result.info === "" ) {
			return `未找到名为「${ name }」的角色或武器，若确认名称输入无误，请前往 github.com/SilveryStar/Adachi-BOT 进行反馈`;
		} else {
			return `未找到相关信息，是否要找：${ [ "", ...<string[]>result.info ].join( "\n  - " ) }`;
		}
	}
}