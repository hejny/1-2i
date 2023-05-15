import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Vector } from 'xyzt';
import { PageProps } from '.';
import { getWallpapers } from '../../scripts/utils/wallpaper/getWallpapers';
import { DebugGrid } from '../components/DebugGrid/DebugGrid';
import { TiledBackground } from '../components/TiledBackground/TiledBackground';
import { AppHead } from '../sections/00-AppHead/AppHead';
import { FooterSection } from '../sections/90-Footer/Footer';
import { TechnicalInfo } from '../sections/TechnicalInfo/TechnicalInfo';
import styles from '../styles/common.module.css';
import { WallpapersContext } from '../utils/hooks/useWallpaper';
import { hydrateWallpaper } from '../utils/hydrateWallpaper';

export default function AboutPage({ wallpapers }: PageProps) {
    return (
        <WallpapersContext.Provider
            value={wallpapers.map(hydrateWallpaper)} /* <- Is this the right place to be Provider in? */
        >
            <AppHead /*subtitle="About" /* <- TODO: !! Translate */ />

            <div className={styles.page}>
                <DebugGrid size={new Vector(5, 5)} />
                <header>
                    {/* TODO: Do some system for multiple pages */}
                    {/* <CaveSection /> */}
                </header>
                <div className={styles.background}>
                    {/* TODO: Do some system for multiple pages */}
                    <TiledBackground />
                </div>
                <main>
                    {/* <WelcomeSection variant="SIDEPAGE" /> */}
                    <TechnicalInfo />
                </main>
                <footer>
                    <FooterSection />
                </footer>
            </div>
        </WallpapersContext.Provider>
    );
}

export async function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
            wallpapers: await getWallpapers(),
        },
    };
}

/**
 * TODO: [🪒] Can be getStaticProps shared between all pages?
 * TODO: Make some menu
 * TODO: [🧈] Best way how to share page css
 * TODO: DRY with index.tsx
 * TODO: [🔗] ACRY should we use <a ...>...</a> OR <Link ...>...</Link> for external links in Next App
 */
