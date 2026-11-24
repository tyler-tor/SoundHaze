import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/session';
import { getErrorMessages } from '../../store/csrf';

// Demo account (seeded by backend/db/seed-data.js).
const DEMO_CREDENTIALS = { credential: 'Demo-lition', password: 'password' };

const DemoUser = () => {
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
        className='demo-user-btn'
        onClick={handleClick}>
            Demo
        </button>
    )
}

export default DemoUser;
