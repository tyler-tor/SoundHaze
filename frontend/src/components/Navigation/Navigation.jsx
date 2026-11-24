import { useSelector } from "react-redux";
import React from 'react';
import { Link, NavLink } from "react-router-dom";
import ProfileButton from "./ProfileButton";
import DemoUser from "../DemoUser/DemoUser";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import { HiHome, HiMusicNote, HiCollection, HiViewList } from "react-icons/hi";
import { Logo } from "../common";
import './Navigation.css'

const LINKS = [
    { to: '/', label: 'Home', end: true, Icon: HiHome },
    { to: '/songs', label: 'Songs', Icon: HiMusicNote },
    { to: '/albums', label: 'Albums', Icon: HiCollection },
    { to: '/playlists', label: 'Playlists', Icon: HiViewList }
];

const Navigation = ({ isLoaded }) => {
    const currUser = useSelector(state => state.session.user);

    return (
        <>
        <header className="site-header">
            <div className="site-header-inner">
                <Link to='/' className='wordmark' aria-label='SoundHaze home'>
                    <Logo />
                    <span>SoundHaze</span>
                </Link>

                <nav className='main-nav' aria-label='Main'>
                    <ul>
                        {LINKS.map(({ to, label, end }) => (
                            <li key={to}>
                                <NavLink to={to} end={end} className='nav-link'>
                                    {label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className='session-controls'>
                    {isLoaded && (currUser ? (
                        <ProfileButton user={currUser} />
                    ) : (
                        <>
                            <LoginFormModal className='btn btn-ghost' />
                            <Link to='/signup' className='btn btn-secondary signup-link'>Sign up</Link>
                            <DemoUser className='btn btn-primary' />
                        </>
                    ))}
                </div>
            </div>
        </header>

        {/* Phones: the same four links as a tab bar at the bottom (see Navigation.css).
            It sits outside <header> because the header's backdrop-filter would
            otherwise become the containing block of this fixed element. */}
            <nav className='tab-bar' aria-label='Mobile'>
                <ul>
                    {LINKS.map(({ to, label, end, Icon }) => (
                        <li key={to}>
                            <NavLink to={to} end={end} className='tab-link'>
                                <Icon aria-hidden='true' />
                                <span>{label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    )
}


export default Navigation;
