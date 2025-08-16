import { err, ok, Result } from "neverthrow";
import * as userRepository from "../repositories/user.repository";
import { ServiceError, User, PublicUser } from "../types";
import * as bcrypt from "bcryptjs";
import { v4 } from "uuid";
import * as jwt from "jsonwebtoken";

export enum UserServiceErrorType {
  NotFound = "NotFound",
  PasswordHashingError = "PasswordHashingError",
  Duplicate = "Duplicate",
}

enum UserServiceErrorMessage {
  NotFound = "User not found",
  PasswordHashingError = "Failed to hash password",
  Duplicate = "User already exists",
}

export const getUserById = async (
  userId: string
): Promise<Result<PublicUser, ServiceError<UserServiceErrorType.NotFound>>> => {
  // business logic like checking permissions or something

  const userResult = await userRepository.getUserById(userId);

  if (userResult.isErr()) {
    const { error } = userResult;
    switch (error.type) {
      case userRepository.UserRepositoryErrorType.NotFound:
        return err({
          type: UserServiceErrorType.NotFound,
          message: UserServiceErrorMessage.NotFound,
        });
    }
  }

  return ok({
    userId: userResult.value.userId,
    email: userResult.value.email,
  });
};

export const getUserByEmail = async (
  email: string
): Promise<Result<PublicUser, ServiceError<UserServiceErrorType.NotFound>>> => {
  // business logic like checking permissions or something

  const userResult = await userRepository.getUserByEmail(email);

  if (userResult.isErr()) {
    const { error } = userResult;
    switch (error.type) {
      case userRepository.UserRepositoryErrorType.NotFound:
        return err({
          type: UserServiceErrorType.NotFound,
          message: UserServiceErrorMessage.NotFound,
        });
    }
  }

  return ok({
    userId: userResult.value.userId,
    email: userResult.value.email,
  });
};

type CreateUserInput = Omit<User, "userId" | "passwordHash"> & {
  password: string;
};

export const createUser = async (
  user: CreateUserInput
): Promise<
  Result<
    User,
    ServiceError<
      UserServiceErrorType.Duplicate | UserServiceErrorType.PasswordHashingError
    >
  >
> => {
  try {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const userWithHashedPassword = {
      userId: v4(),
      email: user.email,
      passwordHash: hashedPassword,
    };
    const result = await userRepository.createUser(userWithHashedPassword);
    if (result.isErr()) {
      const { error } = result;
      switch (error.type) {
        case userRepository.UserRepositoryErrorType.AlreadyExists:
          return err({
            type: UserServiceErrorType.Duplicate,
            message: UserServiceErrorMessage.Duplicate,
          });
      }
    }
    return ok(result.value);
  } catch (error) {
    return err({
      type: UserServiceErrorType.PasswordHashingError,
      message: UserServiceErrorMessage.PasswordHashingError,
    });
  }
};

export const login = async (
  email: string,
  password: string
): Promise<
  Result<
    string,
    ServiceError<
      UserServiceErrorType.NotFound | UserServiceErrorType.PasswordHashingError
    >
  >
> => {
  const userResult = await userRepository.getUserByEmail(email);
  if (userResult.isErr()) {
    return err({
      type: UserServiceErrorType.NotFound,
      message: UserServiceErrorMessage.NotFound,
    });
  }

  const user = userResult.value;
  const passwordHashMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordHashMatch) {
    return err({
      type: UserServiceErrorType.PasswordHashingError,
      message: UserServiceErrorMessage.PasswordHashingError,
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("No JWT secret available");
  }

  const token = jwt.sign({ userId: user.userId, email: user.email }, secret, {
    expiresIn: "30d",
    algorithm: "HS256",
  });

  return ok(token);
};
