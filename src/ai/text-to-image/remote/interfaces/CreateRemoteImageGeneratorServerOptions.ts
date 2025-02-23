import type { CommonExecutionToolsOptions, string_uri, uuid } from '@promptbook/types';
import type { ImageGenerator } from '../../0-interfaces/ImageGenerator';

export interface CreateRemoteImageGeneratorServerOptions extends CommonExecutionToolsOptions {
    /**
     * Port on which the server will listen
     */
    readonly port: number;

    /**
     * Path for the Socket.io server to listen
     *
     * @default '/socket.io'
     * @example '/promptbook/socket.io'
     */
    readonly path: string_uri;

    /**
     * Provides an image generator for a given client
     */
    createImageGenerator(clientId: uuid): ImageGenerator;
}
