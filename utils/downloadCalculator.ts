// 计算下载速度的工具类
export class DownloadCalculator {
	private chunks: { size: number; time: number }[] = [];
	private _downloadSpeed = 0; // 单位 Bit/s
	private lastUpdateTime = 0; // 上次更新速度的时间戳
	private updateCallback?: ( speed: number ) => any; // 更新速度时会触发的回调
	private timer: any = null;
	
	constructor(
		// 更新下载速度的时间间隔
		private updateInterval = 500
	) {
		if ( updateInterval <= 0 ) {
			throw new Error( "updateInterval mast be greater than 0");
		}
	}
	
	get downloadSpeed() {
		return this._downloadSpeed;
	}
	
	public startDownload( updateCallback: ( speed: number ) => any ) {
		this.updateCallback = updateCallback;
		this.timer = setInterval( () => {
			this.lastUpdateTime = Date.now();
			this.calAndUpdateSpeed();
		}, this.updateInterval );
	}
	
	public stopDownload() {
		if ( !this.timer ) return;
		clearInterval( this.timer );
		this.timer = null;
		// 结束时最后计算一次速度
		this.calAndUpdateSpeed( Date.now() - this.lastUpdateTime );
		this._downloadSpeed = 0;
		this.chunks = [];
	}
	
	// 新增数据块
	public addChunk( chunk: string | Buffer ) {
		const time = Date.now();
		const size = chunk.length;
		// 添加当前的 chunk 信息
		this.chunks.push({ size, time });
		// 删除超过两秒的旧数据
		this.chunks = this.chunks.filter( c => ( time - c.time ) < this.updateInterval );
	}
	
	// 计算并更新下载速度
	private calAndUpdateSpeed( interval = this.updateInterval ) {
		const totalSize = this.chunks.reduce( ( total, chunk ) => total + chunk.size, 0 );
		const totalTime = interval / 1000; // 换算为秒
		this._downloadSpeed = totalSize / totalTime;
		this.chunks = [];
		this.updateCallback?.( this.downloadSpeed );
	}
}