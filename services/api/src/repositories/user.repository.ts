import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, USERS_TABLE } from "../config";
import { err, ok, Result } from "neverthrow";
import { ServiceError, User } from "../types";

export enum UserRepositoryErrorType {
  NotFound = "NotFound",
  AlreadyExists = "AlreadyExists",
}
enum UserRepositoryErrorMessage {
  NotFound = "User not found",
  AlreadyExists = "User already exists",
}

export const getUserById = async (
  userId: string
): Promise<Result<User, ServiceError<UserRepositoryErrorType.NotFound>>> => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId,
    },
  };

  const command = new GetCommand(params);
  const response = await docClient.send(command);

  if (response.Item) {
    const { userId, email, passwordHash } = response.Item;
    return ok({ userId, email, passwordHash });
  }
  return err({
    type: UserRepositoryErrorType.NotFound,
    message: UserRepositoryErrorMessage.NotFound,
  });
};

export const getUserByEmail = async (
  email: string
): Promise<Result<User, ServiceError<UserRepositoryErrorType.NotFound>>> => {
  const params = {
    TableName: USERS_TABLE,
    IndexName: "email-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };

  const command = new QueryCommand(params);
  const response = await docClient.send(command);

  if (response.Items) {
    const { userId, email, passwordHash } = response.Items[0];
    return ok({ userId, email, passwordHash });
  }
  return err({
    type: UserRepositoryErrorType.NotFound,
    message: UserRepositoryErrorMessage.NotFound,
  });
};

export const createUser = async (
  user: User
): Promise<
  Result<User, ServiceError<UserRepositoryErrorType.AlreadyExists>>
> => {
  const params = {
    TableName: USERS_TABLE,
    Item: user,
  };

  const command = new PutCommand(params);
  try {
    await docClient.send(command);
    return ok(user);
  } catch (error: any) {
    if (error.code === "ConditionalCheckFailedException") {
      return err({
        type: UserRepositoryErrorType.AlreadyExists,
        message: UserRepositoryErrorMessage.AlreadyExists,
      });
    }
    throw error;
  }
};
