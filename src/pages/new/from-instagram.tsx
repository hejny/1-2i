import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import spaceTrim from 'spacetrim';
import { INSTAGRAM_PLACEHOLDERS, IS_VERIFIED_EMAIL_REQUIRED } from '../../../config';
import webgptLogo from '../../../public/logo/webgpt.white.svg';
import { StaticAppHead } from '../../components/AppHead/StaticAppHead';
import { CopilotInput } from '../../components/CopilotInput/CopilotInput';
import { LanguagePickerWithHint } from '../../components/LanguagePicker/LanguagePickerWithHint';
import { Center } from '../../components/SimpleLayout/Center';
import { joinTasksProgress } from '../../components/TaskInProgress/task/joinTasksProgress';
import { WebgptTaskProgress } from '../../components/TaskInProgress/task/WebgptTaskProgress';
import { TasksInProgress } from '../../components/TaskInProgress/TasksInProgress';
import { Translate } from '../../components/Translate/Translate';
import styles from '../../styles/static.module.css' /* <- TODO: [🤶] Get rid of page css and only use components (as <StaticLayout/>) */;
import { useLocale } from '../../utils/hooks/useLocale';
import { normalizeInstagramName } from '../../utils/normalizeInstagramName';
import { randomItem } from '../../utils/randomItem';
import { fetchImage } from '../../utils/scraping/fetchImage';
import { shuffleItems } from '../../utils/shuffleItems';
import { provideClientId } from '../../utils/supabase/provideClientId';
import { string_business_category_name } from '../../utils/typeAliases';
import { createNewWallpaperForBrowser } from '../../workers/functions/createNewWallpaper/workerify/createNewWallpaperForBrowser';
import type { ScrapeInstagramUserResponse } from '../api/scrape/scrape-instagram-user';

