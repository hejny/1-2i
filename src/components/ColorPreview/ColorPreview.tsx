import { classNames } from '../../utils/classNames';
import { Color } from '../../utils/color/Color';
import { textColor } from '../../utils/color/operators/furthest';
import { WithTake } from '../../utils/take/interfaces/ITakeChain';
import styles from './ColorPreview.module.css';

interface ColorPreviewProps {
    color: WithTake<Color> | 'HUE_CIRCLE';
    className?: string;
}

/**
 * @@
 */
export function ColorPreview(props: ColorPreviewProps) {
    const { className, color } = props;

    return (
        <div
            className={classNames(className, styles.ColorPreview)}
            style={
                color === 'HUE_CIRCLE'
                    ? {
                          backgroundColor: 'red',
                          border: `2px solid red`,
                          outline: `2px solid red`,
                      }
                    : {
                          backgroundColor: color.toHex(),
                          border: `2px solid ${color.then(textColor).toHex()}`,
                          outline: `2px solid ${color.toHex()}`,
                      }
            }
        ></div>
    );
}

/**
 * TODO: !!!! Hue circle
 */
