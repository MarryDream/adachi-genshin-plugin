import { getRandomStringBySeed, getRandomNumber } from "@/utils/random";
import { IDeviceData } from "#/genshin/types/device";
import { guid } from "#/genshin/utils/guid";
import { getMiHoYoRandomStr } from "#/genshin/utils/random";

export function accelerometer(): number[] {
	const x = ( Math.random() - 0.5 ) * 2;
	const y = ( Math.random() - 0.5 ) * 2;
	const z = ( Math.random() - 0.5 ) * 2;
	return [ x, y, z ];
}

export function magnetometer() {
	// -90 到 90 的随机值
	const range = 180;
	const length = 3;
	return Array.from( { length }, () => {
		return Math.random() * range - range / 2;
	} );
}

export function batteryStatus(): number {
	const max = 100, min = 1;
	return getRandomNumber( min, max );
}

export function deviceFp(): string {
	const seed = '0123456789';
	return getRandomStringBySeed( 10, seed );
}

export function getDeviceRequestBody( data?: IDeviceData ) {
	const deviceId = guid();
	let ext_fields: any;
	if ( data ) {
		const deviceBrand = data.deviceFingerprint?.split( "/" )?.[0];
		ext_fields = {
			proxyStatus: 1,
			isRoot: 1,
			romCapacity: "512",
			deviceName: "Xperia 1",
			productName: data.deviceModel,
			romRemain: "456",
			hostname: "BuildHost",
			screenSize: "1096x2434",
			isTablet: 0,
			aaid: deviceId,
			model: data.deviceModel,
			brand: deviceBrand,
			hardware: "qcom",
			deviceType: data.deviceName,
			devId: "REL",
			serialNumber: "unknown",
			sdCapacity: 107433,
			buildTime: "1633631032000",
			buildUser: "BuildUser",
			simState: 1,
			ramRemain: "96757",
			appUpdateTimeDiff: 1722171241616,
			deviceInfo: data.deviceFingerprint,
			vaid: deviceId,
			buildType: "user",
			sdkVersion: "30",
			ui_mode: "UI_MODE_TYPE_NORMAL",
			isMockLocation: 0,
			cpuType: "arm64-v8a",
			isAirMode: 0,
			ringMode: 2,
			chargeStatus: 1,
			manufacturer: deviceBrand,
			emulatorStatus: 0,
			appMemory: "512",
			osVersion: "11",
			vendor: "unknown",
			accelerometer: "-0.084346995x8.73799x4.6301117",
			sdRemain: 96600,
			buildTags: "release-keys",
			packageName: "com.mihoyo.hyperion",
			networkType: "WiFi",
			oaid: data.oaid,
			debugStatus: 1,
			ramCapacity: "107433",
			magnetometer: "-13.9125x-17.8875x-5.4750004",
			display: data.deviceModel,
			appInstallTimeDiff: 1717065300325,
			packageVersion: "2.20.2",
			gyroscope: "0.017714571x-4.5813544E-4x0.0015271181",
			batteryStatus: 76,
			hasKeyboard: 0,
			board: data.deviceBoard
		}
	} else {
		const status = batteryStatus();
		const IDFV = guid().toUpperCase();
		ext_fields = {
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
		}
	}
	
	return {
		seed_id: getMiHoYoRandomStr( 13 ),
		device_id: deviceId,
		platform: data ? "2" : "1",
		seed_time: Date.now().toString(),
		ext_fields: JSON.stringify( ext_fields ),
		app_name: 'bbs_cn',
		bbs_device_id: deviceId,
		device_fp: deviceFp()
	}
}