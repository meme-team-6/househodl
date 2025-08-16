import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { RuntimeConfigAwsCredentialIdentityProvider } from "@aws-sdk/types";

export let dynamoDbClient: DynamoDBClient;
export let docClient: DynamoDBDocumentClient;

export const configureDynamoDb = (
  credentialProvider: RuntimeConfigAwsCredentialIdentityProvider
) => {
  dynamoDbClient = new DynamoDBClient({
    credentials: credentialProvider,
    region: "ap-southeast-2",
  });

  docClient = DynamoDBDocumentClient.from(dynamoDbClient);

  USERS_TABLE = process.env.USERS_TABLE;
};

export let USERS_TABLE = process.env.USERS_TABLE;
