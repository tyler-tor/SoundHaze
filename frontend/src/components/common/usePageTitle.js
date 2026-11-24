import { useEffect } from 'react';

// Sets the browser tab title, e.g. usePageTitle('Songs') -> "Songs | SoundHaze".
// Screen readers announce the title when it changes, and tabs become readable.
export default function usePageTitle(title) {
    useEffect(() => {
        document.title = title ? `${title} | SoundHaze` : 'SoundHaze';
    }, [title]);
}
