import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@fontsource/inter";

// Configure Amplify before any component uses Auth or Storage.
import { isAmplifyConfigured } from "./amplifyConfig";
import App from "./App";
import MissingConfig from "./component/Home/MissingConfig";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(isAmplifyConfigured ? <App /> : <MissingConfig />);
