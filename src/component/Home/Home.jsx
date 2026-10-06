import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { filesize } from "filesize";
import api, { calculateGeneralInfor } from "../../api";
import "./Home.css";

function Home(props) {
  const { user, setGenInfor, genInfor } = props;
  const navigate = useNavigate();

  const redirectPage = () => {
    navigate("/upload");
  };

  // Used storage and amount of files are calculated from the document list
  // returned by the API (GET /docs/{id}).
  useEffect(() => {
    api
      .get(`/docs/${user.id}`)
      .then((res) => {
        setGenInfor(calculateGeneralInfor(res.data));
      })
      .catch((err) => {
        console.log("Cannot load the document list: ", err);
      });
  }, [user.id, setGenInfor]);

  return (
    <div className="upload-body">
      <div className="title content-header">Home</div>
      <div className="content-body">
        <button
          type="button"
          className="btn btn-gray text-normal"
          onClick={redirectPage}
        >
          <i className="fa-solid fa-upload icon-sm" aria-hidden="true"></i>
          &nbsp;Upload
        </button>
        <div className="update-content">
          <div className="infor-item">
            <label className="title text-line">
              Welcome <strong>{user.username}</strong> to FCJ Document
              Management System
            </label>
            <br />
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
          <div className="infor-item">
            <label className="text-normal text-line text-black">
              For demonstration purposes, we only support:
              <br />
              <span className="text-gray">
                - Max amount of files / 1 upload: <strong>80</strong>
                <br />- Max size of a file: <strong>5 MB</strong>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
