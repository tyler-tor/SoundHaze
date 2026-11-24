import { Link, useParams } from "react-router-dom";
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showAlbum } from "../../store/albums";
import CreateSongModal from "../CreateSong/CreateSongModal";
import UpdateAlbumModal from "../UpdateAlbum/UpdateAlbumModal";
import DeleteAlbum from "./DeleteAlbum";
import AddSongModal from "../Playlists/AddSongModal";
import DeleteSong from "../Songs/DeleteSong";
import UpdateSongModal from "../UpdateSong/UpdateSongModal";
import { playSong } from "../../store/player";
import { HiPlay } from "react-icons/hi";
import { Cover, usePageTitle } from "../common";
import '../../styles/pages.css';

const DisplayAlbumInfo = () => {
    const { albumId } = useParams();
    const album = useSelector(state => state.albums.currentAlbum[albumId]);
    const user = useSelector(state => state.session.user);
    const dispatch = useDispatch();
    usePageTitle(album?.title);

    useEffect(() => {
        dispatch(showAlbum(parseInt(albumId)));
    }, [dispatch, albumId]);

    const playSongBtn = useCallback(
        (song) => {
            dispatch(playSong(song, album?.Songs, album?.Artist?.username));
        },
        [dispatch, album]
    );

    if (!album) return null;

    return (
        <div className="page">
            <header className="detail-header">
                <div className="haze" aria-hidden="true" style={{ backgroundImage: `url(${album.previewImage})` }} />
                <div className="detail-cover">
                    <Cover src={album.previewImage} alt={`Cover of ${album.title}`} label={album.title} size={600} eager />
                </div>
                <div className="detail-meta">
                    <h1>{album.title}</h1>
                    <p className="detail-desc">{album.description}</p>
                    <p className="detail-artist">
                        <Cover src={album.Artist.previewImage} label={album.Artist.username} size={68} className="avatar-xs" />
                        <strong className="artist-name">{album.Artist.username}</strong>
                    </p>
                    {user?.id === album.userId && (
                        <div className="row">
                            <CreateSongModal album={album} userId={user.id} />
                            <UpdateAlbumModal album={album} userId={user.id} />
                            <DeleteAlbum album={album} userId={user.id} />
                        </div>
                    )}
                </div>
            </header>

            <section className="section" aria-label="Songs on this album">
                <ul className="tracklist">
                    {album.Songs.map(song => (
                        <li className="track" key={song.id}>
                            <HiPlay className="play-btn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    playSongBtn(song);
                                }}
                            />
                            <div className="track-cover">
                                <Cover src={album.previewImage} label={song.title} size={112} />
                            </div>
                            <div className="track-main">
                                <Link to={`/songs/${song.id}`} className="track-title">{song.title}</Link>
                                <p className="track-desc">{song.description}</p>
                            </div>
                            {user && (
                                <div className="track-actions">
                                    <AddSongModal songId={song.id} />
                                    {user.id === song.userId && (
                                        <>
                                            <UpdateSongModal song={song} userId={user.id} />
                                            <DeleteSong song={song} userId={user.id} />
                                        </>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                {album.Songs.length === 0 && <p className="muted">No songs on this album yet.</p>}
            </section>
        </div>
    )
};

export default DisplayAlbumInfo;
