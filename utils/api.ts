import bot from "ROOT";
import { toCamelCase } from "./camel-case";
import { guid } from "#/genshin/utils/guid";
import { generateDS, getDS, getDS2 } from "./ds";
import {
	ResponseBody
} from "#/genshin/types";
import * as ApiType from "#/genshin/types";
import { config } from "#/genshin/init";
import { register } from "@/utils/request";
import { getMiHoYoRandomStr } from "./random";
import { getRandomString, getRandomNumber, randomSleep } from "@/utils/random";
import { accelerometer, batteryStatus, deviceFp, magnetometer } from "./device-fp";
import { getRegion } from "#/genshin/utils/region";
import { ErrorMsg } from "#/genshin/utils/promise";

const apis = {
	FETCH_ROLE_ID: "https://api-takumi-record.mihoyo.com/game_record/app/card/wapi/getGameRecordCard",
	FETCH_ROLE_INDEX: "https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/index",
	FETCH_ROLE_CHARACTERS: "https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/character",
	FETCH_ROLE_SPIRAL_ABYSS: "https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/spiralAbyss",
	FETCH_ROLE_DAILY_NOTE: "https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/dailyNote",
	FETCH_ROLE_AVATAR_DETAIL: "https://api-takumi.mihoyo.com/event/e20200928calculate/v1/sync/avatar/detail",
	FETCH_GACHA_LIST: "https://operation-webstatic.mihoyo.com/gacha_info/hk4e/cn_gf01/gacha/list.json",
	FETCH_GACHA_DETAIL: "https://operation-webstatic.mihoyo.com/gacha_info/hk4e/cn_gf01/$/zh-cn.json",
	
	FETCH_SIGN_IN: "https://api-takumi.mihoyo.com/event/bbs_sign_reward/sign",
	FETCH_SIGN_INFO: "https://api-takumi.mihoyo.com/event/bbs_sign_reward/info",
	FETCH_LEDGER: "https://hk4e-api.mihoyo.com/event/ys_ledger/monthInfo",
	FETCH_CALENDAR_LIST: "https://hk4e-api.mihoyo.com/common/hk4e_cn/announcement/api/getAnnList",
	FETCH_CALENDAR_DETAIL: "https://hk4e-api.mihoyo.com/common/hk4e_cn/announcement/api/getAnnContent",
	//验证码服务相关
	FETCH_CREATE_VERIFICATION: "https://api-takumi-record.mihoyo.com/game_record/app/card/wapi/createVerification",
	FETCH_GEETEST: "https://api.geetest.com/gettype.php",
	FETCH_GET_VERIFY: "https://challenge.minigg.cn",
	FETCH_VERIFY_VERIFICATION: "https://api-takumi-record.mihoyo.com/game_record/app/card/wapi/verifyVerification",
	/* Token转换相关 */
	FETCH_GET_MULTI_TOKEN: "https://api-takumi.mihoyo.com/auth/api/getMultiTokenByLoginTicket",
	FETCH_GET_COOKIE_TOKEN: "https://api-takumi.mihoyo.com/auth/api/getCookieAccountInfoBySToken",
	FETCH_VERIFY_LTOKEN: "https://passport-api-v4.mihoyo.com/account/ma-cn-session/web/verifyLtoken",
	FETCH_GET_LTOKEN_BY_STOKEN: "https://passport-api.mihoyo.com/account/auth/api/getLTokenBySToken",
	/* 获取device_fp */
	FETCH_GET_DEVICE_FP: "https://public-data-api.mihoyo.com/device-fp/api/getFp"
};

const HEADERS = {
	"User-Agent": "Mozilla/5.0 (Linux; Android 12; Yz-5e22f) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.73 Mobile Safari/537.36 miHoYoBBS/2.40.1",
	"Referer": "https://webstatic.mihoyo.com",
	"Origin": 'https://webstatic.mihoyo.com',
	"X_Requested_With": 'com.mihoyo.hyperion',
	"x-rpc-app_version": "2.40.1",
	"x-rpc-client_type": 5,
	"DS": "",
	"Cookie": "",
	"x-rpc-device_id": "",
	"x-rpc-device_fp": "",
	"x-rpc-app_id": "bll8iq97cem8"
};

