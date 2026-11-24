import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { signUpUser } from '../../store/session';
import { getErrorMessages } from '../../store/csrf';
import { usePageTitle } from '../common';
// import ImageComponent from '../ImageComponent';

const SignupFormPage = () => {
    usePageTitle('Sign up');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [image, setImage] = useState('');
    const [validationErrors, setValidationErrors] = useState([]);
    const [errors, setErrors] = useState([]);
    const currentUser = useSelector(state => state.session.user);


    const dispatch = useDispatch();

    useEffect(() => {
        const errs = [];

        if(username.length < 1) errs.push('Username field requires a input');
        if(email.length < 1) errs.push('Email field requires a input');
        if(password.length < 1) errs.push('Password field requires a input');

        setValidationErrors(errs);

    }, [username, email, password])

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(password !== confirmPassword) {
            return setErrors(['Passwords do not match, Please try again']);
        }else{
            setValidationErrors([])

            const newUserInfo = {
                username,
                email,
                password,
                firstName,
                lastName,
                image
            };
            setErrors([]);
            try {
                // On success the user is set and this page redirects to Home.
                await dispatch(signUpUser(newUserInfo));
            } catch (res) {
                // Keep what the person typed so they can fix it and retry
                // (the old code cleared every field even when signup failed).
                setErrors(await getErrorMessages(res));
            }
        }
    };

    const updateFile = (e) => {
        const file = e.target.files[0];
        if (file) setImage(file)
    }

    if (currentUser) return (
        <Navigate to='/' replace />
    )

    return (
        <div className='page auth-page'>
            <section className='auth-card' aria-labelledby='signup-title'>
                <h1 id='signup-title'>Create your account</h1>
                <p className='lede muted'>Upload songs, make albums and build playlists.</p>
                <ul className='error-list' role='alert'>
                    {errors.map(err => (
                        <li key={err}>{err}</li>
                    ))}
                </ul>
                <form
                onSubmit={handleSubmit}
                className='form'>
                    <label className='field'>
                        Username
                        <input
                        type='text'
                        autoComplete='username'
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        />
                    </label>
                    <label className='field'>
                        Email
                        <input
                        type='email'
                        autoComplete='email'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        />
                    </label>
                    <label className='field'>
                        Password
                        <input
                        type='password'
                        autoComplete='new-password'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        />
                    </label>
                    <label className='field'>
                        Confirm password
                        <input
                        type='password'
                        autoComplete='new-password'
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        />
                    </label>
                    <label className='field'>
                        First name <span className='hint'>(optional)</span>
                        <input
                        type='text'
                        autoComplete='given-name'
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        />
                    </label>
                    <label className='field'>
                        Last name <span className='hint'>(optional)</span>
                        <input
                        type='text'
                        autoComplete='family-name'
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        />
                    </label>
                    <label className='field'>
                        Profile picture <span className='hint'>(optional)</span>
                        <input
                        type='file'
                        accept='image/jpeg,image/png,image/webp'
                        onChange={updateFile}
                        />
                    </label>
                    <button type='submit'
                        className='btn btn-primary btn-lg'
                        disabled={validationErrors.length > 0}
                    >Sign up</button>
                </form>
            </section>
        </div>
    )
}


export default SignupFormPage;
