const send =
  (statusCode: number) => (body: Record<string, unknown> | string) => ({
    statusCode,
    body,
  });

export const sendOk = send(200);

export const sendCreated = (body: Record<string, unknown>) => send(201)(body);

export const sendNoContent = () => send(204)("");

export const sendBadRequest = (message: string) =>
  send(400)({ error: message });

export const sendUnauthorized = (message?: string) =>
  send(401)({ error: message ?? "Unauthorized" });

export const sendForbidden = (message?: string) =>
  send(403)({ error: message ?? "Forbidden" });

export const sendNotFound = (message?: string) =>
  send(404)({ error: message ?? "Not Found" });

export const sendConflict = (message?: string) =>
  send(409)({ error: message ?? "Conflict" });

export const sendInternalServerError = () => send(500)({ error: "Internal Server Error" });
