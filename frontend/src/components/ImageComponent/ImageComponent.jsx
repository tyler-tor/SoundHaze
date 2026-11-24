import React, { useState } from 'react';
import { csrfFetch, getErrorMessages } from '../../store/csrf';

function ImageComponent({ setUrl }) {
    const [image, setImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(false);
    const [prevImageUrl, setPrevImageUrl] = useState('');
    const [errors, setErrors] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) {
            return setErrors(['Choose an image file first.']);
        }
        const formData = new FormData();
        setImageLoading(true);
        formData.append('image', image);
        setErrors([]);
        try {
            const response = await csrfFetch('/api/images/upload', {
                method: 'POST',
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                body: formData
            });
            const data = await response.json();
            setUrl(data.profileImageUrl);
            setUploadedImage(true);
            setPrevImageUrl(data.profileImageUrl);
        } catch (response) {
            // e.g. "File is too large", "Unsupported file type", or no file chosen.
            setErrors(await getErrorMessages(response));
        } finally {
            setImageLoading(false);
        }
    };

    const updateImage = (e) => {
        const file = e.target.files[0];
        setImage(file);
    }

    return (
        <div className='upload-image-wrapper'>
            <form onSubmit={handleSubmit} className='upload-form'>
                <label className='field'>
                    Cover image
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={updateImage} />
                </label>
                <button type="submit" className='btn btn-secondary btn-sm'>Upload</button>
            {imageLoading && <p>Uploading...</p>}
            <ul className='error-list' role='alert'>
                {errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                ))}
            </ul>
            </form>
            {uploadedImage && <img src={prevImageUrl} className='cover prev-image' alt='Preview of the uploaded cover' width='120' height='120' />}
        </div>
    )
}

export default ImageComponent
