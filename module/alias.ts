import bot from "ROOT";
import { getAliasName } from "#/genshin/utils/meta";

export interface AliasMap {
	[ P: string ]: {
		realName: string;
		aliasNames: string[];
	}
}

export class AliasClass {
	public list: Map<string, string> = new Map();
	
	constructor() {
		this.list = new Map();
		
		this.getList().then( ( result: Map<string, string> ) => {
			this.list = result;
		} );
	}
	
	public async getList(): Promise<Map<string, string>> {
		const list = new Map();
		const alias: AliasMap = getAliasName();
		for ( let el of Object.values(alias).flat() ) {
			for ( let alias of el.aliasNames ) {
				list.set( alias, el.realName );
			}
		}
		
		const added: string[] = await bot.redis.getKeysByPrefix( "silvery-star.alias-add-" );
		for ( let key of added ) {
			const realName = <string>key.split( "-" ).pop();
			const aliasList: string[] = await bot.redis.getList( key );
			for ( let alias of aliasList ) {
				list.set( alias, realName );
			}
		}
		
		const removed: string[] = await bot.redis.getList( "silvery-star.alias-remove" );
		for ( let key of removed ) {
			const aliasList: string[] = await bot.redis.getList( key );
			for ( let alias of aliasList ) {
				list.delete( alias );
			}
		}
		
		return list;
	}
	
	public async addPair( alias: string, realName: string ): Promise<void> {
		await bot.redis.addListElement( `silvery-star.alias-add-${ realName }`, alias );
		await bot.redis.delListElement( `silvery-star.alias-remove`, alias );
		this.list = await this.getList();
	}
	
	public async removeAlias( alias: string, realName: string ): Promise<void> {
		await bot.redis.addListElement( `silvery-star.alias-remove`, alias );
		await bot.redis.delListElement( `silvery-star.alias-add-${ realName }`, alias );
		this.list = await this.getList();
	}
	
	public search( name: string ): string | undefined {
		return this.list.get( name );
	}
}