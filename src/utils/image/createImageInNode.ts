import jimp from 'jimp';
import { Color } from '../color/Color';
import { Image } from './Image';

/**
 * Create new Image in Node.js from local file
 *
 * @param path The path to the image file or the URL of the image
 */
export async function createImageInNode(path: string): Promise<Image> {
    // Read the image from the given path using jimp
    const jimpImage = await jimp.read(path);

    // Get the width and height of the image from jimp
    const width = jimpImage.getWidth();
    const height = jimpImage.getHeight();

    // Create an image object with the given size
    const image = new Image({ x: width, y: height });

    // Loop through all the pixels of the image and set their color in the image object
    for (let y = 0; y < image.size.y; y++) {
        for (let x = 0; x < image.size.x; x++) {
            // Get the hex value of the pixel from jimp
            const hex = jimpImage.getPixelColor(x, y).toString(16).padStart(8, '0');

            // console.log(hex);

            // Convert the hex value to a Color object using Color.fromHex()
            const color = Color.fromHex(hex);

            // Set the color of the pixel in the image object
            image.setPixel({ x, y }, color);

            // Note: Do not wait here await forARest<IComputeColorstatsWork>('createImageInNode'); - it will slow down the process and does not make sense in node
        }
    }

    // Return the image object as a promise
    return Promise.resolve(image);
}
