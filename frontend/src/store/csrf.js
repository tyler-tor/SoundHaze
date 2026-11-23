// CSRF handling (S20). The backend uses the "double-submit" pattern:
// GET /api/csrf/restore returns { csrfToken } and sets a matching httpOnly
// cookie. Every non-GET request must send the token in the X-CSRF-Token
// header. The token is kept in memory here (not in a readable cookie).
// It is tied to the login, so restoreCSRF() runs again after login, signup
// and logout (see store/session.js).

let csrfToken = null;
let pendingRestore = null;

// Fetch a fresh CSRF token. Concurrent callers share one request.
export function restoreCSRF() {
    if (!pendingRestore) {
        pendingRestore = window
            .fetch('/api/csrf/restore', { credentials: 'same-origin' })
            .then(async (res) => {
                if (!res.ok) throw res;
                const data = await res.json();
                csrfToken = data.csrfToken;
                return csrfToken;
            })
            .finally(() => {
                pendingRestore = null;
            });
    }
    return pendingRestore;
}

const isCsrfError = async (res) => {
    if (res.status !== 403) return false;
    try {
        const data = await res.clone().json();
        return data && data.title === 'Invalid CSRF token';
    } catch (e) {
        return false;
    }
};

export async function csrfFetch(url, options = {}, retried = false) {
    const method = (options.method || 'GET').toUpperCase();
    const headers = { ...(options.headers || {}) };

    if (method !== 'GET') {
        if (headers['Content-Type'] === 'multipart/form-data') {
            // Let the browser set the multipart boundary itself.
            delete headers['Content-Type'];
        } else {
            headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        }
        if (!csrfToken) await restoreCSRF();
        headers['X-CSRF-Token'] = csrfToken;
    }

    const res = await window.fetch(url, { ...options, method, headers, credentials: 'same-origin' });

    // The token can go stale (e.g. the login cookie expired). Get a new one
    // and try exactly once more.
    if (method !== 'GET' && !retried && (await isCsrfError(res))) {
        await restoreCSRF();
        return csrfFetch(url, options, true);
    }

    if (res.status >= 400) throw res;

    return res;
}

// Turn a failed request into a list of messages to show the user.
// csrfFetch throws the fetch Response for any status >= 400, and the API
// sends errors as { title, message, errors: [...] }.
export async function getErrorMessages(res) {
    if (res && typeof res.json === 'function') {
        try {
            const data = await res.json();
            if (data && Array.isArray(data.errors) && data.errors.length) return data.errors;
            if (data && data.message) return [data.message];
        } catch (e) {
            // body was not JSON; fall through to the generic message
        }
        return [`Request failed (${res.status}). Please try again.`];
    }
    return ['Something went wrong. Please check your connection and try again.'];
}
