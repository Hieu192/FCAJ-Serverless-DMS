import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signUp, confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { checkValidPwd } from "../../constant";

function Register() {
  const [isRegister, setIsRegister] = useState(false);
  const [canVerifyExisting, setCanVerifyExisting] = useState(false);
  const [warningStatus, setWarningStatus] = useState("");
  const [unm, setUnm] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const warning = useRef(null);

  const redirectPage = () => {
    navigate("/signin");
  };

  const showWarning = (message) => {
    if (warning.current && !warning.current.classList.contains("active")) {
      warning.current.classList.add("active");
    }
    setWarningStatus(message);
  };

  const checkInputData = () => {
    if (unm.length === 0 || email.length === 0 || pwd.length === 0) {
      showWarning("Display name, email and password can't be blank");
      return false;
    }
    const pwdWarning = checkValidPwd(pwd);
    if (pwdWarning.length !== 0) {
      showWarning(pwdWarning);
      return false;
    }
    return true;
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    if (!checkInputData()) return;

    try {
      // The user signs in with the email address.
      // The display name is saved in the `preferred_username` attribute.
      await signUp({
        username: email,
        password: pwd,
        options: {
          userAttributes: {
            email,
            preferred_username: unm,
          },
        },
      });
      setIsRegister(true);
    } catch (error) {
      console.log(error);
      if (error.name === "UsernameExistsException") {
        setCanVerifyExisting(true);
        showWarning("Email already exists");
      } else {
        showWarning(error.message || "Sign up fail");
      }
    }
  };

  // Send a new code to an email that was registered but not verified yet.
  const verifyExistingAccount = async () => {
    try {
      await resendSignUpCode({ username: email });
      setIsRegister(true);
    } catch (error) {
      console.log(error);
      showWarning(error.message || "Cannot send verification code");
    }
  };

  async function handleConfirmSignUp(e) {
    e.preventDefault();
    if (!code || code.length < 6) {
      alert("Please enter code again");
      return;
    }

    try {
      await confirmSignUp({ username: email, confirmationCode: code.trim() });
    } catch (error) {
      console.log("error confirming sign up", error);
      alert("Verify fail!");
      return;
    }
    redirectPage();
  }

  return (
    <div className="container pt-5" style={{ textAlign: "left" }}>
      <div className="d-flex justify-content-center">
        {!isRegister && (
          <div className="col-md-7">
            <span className="text-header">Register</span>
            <div className="mb-3 mt-3">
              <label className="text-normal" htmlFor="unm">
                Display name
              </label>
              <br />
              <input
                className="text-normal text-black"
                id="unm"
                placeholder="Enter display name"
                name="unm"
                onChange={(e) => setUnm(e.target.value)}
                value={unm}
              />
            </div>
            <div className="mb-3">
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
                autoComplete="new-password"
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
            <div className="check-data" ref={warning}>
              <i className="fa-solid fa-triangle-exclamation text-red"></i>
              &nbsp;&nbsp;
              <label className="text-red">{warningStatus}</label>
              {canVerifyExisting && (
                <>
                  &nbsp;&nbsp;
                  <button
                    type="button"
                    className="btn btn-link text-normal p-0"
                    onClick={verifyExistingAccount}
                  >
                    Verify this account
                  </button>
                </>
              )}
            </div>
            <div className="login-footer">
              <button type="button" className="btn btn-cancel text-normal" onClick={redirectPage}>
                Sign in
              </button>
              &nbsp;&nbsp;
              <button
                type="button"
                className="btn btn-blue text-normal"
                onClick={handleSignUp}
              >
                Sign up
              </button>
            </div>
          </div>
        )}
        {isRegister && (
          <div className="col-md-7">
            <span className="text-header">Verify Account</span>
            <div>
              <div className="mb-5 mt-5">
                <label className="text-normal" htmlFor="code">
                  Verify code
                </label>
                <input
                  className="text-normal text-black"
                  id="code"
                  name="code"
                  autoComplete="one-time-code"
                  onChange={(e) => setCode(e.target.value)}
                  value={code}
                />
              </div>
              <div>
                <label className="text-yellow">
                  Note: Get code from email and enter it.
                </label>
              </div>
              <div className="login-footer">
                <button
                  className="btn btn-blue text-normal"
                  onClick={handleConfirmSignUp}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
