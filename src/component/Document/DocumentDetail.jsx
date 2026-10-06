import React from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { downloadFile } from "../../constant";
import { filesize } from "filesize";

import "../Profile/MyProfile.css";

function DocumentDetail(props) {
  const { user } = props;
  const location = useLocation();
  const docItem = location.state;
  const navigate = useNavigate();

  const backPage = () => {
    navigate("/document");
  };

  // The detail page is opened from "My Document" with the document in the
  // router state. Opening the URL directly goes back to the list.
  if (!docItem) {
    return <Navigate to="/document" replace />;
  }

  return (
    <div className="upload-body">
      <div className="title content-header">Document Detail</div>
      <div className="content-body">
        <button
          type="button"
          className="btn btn-outline-secondary btn-gray text-normal"
          onClick={() => downloadFile(docItem.file, docItem.path, user.identityId)}
        >
          <i className="fa-solid fa-download icon-sm" aria-hidden="true"></i>
          &nbsp;Download
        </button>
        <div className="profile-detail">
          <div className="col-50" style={{ borderRight: "1px solid #00ABD0" }}>
            <div className="infor-item">
              <label className="text-normal text-line text-black">Owner</label>
              <br />
              <span className="text-normal text-line">{user.username}</span>
            </div>
            <div className="infor-item">
              <label className="text-normal text-line text-black">Name</label>
              <br />
              <span className="text-normal text-line">{docItem.file}</span>
            </div>
            <div className="infor-item">
              <label className="text-normal text-line text-black">
                Last modified
              </label>
              <br />
              <span className="text-normal text-line">{docItem.modified}</span>
            </div>
            <div className="infor-item">
              <label className="text-normal text-line text-black">Size</label>
              <br />
              <span className="text-normal text-line">{filesize(Number(docItem.size) || 0, { standard: "jedec" })}</span>
            </div>
            <div className="infor-item">
              <label className="text-normal text-line text-black">Type</label>
              <br />
              <span className="text-normal text-line">
                {docItem.type ? docItem.type : "－"}
              </span>
            </div>
          </div>
          <div className="col-50" style={{ paddingLeft: "2%" }}>
            <div className="infor-item">
              <label className="text-normal text-line text-black">Tag</label>
              <br />
              <span className="text-normal text-line">
                {docItem.tag ? docItem.tag : "－"}
              </span>
            </div>
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
      </div>
    </div>
  );
}

export default DocumentDetail;
