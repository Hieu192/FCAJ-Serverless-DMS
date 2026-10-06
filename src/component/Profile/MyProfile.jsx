import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserAttributes, fetchMFAPreference } from "aws-amplify/auth";
import { filesize } from "filesize";
import "./MyProfile.css";

function MyProfile(props) {
  const { genInfor } = props;
  const [myProfile, setMyProfile] = useState({});
  const navigate = useNavigate();

  const redirectPage = () => {
    navigate("/profile/update", { state: myProfile });
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const attributes = await fetchUserAttributes();
        let mfa = "－";
        try {
          const mfaPreference = await fetchMFAPreference();
          mfa = mfaPreference.preferred || (mfaPreference.enabled || []).join(", ") || "－";
        } catch (error) {
          console.log("Cannot get MFA preference: ", error);
        }
        setMyProfile({
          id: attributes.sub,
          name: attributes.preferred_username || attributes.email,
          email: attributes.email,
          status: attributes.email_verified === "true" ? "Confirmed" : "Unconfirmed",
          mfa,
        });
      } catch (error) {
        console.log("error: ", error);
      }
    }
    loadProfile();
  }, []);

  return (
    <div className="upload-body">
      <div className="title content-header">My Profile</div>
      <div className="content-body">
        <button
          type="button"
          className="btn btn-gray text-normal"
          onClick={redirectPage}
        >
          Update profile
        </button>
        <div className="profile-detail">
          <div className="col-50" style={{ borderRight: "1px solid #00ABD0" }}>
            <div className="infor-item">
              <label className="text-normal text-line text-black">
                User name
              </label>
              <br />
              <span className="text-normal text-line">{myProfile.name}</span>
            </div>
            <div className="infor-item">
              <label className="text-normal text-line text-black">
                User ID
              </label>
              <br />
              <span className="text-normal text-line">{myProfile.id}</span>
            </div>
            <div className="infor-item">
              <label className="text-normal text-line text-black">Email</label>
              <br />
              <span className="text-normal text-line">{myProfile.email}</span>
            </div>
            <div className="infor-item">
              <label className="text-normal text-line text-black">
                Used Storage
              </label>
              <br />
              <span className="text-normal text-line">
                {filesize(genInfor.size, { standard: "jedec" })}
              </span>
            </div>
            <div className="infor-item">
              <label className="text-normal text-line text-black">
                Amount of Files
              </label>
              <br />
              <span className="text-normal text-line">
                {genInfor.amount > 1 ? genInfor.amount + " files" : genInfor.amount + " file"}
              </span>
            </div>
          </div>
          <div className="col-50" style={{ paddingLeft: "2%" }}>
            <div className="infor-item">
              <label className="text-normal text-line text-black">
                MFA methods
              </label>
              <br />
              <span className="text-normal text-line">{myProfile.mfa}</span>
            </div>
            <div className="infor-item">
              <label className="text-normal text-line text-black">
                Confirmation status
              </label>
              <br />
              <span className="text-normal text-line text-green">
                {myProfile.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
