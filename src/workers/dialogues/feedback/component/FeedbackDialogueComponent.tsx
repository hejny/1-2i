import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { Modal } from '../../../../components/Modal/00-Modal';
import { classNames } from '../../../../utils/classNames';
import type { LikedStatus } from '../../../../utils/hooks/useLikedStatusOfCurrentWallpaper';
import { useStyleModule } from '../../../../utils/hooks/useStyleModule';
import type { DialogueComponentProps } from '../../../lib/dialogues/interfaces/DialogueComponentProps';
import type { FeedbackDialogueRequest } from '../types/FeedbackDialogueRequest';
import type { FeedbackDialogueResponse } from '../types/FeedbackDialogueResponse';

/**
 * Feedback dialogue offers a simple yes/no question to the user.
 *
 * @private use only within feedbackDialogue function
 */
export function FeedbackDialogueComponent(
    props: DialogueComponentProps<FeedbackDialogueRequest, FeedbackDialogueResponse>,
) {
    const {
        request: { message, subject, defaultLikedStatus, defaultNote, notePlaceholder, priority = 0 },
        respond,
    } = props;

    const styles = useStyleModule(import('./FeedbackDialogueComponent.module.css'));

    const [likedStatus, setLikedStatus] = useState<keyof typeof LikedStatus>(defaultLikedStatus);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const submit = useCallback(() => {
        respond({ likedStatus, note: textareaRef.current!.value });
    }, [respond, likedStatus, textareaRef]);

    return (
        <Modal title={message} size="MEDIUM" isCloseable closeModal={submit}>
            <div className={styles.inputLayer}>
                <div className={styles.likedStatus}>
                    {/* 
                    !!! <LikedStatusInput/>
                    */}
                    <button
                        className={classNames(/*'button',*/ styles.option)}
                        title={`I love ${subject}!`}
                        data-active={likedStatus === 'LOVE'}
                        onClick={() =>
                            void setLikedStatus(
                                likedStatus !== 'LOVE'
                                    ? 'LOVE'
                                    : 'NONE' /* <- TODO: [6] Make some toggle set wrapper */,
                            )
                        }
                    >
                        <Image alt="❤" src="/icons/openmoji/2764.black.svg" width={40} height={40} /* <-[🧥] */ />
                        {/* <MarkdownContent content="❤" isUsingOpenmoji /> */}
                    </button>

                    <button
                        // TODO: Maybe also listen on double-click on mobile
                        className={classNames(/*'button',*/ styles.option)}
                        title={`I like ${subject}!`}
                        data-active={likedStatus === 'LIKE'}
                        onClick={() =>
                            void setLikedStatus(
                                likedStatus !== 'LIKE'
                                    ? 'LIKE'
                                    : 'NONE' /* <- TODO: [6] Make some toggle set wrapper */,
                            )
                        }
                    >
                        <Image alt="👍" src="/icons/openmoji/1F44D.black.svg" width={40} height={40} /* <-[🧥] */ />
                        {/* <MarkdownContent content="👍" isUsingOpenmoji /> */}
                    </button>
                    <button
                        className={classNames(/*'button',*/ styles.option)}
                        title={`I do not know what to think about ${subject}!`}
                        data-active={likedStatus === 'NEUTRAL'}
                        onClick={() =>
                            void setLikedStatus(
                                likedStatus !== 'NEUTRAL'
                                    ? 'NEUTRAL'
                                    : 'NONE' /* <- TODO: [6] Make some toggle set wrapper */,
                            )
                        }
                    >
                        <Image alt="😐" src="/icons/openmoji/1F610.black.svg" width={40} height={40} /* <-[🧥] */ />
                        {/* <MarkdownContent content="😐" isUsingOpenmoji /> */}
                    </button>
                    <button
                        className={classNames(/*'button',*/ styles.option)}
                        title={`I dislike ${subject}!`}
                        data-active={likedStatus === 'DISLIKE'}
                        onClick={() =>
                            void setLikedStatus(
                                likedStatus !== 'DISLIKE'
                                    ? 'DISLIKE'
                                    : 'NONE' /* <- TODO: [6] Make some toggle set wrapper */,
                            )
                        }
                    >
                        <Image alt="👎" src="/icons/openmoji/1F44E.black.svg" width={40} height={40} /* <-[🧥] */ />
                        {/* <MarkdownContent content="👎" isUsingOpenmoji /> */}
                    </button>
                </div>

                <textarea
                    autoFocus
                    ref={textareaRef}
                    defaultValue={defaultNote || ''}
                    placeholder={notePlaceholder || ''}
                    className={styles.answer}
                    onKeyDown={(event) => {
                        // TODO: DRY [1]
                        if (!(event.key === 'Enter' && event.shiftKey === false && event.ctrlKey === false)) {
                            return;
                        }

                        submit();
                    }}
                />
                <button className={styles.submit} onClick={submit}>
                    Submit feedback on {subject} {/* <- !! Translate */}
                </button>
            </div>
        </Modal>
    );
}

FeedbackDialogueComponent.dialogueTypeName = 'FEEDBACK';

/**
 * TODO: !! Use some smaller format of <Modal/>
 */
