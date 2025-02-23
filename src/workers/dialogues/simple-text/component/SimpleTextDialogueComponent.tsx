import { useCallback, useRef, useState } from 'react';
import type { Feedback } from '../../../../ai/recommendation/Feedback';
import { FeedbackButton } from '../../../../components/FeedbackButton/FeedbackButton';
import { Modal } from '../../../../components/Modal/00-Modal';
import { useStyleModule } from '../../../../utils/hooks/useStyleModule';
import { jsxToHtmlSimple } from '../../../../utils/jsx-html/jsxToHtmlSimple';
import type { DialogueComponentProps } from '../../../lib/dialogues/interfaces/DialogueComponentProps';
import type { SimpleTextDialogueRequest } from '../types/SimpleTextDialogueRequest';
import type { SimpleTextDialogueResponse } from '../types/SimpleTextDialogueResponse';

/**
 * Simple text dialogue offers a modal to the user to enter a (multiline) text.
 *
 * @private use only within simpleTextDialogue function
 */
export function SimpleTextDialogueComponent(
    props: DialogueComponentProps<SimpleTextDialogueRequest, SimpleTextDialogueResponse>,
) {
    const {
        request: { message, defaultValue, placeholder, isFeedbackCollected, priority = 0 },
        respond,
    } = props;

    const styles = useStyleModule(import('./SimpleTextDialogueComponent.module.css'));

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [feedback, setFeedback] = useState<Feedback | undefined>();
    const [isInFeedbackCollection, setInFeedbackCollection] = useState(false);

    const submit = useCallback(() => {
        respond({ answer: textareaRef.current!.value, feedback });
    }, [respond, textareaRef, feedback]);

    return (
        <Modal title={message} isDisabled={isInFeedbackCollection} isCloseable closeIcon="✔" onClose={submit}>
            {/* TODO: Maybe create some <OnTop><div/><div/></OnTop> component to make this type of layouts */}
            <div className={styles.inner}>
                <div className={styles.inputLayer}>
                    <textarea
                        autoFocus
                        ref={textareaRef}
                        defaultValue={defaultValue || ''}
                        placeholder={placeholder}
                        className={styles.answer}
                        onKeyDown={(event) => {
                            if (!(event.key === 'Enter' && event.shiftKey === false && event.ctrlKey === false)) {
                                return;
                            }

                            submit();
                        }}
                    />
                    <button className={styles.submit} onClick={submit}>
                        {/* <- TODO: [🕶][☘] Button visible with mobile keyboard */}
                        Submit {/* <- !! Translate */}
                    </button>
                </div>
                {isFeedbackCollected && (
                    <div className={styles.feedbackLayer}>
                        <FeedbackButton
                            subject={jsxToHtmlSimple(message)}
                            onFeedback={setFeedback}
                            onFeedbackCollection={setInFeedbackCollection}
                            className={styles.triggerFeedback}
                            {...{ priority }}
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
}

SimpleTextDialogueComponent.dialogueTypeName = 'SIMPLE_TEXT';
