import { useMode } from '../../utils/hooks/useMode';
import { usePage } from '../../utils/hooks/usePage';
import { useWallpaper } from '../../utils/hooks/useWallpaper';
import { string_html } from '../../utils/typeAliases';
import { activateGalleryComponents } from '../ai-components/activateGalleryComponents';
import { AiComponents } from '../AiComponents/AiComponents';
import { ExportCommentedBlock } from '../ExportComment/ExportCommentedBlock';
import { extractFontsFromContent } from '../Fonts/extractFontsFromContent';
import { Fonts } from '../Fonts/Fonts';
import { Content } from '../MarkdownContent/Content';
import { Section } from '../Section/Section';
import { getPageContent } from './getPageContent';
import styles from './ShowcaseArticle.module.css';

/**
 * @@@
 */
export function ShowcaseArticleSection() {
    const { isEditable } = useMode();
    const [{ content }, modifyWallpaper] = useWallpaper();
    const page = usePage();

    if (page !== 'index') {
        const pageContent = getPageContent(page);

        // TODO: !!!! Add back button to pageContent
        return (
            <Section id="home" className={styles.Article}>
                <Fonts
                    fonts={extractFontsFromContent(pageContent)}
                    // TODO: !!!! [👩‍🦱] Fonts
                />

                <AiComponents usedComponents={[activateGalleryComponents]}>
                    <ExportCommentedBlock name="Content">
                        <Content
                            isusingFonts
                            isUsingOpenmoji={
                                false /* <- TODO: [🧠] Some better way how to use Openmoji with editable capability */
                            }
                            content={pageContent}
                        />
                    </ExportCommentedBlock>
                </AiComponents>
            </Section>
        );
    }

    const onHtmlChange = !isEditable
        ? undefined
        : async (newContent: string_html) => {
              modifyWallpaper((modifiedWallpaper) => {
                  modifiedWallpaper.content = newContent;
                  modifiedWallpaper.saveStage = 'EDITED';
                  return modifiedWallpaper;
              });
          };

    return (
        <Section id="home" className={styles.Article}>
            {/*
            TODO:
            <h1 className={styles.handritten}>
                <HandwrittenText color={skin.highlightedTextColor}>{wallpaper.title}</HandwrittenText>
            </h1>
            */}

            <Fonts fonts={extractFontsFromContent(content)} />

            <ExportCommentedBlock name="Content">
                <Content
                    isusingFonts
                    isUsingOpenmoji={
                        false /* <- TODO: [🧠] Some better way how to use Openmoji with editable capability */
                    }
                    {...{ content, isEditable, onHtmlChange }}
                />
            </ExportCommentedBlock>
        </Section>
    );
}

/**
 * TODO: isHashUsed + test it and put into menu + some way to return existing hashes
 * TODO: [🎐] Some markdown can not be converted back from html - use fallback to pure html content
 * TODO: !!! Name this showcaseContentSection
 * TODO: [🧬] !! Fake generating - write tokenized text
 * TODO: !! [👕] Allow to edit the header position + other things
 * TODO: !! This should be really named ShowcaseSection because it cointains mere then welcome
 * TODO: !! Allow html content
 * TODO: Allow templating systems
 */
