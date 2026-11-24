import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/session';
import { getErrorMessages } from '../../store/csrf';

// Demo account (seeded by backend/db/seed-data.js).
const DEMO_CREDENTIALS = { credential: 'Demo-lition', password: 'password' };

// className lets each page style the button (nav bar, welcome page, signup page).
const DemoUser = ({ className = 'btn btn-primary', children = 'Try the demo' }) => {
    const dispatch = useDispatch();

    const handleClick = async (e) => {
        e.preventDefault();
        try {
            await dispatch(loginUser(DEMO_CREDENTIALS));
        } catch (response) {
            window.alert((await getErrorMessages(response)).join('\n'));
        }
    }

    return (
        <button
        type='button'
        className={className}
        onClick={handleClick}>
            {children}
        </button>
    )
}

export default DemoUser;
