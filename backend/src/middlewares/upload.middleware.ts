import multer from "multer";

const memoryStorage = multer.memoryStorage();

const audioFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.mimetype.startsWith("audio/")) {
    cb(null, true);
    return;
  }
  cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "audio"));
};

const imageFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }
  cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
};

export const audioUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: audioFileFilter,
});

export const imageUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: imageFileFilter,
});