const verifyMsg = "API请求遭遇验证码拦截，可以尝试联系Master开启验证服务";

const { request: $https } = register( {
	timeout: 60000,
	responseType: "json",
}, apis );

/* mihoyo BBS API */
export async function getBaseInfo(
	uid: number,
	mysID: number,
	cookie: string,
	time: number = 0,
	verifyResult: string = ""
): Promise<ResponseBody<ApiType.BBS>> {
	const query = { uid: mysID };
	const { data: result } = await $https.FETCH_ROLE_ID.get( query, {
		headers: {
			...HEADERS,
			DS: getDS( query ),
			Cookie: cookie
		}
	} )
	const data: ResponseBody<ApiType.BBS> = toCamelCase( result );
	if ( data.retcode !== 1034 ) {
		return data;
	}
	bot.logger.warn( `[ MysID${ mysID } ][base] 查询遇到验证码` );
	if ( config.verifyEnable && time <= config.verifyRepeat ) {
		verifyResult = await bypassQueryVerification( cookie );
		bot.logger.debug( `[ MysID${ mysID } ][base] 第 ${ time + 1 } 次验证码绕过${ verifyResult ? "失败：" + verifyResult : "成功" }` );
		return await getBaseInfo( uid, mysID, cookie, ++time, verifyResult );
	}
	throw config.verifyEnable ? "[base] " + verifyResult : verifyMsg;
}

export async function getDetailInfo(
	uid: number,
	cookie: string,
	time: number = 0,
	verifyResult: string = ''
): Promise<ResponseBody<ApiType.UserInfo>> {
	const server = getRegion( uid.toString()[0] );
	const query = {
		role_id: uid,
		server
	};
	const [ device_id, device_fp ] = await getDeviceFp( uid.toString(), cookie );
	const { data: result } = await $https.FETCH_ROLE_INDEX.get( query, {
		headers: {
			...HEADERS,
			DS: getDS( query ),
			Cookie: cookie,
			"x-rpc-device_id": device_id,
			"x-rpc-device_fp": device_fp
		}
	} );
	const data: ResponseBody<ApiType.UserInfo> = toCamelCase( result );
	if ( data.retcode !== 1034 ) {
		return data;
	}
	bot.logger.warn( `[ UID${ uid } ][detail] 查询遇到验证码` );
	if ( config.verifyEnable && time <= config.verifyRepeat ) {
		verifyResult = await bypassQueryVerification( cookie );
		bot.logger.debug( `[ UID${ uid } ][detail] 第 ${ time + 1 } 次验证码绕过${ verifyResult ? "失败：" + verifyResult : "成功" }` );
		return await getDetailInfo( uid, cookie, ++time, verifyResult );
	}
	throw config.verifyEnable ? "[detail] " + verifyResult : verifyMsg;
}

export async function getCharactersInfo(
	uid: number,
	charIDs: number[],
	cookie: string,
	time: number = 0,
	verifyResult: string = ''
): Promise<ResponseBody<ApiType.Character>> {
	const server = getRegion( uid.toString()[0] );
	
	const body = {
		character_ids: charIDs,
		role_id: uid,
		server
	};
	
	const [ device_id, device_fp ] = await getDeviceFp( uid.toString(), cookie );
	const { data: result } = await $https.FETCH_ROLE_CHARACTERS.post( body, {
		headers: {
			...HEADERS,
			DS: getDS( undefined, JSON.stringify( body ) ),
			Cookie: cookie,
			"content-type": "application/json",
			"x-rpc-device_id": device_id,
			"x-rpc-device_fp": device_fp
		}
	} );
	
	const data: ResponseBody<ApiType.Character> = toCamelCase( result );
	if ( data.retcode !== 1034 ) {
		return data;
	}
	bot.logger.warn( `[ UID${ uid } ][char] 查询遇到验证码` );
	if ( config.verifyEnable && time <= config.verifyRepeat ) {
		verifyResult = await bypassQueryVerification( cookie );
		bot.logger.debug( `[ UID${ uid } ][char] 第 ${ time + 1 } 次验证码绕过${ verifyResult ? "失败：" + verifyResult : "成功" }` );
		return await getCharactersInfo( uid, charIDs, cookie, ++time, verifyResult );
	}
	throw config.verifyEnable ? "[char] " + verifyResult : verifyMsg;
}

