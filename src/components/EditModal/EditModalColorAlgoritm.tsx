import { useState } from 'react';
import { forTime } from 'waitasecond';
import { COLORSTATS_COMPUTE_METHODS } from '../../../config';
import { useCurrentWallpaperId } from '../../utils/hooks/useCurrentWallpaperId';
import { useObservable } from '../../utils/hooks/useObservable';
import { useWallpaperSubject } from '../../utils/hooks/useWallpaperSubject';
import { createImageInBrowser } from '../../utils/image/createImageInBrowser';
import { SelectWithFirst } from '../SelectWithFirst/SelectWithFirst';

/**
 * @@
 */
export function EditModalColorAlgoritm() {
    const wallpaperId = useCurrentWallpaperId();
    const wallpaperSubject = useWallpaperSubject(wallpaperId);
    const { value: wallpaper } = useObservable(wallpaperSubject);

    const [isComputing, setComputing] = useState(false);

    return (
        <SelectWithFirst
            title="Color algorithm"
            value={wallpaper.colorStats.version}
            onChange={async (newVersion) => {
                setComputing(true);
                await forTime(10);

                const compute = COLORSTATS_COMPUTE_METHODS.find(({ version }) => newVersion === version);
                if (!compute) {
                    setComputing(false);
                    throw new Error(`Unknown color algorithm version: ${newVersion}`);
                }

                // TODO: [🧠] !!! Fix tainted canvas error
                // TODO: [🧠] !!! Whe best way to report progress from createImageInBrowser and compute
                const newColorStats = await compute(await createImageInBrowser(wallpaper.src));

                wallpaperSubject.next({
                    ...wallpaper,
                    colorStats: newColorStats,
                });

                await forTime(10);
                setComputing(false);
            }}
            numberOfButtons={0}
            options={COLORSTATS_COMPUTE_METHODS.map(({ version }) => ({
                id: version,
                title: version,
            }))}
        />
    );
}
