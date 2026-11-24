import { HiPlay } from 'react-icons/hi';

// A real <button> (keyboard focusable, Enter/Space work, announced as
// "Play <title>" by screen readers) around the play icon (S32).
const PlayButton = ({ title, onClick, className = '' }) => (
    <button
        type="button"
        className={`play-btn ${className}`}
        aria-label={`Play ${title}`}
        onClick={onClick}
    >
        <HiPlay aria-hidden="true" focusable="false" />
    </button>
);

export default PlayButton;
