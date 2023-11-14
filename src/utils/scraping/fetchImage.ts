import { IS_VERIFIED_EMAIL_REQUIRED } from '../../../config';
import { isRunningInBrowser } from '../isRunningInWhatever';
import { provideClientId } from '../supabase/provideClientId';
import { string_url_image } from '../typeAliases';

/**
 * Fetch image using proxy
 *
 * Note: This function is available ONLY in browser
 * @returns image as Blob
 */
export async function fetchImage(imageUrl: string_url_image): Promise<Blob> {
    if (!isRunningInBrowser()) {
        throw new Error(`This function is available ONLY in browser`);
    }

    const response = await fetch(
        // TODO: [🌺][3] Make some wrapper for this apiClient to construct requests + parse them and handle errors

        `/api/scrape/scrape-image?clientId=${
            /* <- TODO: [⛹️‍♂️] Send clientId through headers */

            await provideClientId({
                isVerifiedEmailRequired: IS_VERIFIED_EMAIL_REQUIRED.CREATE, // <- TODO: Is it OK to assume create stage
            })
        }`,
        { headers: { 'x-image-url': imageUrl } },
    );

    // TODO: !!!! Throw error if not image

    return await response.blob();
}
