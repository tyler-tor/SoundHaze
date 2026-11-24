import { useCallback, useEffect, useRef, useState } from 'react';

// Runs `load()` (a function that returns a promise, e.g. dispatching a thunk)
// when the component mounts and whenever `deps` change, and reports where it is:
//   status    'loading' | 'ready' | 'error'
//   notFound  true when the server answered 404 (or 400 for a malformed id)
//   reload()  run it again (used by the "Try again" button)
// Pages show a skeleton while status is 'loading' and nothing is cached yet.
export default function useLoad(load, deps = []) {
    const [state, setState] = useState({ status: 'loading', notFound: false });
    const loadRef = useRef(load);
    loadRef.current = load;
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setState({ status: 'loading', notFound: false });
        Promise.resolve()
            .then(() => loadRef.current())
            .then(() => {
                if (!cancelled) setState({ status: 'ready', notFound: false });
            })
            .catch((err) => {
                // csrfFetch throws the failed Response, which has a `status`.
                // 404 (missing) and 400 (a malformed id such as /albums/abc) both mean "no such page".
                if (!cancelled) setState({ status: 'error', notFound: err?.status === 404 || err?.status === 400 });
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, attempt]);

    const reload = useCallback(() => setAttempt((n) => n + 1), []);
    return { ...state, reload };
}
