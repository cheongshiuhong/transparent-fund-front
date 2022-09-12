// Types
import { FC, ReactElement } from 'react';
import { WrapperProps } from '@interfaces/general';

// Libraries
import { Popup } from 'reactjs-popup';

type ModalProps = WrapperProps & {
    isOpen: boolean;
    onClose?: () => void;
    overlayStyle?: { [key: string]: number | string };
    contentStyle?: { [key: string]: number | string };
    closeOnDocumentClick?: boolean;
    closeOnEscape?: boolean;
};

/**
 * The modal component.
 *
 * @param {ModalProps} props - The children to present in a modal.
 * @returns {ReactElement} - The modal component presenting the children.
 */
const Modal: FC<ModalProps> = ({
    children,
    isOpen,
    onClose,
    overlayStyle,
    contentStyle,
    closeOnDocumentClick,
    closeOnEscape
}: ModalProps): ReactElement => {
    return (
        <Popup
            open={isOpen}
            closeOnDocumentClick={closeOnDocumentClick === undefined ? true : closeOnDocumentClick}
            closeOnEscape={closeOnEscape === undefined ? true : closeOnEscape}
            onClose={onClose ? onClose : () => null}
            overlayStyle={{
                position: 'absolute',
                top: '0',
                backgroundColor: 'rgba(0,0,0,0.8)',
                ...overlayStyle
            }}
            contentStyle={{
                zIndex: '50',
                margin: 'auto',
                width: '70%',
                maxWidth: '560px',
                minWidth: '360px',
                ...contentStyle
            }}>
            <div className="h-full w-full px-6 py-8 bg-white rounded-md shadow-lg">{children}</div>
        </Popup>
    );
};

export default Modal;
