import Script from 'next/script';
import { useContext } from 'react';
import { prettifyJavascript } from '../../export/utils/prettifyJavascript';
import { ExportContext } from '../../utils/hooks/ExportContext';
import { string_javascript } from '../../utils/typeAliases';

interface InlineScriptProps {
    /**
     * Unique ID of the script
     */
    id: string;

    /**
     * The javascript to place
     *
     * Note: The javascript will be prettified and trimmed to fit nicely in the HTML
     */
    children: string_javascript;
}

/**
 * Put a script in the HTML
 */
export function InlineScript(props: InlineScriptProps) {
    const { id, children } = props;
    const { isExported } = useContext(ExportContext);

    if (!isExported) {
        // Note: The script is on dynamic react page managed by nextjs
        return <Script {...{ id, children }} />;
    } else {
        // Note: The script is on static html page placed inlined
        return <script dangerouslySetInnerHTML={{ __html: prettifyJavascript(children) }} />;
    }
}

/**
 * TODO: Use code splitting for prettifyJavascript (+ analyze other usages of prettify... utils)
 */
