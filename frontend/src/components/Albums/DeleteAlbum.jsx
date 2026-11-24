import { useToast } from "../common";
import { useDispatch } from "react-redux";
import { removeAlbum } from "../../store/albums";
import { useNavigate } from "react-router-dom";
import { getSongs } from "../../store/songs";
import { getErrorMessages } from "../../store/csrf";

const DeleteAlbum = ({album, userId}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();

    const handleClick = async (e) => {
        if(album.userId === userId){
            try {
                // album.id comes from props; the old code read it from
                // currentAlbum, which is empty on the /albums list page.
                await dispatch(removeAlbum(album.id));
                // Deleting an album also deletes its songs, so refresh them.
                await dispatch(getSongs());
                navigate('/albums');
                toast.success(`Deleted "${album.title}".`);
            } catch (response) {
                toast.error((await getErrorMessages(response)).join(' '));
            }
        }else {
            toast.error('You can only delete your own albums.')
        }
    };

    return (
        <button
        type="button"
        onClick={handleClick}
        aria-label={`Delete Album: ${album.title}`}
        className="btn btn-ghost btn-sm text-danger">
            Delete Album
        </button>
    )
}

export default DeleteAlbum;