export async function getDailyNoteInfo(
	uid: number,
	cookie: string,
	time: number = 0,
	verifyResult: string = ''
): Promise<ResponseBody<ApiType.Note>> {
	const server = getRegion( uid.toString()[0] );
	const query = {
		role_id: uid,
		server
	};
	const [ device_id, device_fp ] = await getDeviceFp( `${ uid }`, cookie );
	const { data: result } = await $https.FETCH_ROLE_DAILY_NOTE.get( query, {
		headers: {
			...HEADERS,
			DS: getDS( query ),
			"Cookie": cookie,
			"x-rpc-device_id": device_id,
			"x-rpc-device_fp": device_fp
		}
	} )
	const data: ResponseBody<ApiType.Note> = toCamelCase( result );
	if ( data.retcode !== 1034 ) {
		return data;
	}
	bot.logger.warn( `[ UID${ uid } ][note] 查询遇到验证码` );
	if ( config.verifyEnable && time <= config.verifyRepeat ) {
		verifyResult = await bypassQueryVerification( cookie );
		bot.logger.debug( `[ UID${ uid } ][note] 第 ${ time + 1 } 次验证码绕过${ verifyResult ? "失败：" + verifyResult : "成功" }` );
		return await getDailyNoteInfo( uid, cookie, ++time, verifyResult );
	}
	throw config.verifyEnable ? "[note] " + verifyResult : verifyMsg;
}

export async function getAvatarDetailInfo(
	uid: string,
	avatarID: number,
	cookie: string,
	time: number = 0,
	verifyResult: string = ''
): Promise<ResponseBody<ApiType.AvatarDetailRaw>> {
	const server = getRegion( uid.toString()[0] );
	const query = {
		avatar_id: avatarID,
		region: server,
		uid
	};
	const [ device_id, device_fp ] = await getDeviceFp( uid.toString(), cookie );
	const { data: result } = await $https.FETCH_ROLE_AVATAR_DETAIL.get( query, {
		headers: {
			...HEADERS,
			"DS": getDS( query ),
			"Cookie": cookie,
			"x-rpc-device_id": device_id,
			"x-rpc-device_fp": device_fp
		}
	} );
	const data: ResponseBody<ApiType.AvatarDetailRaw> = toCamelCase( result );
	if ( data.retcode !== 1034 ) {
		return data;
	}
	bot.logger.warn( `[ UID${ uid } ][avatar] 查询遇到验证码` );
	if ( config.verifyEnable && time <= config.verifyRepeat ) {
		verifyResult = await bypassQueryVerification( cookie );
		bot.logger.debug( `[ UID${ uid } ][avatar] 第 ${ time + 1 } 次验证码绕过${ verifyResult ? "失败：" + verifyResult : "成功" }` );
		return await getAvatarDetailInfo( uid, avatarID, cookie, ++time, verifyResult );
	}
	throw config.verifyEnable ? "[avatar] " + verifyResult : verifyMsg;
}

