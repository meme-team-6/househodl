import express, { Router } from "express";
import { createUser, getUser, login } from "./controllers/user.controller";
import * as jwt from "express-jwt";
import { getCredentialProvider } from "./utils/credential-provider";
import { configureDynamoDb } from "./config";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // need later for receipt upload

const init = async () => {
  const credentialProvider = getCredentialProvider();
  const creds = await credentialProvider();
  console.log("Assumed role:", creds.accessKeyId);

  configureDynamoDb(credentialProvider);

  const app = express();

  const apiRouter = Router();
  apiRouter.get("/health", (req, res) => {
    res.status(200).json({ message: "Healthy!" });
  });
  apiRouter.use(
    cors({
      origin: "*",
      methods: "*",
      allowedHeaders: "*",
    })
  );
  apiRouter.use(express.json({ limit: "50mb" }));

  apiRouter.post("/users", createUser);
  apiRouter.post("/login", login);

  const authenticatedRouter = Router();
  authenticatedRouter.use(
    cors({
      origin: "*",
      methods: "*",
      allowedHeaders: "*",
    })
  );
  authenticatedRouter.use(
    jwt.expressjwt({
      secret: process.env.JWT_SECRET!,
      algorithms: ["HS256"],
    })
  );
  authenticatedRouter.get("/users/:userId", getUser);

  app.use(apiRouter);
  app.use(authenticatedRouter);

  app.use((req, res, next) => {
    return res.header("x-server", "express").status(404).json({
      error: "Not Found",
    });
  });

  const port = process.env.PORT || 80;

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

init();
