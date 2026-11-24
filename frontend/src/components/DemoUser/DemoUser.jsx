import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/session';
import { getErrorMessages } from '../../store/csrf';
import { useToast } from '../common';

// Demo account (seeded by backend/db/seed-data.js).
const DEMO_CREDENTIALS = { credential: 'Demo-lition', password: 'password' };

// className lets each page style the button (nav bar, welcome page, signup page).
const DemoUser = ({ className = 'btn btn-primary', children = 'Try the demo' }) => {
    const dispatch = useDispatch();
    const toast = useToast();

    const handleClick = async (e) => {
        e.preventDefault();
        try {
            await dispatch(loginUser(DEMO_CREDENTIALS));
        } catch (response) {
            toast.error((await getErrorMessages(response)).join(' '));
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
