import { Link } from "react-router-dom";
import { usePageTitle } from "../common";

const PageNotFound = ({ title = 'Page not found', message = "We couldn't find that page. It may have moved, or the link may be wrong." }) => {
    usePageTitle(title);

    return (
        <div className="page not-found">
            <h1>{title}</h1>
            <p className="lede muted">{message}</p>
            <div className="row">
                <Link to="/" className="btn btn-primary">Back to Home</Link>
                <Link to="/songs" className="btn btn-secondary">Browse songs</Link>
            </div>
        </div>
    )
}

export default PageNotFound;
