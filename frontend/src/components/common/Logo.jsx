// SoundHaze mark: a record veiled by two bands of fog. Pure SVG, colors come
// from the design tokens, so it follows the theme. Decorative: the wordmark
// text next to it carries the name.
const Logo = ({ size = 30 }) => (
    <svg
        className="logo-mark"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        aria-hidden="true"
        focusable="false"
    >
        <circle cx="16" cy="16" r="14" fill="var(--accent)" />
        <circle cx="16" cy="16" r="4.5" fill="var(--bg)" />
        <circle cx="16" cy="16" r="1.6" fill="var(--accent)" />
        <rect x="0" y="9" width="32" height="3.2" fill="var(--bg)" opacity="0.55" />
        <rect x="0" y="20.5" width="32" height="2.2" fill="var(--bg)" opacity="0.4" />
    </svg>
);

export default Logo;
