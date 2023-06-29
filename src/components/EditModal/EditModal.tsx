import '@uiw/react-markdown-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { classNames } from '../../utils/classNames';
import { textColor } from '../../utils/color/operators/furthest';
import { computeWallpaperUriid } from '../../utils/computeWallpaperUriid';
import { extractTitleFromMarkdown } from '../../utils/content/extractTitleFromMarkdown';
import { useClosePreventionSystem } from '../../utils/hooks/useClosePreventionSystem';
import { useCurrentWallpaperId } from '../../utils/hooks/useCurrentWallpaperId';
import { LikedStatus } from '../../utils/hooks/useLikedStatusOfCurrentWallpaper';
import { useObservable } from '../../utils/hooks/useObservable';
import { useWallpaperSubject } from '../../utils/hooks/useWallpaperSubject';
import { serializeColorStats } from '../../utils/image/utils/serializeColorStats';
import { getSupabaseForBrowser } from '../../utils/supabase/getSupabaseForBrowser';
import { ColorInput } from '../ColorInput/ColorInput';
import { parseKeywordsFromWallpaper } from '../Gallery/GalleryFilter/utils/parseKeywordsFromWallpaper';
import { ImagineTag } from '../ImagineTag/ImagineTag';
import { Modal, OpenModalLink } from '../Modal/Modal';
import styles from './EditModal.module.css';
import { EditModalColorAlgoritm } from './EditModalColorAlgoritm';

const MarkdownEditor = dynamic(() => import('@uiw/react-markdown-editor').then((mod) => mod.default), { ssr: false });
const EditModalDownloadButtons = dynamic(
    () => import('./EditModalDownloadButtons').then(({ EditModalDownloadButtons }) => EditModalDownloadButtons),
    {
        loading: () => <p>Loading...</p>,
    },
);

interface EditModalProps {}

/**
 * @@
 */
export function EditModal(props: EditModalProps) {
    const router = useRouter();
    const wallpaperId = useCurrentWallpaperId();
    const wallpaperSubject = useWallpaperSubject(wallpaperId);
    const { value: wallpaper } = useObservable(wallpaperSubject);
    const closePreventionSystem = useClosePreventionSystem();

    return (
        <Modal title="Editing">
            <div className={styles.section}>
                <ImagineTag>{wallpaper.prompt}</ImagineTag>
            </div>
            <div className={styles.section}>
                <EditModalColorAlgoritm />
            </div>
            <div className={classNames(styles.section, styles.palette)}>
                {wallpaper.colorStats.palette.map((color, i) => (
                    <div key={i} className={styles.paletteItem} style={{ backgroundColor: color.value.toHex() }}>
                        <ColorInput
                            defaultValue={color.value}
                            onChange={(newColor) => {
                                // TODO: !!! DO here real change of wallpaper with save and export
                                // TODO: [🧠] !! DRY [🎋]
                                // TODO: [🧠] !! Reset when switching wallpapers

                                closePreventionSystem.registerClosePrevention({
                                    canBeClosed: false /* <- TODO: Change according to if downloaded or not */,
                                });
                                document.documentElement.style.setProperty(`--palette-${i}`, newColor.toHex());
                                document.documentElement.style.setProperty(
                                    `--palette-${i}-triplet`,
                                    `${newColor.red}, ${newColor.green}, ${newColor.blue}`,
                                );
                            }}
                        />
                        <p
                            style={{
                                color: color.value.then(textColor).toHex(),
                            }}
                        >
                            {color.note}
                        </p>
                    </div>
                ))}
            </div>

            {/*
            <div className={styles.section}>
                <div>
                    averageColor:
                    <ColorBox value={wallpaper.colorStats.averageColor} />
                </div>

                {/*<pre>{JSON.stringify(wallpaper.colorStats, null, 4)}</pre>* /}
            </div>
            */}

            <div className={styles.section}>
                <MarkdownEditor
                    className={styles.editor}
                    value={wallpaper.content}
                    onChange={(content) => {
                        closePreventionSystem.registerClosePrevention({
                            canBeClosed: false /* <- TODO: Change according to if downloaded or not */,
                        });
                        wallpaperSubject.next({ ...wallpaperSubject.value, content });
                    }}
                    // TODO: Hide fullscreen button
                    // toolbarsFilter={(tool) => tool === 'fullscreen'}
                />
            </div>

            <div className={styles.section}>
                <EditModalDownloadButtons />
                <OpenModalLink className={'button'} modal={'export'}>
                    More Download Options
                </OpenModalLink>
                <button
                    className={'button'}
                    onClick={() => {
                        (window as any).fooFunction();
                    }}
                >
                    {/* TODO: !! Remove */}
                    Invoke error
                </button>
                <button
                    className={'button'}
                    onClick={async () => {
                        // TODO: Saving (copy) logic should be in separate function

                        const { src, prompt, content, colorStats /* <- !!! Save UPDATED colorStats */ } = wallpaper;
                        const title = extractTitleFromMarkdown(content) || 'Untitled';
                        const keywords = Array.from(parseKeywordsFromWallpaper({ prompt, content }));
                        const newAnonymousWallpaper = {
                            parent: wallpaperId,
                            src,
                            prompt,
                            colorStats,
                            content,
                            title,
                            keywords,
                        };
                        const newWallpaper = {
                            id: computeWallpaperUriid(newAnonymousWallpaper),
                            ...newAnonymousWallpaper,
                            colorStats: serializeColorStats(newAnonymousWallpaper.colorStats),
                        };

                        const insertResult = await getSupabaseForBrowser().from('Wallpaper').insert(newWallpaper);

                        // TODO: !! Util isInsertSuccessfull (status===201)
                        console.log({ newWallpaper, insertResult });

                        const key = `likedStatus_${newWallpaper.id}`;
                        if (!window.localStorage.getItem(key)) {
                            window.localStorage.setItem(key, 'LIKE' satisfies keyof typeof LikedStatus);
                        }

                        window.open(`/showcase/${newWallpaper.id}`, '_blank');
                    }}
                >
                    {/* TODO: !! Remove */}
                    Save
                </button>

                <Link
                    className={'button'}
                    href={{
                        pathname: '/showcase/[wallpaper]',
                        query: {
                            wallpaper: router.query.wallpaper,
                        },
                    }}
                >
                    Done
                </Link>
            </div>
        </Modal>
    );
}

/**
 * TODO: !!!! Your content should be exportable + show immediatelly download button
 * TODO: !!! Fix unsaved changes
 * TODO: !!! Design
 * TODO: !!! [🧠] Split into info, edit and export part
 * TODO: !!! Allow to change font
 * TODO: !!! Allow to apply color-stats with different algorithms
 */
