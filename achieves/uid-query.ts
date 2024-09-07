import { defineDirective } from "@/modules/command";
import { RenderResult } from "@/modules/renderer";
import { characterInfoPromise, detailInfoPromise } from "#/genshin/utils/promise";
import { config, renderer } from "#/genshin/init";
import { isAt, getUID } from "#/genshin/utils/message";

export default defineDirective( "order", async ( { sendMessage, messageData, matchResult, redis } ) => {
	const data: string = matchResult.match[0];
	const atID: string | undefined = isAt( data );
	const userID: number = messageData.user_id;

	const { info, stranger } = await getUID( data, userID, redis, atID );
	if ( typeof info === "string" ) {
		await sendMessage( info );
		return;
	}

	const uid: number = info;
	const target: number = atID ? parseInt( atID ) : userID;

	try {
		await redis.setHash( `silvery-star.card-data-${ uid }`, { uid } );
		await redis.setString( `silvery-star.user-querying-id-${ target }`, uid );
		const charIDs = <number[]>await detailInfoPromise( userID, uid );
		await characterInfoPromise( target, charIDs );
	} catch ( error ) {
		if ( error !== "gotten" ) {
			await sendMessage( <string>error );
			return;
		}
	}

	const res: RenderResult = await renderer.asSegment(
		"/user-base/index.html", {
			qq: target, stranger,
			style: config.card.weaponStyle,
			profile: config.card.profile
		}
	);

	if ( res.code === "ok" ) {
		await sendMessage( res.data );
	} else {
		throw new Error( res.error );
	}
} );