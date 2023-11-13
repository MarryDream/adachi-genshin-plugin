import bot from "ROOT";
import { InfoResponse } from "#/genshin/types";
import { isJsonString } from "@/utils/verify";

const basePath = "genshin/adachi-assets";

export async function getInfo( name: string ): Promise<InfoResponse | null> {
	const typeList = [ "character", "weapon", "artifact" ];
	for ( const type of typeList ) {
		const filePath: string = `${ basePath }/${ type }/${ name }/data.json`;
		const data = await bot.file.loadFile( filePath, "plugin" );
		if ( data ) {
			return isJsonString( data ) ? JSON.parse( data ) : null
		}
	}
	return null;
}