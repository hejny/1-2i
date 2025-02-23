import { useMemo } from 'react';
import { detectContentFormat } from '../../utils/content/detectContentFormat';
import { string_css_class, string_href, string_html, string_markdown } from '../../utils/typeAliases';
import { HtmlContent } from './HtmlContent';
import { MarkdownContent } from './MarkdownContent';

interface ContentProps {
    /**
     * Source markdown
     */
    content: string_html | string_markdown;

    /**
     * Optional CSS class name which will be added to root element
     */
    className?: string_css_class;

    /**
     * Are tags <!--font:Poppins--> detected and applied
     *
     * Note: This is only for markdown content
     * Note: When you use this you NEED to include the fonts into the page for example by using <ImportFonts/> component
     */
    isusingFonts?: boolean;

    /**
     * Is enhanced by using openmoji
     */
    isUsingOpenmoji?: boolean;

    /**
     * Is enhanced by adding links, normalize dashes and emojify
     */
    isEnhanced?: boolean;

    /**
     * Is editable by user
     *
     * Note: This is only for markdown content
     */
    isEditable?: boolean;

    /**
     * If set, all <a href="..."> will be mapped by this function
     */
    mapLinks?(oldHref: string_href): string_href;

    /**
     * Callback when content is changed
     * returns back pure html
     *
     * Note: This is used only when isEditable is true
     */
    onHtmlChange?: (content: string_markdown) => void;
}

/**
 * Renders given html or markdown content with optional enhancements and optional editability
 *
 * Note: This component renders either <HtmlContent/> or <MarkdownContent/> based on the content format
 *       If you want to render <MaxdownContent/> use it directly
 *
 * @param {IArticleProps} props - The props for the component
 * @returns {JSX.Element} - The JSX element for the article
 */
export function Content(props: ContentProps) {
    const { content, className, isusingFonts, isUsingOpenmoji, isEnhanced, isEditable, mapLinks, onHtmlChange } = props;

    const contentFormat = useMemo(() => detectContentFormat(content), [content]);

    return (
        <>
            {contentFormat === 'html' && (
                <HtmlContent {...{ content, className, isEditable, mapLinks, onHtmlChange }} />
            )}
            {['markdown', 'text'].includes(contentFormat) && (
                <MarkdownContent
                    {...{
                        content,
                        className,
                        isEditable,
                        mapLinks,
                        isusingFonts,
                        isUsingOpenmoji,
                        isEnhanced,
                        onHtmlChange,
                    }}
                />
            )}
        </>
    );
}

/**
 * TODO: [👼] Components <HtmlContent/>, <MarkdownContent/> and <Content> are coupled together more then they should be
 * TODO: [👩‍🦰] Allow to change fonts in <WallpaperContentSection/> or <Content/> or <HtmlContent/>
 * TODO: [👨‍🦰] Show editable hint in <WallpaperContentSection/> or <Content/> or <HtmlContent/>
 */
