import { ISkin, skinFromWallpaper } from '../skinFromWallpaper';
import { useWallpaper } from './useWallpaper';

/**
 * A function that returns a skin based on the wallpaper color statistics ⁘
 *
 * @returns {ISkin} The skin object.
 */
export function useSkin(): ISkin {
    return skinFromWallpaper(useWallpaper());
}
