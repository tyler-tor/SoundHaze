import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createComment, getComments, removeComment, updateComment } from '../../store/comments';
import { getErrorMessages } from '../../store/csrf';
import { Cover, EmptyState, ErrorState, useLoad, useToast } from '../common';
import DemoUser from '../DemoUser/DemoUser';
import LoginFormModal from '../LoginFormModal/LoginFormModal';
import './comments.css';

const MAX = 256; // the API's limit

const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

// One comment. The author sees Edit and Delete.
const CommentItem = ({ comment, isOwner }) => {
    const dispatch = useDispatch();
    const toast = useToast();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(comment.body);
    const [errors, setErrors] = useState([]);
    const [busy, setBusy] = useState(false);

    const save = async (e) => {
        e.preventDefault();
        setErrors([]);
        setBusy(true);
        try {
            await dispatch(updateComment({ commentId: comment.id, body: draft }));
            setEditing(false);
        } catch (res) {
            setErrors(await getErrorMessages(res));
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        try {
            await dispatch(removeComment({ songId: comment.songId, commentId: comment.id }));
            toast.success('Comment deleted.');
        } catch (res) {
            toast.error((await getErrorMessages(res)).join(' '));
        }
    };

    return (
        <li className="comment">
            <Cover src={comment.User?.previewImage} label={comment.User?.username} size={68} className="avatar-xs comment-avatar" />
            <div className="comment-main">
                <p className="comment-meta">
                    <strong>{comment.User?.username}</strong>
                    <time dateTime={comment.createdAt} className="muted">{formatDate(comment.createdAt)}</time>
                </p>
                {editing ? (
                    <form className="form" onSubmit={save}>
                        <label className="field">
                            <span className="visually-hidden">Edit your comment</span>
                            <textarea value={draft} maxLength={MAX} onChange={(e) => setDraft(e.target.value)} required />
                        </label>
                        <ul className="error-list" aria-live="polite">
                            {errors.map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                        <div className="row">
                            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>Save</button>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setDraft(comment.body); setErrors([]); }}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <p className="comment-body">{comment.body}</p>
                )}
                {isOwner && !editing && (
                    <div className="row comment-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} aria-label="Edit your comment">Edit</button>
                        <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={remove} aria-label="Delete your comment">Delete</button>
                    </div>
                )}
            </div>
        </li>
    );
};

// The comments section of a song page: the list, plus a form for logged-in users.
const Comments = ({ songId }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.session.user);
    const comments = useSelector((state) => state.comments.bySong[songId]) || [];
    const [body, setBody] = useState('');
    const [errors, setErrors] = useState([]);
    const [busy, setBusy] = useState(false);
    const { status, reload } = useLoad(() => dispatch(getComments(songId)), [dispatch, songId]);

    const submit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setBusy(true);
        try {
            await dispatch(createComment({ songId, body }));
            setBody('');
        } catch (res) {
            setErrors(await getErrorMessages(res));
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="section comments" aria-labelledby="comments-title">
            <div className="section-head">
                <h2 id="comments-title">Comments{comments.length > 0 && <span className="muted"> ({comments.length})</span>}</h2>
            </div>

            {user ? (
                <form className="form comment-form" onSubmit={submit}>
                    <label className="field">
                        Add a comment
                        <textarea
                            value={body}
                            maxLength={MAX}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="What did you think?"
                            required
                        />
                        <span className="hint" aria-hidden="true">{body.length}/{MAX}</span>
                    </label>
                    <ul className="error-list" aria-live="polite">
                        {errors.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                    <div>
                        <button type="submit" className="btn btn-primary" disabled={busy || !body.trim()}>Post comment</button>
                    </div>
                </form>
            ) : (
                <p className="comment-signin">
                    <LoginFormModal className="link-btn">Log in</LoginFormModal> or{' '}
                    <DemoUser className="link-btn">try the demo</DemoUser> to join the conversation.
                </p>
            )}

            {comments.length === 0 && status === 'loading' && (
                <div role="status" aria-busy="true" aria-label="Loading comments" className="stack">
                    <div className="skeleton skeleton-line" />
                    <div className="skeleton skeleton-line short" />
                </div>
            )}
            {comments.length === 0 && status === 'error' && <ErrorState title="Couldn't load comments" onRetry={reload} />}
            {comments.length === 0 && status === 'ready' && (
                <EmptyState title="No comments yet">Be the first to say something about this song.</EmptyState>
            )}
            <ul className="comment-list">
                {comments.map((c) => (
                    <CommentItem key={c.id} comment={c} isOwner={user?.id === c.userId} />
                ))}
            </ul>
        </section>
    );
};

export default Comments;
