import type { NextApiRequest, NextApiResponse } from 'next';
import { IS_DEVELOPMENT } from '../../../config';
import { likedStatusToLikeness } from '../../recommendation/likedStatusToLikeness';
import { pickMostRecommended } from '../../recommendation/pickMostRecommended';
import { hydrateWallpaper } from '../../utils/hydrateWallpaper';
import { IWallpaper, IWallpaperSerialized } from '../../utils/IWallpaper';
import { getSupabaseForServer } from '../../utils/supabase/getSupabaseForServer';
import { number_likeness } from '../../utils/typeAliases';
import { isValidUuid } from '../../utils/validators/isValidUuid';

export interface RecommendWallpaperResponse {
    // TODO: [🌋] ErrorableResponse
    recommendedWallpaper: IWallpaperSerialized;
}

export default async function recommendWallpaperHandler(
    request: NextApiRequest,
    response: NextApiResponse<RecommendWallpaperResponse>,
) {
    const author = request.query.author;

    if (!isValidUuid(author)) {
        return response
            .status(400)
            .json({ message: 'GET param author is not set or not a valid UUID' } as any /* <- [🌋]  */);
    }

    try {
        const wallpapersWithLikeness: Array<IWallpaper & { likeness: number_likeness }> = [];
        for (const likedStatus of ['LOVE', 'LIKE', 'DISLIKE'] as const) {
            const { data: wallpapersWithLikenessData } = await getSupabaseForServer()
                .from('Reaction')
                .select(
                    `
                        createdAt,
                        Wallpaper( * ) 
                    `,
                )
                .eq('author', author)
                .eq('likedStatus', likedStatus)
                .order('createdAt', { ascending: false })
                // <- TODO: !!!! [🤺][🧠] Take ONLY current reactions NOT overwritten ones
                .limit(10 /* <- TODO:  [🤺] Tweak this number */);

            const likeness = likedStatusToLikeness(likedStatus);

            for (const { Wallpaper } of wallpapersWithLikenessData || []) {
                wallpapersWithLikeness.push({
                    likeness,
                    ...hydrateWallpaper(Wallpaper as any),
                });
            }
        }

        const { data: wallpapersToPickData } = await getSupabaseForServer()
            .from('Wallpaper_random')
            .select('*')
            .eq('isPublic', true)
            .limit(10 /* <- TODO: [🤺] Tweak this number */);
        if (wallpapersToPickData === null) {
            throw new Error(`No Wallpapers found in view Wallpaper_random`);
        }
        const wallpapersToPick = wallpapersToPickData.map((wallpaper) => hydrateWallpaper(wallpaper as any));

        if (IS_DEVELOPMENT) {
            console.log({
                wallpapersWithLikeness,
                wallpapersToPickData,
                wallpapersToPick,
            });
        }

        const recommendedWallpaper = pickMostRecommended({
            wallpapersWithLikeness,
            wallpapersToPick,
        });

        return response.status(200).json({ recommendedWallpaper } as any);
    } catch (error) {
        if (!(error instanceof Error)) {
            throw error;
        }

        console.error(error);
        return response.status(500).json({ message: error.message } as any /* <- [🌋]  */);
    }
}

/**
 * TODO: [🤺] Optimize, maybe cache inputs and results
 */
