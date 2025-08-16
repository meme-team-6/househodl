import * as pulumi from "@pulumi/pulumi";
import {
  createAssumableRole,
  createDynamoRolePolicy,
  createDynamoTable,
  createServiceBucket,
  deployAmplifySpa,
  deployLightsailService,
  resolveMap,
} from "./utils";
import { execSync } from "child_process";

const awsConfig = new pulumi.Config("aws");
const awsProfile = awsConfig.require("profile");
const awsRegion = awsConfig.require("region");
const appConfig = new pulumi.Config("app");
const zoneDomain = appConfig.require("zone_domain");
const zoneId = appConfig.require("zone_id");

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

// BACKEND

const USERS_TABLE_NAME = `${namespace}-users-table`;
const usersTable = createDynamoTable(USERS_TABLE_NAME, {
  hashKey: "userId",
  indexes: [
    {
      hashKey: "email",
      name: "email-index",
    },
  ],
});

const { role, accessKeyId, secretAccessKey, roleToAssume } =
  createAssumableRole({
    namespace,
  });

createDynamoRolePolicy({
  name: "househodl-dynamo-policy",
  role,
  tables: [usersTable],
});

const JWT_SECRET = "secret";
const environment = resolveMap({
  USERS_TABLE: usersTable.name,
  JWT_SECRET,
  AWS_ACCESS_KEY_ID: accessKeyId,
  AWS_SECRET_ACCESS_KEY: secretAccessKey,
  AWS_ROLE_TO_ASSUME: roleToAssume,
  AWS_REGION: awsRegion,
});

deployLightsailService({
  domain: {
    zoneId,
    zoneDomain,
    subDomain: "api",
  },
  serviceName: "househodl-api",
  imageVersion: commitHash,
  serviceDirectory: "../services/api",
  environment,
  healthCheck: {
    path: "/health",
    successCodes: "200",
  },
});
