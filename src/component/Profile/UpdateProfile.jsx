import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  updatePassword,
  updateUserAttributes,
  confirmUserAttribute,
} from "aws-amplify/auth";
import "./MyProfile.css";
import { checkValidPwd } from "../../constant";

// Result codes of each update step
const SKIPPED = 3; // nothing to update
const INVALID = 2; // input is not valid, a warning is shown
const FAILED = 0;
const SUCCESS = 1;

function UpdateProfile(props) {
  const { refreshUser } = props;
  const location = useLocation();
  const myProfile = location.state || {};
  const [newEmail, setNewEmail] = useState(myProfile.email || "");
  const [newPwd, setNewPwd] = useState("");
  const [oldPwd, setOldPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [warningStatus, setWarningStatus] = useState("");
  const warning = useRef(null);
  const navigate = useNavigate();

  const backPage = () => {
    navigate("/profile");
  };

  const showWarning = (message) => {
    if (warning.current && !warning.current.classList.contains("active")) {
      warning.current.classList.add("active");
    }
    setWarningStatus(message);
  };

  const clearWarning = () => {
    if (warning.current) warning.current.classList.remove("active");
    setWarningStatus("");
  };

  const updateProfile = async () => {
    const updatePwdResult = await changePassword();
    if (updatePwdResult === INVALID) return;
    const updateEmailResult = await changeEmail();
    if (updateEmailResult === INVALID) return;

    if (updatePwdResult === FAILED) {
      alert("Update password fail");
    } else if (updateEmailResult === FAILED) {
      alert("Update email fail");
    } else if (updatePwdResult === SKIPPED && updateEmailResult === SKIPPED) {
      showWarning("Please fill in the information you want to update");
    } else {
      clearWarning();
      alert("Update profile successful");
      await refreshUser();
    }
  };

  const changePassword = async () => {
    if (!oldPwd && !newPwd && !confirmPwd) return SKIPPED;
    if (!oldPwd || !newPwd || !confirmPwd) {
      showWarning("Please fill in all the password fields");
      return INVALID;
    }
    if (newPwd !== confirmPwd) {
      showWarning("New password and Confirm password aren't matching");
      return INVALID;
    }
    const checkResult = checkValidPwd(newPwd);
    if (checkResult.length !== 0) {
      showWarning(checkResult);
      return INVALID;
    }
    try {
      await updatePassword({ oldPassword: oldPwd, newPassword: newPwd });
      return SUCCESS;
    } catch (error) {
      console.log(error);
      return FAILED;
    }
  };

  const changeEmail = async () => {
    if (!newEmail) {
      showWarning("Email cannot be empty");
      return INVALID;
    }
    if (newEmail === myProfile.email) return SKIPPED;
    try {
      const output = await updateUserAttributes({
        userAttributes: { email: newEmail },
      });
      // Cognito sends a verification code to the new email address.
      if (output.email?.nextStep?.updateAttributeStep === "CONFIRM_ATTRIBUTE_WITH_CODE") {
        const code = window.prompt(`Enter the verification code sent to ${newEmail}`);
        if (!code) return FAILED;
        await confirmUserAttribute({
          userAttributeKey: "email",
          confirmationCode: code.trim(),
        });
      }
      return SUCCESS;
    } catch (error) {
      console.log(error);
      return FAILED;
    }
  };

  return (
    <div className="upload-body">
      <div className="title content-header">Update Profile</div>
      <div className="content-body">
        <div className="update-content">
          <div className="infor-item">
            <label className="text-normal text-line text-black">
              User name
            </label>
            <br />
            <span className="text-normal text-line">{myProfile.name}</span>
          </div>
          <div className="infor-item">
            <label className="text-normal text-line text-black">Email</label>
            <br />
            <input
              className="text-normal text-line input-short"
              onChange={(e) => setNewEmail(e.target.value.trim())}
              defaultValue={myProfile.email}
            ></input>
          </div>
          <div className="infor-item">
            <label className="text-normal text-line text-black">
              Old Password
            </label>
            <br />
            <input
              type="password"
              className="text-normal text-line input-short"
              placeholder="••••••••"
              autoComplete="current-password"
              onChange={(e) => setOldPwd(e.target.value)}
            ></input>
          </div>
          <div className="infor-item">
            <label className="text-normal text-line text-black">
              New password
            </label>
            <br />
            <input
              type="password"
              className="text-normal text-line input-short"
              autoComplete="new-password"
              onChange={(e) => setNewPwd(e.target.value)}
            ></input>
          </div>
          <div className="infor-item">
            <label className="text-normal text-line text-black">
              Confirm password
            </label>
            <br />
            <input
              type="password"
              className="text-normal text-line input-short"
              autoComplete="new-password"
              onChange={(e) => setConfirmPwd(e.target.value)}
            ></input>
          </div>
          <div className="check-data" ref={warning}>
            <i className="fa-solid fa-triangle-exclamation text-red"></i>
            &nbsp;&nbsp;
            <label className="text-red">{warningStatus}</label>
          </div>
        </div>
      </div>
      <div className="content-footer">
        <button
          type="button"
          className="btn btn-cancel text-normal"
          onClick={backPage}
        >
          Cancel
        </button>
        &nbsp;&nbsp;
        <button
          type="button"
          className="btn btn-blue text-normal"
          onClick={updateProfile}
        >
          Update
        </button>
      </div>
    </div>
  );
}

export default UpdateProfile;
