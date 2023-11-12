import { Private } from "#/genshin/module/private/main";
import { defineDirective } from "@/modules/command";
import { MysQueryService } from "#/genshin/module/private/mys";
import { NameResult, getRealName } from "#/genshin/utils/name";
import { metaManagement, privateClass } from "#/genshin/init";

export default defineDirective( "order", async ( { sendMessage, messageData, matchResult } ) => {
	const userID = messageData.user_id;
	const data = matchResult.match[0];

	const [ id, name ] = data.split( " " );
	const single: Private | string = await privateClass.getSinglePrivate( userID, parseInt( id ) );

	if ( typeof single === "string" ) {
		await sendMessage( single );
	} else {
		if ( name === "empty" ) {
			await ( <MysQueryService>single.services[MysQueryService.FixedField] ).modifyAppointChar( name );
			await sendMessage( "卡片指定头像清除成功" );
			return;
		}
		const result: NameResult = getRealName( name );
		if ( result.definite ) {
			const realName = <string>result.info;
			const avatarId = metaManagement.getMeta( "meta/character" )[realName]?.id;
			if ( !avatarId ) {
				await sendMessage( "未找到对应的角色信息，请向开发者反馈此问题" );
				return;
			}
			await ( <MysQueryService>single.services[MysQueryService.FixedField] ).modifyAppointChar(
				avatarId.toString()
			);
			await sendMessage( "卡片头像指定成功" );
		} else {
			await sendMessage( "卡片头像指定失败，请尝试使用完整的角色名" );
		}
	}
} );