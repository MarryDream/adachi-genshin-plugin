import { defineDirective } from "@/modules/command";
import { getRealName, NameResult } from "#/genshin/utils/name";
import { config, metaManagement, renderer, typeData } from "#/genshin/init";
import { charaPanelPromise, PanelErrorMsg } from "#/genshin/utils/promise";
import { RenderResult } from "@/modules/renderer";
import { Panel } from "#/genshin/types";
import { isAt, getUID } from "#/genshin/utils/message";

export default defineDirective( "order", async ( { sendMessage, messageData, matchResult, redis, logger } ) => {
	const [ name, uidStr, atMsg ] = matchResult.match;

	if ( !config.panel.uidQuery && uidStr ) {
		await sendMessage( "bot 持有者已关闭 uid 查询功能" );
		return;
	}

	const atID: string | undefined = isAt( atMsg );
	const userID: number = messageData.user_id;

	/* 检查是否绑定了uid */
	const { info, stranger, self } = await getUID( uidStr || atMsg, userID, redis, atID );

	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}

	/* 获取查询的角色id */
	const result: NameResult = getRealName( name );
	if ( !result.definite ) {
		const message: string = result.info.length === 0
			? "查询失败，请检查角色名称是否正确"
			: `未找到相关信息，是否要找：${ [ "", ...<string[]>result.info ].join( "\n  - " ) }`;
		await sendMessage( message );
		return;
	}
	const realName: string = <string>result.info;

	const charID = metaManagement.getMeta( "meta/character" )[realName]?.id;

	/* 因无法获取属性，排除旅行者 */
	if ( charID === -1 ) {
		await sendMessage( `暂不支持查看「${ realName }」的面板详细信息` );
		return;
	}

	const uid: number = info;
	const target: number = atID ? parseInt( atID ) : userID;

	let detail: Panel.Detail;

	try {
		detail = await charaPanelPromise( uid, self, sendMessage, false );
	} catch ( error ) {
		if ( typeof error === "string" ) {
			await sendMessage( <string>error );
		} else {
			await sendMessage( "整理数据出错，请前往控制台查看错误信息" );
			logger.error( error );
		}
		return;
	}

	/* 获取所选角色的信息 */
	const currentChara = detail.avatars.find( a => {
		return charID === -1 ? a.id === 10000005 || a.id === 10000007 : a.id === charID;
	} );

	if ( !currentChara ) {
		const errorMsg = self ? PanelErrorMsg.SELF_NOT_FOUND : PanelErrorMsg.NOT_FOUND;
		await sendMessage( errorMsg.replace( "$", realName ) );
		return;
	}

	/* 获取所选角色属性 */
	const element = typeData.character[realName] === "!any!" ? "none" : typeData.character[realName];

	await redis.setString( `marry-dream.chara-panel-${ target }`, JSON.stringify( {
		uid,
		username: detail.nickname,
		element,
		...currentChara
	} ) );

	const res: RenderResult = await renderer.asSegment(
		"/panel/index.html", { qq: target, stranger } );
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		throw new Error( res.error );
	}
} );