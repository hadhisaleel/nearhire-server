const multer = require("multer");
const path = require("path");

const createStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `uploads/${folder}`);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF or image files allowed"));
  }
};

const uploadId = multer({
  storage: createStorage("ids"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const uploadSupport = multer({
  storage: createStorage("tickets"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = {
  uploadId,
  uploadSupport,
};