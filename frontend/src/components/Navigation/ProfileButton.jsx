import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as sessionActions from '../../store/session';
import { Cover } from '../common';
import './Navigation.css';

const ProfileButton = ({ user }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const wrapperRef = useRef(null);
    const buttonRef = useRef(null);

    // Close on a click outside the menu or on Escape (then focus goes back to the button).
    useEffect(() => {
        if (!showMenu) return;

        const onPointerDown = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowMenu(false);
        };
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowMenu(false);
                buttonRef.current?.focus();
            }
        };

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [showMenu]);

    const logout = (e) => {
        e.preventDefault();
        dispatch(sessionActions.logoutUser()).then(() => {
            navigate('/');
        });
    };

    return (
        <div className='profile-menu' ref={wrapperRef}>
            <button
                ref={buttonRef}
                type='button'
                onClick={() => setShowMenu((open) => !open)}
                className='profile-image-btn'
                aria-expanded={showMenu}
                aria-haspopup='true'
                aria-label={`Account menu for ${user.username}`}
            >
                <Cover src={user.previewImage} label={user.username} size={68} />
                <span className='profile-name'>{user.username}</span>
            </button>
            {showMenu && (
                <div className='profile-dropdown'>
                    <p className='profile-username'>Signed in as {user.username}</p>
                    <button type='button' onClick={logout} className='menu-btn'>Log out</button>
                </div>
            )}
        </div>
    )
}

export default ProfileButton;
