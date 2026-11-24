import { useSelector } from "react-redux";
import React from 'react';
import { Link, NavLink } from "react-router-dom";
import ProfileButton from "./ProfileButton";
import DemoUser from "../DemoUser/DemoUser";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import { Logo } from "../common";
import './Navigation.css'

const LINKS = [
    { to: '/', label: 'Home', end: true },
    { to: '/songs', label: 'Songs' },
    { to: '/albums', label: 'Albums' },
    { to: '/playlists', label: 'Playlists' }
];

const Navigation = ({ isLoaded }) => {
    const currUser = useSelector(state => state.session.user);

    return (
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
    )
}


export default Navigation;
