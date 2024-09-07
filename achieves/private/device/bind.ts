import { defineDirective, InputParameter, Order } from "@/modules/command";
import { IDeviceData } from "#/genshin/types/device";
import { cookies, privateClass } from "#/genshin/init";
import { getDeviceFp } from "#/genshin/utils/api";
import { UserInfo } from "#/genshin/module/private/main";

async function deviceBind( i: InputParameter, msg: string, user: UserInfo ) {
	let deviceData: IDeviceData;
	try {
		deviceData = JSON.parse( msg );
	} catch {
		return "设备信息格式有误，请检查并重新发送";
	}
	
	// 存放 device_fp 数据 key
	const fpKey = `adachi.device-fp-${ user.userID }`;
	// 已抓包获取设备信息，直接保存
	if ( deviceData.device_fp && deviceData.device_id ) {
		return i.redis.setHash( fpKey, {
			device_fp: deviceData.device_fp,
			device_id: deviceData.device_id,
			bind: "true"
		} );
	}
	
	if (
		!deviceData.deviceModel ||
		!deviceData.androidVersion ||
		!deviceData.deviceFingerprint ||
		!deviceData.deviceName ||
		!deviceData.deviceBoard ||
		!deviceData.deviceProduct ||
		!deviceData.oaid
	) {
		return "设备信息格式有误，请检查并重新发送";
	}
	await i.redis.setHash( `adachi.device-info-${ user.userID }`, <Record<string, string>>deviceData );
	await getDeviceFp( user.userID, user.cookie );
}

export default defineDirective( "enquire", async ( i ) => {
	if ( i.matchResult.status === "timeout" ) {
		return i.sendMessage( "绑定设备超时，自动中止操作" )
	}
	
	const userId = i.messageData.user_id;
	const msg = i.messageData.raw_message;
	// 手动退出
	if ( i.matchResult.status === "confirm" && msg === "exit" ) {
		await i.sendMessage( "已取消绑定服务操作" );
		return true;
	}
	
	// 未绑定任何 ck 时直接退出
	const single = privateClass.getUserInfoList( userId )[0];
	if ( !single ) {
		const PS = <Order>i.command.getSingle( "silvery-star.private-subscribe", await i.auth.get( userId ) );
		const appendMsg = PS ? `私聊使用 ${ PS.getHeaders()[0] }或` : "";
		await i.sendMessage( `请先${ appendMsg }使用其他例如扫码登录等第三方插件启用私人服务` );
		return i.matchResult.status === "confirm";
	}
	
	if ( i.matchResult.status === "activate" ) {
		const tipMessage = `直接粘贴发送设备信息来继续\n` +
			"请注意：该数据可被 BOT 持有者获取，请务必确保对方可信\n" +
			"你可以在 https://docs.adachi.top/plugin/genshin/device.html 中查看绑定设备的方法\n" +
			"这需要在 3 分钟内进行，此后将会自动取消本次申请\n" +
			"如需手动取消申请，请输入 exit";
		return i.sendMessage( tipMessage );
	}
	
	if ( i.matchResult.status === "confirm" ) {
		const errorMsg = await deviceBind( i, msg, single );
		
		if ( errorMsg ) {
			await i.sendMessage( `${ errorMsg }，如需取消绑定设备，请输入 exit` );
			return false;
		} else {
			await i.sendMessage( "设备绑定成功" );
		}
	}
} );