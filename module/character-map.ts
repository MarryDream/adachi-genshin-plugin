import { getCharacterList } from "#/genshin/utils/meta";
import { CharacterList } from "#/genshin/module/type";

export class CharacterMap {
	public get map() {
		return this.getList();
	};
	
	private getList(): CharacterList {
		const data = getCharacterList();
		return {
			...data,
			...Object.fromEntries( Object.values( data ).map( info => {
				return [ info.name, info ];
			} ) )
		}
	}
}