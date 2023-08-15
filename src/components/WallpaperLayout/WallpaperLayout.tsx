// import { Aigen } from '../../components/Aigen/Aigen';
import { useRouter } from 'next/router';
import { AigenSimple } from '../../components/Aigen/AigenSimple';
import { HeaderWallpaper } from '../../components/HeaderWallpaper/HeaderWallpaper';
import { TiledBackground } from '../../components/TiledBackground/TiledBackground';
import { FooterSection } from '../Footer/Footer';
import { Menu } from '../Menu/Menu';
import { WallpaperContentSection } from '../WallpaperContent/WallpaperContent';
import styles from './WallpaperLayout.module.css';

export function WallpaperLayout() {
    const router = useRouter();
    const isPreview = router.query.mode === 'show-thumbnail'; /* <- TODO: !! Use useMode */

    return (
        <div className={styles.page}>
            {!isPreview && <AigenSimple />}
            {/* isPreview && <Aigen /> */}

            {!isPreview && <Menu />}

            <header>
                <HeaderWallpaper />
            </header>

            <div className={styles.background}>
                <TiledBackground />
            </div>
            <main>
                <WallpaperContentSection />
                {/*<ReferencesSection variant="SHORT" />*/}
            </main>
            <footer>
                <FooterSection />
            </footer>
        </div>
    );
}

/**
 * TODO: Rename ACRY WallpaperLayout to WallpaperLayout
 * TODO: [🧠] This is not a section nor a component - figure out where to put it
 */
