import React, { useState} from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateSong } from "../../store/songs";
import { getErrorMessages } from "../../store/csrf";

const UpdateSong = ({ song, setShowModal }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [title, setTitle] = useState(song.title);
    const [description, setDescription] = useState(song.description);
    const [url, setUrl] = useState(song.url);
    const [imageUrl, setImageUrl] = useState(song.previewImage);
    const [errors, setErrors] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        const data = {
            ...song,
            songId: song.id,
            title,
            description,
            url,
            previewImage: imageUrl
        }
        try {
            await dispatch(updateSong(data));
            setShowModal(false);
            navigate('/songs');
        } catch (response) {
            setErrors(await getErrorMessages(response));
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="form">
            <ul className="error-list" aria-live="polite">
                {errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
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
                Url
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                />
            </label>
            <label className="field">
                Image Url
                <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                />
            </label>
            <button
                type="submit"
                className="btn btn-primary">
                Update Song
            </button>
        </form>
    )
}


export default UpdateSong;
