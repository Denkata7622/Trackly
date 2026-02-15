import { Router } from "express";
import { createHistoryEntryController, getHistoryController } from "./history.controller";

const historyRouter = Router();

historyRouter.get("/", getHistoryController);
historyRouter.post("/", createHistoryEntryController);

export default historyRouter;
