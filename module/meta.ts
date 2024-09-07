import chokidar from "chokidar";
import path from "path"
import { AliasMap } from "#/genshin/module/alias";
import { FortuneData } from "#/genshin/module/almanac";
import { DailyMaterial, OssArtifact, OssDomain } from "#/genshin/types/ossMeta";
import { CharacterList, WeaponList } from "#/genshin/module/type";
import { SlipDetail } from "#/genshin/module/slip";
import FileManagement from "@/modules/file";
import { Logger } from "log4js";
import { Panel } from "#/genshin/types";

interface MetaData {
	"meta/alias": AliasMap;
	"meta/almanac": Record<string, FortuneData[]>;
	"meta/artifact": OssArtifact;
	"meta/character": CharacterList;
	"meta/daily": DailyMaterial;
	"meta/domain": OssDomain;
	"meta/home": { name: string }[];
	"meta/slip": SlipDetail;
	"meta/weapon": WeaponList;
	"meta/attr_icon": Panel.AttrIconMap;
	"enka/artifact": Panel.EnKaArtifact;
	"enka/chara": Panel.EnKaChara;
	"enka/meta": Panel.EnKaMeta;
}

interface WatchEventHandle {
	( data: Record<string, any> | null ): any;
}

const defaultArtifact = {
	// 圣遗物权值
	data: {
		weights: {
			/**
			 * 套装部位权值
			 * 生之花  死之羽  时之沙  空之杯  理之冠
			 */
			slot: [ 214, 214, 208, 182, 182 ],
			/**
			 * 属性权值
			 * HP   HP%  DEF  DEF% ER%  EM   ATK  ATK%  CD% CR% Phy% Ane% Cry% Ele% Geo% Hyd% Pyr% heal%
			 */
			prob: [ {
				// 副词条
				main: [ 108, 108, 108, 108, 104, 104, 102, 102, 78, 78, 0, 0, 0, 0, 0, 0, 0, 0 ],
				sub: [ 108, 108, 108, 108, 104, 104, 102, 102, 78, 78, 0, 0, 0, 0, 0, 0, 0, 0 ]
			}, {
				// 副词条
				main: [ 108, 108, 108, 108, 104, 104, 102, 102, 78, 78, 0, 0, 0, 0, 0, 0, 0, 0 ],
				sub: [ 108, 108, 108, 108, 104, 104, 102, 102, 78, 78, 0, 0, 0, 0, 0, 0, 0, 0 ]
			}, {
				// 时之沙
				main: [ 0, 247, 0, 247, 132, 132, 0, 242, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
				sub: [ 108, 108, 108, 108, 104, 104, 102, 102, 78, 78, 0, 0, 0, 0, 0, 0, 0, 0 ]
			}, {
				// 空之杯
				main: [ 0, 227, 0, 227, 0, 117, 0, 212, 0, 0, 31, 31, 31, 31, 31, 31, 31, 0 ],
				sub: [ 108, 108, 108, 108, 104, 104, 102, 102, 78, 78, 0, 0, 0, 0, 0, 0, 0, 0 ]
			}, {
				// 理之冠
				main: [ 0, 209, 0, 209, 0, 117, 0, 198, 96, 96, 0, 0, 0, 0, 0, 0, 0, 75 ],
				sub: [ 108, 108, 108, 108, 104, 104, 102, 102, 78, 78, 0, 0, 0, 0, 0, 0, 0, 0 ]
			} ],
			// 数值大小
			stage: [ 235, 245, 255, 265 ],
			// 初始词条个数
			number: [ 0, 0, 0, 720, 280 ]
		},
		/**
		 * 圣遗物副属性权值
		 */
		values: [
			// HP      HP%     DEF    DEF%    ER%     EM     ATK    ATK%    CD%     CR%
			[ 298.75, 0.0583, 23.15, 0.0729, 0.0648, 23.31, 19.45, 0.0583, 0.0777, 0.0389 ], // 一档
			[ 268.88, 0.0525, 20.83, 0.0656, 0.0583, 20.98, 17.51, 0.0525, 0.0699, 0.0350 ], // 二档
			[ 239.00, 0.0466, 18.52, 0.0583, 0.0518, 18.65, 15.56, 0.0466, 0.0622, 0.0311 ], // 三档
			[ 209.13, 0.0408, 16.20, 0.0510, 0.0453, 16.32, 13.62, 0.0408, 0.0544, 0.0272 ]  // 四档
		]
	},
	suits: {}
};

export class MetaManagement {
	private eventListeners = new Map<keyof MetaData, WatchEventHandle[]>();
	private watcher: chokidar.FSWatcher | null = null;
	private metaData = <MetaData>{};
	private MetaFunctionMap: Record<keyof MetaData, WatchEventHandle> = {
		/** 别名 */
		"meta/alias": data => ( data || {} ),
		/** 文本来源 可莉特调 https: //genshin.pub/ */
		"meta/almanac": data => ( data || {} ),
		/** 圣遗物 */
		"meta/artifact": data => ( data || defaultArtifact ),
		/** 角色 */
		"meta/character": data => data
			? {
				...data,
				...Object.fromEntries( Object.values( data ).map( info => {
					return [ info.name, info ];
				} ) )
			}
			: {},
		/** 日历 */
		"meta/daily": data => {
			if ( !data ) {
				return {
					"Mon&Thu": [],
					"Tue&Fri": [],
					"Wed&Sat": []
				}
			}
			return <any>Object.fromEntries( Object.entries( data ).map( ( [ key, value ] ) => {
				return [ key, Object.values( value ).flat() ]
			} ) );
		},
		/** 秘境 */
		"meta/domain": data => ( data || [] ),
		/** 家园 */
		"meta/home": data => ( data?.list || [] ),
		/** 黄历 */
		"meta/slip": data => ( data || { SlipInfo: [] } ),
		/** 武器 */
		"meta/weapon": data => data ? {
			...data,
			...Object.fromEntries( Object.values( data ).map( info => {
				return [ info.name, info ];
			} ) )
		} : {},
		/** 图标 */
		"meta/attr_icon": data => ( data || {} ),
		/** enka-圣遗物 */
		"enka/artifact": data => ( data || {} ),
		/** enka-人物 */
		"enka/chara": data => ( data || {} ),
		/** enka-清单 */
		"enka/meta": data => ( data || {} )
	}

	constructor(
		private file: FileManagement,
		private logger: Logger
	) {
	}

	public on( type: keyof MetaData, handle: WatchEventHandle ) {
		const handlers = this.eventListeners.get( type );
		if ( handlers ) {
			handlers.push( handle );
		} else {
			this.eventListeners.set( type, [ handle ] );
		}
	}

	public clear( type?: keyof MetaData ) {
		if ( type ) {
			this.eventListeners.delete( type );
		} else {
			this.eventListeners.clear();
		}
	}

	public watchStart() {
		if ( this.watcher ) {
			return;
		}
		this.watcher = chokidar.watch( [ "meta", "enka" ], {
			cwd: path.resolve( __dirname, "../adachi-assets" )
		} )
		const eventList = <const>[ "add", "change", "unlink" ];
		eventList.forEach( event => {
			this.watcher!.on( event, async ( filePath: string ) => {
				const metaFile = this.getMetaFile( filePath );
				if ( !metaFile ) {
					return;
				}
				// 获取对应的数据获取函数
				this.metaData[metaFile] = await this.loadMeta( metaFile );

				if ( event !== "add" ) {
					this.logger.info( `[genshin]静态数据文件 [${ metaFile }] 内容更新` );
				}
			} )
		} )
	}

	public async watchClose() {
		if ( !this.watcher ) {
			return;
		}
		await this.watcher.close();
		this.watcher = null;
	}

	public getMeta<T extends keyof MetaData>( file: T ): MetaData[T] {
		return this.metaData[file] || {};
	}

	private getMetaFile( filePath: string ): keyof MetaData | null {
		filePath = filePath.split( "." )[0];
		const metaFile = <keyof MetaData>filePath.split( path.sep ).join( "/" );
		if ( !Reflect.has( this.MetaFunctionMap, metaFile ) ) {
			return null;
		}
		return metaFile;
	}

	/* 通用读取 meta 文件数据方法 */
	private async loadMeta( metaFile: keyof MetaData ) {
		const data = await this.file.loadYAML( `genshin/adachi-assets/${ metaFile }`, "plugin" );
		const handles = this.eventListeners.get( metaFile ) || [];
		// 执行注册的所有事件
		await Promise.all( handles.map( async handle => await handle( data ) ) );

		return this.MetaFunctionMap[metaFile].call( this, data );
	}
}