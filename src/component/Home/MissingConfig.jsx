import React from "react";

// Shown when `amplify_outputs.json` has not been generated yet.
function MissingConfig() {
  return (
    <div className="container pt-5" style={{ textAlign: "left" }}>
      <div className="d-flex justify-content-center">
        <div className="col-md-7">
          <span className="text-header">Amplify is not configured</span>
          <p className="text-normal mt-3">
            The file <code>amplify_outputs.json</code> was not found in the
            project root.
          </p>
          <p className="text-normal">
            Run <code>npx ampx sandbox</code> in the project root to deploy the
            Amplify backend and generate this file, then restart{" "}
            <code>npm run dev</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MissingConfig;
