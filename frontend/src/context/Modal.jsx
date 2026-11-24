import React, { useContext, useRef, useState, useEffect, useId } from 'react';
import ReactDom from 'react-dom';
import { HiX } from 'react-icons/hi';
import './Modal.css';

const ModalContext = React.createContext();

export const ModalProvider = ({children}) => {
    const modalRef = useRef();
    const [value, setValue] = useState();

    useEffect(() => {
        setValue(modalRef.current);
    }, [])
    return (
        <>
            <ModalContext.Provider value={value}>
                {children}
            </ModalContext.Provider>
            <div ref={modalRef} />
        </>
    )
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Accessible dialog (S31):
//  - role="dialog" + aria-modal + aria-labelledby (the visible `title`)
//  - Escape and the Close button (and a click on the dim background) close it
//  - focus moves into the dialog when it opens, Tab/Shift+Tab stay inside it,
//    and focus returns to the button that opened it when it closes
//  - everything behind it is made `inert` (not focusable, hidden from screen
//    readers) and the page does not scroll while it is open
export const Modal = ({ onClose, title, children }) => {
    const modalNode = useContext(ModalContext);
    const panelRef = useRef(null);
    const titleId = useId();

    // Always call the latest onClose without re-running the effect below.
    const onCloseRef = useRef(onClose);
    useEffect(() => { onCloseRef.current = onClose; });

    useEffect(() => {
        if (!modalNode) return;

        const opener = document.activeElement;
        const panel = panelRef.current;

        // Make the rest of the page inert while the dialog is open.
        const siblings = [...modalNode.parentElement.children].filter((el) => el !== modalNode && !el.hasAttribute('data-persist'));
        siblings.forEach((el) => el.setAttribute('inert', ''));
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // Start on the first form field, or on the Close button.
        const first = panel.querySelector('input, select, textarea') || panel.querySelector(FOCUSABLE);
        (first || panel).focus();

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onCloseRef.current();
                return;
            }
            if (e.key !== 'Tab') return;
            const items = [...panel.querySelectorAll(FOCUSABLE)];
            if (items.length === 0) {
                e.preventDefault();
                return;
            }
            const firstItem = items[0];
            const lastItem = items[items.length - 1];
            if (e.shiftKey && (document.activeElement === firstItem || document.activeElement === panel)) {
                e.preventDefault();
                lastItem.focus();
            } else if (!e.shiftKey && document.activeElement === lastItem) {
                e.preventDefault();
                firstItem.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            siblings.forEach((el) => el.removeAttribute('inert'));
            document.body.style.overflow = previousOverflow;
            // Give focus back to what opened the dialog (if it is still on the page).
            if (opener && document.contains(opener) && typeof opener.focus === 'function') {
                opener.focus();
            }
        };
    }, [modalNode]);

    if (!modalNode) return null;

    return ReactDom.createPortal(
        <div id="modal">
            <div id="modal-background" onClick={onClose} />
            <div
                id="modal-content"
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
            >
                <div className="modal-head">
                    <h2 id={titleId} className="modal-title">{title}</h2>
                    <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
                        <HiX aria-hidden="true" />
                    </button>
                </div>
                {children}
            </div>
        </div>,
        modalNode
    )
}

export default ModalProvider;
