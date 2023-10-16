import { getWeaponList } from "#/genshin/utils/meta";
import { WeaponList } from "#/genshin/module/type";

export class WeaponMap {
	public get map() {
		return this.getList();
	};
	
	private getList(): WeaponList {
		const data = getWeaponList();
		return {
			...data,
			...Object.fromEntries( Object.values( data ).map( info => {
				return [ info.name, info ];
			} ) )
		}
	}
}