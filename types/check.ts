import { ArtifactInfo, CharacterInfo, InfoFullResponse, WeaponInfo } from "./info";
import { EnKaEquip, EnKaWeaponEquip } from "./panel/EnKa";

/* 对于 OSS 返回数据的类型检查 */
export function isWeaponInfo( obj: InfoFullResponse ): obj is WeaponInfo {
	return obj.type === "武器";
}

export function isCharacterInfo( obj: InfoFullResponse ): obj is CharacterInfo {
	return obj.type === "角色";
}

export function isArtifactInfo( obj: InfoFullResponse ): obj is ArtifactInfo {
	return obj.type === "圣遗物";
}

export function isEnKaWeaponEquip( equip: EnKaEquip ): equip is EnKaWeaponEquip {
	return equip.flat.itemType !== "ITEM_WEAPON";
}