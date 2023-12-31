import { defineDirective } from "@/modules/command";
import { getRealName, NameResult } from "#/genshin/utils/name";
import { Sendable } from "@/modules/lib";
import { renderer, typeData } from "#/genshin/init";
import { RenderResult } from "@/modules/renderer";

export default defineDirective( "order", async ( { file, sendMessage, messageData } ) => {
	const name: string = messageData.raw_message;
	const result: NameResult = getRealName( name );
	
	let message: Sendable;
	
	if ( result.definite ) {
		/* 检查是否存在该攻略图 */
		const filePath = `genshin/adachi-assets/resource/guide/${ result.info }.webp`;
		const isExist = await ( file.isExist( file.getFilePath( filePath, "plugin" ) ) );
		if ( isExist ) {
			const res: RenderResult = await renderer.asSegment(
				"/guide/index.html",
				{ url: "/" + filePath }
			);
			if ( res.code === "ok" ) {
				message = res.data;
			} else {
				throw new Error( res.error );
			}
		} else {
			message = `未查询到关于「${ result.info }」的攻略图，请等待西风驿站上传后再次查询，或前往 github.com/SilveryStar/Adachi-BOT 进行反馈`;
		}
	} else if ( result.info === "" ) {
		message = `暂无关于「${ name }」的信息，若确认名称输入无误，请前往 github.com/SilveryStar/Adachi-BOT 进行反馈`;
	} else {
		message = `未找到相关信息，是否要找：${ [ "", ...<string[]>result.info ].join( "\n  - " ) }`;
	}
	
	await sendMessage( message );
} );