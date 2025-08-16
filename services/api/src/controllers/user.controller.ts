import { wrapHandlerWithValidation } from "../utils/wrapHandler";
import { z } from "zod";

import * as userService from "../services/user.service";
import { UserServiceErrorType } from "../services/user.service";
import {
  sendConflict,
  sendCreated,
  sendInternalServerError,
  sendNotFound,
  sendOk,
  sendUnauthorized,
} from "../utils/responses";

export const getUser = wrapHandlerWithValidation({
  params: z.object({ userId: z.string() }),
})(async (req) => {
  const userResult = await userService.getUserById(req.params.userId);

  if (userResult.isErr()) {
    const { error } = userResult;
    switch (error.type) {
      case UserServiceErrorType.NotFound:
        return sendNotFound();
    }
  }

  return sendOk(userResult.value);
});

export const createUser = wrapHandlerWithValidation({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
})(async (req) => {
  console.log("Creating user")
  if (req.body["x-secret-key"] !== "imadmin") {
    return sendUnauthorized();
  }
  const result = await userService.createUser({
    email: req.body.email,
    password: req.body.password,
  });

  if (result.isErr()) {
    const { error } = result;
    switch (error.type) {
      case UserServiceErrorType.Duplicate:
        return sendConflict();
      case UserServiceErrorType.PasswordHashingError:

        return sendInternalServerError();
    }
  }

  return sendCreated({ email: result.value.email });
});

export const login = wrapHandlerWithValidation({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
})(async (req) => {
  const result = await userService.login(req.body.email, req.body.password);

  if (result.isErr()) {
    const { error } = result;
    switch (error.type) {
      case UserServiceErrorType.NotFound:
        return sendNotFound();
      case UserServiceErrorType.PasswordHashingError:
        return sendInternalServerError();
    }
  }

  return sendOk({ token: result.value });
});
