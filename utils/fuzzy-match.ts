import { aliasClass, typeData } from "../init";
import { pinyin } from "pinyin-pro";

export interface MatchResult {
	content: string;
	ratio: number;
}

function similarity( str1: string, str2: string, limit = Infinity ) {
	if ( str1 === str2 ) {
		return 1;
	}
	
	if ( Math.abs( str1.length - str2.length ) > limit ) {
		return 0;
	}
	
	/* https://en.wikipedia.org/wiki/Levenshtein_distance */
	if ( !str1.length || !str2.length ) return 0;
	
	// 生成矩阵的第一行和第一列
	const matrix: number[][] = Array.from( { length: str2.length + 1 }, ( _, rowIndex ) => {
		// 递增第一行的每一列
		if ( rowIndex === 0 ) {
			return Array.from( { length: str1.length + 1 }, ( _, columnIndex ) => columnIndex );
		}
		// 沿每行第一列递增
		return [ rowIndex ];
	} );
	
	// 填写矩阵的其余部分
	for ( let i = 1; i <= str2.length; i++ ) {
		for ( let j = 1; j <= str1.length; j++ ) {
			if ( str2.charAt( i - 1 ) === str1.charAt( j - 1 ) ) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1,
					Math.min( matrix[i][j - 1] + 1, matrix[i - 1][j] + 1 ) );
			}
		}
	}
	
	return 1 - matrix[str2.length][str1.length] / Math.max( str1.length, str2.length );
}

export function similarity1( str1: string, str2: string, threshold = Infinity, limit = Infinity ): number {
	let str1Length: number = str1.length;
	let str2Length: number = str2.length;
	
	if ( Math.abs( str1Length - str2Length ) > limit ) {
		return 0;
	}
	
	if ( str1Length === 0 ) return str2Length > threshold ? 0 : 1;
	if ( str2Length === 0 ) return str1Length > threshold ? 0 : 1;
	
	if ( str1Length > str2Length ) {
		[ str1, str2 ] = [ str2, str1 ];
		[ str1Length, str2Length ] = [ str2Length, str1Length ];
	}
	
	const dp = Array.from( { length: str1Length + 1 }, () => 0 );
	
	for ( let i = 0; i <= str1Length; i++ ) {
		dp[i] = i;
	}
	
	for ( let j = 1; j <= str2Length; j++ ) {
		let prev = j - 1;
		let curr = prev + 1;
		for ( let i = 1; i <= str1Length; i++ ) {
			const temp = dp[i];
			if ( str1[i - 1] === str2[j - 1] ) {
				dp[i] = prev;
			} else {
				dp[i] = Math.min( prev, dp[i], dp[i - 1] ) + 1;
			}
			prev = temp;
			curr = dp[i];
		}
		if ( curr > threshold ) {
			return 0;
		}
	}
	
	return 1 - dp[str1Length] / Math.max( str1.length, str2.length );
}

function getPinyin( str: string ) {
	return pinyin( str, {
		toneType: "num",
		type: "array",
		nonZh: "consecutive",
		v: true
	} ).join( "" )
}

export function fuzzyMatch( str: string, maxRetNum: number = 5 ): MatchResult[] {
	let result: MatchResult[] = [];
	const nameList: string[] = [ ...aliasClass.getAllAliasKey(), ...typeData.getNameList() ];
	
	const strPinyin = getPinyin( str );
	for ( let el of nameList ) {
		const elPinYin = getPinyin( el );
		const ratio = similarity( strPinyin, elPinYin );
		result.push( { ratio, content: el } );
	}
	result = result.filter( el => el.ratio >= 0.5 )
		.sort( ( x, y ) => y.ratio - x.ratio );
	
	return result.slice( 0, maxRetNum );
}