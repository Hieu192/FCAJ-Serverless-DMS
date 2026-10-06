import { Amplify } from "aws-amplify";

// `amplify_outputs.json` is generated in the project root by Amplify Gen 2
// (`npx ampx sandbox`). It contains the Cognito and S3 configuration.
//
// The file is not committed to Git, so it does not exist right after cloning.
// `import.meta.glob` lets the app start without it and show a helpful message
// instead of failing the build.
const outputsModules = import.meta.glob("../amplify_outputs.json", {
  eager: true,
  import: "default",
});

export const amplifyOutputs = Object.values(outputsModules)[0];
export const isAmplifyConfigured = Boolean(amplifyOutputs);

if (isAmplifyConfigured) {
  Amplify.configure(amplifyOutputs);
}