/* period 为 1 时表示本期深渊，2 时为上期深渊 */
export async function getSpiralAbyssInfo(
	uid: number,
	period: number,
	cookie: string,
	time: number = 0,
	verifyResult: string = ''
): Promise<ResponseBody<ApiType.Abyss>> {
	const server = getRegion( uid.toString()[0] );
	const query = {
		role_id: uid,
		schedule_type: period,
		server
	};
	const [ device_id, device_fp ] = await getDeviceFp( uid.toString(), cookie );
	const { data: result } = await $https.FETCH_ROLE_SPIRAL_ABYSS.get( query, {
		headers: {
			...HEADERS,
			DS: getDS( query ),
			Cookie: cookie,
			"x-rpc-device_id": device_id,
			"x-rpc-device_fp": device_fp
		}
	} )
	const data: ResponseBody<ApiType.Abyss> = toCamelCase( result );
	if ( data.retcode !== 1034 ) {
		return data;
	}
	bot.logger.warn( `[ UID${ uid } ][abyss] 查询遇到验证码` );
	if ( config.verifyEnable && time <= config.verifyRepeat ) {
		verifyResult = await bypassQueryVerification( cookie );
		bot.logger.debug( `[ UID${ uid } ][abyss] 第 ${ time + 1 } 次验证码绕过${ verifyResult ? "失败：" + verifyResult : "成功" }` );
		return await getSpiralAbyssInfo( uid, period, cookie, ++time, verifyResult );
	}
	throw config.verifyEnable ? "[abyss] " + verifyResult : verifyMsg;
}

export async function getLedger(
	uid: string,
	mon: number,
	cookie: string,
	time: number = 0,
	verifyResult: string = ''
): Promise<ResponseBody<ApiType.Ledger>> {
	const server = getRegion( uid.toString()[0] );
	const query = {
		bind_uid: uid,
		bind_region: server,
		month: mon
	};
	
	const [ device_id, device_fp ] = await getDeviceFp( uid, cookie );
	const { data: result } = await $https.FETCH_LEDGER.get( query, {
		headers: {
			...HEADERS,
			Cookie: cookie,
			"x-rpc-device_id": device_id,
			"x-rpc-device_fp": device_fp
		}
	} );
	const data: ResponseBody<ApiType.Ledger> = toCamelCase( result );
	if ( data.retcode !== 1034 ) {
		return data;
	}
	bot.logger.warn( `[ UID${ uid } ][ledger] 查询遇到验证码` );
	if ( config.verifyEnable && time <= config.verifyRepeat ) {
		verifyResult = await bypassQueryVerification( cookie );
		bot.logger.debug( `[ UID${ uid } ][ledger] 第 ${ time + 1 } 次验证码绕过${ verifyResult ? "失败：" + verifyResult : "成功" }` );
		return await getLedger( uid, mon, cookie, ++time, verifyResult );
	}
	throw config.verifyEnable ? "[ledger] " + verifyResult : verifyMsg;
}

export async function getWishList(): Promise<ResponseBody<ApiType.WishList>> {
	const { data: result } = await $https.FETCH_GACHA_LIST.get();
	if ( !result.data ) {
		throw result.message;
	}
	return toCamelCase( result );
}

export async function getWishDetail( wishID: string ): Promise<ApiType.WishDetail> {
	const { data } = await $https.FETCH_GACHA_DETAIL.get( {}, url => url.replace( "$", wishID ) );
	return toCamelCase( data );
}

/* calender API */
const calc_query = {
	game: "hk4e",
	game_biz: "hk4e_cn",
	lang: "zh-cn",
	bundle_id: "hk4e_cn",
	platform: "pc",
	region: "cn_gf01",
	level: "55",
	uid: "100000000"
};

export async function getCalendarList(): Promise<ResponseBody<ApiType.CalendarList>> {
	const { data: result } = await $https.FETCH_CALENDAR_LIST.get( calc_query );
	if ( !result.data ) {
		throw result.message;
	}
	return toCamelCase( result );
}

export async function getCalendarDetail(): Promise<ResponseBody<ApiType.CalendarDetail>> {
	const { data: result } = await $https.FETCH_CALENDAR_DETAIL.get( calc_query );
	if ( !result.data ) {
		throw result.message;
	}
	return toCamelCase( result );
}

