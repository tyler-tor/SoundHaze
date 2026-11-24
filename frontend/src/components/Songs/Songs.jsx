import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { useEffect, useCallback } from 'react';
import { getSongs } from "../../store/songs";
import { getAlbums } from "../../store/albums";
import { playSong } from "../../store/player";
import DeleteSong from "./DeleteSong";
import CreateSongModal from "../CreateSong/CreateSongModal";
import UpdateSongModal from "../UpdateSong/UpdateSongModal";
import AddSongModal from '../Playlists/AddSongModal';
import { Cover, PlayButton, usePageTitle } from "../common";
import '../../styles/pages.css';

const Songs = () => {
    const songs = Object.values(useSelector(state => state.songs)).reverse();
    const user = useSelector(state => state.session.user);
    const dispatch = useDispatch();
    usePageTitle('Songs');

    useEffect(() => {
        dispatch(getSongs());
        dispatch(getAlbums());
    }, [dispatch]);

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
