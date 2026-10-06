import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signOut } from "aws-amplify/auth";

import "./Authen.css";

function Login(props) {
  const { refreshUser } = props;
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const navigate = useNavigate();

  const redirectSignUpPage = () => {
    navigate("/signup");
  };

  async function handleSignIn(event) {
    event.preventDefault();
    try {
      let result;
      try {
        result = await signIn({ username: email, password: pwd });
      } catch (error) {
        // A previous session is still stored in the browser: sign out and retry.
        if (error.name !== "UserAlreadyAuthenticatedException") throw error;
        await signOut();
        result = await signIn({ username: email, password: pwd });
      }

      if (result.nextStep.signInStep === "CONFIRM_SIGN_UP") {
        alert("Your account is not verified. Open Sign up, enter the same email and click \"Verify this account\".");
        return;
      }
      if (!result.isSignedIn) {
        alert(`Sign in requires another step: ${result.nextStep.signInStep}`);
        return;
      }

      await refreshUser();
      navigate("/");
    } catch (error) {
      console.log("Sign in fail: ", error);
      alert("Sign in fail");
    }
  }

  return (
    <div className="container pt-5" style={{ textAlign: "left" }}>
      <div className="d-flex justify-content-center">
        <div className="col-md-7">
          <span className="text-header">Login</span>
          <div className="mb-3 mt-3">
            <label className="text-normal" htmlFor="email">
              Email
            </label>
            <br />
            <input
              type="email"
              className="text-normal text-black"
              id="email"
              placeholder="Enter email"
              name="email"
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value.trim())}
              value={email}
            />
          </div>
          <div className="mb-3">
            <label className="text-normal" htmlFor="pwd">
              Password
            </label>
            <br />
            <input
              type="password"
              className="text-normal text-black"
              id="pwd"
              placeholder="Enter password"
              name="pswd"
              autoComplete="current-password"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
            />
          </div>
          <div className="form-check mb-3">
            <label className="form-check-label">
              <input
                className="form-check-input"
                type="checkbox"
                name="remember"
              />{" "}
              Remember me
            </label>
          </div>
          <div className="login-footer">
            <button type="button" className="btn btn-cancel text-normal" onClick={redirectSignUpPage}>
              Sign up
            </button>
            &nbsp;&nbsp;
            <button type="button" className="btn btn-blue text-normal" onClick={handleSignIn}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
