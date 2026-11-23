import Cookies from "js-cookie";


export async function csrfFetch(url, options = {}) {

    options.method = options.method || 'GET';
    options.headers = options.headers || {};

    if (options.method.toUpperCase() !== "GET") {
        if (options.headers["Content-Type"] === "multipart/form-data") {
          delete options.headers["Content-Type"];
        } else {
          options.headers["Content-Type"] =
            options.headers["Content-Type"] || "application/json";
        }
        options.headers["XSRF-Token"] = Cookies.get("XSRF-TOKEN");
      }

    const res = await window.fetch(url, options);

    if(res.status >= 400) throw res;

    return res;
};

export function restoreCSRF() {
    return csrfFetch('/api/csrf/restore');
};

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
