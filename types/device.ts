export interface IDeviceData {
	deviceModel?: string;
	androidVersion?: string;
	deviceFingerprint?: string;
	deviceName?: string;
	deviceBoard?: string;
	deviceProduct?: string;
	oaid?: string;
	device_id?: string;
	device_fp?: string;
}

export interface IFpData {
	device_id: string;
	device_fp: string;
}