import { useNavigate } from "react-router-dom";
import './pagenotfound.css'

const PageNotFound = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/')
    }

    return (
        <div className="page-not-found">
            <div
            className="pnf-container">
                <h1>
                    404: Page Not Found
                </h1>
                <p>Click the button to go back home!</p>
                <button onClick={handleClick}>
                    Back to Home!
                </button>
            </div>
        </div>
    )
}

export default PageNotFound;
