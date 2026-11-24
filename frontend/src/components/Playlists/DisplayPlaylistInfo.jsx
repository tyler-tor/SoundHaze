import { Link, useParams } from "react-router-dom";
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showPlaylist } from "../../store/playlists";
import { playSong } from "../../store/player";
import UpdatePlaylistModal from "./UpdatePlaylistModal";
import DeletePlaylist from "./DeletePlaylist";
import DeletePlaylistSongModal from "./DeletePlaylistSongModal";
import PageNotFound from "../PageNotFound";
import { Cover, PlayButton, usePageTitle, useLoad, SkeletonDetail, ErrorState, EmptyState } from "../common";
import '../../styles/pages.css';

const DisplayPlaylistInfo = () => {
    const { playlistId } = useParams();
    const playlist = useSelector(state => state.playlists.currentPlaylist[playlistId]);
    const user = useSelector(state => state.session.user);
    const dispatch = useDispatch();
    usePageTitle(playlist?.name);

    const { status, notFound, reload } = useLoad(() => dispatch(showPlaylist(playlistId)), [dispatch, playlistId]);

    const playSongBtn = useCallback(
        (song) => {
            dispatch(playSong(song, playlist?.Songs));
        },
        [dispatch, playlist]
    );

    if (notFound) {
        return <PageNotFound title="Playlist not found" message="This playlist doesn't exist, or it was deleted." />;
    }
    if (!playlist) {
        return status === 'error'
            ? <div className="page"><ErrorState title="Couldn't load this playlist" onRetry={reload} /></div>
            : <SkeletonDetail label="Loading playlist" />;
    }

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
                            <PlayButton title={song.title} onClick={() => playSongBtn(song)} />
                            <div className="track-cover">
                                <Cover src={song.previewImage} label={song.title} size={112} />
                            </div>
                            <div className="track-main">
                                <Link to={`/songs/${song.id}`} className="track-title">{song.title}</Link>
                                <p className="track-desc">{song.description}</p>
                            </div>
                            {playlist.userId === user?.id && (
                                <div className="track-actions">
                                    <DeletePlaylistSongModal songId={song.id} songTitle={song.title} playlistId={playlist.id} />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                {playlist.Songs.length === 0 && (
                    <EmptyState title="No songs in this playlist yet">
                        Open any song and choose "Add to playlist".
                    </EmptyState>
                )}
            </section>
        </div>
    )
}

export default DisplayPlaylistInfo