/* 参考 https://github.com/DGP-Studio/DGP.Genshin.MiHoYoAPI/blob/main/Sign/SignInProvider.cs */
const activityID: string = "e202009291139501";
const SIGN_HEADERS = {
	"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.34.1",
	"Referer": "https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html" +
		`?bbs_auth_required=true&act_id=${ activityID }&utm_source=bbs&utm_medium=mys&utm_campaign=icon`,
	"Accept": "application/json, text/plain, */*",
	"Origin": "https://webstatic.mihoyo.com",
	"X-Requested-With": "com.mihoyo.hyperion",
	"x-rpc-app_version": "2.34.1",
	"x-rpc-client_type": 5,
	"x-rpc-app_id": "bll8iq97cem8",
	"x-rpc-device_id": "",
	"x-rpc-device_fp": "",
	"DS": ""
};

/* Sign In API */
export async function mihoyoBBSSignIn( uid: string, region: string, cookie: string, time: number = 0 ): Promise<ResponseBody<ApiType.SignInResult>> {
	const body = {
		act_id: activityID,
		uid, region
	};
	
	const [ device_id, device_fp ] = await getDeviceFp( uid, cookie );
	const { data: result } = await $https.FETCH_SIGN_IN.post( body, {
		headers: {
			...SIGN_HEADERS,
			"content-type": "application/json",
			Cookie: cookie,
			"DS": getDS2(),
			"x-rpc-device_id": device_id,
			"x-rpc-device_fp": device_fp
		}
	} );
	if ( !result.data ) {
		throw new Error( ErrorMsg.FORM_MESSAGE + ( result.message || "签到 api 异常" ) );
	}
	const resp: ResponseBody<ApiType.SignInResult> = toCamelCase( result );
	if ( !resp.data.gt && resp.data.success === 0 ) {
		return resp;
	}
	//遇到验证码
	bot.logger.warn( `[ UID${ uid } ][sign] 签到遇到验证码` );
	if ( resp.data.gt && resp.data.challenge ) {
		bot.logger.debug( `[ UID${ uid } ][sign] 遇到验证码，尝试绕过 ~` );
		return mihoyoBBSVerifySignIn( uid, region, cookie, resp.data.gt, resp.data.challenge );
	}
	throw new Error( `解决签到验证码失败 ${ typeof result === 'string' ? "\n" + result : "" }` );
}

export async function getSignInInfo( uid: string, region: string, cookie: string ): Promise<ResponseBody<ApiType.SignInInfo>> {
	const query = {
		act_id: activityID,
		region, uid
	};
	
	const [ device_id, device_fp ] = await getDeviceFp( uid, cookie );
	const { data: result } = await $https.FETCH_SIGN_INFO.get( query, {
		headers: {
			...SIGN_HEADERS,
			Cookie: cookie,
			"x-rpc-device_id": device_id,
			"x-rpc-device_fp": device_fp
		}
	} );
	if ( !result.data ) {
		throw result.message;
	}
	return toCamelCase( result );
}

/* 验证码相关解决方案 */
export async function bypassQueryVerification( cookie: string, gt?: string, challenge?: string ): Promise<string> {
	const data = {
		gt: gt ? gt : '',
		challenge: challenge ? challenge : ''
	};
	if ( !gt || !challenge ) {
		//获取验证码
		const { data: createVerify } = await $https.FETCH_CREATE_VERIFICATION.get( { is_high: "true" }, {
			headers: {
				...HEADERS,
				DS: getDS( { is_high: true } ),
				Cookie: cookie
			}
		} )
		if ( !createVerify.data ) {
			bot.logger.error( "[create]", createVerify );
			return "[create] 获取验证码失败";
		}
		data.gt = createVerify.data.gt;
		data.challenge = createVerify.data.challenge;
	}
	//提交GEETEST
	await randomSleep( 3, 5, true );
	await $https.FETCH_GEETEST.get( {
		gt: data.gt,
		challenge: data.challenge
	} );
	//验证验证码
	const { data: analysisCode } = await $https.FETCH_GET_VERIFY.get( {
		token: config.verifyToken,
		gt: data.gt,
		challenge: data.challenge
	}, {
		headers: {
			"User-Agent": "Adachi-BOT"
		}
	} );
	if ( analysisCode.code !== 0 || analysisCode.info !== "success" ) {
		bot.logger.error( "[verify]", analysisCode );
		return `[verify] 验证失败 ${ typeof analysisCode === 'string' ? "\n" + analysisCode : analysisCode.info }`;
	}
	const body = {
		geetest_challenge: analysisCode.data.challenge,
		geetest_validate: analysisCode.data.validate,
		geetest_seccode: `${ analysisCode.data.validate }|jordan`
	}
	const { data: verifyResult } = await $https.FETCH_VERIFY_VERIFICATION.post( body, {
		headers: {
			...HEADERS,
			DS: getDS( undefined, JSON.stringify( body ) ),
			Cookie: cookie
		}
	} )
	/* 验证码过期 */
	if ( verifyResult.retcode !== 0 || verifyResult.message !== 'OK' ) {
		bot.logger.error( "[submit]", verifyResult );
		return `[submit] 验证失败 ${ typeof verifyResult === 'string' ? "\n" + verifyResult : verifyResult.message }`;
	}
	return "";
}

