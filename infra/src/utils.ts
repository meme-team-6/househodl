import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as command from "@pulumi/command";

type DeployAmplifyCommandOptions = {
  appId: pulumi.Input<string>;
  branchName: pulumi.Input<string>;
  s3Bucket: pulumi.Input<string>;
  s3Key: pulumi.Input<string>;
  awsProfile: pulumi.Input<string>;
};

const deployAmplifyCommand = ({
  appId,
  branchName,
  s3Bucket,
  s3Key,
  awsProfile,
}: DeployAmplifyCommandOptions) =>
  pulumi.interpolate`aws amplify start-deployment --app-id ${appId} --branch-name ${branchName} --source-url "s3://${s3Bucket}/${s3Key}" --profile ${awsProfile}`;

type DeployAmplifySpaOptions = {
  namespace: string;
  buildDirectory: string;
  version?: string;
  serviceBucketId: pulumi.Input<string>;
  appName: string;
  domain: string;
  subdomains?: string[];
  awsProfile: string;
};

export const deployAmplifySpa = ({
  buildDirectory,
  namespace,
  version = "latest",
  serviceBucketId,
  appName,
  domain,
  subdomains = [],
  awsProfile,
}: DeployAmplifySpaOptions) => {
  const assets = new pulumi.asset.AssetArchive({
    ".": new pulumi.asset.FileArchive(buildDirectory),
  });

  const assetsS3Object = new aws.s3.BucketObject(
    `${namespace}-${appName}-${version}-asset`,
    {
      bucket: serviceBucketId,
      source: assets,
      key: `${namespace}-${appName}-${version}-asset.zip`,
    }
  );

  const app = new aws.amplify.App(`${namespace}-${appName}-app`, {
    name: `${namespace}/${appName}-${pulumi.getStack()}`,
    customRules: [
      {
        source:
          "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf|map|json)$)([^.]+$)/>",
        target: "/index.html",
        status: "200",
      },
    ],
  });

  const branch = new aws.amplify.Branch(`${namespace}-${appName}-branch`, {
    branchName: "main",
    appId: app.id,
    enableAutoBuild: false,
  });

  new aws.amplify.DomainAssociation(
    `${namespace}-${appName}-domain-association`,
    {
      appId: app.id,
      domainName: domain,
      subDomains: [
        { branchName: branch.branchName, prefix: "" },
        ...subdomains.map((subdomain) => ({
          branchName: branch.branchName,
          prefix: subdomain,
        })),
      ],
    }
  );

  const commandString = deployAmplifyCommand({
    appId: app.id,
    branchName: branch.branchName,
    s3Bucket: assetsS3Object.bucket,
    s3Key: assetsS3Object.key,
    awsProfile,
  });

  new command.local.Command(
    `${namespace}-${appName}-deploy-command`,
    {
      create: commandString,
    },
    {
      replaceOnChanges: ["create"],
    }
  );
};

type CreateServiceBucketOptions = {
  namespace: string;
};

export const createServiceBucket = ({
  namespace,
}: CreateServiceBucketOptions) => {
  const serviceBucket = new aws.s3.BucketV2(`${namespace}-service-bucket`, {});

  const serviceBucketOwnershipControls = new aws.s3.BucketOwnershipControls(
    `${namespace}-ownership-controls`,
    {
      bucket: serviceBucket.id,
      rule: {
        objectOwnership: "BucketOwnerPreferred",
      },
    }
  );

  const serviceBucketPublicAccessBlock = new aws.s3.BucketPublicAccessBlock(
    `${namespace}-access-block`,
    {
      bucket: serviceBucket.id,
      blockPublicAcls: false,
      blockPublicPolicy: false,
      ignorePublicAcls: false,
      restrictPublicBuckets: false,
    }
  );

  new aws.s3.BucketAclV2(
    `${namespace}-acl`,
    {
      bucket: serviceBucket.id,
      acl: "private",
    },
    {
      dependsOn: [
        serviceBucketOwnershipControls,
        serviceBucketPublicAccessBlock,
      ],
    }
  );

  return serviceBucket;
};
