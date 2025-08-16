import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as command from "@pulumi/command";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker";
import * as lightsail from "@pulumi/aws/lightsail";

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

type DynamoMarshallType = "S" | "N" | "B";

type CreateDynamoTableOptions = {
  hashKey: string;
  hashKeyType?: DynamoMarshallType;
  sortKey?: string;
  sortKeyType?: DynamoMarshallType;
  ttlColumnName?: string; // Dynamo does not GUARANTEE TTL delete
  indexes?: {
    name: string;
    hashKey: string;
    sortKey?: string;
    hashKeyType?: DynamoMarshallType;
    sortKeyType?: DynamoMarshallType;
  }[];
  billingMode?: "PAY_PER_REQUEST" | "PROVISIONED";
};

export const createDynamoTable = (
  name: string,
  {
    hashKey,
    hashKeyType = "S",
    sortKey,
    sortKeyType = "S",
    indexes: gsi,
    ttlColumnName,
    billingMode = "PAY_PER_REQUEST",
  }: CreateDynamoTableOptions
) => {
  const attributes: aws.types.input.dynamodb.TableAttribute[] = [
    { name: hashKey, type: hashKeyType },
  ];

  sortKey && attributes.push({ name: sortKey, type: sortKeyType });

  gsi?.forEach(({ hashKey, sortKey, hashKeyType = "S", sortKeyType = "S" }) => {
    attributes.push({
      name: hashKey,
      type: hashKeyType,
    });
    sortKey &&
      attributes.push({
        name: sortKey,
        type: sortKeyType,
      });
  });

  return new aws.dynamodb.Table(name, {
    billingMode: billingMode,
    hashKey: hashKey,
    rangeKey: sortKey,
    attributes,
    ttl: ttlColumnName
      ? {
          attributeName: ttlColumnName,
          enabled: true,
        }
      : undefined,
    globalSecondaryIndexes: gsi?.map(({ name, hashKey, sortKey }) => ({
      name,
      hashKey,
      rangeKey: sortKey,
      projectionType: "ALL",
    })),
  });
};

type CreateDynamoRolePolicyOptions = {
  name: string;
  role: aws.iam.Role;
  tables: aws.dynamodb.Table[];
  actions?: string[];
};
export const createDynamoRolePolicy = ({
  name,
  role,
  tables,
  actions = ["dynamodb:*"],
}: CreateDynamoRolePolicyOptions) => {
  // get all the table arns, and construct all the gsi arns
  const arnCollections = tables.map((table) => {
    return table.arn.apply((tableArn) =>
      table.globalSecondaryIndexes.apply((gsis) => {
        const names = gsis?.map((gsi) => gsi.name) ?? [];
        const indexArns = names.map((name) => `${tableArn}/index/${name}`);
        return [...indexArns, tableArn];
      })
    );
  });
  const arns = pulumi
    .all(arnCollections)
    .apply((arnCollections) => arnCollections.flat());

  arns.apply((arns) => console.log({ arns }));

  return new aws.iam.RolePolicy(name, {
    role: role.name,
    policy: arns.apply((arns) =>
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: actions,
            Resource: arns,
          },
        ],
      })
    ),
  });
};

type DeployLightsailServiceOptions = {
  domain?: {
    zoneId: string;
    zoneDomain: string;
    subDomain: string;
  };
  serviceName: string;
  imageVersion: string;
  serviceDirectory: string;
  buildContext?: string;
  healthCheck?: {
    path: string;
    successCodes: string;
  };
  port?: number;
  environment?: pulumi.Input<{
    [key: string]: pulumi.Input<string>;
  }>;
};

/**
 * The first time will fail with a certificate validation error
 * whilst lightsail validates the DNS records.
 */
export const deployLightsailService = (
  options: DeployLightsailServiceOptions
) => {
  const {
    domain,
    serviceName,
    imageVersion,
    serviceDirectory,
    buildContext = "../", // defaults to the root of the monorepo
    healthCheck = { path: "/", successCodes: "200-499" },
    port = 80,
    environment = {},
  } = options;

  const repo = new awsx.ecr.Repository(`${serviceName}-ecr`, {});
  const authToken = aws.ecr.getAuthorizationTokenOutput({
    registryId: repo.repository.registryId,
  });
  const imageName = pulumi.interpolate`${repo.repository.repositoryUrl}:${imageVersion}`;

  const ecrImage = new docker.Image(
    `${serviceName}-image`,
    {
      build: {
        args: {
          BUILDKIT_INLINE_CACHE: "1",
        },
        context: buildContext,
        dockerfile: `${serviceDirectory}/Dockerfile`,
        platform: "linux/amd64",
      },
      imageName: imageName,
      registry: {
        username: pulumi.secret(
          authToken.apply((authToken) => authToken.userName)
        ),
        password: pulumi.secret(
          authToken.apply((authToken) => authToken.password)
        ),
        server: repo.repository.repositoryUrl,
      },
    },
    { replaceOnChanges: ["imageName"] }
  );

  const { certificate } = domain
    ? preConfigureLightsailCustomDomain({
        namespace: serviceName,
        ...domain,
      })
    : {};

  const containerService = new lightsail.ContainerService(
    `${serviceName}-containerservice`,
    {
      name: serviceName,
      power: "nano",
      scale: 1,
      isDisabled: false,
      tags: {
        Environment: "Development",
        ManagedBy: "Pulumi",
      },
      privateRegistryAccess: {
        ecrImagePullerRole: {
          isActive: true,
        },
      },
      ...(certificate && {
        publicDomainNames: {
          certificates: [
            {
              certificateName: certificate.name,
              domainNames: [certificate.domainName],
            },
          ],
        },
      }),
    }
  );

  const repositoryPolicy = createEcrPolicy({
    containerService,
    repositoryName: repo.repository.name,
    namespace: serviceName,
  });

  // Create a container service deployment
  const deployment = new lightsail.ContainerServiceDeploymentVersion(
    `${serviceName}-deployment`,
    {
      containers: [
        {
          containerName: serviceName,
          image: ecrImage.imageName,
          ports: {
            [String(port)]: "HTTP",
          },
          environment: {
            PORT: String(port),
            NODE_ENV: "production",
            ...environment, // I can't believe this works
          },
        },
      ],
      publicEndpoint: {
        containerName: serviceName,
        containerPort: port,
        healthCheck: {
          healthyThreshold: 2, // some random values, should be good enough
          unhealthyThreshold: 2,
          timeoutSeconds: 5,
          intervalSeconds: 10,
          path: healthCheck.path,
          successCodes: healthCheck.successCodes,
        },
      },
      serviceName: containerService.name,
    },
    { dependsOn: [containerService, repositoryPolicy] }
  );

  let deploymentUrl;
  if (domain) {
    deploymentUrl = new aws.route53.Record(`${serviceName}-deployment-record`, {
      name: `${domain.subDomain}`,
      type: "CNAME",
      zoneId: domain.zoneId,
      records: [
        containerService.url.apply(
          (url) => url.split("https://")[1].split("/")[0]
        ),
      ],
      ttl: 60,
    });
  }

  return {
    containerService,
    deployment,
    repositoryPolicy,
    ...(domain && { deploymentUrl }),
  };
};

