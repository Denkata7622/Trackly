import { Router } from "express";
import { audioUpload, imageUpload } from "../../middlewares/upload.middleware";
import { recognizeAudioController, recognizeImageController } from "./recognition.controller";

const recognitionRouter = Router();

recognitionRouter.post("/audio", audioUpload.single("audio"), recognizeAudioController);
recognitionRouter.post("/image", imageUpload.single("image"), recognizeImageController);

export default recognitionRouter;
