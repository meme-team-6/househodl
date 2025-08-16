import {
  fromIni,
  fromTemporaryCredentials,
} from "@aws-sdk/credential-providers";

export const getCredentialProvider = () => {
  console.log("Getting credential provider");
  if (process.env.SKIP_STS_ASSUME) {
    return fromIni({ profile: "rebnz" });
  }

  return fromTemporaryCredentials({
    params: {
      RoleArn: process.env.AWS_ROLE_TO_ASSUME!,
      RoleSessionName: "api",
    },
    masterCredentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
};
