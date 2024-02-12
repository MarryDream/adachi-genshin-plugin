export function getRegion( first: string ): string {
	if ( [ "1", "2", "3" ].includes( first ) ) return "cn_gf01";
	
	if ( first === "5" ) return "cn_qd01";
	
	return "unknown";
}