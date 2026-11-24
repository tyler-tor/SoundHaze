import React, { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { getErrorMessages } from "../../store/csrf";


function LoginForm() {
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
        <ul className="error-list" role="alert">
          {errors.map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
        <label className="field">
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary">Log In</button>
      </form>
    );
  }

  export default LoginForm;
