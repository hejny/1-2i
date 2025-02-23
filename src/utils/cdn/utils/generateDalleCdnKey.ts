import hexEncoder from 'crypto-js/enc-hex';
import sha256 from 'crypto-js/sha256';
import type { DallePrompt } from '../../../ai/text-to-image/dalle/interfaces/DallePrompt';
import { string_uri } from '../../typeAliases';
import { nameToSubfolderPath } from './nameToSubfolderPath';

/**
 * Generates a path for the image generated by Dalle
 */

export function generateDalleCdnKey(prompt: DallePrompt, image: Buffer): string_uri {
    const hash = sha256(hexEncoder.parse(image.toString('hex'))).toString(/* hex */);
    // TODO: Array.from(parseKeywordsFromString(prompt.content)).slice(0, 3);
    return `dalle/${prompt.model}/${nameToSubfolderPath(hash).join('/')}/${hash}`;
}

/**
 * TODO: Save IDEALLY along the wallpaper LODs
 * TODO: Way how to garbage unused uploaded files
 * TODO: Probably saparate util countBufferHash
 */
