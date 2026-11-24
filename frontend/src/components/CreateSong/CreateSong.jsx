import React, { useState } from "react";
import { useDispatch, useSelector} from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAddSong } from "../../store/songs";
import { getErrorMessages } from "../../store/csrf";

const CreateSong = ({ albumId, setShowModal }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [errors, setErrors] = useState([]);
    const [albumIdState, setAlbumIdState] = useState(albumId ? albumId : '');
    const albums = useSelector(state => state.session.albums);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        if (!albums || !albumIdState) {
            setErrors(["You need to select an album. If you don't have a album, create one"])
        } else {
            const data = {
                title,
                description,
                url: audioUrl,
                albumId: albumIdState
            }
            try {
                await dispatch(createAddSong(data));
                // Only close and navigate once the song was actually created.
                setTitle("");
                setAudioUrl("");
                setDescription("");
                setShowModal(false);
                navigate('/songs');
            } catch (response) {
                setErrors(await getErrorMessages(response));
            }
        }
    };

    const updateSongFile = (e) => {
        const songFile = e.target.files[0];
        setAudioUrl(songFile);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="form">
            <ul className="error-list" role="alert">
                {errors.map((error, idx) => (
                    <li key={idx}
                        className='el-item'>{error}</li>
                ))}
            </ul>
            <label className="field">
                Title
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </label>
            <label className="field">
                Description
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </label>
            <label className="field">
                    Upload Audio
                <input
                    type="file"
                    name="song"
                    className="song-input"
                    // value={audioUrl}
                    onChange={updateSongFile}
                    required
                />
            </label>
            {!albumId &&
                (<label className="field">
                    Album
                    <select
                        name="album"
                        value={albumIdState}
                        onChange={(e) => setAlbumIdState(e.target.value)}
                        className='select-input'>
                        <option value=''>Select an album</option>
                        {Object.values(albums).map((album, idx) => (
                            <option key={idx}
                                value={album.id}
                            >{album.title}</option>
                        ))}
                    </select>
                </label>)}
            <button
                type="submit"
                className="btn btn-primary">
                Add Song
            </button>
        </form>
    )
};

export default CreateSong;
