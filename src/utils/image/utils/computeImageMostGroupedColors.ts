import { Color } from '../../color/Color';
import { areColorsEqual } from '../../color/utils/areColorsEqual';
import { forARest } from '../../forARest';
import type { WithTake } from '../../take/interfaces/ITakeChain';
import { IComputeColorstatsWork } from '../IComputeColorstatsWork';
import { IImage } from '../IImage';

/**
 * Computes the most grouped colors in an image
 *
 *
 * @param {IImage} image - The input image.
 * @returns {Promise<Array<{ value: WithTake<Color>; count: number }>>} - An array of objects containing the most grouped color and its count.
 * @throws {Error} - Throws an error if the image has no pixels.
 */
export async function computeImageMostGroupedColors(
    image: IImage,
): Promise<Array<{ value: WithTake<Color>; count: number } /* <- TODO: [⏲] DRY */>> {
    // Create a 2D array to keep track of visited pixels
    const visited = new Array(image.width).fill(null).map(() => new Array(image.height).fill(false));

    let mostGroupedColor: WithTake<Color> | null = null;
    let maxGroupSize = 0;

    // For each pixel in the image
    for (let x = 0; x < image.width; x++) {
        for (let y = 0; y < image.height; y++) {
            if (visited[x]![y]!) {
                continue;
            }

            // Use BFS to find the size of the group of pixels with the same color as the current pixel
            const color = image.getPixel({ x, y });
            const queue = [{ x, y }];
            let groupSize = 0;

            while (queue.length > 0) {
                const { x, y } = queue.shift()!;
                if (x < 0 || x >= image.width || y < 0 || y >= image.height || visited[x]![y]!) {
                    continue;
                }
                visited[x]![y]! = true;
                const pixelColor = image.getPixel({ x, y });
                if (areColorsEqual(color, pixelColor)) {
                    groupSize++;
                    queue.push({ x: x - 1, y });
                    queue.push({ x: x + 1, y });
                    queue.push({ x, y: y - 1 });
                    queue.push({ x, y: y + 1 });
                }

                await forARest<IComputeColorstatsWork>('computeImageMostGroupedColors');
            }

            // Update mostGroupedColor and maxGroupSize if necessary
            if (groupSize > maxGroupSize) {
                mostGroupedColor = color;
                maxGroupSize = groupSize;
            }

            await forARest<IComputeColorstatsWork>('computeImageMostGroupedColors');
        }
    }

    if (mostGroupedColor === null) {
        throw new Error('Image has no pixels');
    }

    return [{ value: mostGroupedColor, count: maxGroupSize }] /* <- TODO: !! List all (distant at least x) colors */;
}
