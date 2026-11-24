import { useState } from 'react';

// Cover art (S35, also finishes S27: size hints + lazy loading in one place).
//   src    image URL (an uploaded cover, or an avatar)
//   alt    '' when the title is written right next to the image (decorative);
//          otherwise a real description
//   label  text whose first letter is shown if the image is missing or broken
//   size   the image's natural size in px; becomes width/height so the browser
//          reserves space before the image loads (no layout jump). CSS makes
//          it fill its container as a square.
const Cover = ({ src, alt = '', label = '', size = 300, className = '', eager = false }) => {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div
                className={`cover cover-fallback ${className}`}
                role={alt ? 'img' : undefined}
                aria-label={alt || undefined}
                aria-hidden={alt ? undefined : true}
            >
                {(label || alt || '?').trim().charAt(0).toUpperCase()}
            </div>
        );
    }

    return (
        <img
            className={`cover ${className}`}
            src={src}
            alt={alt}
            width={size}
            height={size}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setFailed(true)}
        />
    );
};

export default Cover;
