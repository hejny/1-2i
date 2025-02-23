import { Color, string_color } from '../../color/Color';
import { forARest } from '../../forARest';
import type { WithTake } from '../../take/interfaces/ITakeChain';
import { IComputeColorstatsWork } from '../IComputeColorstatsWork';
import { IImage } from '../IImage';

/**
 * Retrieves the unique colors from an image
 *
 *
 * @param {IImage} image - The image from which to retrieve the colors.
 * @returns {Promise<Set<WithTake<Color>>>} A promise that resolves to a set of unique colors.
 */
export async function getImageUniqueColors(image: IImage): Promise<Set<WithTake<Color>>> {
    const colors = new Set<string_color>();

    for (let x = 0; x < image.width; x++) {
        for (let y = 0; y < image.height; y++) {
            colors.add(image.getPixel({ x, y }).toHex());
            await forARest<IComputeColorstatsWork>('getImageUniqueColors');
        }
    }

    return new Set(Array.from(colors).map((color) => Color.fromHex(color)));
}
