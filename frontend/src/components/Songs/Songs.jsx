import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { useCallback } from 'react';
import { getSongs } from "../../store/songs";
import { getAlbums } from "../../store/albums";
import { playSong } from "../../store/player";
import DeleteSong from "./DeleteSong";
import CreateSongModal from "../CreateSong/CreateSongModal";
import UpdateSongModal from "../UpdateSong/UpdateSongModal";
import AddSongModal from '../Playlists/AddSongModal';
import CreateAlbumModal from "../CreateAlbum/CreateAlbumModal";
import DemoUser from "../DemoUser/DemoUser";
import { Cover, PlayButton, usePageTitle, useLoad, SkeletonGrid, EmptyState, ErrorState } from "../common";
import '../../styles/pages.css';

const Songs = () => {
    const songs = Object.values(useSelector(state => state.songs)).reverse();
    const user = useSelector(state => state.session.user);
    const dispatch = useDispatch();
    usePageTitle('Songs');

    const { status, reload } = useLoad(
        () => Promise.all([dispatch(getSongs()), dispatch(getAlbums())]),
        [dispatch]
    );

    const playSongBtn = useCallback(
        (song, list) => {
            dispatch(playSong(song, list));
        },
        [dispatch]
    );

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Songs</h1>
                    <p className="lede">Everything uploaded to SoundHaze, newest first.</p>
                </div>
                {user && <CreateSongModal />}
            </div>
            {songs.length === 0 && status === 'loading' && <SkeletonGrid label="Loading songs" />}
            {songs.length === 0 && status === 'error' && (
                <ErrorState title="Couldn't load songs" onRetry={reload} />
            )}
            {songs.length === 0 && status === 'ready' && (
                <EmptyState
                    title="No songs yet"
                    action={user ? <CreateAlbumModal /> : <DemoUser className="btn btn-primary">Try the demo</DemoUser>}
                >
                    {user
                        ? 'Songs live inside albums. Create an album first, then upload your first song to it.'
                        : 'Be the first to upload. Log in, or try the demo to look around.'}
                </EmptyState>
            )}
            <div className="grid">
                {songs.map(song => (
                    <article className="tile" key={song.id}>
                        <div className="tile-cover">
                            <Cover src={song.previewImage} label={song.title} />
                            <PlayButton title={song.title} onClick={() => playSongBtn(song, songs)} />
                        </div>
                        <div>
                            <NavLink to={`/songs/${song.id}`} className="tile-title" title={song.title}>
                                {song.title}
                            </NavLink>
                            <p className="tile-sub">{song.description}</p>
                        </div>
                        {user && (
                            <div className='tile-actions'>
                                <AddSongModal songId={song.id} songTitle={song.title} />
                                {(user.id === song.userId) && (
                                    <>
                                        <UpdateSongModal song={song} userId={user.id} />
                                        <DeleteSong song={song} userId={user.id} />
                                    </>
                                )}
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </div>
    )
};

export default Songs;
