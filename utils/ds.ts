import { Md5 } from "md5-typescript";
import { getRandomString } from "@/utils/random";

function getQueryParam( data: any ): string {
	if ( data === undefined ) {
		return "";
	}
	const arr: string[] = [];
	for ( let key of Object.keys( data ) ) {
		arr.push( `${ key }=${ data[key] }` );
	}
	return arr.join( "&" );
}

export function getDS( query: any, body: string = "" ): string {
	// 4X salt
	const n: string = "xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs";
	const i: number = Date.now() / 1000 | 0;
	const r: string = getRandomString( 6 );
	const q: string = getQueryParam( query );
	const c: string = Md5.init( `salt=${ n }&t=${ i }&r=${ r }&b=${ body }&q=${ q }` );
	
	return `${ i },${ r },${ c }`;
}

export function getDS2(): string {
	// 6X salt
	const n: string = "jEpJb9rRARU2rXDA9qYbZ3selxkuct9a";
	const i: number = Date.now() / 1000 | 0;
	const r: string = getRandomString( 6 );
	const c: string = Md5.init( `salt=${ n }&t=${ i }&r=${ r }` );
	
	return `${ i },${ r },${ c }`;
}

export function generateDS(): string {
	// K2 salt
	const n: string = "dWCcD2FsOUXEstC5f9xubswZxEeoBOTc";
	const i: number = Date.now() / 1000 | 0;
	const r: string = getRandomString( 6 ).toLowerCase();
	const c: string = Md5.init( `salt=${ n }&t=${ i }&r=${ r }` );
	return `${ i },${ r },${ c }`;
}