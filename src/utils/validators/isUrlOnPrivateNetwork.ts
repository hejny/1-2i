import { string_url } from '../typeAliases';
import { isHostnameOnPrivateNetwork } from './isHostnameOnPrivateNetwork';

/**
 * Checks if an IP address or hostname is reserved for private networks or localhost.
 *
 * Note: There are two simmilar functions:
 * - `isUrlOnPrivateNetwork` *(this one)* which tests full URL
 * - `isHostnameOnPrivateNetwork` which tests just hostname
 *
 * @param {string} ipAddress - The IP address to check.
 * @returns {boolean} Returns true if the IP address is reserved for private networks or localhost, otherwise false.
 */
export function isUrlOnPrivateNetwork(url: URL | string_url): boolean {
    if (typeof url === 'string') {
        url = new URL(url);
    }
    return isHostnameOnPrivateNetwork(url.hostname);
}
