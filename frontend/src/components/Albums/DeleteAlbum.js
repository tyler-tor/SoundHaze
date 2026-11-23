import { useDispatch } from "react-redux";
import { removeAlbum } from "../../store/albums";
import { useHistory } from "react-router-dom";
import { getSongs } from "../../store/songs";
import { getErrorMessages } from "../../store/csrf";

const DeleteAlbum = ({album, userId}) => {
    const dispatch = useDispatch();
    const history = useHistory();

    const handleClick = async (e) => {
        if(album.userId === userId){
            try {
                // album.id comes from props; the old code read it from
                // currentAlbum, which is empty on the /albums list page.
                await dispatch(removeAlbum(album.id));
                // Deleting an album also deletes its songs, so refresh them.
                await dispatch(getSongs());
                history.push('/albums');
                window.alert('Successfully deleted! Now create another!');
            } catch (response) {
                window.alert((await getErrorMessages(response)).join('\n'));
            }
        }else {
            window.alert('You do not have access to delete/modify this album')
        }
    };

    return (
        <button
        onClick={handleClick}
        className="album-btns">
            Delete Album
        </button>
    )
}

export default DeleteAlbum;
