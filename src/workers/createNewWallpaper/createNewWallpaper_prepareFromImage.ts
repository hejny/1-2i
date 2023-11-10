import { WebgptTaskProgress } from '../../components/TaskInProgress/task/WebgptTaskProgress';
import { CreateNewWallpaperPrepareResult, CreateNewWallpaperRequest } from './createNewWallpaper';
import { createNewWallpaper_image } from './createNewWallpaper_image';
import { createNewWallpaper_text } from './createNewWallpaper_text';

/**
 * !!!
 *
 * @private Use ONLY in createNewWallpaper
 */
export async function createNewWallpaper_prepareFromImage(
    request: CreateNewWallpaperRequest,
    onProgress: (taskProgress: WebgptTaskProgress) => void,
): Promise<CreateNewWallpaperPrepareResult> {
    const { author, wallpaperImage, locale, title, idea, links, addSections } = request;

    if (!wallpaperImage) {
        throw new Error('wallpaperImage must be provided');
        //               <- TODO: [👮‍♂️] Maybe constrain this logic into CreateNewWallpaperRequest
        //               <- TODO: ShouldNeverHappenError
    }

    const { wallpaperUrl, originalSize, colorStats } = await createNewWallpaper_image(
        { author, wallpaperImage },
        onProgress,
    );
    const { contentWithFont } = await createNewWallpaper_text(
        {
            locale,
            title,
            idea,
            author,
            links,
            addSections,
        },
        onProgress,
    );

    return {
        wallpaperUrl,
        colorStats,
        originalSize,
        contentWithFont,
        wallpaperPrompt: '!!!',
    };
}