export async function mihoyoBBSVerifySignIn( uid: string, region: string, cookie: string, gt: string, challenge: string ): Promise<ResponseBody<ApiType.SignInResult>> {
	const body = {
		act_id: activityID,
		uid, region
	};
	
	const { data: verifyCode } = await $https.FETCH_GET_VERIFY.get( {
		token: config.verifyToken,
		gt: gt,
		challenge: challenge
	}, {
		headers: {
			"User-Agent": "Adachi-BOT"
		}
	} );
	
	if ( verifyCode.code !== 0 || verifyCode.info !== "success" ) {
		bot.logger.error( verifyCode );
		throw `[verify] 验证失败 ${ typeof verifyCode === 'string' ? "\n" + verifyCode : verifyCode.info }`;
	}
	
	const [ device_id, device_fp ] = await getDeviceFp( uid, cookie );
	const { data: result } = await $https.FETCH_SIGN_IN.post( body, {
		headers: {
			...SIGN_HEADERS,
			"content-type": "application/json",
			Cookie: cookie,
			DS: getDS2(),
			"x-rpc-challenge": verifyCode.data.challenge,
			"x-rpc-validate": verifyCode.data.validate,
			"x-rpc-seccode": `${ verifyCode.data.validate }|jordan`,
			"x-rpc-device_id": device_id,
			"x-rpc-device_fp": device_fp
		}
	} );
	
	const resp: ResponseBody<ApiType.SignInResult> = toCamelCase( result );
	if ( !resp.data.gt && resp.data.success === 0 ) {
		return resp;
	}
	//遇到验证码
	throw `解决签到验证码失败 ${ typeof result === 'string' ? "\n" + result : "" }`;
}

/* Token转换相关API */
export async function getCookieAccountInfoBySToken(
	stoken: string,
	mid: string,
	uid: string ): Promise<ResponseBody<ApiType.CookieToken>> {
	const param = {
		stoken: stoken,
		mid: mid,
		token_types: 3,
		uid: uid
	}
	
	const { data: result } = await $https.FETCH_GET_COOKIE_TOKEN.get( param );
	
	if ( !result.data ) {
		throw result.message;
	}
	
	return toCamelCase( result );
}

export async function getMultiTokenByLoginTicket( uid: number, loginTicket: string, cookie: string ): Promise<ResponseBody<ApiType.MutiTokenResult>> {
	const params = {
		login_ticket: loginTicket,
		token_types: 3,
		uid: uid
	};
	
	const deviceName = getRandomString( 5 );
	const { data: result } = await $https.FETCH_GET_MULTI_TOKEN.get( params, {
		headers: {
			"host": "api-takumi.mihoyo.com",
			"x-rpc-app_version": "2.28.1",
			"x-rpc-channel": "mihoyo",
			"x-rpc-client_type": "2",
			"x-rpc-device_id": guid(),
			"x-rpc-device_model": deviceName,
			"x-rpc-device_name": "Samsung " + deviceName,
			"x-rpc-sys_version": "12",
			"origin": "https://webstatic.mihoyo.com",
			"referer": "https://webstatic.mihoyo.com/",
			"user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.28.1",
			"x-requested-with": "com.mihoyo.hyperion",
			"ds": generateDS(),
			"cookie": cookie
		},
		timeout: 5000
	} );
	
	if ( !result.data ) {
		throw result.message;
	}
	
	return toCamelCase( result );
}

