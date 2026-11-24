import { FaGithub, FaLinkedin } from 'react-icons/fa';
import './footer.css';

// Small site footer (S35 finishes the old unused Footer component).
const Footer = () => (
    <footer className='site-footer'>
        <p className='muted'>SoundHaze is a portfolio project. Upload, listen, and build playlists.</p>
        <ul className='site-footer-links'>
            <li>
                <a href='https://github.com/tyler-tor' target='_blank' rel='noreferrer'>
                    <FaGithub aria-hidden='true' /> GitHub
                </a>
            </li>
            <li>
                <a href='https://www.linkedin.com/in/derek-torrero-02823018a' target='_blank' rel='noreferrer'>
                    <FaLinkedin aria-hidden='true' /> LinkedIn
                </a>
            </li>
        </ul>
    </footer>
);

export default Footer;
