import { defineDirective } from "@/modules/command";

export default defineDirective( "order", async ( { sendMessage, messageData, redis } ) => {
	const userId = messageData.user_id;
	await redis.deleteKey( `adachi.device-fp-${ userId }` );
	await redis.deleteKey( `adachi.device-info-${ userId }` );
	await sendMessage( "已取消设备绑定" );
} );