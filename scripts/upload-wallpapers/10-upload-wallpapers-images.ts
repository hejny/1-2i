#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import chalk from 'chalk';
import { readFile } from 'fs/promises';
// import { spawn } from 'child_process';
// import { locateChrome } from 'locate-app';
import { basename, join } from 'path';
import { forTime } from 'waitasecond';
import { CDN, MIDJOURNEY_WHOLE_GALLERY_PATH } from '../../config';
import { generateWallpaperCdnKey } from '../../src/utils/storage/utils/generateWallpaperCdnKey';
import { getSupabaseForServer } from '../../src/utils/supabase/getSupabaseForServer';
import { getHardcodedWallpapers } from '../utils/hardcoded-wallpaper/getHardcodedWallpapers';

if (process.cwd() !== join(__dirname, '../..')) {
    console.error(chalk.red(`CWD must be root of the project`));
    process.exit(1);
}

uploadWallpapersImages()
    .catch((error) => {
        console.error(chalk.bgRed(error.name));
        console.error(error);
        process.exit(1);
    })
    .then(() => {
        process.exit(0);
    });

async function uploadWallpapersImages() {
    console.info(`🔼🖼  Upload wallpapers images`);

    for (const hardcodedWallpaper of await getHardcodedWallpapers()) {
        try {
            const selectResult = await getSupabaseForServer()
                .from('Wallpaper')
                .select('*')
                .eq('id', hardcodedWallpaper.id);

            if (!(selectResult && selectResult.data && selectResult.data.length > 0)) {
                console.info(chalk.yellow(`🔼 ${hardcodedWallpaper.id} does not yet exists`));
                continue;
            }

            const wallpaper = selectResult.data[0];

            const key = generateWallpaperCdnKey(wallpaper);
            const file = await CDN.getItem(key);

            if (file) {
                console.info(chalk.gray(`🔼🖼 ${wallpaper.id} already exists`));
                continue;
            }

            /*
            const response = await fetch(hardcodedWallpaper.src);


            if(response.status !== 200) {
               throw new Error(`Response status of src image is not 200`);
            }
            */

            const srcFileWholePath = join(MIDJOURNEY_WHOLE_GALLERY_PATH, basename(hardcodedWallpaper.srcFilePath));

            await CDN.setItem(key, {
                type: 'image/png' /* <- TODO: Do not hardcode */,
                // Remote (with bypass):> data: await fetchImageWithBypass(hardcodedWallpaper.src),
                // Remote (without bypass):> data: Buffer.from(await response.arrayBuffer()),
                // Local:> data: await readFile(hardcodedWallpaper.srcFilePath),
                // Local (from whole save):
                data: await readFile(srcFileWholePath),
            }) /* <- Note: Using hardcodedWallpaper because we want to fetch original source not source from the mirror */;

            const src = CDN.getItemUrl(key).href;

            // spawn(await locateChrome(), [src]);

            const updateResult = await getSupabaseForServer()
                .from('Wallpaper')
                .update({
                    src,
                })
                .eq('id', hardcodedWallpaper.id);

            // TODO: !! Util isUpdateSuccessfull (Probbably status===204)
            if (updateResult.status !== 204) {
                console.info({ updateResult });
                throw new Error('Update failed');
            }

            console.info(chalk.green(`🔼🖼 ${wallpaper.id} image uploaded and updated in database`));
            await forTime(100);
        } catch (error) {
            console.info(chalk.red(`🔼🖼 ${hardcodedWallpaper.id} error`));
            throw error;
        }
    }

    console.info(`[ Done 🔼🖼  Upload wallpapers images ]`);
}

/**
 * TODO: [🧠] Also upload upscaled wallpapers
 */
