import { useEffect, useState } from 'react';
import { HtmlExportFile } from '../../export/HtmlExportFile';
import { Select } from '../Select/Select';
import styles from './00-FilesPreview.module.css';
import { FilePreview } from './10-FilePreview';

interface FilesPreviewProps {
    /**
     * Files to preview
     */
    files: Array<HtmlExportFile>;
}

/**
 * Renders a preview of the files
 */
export function Files(props: FilesPreviewProps) {
    const { files } = props;

    if (files.length === 0) {
        throw new Error('You must provide at least one file. when using <Files/>');
    }

    const [filename, setFilename] = useState<string>(files[0]!.pathname);
    const file = files.find((file) => file.pathname === filename);

    useEffect(() => {
        if (!file) {
            setFilename(files[0]!.pathname);
        }
    }, [files, file, setFilename]);

    if (!file) {
        return <></>;
    }

    return (
        <div className={styles.FilesPreview}>
            <div className={styles.files}>
                <Select
                    options={Object.fromEntries(files.map((file) => [file.pathname, file.pathname]))}
                    value={filename}
                    onChange={(newFilename) => setFilename(newFilename)}
                    visibleButtons={Infinity}
                />
            </div>
            <FilePreview {...{ file }} />
        </div>
    );
}
