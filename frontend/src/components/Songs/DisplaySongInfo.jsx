import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showSong } from '../../store/songs';
import { playSong } from '../../store/player';
import { HiPlay } from 'react-icons/hi';
import { Cover, usePageTitle } from '../common';
import '../../styles/pages.css';

const DisplaySongInfo = () => {
    const { songId } = useParams();
    const song = useSelector(state => state.songs[songId]);
    const dispatch = useDispatch();
    usePageTitle(song?.title);

    useEffect(() => {
        // One song, not the whole catalogue (S26). A 404 leaves the page empty.
        dispatch(showSong(songId)).catch(() => {});
    }, [dispatch, songId]);

    if (!song) return null;

    return (
        <div className='page'>
            <header className='detail-header'>
                <div className='haze' aria-hidden='true' style={{ backgroundImage: `url(${song.previewImage})` }} />
                <div className='detail-cover'>
                    <Cover src={song.previewImage} alt={`Cover of ${song.title}`} label={song.title} size={600} eager />
                </div>
                <div className='detail-meta'>
                    <h1>{song.title}</h1>
                    <p className='detail-desc'>{song.description}</p>
                    {song.Album && (
                        <p className='muted'>From <Link to={`/albums/${song.albumId}`}>{song.Album.title}</Link></p>
                    )}
                    <HiPlay className='play-btn' onClick={() => dispatch(playSong(song, [], song.Artist?.username))} />
                </div>
            </header>
        </div>
    )
}

export default DisplaySongInfo;
