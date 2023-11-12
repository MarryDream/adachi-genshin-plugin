import bot from "ROOT";
import express from "express";

export default express.Router().get( "/", async ( req, res ) => {
	const userID: number = parseInt( <string>req.query.qq );
	const data = await bot.redis.getString( `marry-dream.chara-panel-${ userID }` );
	res.send( JSON.parse( data ) );
} );