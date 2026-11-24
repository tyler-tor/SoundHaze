import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { getPlaylists } from '../../store/playlists';
import CreatePlaylistModal from '../CreatePlaylist/CreatePlaylistModal';
import DeletePlaylist from './DeletePlaylist';
import UpdatePlaylistModal from './UpdatePlaylistModal';
import DemoUser from '../DemoUser/DemoUser';
import { Cover, usePageTitle, useLoad, SkeletonGrid, EmptyState, ErrorState } from '../common';
import '../../styles/pages.css';

function Playlists() {
    const playlists = Object.values(useSelector(state => state.playlists.playlists)).reverse();
    const user = useSelector(state => state.session.user);
    const dispatch = useDispatch();
    usePageTitle('Playlists');

    const { status, reload } = useLoad(() => dispatch(getPlaylists()), [dispatch]);

    return (
        <div className='page'>
            <div className='page-header'>
                <div>
                    <h1>Playlists</h1>
                    <p className='lede'>Hand-picked mixes from everyone on SoundHaze.</p>
                </div>
                {user && <CreatePlaylistModal />}
            </div>
            {playlists.length === 0 && status === 'loading' && <SkeletonGrid label='Loading playlists' />}
            {playlists.length === 0 && status === 'error' && (
                <ErrorState title="Couldn't load playlists" onRetry={reload} />
            )}
            {playlists.length === 0 && status === 'ready' && (
                <EmptyState
                    title='No playlists yet'
                    action={user ? <CreatePlaylistModal /> : <DemoUser className='btn btn-primary'>Try the demo</DemoUser>}
                >
                    {user
                        ? 'A playlist collects songs from any album. Create one, then use "Add to playlist" on a song.'
                        : 'Log in, or try the demo, to create the first one.'}
                </EmptyState>
            )}
            <div className='grid'>
                {playlists.map(playlist => (
                    <article className='tile' key={playlist.id}>
                        <NavLink to={`/playlists/${playlist.id}`} className='tile-cover' tabIndex={-1} aria-hidden='true'>
                            <Cover src={playlist.previewImage} label={playlist.name} />
                        </NavLink>
                        <div>
                            <NavLink to={`/playlists/${playlist.id}`} className='tile-title' title={playlist.name}>
                                {playlist.name}
                            </NavLink>
                        </div>
                        {user?.id === playlist.userId && (
                            <div className='tile-actions'>
                                <UpdatePlaylistModal playlist={playlist} userId={user.id} />
                                <DeletePlaylist playlist={playlist} userId={user.id} />
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </div>
    )
}

export default Playlists
