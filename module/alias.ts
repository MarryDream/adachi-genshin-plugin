import bot from "ROOT";
import { metaManagement } from "#/genshin/init";

export interface AliasMap {
	[P: string]: {
		realName: string;
		aliasNames: string[];
	}
}

export class AliasClass {
	private dbData: Map<string, string> = new Map();
	
	constructor() {
		this.setDbData();
	}
	
	private get metaData(): Map<string, string> {
		const metaData = new Map();
		const alias: AliasMap = metaManagement.getMeta( "meta/alias" );
		for ( let el of Object.values( alias ).flat() ) {
			for ( let alias of el.aliasNames ) {
				metaData.set( alias.toString(), el.realName );
			}
		}
		return metaData;
	}
	
	private async setDbData() {
		const dbData = new Map();
		const added: string[] = await bot.redis.getKeysByPrefix( "silvery-star.alias-add-" );
		for ( let key of added ) {
			const realName = <string>key.split( "-" ).pop();
			const aliasList: string[] = await bot.redis.getList( key );
			for ( let alias of aliasList ) {
				dbData.set( alias, realName );
			}
		}
		
		const removed: string[] = await bot.redis.getList( "silvery-star.alias-remove" );
		for ( let key of removed ) {
			const aliasList: string[] = await bot.redis.getList( key );
			for ( let alias of aliasList ) {
				dbData.delete( alias );
			}
		}
		this.dbData = dbData;
	}
	
	public async addPair( alias: string, realName: string ): Promise<void> {
		await bot.redis.addListElement( `silvery-star.alias-add-${ realName }`, alias );
		await bot.redis.delListElement( `silvery-star.alias-remove`, alias );
		await this.setDbData();
	}
	
	public async removeAlias( alias: string, realName: string ): Promise<void> {
		await bot.redis.addListElement( `silvery-star.alias-remove`, alias );
		await bot.redis.delListElement( `silvery-star.alias-add-${ realName }`, alias );
		await this.setDbData();
	}
	
	public getAllAliasKey() {
		return [ ...this.metaData.keys(), ...this.dbData.keys() ];
	}
	
	public search( name: string ): string | undefined {
		const data = this.dbData.get( name );
		if ( data ) {
			return data;
		}
		return this.metaData.get( name );
	}
}