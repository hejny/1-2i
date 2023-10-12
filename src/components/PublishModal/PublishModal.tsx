import { useRouter } from 'next/router';
import { FormEvent, useCallback, useMemo, useState } from 'react';
import { classNames } from '../../utils/classNames';
import { computeWallpaperDomainPart } from '../../utils/computeWallpaperDomainPart';
import { useCurrentWallpaper } from '../../utils/hooks/useCurrentWallpaper';
import { provideClientEmail } from '../../utils/supabase/provideClientEmail';
import { string_domain, string_email } from '../../utils/typeAliases';
import { DomainStatusText } from '../Domains/DomainStatusText/DomainStatusText';
import { GetTheWebTabs } from '../GetTheWebTabs/GetTheWebTabs';
import { MarkdownContent } from '../MarkdownContent/MarkdownContent';
import { Modal } from '../Modal/00-Modal';
import stylesForSelect from '../Select/Select.module.css';
import { PublishText } from './PublishLink';
import styles from './PublishModal.module.css';
import { publishWebsite } from './publishWebsite';

/**
 * Renders the main publish modal
 */
export function PublishModal() {
    const router = useRouter();
    const [wallpaper] = useCurrentWallpaper();
    const defaultDomain =
        useMemo(() => computeWallpaperDomainPart(wallpaper.content), [wallpaper.content]) + '.webgpt.cz';
    const [domain, setDomain] = useState<string_domain>(defaultDomain);
    const [isPublishing, setPublishing] = useState(false);
    const [email, setEmail] = useState<string_email>(provideClientEmail() || '');

    const submitHandler = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (isPublishing) {
                alert(`Please wait until the website is published`);
                return;
            }

            setPublishing(true);

            try {
                await publishWebsite({
                    wallpaper,
                    domain,
                    email,
                });
                router.push({
                    // TODO: [🕙] Make some util getWallpaperLink
                    pathname: '/[wallpaperId]',
                    query: {
                        wallpaperId: wallpaper.id,
                    },
                });
            } finally {
                setPublishing(false);
            }
        },
        [isPublishing, wallpaper, domain, email, setPublishing, router],
    );

    return (
        <Modal title={<PublishText />} isCloseable>
            <GetTheWebTabs />

            <form className={styles.settings} onSubmit={submitHandler}>
                <label className={styles.setting}>
                    <div className={styles.key}>Site url:</div>
                    <input
                        
                        className={classNames(styles.value, stylesForSelect.option)}
                        disabled={isPublishing}
                        required
                        defaultValue={domain || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            setDomain(value);
                        }}
                        placeholder={defaultDomain}
                        type="text"
                        title={`Enter a domain name like ${defaultDomain}`}
                    />
                    <DomainStatusText {...{ domain }} className={styles.domainStatus} />
                </label>

                <label className={styles.setting}>
                    <div className={styles.key}>Your Email:</div>
                    <input
                        // TODO: !! Less visible + warning that email is your key
                        className={classNames(styles.value, stylesForSelect.option)}
                        disabled={isPublishing}
                        required
                        defaultValue={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                        placeholder="john@smith.org"
                        type="email"
                    />
                </label>
                {/*
                <label className={styles.setting}>
                    <div className={styles.key}>Company / project:</div>
                    <input
                        className={classNames(styles.value, stylesForSelect.option)}
                        defaultValue={projectName}
                        onChange={(e) => {
                            setProjectName(e.target.value);
                        }}
                        placeholder="Pineapple"
                    />
                </label>
                */}

                <label className={classNames(styles.setting, styles.settingCentered)}>
                    <button
                        className={classNames('button', styles.getTheWeb)}
                        disabled={isPublishing}
                        style={{
                            background: `url(${wallpaper.src})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                        type="submit"
                    >
                        <MarkdownContent content="Get the web 🚀" isUsingOpenmoji />
                    </button>
                </label>

                <pre style={{ display: 'none', width: 200, height: 200, overflow: 'scroll' }}>
                    {JSON.stringify({ wallpaperId: wallpaper.id, domain, email }, null, 4)}
                </pre>
            </form>
        </Modal>
    );
}

/**
 * TODO: [🧠] Maybe allow here ask for support request
 */
