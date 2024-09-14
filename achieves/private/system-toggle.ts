import { defineDirective } from "@/modules/command";
import { privateClass } from "#/genshin/init";
import { NoteService } from "#/genshin/module/private/note";
import { SignInService } from "#/genshin/module/private/sign";

export default defineDirective( "order", async ( { sendMessage, matchResult } ) => {
	const [ func, userId ] = matchResult.match;
	const priList = privateClass.getUserPrivateList( Number.parseInt( userId ) );
	
	priList.forEach( single => {
		if ( func === "note" ) {
			single.services[NoteService.FixedField].toggleEnableStatus( false, false );
		} else {
			single.services[SignInService.FixedField].toggleEnableStatus( false, false );
		}
	} );
	
	await sendMessage( `已关闭用户 [${ userId }] 的所有 [${ func }] 订阅服务` );
} );