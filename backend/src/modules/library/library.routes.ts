import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { syncLibraryController, getLibraryController } from "./library.controller";

const libraryRouter = Router();

libraryRouter.use(requireAuth);

libraryRouter.post("/sync", syncLibraryController);
libraryRouter.get("/", getLibraryController);

export default libraryRouter;
