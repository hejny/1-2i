import {
    COLORS_LIMIT,
    DIFFERENT_COLOR_DISTANCE_THEASHOLD_RATIO,
    DIFFERENT_COLOR_HUE_THEASHOLD_DEGREES,
    TEXT_BACKGROUND_COLOR_DISTANCE_THEASHOLD_RATIO,
} from '../../../../../config';
import { Color } from '../../../color/Color';
import { textColor } from '../../../color/operators/furthest';
import { areColorsEqual } from '../../../color/utils/areColorsEqual';
import { colorDistanceSquared } from '../../../color/utils/colorDistance';
import { colorHueDistance } from '../../../color/utils/colorHueDistance';
import { WithTake } from '../../../take/interfaces/ITakeChain';
import { IImageColorStatsAdvanced } from '../../utils/IImageColorStats';

let totalCount = 0;
let pickByMostFrequentColorCount = 0;

export function computeImagePalette13(
    colorStats: Omit<IImageColorStatsAdvanced<string>, 'version' | 'palette'>,
): Array<{ value: WithTake<Color>; note: string } /* <- TODO: [⏲] Do we want here count*/> {
    let primaryColor: { value: WithTake<Color>; note: string } /* <- TODO: [⏲] Do we want here count*/ | null = null;

    totalCount++;

    // 0️⃣ Check that there is some most occuring color towards the bottom of the image
    if (
        // [🥎]
        areColorsEqual(colorStats.mostFrequentColors[0].value, colorStats.bottomHalf.mostFrequentColors[0].value) &&
        areColorsEqual(colorStats.mostFrequentColors[0].value, colorStats.bottomThird.mostFrequentColors[0].value) &&
        areColorsEqual(colorStats.mostFrequentColors[0].value, colorStats.bottomLine.mostFrequentColors[0].value)
    ) {
        pickByMostFrequentColorCount++;
        primaryColor = {
            ...colorStats.bottomHalf.mostFrequentColors[0],
            note: `Most frequent color`,
        };
    }

    // 1️⃣ Compute the all palette candidates
    const paletteCandidates: Array<{ value: WithTake<Color>; note: string } /* <- TODO: [⏲] Do we want here count*/> =
        [];

    for (const { regionName, regionStats } of [
        { regionName: 'bottom half of the wallpaper', regionStats: colorStats.bottomHalf },
        { regionName: 'bottom third of the wallpaper', regionStats: colorStats.bottomThird },
        { regionName: 'the whole wallpaper', regionStats: colorStats },
        { regionName: 'bottom line of the wallpaper', regionStats: colorStats.bottomLine },
        /* <- TODO: Combinations */
    ]) {
        // TODO: !! Here also get in account the color count
        // TODO: !! In note put the order of color like:
        //       3. Most frequent color

        let si = 0;
        for (const mostSatulightedColor of regionStats.mostSatulightedColors) {
            si++;
            paletteCandidates.push({ ...mostSatulightedColor, note: `${si}. most satulighted color of ${regionName}` });
        }
        let gi = 0;
        for (const mostGroupedColor of regionStats.mostGroupedColors) {
            gi++;
            paletteCandidates.push({ ...mostGroupedColor, note: `${gi}. most grouped color of ${regionName}` });
        }
        let fi = 0;
        for (const mostFrequentColor of regionStats.mostFrequentColors) {
            fi++;
            paletteCandidates.push({ ...mostFrequentColor, note: `${fi}. most frequent color of ${regionName}` });
        }
        // regionStats.averageColor;

        paletteCandidates.push({ value: regionStats.darkestColor, note: `Darkest color of ${regionName}` });
        paletteCandidates.push({ value: regionStats.lightestColor, note: `Lightest color of ${regionName}` });
    }

    if (!primaryColor) {
        // 2️⃣ Pick best primary color
        // 2️⃣🅰 Pick the first color from paletteCandidates which is dark enough to white text on it
        for (const paletteCandidate of paletteCandidates) {
            if (areColorsEqual(paletteCandidate.value.then(textColor), Color.get('white'))) {
                primaryColor = {
                    ...paletteCandidate,
                    note: `${paletteCandidate.note} which is dark enough to emplace light text`,
                };
                break;
            }
        }

        // 2️⃣🅱 Pick just the first color from paletteCandidates
        if (!primaryColor) {
            primaryColor = paletteCandidates[0];
        }
    }

    // 2️⃣🅲 Get the secondary color
    let secondaryColor: { value: WithTake<Color>; note: string } /* <- TODO: [⏲] Do we want here count*/ | null = null;
    const textBackgrounddistanceTheashold =
        colorDistanceSquared(Color.get('black'), Color.get('white')) * TEXT_BACKGROUND_COLOR_DISTANCE_THEASHOLD_RATIO;
    for (const paletteCandidate of paletteCandidates) {
        if (colorDistanceSquared(primaryColor.value, paletteCandidate.value) >= textBackgrounddistanceTheashold) {
            secondaryColor = {
                ...paletteCandidate,
                note: `${paletteCandidate.note} which is contrast enough (${Math.round(
                    TEXT_BACKGROUND_COLOR_DISTANCE_THEASHOLD_RATIO * 100,
                )}%) against primary color`,
            };
            break;
        }
    }
    if (!secondaryColor) {
        secondaryColor = {
            value: primaryColor.value.then(textColor),
            note: `Most distant color from primary color`,
        };
    }

    // 3️⃣ Pick colors that has some distance+hue threshold (compared to all other already picked colors)
    //    TODO: This has one flaw which need to be fixed [🦯]
    const distanceTheashold =
        colorDistanceSquared(Color.get('black'), Color.get('white')) * DIFFERENT_COLOR_DISTANCE_THEASHOLD_RATIO;
    const palette: Array<{ value: WithTake<Color>; note: string } /* <- TODO: [⏲] Do we want here count*/> = [
        primaryColor,
        secondaryColor,
    ];
    for (const paletteCandidate of paletteCandidates.filter(
        (color) => color !== primaryColor && color !== secondaryColor,
    )) {
        // TODO: !! Make in this distance hue more relevant
        if (
            palette.every(
                (uniqueColor) => colorDistanceSquared(paletteCandidate.value, uniqueColor.value) >= distanceTheashold,
            ) &&
            palette.every(
                (uniqueColor) =>
                    colorHueDistance(paletteCandidate.value, uniqueColor.value) >=
                    DIFFERENT_COLOR_HUE_THEASHOLD_DEGREES,
            )
        ) {
            palette.push({
                ...paletteCandidate,
                note: `${paletteCandidate.note} which is distant enough (${Math.round(
                    DIFFERENT_COLOR_DISTANCE_THEASHOLD_RATIO * 100,
                )}%) and hue-distant enough (${DIFFERENT_COLOR_HUE_THEASHOLD_DEGREES}°) from all other palette colors`,
            });
        }

        if (palette.length >= COLORS_LIMIT) {
            break;
        }
    }

    // TODO: [3]

    // 4️⃣ Sort the palette so primary and secondary color are first and then the rest is sorted as
    //    every color is the most different previous one
    palette.sort((colorA, colorB) => {
        if (colorA === primaryColor) {
            return -1;
        }
        if (colorB === primaryColor) {
            return 1;
        }
        if (colorA === secondaryColor) {
            return -1;
        }
        if (colorB === secondaryColor) {
            return 1;
        }

        const distanceA = palette

            .filter((color) => color !== colorA)
            .map((color) => colorDistanceSquared(colorA.value, color.value))
            .reduce((sum, distance) => sum + distance, 0);
        const distanceB = palette
            .filter((color) => color !== colorB)
            .map((color) => colorDistanceSquared(colorB.value, color.value))
            .reduce((sum, distance) => sum + distance, 0);

        return distanceA - distanceB;
    });

    return palette.map((color) =>
        // @ts-ignore
        ({ note: color.note, ...color }),
    );
}

/**
 * TODO: Match also the last with the first color and if not matching then add last color to the palette at the end as a "separator"
 * TODO: [🧠] Should be white/black text color hardcoded as second color in palette? (NOW IT IS as secondaryColor)
 * TODO: !! Is here correct manipulation with square of distance?
 * TODO: [3] Check that there is some miminal number of colors in palette
 *
 *
 * TODO: !! [🦯] Pokud některé barvy vylučují respektive vždy beru tu první a ty ostatní blízké zahazuji
 * než narazím na nějakou další no tak tohle by mělo fungovat tím způsobem že se všechny příbuzné barvy seskupí do jednoho clusteru
 * a ten se vážení zprůměruje na základě četnosti – tím pádem například pokud je hodně odstínů šedé a nejčastější je ten nejsvětlejš
 * tak výsledná barva nebude pouze ta nejsvětlejší ale někde uprostřed více světla
 */
