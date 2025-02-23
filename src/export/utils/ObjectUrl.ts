import { IDestroyable, ITeardownLogic, Registration } from 'destroyable';
import { string_url } from '../../utils/typeAliases';

/**
 * Converts Blob, File or MediaSource to url using URL.createObjectURL
 */
export class ObjectUrl extends Registration implements IDestroyable {
    private constructor(teardownLogic: ITeardownLogic, public readonly src: string_url) {
        super(teardownLogic);
    }

    /**
     * Creates ObjectUrl
     * DO NOT forget to call destroy() when you are done with it
     */
    public static fromBlob(source: Blob | File | MediaSource): ObjectUrl {
        const src = URL.createObjectURL(source);

        return new ObjectUrl(() => {
            URL.revokeObjectURL(src);
        }, src);
    }

    /**
     * Creates ObjectUrl:
     * 1) With functionality for Blobs, Files or MediaSources
     * 2) Just a wrapper for string urls
     *
     * DO NOT forget to call destroy() when you are done with it
     */
    public static fromBlobOrUrl(source: Blob | File | MediaSource | URL | string_url): ObjectUrl {
        if (typeof source === 'string' || source instanceof URL /* <- TODO: Probably check isValidUrl */) {
            return new ObjectUrl(() => {
                // Note: Nothing to do here
            }, source.toString());
        } else {
            return ObjectUrl.fromBlob(source);
        }
    }

    /**
     * Gets object url as string
     * @alias src
     */
    public get href(): string_url {
        return this.src;
    }

    /**
     * Gets object url as URL object
     */
    public get url(): URL {
        return new URL(this.src);
    }
}
