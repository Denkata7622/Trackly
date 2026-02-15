import { Router } from "express";
import { authNotImplementedController } from "./auth.controller";

const authRouter = Router();

authRouter.all("*", authNotImplementedController);

export default authRouter;
