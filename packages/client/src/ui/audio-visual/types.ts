type avIframeInfo = {
	type: 'iframe' | 'YouTube';
	data: {
		url: string; // player/embedのURL
		sharedUrl?: string; // ノートでシェアしたときのembedでないURL
	};
};

type avDriveFileInfo = {
	type: 'audio' | 'video';
	data: {
		url: string;
		noteId?: string; // 添付されていたノートのID
		driveFileId?: string; // ファイルID
	};
};

export type avInfo = avIframeInfo | avDriveFileInfo;
