import { getUrl } from "aws-amplify/storage";

// Invoke URL of the API Gateway stage, for example:
// https://abcde12345.execute-api.ap-southeast-1.amazonaws.com/dev
// Replace this value with your own Invoke URL (workshop 135 and later).
export const APP_API_URL = "https://API_ID.execute-api.ap-southeast-1.amazonaws.com/dev";
export const DEFAULT_REGION = "ap-southeast-1";

export const checkValidPwd = (pwd) => {
  let warningCheck = "";
  const uppercaseRegExp = /(?=.*?[A-Z])/;
  const lowercaseRegExp = /(?=.*?[a-z])/;
  const digitsRegExp = /(?=.*?[0-9])/;
  // Same special characters as the default Amazon Cognito password policy
  const symbolRegExp = /[\^$*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ]/;
  const minLengthRegExp = /.{8,}/;

  if (!uppercaseRegExp.test(pwd)) {
    warningCheck = "At least one Uppercase";
  } else if (!lowercaseRegExp.test(pwd)) {
    warningCheck = "At least one Lowercase";
  } else if (!digitsRegExp.test(pwd)) {
    warningCheck = "At least one digit";
  } else if (!symbolRegExp.test(pwd)) {
    warningCheck = "At least one special character";
  } else if (!minLengthRegExp.test(pwd)) {
    warningCheck = "At least minimum 8 characters";
  }

  return warningCheck;
};

// Files are stored in S3 under `protected/{identityId}/{file name}`.
// The Lambda functions of the series build the same path when they save
// document information to DynamoDB.
export const buildFilePath = (identityId, fileName) =>
  `protected/${identityId}/${fileName}`;

// Use the path saved in DynamoDB when it is an S3 key, otherwise build it.
export const resolveFilePath = (name, path, identityId) =>
  typeof path === "string" && path.startsWith("protected/")
    ? path
    : buildFilePath(identityId, name);

export const downloadFile = async (name, path, identityId) => {
  try {
    const { url } = await getUrl({
      path: resolveFilePath(name, path, identityId),
      options: { validateObjectExistence: true },
    });
    const link = document.createElement("a");
    link.href = url.toString();
    link.setAttribute("download", name);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    alert("Oops! Download failed!");
    console.log(error);
  }
};
