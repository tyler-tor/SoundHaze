import React, { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import DemoUser from "../DemoUser/DemoUser";
import { getErrorMessages } from "../../store/csrf";


function LoginForm({ onNavigate }) {
    const dispatch = useDispatch();
    const [credential, setCredential] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);

    const handleSubmit = (e) => {
      e.preventDefault();
      setErrors([]);
      return dispatch(sessionActions.loginUser({ credential, password })).catch(
        async (res) => {
          setErrors(await getErrorMessages(res));
        }
      );
    };

    return (
      <form onSubmit={handleSubmit}
      className="form">
        <ul className="error-list" aria-live="polite">
          {errors.map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
        <label className="field">
          Username or Email
          <input
            type="text"
            autoComplete="username"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary">Log in</button>
        <div className="auth-alt">
          <p className="muted">
            New here? <Link to="/signup" onClick={onNavigate}>Create an account</Link>
          </p>
          <DemoUser className="btn btn-secondary btn-sm">Or try the demo</DemoUser>
        </div>
      </form>
    );
  }

  export default LoginForm;
