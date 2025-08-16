import * as pulumi from "@pulumi/pulumi";
import { createServiceBucket, deployAmplifySpa } from "./utils";
import { execSync } from "child_process";

const awsConfig = new pulumi.Config("aws");
const awsProfile = awsConfig.require("profile");
const appConfig = new pulumi.Config("app");
const zoneDomain = appConfig.require("zone_domain");

const namespace = `ethglobal25-${pulumi.getStack()}`;
const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
const amplifyServiceBucket = createServiceBucket({
  namespace,
});

// change if wanted root
const appDomain = `${zoneDomain}`;
deployAmplifySpa({
  buildDirectory: "../apps/frontend/dist",
  namespace,
  serviceBucketId: amplifyServiceBucket.id,
  appName: "ethglobal25-frontend",
  domain: appDomain,
  awsProfile,
  version: commitHash,
  subdomains: ["www"],
});

export const ethglobal25FrontendUrl = pulumi.interpolate`https://${appDomain}`;
