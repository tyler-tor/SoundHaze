import { Link } from 'react-router-dom';

// Loading, empty and error states (S33).

// Gray placeholder cards while a list loads. `label` is read by screen readers.
export const SkeletonGrid = ({ count = 8, label = 'Loading' }) => (
    <div className="grid" role="status" aria-busy="true" aria-label={label}>
        {Array.from({ length: count }, (_, i) => (
            <div className="tile" key={i} aria-hidden="true">
                <div className="skeleton skeleton-cover" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line short" />
            </div>
        ))}
    </div>
);

// Placeholder for an album / playlist / song page while it loads.
export const SkeletonDetail = ({ label = 'Loading' }) => (
    <div className="page" role="status" aria-busy="true" aria-label={label}>
        <div className="detail-header" aria-hidden="true">
            <div className="detail-cover"><div className="skeleton skeleton-cover" /></div>
            <div className="detail-meta" style={{ flex: 1, width: '100%' }}>
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line short" />
            </div>
        </div>
    </div>
);

// "Nothing here yet" with a clear next step.
export const EmptyState = ({ title, children, action }) => (
    <div className="state-box">
        <h3>{title}</h3>
        {children && <p className="muted">{children}</p>}
        {action && <div className="row">{action}</div>}
    </div>
);

// A failed load: say what happened and offer a retry.
export const ErrorState = ({ title = "Couldn't load this page", children = 'Check your connection and try again.', onRetry }) => (
    <div className="state-box state-error" role="alert">
        <h3>{title}</h3>
        <p className="muted">{children}</p>
        {onRetry && (
            <div className="row">
                <button type="button" className="btn btn-secondary" onClick={onRetry}>Try again</button>
                <Link to="/" className="btn btn-ghost">Back to Home</Link>
            </div>
        )}
    </div>
);
