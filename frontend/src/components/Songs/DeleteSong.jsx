import { useToast } from "../common";
import { useDispatch } from "react-redux";
import { removeSong } from "../../store/songs";
import { getErrorMessages } from "../../store/csrf";

const DeleteSong = ({song, userId}) => {
    const dispatch = useDispatch();
    const toast = useToast();

    const handleClick = async (e) => {
        e.preventDefault();
        if(song.userId === userId){
            try {
                await dispatch(removeSong(song.id));
                toast.success(`Deleted "${song.title}".`);
            } catch (response) {
                // Show the server's reason instead of claiming success.
                toast.error((await getErrorMessages(response)).join(' '));
            }
        }else {
            toast.error('You can only delete your own songs.');
        }
    }

    return (
        <button
        type="button"
        onClick={handleClick}
        aria-label={`Delete Song: ${song.title}`}
        className="btn btn-ghost btn-sm text-danger">
            Delete Song
        </button>
    )
}

export default DeleteSong;
