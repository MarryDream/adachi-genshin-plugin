import { defineDirective, InputParameter, SwitchMatchResult } from "@/modules/command";
import { aliasClass, typeData } from "#/genshin/init";

export default defineDirective( "switch", async ( { sendMessage, matchResult, redis } ) => {
	const [ _, name, alias ] = matchResult.match;
	
	const nameList: string[] = typeData.getNameList();
	if ( !nameList.some( el => el === name ) ) {
		await sendMessage( `不存在名称为「${ name }」的角色或武器，若确认名称输入无误，请前往 github.com/SilveryStar/Adachi-BOT 进行反馈` );
		return;
	}
	
	if ( matchResult.isOn ) {
		const added: string[] = await redis.getList( `silvery-star.alias-add-${ name }` );
		if ( added.some( el => el === alias ) || aliasClass.search( alias ) !== undefined ) {
			await sendMessage( `别名「${ alias }」已存在` );
			return;
		}
		
		await aliasClass.addPair( alias, name );
	} else if ( !matchResult.isOn ) {
		const removed: string[] = await redis.getList( "silvery-star.alias-remove" );
		if ( removed.some( el => el === alias ) ) {
			await sendMessage( `别名「${ alias }」已被删除` );
			return;
		}
		
		await aliasClass.removeAlias( alias, name );
	}
	
	await sendMessage( `别名${ matchResult.isOn ? "添加" : "删除" }成功` );
} );