export default function NewWallpaperFromInstagramPage() {
    const router = useRouter();
    const locale = useLocale();
    const [isRunning, setRunning] = useState(false);
    const [tasksProgress, setTasksProgress] = useState<Array<WebgptTaskProgress>>(
        [],
    ); /* <- TODO: [🌄] useTasksProgress + DRY */
    const placeholders = useMemo(() => shuffleItems(...INSTAGRAM_PLACEHOLDERS), []);

    return (
        <>
            <StaticAppHead subtitle={null} />
            <LanguagePickerWithHint />

            <div className={styles.page}>
                <main>
                    <Center>
                        <h1
                            style={{
                                transform: 'translate(0,-20px)',
                            }}
                        >
                            <Image alt="WebGPT logo" src={webgptLogo} />
                        </h1>
                        <CopilotInput
                            {...{ placeholders }}
                            label={
                                <>
                                    {/* [⛳] */}
                                    <Translate locale="en">Enter your Instagram:</Translate>
                                    <Translate locale="cs">Zadejte svůj Instagram:</Translate>
                                </>
                            }
                            onPrompt={async (prompt) => {
                                setRunning(true);
                                setTasksProgress([
                                    {
                                        // TODO: Use here taskify instead
                                        // TODO: [🧠][🚔] DEFAULT_STARTING_TASK
                                        name: 'start-worker',
                                        title: 'Spinning up',
                                        isDone: false,
                                    },
                                ]);

                                try {
                                    const instagramName = normalizeInstagramName(prompt);

                                    // TODO: Use here taskify instead
                                    setTasksProgress((tasksProgress) =>
                                        joinTasksProgress(...tasksProgress, {
                                            name: 'scrape-instagram-user',
                                            // TODO: Maybe split more granularly - scrape the data vs download the images
                                            title: 'Looking on Instagram',
                                            isDone: false,
                                        }),
                                    );

                                    const reponse = await fetch(
                                        // TODO: [🌺][3] Make some wrapper for this apiClient to construct requests + parse them and handle errors
                                        `/api/scrape/scrape-instagram-user?clientId=${
                                            /* <- TODO: [⛹️‍♂️] Send clientId through headers */ await provideClientId({
                                                isVerifiedEmailRequired: IS_VERIFIED_EMAIL_REQUIRED.CREATE,
                                            })
                                        }&instagramName=${encodeURIComponent(instagramName)}`,
                                    );
                                    const { instagramUser } = (await reponse.json()) as ScrapeInstagramUserResponse;

                                    console.info(`👤 Scraped Instagram user @${instagramName}`, instagramUser);

                                    const title = instagramUser.full_name;
                                    const description = instagramUser.biography;
                                    const businessCategory: string_business_category_name = (
                                        instagramUser.business_category_name ||
                                        instagramUser.category_enum ||
                                        instagramUser.category_name ||
                                        ''
                                    ).toLowerCase();
                                    /* <- TODO: `category_name` is for some reason in indonesian, fix it in API or if it is impossible, translate it and USE only `category_name` in future 
                                                Make it singular - not "restaurants" but "restaurant" 
                                                Maybe use `category_enum` instead/alongside `category_name` */

                                    console.info(`👤 Key information about @${instagramName}`, {
                                        title,
                                        businessCategory,
                                    });

                                    // TODO:> const logoImageRaw = await fetchImage(instagramUser.profile_pic_url_hd);
                                    const randomTimelinePost = randomItem(
                                        ...instagramUser.edge_owner_to_timeline_media.edges,
                                    ).node;
                                    const randomTimelineImage = await fetchImage(randomTimelinePost.display_url);

                                    // logImage(randomTimelineImage);

                                    // TODO: Use here taskify instead
                                    setTasksProgress((tasksProgress) =>
                                        joinTasksProgress(...tasksProgress, {
                                            name: 'scrape-instagram-user',
                                            isDone: true,
                                        }),
                                    );

                                    const { wallpaperId } = await createNewWallpaperForBrowser(
                                        {
                                            locale,
                                            title,
                                            author: await provideClientId({
                                                isVerifiedEmailRequired: IS_VERIFIED_EMAIL_REQUIRED.CREATE,
                                            }),
                                            wallpaperImage: randomTimelineImage,
                                            idea: {
                                                en: spaceTrim(
                                                    (block) => `
                                                        ${title}
                                                        ${block(description)}
                                                    `,
                                                ),
                                            }[/*locale*/ 'en'],
                                            addSections: [
                                                // TODO: Instagram AI component gallery
                                                // TODO: Add map from business_address_json
                                            ],
                                            links: [
                                                {
                                                    title: 'Instagram',
                                                    url: `https://instagram.com/${instagramName}/`,
                                                },
                                                // TODO: Scrape bio_links
                                                // TODO: Add facebook
                                                // TODO: Add phone
                                                // TODO: Add email
                                                // TODO: Add external_url
                                                // TODO: Add business_address_json
                                                // TODO: Scrape biography_with_entities
                                            ],

                                            // TODO: Maybe pass posts texts to give a flavour of the account and its style
                                        },
                                        (newTaskProgress: WebgptTaskProgress) => {
                                            console.info('☑', newTaskProgress);
                                            setTasksProgress((tasksProgress) =>
                                                joinTasksProgress(...tasksProgress, newTaskProgress),
                                            );
                                        },
                                    );
                                    router.push(
                                        `/${wallpaperId}` /* <- Note: Not passing ?scenario=from-something here because FROM_SOMETHING is default scenario */,
                                    );
                                    // Note: No need to setWorking(false); because we are redirecting to another page
                                    //       [0] OR to do it in the finally block
                                } catch (error) {
                                    if (!(error instanceof Error)) {
                                        throw error;
                                    }

                                    alert(
                                        // <- TODO: Use here alertDialogue
                                        spaceTrim(
                                            // TODO: [🦻] DRY User error message
                                            (block) => `
                                                Sorry for the inconvenience 😔
                                                Something went wrong while making your website.
                                                Please try it again or write me an email to me@pavolhejny.com
                                    
                                                ${block((error as Error).message)}
                                            
                                            `,
                                        ),
                                    );
                                    setRunning(false);
                                    setTasksProgress([]);
                                } // <- Note: [0] No finally block because we are redirecting to another page
                            }}
                        />
                        <Link
                            href="/"
                            style={
                                {
                                    // outline: '1px solid red'
                                }
                            }
                        >
                            <>
                                {/* [⛳] */}
                                <Translate locale="en">I have no Instagram account</Translate>
                                <Translate locale="cs">Nemám účet na Instagramu</Translate>
                            </>
                        </Link>
                    </Center>
                </main>

                {isRunning && <TasksInProgress {...{ tasksProgress }} />}
            </div>
        </>
    );
}

/**
 * TODO: Enhance the design of the page (and in general every page with <CopilotInput/>)
 * TODO: [👐] Unite design of all /new/* pages
 * TODO: [🏍] Standardize process of getting input data for new wallpaper
 * TODO: [☃] Maybe derive isWorking from taskProgress
 */
