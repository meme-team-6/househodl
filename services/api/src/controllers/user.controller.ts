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

import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { ok, Result } from "neverthrow";

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
  console.log("Creating user");
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

export const scanImageForTotal = wrapHandlerWithValidation({
  body: z.object({
    image: z.string(),
  }),
})(async (req) => {
  console.log("Here")
  const classifyResult = await classifyImage({ image: req.body.image });

  if (classifyResult.isErr()) {
    throw new Error("oh no");
  }

  return sendOk({ total: classifyResult.value.total });
});

const openai = createOpenAI({
  compatibility: "strict",
  apiKey: process.env.OPENAI_API_KEY,
});

type ClassifyImageOptions = {
  image: string;
};
export const classifyImage = async (
  options: ClassifyImageOptions
): Promise<Result<{ total: number }, never>> => {
  const { image } = options;
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      total: z.number(),
    }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Tell me what the total is for the receipt in the included image.`,
          },
          {
            type: "image",
            image,
          },
        ],
      },
    ],
  });

  console.log("Received labels, ", object);

  return ok(object);
};
