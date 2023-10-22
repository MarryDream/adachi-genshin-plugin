import { getRandomStringBySeed } from "@/utils/random";

export function getMiHoYoRandomStr( length: number ): string {
	const seed = '0123456789abcdef';
	return getRandomStringBySeed( length, seed );
}