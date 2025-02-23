import { ReactNode } from 'react';
import spaceTrim from 'spacetrim';
import { string_name } from '../../utils/typeAliases';
import { ExportComment } from './ExportComment';

interface ExportCommentedBlockProps {
    /**
     * The name of the block
     *
     * @example "Article", "Section", "Subsection", "Menu"
     */
    name: string_name;

    /**
     * This is the subject of the comment
     *
     * In live preview, this component renders ONLY the children.
     */
    children: ReactNode;

    /**
     * Optional note to be added to the block after the name
     */
    note?: string;
}
/**
 * Renders commented block of html
 *
 * In a live preview, this component will have no effect.
 * In an export, this component will be "unwraped" and the comment will be exported.
 */
export function ExportCommentedBlock(props: ExportCommentedBlockProps) {
    let { name, children, note } = props;

    return (
        <>
            <ExportComment comment={`-------------[ ${name}: ]-------------`} />
            {note && (
                <ExportComment
                    comment={spaceTrim(
                        (block) => `
                            ⏣ ${block(spaceTrim(note!))}
                        `,
                    )}
                />
            )}
            {children}
            <ExportComment comment={`-------------[ /${name} ]-------------`} />
        </>
    );
}

/**
 * TODO: Maybe in future create context of comment layer to enhance nesting
 */
