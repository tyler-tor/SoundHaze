import { useDispatch } from "react-redux";
import { removeSong } from "../../store/songs";
import { getErrorMessages } from "../../store/csrf";

const DeleteSong = ({song, userId}) => {
    const dispatch = useDispatch();

    const handleClick = async (e) => {
        e.preventDefault();
        if(song.userId === userId){
            try {
                await dispatch(removeSong(song.id));
                window.alert('Successfully deleted! Now create another!');
            } catch (response) {
                // Show the server's reason instead of claiming success.
                window.alert((await getErrorMessages(response)).join('\n'));
            }
        }else {
            window.alert('You do not have access to delete/modify this song');
        }
    }

    return (
        <button
        onClick={handleClick}
        className="btn btn-ghost btn-sm">
            Delete Song
        </button>
    )
}

export default DeleteSong;
