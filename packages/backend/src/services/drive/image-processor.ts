import * as sharp from 'sharp';

export type IImage = {
	data: Buffer;
	ext: string | null;
	type: string;
};

/**
 * Convert to JPEG
 *   with resize, remove metadata, resolve orientation, stop animation
 */
export async function convertToJpeg(path: string, width: number, height: number, options?: sharp.SharpOptions): Promise<IImage> {
	return convertSharpToJpeg(sharp(path, options), width, height);
}

export async function convertSharpToJpeg(sharp: sharp.Sharp, width: number, height: number): Promise<IImage> {
	const data = await sharp
		.resize(width, height, {
			fit: 'inside',
			withoutEnlargement: true,
		})
		.rotate()
		.jpeg({
			quality: 85,
			progressive: true,
		})
		.toBuffer();

	return {
		data,
		ext: 'jpg',
		type: 'image/jpeg',
	};
}

/**
 * Convert to WebP
 *   with resize, remove metadata, resolve orientation, stop animation
 */
export async function convertToWebp(path: string, width: number, height: number, quality: number = 85, options?: sharp.SharpOptions): Promise<IImage> {
	return convertSharpToWebp(sharp(path, options), width, height, quality);
}

export async function convertSharpToWebp(sharp: sharp.Sharp, width: number, height: number, quality: number = 85): Promise<IImage> {
	const data = await sharp
		.resize(width, height, {
			fit: 'inside',
			withoutEnlargement: true,
		})
		.rotate()
		.webp({
			quality,
			alphaQuality: quality,
			lossless: quality === 100,
		})
		.toBuffer();

	return {
		data,
		ext: 'webp',
		type: 'image/webp',
	};
}

/**
 * Convert to PNG
 *   with resize, remove metadata, resolve orientation, stop animation
 */
export async function convertToPng(path: string, width: number, height: number, options?: sharp.SharpOptions): Promise<IImage> {
	return convertSharpToPng(sharp(path, options), width, height);
}

export async function convertSharpToPng(sharp: sharp.Sharp, width: number, height: number): Promise<IImage> {
	const data = await sharp
		.resize(width, height, {
			fit: 'inside',
			withoutEnlargement: true,
		})
		.rotate()
		.png()
		.toBuffer();

	return {
		data,
		ext: 'png',
		type: 'image/png',
	};
}
