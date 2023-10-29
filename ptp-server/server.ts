import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

import { PromptTemplatePipelineLibrary } from '@gptp/core';
import { OpenAiExecutionTools } from '@gptp/openai';
import { createRemoteServer } from '@gptp/remote-server';
import { IS_DEVELOPMENT, OPENAI_API_KEY } from '../config';
import { SupabaseLoggerWrapperOfNaturalExecutionTools } from '../src/ai/prompt-templates/logger/SupabaseLoggerWrapperOfNaturalExecutionTools';
// [🎛] import { webgptPtpLibrary } from '../src/ai/prompt-templates/webgptPtpLibrary';

const naturalExecutionTools = new OpenAiExecutionTools({
    isVerbose: IS_DEVELOPMENT /* <- Note: [3] */,
    openAiApiKey: OPENAI_API_KEY!,
});

createRemoteServer({
    isVerbose: false /* <- Note: [3] We want server to be silent and OpenAiExecutionTools to be verbose */,
    port: 4445 /* <- TODO: Unhardcode (all ports) */,

    ptpLibrary: PromptTemplatePipelineLibrary.fromSources({
        /* <- TODO: [🎛] Use here real webgptPtpLibrary */
    }),

    createNaturalExecutionTools(clientId) {
        return new SupabaseLoggerWrapperOfNaturalExecutionTools({
            isVerbose: false /* <- Note: [3] */,
            naturalExecutionTools,
            clientId,
        });
    },
});

/**
 * TODO: [🃏] Pass here some security token to prevent DDoS
 */
