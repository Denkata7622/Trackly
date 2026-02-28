import { Router } from "express";
import {
  clearHistoryController,
  createHistoryEntryController,
  deleteHistoryItemController,
  getHistoryController,
} from "./history.controller";
import { attachUserIfPresent, requireAuth } from "../../middlewares/auth.middleware";

const historyRouter = Router();

historyRouter.get("/", requireAuth, getHistoryController);
historyRouter.post("/", attachUserIfPresent, createHistoryEntryController);
historyRouter.delete("/:id", requireAuth, deleteHistoryItemController);
historyRouter.delete("/", requireAuth, clearHistoryController);

export default historyRouter;
