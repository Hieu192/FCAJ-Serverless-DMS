import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";
import { APP_API_URL } from "./constant";

// Shared HTTP client for the API Gateway endpoints.
// A trailing slash in APP_API_URL is removed so `/docs` does not become `//docs`.
const api = axios.create({
  baseURL: APP_API_URL.replace(/\/+$/, ""),
});

// Send the Cognito ID token with every request. APIs without an authorizer
// ignore the header, and APIs with a Cognito authorizer can verify it.
api.interceptors.request.use(async (config) => {
  try {
    const { tokens } = await fetchAuthSession();
    const idToken = tokens?.idToken?.toString();
    if (idToken) {
      config.headers.Authorization = idToken;
    }
  } catch (error) {
    console.log("Cannot get the auth session: ", error);
  }
  return config;
});

// Total size and number of files, calculated from the document list.
export const calculateGeneralInfor = (docs) => {
  const list = Array.isArray(docs) ? docs : [];
  return {
    size: list.reduce((total, doc) => total + (Number(doc.size) || 0), 0),
    amount: list.length,
  };
};

export default api;
