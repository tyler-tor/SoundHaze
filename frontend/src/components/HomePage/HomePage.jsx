import { useSelector, useDispatch } from "react-redux";
import CreateAlbumModal from "../CreateAlbum/CreateAlbumModal";
import CreatePlaylistModal from "../CreatePlaylist/CreatePlaylistModal";
import DemoUser from "../DemoUser/DemoUser";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import { Link, NavLink } from "react-router-dom";
import { useEffect } from "react";
import { mySongs } from "../../store/session";
import { getAlbums } from "../../store/albums";
import { Cover, usePageTitle } from "../common";
import './homepage.css'

// A row of cards: one per album / playlist / song.
const TileGrid = ({ items, getTo, getTitle, getImage }) => (
    <div className="grid">
        {items.map((item) => (
            <article className="tile" key={item.id}>
                <NavLink to={getTo(item)} className="tile-cover" tabIndex={-1} aria-hidden="true">
                    <Cover src={getImage(item)} label={getTitle(item)} />
                </NavLink>
                <NavLink to={getTo(item)} className="tile-title" title={getTitle(item)}>
                    {getTitle(item)}
                </NavLink>
            </article>
        ))}
    </div>
);

const Welcome = () => {
    const albums = Object.values(useSelector(state => state.albums.albums)).reverse();
    const dispatch = useDispatch();
    usePageTitle('');

    useEffect(() => {
        dispatch(getAlbums());
    }, [dispatch]);

    // The blurred covers behind the headline are the "haze".
    const hazeCovers = albums.slice(0, 3);

    return (
        <div className="page welcome">
            <section className="hero">
                <div className="hero-haze" aria-hidden="true">
                    {hazeCovers.map((album, i) => (
                        <span key={album.id} className={`hero-haze-blob blob-${i}`} style={{ backgroundImage: `url(${album.previewImage})` }} />
                    ))}
                </div>
                <h1 className="hero-title">Upload it. Shape it. Let it drift.</h1>
                <p className="hero-lede">
                    SoundHaze is where you put your songs into albums, collect favorites into playlists,
                    and press play on whatever you find.
                </p>
                <div className="hero-actions">
                    <DemoUser className="btn btn-primary btn-lg">Try the demo</DemoUser>
                    <Link to="/signup" className="btn btn-secondary btn-lg">Create an account</Link>
                </div>
                <p className="hero-note">
                    The demo signs you in as a sample artist. No sign-up needed.{' '}
                    <LoginFormModal className="link-btn">Already have an account? Log in</LoginFormModal>
                </p>
            </section>

            {albums.length > 0 && (
                <section className="section">
                    <div className="section-head">
                        <h2>Fresh albums</h2>
                        <Link to="/albums">Browse all albums</Link>
                    </div>
                    <TileGrid
                        items={albums.slice(0, 6)}
                        getTo={(a) => `/albums/${a.id}`}
                        getTitle={(a) => a.title}
                        getImage={(a) => a.previewImage}
                    />
                </section>
            )}
        </div>
    );
};

const Dashboard = ({ currentUser }) => {
    const albums = useSelector(state => state.session.albums);
    const songs = useSelector(state => state.session.songs);
    const playlists = useSelector(state => state.session.playlists);
    const dispatch = useDispatch();
    usePageTitle('Home');

    useEffect(() => {
        dispatch(mySongs());
    }, [dispatch]);

    return (
        <div className="page">
            <header className="page-header home-header">
                <div className="home-who">
                    <Cover src={currentUser.previewImage} label={currentUser.username} size={160} className="home-avatar" />
                    <div>
                        <h1>Hi, {currentUser.username}</h1>
                        {currentUser.firstName && currentUser.lastName && (
                            <p className="lede">{currentUser.firstName} {currentUser.lastName}</p>
                        )}
                    </div>
                </div>
                <div className="row">
                    <CreateAlbumModal />
                    <CreatePlaylistModal />
                </div>
            </header>

            <section className="section" aria-labelledby="home-albums">
                <div className="section-head"><h2 id="home-albums">Your albums</h2></div>
                <TileGrid items={albums} getTo={(a) => `/albums/${a.id}`} getTitle={(a) => a.title} getImage={(a) => a.previewImage} />
                {albums.length === 0 && <p className="muted">No albums yet.</p>}
            </section>

            <section className="section" aria-labelledby="home-playlists">
                <div className="section-head"><h2 id="home-playlists">Your playlists</h2></div>
                <TileGrid items={playlists} getTo={(p) => `/playlists/${p.id}`} getTitle={(p) => p.name} getImage={(p) => p.previewImage} />
                {playlists.length === 0 && <p className="muted">No playlists yet.</p>}
            </section>

            <section className="section" aria-labelledby="home-songs">
                <div className="section-head"><h2 id="home-songs">Your songs</h2></div>
                <TileGrid items={songs} getTo={(s) => `/songs/${s.id}`} getTitle={(s) => s.title} getImage={(s) => s.previewImage} />
                {songs.length === 0 && <p className="muted">No songs yet.</p>}
            </section>
        </div>
    );
};

const HomePage = () => {
    const currentUser = useSelector(state => state.session.user);
    return currentUser ? <Dashboard currentUser={currentUser} /> : <Welcome />;
};

export default HomePage