export async function verifyLtoken( ltoken: string, ltuid: string ): Promise<ResponseBody<ApiType.VerifyLtoken>> {
	const params = {
		t: Date.now()
	};
	const cookie = `ltoken=${ ltoken }; ltuid=${ ltuid };`;
	const { data: result } = await $https.FETCH_VERIFY_LTOKEN.post( params, {
		headers: {
			...HEADERS,
			Referer: "https://bbs.mihoyo.com/",
			cookie: cookie
		},
		timeout: 5000
	} );
	if ( !result.data ) {
		throw result.message;
	}
	return toCamelCase( result );
}


export async function getLTokenBySToken( stoken: string, mid: string ): Promise<ResponseBody<ApiType.GetLtoken>> {
	const cookie = `stoken=${ stoken }; mid=${ mid };`;
	
	const { data: result } = await $https.FETCH_GET_LTOKEN_BY_STOKEN.get( {}, {
		headers: {
			...HEADERS,
			cookie: cookie,
			DS: getDS( undefined, undefined )
		},
		timeout: 5000
	} );
	if ( !result.data ) {
		throw result.message;
	}
	return toCamelCase( result );
	
}

async function getDeviceFp( uid: string, cookie: string ): Promise<string[]> {
	const key = `adachi.miHoYo-info.${ uid }`;
	const { device_fp, device_id, idfv, seed_id, seed_time } = await bot.redis.getHash( key );
	const status = batteryStatus();
	const IDFV = idfv || guid().toUpperCase();
	const deviceId = device_id || guid();
	const seedId = seed_id || getMiHoYoRandomStr( 13 );
	const seedTime = seed_time || `${ Date.now() }`;
	
	// platform=1 的拓展字段
	const ext_fields = {
		IDFV: IDFV,
		model: 'iPhone16,1',
		osVersion: '17.0.3',
		screenSize: '393×852',
		vendor: '--',
		cpuType: 'CPU_TYPE_ARM64',
		cpuCores: '16',
		isJailBreak: '0',
		networkType: 'WIFI',
		proxyStatus: '0',
		batteryStatus: status.toString( 10 ),
		chargeStatus: status > 30 ? '0' : '1',
		romCapacity: `${ getRandomNumber( 100000, 500000 ) }`,
		romRemain: `${ getRandomNumber( 120000, 130000 ) }`,
		ramCapacity: `${ getRandomNumber( 1000, 10000 ) }`,
		ramRemain: `${ getRandomNumber( 8000, 9000 ) }`,
		appMemory: `${ getRandomNumber( 50, 110 ) }`,
		accelerometer: accelerometer().join( 'x' ),
		gyroscope: accelerometer().join( 'x' ),
		magnetometer: magnetometer().join( 'x' )
	};
	const { data: response } = await $https.FETCH_GET_DEVICE_FP.post( {
		seed_id: seedId,
		device_id: deviceId,
		platform: '1',
		seed_time: seedTime,
		ext_fields: JSON.stringify( ext_fields ),
		app_name: 'bbs_cn',
		device_fp: device_fp || deviceFp()
	}, {
		headers: {
			...HEADERS,
			"Cookie": cookie
		}
	} )
	
	if ( response.retcode !== 0 ) {
		return Promise.reject( response.message );
	}
	
	if ( response.data.code !== 200 ) {
		return Promise.reject( response.data.msg );
	}
	
	const data = {
		idfv: IDFV,
		device_id: deviceId,
		device_fp: response.data.device_fp,
		seed_id: seedId,
		seed_time: seedTime
	};
	bot.redis.setHash( key, data ).catch( reason => bot.logger.error( "[获取device_fp] 存储米游社设备信息报错:", reason ) );
	return [ deviceId, response.data.device_fp ];
}