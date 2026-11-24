import { Link, useParams } from "react-router-dom";
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showPlaylist } from "../../store/playlists";
import { playSong } from "../../store/player";
import { HiPlay } from "react-icons/hi";
import UpdatePlaylistModal from "./UpdatePlaylistModal";
import DeletePlaylist from "./DeletePlaylist";
import DeletePlaylistSongModal from "./DeletePlaylistSongModal";
import { Cover, usePageTitle } from "../common";
import '../../styles/pages.css';

const DisplayPlaylistInfo = () => {
    const { playlistId } = useParams();
    const playlist = useSelector(state => state.playlists.currentPlaylist[playlistId]);
    const user = useSelector(state => state.session.user);
    const dispatch = useDispatch();
    usePageTitle(playlist?.name);

    useEffect(() => {
        dispatch(showPlaylist(playlistId));
    }, [dispatch, playlistId]);

    const playSongBtn = useCallback(
        (song) => {
            dispatch(playSong(song, playlist?.Songs));
        },
        [dispatch, playlist]
    );

    if (!playlist) return null;

    return (
        <div className="page">
            <header className="detail-header">
                <div className="haze" aria-hidden="true" style={{ backgroundImage: `url(${playlist.previewImage})` }} />
                <div className="detail-cover">
                    <Cover src={playlist.previewImage} alt={`Cover of ${playlist.name}`} label={playlist.name} size={600} eager />
                </div>
                <div className="detail-meta">
                    <h1>{playlist.name}</h1>
                    <p className="detail-artist">
                        <Cover src={playlist.User.previewImage} label={playlist.User.username} size={68} className="avatar-xs" />
                        <span>Playlist by <strong>{playlist.User.username}</strong></span>
                    </p>
                    {user?.id === playlist.userId && (
                        <div className="row">
                            <UpdatePlaylistModal playlist={playlist} userId={user.id} />
                            <DeletePlaylist playlist={playlist} userId={user.id} />
                        </div>
                    )}
                </div>
            </header>

            <section className="section" aria-label="Songs in this playlist">
                <ul className="tracklist">
                    {playlist.Songs.map(song => (
                        <li className="track" key={song.id}>
                            <HiPlay className="play-btn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    playSongBtn(song);
                                }}
                            />
                            <div className="track-cover">
                                <Cover src={song.previewImage} label={song.title} size={112} />
                            </div>
                            <div className="track-main">
                                <Link to={`/songs/${song.id}`} className="track-title">{song.title}</Link>
                                <p className="track-desc">{song.description}</p>
                            </div>
                            {playlist.userId === user?.id && (
                                <div className="track-actions">
                                    <DeletePlaylistSongModal songId={song.id} playlistId={playlist.id} />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                {playlist.Songs.length === 0 && <p className="muted">No songs in this playlist yet. Use "Add to playlist" on any song.</p>}
            </section>
        </div>
    )
}

export default DisplayPlaylistInfo
