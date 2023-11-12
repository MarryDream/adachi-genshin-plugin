import cfgList from "./commands";
import { Renderer } from "@/modules/renderer";
import { definePlugin } from "@/modules/plugin";
import * as m from "./module";
import routers from "#/genshin/routes";
import { getRandomString } from "@/utils/random";
import { getFileSize } from "@/utils/network";
import Progress from "@/utils/progress";
import { formatMemories } from "@/utils/format";
import { Logger } from "log4js";

const initConfig = {
	card: {
		weaponStyle: "normal",
		profile: "random"
	},
	chara: {
		showScore: true
	},
	wish: {
		limit: 99
	},
	panel: {
		uidQuery: false,
		enKaApi: "https://enka.shinshin.moe/"
	},
	verify: {
		enable: false,
		repeat: 1,
		token: getRandomString( 6 )
	}
	// cardWeaponStyle: "normal",
	// cardProfile: "random",
	// showCharScore: true,
	// wishLimitNum: 99,
	// verifyEnable: false,
	// verifyRepeat: 1,
	// verifyToken: getRandomString( 6 )
};

export let config: typeof initConfig;

export let renderer: Renderer;
export let metaManagement: m.MetaManagement;
export let artClass: m.ArtClass;
export let cookies: m.Cookies;
export let typeData: m.TypeData;
export let aliasClass: m.AliasClass;
export let almanacClass: m.AlmanacClass;
export let wishClass: m.WishClass;
export let dailyClass: m.DailyClass;
export let slipClass: m.SlipClass;
export let privateClass: m.PrivateClass;

function initModules( cookie: string[] ) {
	artClass = new m.ArtClass();
	cookies = new m.Cookies( cookie );
	typeData = new m.TypeData();
	aliasClass = new m.AliasClass();
	almanacClass = new m.AlmanacClass();
	wishClass = new m.WishClass();
	dailyClass = new m.DailyClass();
	slipClass = new m.SlipClass();
	privateClass = new m.PrivateClass();
}

export default definePlugin( {
	name: "原神",
	cfgList,
	repo: {
		owner: "MarryDream",
		repoName: "adachi-genshin-plugin",
		ref: "master"
	},
	server: {
		routers
	},
	publicDirs: [
		"views",
		"components",
		"front-utils",
		"assets",
		"adachi-assets"
	],
	assets: {
		manifestUrl: "https://mari-files.oss-cn-beijing.aliyuncs.com/adachi-bot/version3/genshin_assets_manifest.yml",
		downloadBaseUrl: "https://mari-files.oss-cn-beijing.aliyuncs.com",
		async overflowHandle( assets, pluginKey, { file, logger } ) {
			const gLogger = new Proxy( logger, {
				get( target: Logger, p: string | symbol ): any {
					return ( content: string ) => target[p]( `${ pluginKey } 插件: ${ content }` );
				}
			} );
			gLogger.info( "待更新资源数量超出限制，开始下载压缩资源包..." );
			// 超出时下载整包资源
			const fileUrl = "https://mari-files.oss-cn-beijing.aliyuncs.com/adachi-bot/version3/genshin-resource.zip";
			const totalSize = await getFileSize( fileUrl );
			let downloadSize = 0;
			const progress = new Progress( "下载 genshin 插件整包资源", totalSize || 0 );
			
			const startTime = Date.now();
			
			// 压缩包下载目标路径
			const zipDownloadPath: string = "genshin/genshin-resource.zip";
			try {
				await file.downloadFileStream( fileUrl, zipDownloadPath, "plugin", chunk => {
					const curLength = chunk.length;
					downloadSize += curLength;
					if ( !totalSize ) {
						progress.setTotal( downloadSize );
					}
					// 下载进度条
					progress.renderer( downloadSize, () => {
						if ( totalSize ) {
							const elapsedTime = ( Date.now() - startTime ) / 1000;
							const averageSize = downloadSize / elapsedTime;
							
							const fDownloadSize = formatMemories( downloadSize, "M" );
							const fTotalSize = formatMemories( totalSize, "M" );
							const fAverageSize = formatMemories( averageSize, averageSize < 1024 * 1024 ? "KB" : "M" );
							return `${ fDownloadSize }/${ fTotalSize } ${ fAverageSize }/s`;
						}
						return formatMemories( downloadSize, "M" );
					} )
				} );
			} catch ( error ) {
				gLogger.error( "资源包下载失败:" + ( <Error>error ).stack );
				throw error;
			}
			// 压缩包解压目标路径
			const zipUnCompressPath = `${ pluginKey }/${ assets.folderName || "adachi-assets" }`;
			/* 此时存在原有资源文件，先进行删除 */
			const { type: originPathFileType } = await file.getFileType( zipUnCompressPath, "plugin" );
			if ( originPathFileType === "directory" ) {
				gLogger.info( "正在清除原有资源文件..." );
				const { status: deleteStatus } = await file.deleteFile( zipUnCompressPath, "plugin" );
				if ( !deleteStatus ) {
					gLogger.error( "清除原有资源文件失败，请尝试手动解压替换" );
					return;
				}
			}
			gLogger.info( "开始解压资源包..." );
			const { status: unCompressStatus } = await file.unCompressFile( "zip", zipDownloadPath, zipUnCompressPath, "plugin" );
			if ( !unCompressStatus ) {
				gLogger.error( "解压资源包失败，请尝试手动解压替换" );
				return;
			}
			gLogger.info( "资源包解压完成" );
			await file.deleteFile( zipDownloadPath, "plugin" );
			return true;
		},
		replacePath: path => {
			return path.replace( "adachi-bot/version3/genshin/", "" );
		}
	},
	subscribe: [
		{
			name: "私人服务",
			getUser() {
				return {
					person: privateClass.getUserIDList()
				}
			},
			async reSub( userId, type ) {
				if ( type === "private" ) {
					await privateClass.delBatchPrivate( userId );
				}
			}
		}, {
			name: "素材订阅",
			async getUser( { redis } ) {
				const dailyUserIds: string[] = await redis.getKeysByPrefix( "silvery-star.daily-sub-" );
				const dailyGroupIds: string[] = await redis.getList( "silvery-star.daily-sub-group" );
				return {
					person: dailyUserIds
						.map( el => parseInt( <string>el.split( "-" ).pop() ) )
						.filter( el => !!el ),
					group: dailyGroupIds.map( id => Number.parseInt( id ) )
				}
			},
			async reSub( userId, type, { redis } ) {
				if ( type === "private" ) {
					await redis.deleteKey( `silvery-star.daily-sub-${ userId }` );
				} else {
					const dbKey: string = "silvery-star.daily-sub-group";
					redis.delListElement( dbKey, userId.toString() );
				}
			}
		}
	],
	/* 初始化模块 */
	async mounted( param ) {
		/* 加载 genshin.yml 配置 */
		config = param.configRegister( "main", initConfig );
		/* 初始化 meta 数据 */
		metaManagement = new m.MetaManagement( param.file, param.logger );
		/* 初始化 meta 监听器 */
		metaManagement.watchStart();
		
		const cookieCfg = param.configRegister( "cookies", {
			cookies: [ "米游社Cookies(允许设置多个)" ]
		} );
		cookieCfg.on( "refresh", config => {
			cookies = new m.Cookies( config.cookies );
		} );
		/* 实例化渲染器 */
		renderer = param.renderRegister( "#app", "views" );
		initModules( cookieCfg.cookies );
	},
	async unmounted() {
		/* 清空 meta 事件 */
		metaManagement.clear();
		/* 关闭 meta 监听器 */
		await metaManagement.watchClose();
	}
} );