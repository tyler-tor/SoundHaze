import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAlbum } from "../../store/albums";
import ImageComponent from "../ImageComponent";
import { getErrorMessages } from "../../store/csrf";


const CreateAlbum = ({ setShowModal }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [errors, setErrors] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        const data = {
            title,
            description,
            imageUrl: url
        }
        try {
            await dispatch(createAlbum(data));
            setShowModal(false);
            navigate('/albums');
        } catch (response) {
            setErrors(await getErrorMessages(response));
        }

    };

    return (
        <div className="form modal-stack">
            <div className="upload-slot">
                <ImageComponent setUrl={setUrl} />
            </div>
            <form
                onSubmit={handleSubmit}
                className="form">
                <ul className="error-list" role="alert">
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
                <button
                    type="submit"
                    className="btn btn-primary">
                    Add Album
                </button>
            </form>
        </div>
    )
};

export default CreateAlbum;
