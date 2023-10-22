import { getRandomStringBySeed, getRandomNumber } from "@/utils/random";

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