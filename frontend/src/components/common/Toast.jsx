import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { HiX } from 'react-icons/hi';

// Toasts (S33): short messages that appear above the player and disappear by
// themselves. They replace window.alert() for results of actions
// ("Song deleted.", "You do not have access to ..."), and are announced to
// screen readers: errors immediately (role="alert"), the rest politely.
//
//   const toast = useToast();
//   toast.success('Song deleted.');
//   toast.error('Song couldn\'t be found.');

const ToastContext = createContext(null);

// Without a provider (for example in a test) every call quietly does nothing.
const NOOP = { notify() {}, success() {}, error() {}, dismiss() {} };

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(0);

    const dismiss = useCallback((id) => {
        setToasts((list) => list.filter((t) => t.id !== id));
    }, []);

    const notify = useCallback((message, { type = 'info', duration = 5000 } = {}) => {
        const id = ++nextId.current;
        setToasts((list) => [...list, { id, message, type }]);
        if (duration) window.setTimeout(() => dismiss(id), duration);
        return id;
    }, [dismiss]);

    const value = useMemo(() => ({
        notify,
        success: (message) => notify(message, { type: 'success' }),
        error: (message) => notify(message, { type: 'error', duration: 9000 }),
        dismiss
    }), [notify, dismiss]);

    const errors = toasts.filter((t) => t.type === 'error');
    const others = toasts.filter((t) => t.type !== 'error');

    const renderToast = (t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
            <p>{t.message}</p>
            <button type="button" className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss message">
                <HiX aria-hidden="true" />
            </button>
        </div>
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* data-persist: stays usable while a modal makes the rest of the page inert */}
            <div className="toast-region" data-persist="">
                <div role="status" aria-live="polite">{others.map(renderToast)}</div>
                <div role="alert">{errors.map(renderToast)}</div>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext) || NOOP;
