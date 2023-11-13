import moment from "moment";
import bot from "ROOT";
import { getRandomNumber } from "@/utils/random";
import { metaManagement } from "#/genshin/init";

export interface SlipDetail {
	SlipInfo: string[];
}

export class SlipClass {
	private get slip(): string[] {
		const data = metaManagement.getMeta( "meta/slip" );
		return data.SlipInfo.map( el => {
			return Buffer.from( el, "base64" ).toString();
		} );
	}

	public async get( userID: number ): Promise<string> {
		const dbKey: string = `by-ha.slip-save-${ userID }`;
		const today: string = moment().format( "yy-MM-DD" );

		const data: Record<string, string> = await bot.redis.getHash( dbKey );
		if ( data.today && data.today === today ) {
			return data.slip;
		}

		const slip: string = this.slip[ getRandomNumber( 0, this.slip.length - 1 ) ];
		await bot.redis.setHash( dbKey, { today, slip } );
		return slip;
	}
}