import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as sessionActions from '../../store/session';
import './Navigation.css';

const ProfileButton = ({ user }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const openMenu = (e) => {
        if (showMenu) return;
        setShowMenu(true);
    };

    useEffect(() => {
        if (!showMenu) return;

        const closeMenu = () => {
            setShowMenu(false)
        }

        document.addEventListener('click', closeMenu)

        return () => document.removeEventListener('click', closeMenu);
    }, [showMenu]);

    const logout = (e) => {
        e.preventDefault();
        dispatch(sessionActions.logoutUser()).then(() => {
            navigate('/');
        });
    };

    return (
        <>
            <button onClick={openMenu}
            className='profile-image-btn'
            >
                <img src={user.previewImage} className='profile-image' />
            </button>
            {showMenu && (
                <ul className='profile-dropdown'>
                    <li
                    className='profile-username'>{user.username}</li>
                    <li>
                        {user.username}
                    </li>
                    <li>
                        <button onClick={logout} className='logout-btn'>Log Out</button>
                    </li>
                </ul>)}
        </>


    )
}

export default ProfileButton;
