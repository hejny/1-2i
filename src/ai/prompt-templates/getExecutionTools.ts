import { CallbackInterfaceTools } from '@promptbook/core';
import { JavascriptEvalExecutionTools } from '@promptbook/execute-javascript';
import { RemoteNaturalExecutionTools } from '@promptbook/remote-client';
import type { ExecutionTools } from '@promptbook/types';
import spaceTrim from 'spacetrim';
import { IS_DEVELOPMENT, NEXT_PUBLIC_PROMPTBOOK_SERVER_URL } from '../../../config';
import { isRunningInBrowser, isRunningInWebWorker } from '../../utils/isRunningInWhatever';
import { getSupabaseForWorker } from '../../utils/supabase/getSupabaseForWorker';
import { Database } from '../../utils/supabase/types';
import { uuid } from '../../utils/typeAliases';
import { simpleTextDialogue } from '../../workers/dialogues/simple-text/simpleTextDialogue';

/**
 * Theese are tools for PTP execution
 * Internal cache for getPtpToolsForWorker
 *
 * @private
 * @singleton
 */
let executionTools: ExecutionTools;

/**
 * Get PTP execution tools
 *
 * Note: Tools are cached, so it's safe to call this function multiple times
 * Note: This function is available ONLY in browser or worker
 *
 * @returns ExecutionTools
 */
export function getExecutionTools(clientId: uuid): ExecutionTools {
    if (!isRunningInWebWorker() && !isRunningInBrowser()) {
        throw new Error('This function is available ONLY in browser or worker');
    }

    if (!executionTools) {
        const isVerbose = IS_DEVELOPMENT;

        executionTools = {
            natural: new RemoteNaturalExecutionTools({
                isVerbose,
                remoteUrl: NEXT_PUBLIC_PROMPTBOOK_SERVER_URL,
                path: '/promptbook/socket.io',
                clientId,
            }),
            script: [
                new JavascriptEvalExecutionTools(
                    /* <- TODO: !! Change to JavascriptExecutionTools */ {
                        isVerbose: false /* <- Note: Only natural execution tools should be verbose */,
                    },
                ),
            ],
            userInterface: new CallbackInterfaceTools({
                isVerbose,
                async callback(options) {
                    // TODO: !! Make util promptDialogueRequired
                    let answer: null | string = null;

                    // TODO: Configure how many retries
                    for (let i = 0; i < 3; i++) {
                        const response = await simpleTextDialogue({
                            ...options,
                            message: i === 0 ? options.prompt : options.prompt + ` (You need to put answer)`,

                            // TODO: !! isRequired instead of `for (let i = 0; i < 3; i++) {`
                            isFeedbackCollected: true,
                        });

                        // TODO: [🧠][👨‍⚕️] The problem with feedback returned together with answer is that when user cancels the dialogue, the feedback is not recorded

                        const feedbackInsertData: Database['public']['Tables']['PromptbookFeedback']['Insert'] = {
                            clientId,
                            likedStatus: null,
                            defaultValue: options.defaultValue,
                            value: response.answer,
                            note: null,

                            // <- TODO: [📉] There should be link to ptbkUrl which created  the defaultValue
                            // <- TODO: [💹] There should be link/id/reference to wallpaper which is the dialogue for
                            // <- TODO: [💹] There should be link/id/reference to PromptExecution which created the defaultValue
                        };

                        if (response.feedback) {
                            feedbackInsertData.likedStatus = response.feedback.likedStatus;
                            feedbackInsertData.note = response.feedback.note;
                        }

                        // Note: We do not want to wait for the insert to the database
                        /* not await */ getSupabaseForWorker()
                            .from('PromptbookFeedback')
                            .insert(feedbackInsertData)
                            .then((insertResult) => {
                                // TODO: !! Util isInsertSuccessfull (status===201)
                                console.info('Feedback insert', { insertResult });
                            });

                        answer = response.answer;

                        if (answer !== null && spaceTrim(answer) !== '') {
                            break;
                        }
                    }

                    if (answer === null) {
                        throw new Error('User cancelled prompt or provided empty answers');
                    }

                    return answer;
                },
            }),
        };
    }

    return executionTools;
}

/**
 * TODO: [🧠] Maybe cache every clientId
 */
