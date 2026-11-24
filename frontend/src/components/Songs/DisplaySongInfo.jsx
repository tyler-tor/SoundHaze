import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { showSong } from '../../store/songs';
import { playSong } from '../../store/player';
import AddSongModal from '../Playlists/AddSongModal';
import Comments from '../Comments/Comments';
import PageNotFound from '../PageNotFound';
import { Cover, PlayButton, usePageTitle, useLoad, SkeletonDetail, ErrorState } from '../common';
import '../../styles/pages.css';

// Song page (S34): cover, title, artist, album, a play button, and the comments.
const DisplaySongInfo = () => {
    const { songId } = useParams();
    const song = useSelector(state => state.songs[songId]);
    const user = useSelector(state => state.session.user);
    const dispatch = useDispatch();
    usePageTitle(song?.title);

    // One song, not the whole catalogue (S26).
    const { status, notFound, reload } = useLoad(() => dispatch(showSong(songId)), [dispatch, songId]);

    if (notFound) {
        return <PageNotFound title="Song not found" message="This song doesn't exist, or it was deleted." />;
    }
    if (!song) {
        return status === 'error'
            ? <div className="page"><ErrorState title="Couldn't load this song" onRetry={reload} /></div>
            : <SkeletonDetail label="Loading song" />;
    }

    const artist = song.Artist;

    return (
        <div className='page'>
            <header className='detail-header'>
                <div className='haze' aria-hidden='true' style={{ backgroundImage: `url(${song.previewImage})` }} />
                <div className='detail-cover'>
                    <Cover src={song.previewImage} alt={`Cover of ${song.title}`} label={song.title} size={600} eager />
                </div>
                <div className='detail-meta'>
                    <h1>{song.title}</h1>
                    {artist && (
                        <p className='detail-artist'>
                            <Cover src={artist.previewImage} label={artist.username} size={68} className='avatar-xs' />
                            <strong className='artist-name'>{artist.username}</strong>
                        </p>
                    )}
                    {song.Album && (
                        <p className='muted'>On the album <Link to={`/albums/${song.albumId}`}>{song.Album.title}</Link></p>
                    )}
                    <p className='detail-desc'>{song.description}</p>
                    <div className='row'>
                        <PlayButton title={song.title} onClick={() => dispatch(playSong(song, [], artist?.username))} />
                        {user && <AddSongModal songId={song.id} songTitle={song.title} />}
                    </div>
                </div>
            </header>

            <Comments songId={song.id} />
        </div>
    )
}

export default DisplaySongInfo;
