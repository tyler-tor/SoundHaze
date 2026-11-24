import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { getAlbums } from "../../store/albums";
import CreateSongModal from "../CreateSong/CreateSongModal";
import DeleteAlbum from "./DeleteAlbum";
import UpdateAlbumModal from "../UpdateAlbum/UpdateAlbumModal";
import CreateAlbumModal from "../CreateAlbum/CreateAlbumModal";
import DemoUser from "../DemoUser/DemoUser";
import { Cover, usePageTitle, useLoad, SkeletonGrid, EmptyState, ErrorState } from "../common";
import '../../styles/pages.css';

const Albums = () => {
    const albums = Object.values(useSelector(state => state.albums.albums)).reverse();
    const user = useSelector(state => state.session.user);
    const dispatch = useDispatch();
    usePageTitle('Albums');

    const { status, reload } = useLoad(() => dispatch(getAlbums()), [dispatch]);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Albums</h1>
                    <p className="lede">Collections of songs, newest first.</p>
                </div>
                {user && <CreateAlbumModal />}
            </div>
            {albums.length === 0 && status === 'loading' && <SkeletonGrid label="Loading albums" />}
            {albums.length === 0 && status === 'error' && (
                <ErrorState title="Couldn't load albums" onRetry={reload} />
            )}
            {albums.length === 0 && status === 'ready' && (
                <EmptyState
                    title="No albums yet"
                    action={user ? <CreateAlbumModal /> : <DemoUser className="btn btn-primary">Try the demo</DemoUser>}
                >
                    {user
                        ? 'An album holds your songs. Create one with a cover image, then add songs to it.'
                        : 'Log in, or try the demo, to create the first one.'}
                </EmptyState>
            )}
            <div className="grid">
                {albums.map(album => (
                    <article className="tile" key={album.id}>
                        <NavLink to={`/albums/${album.id}`} className="tile-cover" tabIndex={-1} aria-hidden="true">
                            <Cover src={album.previewImage} label={album.title} />
                        </NavLink>
                        <div>
                            <NavLink to={`/albums/${album.id}`} className="tile-title" title={album.title}>
                                {album.title}
                            </NavLink>
                            <p className="tile-sub">{album.description}</p>
                        </div>
                        {user?.id === album.userId && (
                            <div className="tile-actions">
                                <CreateSongModal album={album} userId={user.id} className="btn btn-ghost btn-sm" />
                                <UpdateAlbumModal album={album} userId={user.id} />
                                <DeleteAlbum album={album} userId={user.id} />
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </div>
    )
}

export default Albums;
