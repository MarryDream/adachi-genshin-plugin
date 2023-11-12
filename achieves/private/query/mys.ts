import { defineDirective } from "@/modules/command";
import { Private } from "#/genshin/module/private/main";
import { MysQueryService } from "#/genshin/module/private/mys";
import { RenderResult } from "@/modules/renderer";
import { mysInfoPromise } from "#/genshin/utils/promise";
import { getPrivateAccount } from "#/genshin/utils/private";
import { config, metaManagement, renderer } from "#/genshin/init";

export default defineDirective( "order", async ( { sendMessage, messageData, matchResult, auth, logger } ) => {
	const { user_id: userID } = messageData;
	const idMsg = matchResult.match[0];
	const info: Private | string = await getPrivateAccount( userID, idMsg, auth );
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}

	const { cookie, mysID, uid } = info.setting;
	try {
		await mysInfoPromise( userID, Number.parseInt( uid ), mysID, cookie );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( <string>error );
			return;
		}
	}

	const appointId = info.options[MysQueryService.FixedField].appoint;
	let appointName: string = "empty";

	if ( appointId !== "empty" ) {
		const charaData = metaManagement.getMeta( "meta/character" );
		for ( const id in charaData ) {
			const { id: mapId, name } = charaData[id];
			if ( mapId === parseInt( appointId ) ) {
				appointName = name;
				break;
			}
		}
	}

	const res: RenderResult = await renderer.asSegment(
		"/card/index.html", {
			qq: userID,
			style: config.card.weaponStyle,
			profile: config.card.profile,
			appoint: appointName
		} );
	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		throw new Error( res.error );
	}
} );