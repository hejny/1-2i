import { useCallback } from 'react';
import { WritableDeep } from 'type-fest';
import { extractTitleFromContent } from '../content/extractTitleFromContent';
import { IWallpaper } from '../IWallpaper';
import { useCurrentWallpaperId } from './useCurrentWallpaperId';
import { useObservable } from './useObservable';
import { useWallpaperSubject } from './useWallpaperSubject';

type IWallpaperToModify = WritableDeep<Omit<IWallpaper, 'title' /* <- Note: [🗄] Ommiting values computed here */>>;
type IModifyWallpaper = (modifiedWallpaper: IWallpaperToModify) => IWallpaperToModify;

/**
 * A function that returns a wallpaper component based on the router query
 */
export function useCurrentWallpaper(): [IWallpaper, (modifyWallpaper: IModifyWallpaper) => IWallpaper] {
    const wallpaperId = useCurrentWallpaperId();

    const wallpaperSubject = useWallpaperSubject(wallpaperId);
    const { value: wallpaper } = useObservable(wallpaperSubject);
    const runModifyWallpaper = useCallback(
        (modifyWallpaper: IModifyWallpaper) => {
            const modifiedWallpaper = { ...wallpaper }; /* <- TODO: !! Do here deep copy */
            const { id, parent, author, src, prompt, colorStats, naturalSize, content, keywords, isPublic, saveStage } =
                modifyWallpaper(modifiedWallpaper);

            // Note: [🗄] title is computed after each change id+parent+author+keywords are computed just once before save
            const title = extractTitleFromContent(content) || 'Untitled';

            const newWallpeper = {
                id,
                parent,
                author,
                src,
                prompt,
                colorStats,
                naturalSize,
                title,
                content,
                keywords,
                isPublic,
                saveStage,
            };

            wallpaperSubject.next(newWallpeper);
            return newWallpeper;
        },
        [wallpaper, wallpaperSubject],
    );

    return [wallpaper, runModifyWallpaper];
}
