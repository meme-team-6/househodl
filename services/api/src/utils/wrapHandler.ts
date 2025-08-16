import { z, ZodSchema } from "zod";
import { Request, Response } from "express";

type SimpleHandler<TBody, TQuery, TParams, TReturnType> = (
  request: Request<TParams, TReturnType, TBody, TQuery, any>
) => Promise<{
  statusCode: number;
  body?: TReturnType;
}>;

export const wrapHandlerWithValidation =
  <
    TBodySchema extends ZodSchema,
    TQuerySchema extends ZodSchema,
    TParamsSchema extends ZodSchema
  >(validators: {
    body?: TBodySchema;
    query?: TQuerySchema;
    params?: TParamsSchema;
  }) =>
  <TReturnType extends Record<string, unknown> | string>(
    handler: SimpleHandler<
      z.infer<TBodySchema>,
      z.infer<TQuerySchema>,
      z.infer<TParamsSchema>,
      TReturnType
    >
  ) =>
  async (req: Request, res: Response) => {
    const { body, query, params } = validators;

    if (body) {
      const parseResult = body.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).send(parseResult.error);
        return;
      }
    }

    if (query) {
      const parseResult = query.safeParse(req.query);
      if (!parseResult.success) {
        res.status(400).send(parseResult.error);
        return;
      }
    }

    if (params) {
      const parseResult = params.safeParse(req.params);
      if (!parseResult.success) {
        res.status(400).send(parseResult.error);
        return;
      }
    }

    const result = await handler(req);

    res.status(result.statusCode).send(result.body);
    return;
  };
