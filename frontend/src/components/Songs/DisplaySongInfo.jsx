import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showSong } from '../../store/songs';
import './displaysong.css'

const DisplaySongInfo = () => {
    const { songId } = useParams();
    const song = useSelector(state => state.songs[songId]);
    const dispatch = useDispatch();

    useEffect(() => {
        // One song, not the whole catalogue (S26). A 404 leaves the page empty.
        dispatch(showSong(songId)).catch(() => {});
    }, [dispatch, songId]);

    return (
        <>
            {song &&
                (<div
                    className='song-detail-list'>
                    <div
                    className='song-detail-container'
                    style={{
                        backgroundImage: `url(${song.previewImage})`,
                        backgroundSize: 'cover',
                        opacity: '.9'
                    }}>
                        <h2
                        className='sd-header'>Song Information:</h2>
                        <ul>
                            <li>
                                {song.title}
                            </li>
                            <li>
                                {song.description}
                            </li>
                            <li>
                                belongs to album: {song.albumId}
                            </li>
                            <li>
                                {song.url}
                            </li>
                            <li>
                                belongs to user: {song.userId}
                            </li>
                        </ul>
                    </div>
                </div>
                )}
        </>
    )
}

export default DisplaySongInfo;
