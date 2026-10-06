import React from "react";
import "./ProgressBar.css";

export const ProgressBar = (props) => {
  const { status, percentage, label, additionalInfo, description } = props;
  return (
    <div className="progress-bar-custome">
      <div>{label}</div>
      <small>{description}</small>
      {status === "in-progress" && (
        <div className="progress-bar-layer">
          <div
            className="progress-bar-fill"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}
      {status === "success" && (
        <div>
          <i className="fa-regular fa-circle-check text-green"></i>
        </div>
      )}
      <small>{additionalInfo}</small>
    </div>
  );
};