type PreConfigureLightsailCustomDomainOptions = {
  namespace: string;
  zoneId: string;
  zoneDomain: string; // e.g. househodl.app
  subDomain: string;
};

export const preConfigureLightsailCustomDomain = (
  options: PreConfigureLightsailCustomDomainOptions
) => {
  const { namespace, zoneId, zoneDomain, subDomain } = options;
  const certificate = new lightsail.Certificate(
    `${namespace}-lightsail-certificate`,
    {
      domainName: pulumi.interpolate`${subDomain}.${zoneDomain}`,
    }
  );

  // This is not best practice, as it can't be evaluated during a plan.
  const records = certificate.domainValidationOptions.apply((records) => {
    let output = [];
    for (const record of records) {
      const rawName = record.resourceRecordName.split(zoneDomain)[0];
      const name = rawName.slice(0, rawName.length - 1);
      const dnsRecord = new aws.route53.Record(
        `${namespace}-record-${record.resourceRecordName}`,
        {
          name: name,
          type: record.resourceRecordType,
          zoneId: zoneId,
          records: [record.resourceRecordValue],
          ttl: 60,
        }
      );
      output.push(dnsRecord);
    }
    return output;
  });

  return {
    certificate,
    records,
  };
};

type CreateEcrPolicyOptions = {
  namespace: string;
  containerService: lightsail.ContainerService;
  repositoryName: pulumi.Output<string>;
};

export const createEcrPolicy = (options: CreateEcrPolicyOptions) => {
  const { namespace, containerService, repositoryName } = options;

  const policy = containerService.privateRegistryAccess.apply(
    (privateRegistryAccess) =>
      aws.iam.getPolicyDocumentOutput({
        statements: [
          {
            effect: "Allow",
            principals: [
              {
                type: "AWS",
                identifiers: [
                  privateRegistryAccess.ecrImagePullerRole?.principalArn,
                ],
              },
            ],
            actions: ["ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"],
          },
        ],
      })
  );
  const repositoryPolicy = new aws.ecr.RepositoryPolicy(
    `${namespace}-repository-policy`,
    {
      repository: repositoryName,
      policy: policy.apply((policy) => policy.json),
    }
  );

  return repositoryPolicy;
};

type CreateAssumableRoleOptions = {
  namespace: string;
};

export const createAssumableRole = (options: CreateAssumableRoleOptions) => {
  const { namespace } = options;

  // IAM User that will assume the role
  const bootstrapUser = new aws.iam.User(`${namespace}-bootstrap-user`);

  // IAM Role the app will assume
  const role = new aws.iam.Role(`${namespace}-assumable-role`, {
    assumeRolePolicy: pulumi.all([bootstrapUser.arn]).apply(([userArn]) =>
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: userArn },
            Action: "sts:AssumeRole",
          },
        ],
      })
    ),
  });

  // Allow the bootstrap user to assume the role
  new aws.iam.UserPolicy(`${namespace}-bootstrap-user-assume-role-policy`, {
    user: bootstrapUser.name,
    policy: pulumi.interpolate`{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": "${role.arn}"
    }]
  }`,
  });

  const accessKey = new aws.iam.AccessKey(`${namespace}-bootstrap-user-key`, {
    user: bootstrapUser.name,
  });

  return {
    role,
    accessKeyId: accessKey.id,
    secretAccessKey: accessKey.secret,
    roleToAssume: role.arn,
  };
};

type ExtractPulumiInput<T> = T extends pulumi.Input<infer U> ? U : never;

export const resolveMap = <T extends Record<string, pulumi.Input<any>>>(
  obj: T
): pulumi.Output<{ [K in keyof T]: ExtractPulumiInput<T[K]> }> => {
  return pulumi.all(Object.values(obj)).apply((values) => {
    const result: any = {};
    Object.keys(obj).forEach((key, index) => {
      result[key] = values[index];
    });
    return result;
  }) as pulumi.Output<{ [K in keyof T]: ExtractPulumiInput<T[K]> }>;
};
