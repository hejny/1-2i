import parse from 'html-react-parser';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useSsrDetection } from '../../utils/hooks/useSsrDetection';
import { string_html } from '../../utils/typeAliases';

/**
 * A function component that renders a div element with parsed HTML content ⁘
 *
 * @param {HtmlContentProps} props - The props for the component.
 * @returns {JSX.Element} A div element with parsed HTML content and optional CSS class name.
 */
interface HtmlContentProps {
    /**
     * Source html
     */
    content: string_html;

    /**
     * Optional CSS class name
     */
    className?: string;

    /**
     * Is editable by user
     */
    isEditable?: boolean;

    /**
     * Callback when content is changed
     *
     * Note: This is used only when isEditable is true
     */
    onHtmlChange?: (content: string_html) => void;
}

/**
 * Renders given html content with optional editability
 */
export function HtmlContent(props: HtmlContentProps) {
    const { content, className, isEditable, onHtmlChange } = props;

    const isServerRender = useSsrDetection();

    if (!isEditable || isServerRender) {
        const children =
            parse(
                content,
            ); /* <- Note: Using html-react-parser (not dangerouslySetInnerHTML) to avoid react hydration errors */

        return <div {...{ className }}>{children}</div>;
    }

    return <HtmlContentEditable {...{ content, className, onHtmlChange }} />;
}

/**
 * Renders given html as editable content
 *
 * @private
 */
function HtmlContentEditable(props: Omit<HtmlContentProps, 'isEditable'>) {
    const { content, className, onHtmlChange } = props;

    // Note: Using useEffect (instead of direct attributes) to keep focus during typing
    const elementRef = useRef<HTMLDivElement | null>(null);
    useLayoutEffect(() => {
        const element = elementRef.current;

        if (!element) {
            return;
        }

        if (element.innerHTML !== content) {
            element.innerHTML = content /* <- Here [3] */;
        }
    }, [content]);
    useEffect(() => {
        const element = elementRef.current;

        if (!element || !onHtmlChange) {
            return;
        }

        element.setAttribute('contentEditable', 'true');
        element.setAttribute('spellCheck', 'false');

        const inputHandler = (event: Event) => {
            const htmlContent = (event.currentTarget as HTMLDivElement).innerHTML as string_html;

            onHtmlChange(htmlContent);
        };
        element.addEventListener('input', inputHandler);

        return () => {
            element.removeEventListener('input', inputHandler);
        };
    }, [content, onHtmlChange, elementRef]);

    return (
        <div {...{ className }} ref={elementRef}>
            This will be never shown because it is immediatelly replaced here [3] in useLayoutEffect
        </div>
    );
}

/**
 * TODO: [🧠][💬] Allow to change fonts and do rich text editing
 */
